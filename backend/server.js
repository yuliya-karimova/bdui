const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  getAllContracts,
  getBlockTypes,
  getBlockContract,
  validateBlockData,
  getDefaultBlockData
} = require('./contracts');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const PAGES_FILE = path.join(DATA_DIR, 'pages.json');

app.use(cors());
app.use(bodyParser.json());

// Нормализация slug: всегда должен начинаться с / (кроме корневой страницы)
function normalizeSlug(slug) {
  if (!slug || slug === '/') return '/';
  return slug.startsWith('/') ? slug : '/' + slug;
}

// Инициализация данных
async function initData() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(PAGES_FILE);
    } catch {
      // Создаем начальные данные
      const initialData = {
        pages: [
          {
            id: 'home',
            title: 'Главная страница',
            slug: '/',
            blocks: [
              {
                id: uuidv4(),
                type: 'banner',
                data: {
                  title: 'Добро пожаловать!',
                  subtitle: 'Backend Driven UI Demo',
                  imageUrl: 'https://via.placeholder.com/1200x400',
                  buttonText: 'Узнать больше',
                  buttonLink: '#about'
                }
              },
              {
                id: uuidv4(),
                type: 'text',
                data: {
                  title: 'О проекте',
                  content: 'Это демонстрационное приложение показывает возможности Backend Driven UI. Контент страницы управляется через бэкенд и может быть изменен без пересборки фронтенда.'
                }
              },
              {
                id: uuidv4(),
                type: 'cards',
                data: {
                  title: 'Наши возможности',
                  cards: [
                    {
                      id: uuidv4(),
                      title: 'Динамический контент',
                      description: 'Контент управляется через бэкенд',
                      imageUrl: 'https://via.placeholder.com/300x200'
                    },
                    {
                      id: uuidv4(),
                      title: 'Гибкая настройка',
                      description: 'Легко добавлять и изменять блоки',
                      imageUrl: 'https://via.placeholder.com/300x200'
                    },
                    {
                      id: uuidv4(),
                      title: 'Быстрое обновление',
                      description: 'Изменения применяются мгновенно',
                      imageUrl: 'https://via.placeholder.com/300x200'
                    }
                  ]
                }
              }
            ]
          }
        ]
      };
      await fs.writeFile(PAGES_FILE, JSON.stringify(initialData, null, 2));
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Получить все страницы
app.get('/api/pages', async (req, res) => {
  try {
    const data = await fs.readFile(PAGES_FILE, 'utf8');
    const pages = JSON.parse(data);
    res.json(pages.pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить корневую страницу (должен быть перед /api/pages/:slug)
app.get('/api/pages/root', async (req, res) => {
  try {
    const data = await fs.readFile(PAGES_FILE, 'utf8');
    const pages = JSON.parse(data);
    const page = pages.pages.find(p => p.slug === '/');
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить страницу по slug
app.get('/api/pages/:slug', async (req, res) => {
  try {
    const data = await fs.readFile(PAGES_FILE, 'utf8');
    const pages = JSON.parse(data);
    // Декодируем slug (особенно важно для '/' который приходит как '%2F')
    let searchSlug = decodeURIComponent(req.params.slug);
    // Нормализуем slug для поиска
    searchSlug = normalizeSlug(searchSlug);
    const page = pages.pages.find(p => p.slug === searchSlug);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить страницу по ID
app.get('/api/pages/id/:id', async (req, res) => {
  try {
    const data = await fs.readFile(PAGES_FILE, 'utf8');
    const pages = JSON.parse(data);
    const page = pages.pages.find(p => p.id === req.params.id);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать страницу
app.post('/api/pages', async (req, res) => {
  try {
    // Валидация блоков
    if (req.body.blocks && Array.isArray(req.body.blocks)) {
      for (const block of req.body.blocks) {
        const validation = validateBlockData(block.type, block.data || {});
        if (!validation.valid) {
          return res.status(400).json({
            error: 'Block validation failed',
            blockType: block.type,
            errors: validation.errors
          });
        }
      }
    }

    const data = await fs.readFile(PAGES_FILE, 'utf8');
    const pages = JSON.parse(data);
    const newPage = {
      id: req.body.id || uuidv4(),
      title: req.body.title,
      slug: normalizeSlug(req.body.slug),
      blocks: req.body.blocks || []
    };
    pages.pages.push(newPage);
    await fs.writeFile(PAGES_FILE, JSON.stringify(pages, null, 2));
    res.json(newPage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить страницу
app.put('/api/pages/:id', async (req, res) => {
  try {
    // Валидация блоков
    if (req.body.blocks && Array.isArray(req.body.blocks)) {
      for (const block of req.body.blocks) {
        const validation = validateBlockData(block.type, block.data || {});
        if (!validation.valid) {
          return res.status(400).json({
            error: 'Block validation failed',
            blockType: block.type,
            errors: validation.errors
          });
        }
      }
    }

    const data = await fs.readFile(PAGES_FILE, 'utf8');
    const pages = JSON.parse(data);
    const index = pages.pages.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Page not found' });
    }
    pages.pages[index] = {
      ...pages.pages[index],
      ...req.body,
      id: req.params.id,
      // Нормализуем slug если он был изменен
      slug: req.body.slug ? normalizeSlug(req.body.slug) : pages.pages[index].slug
    };
    await fs.writeFile(PAGES_FILE, JSON.stringify(pages, null, 2));
    res.json(pages.pages[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить страницу
app.delete('/api/pages/:id', async (req, res) => {
  try {
    const data = await fs.readFile(PAGES_FILE, 'utf8');
    const pages = JSON.parse(data);
    pages.pages = pages.pages.filter(p => p.id !== req.params.id);
    await fs.writeFile(PAGES_FILE, JSON.stringify(pages, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все контракты блоков
app.get('/api/contracts', (req, res) => {
  res.json(getAllContracts());
});

// Получить контракт для конкретного типа блока
app.get('/api/contracts/:blockType', (req, res) => {
  const contract = getBlockContract(req.params.blockType);
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  res.json(contract);
});

// Получить список доступных типов блоков
app.get('/api/block-types', (req, res) => {
  res.json(getBlockTypes());
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Запуск сервера
initData().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
});

