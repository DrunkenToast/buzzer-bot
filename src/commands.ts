import { CommandInteraction } from 'discord.js';
import { Command } from './models/command';
import { EmbedBuilder } from './util/embed-builder';
import { Buzzer, Coinflip, DiceRoll, Challenge } from './games';

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
    { // coinflip
        name: 'coinflip',
        category: 'misc',
        description: 'Heads or tails?',
        options: [{ required: false, type: 4, name: 'coinside', description: 'Which side of the coin you wanna bet for?', choices: [{ name: 'Heads', value: 1 }, { name: 'Tails', value: 0 }] }],
        async response(interaction: CommandInteraction): Promise<void> {
            if (!this.options) {
                return;
            }
            interaction.reply({ embeds: [new Coinflip().flip(interaction.options.getInteger(this.options[0].name))] });
        }
    },
    { // roll TODO make up of embed
        name: 'roll',
        category: 'misc',
        description: 'Rolls a die or dice.',
        options: [{ required: false, type: 4, name: 'faces', description: 'Amount of faces for your dice/die (default 6)' },
        { required: false, type: 4, name: 'amount', description: 'Amount of dice/die (default 1)' }],
        async response(interaction: CommandInteraction): Promise<void> {
            if (!this.options)
                return;
            let times = interaction.options.getInteger(this.options[1].name);
            let faces = interaction.options.getInteger(this.options[0].name);
            if (!times)
                times = 1;
            if (!faces)
                faces = 6;

            interaction.reply({ embeds: [new DiceRoll().roll(times, faces)] });
        }
    },
];
