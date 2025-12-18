import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="sidebar">
          <h2>BDUI Admin</h2>
          <Link to="/" className="nav-link">Страницы</Link>
          <Link to="/pages/new" className="nav-link">Создать страницу</Link>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<PagesList />} />
            <Route path="/pages/new" element={<PageEditor />} />
            <Route path="/pages/:id" element={<PageEditor />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function PagesList() {
  const [pages, setPages] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/pages`);
      setPages(response.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить страницу?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/pages/${id}`);
      fetchPages();
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="pages-list">
      <h1>Страницы</h1>
      <div className="pages-grid">
        {pages.map(page => (
          <div key={page.id} className="page-card">
            <h3>{page.title}</h3>
            <p>Slug: {page.slug}</p>
            <p>Блоков: {page.blocks?.length || 0}</p>
            <div className="page-actions">
              <Link to={`/pages/${page.id}`} className="btn btn-primary">Редактировать</Link>
              <button onClick={() => handleDelete(page.id)} className="btn btn-danger">Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = React.useState({
    title: '',
    slug: '',
    blocks: []
  });
  const [loading, setLoading] = React.useState(!!id);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (id) {
      fetchPage();
    }
  }, [id]);

  const fetchPage = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/pages/id/${id}`);
      setPage(response.data);
    } catch (error) {
      alert('Ошибка загрузки страницы');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        await axios.put(`${BACKEND_URL}/api/pages/${id}`, page);
      } else {
        await axios.post(`${BACKEND_URL}/api/pages`, page);
      }
      navigate('/');
    } catch (error) {
      alert('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      data: getDefaultBlockData(type)
    };
    setPage({ ...page, blocks: [...page.blocks, newBlock] });
  };

  const removeBlock = (blockId) => {
    setPage({ ...page, blocks: page.blocks.filter(b => b.id !== blockId) });
  };

  const updateBlock = (blockId, data) => {
    setPage({
      ...page,
      blocks: page.blocks.map(b => b.id === blockId ? { ...b, data: { ...b.data, ...data } } : b)
    });
  };

  const moveBlock = (index, direction) => {
    const newBlocks = [...page.blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setPage({ ...page, blocks: newBlocks });
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page-editor">
      <div className="editor-header">
        <h1>{id ? 'Редактировать страницу' : 'Создать страницу'}</h1>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      <div className="editor-form">
        <div className="form-group">
          <label>Название страницы</label>
          <input
            type="text"
            value={page.title}
            onChange={(e) => setPage({ ...page, title: e.target.value })}
            placeholder="Главная страница"
          />
        </div>

        <div className="form-group">
          <label>Slug (URL)</label>
          <input
            type="text"
            value={page.slug}
            onChange={(e) => setPage({ ...page, slug: e.target.value })}
            placeholder="/"
          />
        </div>

        <div className="blocks-section">
          <h2>Блоки</h2>
          <div className="add-blocks">
            <button onClick={() => addBlock('text')} className="btn btn-secondary">+ Текстовый блок</button>
            <button onClick={() => addBlock('cards')} className="btn btn-secondary">+ Блок с карточками</button>
            <button onClick={() => addBlock('banner')} className="btn btn-secondary">+ Баннер</button>
          </div>

          <div className="blocks-list">
            {page.blocks.map((block, index) => (
              <BlockEditor
                key={block.id}
                block={block}
                index={index}
                onUpdate={(data) => updateBlock(block.id, data)}
                onRemove={() => removeBlock(block.id)}
                onMove={(direction) => moveBlock(index, direction)}
                canMoveUp={index > 0}
                canMoveDown={index < page.blocks.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockEditor({ block, index, onUpdate, onRemove, onMove, canMoveUp, canMoveDown }) {
  const [expanded, setExpanded] = React.useState(true);

  const renderEditor = () => {
    switch (block.type) {
      case 'text':
        return (
          <>
            <div className="form-group">
              <label>Заголовок</label>
              <input
                type="text"
                value={block.data.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Содержимое</label>
              <textarea
                value={block.data.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                rows={5}
              />
            </div>
          </>
        );
      case 'banner':
        return (
          <>
            <div className="form-group">
              <label>Заголовок</label>
              <input
                type="text"
                value={block.data.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Подзаголовок</label>
              <input
                type="text"
                value={block.data.subtitle || ''}
                onChange={(e) => onUpdate({ subtitle: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>URL изображения</label>
              <input
                type="text"
                value={block.data.imageUrl || ''}
                onChange={(e) => onUpdate({ imageUrl: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Текст кнопки</label>
              <input
                type="text"
                value={block.data.buttonText || ''}
                onChange={(e) => onUpdate({ buttonText: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Ссылка кнопки</label>
              <input
                type="text"
                value={block.data.buttonLink || ''}
                onChange={(e) => onUpdate({ buttonLink: e.target.value })}
              />
            </div>
          </>
        );
      case 'cards':
        return (
          <>
            <div className="form-group">
              <label>Заголовок блока</label>
              <input
                type="text"
                value={block.data.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
              />
            </div>
            <div className="cards-editor">
              <h4>Карточки</h4>
              {(block.data.cards || []).map((card, cardIndex) => (
                <div key={card.id || cardIndex} className="card-editor">
                  <div className="form-group">
                    <label>Заголовок карточки</label>
                    <input
                      type="text"
                      value={card.title || ''}
                      onChange={(e) => {
                        const newCards = [...(block.data.cards || [])];
                        newCards[cardIndex] = { ...card, title: e.target.value };
                        onUpdate({ cards: newCards });
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Описание</label>
                    <input
                      type="text"
                      value={card.description || ''}
                      onChange={(e) => {
                        const newCards = [...(block.data.cards || [])];
                        newCards[cardIndex] = { ...card, description: e.target.value };
                        onUpdate({ cards: newCards });
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>URL изображения</label>
                    <input
                      type="text"
                      value={card.imageUrl || ''}
                      onChange={(e) => {
                        const newCards = [...(block.data.cards || [])];
                        newCards[cardIndex] = { ...card, imageUrl: e.target.value };
                        onUpdate({ cards: newCards });
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const newCards = (block.data.cards || []).filter((_, i) => i !== cardIndex);
                      onUpdate({ cards: newCards });
                    }}
                    className="btn btn-danger btn-sm"
                  >
                    Удалить карточку
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newCard = {
                    id: `card-${Date.now()}`,
                    title: '',
                    description: '',
                    imageUrl: ''
                  };
                  onUpdate({ cards: [...(block.data.cards || []), newCard] });
                }}
                className="btn btn-secondary"
              >
                + Добавить карточку
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="block-editor">
      <div className="block-header">
        <span className="block-type">{getBlockTypeName(block.type)}</span>
        <div className="block-actions">
          {canMoveUp && <button onClick={() => onMove('up')} className="btn-icon">↑</button>}
          {canMoveDown && <button onClick={() => onMove('down')} className="btn-icon">↓</button>}
          <button onClick={() => setExpanded(!expanded)} className="btn-icon">
            {expanded ? '−' : '+'}
          </button>
          <button onClick={onRemove} className="btn-icon btn-danger">×</button>
        </div>
      </div>
      {expanded && <div className="block-content">{renderEditor()}</div>}
    </div>
  );
}

function getBlockTypeName(type) {
  const names = {
    text: 'Текстовый блок',
    cards: 'Блок с карточками',
    banner: 'Баннер'
  };
  return names[type] || type;
}

function getDefaultBlockData(type) {
  switch (type) {
    case 'text':
      return { title: '', content: '' };
    case 'banner':
      return { title: '', subtitle: '', imageUrl: '', buttonText: '', buttonLink: '' };
    case 'cards':
      return { title: '', cards: [] };
    default:
      return {};
  }
}

export default App;

