import { useState, useCallback, useRef, useEffect } from 'react';
import type { Node, Connection, Viewport, ThemeKey } from '../types';
import { toPng } from 'html-to-image';

const STORAGE_KEY = 'systems-mapper-state';

export const useCanvasState = () => {
  // Core states
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const [linkingMousePos, setLinkingMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isFlowPlaying, setIsFlowPlaying] = useState<boolean>(true);
  const [flowSpeedMultiplier, setFlowSpeedMultiplier] = useState<number>(1);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Dragging states (tracked via refs to prevent excessive re-renders during mousemove)
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeIdRef = useRef<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 }); // Offset within the node

  // Canvas element reference
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Load initial state from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { nodes: savedNodes, connections: savedConnections, viewport: savedViewport } = JSON.parse(saved);
        if (savedNodes) setNodes(savedNodes);
        if (savedConnections) {
          const loadedConnections = savedConnections.map((c: any) => ({
            ...c,
            flowSpeed: c.flowSpeed ?? 1,
            curvature: c.curvature === 0 ? 0.15 : (c.curvature ?? 0.15)
          }));
          setConnections(loadedConnections);
        }
        if (savedViewport) setViewport(savedViewport);
      } else {
        // Create demo nodes
        const demoNodes: Node[] = [
          { id: '1', text: 'Sunny Weather', x: 100, y: 100, width: 160, height: 80, color: 'peach' },
          { id: '2', text: 'Ice Cream Sales', x: 400, y: 100, width: 160, height: 80, color: 'pink' },
          { id: '3', text: 'Happiness', x: 250, y: 300, width: 160, height: 80, color: 'mint' },
        ];
        const demoConnections: Connection[] = [
          { id: 'c1', from: '1', to: '2', text: 'boosts', color: '#803A00', style: 'solid', curvature: 0, flowSpeed: 1 },
          { id: 'c2', from: '2', to: '3', text: 'increases', color: '#800020', style: 'solid', curvature: 0.2, flowSpeed: 1 },
          { id: 'c3', from: '3', to: '1', text: 'promotes', color: '#0D5325', style: 'dashed', curvature: -0.2, flowSpeed: 1 },
        ];
        setNodes(demoNodes);
        setConnections(demoConnections);
      }
    } catch (e) {
      console.error('Failed to load saved state', e);
    }
  }, []);

  // Save state to LocalStorage when nodes or connections change
  useEffect(() => {
    if (nodes.length > 0) {
      const state = { nodes, connections, viewport };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [nodes, connections, viewport]);

  // Screen coordinates to Canvas coordinates converter
  const screenToCanvasPos = useCallback((screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: screenX, y: screenY };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (screenX - rect.left - viewport.x) / viewport.zoom;
    const y = (screenY - rect.top - viewport.y) / viewport.zoom;
    return { x, y };
  }, [viewport]);

  // Add node function
  const addNode = useCallback((x: number, y: number, text = 'New Node', color: ThemeKey = 'cream') => {
    const id = Date.now().toString();
    const newNode: Node = {
      id,
      text,
      x: x - 80, // Center on mouse click
      y: y - 40,
      width: 160,
      height: 80,
      color,
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
    setSelectedConnectionId(null);
    return id;
  }, []);

  // Delete node
  const deleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  }, [selectedNodeId]);

  // Update node text
  const updateNodeText = useCallback((id: string, text: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
  }, []);

  // Update node color
  const updateNodeColor = useCallback((id: string, color: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, color } : n));
  }, []);

  // Add connection
  const addConnection = useCallback((from: string, to: string, text = '', style: 'solid' | 'dashed' = 'solid') => {
    // Check if link already exists (except for self-loops which can have multiple paths if curvature differs, but let's restrict to 1 for simplicity)
    const exists = connections.some(c => c.from === from && c.to === to);
    if (exists && from !== to) return;

    // Calculate dynamic label color
    const color = '#6b7280'; // neutral gray default

    const newConnection: Connection = {
      id: `c_${Date.now()}`,
      from,
      to,
      text,
      color,
      style,
      curvature: from === to ? 0.8 : 0.15, // Default slight curve for modern look
      flowSpeed: 1, // Default speed
    };

    setConnections(prev => [...prev, newConnection]);
    setSelectedConnectionId(newConnection.id);
    setSelectedNodeId(null);
  }, [connections]);

  // Delete connection
  const deleteConnection = useCallback((id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
    if (selectedConnectionId === id) setSelectedConnectionId(null);
  }, [selectedConnectionId]);

  // Update connection text
  const updateConnectionText = useCallback((id: string, text: string) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, text } : c));
  }, []);

  // Update connection style
  const updateConnectionStyle = useCallback((id: string, style: 'solid' | 'dashed') => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, style } : c));
  }, []);

  // Update connection curvature
  const updateConnectionCurvature = useCallback((id: string, curvature: number) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, curvature } : c));
  }, []);

  // Update connection flow speed
  const updateConnectionFlowSpeed = useCallback((id: string, flowSpeed: number) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, flowSpeed } : c));
  }, []);

  // Pan controls
  const zoomIn = useCallback(() => {
    setViewport(prev => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.1) }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport(prev => ({ ...prev, zoom: Math.max(0.2, prev.zoom - 0.1) }));
  }, []);

  const zoomReset = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, []);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (window.confirm('Are you sure you want to clear your systems map?')) {
      setNodes([]);
      setConnections([]);
      setViewport({ x: 0, y: 0, zoom: 1 });
      setSelectedNodeId(null);
      setSelectedConnectionId(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Export to JSON file
  const exportMap = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, connections }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `systems-map-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [nodes, connections]);

  // Export diagram to transparent PNG image
  const exportPng = useCallback(async () => {
    const viewportEl = document.querySelector('.canvas-viewport') as HTMLElement;
    const canvasContainerEl = canvasRef.current;
    if (!viewportEl || !canvasContainerEl) return;

    if (nodes.length === 0) {
      alert('Cannot export an empty map.');
      return;
    }

    // 1. Calculate bounding box of all nodes
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });

    // Add padding around the bounding box
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const exportWidth = maxX - minX;
    const exportHeight = maxY - minY;

    // 2. Temporarily set viewport transform to fit diagram at zoom 1x
    const originalTransform = viewportEl.style.transform;
    viewportEl.style.transform = `translate(${-minX}px, ${-minY}px) scale(1)`;

    // 3. Temporarily resize canvas container to bounding box size (so html-to-image crops it exactly)
    const originalWidth = canvasContainerEl.style.width;
    const originalHeight = canvasContainerEl.style.height;
    const originalOverflow = canvasContainerEl.style.overflow;

    canvasContainerEl.style.width = `${exportWidth}px`;
    canvasContainerEl.style.height = `${exportHeight}px`;
    canvasContainerEl.style.overflow = 'hidden';

    // 4. Hide selections temporarily so they don't show up in the output image
    const originalSelectedNodeId = selectedNodeId;
    const originalSelectedConnectionId = selectedConnectionId;
    
    setSelectedNodeId(null);
    setSelectedConnectionId(null);

    // Wait for state updates and browser layout to paint
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const dataUrl = await toPng(viewportEl, {
        width: exportWidth,
        height: exportHeight,
        style: {
          transform: `translate(${-minX}px, ${-minY}px) scale(1)`,
          backgroundColor: 'transparent',
        },
        backgroundColor: 'transparent',
      });

      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataUrl);
      downloadAnchor.setAttribute('download', `systems-map-${new Date().toISOString().slice(0, 10)}.png`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Failed to export PNG:', err);
      alert('Error exporting PNG image.');
    } finally {
      // 5. Restore original states and styles
      viewportEl.style.transform = originalTransform;
      canvasContainerEl.style.width = originalWidth;
      canvasContainerEl.style.height = originalHeight;
      canvasContainerEl.style.overflow = originalOverflow;
      setSelectedNodeId(originalSelectedNodeId);
      setSelectedConnectionId(originalSelectedConnectionId);
    }
  }, [nodes, selectedNodeId, selectedConnectionId, canvasRef]);

  // Import from JSON file
  const importMap = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const parsed = JSON.parse(result);
          if (parsed.nodes && Array.isArray(parsed.nodes)) {
            setNodes(parsed.nodes);
            setConnections(parsed.connections || []);
            setViewport({ x: 0, y: 0, zoom: 1 });
            setSelectedNodeId(null);
            setSelectedConnectionId(null);
          }
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  // MOUSE EVENT HANDLERS
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // If clicking on background, handle panning
    if (e.target === canvasRef.current || (e.target as SVGElement).id === 'grid-pattern' || (e.target as HTMLElement).classList.contains('canvas-background')) {
      e.preventDefault();
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - viewport.x, y: e.clientY - viewport.y };
      setSelectedNodeId(null);
      setSelectedConnectionId(null);
    }
  }, [viewport]);

  const startDraggingNode = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedNodeId(nodeId);
    setSelectedConnectionId(null);
    draggedNodeIdRef.current = nodeId;
    
    // Find node to get current pos
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const canvasPos = screenToCanvasPos(e.clientX, e.clientY);
      dragStartRef.current = {
        x: canvasPos.x - node.x,
        y: canvasPos.y - node.y,
      };
    }
  }, [nodes, screenToCanvasPos]);

  const startLinking = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLinkingSourceId(nodeId);
    const canvasPos = screenToCanvasPos(e.clientX, e.clientY);
    setLinkingMousePos(canvasPos);
  }, [screenToCanvasPos]);

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    // Handle Node Dragging
    if (draggedNodeIdRef.current) {
      const canvasPos = screenToCanvasPos(e.clientX, e.clientY);
      const newX = canvasPos.x - dragStartRef.current.x;
      const newY = canvasPos.y - dragStartRef.current.y;
      
      // Update node position
      setNodes(prev => prev.map(n => n.id === draggedNodeIdRef.current ? { ...n, x: newX, y: newY } : n));
    }
    
    // Handle Canvas Panning
    else if (isPanningRef.current) {
      setViewport(prev => ({
        ...prev,
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      }));
    }
    
    // Handle Connection Link Drawing
    else if (linkingSourceId) {
      const canvasPos = screenToCanvasPos(e.clientX, e.clientY);
      setLinkingMousePos(canvasPos);
    }
  }, [screenToCanvasPos, linkingSourceId]);

  const handleGlobalMouseUp = useCallback((e: MouseEvent) => {
    // If linking, check if we released over a node
    if (linkingSourceId) {
      // Find element under mouse pointer
      const targetElement = document.elementFromPoint(e.clientX, e.clientY);
      const nodeElement = targetElement?.closest('[data-node-id]');
      
      if (nodeElement) {
        const targetNodeId = nodeElement.getAttribute('data-node-id');
        if (targetNodeId) {
          addConnection(linkingSourceId, targetNodeId);
        }
      }
      
      // Reset linking states
      setLinkingSourceId(null);
      setLinkingMousePos(null);
    }

    // Reset dragging states
    draggedNodeIdRef.current = null;
    isPanningRef.current = false;
  }, [linkingSourceId, addConnection]);

  // Handle Zoom via Mouse Wheel
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!canvasRef.current) return;
    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse position to canvas coordinates before zoom
    const canvasX = (mouseX - viewport.x) / viewport.zoom;
    const canvasY = (mouseY - viewport.y) / viewport.zoom;

    // Zoom multiplier
    const zoomIntensity = 0.05;
    const delta = -e.deltaY;
    const zoomFactor = delta > 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
    const newZoom = Math.min(3, Math.max(0.2, viewport.zoom * zoomFactor));

    // Calculate new viewport translation so mouse coordinates remain in the same canvas location
    const newX = mouseX - canvasX * newZoom;
    const newY = mouseY - canvasY * newZoom;

    setViewport({ x: newX, y: newY, zoom: newZoom });
  }, [viewport]);

  // Bind mouse move and mouse up globally so they don't break when dragging fast out of the window/canvas
  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    const canvasEl = canvasRef.current;
    if (canvasEl) {
      canvasEl.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      if (canvasEl) {
        canvasEl.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp, handleWheel]);

  // Handle deleting selected elements via Backspace/Delete keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a text editor/input
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.hasAttribute('contenteditable'))
      ) {
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
        } else if (selectedConnectionId) {
          deleteConnection(selectedConnectionId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeId, selectedConnectionId, deleteNode, deleteConnection]);

  return {
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
    addConnection,
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
    
    // Event start triggers
    handleCanvasMouseDown,
    startDraggingNode,
    startLinking,
    screenToCanvasPos,
  };
};
