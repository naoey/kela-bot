#!/user/bin/env node

const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');

const OSS_INDIA = '229987181316407296';

let users = {};

if (fs.existsSync('./last_seen.json')) {
  users = require('./last_seen.json');
}

const client = new Discord.Client();

let ossIndia;
let stalkInterval;

function kelafy() {
  for (const [key, value] of Object.entries(users)) {
    if (moment().diff(moment(value), 'days') > 14) {
      let member = ossIndia.members.find(m => m.id === key);

      if (member.nickname === '🍌 kela 🍌' || member.user.bot) continue;

      console.log(`Member ${member.user.username} last registered/spoke on ${moment(value).calendar()}, kelafying`);

      member.setNickname('🍌 kela 🍌');
    }
  }
}

client.once('ready', () => {
  console.info('Bot ready');

  ossIndia = client.guilds.filter(g => g.id === OSS_INDIA).first();

  if (!ossIndia) {
    console.warn('Coudn\'t find oss india');
    client.destroy();
    return;
  }

  for (const member of ossIndia.members.values()) {
    if (!users[member.id]) users[member.id] = moment().toISOString();
  }

  stalkInterval = setInterval(kelafy, 10000);
});

client.on('guildMemberRemove', (m) => {
  console.log('Untracking member ', m.user.username);
  if (users[m.id]) delete users[m.id];
});

client.on('guildMemberAdd', (m) => {
  console.log('Tracking member ', m.user.username);
  users[m.id] = moment();
});

client.on('disconnect', () => {
  console.warn('Bot disconnected');

  if (stalkInterval) clearInterval(stalkInterval);

  stalkInterval = null;
});

client.on('message', (m) => {
  if (m.guild.id === OSS_INDIA) {
    users[m.member.id] = moment(m.createdTimestamp).toISOString();
  }
});

client.login(process.env.KELA_BOT_TOKEN);

process.stdin.resume();

function saveBeforeExit(...args) {
  console.log('Exit args', args);

  console.log('Writing users map to file');

  fs.writeFileSync('./last_seen.json', JSON.stringify(users), { encoding: 'utf-8' });

  if (client) client.destroy();

  process.exit();
}

process.on('exit', saveBeforeExit);
process.on('SIGINT', saveBeforeExit);
process.on('SIGUSR1', saveBeforeExit);
process.on('SIGUSR2', saveBeforeExit);
process.on('uncaughtException', saveBeforeExit);
