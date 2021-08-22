import { ApplicationCommandOption, ApplicationCommandOptionData, Interaction, MessageEmbed, MessageEmbedOptions } from 'discord.js';
import { GuildConfig } from './guild';

export type Response = string | MessageEmbedOptions | MessageEmbed;
export interface Command {
  name: string,
  category: string,
  aliases: string[],
  description: string;
  options?: ApplicationCommandOptionData[];
  response: /*Response |*/ ((interaction: Interaction, guildConfig: GuildConfig | undefined) => PromiseLike<void>)
}
