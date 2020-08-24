module.exports = {
  name: 'pong',
  description: 'Who knows what it does!',
  usage: 'Try it and find out',
  examples: ['pong'],
  secret_command: true,
  async execute(message, messageServerId, sender) {
    return 'Ping pong buddy';
  },
};
