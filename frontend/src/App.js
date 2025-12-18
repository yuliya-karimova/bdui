import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import axios from 'axios';
import BlockRenderer from './blocks/BlockRenderer';
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


export default App;

