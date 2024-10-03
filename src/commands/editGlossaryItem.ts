import {
  ActionRowBuilder,
  ComponentType,
  GuildBasedChannel,
  Interaction,
  InteractionReplyOptions,
  Message,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { SlashCommandOptions, SlashCommandParamType, CommandHandler } from '@bubcool1/discord-js-helper';
import { buildSlashCommand, buildSlashParameter } from '@bubcool1/discord-js-helper';

type options = {
  acronym: string;
  meaning: string;
};
const editGlossaryItemHandler: CommandHandler = async (interaction: Interaction, options: SlashCommandOptions) => {
  if (!interaction.isCommand()) {
    return;
  }

  const values = options as options;

  const glossaryChannel: GuildBasedChannel | undefined = interaction.guild?.channels.cache.find(
    (channel) => channel.name === 'glossary' && channel.isTextBased(),
  );

  if (!glossaryChannel) {
    const message: InteractionReplyOptions = {
      content: 'I cannot find your glossary channel, please create one and create entries before I can edit anything.',
      ephemeral: true,
    };
    await interaction.reply(message);
    return;
  }

  if (glossaryChannel && glossaryChannel?.isTextBased()) {
    let messages: Array<Message>;
    const channelMessages = await glossaryChannel.messages.fetch();

    messages = Array.from(channelMessages.values()).filter(
      (message) =>
        message.author.id == interaction.client.user.id &&
        message.content.includes(values.acronym) &&
        message.content.includes(`<@${interaction.user.id}>`),
    );

    if (messages.length == 0) {
      const message: InteractionReplyOptions = {
        content: 'Unable to find that arcronym that was posted by you glossary text channel.',
        ephemeral: true,
      };
      await interaction.reply(message);
    }

    if (messages.length > 1) {
      const customId = `${values.acronym}-${interaction.user.id.toString()}-${new Date().toISOString()}`;
      const select = new StringSelectMenuBuilder().setCustomId(customId).addOptions(
        messages.map((message) => {
          const meaningWithSubmitter = message.content.replace(`${values.acronym} - `, '');
          const bracketIndex = meaningWithSubmitter.lastIndexOf('(');
          const meaning = meaningWithSubmitter.substring(0, bracketIndex);

          return new StringSelectMenuOptionBuilder().setLabel(meaning).setValue(message.id);
        }),
      );
      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

      const selectDropDown = await interaction.reply({
        content: 'Multiple messages with that acronym were found, which one do you want to edit?',
        ephemeral: true,
        components: [row],
      });

      const collector = selectDropDown.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60_000,
      });

      collector.on('collect', async (selectInteraction) => {
        const selection = selectInteraction.values[0];
        const selectedMessage = messages.find((x) => x.id === selection);

        if (selectedMessage) {
          await selectedMessage.edit(`${values.acronym} - ${values.meaning} (Submitted by <@${interaction.user.id}>)`);
          await selectInteraction.reply({ content: 'Edited glossary entry successfully', ephemeral: true });
        } else {
          await selectInteraction.reply({
            content: 'Something went wrong, please try again later.',
            ephemeral: true,
          });
        }
      });
    } else {
      await messages[0].edit(`${values.acronym} - ${values.meaning} (Submitted by <@${interaction.user.id}>)`);
      await interaction.reply({ content: 'Edited glossary entry successfully', ephemeral: true });
    }
  } else {
    const message: InteractionReplyOptions = {
      content:
        'Something went wrong! Unable to find glossary text channel.\n Please ensure your admins have a channel called glossary and it is a text channel.',
      ephemeral: true,
    };
    await interaction.reply(message);
  }
};

const functionParameters = [
  buildSlashParameter('acronym', true, SlashCommandParamType.string, 'Acronym to submit to glossary'),
  buildSlashParameter('meaning', true, SlashCommandParamType.string, 'Meaning of the acronym in glossary'),
];

const addGlossaryItem = buildSlashCommand(
  'editglossary',
  'Edit item in glossary',
  editGlossaryItemHandler,
  functionParameters,
);

export default addGlossaryItem;
