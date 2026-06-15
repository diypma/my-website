import React from 'react';

interface ExportModalProps {
  onClose: () => void;
  onExportJson: () => void;
  onExportPng: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  onClose,
  onExportJson,
  onExportPng,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close export dialog">&times;</button>
        <h3 style={{ marginBottom: '8px' }}>Export Systems Map</h3>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px 0', lineHeight: '1.4' }}>
          Select the format you would like to export your systems map to.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* PNG Option */}
          <button
            className="btn-ui btn-ui-primary"
            onClick={() => {
              onExportPng();
              onClose();
            }}
            style={{
              padding: '16px 20px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              gap: '4px',
              cursor: 'pointer',
              border: 'none',
              background: '#4f46e5',
              color: 'white',
              boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.3)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '15px' }}>
              📷 Transparent PNG Image
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '400' }}>
              Export your diagram cropped exactly to your nodes, with a transparent background.
            </div>
          </button>

          {/* JSON Option */}
          <button
            className="btn-ui"
            onClick={() => {
              onExportJson();
              onClose();
            }}
            style={{
              padding: '16px 20px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              gap: '4px',
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
              background: 'rgba(255, 255, 255, 0.6)',
              color: '#374151',
              transition: 'background 0.15s ease, transform 0.15s ease',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '15px' }}>
              📄 JSON Config File
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '400' }}>
              Download a raw data backup of your nodes and links to import back later.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
