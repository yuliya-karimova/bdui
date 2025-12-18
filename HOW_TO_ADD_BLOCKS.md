# Как добавить новый тип блока

Чтобы добавить новый тип блока в систему, нужно изменить **4 файла**:

1. **Backend Contracts** (`backend/contracts.js`) - Определение схемы блока (контракт)
2. **Frontend** (`frontend/src/App.js`) - компонент для отображения блока
3. **Admin** (`admin/src/App.js`) - редактор блока в админке (теперь генерируется автоматически из контракта!)
4. **BFF** (`bff/server.js`) - трансформация данных для фронтенда

## Система контрактов

Проект использует систему **контрактов** (contracts) для определения структуры полей каждого типа блока. Это позволяет:
- Автоматически генерировать формы редактирования в админке
- Валидировать данные на бэкенде
- Обеспечить единообразие структуры данных

**Контракт определяет:**
- Название и описание типа блока
- Список полей с их типами, метками, обязательностью
- Схему для массивов (например, карточек или изображений)

## Пример: добавление блока "Gallery" (галерея изображений)

### Шаг 1: Backend - определение контракта

В файле `backend/contracts.js` добавьте контракт для нового типа блока:

```javascript
gallery: {
  type: 'gallery',
  name: 'Галерея',
  description: 'Галерея изображений',
  fields: [
    {
      name: 'title',
      label: 'Заголовок (необязательно)',
      type: 'text',
      required: false,
      placeholder: 'Введите заголовок'
    },
    {
      name: 'images',
      label: 'Изображения',
      type: 'array',
      required: true,
      itemSchema: {
        type: 'object',
        fields: [
          {
            name: 'url',
            label: 'URL изображения',
            type: 'url',
            required: true,
            placeholder: 'https://example.com/image.jpg'
          },
          {
            name: 'alt',
            label: 'Alt текст',
            type: 'text',
            required: false,
            placeholder: 'Описание изображения'
          },
          {
            name: 'caption',
            label: 'Подпись',
            type: 'text',
            required: false,
            placeholder: 'Подпись под изображением'
          }
        ]
      }
    }
  ]
}
```

**После добавления контракта:**
- Форма редактирования в админке сгенерируется автоматически!
- Валидация будет работать автоматически!
- Кнопка добавления блока появится автоматически!

### Шаг 2: Frontend - компонент отображения

В файле `frontend/src/App.js`:

1. **Добавьте case в BlockRenderer:**
```javascript
function BlockRenderer({ block }) {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} />;
    case 'cards':
      return <CardsBlock block={block} />;
    case 'banner':
      return <BannerBlock block={block} />;
    case 'gallery':  // ← НОВЫЙ БЛОК
      return <GalleryBlock block={block} />;
    default:
      return null;
  }
}
```

2. **Добавьте компонент GalleryBlock:**
```javascript
function GalleryBlock({ block }) {
  return (
    <section className="block gallery-block">
      <div className="container">
        {block.title && <h2>{block.title}</h2>}
        <div className="gallery-grid">
          {block.images.map(image => (
            <div key={image.id} className="gallery-item">
              <img src={image.url} alt={image.alt || ''} />
              {image.caption && <p className="gallery-caption">{image.caption}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

3. **Добавьте стили в `frontend/src/App.css`:**
```css
.gallery-block h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #2c3e50;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.gallery-item img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.gallery-caption {
  padding: 0.5rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}
```

### Шаг 3: Admin - редактор блока (опционально)

**Хорошая новость:** Если вы добавили контракт, форма редактирования генерируется автоматически! 

Но если нужна кастомная логика редактирования, можно добавить в файле `admin/src/App.js`:

1. **Добавьте кнопку для создания блока:**
```javascript
<div className="add-blocks">
  <button onClick={() => addBlock('text')} className="btn btn-secondary">+ Текстовый блок</button>
  <button onClick={() => addBlock('cards')} className="btn btn-secondary">+ Блок с карточками</button>
  <button onClick={() => addBlock('banner')} className="btn btn-secondary">+ Баннер</button>
  <button onClick={() => addBlock('gallery')} className="btn btn-secondary">+ Галерея</button>  {/* ← НОВЫЙ */}
