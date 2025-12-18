import React from 'react';

function CardsBlock({ block }) {
  return (
    <section className="block cards-block">
      <div className="container">
        {block.title && <h2>{block.title}</h2>}
        <div className="cards-grid">
          {block.cards.map(card => (
            <div key={card.id} className="card">
              {card.imageUrl && (
                <img src={card.imageUrl} alt={card.title || ''} />
              )}
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CardsBlock;

