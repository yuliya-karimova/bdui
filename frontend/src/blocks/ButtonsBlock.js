import React from 'react';

function ButtonsBlock({ block }) {
  return (
    <section className="block buttons-block">
      <div className="container">
        {block.title && <h2>{block.title}</h2>}
        {block.description && (
          <div className="buttons-description">
            {block.description.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
        <div className="buttons-list">
          {block.buttons && block.buttons.map((button, index) => {
            const buttonClass = `btn btn-${button.style || 'primary'}`;
            return (
              <a
                key={button.id || index}
                href={button.link}
                className={buttonClass}
              >
                {button.text}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ButtonsBlock;

