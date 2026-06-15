import React, { useEffect } from 'react';
import type { Node as NodeType, Connection as ConnectionType, Viewport } from '../types';
import { Node } from './Node';
import { Connection } from './Connection';

interface CanvasProps {
  nodes: NodeType[];
  connections: ConnectionType[];
  viewport: Viewport;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  
  // Selection
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  linkingSourceId: string | null;
  linkingMousePos: { x: number; y: number } | null;
  
  // Flow settings
  isFlowPlaying: boolean;
  flowSpeedMultiplier: number;
  
  // Actions
  onAddNode: (x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  onUpdateNodeText: (id: string, text: string) => void;
  onUpdateConnectionText: (id: string, text: string) => void;
  
  // Selection Triggers
  onSelectNode: (id: string | null) => void;
  onSelectConnection: (id: string | null) => void;
  
  // Dragging/Interaction triggers
  onMouseDown: (e: React.MouseEvent) => void;
  onStartDraggingNode: (id: string, e: React.MouseEvent) => void;
  onStartLinking: (id: string, e: React.MouseEvent) => void;
  screenToCanvasPos: (screenX: number, screenY: number) => { x: number; y: number };
}

// Bounding box intersection helper
const getIntersectionPoint = (
  fromX: number,
  fromY: number,
  node: NodeType
) => {
  const cx = node.x + node.width / 2;
  const cy = node.y + node.height / 2;

  const dx = fromX - cx;
  const dy = fromY - cy;

  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    return { x: cx, y: cy };
  }

