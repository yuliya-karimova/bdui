import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const BFF_URL = process.env.REACT_APP_BFF_URL || 'http://localhost:3002';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PageView />} />
        <Route path="/:slug" element={<PageView />} />
      </Routes>
    </Router>
  );
}

function PageView() {
  const { slug } = useParams();
  const [page, setPage] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        // Для корневой страницы slug будет undefined
        // Если slug есть, добавляем его к URL, иначе используем пустой путь
        const url = slug ? `${BFF_URL}/api/page/${slug}` : `${BFF_URL}/api/page/`;
        const response = await axios.get(url);
        setPage(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Страница не найдена' : 'Ошибка загрузки страницы');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>{page.title}</h1>
        </div>
      </header>
      <main className="main">
        {page.blocks.map(block => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </main>
      <footer className="footer">
        <div className="container">
          <p>Backend Driven UI Demo</p>
        </div>
      </footer>
    </div>
  );
}

function BlockRenderer({ block }) {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} />;
    case 'cards':
      return <CardsBlock block={block} />;
    case 'banner':
      return <BannerBlock block={block} />;
    default:
      return null;
  }
}

function TextBlock({ block }) {
  return (
    <section className="block text-block">
      <div className="container">
        <h2>{block.title}</h2>
        <div className="content" dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, '<br />') }} />
      </div>
    </section>
  );
}

function CardsBlock({ block }) {
  return (
    <section className="block cards-block">
      <div className="container">
        <h2>{block.title}</h2>
        <div className="cards-grid">
          {block.cards.map(card => (
            <div key={card.id} className="card">
              <img src={card.imageUrl} alt={card.title} />
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BannerBlock({ block }) {
  return (
    <section className="block banner-block">
      <div className="banner-content">
        <img src={block.imageUrl} alt={block.title} className="banner-image" />
        <div className="banner-overlay">
          <div className="container">
            <h1>{block.title}</h1>
            {block.subtitle && <p className="subtitle">{block.subtitle}</p>}
            {block.buttonText && (
              <a href={block.buttonLink} className="banner-button">
                {block.buttonText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default App;

