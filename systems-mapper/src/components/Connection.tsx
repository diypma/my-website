import React, { useState, useRef, useEffect } from 'react';
import type { Node, Connection as ConnectionType } from '../types';

interface ConnectionProps {
  connection: ConnectionType;
  sourceNode: Node;
  targetNode: Node;
  isSelected: boolean;
  isFlowPlaying: boolean;
  flowSpeedMultiplier: number;
  onSelect: () => void;
  onTextChange: (text: string) => void;
  hasBidirectional: boolean;
}

// Bounding box intersection helper
const getIntersectionPoint = (
  fromX: number,
  fromY: number,
  node: Node
) => {
  const cx = node.x + node.width / 2;
  const cy = node.y + node.height / 2;

  const dx = fromX - cx;
  const dy = fromY - cy;

  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    return { x: cx, y: cy };
  }

  // Half width and height plus a tiny buffer so arrow head rests on border
  const hWidth = node.width / 2 + 4;
  const hHeight = node.height / 2 + 4;

  const ratioX = hWidth / Math.abs(dx);
  const ratioY = hHeight / Math.abs(dy);

  const minRatio = Math.min(ratioX, ratioY);

  return {
    x: cx + dx * minRatio,
    y: cy + dy * minRatio,
  };
};

export const Connection: React.FC<ConnectionProps> = ({
  connection,
  sourceNode,
  targetNode,
  isSelected,
  isFlowPlaying,
  flowSpeedMultiplier,
  onSelect,
  onTextChange,
  hasBidirectional,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(connection.text);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setEditText(connection.text);
  }, [connection.text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const isLoop = sourceNode.id === targetNode.id;

  // 1. Calculate path geometry
  let path = '';
  let midX = 0;
  let midY = 0;

  if (isLoop) {
    // Self-loop geometry (draws a loop extending upwards)
    const w = sourceNode.width;
    
    // Start/End points on the top edge of the node
    const startX = sourceNode.x + w * 0.7;
    const startY = sourceNode.y;
    const endX = sourceNode.x + w * 0.3;
    const endY = sourceNode.y;

    // Control points for cubic Bezier
    // Loop height depends on curvature multiplier
    const loopHeight = 70 * (connection.curvature || 1);
    const cp1x = startX + 15;
    const cp1y = startY - loopHeight;
    const cp2x = endX - 15;
    const cp2y = endY - loopHeight;

    path = `M ${startX} ${startY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${endX} ${endY}`;

    // Midpoint of cubic Bezier at t=0.5
    // B(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
    // At t=0.5: B(0.5) = 0.125*P0 + 0.375*P1 + 0.375*P2 + 0.125*P3
    midX = 0.125 * startX + 0.375 * cp1x + 0.375 * cp2x + 0.125 * endX;
    midY = 0.125 * startY + 0.375 * cp1y + 0.375 * cp2y + 0.125 * endY;
  } else {
    // Normal link (quadratic Bezier curve)
    const scx = sourceNode.x + sourceNode.width / 2;
    const scy = sourceNode.y + sourceNode.height / 2;
    const tcx = targetNode.x + targetNode.width / 2;
    const tcy = targetNode.y + targetNode.height / 2;

    const dx = tcx - scx;
    const dy = tcy - scy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Midpoint
    const mx = (scx + tcx) / 2;
    const my = (scy + tcy) / 2;

    // Normal vector
    const nx = -dy / (dist || 1);
    const ny = dx / (dist || 1);

    // If there is a bidirectional link and curvature is default (0 or 0.15), curve them in opposite directions
    const isDefaultCurve = connection.curvature === 0 || connection.curvature === 0.15;
    const effectiveCurvature = isDefaultCurve && hasBidirectional ? 0.35 : connection.curvature;
    const curveOffset = effectiveCurvature * dist * 0.4;
    const cpX = mx + nx * curveOffset;
    const cpY = my + ny * curveOffset;

    // Intersections with node boundaries
    const startPos = getIntersectionPoint(cpX, cpY, sourceNode);
    const endPos = getIntersectionPoint(cpX, cpY, targetNode);

    path = `M ${startPos.x} ${startPos.y} Q ${cpX} ${cpY} ${endPos.x} ${endPos.y}`;

    // Midpoint of quadratic Bezier at t=0.5
    // B(0.5) = 0.25*P0 + 0.5*P1 + 0.25*P2
    midX = 0.25 * startPos.x + 0.5 * cpX + 0.25 * endPos.x;
    midY = 0.25 * startPos.y + 0.5 * cpY + 0.25 * endPos.y;
  }

  const handleBlur = () => {
    setIsEditing(false);
    if (editText.trim() !== connection.text) {
      onTextChange(editText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (editText.trim() !== connection.text) {
        onTextChange(editText);
      }
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(connection.text);
    }
  };

  // Flow duration: faster speed = lower duration. We combine connection-specific speed with master speed.
  const effectiveSpeed = (connection.flowSpeed ?? 1) * (flowSpeedMultiplier || 1);

  return (
    <>
      {/* SVG Path Group */}
      <g>
        {/* Transparent thick stroke for easier clicking/hovering */}
        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth="15"
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        />
        
        {/* Visual Line */}
        <path
          id={`path-${connection.id}`}
          className={`connection-path ${isSelected ? 'selected' : ''}`}
          d={path}
          fill="none"
          stroke={isSelected ? '#4f46e5' : '#94a3b8'}
          strokeWidth={isSelected ? '6.5' : '4.5'}
          strokeDasharray={connection.style === 'dashed' ? '4,12' : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd={isLoop ? `url(#arrow-loop-${connection.id})` : "url(#arrow)"}
        />

        {/* Traveling Flow Particle (Single rounded dot, no overlapping lines) */}
        {isFlowPlaying && (
          <circle r="4.5" fill={isSelected ? '#ffffff' : '#4f46e5'}>
            <animateMotion
              dur={`${2.5 / (effectiveSpeed || 1)}s`}
              repeatCount="indefinite"
              path={path}
            />
          </circle>
        )}

        {/* Self-loop specific arrowhead (since it intersects from top edge) */}
        {isLoop && (
          <defs>
            <marker
              id={`arrow-loop-${connection.id}`}
              viewBox="0 0 10 10"
              refX="1.5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path 
                d="M 1.5 2.5 L 7 5 L 1.5 7.5 Z" 
                fill={isSelected ? '#4f46e5' : '#94a3b8'} 
              />
            </marker>
          </defs>
        )}
      </g>

      {/* Connection Text Label overlaid at midpoint */}
      <div
        className="connection-label"
        style={{
          left: `${midX}px`,
          top: `${midY}px`,
          fontFamily: "'Inter', sans-serif",
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              font: 'inherit',
              width: '100%',
              padding: 0,
              textAlign: 'center',
            }}
          />
        ) : (
          connection.text || '+'
        )}
      </div>
    </>
  );
};
