// src/__tests__/Home.test.tsx
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home', () => {
  it('renders without crashing', () => {
    render(<Home />)
    
    expect(
      screen.getByText('Global Money Transfer Simplified')
    ).toBeInTheDocument()
  })
})