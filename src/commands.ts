import { Message, MessageEmbed, MessageEmbedOptions, ReactionCollector } from 'discord.js';
import { Tokenizer } from './util/tokenizer';
import { command, Formatter } from './util/formatter';
import { DateTime } from 'luxon';
import { Command, Response } from './models/command';
import { GuildConfig } from './models/guild';
import { GuildService } from './services/guild-service';
import { ReminderService } from './services/reminder-service';
import { CanvasService } from './services/canvas-service';
import { WikiService } from './services/wiki-service';
import { NotesService } from './services/notes-service';

export const commands: Command[] = [
  { // help
    name: 'help',
    description: 'that\'s this command.',
    aliases: ['how', 'wtf', 'man', 'get-help'],
    async response(msg: Message, guildConfig: GuildConfig): Promise<Response | void> {
      const help: MessageEmbedOptions = {
        'title': 'Help is on the way!',
        'description': commands.concat(guildConfig.commands).map(c => `\`${guildConfig.prefix}${c.name}\`: ${c.description}`).join('\n') + '\n`' + guildConfig.prefix + guildConfig.info.name + '`' + ': ' + guildConfig.info.description,
        'color': '43B581',
        'footer': { text: 'Some commands support putting \'help\' behind it.' }
      };

      return help;
    }
  },
  { // setup
    name: 'setup',
    description: 'Quick setup and introduction for the bot',
    aliases: [],
    async response(msg: Message, guildConfig: GuildConfig): Promise<Response | void> {
      const time = 300000; //300000 = 5 minutes
      const eNext = '⏭';
      const ePrev = '⏮';
      const reactions = [ePrev, eNext];

      const filter = (reaction: { emoji: { name: string; }; }, user: { id: string; }) => {
        return reactions.includes(reaction.emoji.name) && user.id === msg.author.id;
      };

      if (!(msg.member?.hasPermission('ADMINISTRATOR')))
        msg.channel.send('You need to be an admin for this command.');

      let page = 0;
      const pages: MessageEmbedOptions[] = [
        {
          'title': 'Setup',
          'description': `Intro :)\nUse ${ePrev} and ${eNext} to switch pages.`,
          'color': '7289DA',
        },
        {
          'title': 'Setup',
          'description': 'The first page!',
          'color': '7289DA',
          
        },
        {
          'title': 'Setup',
          'description': 'Another page',
          'color': '7289DA',
        },
      ];

      pages[page].footer = { text: `Page ${page + 1}` };

      msg.channel.send(new MessageEmbed(pages[0]))
        .then(msg => msg.react(reactions[0]))
        .then(m => m.message.react(reactions[1]))
        .then(m => {
          const collector = new ReactionCollector(m.message, filter , { time });

          collector.on('collect', (reaction, user) => {
            reaction.users.remove(user.id);
            console.log(reaction.emoji.name);

            const oldPage = page;

            switch (reaction.emoji.name) {
            case reactions[0]:
              if(page > 0)
                page--;
              break;
            case reactions[1]:
              if(page < pages.length - 1)
                page++;
              break;
            default:
              break;
            }

            if (oldPage !== page) //Only edit if it's a different page.
            {
              pages[page].footer = { text: `Page ${page + 1}` };
              m.message.edit(new MessageEmbed(pages[page]));
            }

            console.log(page);
          });

          collector.on('end', (reaction, user) => {
            m.message.edit(':x:`Session has ended.`\nEnter the command again for a new session.');
          });
        });
    }
  },
  { // ping
    name: 'ping',
    description: 'play the most mundane ping pong ever with the bot.',
    aliases: [],
    async response(msg: Message, guildConfig: GuildConfig): Promise<Response | void> {
      msg.channel.send('Pong!')
        .then(m => 
          m.edit('Pong! :ping_pong:')
            .then(m => {
              if (m.editedTimestamp !== null)
                m.edit(`Pong! :ping_pong: \`${m.editedTimestamp - msg.createdTimestamp} ms | API: ${msg.client.ws.ping} ms\``);
            }));
    }
  },
  { // roll
    name: 'roll',
    description: 'rolls a die or dice (eg d6, 2d10, d20 ...).',
    aliases: [],
    async response(msg: Message, guildConfig: GuildConfig): Promise<Response | void> {
      const tokenizer = new Tokenizer(msg.content, guildConfig);

      const match = (/^(\d+)?d(\d+)$/gm).exec(tokenizer.tokens[1]?.content);
      if (match) {
        const times = Number(match[1]) > 0 ? Number(match[1]) : 1;
        const dice = [];
        for (let i = 0; i < times; i++) {
          dice.push(Math.floor(Math.random() * Number(match[2]) + 1));
        }

        if (times === 1) {
          return `Rolled a ${dice[0]}`;
        } else {
          return `Dice: ${dice.join(', ')}\nTotal: ${dice.reduce((p, c) => p + c, 0)}`;
        }
      } else {
        return 'no valid die found, e.g. \'3d6\'';
      }
    }
  },
  { // coinflip
    name: 'coinflip',
    description: 'heads or tails?',
    aliases: ['coin', 'flip', 'cf'],
    async response(msg: Message, guildConfig: GuildConfig): Promise<Response | void> {
      const tokenizer = new Tokenizer(msg.content, guildConfig);
      const flip = Math.round(Math.random());
      const embed = new MessageEmbed()
        .setTitle(flip ? 'Heads! :coin:' : 'Tails! :coin:');

      if (tokenizer.tokens.length === 1) {
        return embed;
      }
      else if (tokenizer.tokens[1]?.content == 'heads' || tokenizer.tokens[1]?.content == 'h') {
        return flip == 1 ? (embed.setDescription('You\'ve won! :tada:')) : (embed.setDescription('You\'ve lost...'));
      }
      else if (tokenizer.tokens[1]?.content == 'tails' || tokenizer.tokens[1]?.content == 't') {
        return flip == 0 ? (embed.setDescription('You\'ve won! :tada:')) : (embed.setDescription('You\'ve lost...'));
      }
      else {
        return 'Try with heads (h) or tails (t) instead!';
      }
    }
  },
  { // prefix
    name: 'prefix',
    description: 'Set prefix for guild',
    aliases: ['pf'],
    async response(msg: Message, guildConfig: GuildConfig): Promise<Response | void> {
      const tokenizer = new Tokenizer(msg.content, guildConfig);

      if (!msg.member?.hasPermission('ADMINISTRATOR')) {
        return 'No admin permissions!';
      }

      if (tokenizer.tokens[1] != undefined && tokenizer.tokens[1].type === 'text' && msg.guild?.id != undefined) {
        setPrefix(tokenizer.tokens[1].content, msg.guild?.id);
        console.log('yee');
        return 'Prefix update with: ' + tokenizer.tokens[1].content;
      }
      else {
        return 'Use like `prefix newPrefix`';
      }
    }
  },
  { // default
    name: 'default',
    description: 'sets the default channel',
    aliases: [],
    async response(msg: Message, guildConfig: GuildConfig): Promise<Response | void> {
      const tokenizer = new Tokenizer(msg.content, guildConfig);
      if (tokenizer.tokens[1]?.type === 'channel') {
        return tokenizer.tokens[1].content; //TODO stash in db of server
      } else {
        return 'this is not a valid channel';
      }
    }
  },
  { // notes
    name: 'notes',
    description: 'set or get notes for channels',
    aliases: ['note'],
    async response(msg: Message, guildConfig: GuildConfig): Promise<Response | void> {
      const tokenizer = new Tokenizer(msg.content, guildConfig);
      //!notes #channel adds this note
      if (tokenizer.tokens[1]?.type === 'channel' && tokenizer.tokens[2]?.type === 'text' && msg.guild?.id != undefined) {
        await NotesService.setNote(tokenizer.body(2), tokenizer.tokens[1].content.substr(2, 18), guildConfig);
        return `Note '${tokenizer.body(2)}' got succesfully added to the channel ` + tokenizer.tokens[1].content;
      }
      //!notes #channel - get notes for a channel
      else if (tokenizer.tokens[1]?.type === 'channel') {
        return NotesService.getByChannel(tokenizer.tokens[1].content.substr(2, 18), guildConfig);
      }
      //!notes - get notes in channel
      else if (tokenizer.tokens.length === 1) {
        return NotesService.getByChannel(msg.channel.id.toString(), guildConfig);
      }
      //!notes remove <channel> <number>
      else if (tokenizer.tokens[1]?.type === 'text' && tokenizer.tokens[1].content === 'remove'
        && tokenizer.tokens[2]?.type === 'channel' && tokenizer.tokens[3]?.type === 'text' && msg.guild?.id != undefined
      ) {
        //TODO permissions
        const noteNum: number = parseInt(tokenizer.tokens[3].content);
        return NotesService.delNote(noteNum, tokenizer.tokens[2].content.substr(2, 18), guildConfig);
      }
      //When incorrectly used (includes !notes help)
      else {
        return new Formatter()
          .bold('Help for ' + command(guildConfig.prefix + 'notes'), true)
          .command(guildConfig.prefix + 'notes').text(': get notes from your current channel', true)
          .command(guildConfig.prefix + 'notes #channel').text(': get notes from your favourite channel', true)
          .command(guildConfig.prefix + 'notes #channel an amazing note').text(': Enter a note in a channel', true)
          .command(guildConfig.prefix + 'notes remove #channel notenumber').text(': Remove a note in a channel', true)
          .build();
      }
    }
  },
  { // reminder
    name: 'reminder',
    description: 'set reminders default channel = current, command format: date desc channel(optional) \n\'s. supported formats: d/m/y h:m, d.m.y h:m, d-m-y h:m',
    aliases: ['remindme', 'remind', 'setreminder'],
    async response(msg: Message, guildConfig: GuildConfig): Promise<Response | void> {

      const tokenizer = new Tokenizer(msg.content, guildConfig);
      const dateFormates: string[] = ['d/M/y h:m', 'd.M.y h:m', 'd-M-y h:m'];

      for (const format of dateFormates) {
        let time;
        if (tokenizer.tokens[1] && tokenizer.tokens[2] && tokenizer.tokens[1].type == 'date' && tokenizer.tokens[2].type == 'time') {
          time = DateTime.fromFormat(tokenizer.tokens[1].content + ' ' + tokenizer.tokens[2].content, format);
        } else {
          time = undefined;
        }
        if (time && time.isValid) {
          ReminderService.create({
            content: tokenizer.tokens.filter((t) => t.type === 'text').map((t) => t.content).join(' '),
            date: time.toString(),
            target: {
              channel: tokenizer.tokens.find((t) => t.type === 'channel')?.content.substr(2, 18) || msg.channel.id,
              guild: msg.guild!.id
            },
          });

          return 'your reminder has been set as: ' + time.toString();
        }
      }
      return 'this was not a valid date/time format';
    }
  },
  { // wiki
    name: 'wiki',
    description: 'Search on the Thomas More wiki',
    aliases: [],
    async response(msg: Message, guildConfig: GuildConfig): Promise<Response | void> {
      const tokenizer = new Tokenizer(msg.content, guildConfig);

      const search = tokenizer.body();
      if (search.length == 0)
        return 'https://tmwiki.be';

      const wikiContent = await WikiService.wiki(search);
      wikiContent.data.pages.search.results
        .map(p => `[${p.title}](https://tmwiki.be/${p.locale}/${p.path})`).join('\n\n');

      const embed = new MessageEmbed({
        'title': `Wiki results for '${search}'`,
        'url': 'https://tmwiki.be',
        'description': wikiContent.data.pages.search.results
          .map(p => `[${p.title}](https://tmwiki.be/${p.locale}/${p.path}) \`${p.path}\`
          Desc: ${p.description}`).join('\n\n')
      });

      if (embed.length >= 2000)
        return '`Message too long.`';
      return embed;
    }
  },
  // # Canvas Commands
  //TODO: Error handling for when https requests fail and invalid tokens.
  { // courses
    name: 'courses',
    description: 'Lists your courses',
    aliases: [],
    async response(msg: Message, guildConfig: GuildConfig): Promise<Response | void> {
      // TODO: replace with user tokens!
      const token = process.env.CANVAS_TOKEN;

      if (token != undefined && token.length > 1) {
        const courses = await CanvasService.getCourses(token);
        //TODO: error handling (wrong/expired token etc.)
        let count = 1;
        const embed: MessageEmbed = new MessageEmbed({
          'title': 'All your courses!',
          'description': '`Nr` Course name\n' +
            courses.map(c => `\`${count++}.\` [${c.name}](${process.env.CANVAS_URL}/courses/${c.id}) `).join('\n'),
          'color': 'EF4A25', //Canvas color pallete
          'thumbnail': { url: 'https://pbs.twimg.com/profile_images/1132832989841428481/0Ei3pZ4d_400x400.png' },
          'footer': { 'text': 'Use !modules <Nr> for modules in course' }
        });

        return embed;
      }
      else {
        const embed = new MessageEmbed({
          'title': 'Undefined or incorrect token.',
          'description': 'Are you sure you logged in?\nURL TO AUTH',
          'color': 'EF4A25', //Canvas color pallete
        });
        return embed;
      }
    }
  },
  { // modules
    name: 'modules',
    description: 'Lists all modules of a course or all items in a module',
    aliases: ['module'],
    async response(msg: Message, guildConfig: GuildConfig): Promise<Response | void> {
      // TODO: replace with user tokens!
      const token = process.env.CANVAS_TOKEN;
      if (token != undefined && token.length > 1) {
        const tokenizer = new Tokenizer(msg.content, guildConfig);

        if (tokenizer.tokens[1] != undefined && tokenizer.tokens[2] != undefined) {
          const courseID = Number.parseInt(tokenizer.tokens[1].content);
          const moduleID = Number.parseInt(tokenizer.tokens[2].content);

          return getModulesResponse(token, courseID, moduleID); //All items in module
        }
        else if (tokenizer.tokens[1] != undefined) {
          const courseID = Number.parseInt(tokenizer.tokens[1].content);
          return getModulesResponse(token, courseID); //All modules in course
        }
        else
          return 'Incorrect arguments';
      }
      else {
        const embed = new MessageEmbed({
          'title': 'Undefined token.',
          'description': 'Are you sure you logged in?\nURL TO AUTH',
          'color': 'EF4A25', //Canvas color pallete
        });
        return embed;
      }
    }
  }
];

