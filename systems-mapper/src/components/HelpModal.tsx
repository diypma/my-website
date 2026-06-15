import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h3>How to use Systems Mapper</h3>
        
        <div className="help-grid">
          <div className="help-item">
            <div className="help-icon">📍</div>
            <div className="help-text">
              <strong>Add Nodes:</strong> Double-click anywhere on the canvas or click "Add Node" in the toolbar.
            </div>
          </div>
          
          <div className="help-item">
            <div className="help-icon">🖐️</div>
            <div className="help-text">
              <strong>Pan / Move Canvas:</strong> Drag on empty space to pan the canvas. Zoom using your mouse scroll wheel.
            </div>
          </div>
          
          <div className="help-item">
            <div className="help-icon">🔗</div>
            <div className="help-text">
              <strong>Draw Connections:</strong> Hover over a node, click and drag the blue circle handle on its right side, and release it over another node. You can connect a node to itself to create loops.
            </div>
          </div>
          
          <div className="help-item">
            <div className="help-icon">✏️</div>
            <div className="help-text">
              <strong>Edit Text:</strong> Double-click the text of a node or a connection label to edit it. Press Enter or click outside to save.
            </div>
          </div>
          
          <div className="help-item">
            <div className="help-icon">🎨</div>
            <div className="help-text">
              <strong>Customize:</strong> Click on a node or connection line to select it and change its color, style, curvature, or delete it using the side panel.
            </div>
          </div>
          
          <div className="help-item">
            <div className="help-icon">⚡</div>
            <div className="help-text">
              <strong>Flow Animations:</strong> Use the controls in the side panel to toggle flow particles showing information flow, and adjust speed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
