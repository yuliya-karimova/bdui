import React from 'react';

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

export default TextBlock;

