import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js';
import { DateTime } from 'luxon';
import { Command, Response } from './models/command';
import { Colors, EmbedBuilder } from './util/embed-builder';
import { Buzzer, Coinflip, DiceRoll } from './games';

export const defaultPrefix = '!';
export const timeZones = ['Europe/Brussels', 'Australia/Melbourne', 'America/Detroit'];

export const dateFormates = ['d/M/y h:m', 'd-M-y h:m'];

const guildOnly: MessageEmbed = EmbedBuilder.error('This is a server only command.');

//TODO check content of respond messages
export const commands: Command[] = [
  { // Buzzer
    name: 'buzzer',
    category: 'misc',
    description: 'Create a buzzer for everyone',
    options: [],
    async response(interaction: CommandInteraction): Promise<void> {
      if (!interaction.guild) {
        interaction.reply({ embeds: [EmbedBuilder.error('This command can not be used outside of servers')] });
        return;
      }
      if (!this.options) {
        return;
      }
      new Buzzer(interaction).init();
    }
  },
];