</div>
```

2. **Добавьте case в renderEditor функции BlockEditor:**
```javascript
case 'gallery':
  return (
    <>
      <div className="form-group">
        <label>Заголовок (необязательно)</label>
        <input
          type="text"
          value={block.data.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div className="gallery-editor">
        <h4>Изображения</h4>
        {(block.data.images || []).map((image, imageIndex) => (
          <div key={image.id || imageIndex} className="image-editor">
            <div className="form-group">
              <label>URL изображения</label>
              <input
                type="text"
                value={image.url || ''}
                onChange={(e) => {
                  const newImages = [...(block.data.images || [])];
                  newImages[imageIndex] = { ...image, url: e.target.value };
                  onUpdate({ images: newImages });
                }}
              />
            </div>
            <div className="form-group">
              <label>Alt текст</label>
              <input
                type="text"
                value={image.alt || ''}
                onChange={(e) => {
                  const newImages = [...(block.data.images || [])];
                  newImages[imageIndex] = { ...image, alt: e.target.value };
                  onUpdate({ images: newImages });
                }}
              />
            </div>
            <div className="form-group">
              <label>Подпись (необязательно)</label>
              <input
                type="text"
                value={image.caption || ''}
                onChange={(e) => {
                  const newImages = [...(block.data.images || [])];
                  newImages[imageIndex] = { ...image, caption: e.target.value };
                  onUpdate({ images: newImages });
                }}
              />
            </div>
            <button
              onClick={() => {
                const newImages = (block.data.images || []).filter((_, i) => i !== imageIndex);
                onUpdate({ images: newImages });
              }}
              className="btn btn-danger btn-sm"
            >
              Удалить изображение
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const newImage = {
              id: `image-${Date.now()}`,
              url: '',
              alt: '',
              caption: ''
            };
            onUpdate({ images: [...(block.data.images || []), newImage] });
          }}
          className="btn btn-secondary"
        >
          + Добавить изображение
        </button>
      </div>
    </>
  );
```

3. **Добавьте в функцию getBlockTypeName:**
```javascript
function getBlockTypeName(type) {
  const names = {
    text: 'Текстовый блок',
    cards: 'Блок с карточками',
    banner: 'Баннер',
    gallery: 'Галерея'  // ← НОВЫЙ
  };
  return names[type] || type;
}
```

4. **Добавьте в функцию getDefaultBlockData:**
```javascript
function getDefaultBlockData(type) {
  switch (type) {
    case 'text':
      return { title: '', content: '' };
    case 'banner':
      return { title: '', subtitle: '', imageUrl: '', buttonText: '', buttonLink: '' };
    case 'cards':
      return { title: '', cards: [] };
    case 'gallery':  // ← НОВЫЙ
      return { title: '', images: [] };
    default:
      return {};
  }
}
```

### Шаг 4: BFF - трансформация данных

В файле `bff/server.js` добавьте трансформацию в блок `blocks.map`:

```javascript
blocks: page.blocks.map(block => ({
  id: block.id,
  type: block.type,
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
  ...(block.type === 'gallery' && {  // ← НОВЫЙ
    title: block.data.title,
    images: block.data.images.map(image => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      caption: image.caption
    }))
  })
}))
```

## Готово!

После внесения изменений:

1. Пересоберите Docker контейнеры:
   ```bash
   docker-compose down
   docker-compose up --build
   ```
  или
   ```bash
   docker compose down
   docker compose up --build
   ```

2. В админке автоматически появится:
   - Новая кнопка "+ Галерея" (из контракта)
   - Форма редактирования (сгенерирована из контракта)
   - Валидация полей (из контракта)
3. На фронтенде новый блок будет автоматически отображаться

## API контрактов

Backend предоставляет API для работы с контрактами:

- `GET /api/contracts` - получить все контракты
- `GET /api/contracts/:blockType` - получить контракт для конкретного типа
- `GET /api/block-types` - получить список доступных типов блоков

Админка использует эти API для динамической генерации интерфейса.

## Структура данных блока

Каждый блок в базе данных имеет следующую структуру:

```json
{
  "id": "block-123",
  "type": "gallery",
  "data": {
    "title": "Моя галерея",
    "images": [
      {
        "id": "image-1",
        "url": "https://example.com/image1.jpg",
        "alt": "Описание изображения",
        "caption": "Подпись под изображением"
      }
    ]
  }
}
```

## Советы

- **Именование**: используйте понятные имена типов блоков (например, `gallery`, `video`, `testimonial`)
- **Структура данных**: храните все данные блока в поле `data`
- **Валидация**: можно добавить проверку обязательных полей в админке
- **Стили**: не забывайте добавлять CSS для нового блока

