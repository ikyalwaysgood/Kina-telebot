const fs = require('fs');
const fetch = require('node-fetch');
const { uploader } = require('../lib/uploader.js');

const plugin = {
  commands: ['/jadianime', '/toanime'],
  tags: ['tools'],
  init: (bot, { api, apikey, mess }) => {
    bot.onText(/^\/(jadianime|toanime)$/, async (msg, match) => {
      const chatId = msg.chat.id;
      const command = match[1];

      if ('reply_to_message' in msg && msg.reply_to_message.photo) {
        const fileId = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1].file_id;
        bot.sendMessage(chatId, mess.wait, { reply_to_message_id: msg.message_id });

        try {
          const fileInfo = await bot.getFile(fileId);
          const fileStream = bot.getFileStream(fileId);
          let buffers = [];

          fileStream.on('data', (chunk) => {
            buffers.push(chunk);
          });

          fileStream.on('end', async () => {
            const photoBuffer = Buffer.concat(buffers);
            const up = await uploader(photoBuffer);
            const apiUrl = api + '/api/maker/jadianime';
            const response = await fetch(apiUrl + '?apikey=' + apikey + '&url=' + encodeURIComponent(up));
            const anim = await response.json();
            var buffer = await (await fetch(anim.result.img_crop_single)).buffer()
            bot.sendPhoto(chatId, buffer, { reply_to_message_id: msg.message_id });
          });
        } catch (error) {
          console.error('Error getting file info:', error);
          bot.sendMessage(chatId, mess.eror, { reply_to_message_id: msg.message_id });
        }
      } else {
        bot.sendMessage(
          chatId,
          'Kirim foto dengan caption /jadianime atau /toanime atau gunakan caption /jadianime /toanime pada foto yang sudah dikirim.',
          { reply_to_message_id: msg.message_id }
        );
      }
    });
  },
};

module.exports = plugin;
