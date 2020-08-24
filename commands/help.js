const { prefix } = require('../config.json');

module.exports = {
  name: 'help',
  description: 'Get some help',
  async execute(message) {
    // we're doing this here or else `help` won't be listed as a command below
    // since commands would be loaded before help was
    // eslint-disable-next-line global-require
    const { commands } = require('./index.js');

    // if we got no message that means someone just sent `!help`
    if (!message) {
      const publishableCommands = commands.filter((cmd) => !cmd.secret_command);
      return `Available commands are: \`${publishableCommands.map((command) => command.name).join(', ')}\`\n`
        + `For help with a specific command, send \`${prefix}help command\``;
    }
    const regex = /(?<commandName>\S+)/;
    const regexpExtract = regex.exec(message);

    if (regexpExtract === null) {
      return 'Error! Unable to understand command.';
    }
    const { commandName } = regexpExtract.groups;

    // No idea why but a global require for this does not work
    // eslint-disable-next-line global-require
    const { findCommand } = require('../handle_message_content.js');

    const matchingCommand = findCommand(commandName);

    if (!matchingCommand) {
      return `Error! Unrecognized command: ${commandName}`;
    }

    const helpMessage = [];
    helpMessage.push(`Name: \`${matchingCommand.name}\``);

    if (matchingCommand.aliases) {
      helpMessage.push(`Aliases: \`${matchingCommand.aliases.join(', ')}\``);
    }
    if (matchingCommand.description) {
      helpMessage.push(`Description: \`${matchingCommand.description}\``);
    }
    if (matchingCommand.usage) {
      helpMessage.push(`Usage: \`${matchingCommand.usage}\``);
    }
    if (matchingCommand.examples) {
      const { examples } = matchingCommand;
      const exampleText = examples.map((ex) => `\`${ex}\``);
      helpMessage.push(
        'Examples:\n\t'
        + `${exampleText.join('\n\t')}`,
      );
    }

    return helpMessage.join('\n');
  },
};
