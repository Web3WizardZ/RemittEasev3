import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function render(ui: React.ReactElement, { ...renderOptions } = {}) {
  const returnValue = {
    ...rtlRender(ui, { ...renderOptions }),
    user: userEvent.setup(),
  };
  
  return returnValue;
}

export * from '@testing-library/react';
export { render };