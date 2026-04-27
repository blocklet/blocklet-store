import React from 'react';
import type { Preview } from '@storybook/react-vite';
import { ThemeProvider } from '@mui/material';
import { createTheme } from '@arcblock/ux/lib/Theme';

// @ts-ignore
const theme = createTheme({ mode: 'light' });

const preview: Preview = {
  decorators: [
    (StoryFn) => (
      <ThemeProvider theme={theme}>
        <div style={{ padding: 24 }}>
          <StoryFn />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;
