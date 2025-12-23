/**
 * Контракты (схемы) для типов блоков
 * Определяют структуру данных и поля для каждого типа блока
 */

const blockContracts = {
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
  },

  banner: {
    type: 'banner',
    name: 'Баннер',
    description: 'Баннер с изображением, заголовком и кнопкой',
    fields: [
      {
        name: 'title',
        label: 'Заголовок',
        type: 'text',
        required: true,
        placeholder: 'Введите заголовок'
      },
      {
        name: 'subtitle',
        label: 'Подзаголовок',
        type: 'text',
        required: false,
        placeholder: 'Введите подзаголовок'
      },
      {
        name: 'imageUrl',
        label: 'URL изображения',
        type: 'url',
        required: false,
        placeholder: 'https://example.com/image.jpg'
      },
      {
        name: 'buttonText',
        label: 'Текст кнопки',
        type: 'text',
        required: false,
        placeholder: 'Например: Узнать больше'
      },
      {
        name: 'buttonLink',
        label: 'Ссылка кнопки',
        type: 'text',
        required: false,
        placeholder: 'Например: /about или #section'
      }
    ]
  },

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
              required: false,
              placeholder: 'https://example.com/image.jpg'
            }
          ]
        }
      }
    ]
  },

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
  },

  promoBanner: {
    type: 'promoBanner',
    name: 'Promo Banner',
    description: 'Баннер с данными с бэка, без ручных настроек',
    fields: [
      // Нет настраиваемых полей: данные приходят с бэка автоматически
    ]
  },

  travelBanner: {
    type: 'travelBanner',
    name: 'Travel Banner',
    description: 'Баннер с данными с бэка, без ручных настроек',
    fields: [
      // Нет настраиваемых полей: данные приходят с бэка автоматически
    ]
  },

  newYearBanner: {
    type: 'newYearBanner',
    name: 'New Year Banner',
    description: 'Баннер с данными с бэка, без ручных настроек',
    fields: [
      // Нет настраиваемых полей: данные приходят с бэка автоматически
    ]
  },
};

/**
 * Получить контракт для типа блока
 */
function getBlockContract(blockType) {
  return blockContracts[blockType] || null;
}

/**
 * Получить все контракты
 */
function getAllContracts() {
  return blockContracts;
}

/**
 * Получить список доступных типов блоков
 */
function getBlockTypes() {
  return Object.keys(blockContracts).map(type => ({
    type,
    name: blockContracts[type].name,
    description: blockContracts[type].description
  }));
}

/**
 * Валидация данных блока по контракту
 */
function validateBlockData(blockType, data) {
  const contract = getBlockContract(blockType);
  if (!contract) {
    return { valid: false, errors: [`Неизвестный тип блока: ${blockType}`] };
  }

  const errors = [];

  contract.fields.forEach(field => {
    const value = data[field.name];

    // Проверка обязательных полей
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`Поле "${field.label}" обязательно для заполнения`);
    }

    // Проверка массивов
    if (field.type === 'array') {
      if (field.required && (!Array.isArray(value) || value.length === 0)) {
        errors.push(`Поле "${field.label}" должно содержать хотя бы один элемент`);
      }

      // Валидация элементов массива
      if (Array.isArray(value) && field.itemSchema) {
        value.forEach((item, index) => {
          field.itemSchema.fields.forEach(itemField => {
            const itemValue = item[itemField.name];
            if (itemField.required && (itemValue === undefined || itemValue === null || itemValue === '')) {
              errors.push(`${field.label}[${index}].${itemField.label} обязательно для заполнения`);
            }
          });
        });
      }
    }

    // Валидация URL
    if (field.type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        errors.push(`Поле "${field.label}" должно быть валидным URL`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Создать данные блока по умолчанию на основе контракта
 */
function getDefaultBlockData(blockType) {
  const contract = getBlockContract(blockType);
  if (!contract) {
    return {};
  }

  const defaultData = {};

  contract.fields.forEach(field => {
    if (field.type === 'array') {
      defaultData[field.name] = [];
    } else {
      defaultData[field.name] = '';
    }
  });

  return defaultData;
}

module.exports = {
  getBlockContract,
  getAllContracts,
  getBlockTypes,
  validateBlockData,
  getDefaultBlockData
};

