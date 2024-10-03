import {
  ChannelType,
  GuildBasedChannel,
  GuildChannelCreateOptions,
  Interaction,
  InteractionReplyOptions,
} from 'discord.js';
import { SlashCommandOptions, SlashCommandParamType, CommandHandler } from '@bubcool1/discord-js-helper';
import { buildSlashCommand, buildSlashParameter } from '@bubcool1/discord-js-helper';

type options = {
  acronym: string;
  meaning: string;
};
const addGlossaryItemHandler: CommandHandler = async (interaction: Interaction, options: SlashCommandOptions) => {
  if (!interaction.isCommand()) {
    return;
  }

  const values = options as options;

  let glossaryChannel: GuildBasedChannel | undefined = interaction.guild?.channels.cache.find(
    (channel) => channel.name === 'glossary' && channel.isTextBased(),
  );

  if (!glossaryChannel) {
    const channelDetails: GuildChannelCreateOptions = {
      name: 'glossary',
      type: ChannelType.GuildText,
    };
    await interaction.guild?.channels.create(channelDetails);
    glossaryChannel = interaction.guild?.channels.cache.find(
      (channel) => channel.name === 'glossary' && channel.isTextBased(),
    );
  }

  if (glossaryChannel?.isTextBased()) {
    await glossaryChannel.send(`${values.acronym} - ${values.meaning} (Submitted by <@${interaction.user.id}>)`);
    await interaction.reply(`Acronym definition added for ${values.acronym} successfully.`);
  } else {
    const message: InteractionReplyOptions = {
      content:
        'Something went wrong! Unable to find and/or create glossary text channel.\n Please ensure your admins have a channel called glossary and it is a text channel.',
      ephemeral: true,
    };
    await interaction.followUp(message);
  }
};

const functionParameters = [
  buildSlashParameter('acronym', true, SlashCommandParamType.string, 'Acronym to submit to glossary'),
  buildSlashParameter('meaning', true, SlashCommandParamType.string, 'Meaning of the acronym in glossary'),
];

const addGlossaryItem = buildSlashCommand(
  'glossary',
  'Add item to glossary',
  addGlossaryItemHandler,
  functionParameters,
);

export default addGlossaryItem;
