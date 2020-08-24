module.exports = {
  name: 'ping',
  description: 'Ping!',
  aliases: [],
  secret_aliases: ['upboat'],
  async execute() {
    return 'Pong.';
  },
};
