import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App';

// Import Mantine base stylesheets
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
// Import custom Tailwind stylesheet
import './index.css';

const theme = createTheme({
  primaryColor: 'dataBlue',
  colors: {
    dataBlue: [
      '#eef3ff',
      '#dbe6ff',
      '#bfd3ff',
      '#94b5ff',
      '#6798ff', // data-blue accent
      '#4775e6',
      '#2d54bf',
      '#193799',
      '#0b1e73',
      '#030a4d',
    ] as any,
    amber: [
      '#eef3ff',
      '#dbe6ff',
      '#bfd3ff',
      '#94b5ff',
      '#6798ff',
      '#4775e6',
      '#2d54bf',
      '#193799',
      '#0b1e73',
      '#030a4d',
    ] as any,
    violet: [
      '#f5f5f5',
      '#e5e5e5',
      '#d4d4d4',
      '#a3a3a3',
      '#737373',
      '#454545',
      '#313131',
      '#1e1e1e',
      '#141414',
      '#0a0a0a',
    ] as any,
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, ui-monospace, monospace',
  defaultRadius: 'md', // md is 8px by default in Mantine
  black: '#0a0a0a',
  white: '#ffffff',
  components: {
    TextInput: { defaultProps: { size: 'xs' } },
    Select: { defaultProps: { size: 'xs' } },
    Button: { defaultProps: { size: 'sm' } },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={1000} />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
