import { useCanvasState } from './hooks/useCanvasState';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { HelpModal } from './components/HelpModal';
import type { ThemeKey } from './types';

function App() {
  const {
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
    showHelp,
    
    // Actions
    addNode,
    deleteNode,
    updateNodeText,
    updateNodeColor,
    deleteConnection,
    updateConnectionText,
    updateConnectionStyle,
    updateConnectionCurvature,
    updateConnectionFlowSpeed,
    zoomIn,
    zoomOut,
    zoomReset,
    clearCanvas,
    exportMap,
    exportPng,
    importMap,
    setSelectedNodeId,
    setSelectedConnectionId,
    setIsFlowPlaying,
    setFlowSpeedMultiplier,
    setShowHelp,
    
    // Mouse interaction triggers
    handleCanvasMouseDown,
    startDraggingNode,
    startLinking,
    screenToCanvasPos,
  } = useCanvasState();

  // Find currently selected items
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedConnection = connections.find((c) => c.id === selectedConnectionId) || null;

  // Add node in the center of the viewport
  const handleAddNodeAtCenter = () => {
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    const canvasPos = screenToCanvasPos(screenCenterX, screenCenterY);
    addNode(canvasPos.x, canvasPos.y);
  };

  // Delete selected item (either node or connection)
  const handleDeleteSelected = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    } else if (selectedConnectionId) {
      deleteConnection(selectedConnectionId);
    }
  };

  return (
    <div className="app-container">
      {/* Dynamic Interactive Canvas */}
      <Canvas
        nodes={nodes}
        connections={connections}
        viewport={viewport}
        canvasRef={canvasRef}
        selectedNodeId={selectedNodeId}
        selectedConnectionId={selectedConnectionId}
        linkingSourceId={linkingSourceId}
        linkingMousePos={linkingMousePos}
        isFlowPlaying={isFlowPlaying}
        flowSpeedMultiplier={flowSpeedMultiplier}
        onAddNode={addNode}
        onDeleteNode={deleteNode}
        onUpdateNodeText={updateNodeText}
        onUpdateConnectionText={updateConnectionText}
        onSelectNode={(id) => {
          setSelectedNodeId(id);
          setSelectedConnectionId(null);
        }}
        onSelectConnection={(id) => {
          setSelectedConnectionId(id);
          setSelectedNodeId(null);
        }}
        onMouseDown={handleCanvasMouseDown}
        onStartDraggingNode={startDraggingNode}
        onStartLinking={startLinking}
        screenToCanvasPos={screenToCanvasPos}
      />

      {/* Control Bars & Panels Overlay */}
      <Toolbar
        selectedNode={selectedNode}
        selectedConnection={selectedConnection}
        isFlowPlaying={isFlowPlaying}
        flowSpeedMultiplier={flowSpeedMultiplier}
        zoomLevel={viewport.zoom}
        onAddNode={handleAddNodeAtCenter}
        onClear={clearCanvas}
        onExportJson={exportMap}
        onExportPng={exportPng}
        onImport={importMap}
        onToggleFlow={() => setIsFlowPlaying(!isFlowPlaying)}
        onFlowSpeedChange={setFlowSpeedMultiplier}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomReset={zoomReset}
        onShowHelp={() => setShowHelp(true)}
        onUpdateNodeColor={(color: ThemeKey) => {
          if (selectedNodeId) updateNodeColor(selectedNodeId, color);
        }}
        onUpdateConnectionStyle={(style: 'solid' | 'dashed') => {
          if (selectedConnectionId) updateConnectionStyle(selectedConnectionId, style);
        }}
        onUpdateConnectionCurvature={(curvature: number) => {
          if (selectedConnectionId) updateConnectionCurvature(selectedConnectionId, curvature);
        }}
        onUpdateConnectionFlowSpeed={(speed: number) => {
          if (selectedConnectionId) updateConnectionFlowSpeed(selectedConnectionId, speed);
        }}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* Help Instructions Modal Overlay */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default App;
