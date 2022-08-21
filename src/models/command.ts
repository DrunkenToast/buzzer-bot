import { ApplicationCommandOptionData, CommandInteraction, MessageEmbed, MessageEmbedOptions } from 'discord.js';

export type Response = string | MessageEmbedOptions | MessageEmbed;
export interface Command {
  name: string,
  category: string,
  description: string;
  options?: ApplicationCommandOptionData[];
  response: /*Response |*/ ((interaction: CommandInteraction) => PromiseLike<void>)
}

export interface InfoCommand {
  name: string,
  category: string,
  description: string;
  options?: ApplicationCommandOptionData[];
  response: /*Response |*/ MessageEmbedOptions | string;
}

