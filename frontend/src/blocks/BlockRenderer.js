import React from 'react';
import TextBlock from './TextBlock';
import CardsBlock from './CardsBlock';
import BannerBlock from './BannerBlock';
import GalleryBlock from './GalleryBlock';

function BlockRenderer({ block }) {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} />;
    case 'cards':
      return <CardsBlock block={block} />;
    case 'banner':
      return <BannerBlock block={block} />;
    case 'gallery':
      return <GalleryBlock block={block} />;
    default:
      return null;
  }
}

export default BlockRenderer;

