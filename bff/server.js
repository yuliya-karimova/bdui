const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

app.use(cors());
app.use(express.json());

// Получить страницу по slug (оптимизированная версия для фронтенда)
app.get('/api/page/:slug?', async (req, res) => {
  try {
    // Если slug не указан или пустой, используем '/' для корневой страницы
    let slug = req.params.slug || '/';
    let backendUrl;
    // Для корневой страницы используем специальный endpoint
    if (slug === '' || slug === '/') {
      backendUrl = `${BACKEND_URL}/api/pages/root`;
    } else {
      // Нормализуем slug: добавляем начальный слеш если его нет
      const normalizedSlug = slug.startsWith('/') ? slug : '/' + slug;
      // Для остальных страниц кодируем slug
      const encodedSlug = encodeURIComponent(normalizedSlug);
      backendUrl = `${BACKEND_URL}/api/pages/${encodedSlug}`;
    }
    const response = await axios.get(backendUrl);
    const page = response.data;
    
    // Трансформируем данные для фронтенда
    const transformedPage = {
      id: page.id,
      title: page.title,
      blocks: page.blocks.map(block => ({
        id: block.id,
        type: block.type,
        // Нормализуем структуру данных в зависимости от типа блока
        ...(block.type === 'text' && {
          title: block.data.title,
          content: block.data.content
        }),
        ...(block.type === 'banner' && {
          title: block.data.title,
          subtitle: block.data.subtitle,
          imageUrl: block.data.imageUrl,
          buttonText: block.data.buttonText,
          buttonLink: block.data.buttonLink
        }),
        ...(block.type === 'cards' && {
          title: block.data.title,
          cards: block.data.cards.map(card => ({
            id: card.id,
            title: card.title,
            description: card.description,
            imageUrl: card.imageUrl
          }))
        }),
        ...(block.type === 'gallery' && {
          title: block.data.title,
          images: block.data.images.map(image => ({
            id: image.id,
            url: image.url,
            alt: image.alt,
            caption: image.caption
          }))
        })
      }))
    };
    
    res.json(transformedPage);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Получить все страницы (для навигации)
app.get('/api/pages', async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/pages`);
    const pages = response.data;
    
    // Возвращаем только необходимые данные для навигации
    const navigationPages = pages.map(page => ({
      id: page.id,
      title: page.title,
      slug: page.slug
    }));
    
    res.json(navigationPages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все контракты блоков
app.get('/api/contracts', async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/contracts`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить контракт для конкретного типа блока
app.get('/api/contracts/:blockType', async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/contracts/${req.params.blockType}`);
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Получить список доступных типов блоков
app.get('/api/block-types', async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/block-types`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', backend: BACKEND_URL });
});

app.listen(PORT, () => {
  console.log(`BFF server running on port ${PORT}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
});

