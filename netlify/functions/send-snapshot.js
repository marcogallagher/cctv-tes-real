exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: 'Env variable belum di-set' })
      };
    }

    const { image } = JSON.parse(event.body);
    if (!image) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Gambar kosong' }) };
    }

    const base64Data = image.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', new Blob([buffer], { type: 'image/jpeg' }), 'snapshot.jpg');

    const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      body: formData
    });

    const tgResult = await tgResponse.json();

    if (!tgResult.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: tgResult.description || 'Telegram API error' })
      };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
