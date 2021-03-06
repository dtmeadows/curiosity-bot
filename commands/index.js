const Discord = require('discord.js');
const ping = require('./ping.js');
const help = require('./help.js');
const pong = require('./pong.js');
const curiosity = require('./curiosity.js');

const commands = new Discord.Collection();

commands.set(ping.name, ping);
commands.set(curiosity.name, curiosity);
commands.set(help.name, help);
commands.set(pong.name, pong);

exports.commands = commands;
