import React from 'react';

function BannerBlock({ block }) {
  return (
    <section className="block banner-block">
      <div className="banner-content">
        {block.imageUrl && (
          <img src={block.imageUrl} alt={block.title || ''} className="banner-image" />
        )}
        <div className={`banner-overlay ${!block.imageUrl ? 'no-image' : ''}`}>
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

export default BannerBlock;

