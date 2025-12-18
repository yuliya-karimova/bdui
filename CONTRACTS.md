# Система контрактов блоков

Система контрактов определяет структуру данных для каждого типа блока. Это обеспечивает:

- ✅ Автоматическую генерацию форм в админке
- ✅ Валидацию данных на бэкенде
- ✅ Единообразие структуры данных
- ✅ Документацию типов блоков

## Структура контракта

```javascript
{
  type: 'block-type',           // Уникальный идентификатор типа
  name: 'Название блока',       // Отображаемое название
  description: 'Описание',      // Описание блока
  fields: [                      // Массив полей
    {
      name: 'fieldName',         // Имя поля (ключ в data)
      label: 'Метка поля',       // Отображаемая метка
      type: 'text' | 'textarea' | 'url' | 'array',
      required: true | false,    // Обязательность
      placeholder: 'Подсказка',  // Placeholder для input
      rows: 5,                   // Для textarea
      itemSchema: {               // Для type: 'array'
        type: 'object',
        fields: [...]            // Поля элементов массива
      }
    }
  ]
}
```

## Типы полей

### `text`
Однострочное текстовое поле.

```javascript
{
  name: 'title',
  label: 'Заголовок',
  type: 'text',
  required: true,
  placeholder: 'Введите заголовок'
}
```

### `textarea`
Многострочное текстовое поле.

```javascript
{
  name: 'content',
  label: 'Содержимое',
  type: 'textarea',
  required: true,
  rows: 5,
  placeholder: 'Введите текст'
}
```

### `url`
Поле для URL с валидацией.

```javascript
{
  name: 'imageUrl',
  label: 'URL изображения',
  type: 'url',
  required: true,
  placeholder: 'https://example.com/image.jpg'
}
```

### `array`
Массив объектов. Требует `itemSchema` для определения структуры элементов.

```javascript
{
  name: 'cards',
  label: 'Карточки',
  type: 'array',
  required: true,
  itemSchema: {
    type: 'object',
    fields: [
      {
        name: 'title',
        label: 'Заголовок карточки',
        type: 'text',
        required: true
      },
      {
        name: 'description',
        label: 'Описание',
        type: 'text',
        required: true
      }
    ]
  }
}
```

## Примеры контрактов

### Текстовый блок

```javascript
text: {
  type: 'text',
  name: 'Текстовый блок',
  description: 'Блок с заголовком и текстовым содержимым',
  fields: [
    {
      name: 'title',
      label: 'Заголовок',
      type: 'text',
      required: true,
      placeholder: 'Введите заголовок'
    },
    {
      name: 'content',
      label: 'Содержимое',
      type: 'textarea',
      required: true,
      placeholder: 'Введите текст',
      rows: 5
    }
  ]
}
```

### Блок с карточками

```javascript
cards: {
  type: 'cards',
  name: 'Блок с карточками',
  description: 'Блок с сеткой карточек',
  fields: [
    {
      name: 'title',
      label: 'Заголовок блока',
      type: 'text',
      required: false,
      placeholder: 'Введите заголовок'
    },
    {
      name: 'cards',
      label: 'Карточки',
      type: 'array',
      required: true,
      itemSchema: {
        type: 'object',
        fields: [
          {
            name: 'title',
            label: 'Заголовок карточки',
            type: 'text',
            required: true,
            placeholder: 'Введите заголовок'
          },
          {
            name: 'description',
            label: 'Описание',
            type: 'text',
            required: true,
            placeholder: 'Введите описание'
          },
          {
            name: 'imageUrl',
            label: 'URL изображения',
            type: 'url',
            required: true,
            placeholder: 'https://example.com/image.jpg'
          }
        ]
      }
    }
  ]
}
```

## Валидация

Контракты используются для автоматической валидации данных при создании и обновлении страниц.

**Проверяется:**
- Обязательные поля заполнены
- URL поля содержат валидные URL
- Массивы содержат элементы (если required: true)
- Элементы массивов соответствуют itemSchema

**Пример ошибки валидации:**
```json
{
  "error": "Block validation failed",
  "blockType": "text",
  "errors": [
    "Поле \"Заголовок\" обязательно для заполнения"
  ]
}
```

## Добавление нового контракта

1. Откройте `backend/contracts.js`
2. Добавьте новый контракт в объект `blockContracts`
3. Перезапустите бэкенд

После этого:
- Форма в админке сгенерируется автоматически
- Валидация будет работать автоматически
- Кнопка добавления появится автоматически

## API

### Получить все контракты
```bash
GET /api/contracts
```

### Получить контракт для типа
```bash
GET /api/contracts/:blockType
```

### Получить список типов блоков
```bash
GET /api/block-types
```

Ответ:
```json
[
  {
    "type": "text",
    "name": "Текстовый блок",
    "description": "Блок с заголовком и текстовым содержимым"
  },
  {
    "type": "banner",
    "name": "Баннер",
    "description": "Баннер с изображением, заголовком и кнопкой"
  }
]
```

