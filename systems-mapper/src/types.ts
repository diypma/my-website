export interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string; // Theme key: 'pink' | 'peach' | 'yellow' | 'mint' | 'blue' | 'lavender' | 'cream'
}

export interface Connection {
  id: string;
  from: string; // Source Node ID
  to: string;   // Target Node ID
  text: string; // Optional label on the connection line
  color: string; // Theme color or connection color
  style: 'solid' | 'dashed';
  curvature: number; // Curvature modifier: 0 = default, positive/negative bends
  flowSpeed: number; // Information flow speed multiplier: default 1
}

export interface Viewport {
  x: number; // Panning X offset
  y: number; // Panning Y offset
  zoom: number; // Zoom level (e.g., 0.2 to 3)
}

export type ThemeKey = 'pink' | 'peach' | 'yellow' | 'mint' | 'blue' | 'lavender' | 'cream';

export interface NodeTheme {
  bg: string;
  border: string;
  text: string;
  shadow: string;
}

export const NODE_THEMES: Record<ThemeKey, NodeTheme> = {
  pink: {
    bg: '#FFE5EC',
    border: '#FFC2D1',
    text: '#800020',
    shadow: 'rgba(255, 194, 209, 0.4)',
  },
  peach: {
    bg: '#FFEBE0',
    border: '#FFD1B3',
    text: '#803A00',
    shadow: 'rgba(255, 209, 179, 0.4)',
  },
  yellow: {
    bg: '#FCF8D5',
    border: '#F6E69D',
    text: '#6A5D00',
    shadow: 'rgba(246, 230, 157, 0.4)',
  },
  mint: {
    bg: '#E2F7ED',
    border: '#B2ECBD',
    text: '#0D5325',
    shadow: 'rgba(178, 236, 189, 0.4)',
  },
  blue: {
    bg: '#E3F2FD',
    border: '#B3E5FC',
    text: '#0D47A1',
    shadow: 'rgba(179, 229, 252, 0.4)',
  },
  lavender: {
    bg: '#F3E8FF',
    border: '#E9D5FF',
    text: '#581C87',
    shadow: 'rgba(233, 213, 255, 0.4)',
  },
  cream: {
    bg: '#FAFAF5',
    border: '#E4E4D9',
    text: '#44443F',
    shadow: 'rgba(228, 228, 217, 0.4)',
  },
};