  // Half width and height plus a tiny buffer
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

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  connections,
  viewport,
  canvasRef,
  selectedNodeId,
  selectedConnectionId,
  linkingSourceId,
  linkingMousePos,
  isFlowPlaying,
  flowSpeedMultiplier,
  onAddNode,
  onDeleteNode,
  onUpdateNodeText,
  onUpdateConnectionText,
  onSelectNode,
  onSelectConnection,
  onMouseDown,
  onStartDraggingNode,
  onStartLinking,
  screenToCanvasPos,
}) => {

  // Single optimized mousemove listener for node connection anchors
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const handleAnchorProximity = (e: MouseEvent) => {
      // Don't show anchors when drawing a link
      if (linkingSourceId) {
        const anchors = canvasEl.querySelectorAll<HTMLDivElement>('.node-link-anchor');
        anchors.forEach(anchor => {
          anchor.style.opacity = '0';
          anchor.style.pointerEvents = 'none';
        });
        return;
      }

      const nodeCards = canvasEl.querySelectorAll<HTMLDivElement>('.node-card');
      let closestCard: HTMLDivElement | null = null;
      let minDistance = Infinity;
      let closestClampedPos = { xPct: 50, yPct: 50 };

      nodeCards.forEach((card) => {
        // Skip if node is currently in editing mode
        if (card.querySelector('.node-text-editor')) {
          const anchor = card.querySelector<HTMLDivElement>('.node-link-anchor');
          if (anchor) {
            anchor.style.opacity = '0';
            anchor.style.pointerEvents = 'none';
          }
          return;
        }

        const rect = card.getBoundingClientRect();
        
        // Calculate distance in screen space
        const distX = Math.max(0, rect.left - e.clientX, e.clientX - rect.right);
        const distY = Math.max(0, rect.top - e.clientY, e.clientY - rect.bottom);
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < 90 && distance < minDistance) {
          minDistance = distance;
          closestCard = card;

          // Find closest point on node rectangle in screen coordinates
          let clampedX = Math.max(rect.left, Math.min(e.clientX, rect.right));
          let clampedY = Math.max(rect.top, Math.min(e.clientY, rect.bottom));

          const isInside = e.clientX >= rect.left && e.clientX <= rect.right &&
                           e.clientY >= rect.top && e.clientY <= rect.bottom;

          if (isInside) {
            const distL = e.clientX - rect.left;
            const distR = rect.right - e.clientX;
            const distT = e.clientY - rect.top;
            const distB = rect.bottom - e.clientY;
            const minDist = Math.min(distL, distR, distT, distB);

            if (minDist === distL) clampedX = rect.left;
            else if (minDist === distR) clampedX = rect.right;
            else if (minDist === distT) clampedY = rect.top;
            else clampedY = rect.bottom;
          }

          closestClampedPos = {
            xPct: ((clampedX - rect.left) / (rect.width || 1)) * 100,
            yPct: ((clampedY - rect.top) / (rect.height || 1)) * 100
          };
        }
      });

      // Update visibility and position
      nodeCards.forEach((card) => {
        const anchor = card.querySelector<HTMLDivElement>('.node-link-anchor');
        if (!anchor) return;

        if (card === closestCard) {
          anchor.style.opacity = '1';
          anchor.style.pointerEvents = 'auto';
          anchor.style.left = `${closestClampedPos.xPct}%`;
          anchor.style.top = `${closestClampedPos.yPct}%`;
        } else {
          anchor.style.opacity = '0';
          anchor.style.pointerEvents = 'none';
        }
      });
    };

    window.addEventListener('mousemove', handleAnchorProximity);
    return () => {
      window.removeEventListener('mousemove', handleAnchorProximity);
    };
  }, [linkingSourceId, canvasRef]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only add node if double clicking the background
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-background')) {
      const canvasPos = screenToCanvasPos(e.clientX, e.clientY);
      onAddNode(canvasPos.x, canvasPos.y);
    }
  };

  // Find linking source node to calculate live connection line
  const linkingSourceNode = nodes.find(n => n.id === linkingSourceId);
  let linkingDraftPath = '';

  if (linkingSourceNode && linkingMousePos) {
    // Find closest starting point on source node's boundary relative to current mouse position
    const startPos = getIntersectionPoint(linkingMousePos.x, linkingMousePos.y, linkingSourceNode);
    const startX = startPos.x;
    const startY = startPos.y;
    const endX = linkingMousePos.x;
    const endY = linkingMousePos.y;

    // Draw a gentle curved line for the preview link
    const dx = endX - startX;
    const dy = endY - startY;
    const mx = (startX + endX) / 2;
    const my = (startY + endY) / 2;
    const cpX = mx - dy * 0.1;
    const cpY = my + dx * 0.1;

    linkingDraftPath = `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`;
  }

  return (
    <div
      ref={canvasRef}
      className="canvas-container"
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Infinite Grid Background (pans and zooms along with everything) */}
      <div
        className="canvas-background"
        style={{
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
          backgroundSize: `${40 * viewport.zoom}px ${40 * viewport.zoom}px`,
        }}
      />

      {/* Main Viewport that pans and zooms */}
      <div
        className="canvas-viewport"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
      >
        {/* SVG Connections Overlay */}
        <svg className="svg-connections-overlay">
          {/* Arrow definitions */}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path 
                d="M 1.5 2.5 L 7 5 L 1.5 7.5 Z" 
                fill="#94a3b8" 
              />
            </marker>
            <marker
              id="arrow-selected"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path 
                d="M 1.5 2.5 L 7 5 L 1.5 7.5 Z" 
                fill="#4f46e5" 
              />
            </marker>
          </defs>

          {connections.map((connection) => {
            const source = nodes.find(n => n.id === connection.from);
            const target = nodes.find(n => n.id === connection.to);
            if (!source || !target) return null;

            const hasBidirectional = connections.some(
              other => other.from === connection.to && other.to === connection.from
            );

            return (
              <Connection
                key={connection.id}
                connection={connection}
                sourceNode={source}
                targetNode={target}
                isSelected={selectedConnectionId === connection.id}
                isFlowPlaying={isFlowPlaying}
                flowSpeedMultiplier={flowSpeedMultiplier}
                onSelect={() => onSelectConnection(connection.id)}
                onTextChange={(text) => onUpdateConnectionText(connection.id, text)}
                hasBidirectional={hasBidirectional}
              />
            );
          })}

          {/* Live Link Drawing Preview */}
          {linkingDraftPath && (
            <path
              d={linkingDraftPath}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
              strokeDasharray="5,5"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </svg>

        {/* HTML Nodes Overlay */}
        <div className="nodes-layer">
          {nodes.map((node) => (
            <Node
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onMouseDown={(e) => onStartDraggingNode(node.id, e)}
              onStartLinking={(e) => onStartLinking(node.id, e)}
              onDelete={() => onDeleteNode(node.id)}
              onTextChange={(text) => onUpdateNodeText(node.id, text)}
              onSelect={() => onSelectNode(node.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
