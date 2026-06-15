import React, { useRef, useState } from 'react';
import type { Node, Connection, ThemeKey } from '../types';
import { ExportModal } from './ExportModal';

interface ToolbarProps {
  // Selection
  selectedNode: Node | null;
  selectedConnection: Connection | null;
  
  // States
  isFlowPlaying: boolean;
  flowSpeedMultiplier: number;
  zoomLevel: number;
  
  // Actions
  onAddNode: () => void;
  onClear: () => void;
  onExportJson: () => void;
  onExportPng: () => void;
  onImport: (file: File) => void;
  onToggleFlow: () => void;
  onFlowSpeedChange: (speed: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onShowHelp: () => void;
  
  // Selection customization
  onUpdateNodeColor: (color: ThemeKey) => void;
  onUpdateConnectionStyle: (style: 'solid' | 'dashed') => void;
  onUpdateConnectionCurvature: (curvature: number) => void;
  onUpdateConnectionFlowSpeed: (speed: number) => void;
  onDeleteSelected: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedNode,
  selectedConnection,
  isFlowPlaying,
  flowSpeedMultiplier,
  zoomLevel,
  onAddNode,
  onClear,
  onExportJson,
  onExportPng,
  onImport,
  onToggleFlow,
  onFlowSpeedChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onShowHelp,
  onUpdateNodeColor,
  onUpdateConnectionStyle,
  onUpdateConnectionCurvature,
  onUpdateConnectionFlowSpeed,
  onDeleteSelected,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  // Color Swatch options matching NODE_THEMES
  const swatchOptions: { key: ThemeKey; hex: string; name: string }[] = [
    { key: 'pink', hex: '#FFE5EC', name: 'Rose' },
    { key: 'peach', hex: '#FFEBE0', name: 'Peach' },
    { key: 'yellow', hex: '#FCF8D5', name: 'Yellow' },
    { key: 'mint', hex: '#E2F7ED', name: 'Mint' },
    { key: 'blue', hex: '#E3F2FD', name: 'Ice' },
    { key: 'lavender', hex: '#F3E8FF', name: 'Lavender' },
    { key: 'cream', hex: '#FAFAF5', name: 'Sand' },
  ];

  return (
    <>
      {/* Hidden file input for imports */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Top Floating Control Bar */}
      <div className="floating-panel top-bar glass">
        <span style={{ fontSize: '18px', fontWeight: '700', paddingRight: '8px', color: '#4f46e5', fontFamily: 'Outfit' }}>
          SystemsMapper 🔮
        </span>
        <button className="btn-ui btn-ui-primary" onClick={onAddNode}>
          <span>+</span> Add Node
        </button>
        <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />
        <button className="btn-ui" onClick={handleImportClick}>
          📥 Import Map
        </button>
        <button className="btn-ui" onClick={() => setShowExportModal(true)}>
          📤 Export Map
        </button>
        <button className="btn-ui btn-ui-danger" onClick={onClear}>
          🗑️ Clear
        </button>
        <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />
        <button className="btn-ui btn-icon-only" onClick={onShowHelp} title="Help Instructions">
          ❓
        </button>
      </div>

      {/* Bottom Left Zoom Controls */}
      <div className="floating-panel zoom-controls glass">
        <button className="btn-ui btn-icon-only" onClick={onZoomOut} title="Zoom Out">
          ➖
        </button>
        <span style={{ fontSize: '13px', fontWeight: '600', minWidth: '42px', textAlign: 'center', fontFamily: 'Outfit', color: '#4b5563' }}>
          {Math.round(zoomLevel * 100)}%
        </span>
        <button className="btn-ui btn-icon-only" onClick={onZoomIn} title="Zoom In">
          ➕
        </button>
        <button className="btn-ui" onClick={onZoomReset} style={{ fontSize: '12px', padding: '6px 10px' }}>
          Reset
        </button>
      </div>

      {/* Bottom Right / Side Selection customization panel */}
      {(selectedNode || selectedConnection || true) && (
        <div className="floating-panel side-panel glass">
          <h4 style={{ margin: '0 0 12px 0', fontFamily: 'Outfit', fontWeight: '600', fontSize: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            {selectedNode
              ? 'Customize Node'
              : selectedConnection
              ? 'Customize Connection'
              : 'Global Flow Settings'}
          </h4>

          {selectedNode && (
            <div>
              <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>Node Pastel Color:</div>
              <div className="color-swatch-container">
                {swatchOptions.map((swatch) => (
                  <button
                    key={swatch.key}
                    className={`color-swatch ${selectedNode.color === swatch.key ? 'selected' : ''}`}
                    style={{ backgroundColor: swatch.hex }}
                    onClick={() => onUpdateNodeColor(swatch.key)}
                    title={swatch.name}
                  />
                ))}
              </div>
              
              <button
                className="btn-ui btn-ui-danger"
                onClick={onDeleteSelected}
                style={{ width: '100%', marginTop: '16px' }}
              >
                Delete Selected Node
              </button>
            </div>
          )}

          {selectedConnection && (
            <div>
              {/* Style options */}
              <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>Line Pattern:</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  className={`btn-ui ${selectedConnection.style === 'solid' ? 'btn-ui-primary' : ''}`}
                  onClick={() => onUpdateConnectionStyle('solid')}
                  style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                >
                  Solid Line
                </button>
                <button
                  className={`btn-ui ${selectedConnection.style === 'dashed' ? 'btn-ui-primary' : ''}`}
                  onClick={() => onUpdateConnectionStyle('dashed')}
                  style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                >
                  Dashed Line
                </button>
              </div>

              {/* Curvature adjustment */}
              {selectedConnection.from !== selectedConnection.to && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563' }}>
                    <span>Line Curvature:</span>
                    <span>{(selectedConnection.curvature || 0).toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="-1.5"
                    max="1.5"
                    step="0.1"
                    className="slider"
                    value={selectedConnection.curvature || 0}
                    onChange={(e) => onUpdateConnectionCurvature(parseFloat(e.target.value))}
                  />
                </div>
              )}

              {/* Loop height adjustment */}
              {selectedConnection.from === selectedConnection.to && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563' }}>
                    <span>Loop Size:</span>
                    <span>{(selectedConnection.curvature || 0.8).toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="2.0"
                    step="0.1"
                    className="slider"
                    value={selectedConnection.curvature || 0.8}
                    onChange={(e) => onUpdateConnectionCurvature(parseFloat(e.target.value))}
                  />
                </div>
              )}

              {/* Individual connection flow speed */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563' }}>
                  <span>Link Flow Speed:</span>
                  <span>{(selectedConnection.flowSpeed ?? 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="4.0"
                  step="0.1"
                  className="slider"
                  value={selectedConnection.flowSpeed ?? 1.0}
                  onChange={(e) => onUpdateConnectionFlowSpeed(parseFloat(e.target.value))}
                />
              </div>

              <button
                className="btn-ui btn-ui-danger"
                onClick={onDeleteSelected}
                style={{ width: '100%' }}
              >
                Delete Selected Link
              </button>
            </div>
          )}

          {!selectedNode && !selectedConnection && (
            <div>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
                Select any node or connection line to customize its colors, styles, curves, or delete it.
              </p>
            </div>
          )}

          {/* Flow Controls (Always visible at the bottom of side panel) */}
          <div className="flow-control-group">
            <div className="flow-control-row">
              <span style={{ fontWeight: '500' }}>Information Flow</span>
              <button
                className={`btn-ui ${isFlowPlaying ? 'btn-ui-primary' : ''}`}
                onClick={onToggleFlow}
                style={{ fontSize: '12px', padding: '4px 10px', minWidth: '70px' }}
              >
                {isFlowPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
            </div>
            
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                <span>Flow Speed:</span>
                <span>{flowSpeedMultiplier.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.1"
                className="slider"
                value={flowSpeedMultiplier}
                disabled={!isFlowPlaying}
                onChange={(e) => onFlowSpeedChange(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExportJson={onExportJson}
          onExportPng={onExportPng}
        />
      )}
    </>
  );
};
