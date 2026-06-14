const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const player = new Player(client);

client.once('ready', () => {
  console.log(`✅ البوت جاهز: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith('!play')) return;

  const query = message.content.slice(6).trim();
  if (!query) return message.reply('اكتب اسم الأغنية.');

  const voiceChannel = message.member?.voice?.channel;
  if (!voiceChannel) return message.reply('ادخل روم صوتي أول.');

  try {
    const queue = player.nodes.create(message.guild, {
      metadata: message.channel
    });

    await queue.connect(voiceChannel);

    const result = await player.search(query, {
      requestedBy: message.author
    });

    if (!result.tracks.length) return message.reply('ما لقيت نتائج.');

    queue.addTrack(result.tracks[0]);
    if (!queue.connection) await queue.connect(voiceChannel);

    if (!queue.isPlaying()) await queue.node.play();

    message.channel.send(`▶️ شغال: **${result.tracks[0].title}**`);
  } catch (err) {
    console.error(err);
    message.reply('في مشكلة أثناء التشغيل.');
  }
});

client.login(process.env.TOKEN);
