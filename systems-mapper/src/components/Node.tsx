import React, { useState, useRef, useEffect } from 'react';
import { NODE_THEMES } from '../types';
import type { Node as NodeType, ThemeKey } from '../types';

interface NodeProps {
  node: NodeType;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onStartLinking: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onTextChange: (text: string) => void;
  onSelect: () => void;
}

export const Node: React.FC<NodeProps> = ({
  node,
  isSelected,
  onMouseDown,
  onStartLinking,
  onDelete,
  onTextChange,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const theme = NODE_THEMES[node.color as ThemeKey] || NODE_THEMES.cream;

  // Sync state if text changes from outside
  useEffect(() => {
    setEditText(node.text);
  }, [node.text]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);


  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editText.trim() !== node.text) {
      onTextChange(editText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      if (editText.trim() !== node.text) {
        onTextChange(editText);
      }
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(node.text); // revert
    }
  };

  return (
    <div
      ref={cardRef}
      className={`node-card ${isSelected ? 'selected' : ''}`}
      data-node-id={node.id}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        width: `${node.width}px`,
        height: `${node.height}px`,
        backgroundColor: theme.bg,
        color: theme.text,
        borderColor: theme.border,
        // Custom CSS variables for hover / focus effects
        ['--theme-shadow' as any]: theme.shadow,
      }}
      onMouseDown={(e) => {
        if (!isEditing) {
          onMouseDown(e);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Delete button (visible on hover) */}
      <button
        className="node-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete node"
      >
        &times;
      </button>

      {/* Node text display or textarea editor */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="node-text-editor"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => e.stopPropagation()} // Stop propagation so dragging doesn't trigger
        />
      ) : (
        <div style={{ wordBreak: 'break-word', width: '100%' }}>
          {node.text}
        </div>
      )}

      {/* Link drawing anchor */}
      <div
        className="node-link-anchor"
        onMouseDown={onStartLinking}
        title="Drag to connect"
        style={{
          left: '100%',
          top: '50%',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
