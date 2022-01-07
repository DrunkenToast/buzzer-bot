/* eslint-disable no-await-in-loop */
import { Client, Intents } from 'discord.js';
import { inspect } from 'util';
import { commands } from './commands';
import { ConfigService } from './services/config-service';
import { GuildService } from './services/guild-service';
import { Logger } from './util/logger';
import { Formatter } from './util/formatter';
import { REST } from '@discordjs/rest';//' //@discordjs/rest/dist/lib/REST
import { loggers } from 'winston';
import { Routes } from 'discord-api-types';


export async function buildClient(): Promise<Client> {
  const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES], partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']});

  if (!process.env.DISCORD_TOKEN) throw new Error('discord token undefined');
  const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
  
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
      return;
    }
    console.log(`${interaction.user.username} used ${interaction.commandName}`);
    for (const command of commands) {
      console.log(command.name);
      if (command.name == interaction.commandName) {
        await command.response(interaction);
      }
    }
  });
  
  client.on('ready', async () => {
    console.log(commands);
    console.log(`Logged in as ${client.user?.tag}`);

    rest.put(
      `/applications/${client.user!.id}/guilds/389813484680118274/commands`,
      // `/applications/${client.user!.id}/commands`,
      { body: commands });
      
  });

  await client.login(process.env.DISCORD_TOKEN);
  return client;
}
