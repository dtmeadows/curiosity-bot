module.exports = {
  name: 'ping',
  description: 'Ping!',
  aliases: ['upvote'],
  secret_aliases: ['upboat'],
  async execute() {
    return 'Pong.';
  },
};
