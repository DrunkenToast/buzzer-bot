import { Command } from './command';

export interface GuildConfig {
  _id: string,
  prefix: string,
  canvasInstanceID: string,
  courseChannels: CourseChannels,
  info: Command[],
  commands: Command[],
  notes: Record<string, string[]>
}

export interface CourseChannels {
  categoryID: string,
  //Record<courseID, channelID)
  channels: Record<string, string>
}

