const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/resolve', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !url.includes('tiktok.com')) {
      return res.status(400).json({ error: 'Please paste a valid TikTok video URL.' });
    }

    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url.trim())}&hd=1`;
    const response = await fetch(apiUrl);
    const json = await response.json();

    if (!json || json.code !== 0 || !json.data) {
      return res.status(404).json({
        error: json?.msg || 'Could not resolve video. Make sure the TikTok link is public.'
      });
    }

    const data = json.data;
    const cleanVideoUrl = data.hdplay || data.play;

    if (!cleanVideoUrl) {
      return res.status(404).json({ error: 'No clean video stream was found for this URL.' });
    }

    res.json({
      title: data.title || 'TikTok Video',
      author: data.author?.unique_id ? `@${data.author.unique_id}` : 'Creator',
      cover: data.cover || '',
      videoUrl: cleanVideoUrl,
      musicUrl: data.music || ''
    });
  } catch (err) {
    console.error('RegentClean error:', err);
    res.status(500).json({ error: 'Server error while resolving the TikTok link.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RegentClean running on port ${PORT}`);
});
