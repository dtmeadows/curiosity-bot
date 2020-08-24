const Discord = require('discord.js');

const client = new Discord.Client();

const { handleMessageContent } = require('./handle_message_content.js');

client.once('ready', () => {
  console.log('Ready!');
});

async function handleMessage(message) {
  if (message.author.bot) {
    // not a message that we care about
    return;
  }

  try {
    const response = await handleMessageContent(
      message.content, message.guild.id, message.author.id,
    );

    if (response) {

      message.channel.send(response);
    }
  } catch (error) {
    message.channel.send("Error! There was a problem with that request. We'll look into it!");
    console.log(error);
  }
}

client.on('message', (message) => {
  handleMessage(message);
});

client.login(process.env.discord_token);
