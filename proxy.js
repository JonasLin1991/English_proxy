const express = require('express');
const cors = require("cors");
const axios = require("axios");
const { Converter } = require("opencc-js"); // ⬅️ 注意這裡改用解構方式
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/api/translate', async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      new URLSearchParams({
        text: text,
        source_lang: "EN",
        target_lang: "ZH" // 輸出簡體中文
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`
        }
      }
    );

    const translated = response.data.translations[0].text;

    // ✅ 正確使用 opencc-js：建立轉換器
    const converter = await Converter({ from: 'cn', to: 'tw' });
    const traditional = converter(translated);

    res.json({
      translation: translated,
      traditional: traditional
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "翻譯失敗" });
  }
});

app.listen(port, () => {
  console.log(`✅ Proxy Server is running at http://localhost:${port}`);
});
