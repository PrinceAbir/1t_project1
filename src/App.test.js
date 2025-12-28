import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

test('renders App without crashing', () => {
  render(<App />);
  const el = document.querySelector('.App') || document.body;
  expect(el).toBeTruthy();
});
