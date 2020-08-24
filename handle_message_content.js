const { commands } = require('./commands');
const { prefix } = require('./config.json');

function findCommand(commandName) {
  // search for command by name or look up to see if it matches the alias of any commands

  return commands.get(commandName)
    || commands.find((cmd) => (cmd.aliases && cmd.aliases.includes(commandName))
      || (cmd.secret_aliases && cmd.secret_aliases.includes(commandName)));
}

async function handleMessageContent(content, messageServerId, messageAuthor) {
  const trimmedMessage = content.trimLeft();

  // check if the prefix is at the start of the message
  if (!trimmedMessage.startsWith(prefix)) {
    return undefined;
  }

  // a valid command is any non space character following the prefix
  // we also will optionally capture any of the text following the command in case
  const commandExtractRegexp = new RegExp(`${prefix}(?<commandName>\\S+)(?<contentAfterCommand>.*)?`);
  const regexpExtract = commandExtractRegexp.exec(trimmedMessage);
  if (regexpExtract === null) {
    return 'Error! Unable to understand command.';
  }

  const { commandName, contentAfterCommand } = regexpExtract.groups;

  const matchingCommand = findCommand(commandName);

  if (!matchingCommand) {
    return `Error! Unrecognized command: '${commandName}'`;
  }
  const outputMessage = await matchingCommand.execute(
    contentAfterCommand,
    messageServerId,
    messageAuthor,
  );

  if (commandName.endsWith('boat')) {
    return `🚤${outputMessage}🚤`;
  }
  return outputMessage;
}

exports.handleMessageContent = handleMessageContent;
exports.findCommand = findCommand;