async function setPrefix(prefix: string, guildID: string): Promise<string> {
  const config = await GuildService.getForId(guildID);
  config.prefix = prefix;
  return GuildService.update(config);
}

// Canvas functions

/**Returns all modules of a course (or items of module).
 * @param moduleNr when passed returns all items of said module.
 * */
async function getModulesResponse(token: string, courseNr: number, moduleNr?: number): Promise<Response> {
  const courses = await CanvasService.getCourses(token);

  if (courseNr < 1 || courseNr > courses.length)
    return '`Course number not in range.`';
  const courseID = courses[courseNr - 1].id;
  const courseName = courses[courseNr - 1].name;

  let count = 1;

  if (typeof moduleNr === 'undefined') { //All modules of course
    const modules = await CanvasService.getModules(token, courseID);

    const embed: MessageEmbed = new MessageEmbed({
      'title': `\`${courseNr}.\` Modules for ${courseName}`,
      'description': '`Nr` Module name\n' +
        modules.map(m => `\`${count++}.\` [${m.name}](${process.env.CANVAS_URL + `/courses/${courseID}/modules`})`).join('\n'),
      'color': 'EF4A25', //Canvas color pallete
      'thumbnail': { url: 'https://pbs.twimg.com/profile_images/1132832989841428481/0Ei3pZ4d_400x400.png' },
      'footer': { text: 'Use !modules ' + courseNr.toString() + ' <Nr> for items in a module' }
    });
    return embed;
  }
  else { //Items of moduleID
    const modules = await CanvasService.getModules(token, courseID);

    if (moduleNr < 1 || moduleNr > modules.length)
      return '`Module number not in range.`';
    const moduleByID = modules[moduleNr - 1];

    const items = await CanvasService.getModuleItems(token, moduleByID.items_url);

    const embed: MessageEmbed = new MessageEmbed({
      'title': `\`${moduleNr}.\` Module ` + moduleByID.name,
      'description': items.map(i => `[${i.title}](${i.html_url})`).join('\n'),
      'color': 'EF4A25', //Canvas color pallete
      'thumbnail': { url: 'https://pbs.twimg.com/profile_images/1132832989841428481/0Ei3pZ4d_400x400.png' }
    });

    return embed;
  }

}
