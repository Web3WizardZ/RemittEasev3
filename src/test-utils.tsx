// src/test-utils.tsx
import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

function render(ui: React.ReactElement, { ...renderOptions } = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }
  
  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    user: userEvent.setup(),
  }
}

// re-export everything
export * from '@testing-library/react'

// override render method
export { render }