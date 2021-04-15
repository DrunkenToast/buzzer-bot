/* eslint-disable no-await-in-loop */
import { Client } from 'discord.js';
import { RoleUpdateData } from '../models/role-update-data';

export class RoleAssignmentService {
  static async updateRoles(data: RoleUpdateData, client: Client): Promise<void> {
    const guild = await client.guilds.fetch(data.guildID);
    const member = await guild.members.fetch({ 'user': data.userID, 'cache': true, 'force': true });

    const roleList = member.roles.cache.map((role) => role.id);

    for (const roleType in data.configRoles) {
      const hasRole = roleList.includes(data.configRoles[roleType]);

      if (data.roleTypes.includes(roleType)) {
        if (!hasRole) {
          member.roles.add(data.configRoles[roleType]);
        }
      } else {
        if (hasRole) {
          member.roles.remove(data.configRoles[roleType]);
        }
      }
    }
  }
}
