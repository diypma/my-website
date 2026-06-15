# Systems Mapper Implementation Tasks

- `[x]` Initialize Vite + React + TS project
- `[x]` Clean up default template code and configure index.html & index.css
- `[x]` Create `types.ts` defining nodes, connections, and viewport states
- `[x]` Implement `useCanvasState.ts` custom hook for interactive state management (pan, zoom, drag node, draw connection)
- `[x]` Create core CSS design system in `index.css` (pastels, shadows, glassmorphism, animations)
- `[x]` Build individual components:
  - `[x]` `Node.tsx` (draggable card with text editor, color choices, and link handler)
  - `[x]` `Connection.tsx` (curved SVG paths, arrowheads, loop shapes, and flow particles)
  - `[x]` `Toolbar.tsx` (glassmorphism control bar for panning/zooming/clearing/animations)
  - `[x]` `Canvas.tsx` (main SVG overlay + node list container with event listeners)
  - `[x]` `HelpModal.tsx` (quick guidelines on controls)
- `[x]` Wire everything up in `App.tsx`
- `[x]` Add GitHub deployment workflow in `.github/workflows/deploy.yml`
- `[x]` Verify the build completes successfully
