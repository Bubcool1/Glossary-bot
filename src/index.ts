import { Client, Events, GatewayIntentBits, Guild, Interaction } from 'discord.js';
import 'dotenv/config';
import { reloadSlashCommands, SlashCommandOptions } from '@bubcool1/discord-js-helper';
import commands from './commands/commands';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
});

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (interaction) => {
  if (interaction.content === `<@${client.user?.id}> register` && !interaction.author.bot) {
    if (interaction.guild) {
      try {
        await reloadSlashCommands(interaction.guild, commands);
        await interaction.reply('Commands Registered!');
      } catch (err) {
        await interaction.reply('Something went wrong, please try again later!');
      }
    }
  }
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;
  const slashCommand = commands.find((x) => x.name == command);

  if (!command || !slashCommand) {
    await interaction.reply({
      content: `No command matching ${interaction.commandName} was found. Try sending a message saying "<@${client.user?.id}> register"`,
      ephemeral: true,
    });
    return;
  }

  const options: SlashCommandOptions = {};
  slashCommand.params.forEach(async (param) => {
    const value = interaction.options.get(param.name, param.required)?.value || null;

    if (param.required && !value) {
      await interaction.followUp({ content: `Invalid parameter value for ${param.name}`, ephemeral: true });
      return;
    }

    options[param.name] = value;
  });

  await slashCommand.function(interaction, options);
});

client.on('guildJoin', async (guild: Guild) => {
  reloadSlashCommands(guild, commands);
});

client.login(process.env.TOKEN);
