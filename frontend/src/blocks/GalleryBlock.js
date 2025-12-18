import React from 'react';

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

export default GalleryBlock;

