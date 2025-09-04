import React from 'react';

// Fallback component for when drag and drop doesn't work at all
export default function MobileFallbackReorder({ 
  items, 
  onReorder, 
  renderItem, 
  className = "" 
}) {
  const moveUp = (index) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    onReorder(newItems);
  };

  const moveDown = (index) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    onReorder(newItems);
  };

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={item.id || index} className="fallback-reorder-item">
          <div className="reorder-controls">
            <button
              onClick={() => moveUp(index)}
              disabled={index === 0}
              className="reorder-btn"
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={() => moveDown(index)}
              disabled={index === items.length - 1}
              className="reorder-btn"
              title="Move down"
            >
              ↓
            </button>
          </div>
          <div className="item-content">
            {renderItem(item, index, { listeners: {}, isDragging: false })}
          </div>
        </div>
      ))}
    </div>
  );
}