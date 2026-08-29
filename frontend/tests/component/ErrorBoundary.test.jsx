import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ErrorBoundary from '../../src/components/ErrorBoundary.jsx'

const ThrowingChild = () => {
  throw new Error('render failure')
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('ErrorBoundary', () => {
  it('replaces a crashing child with an accessible recovery state', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.getByText('We could not display this page. Please try reloading it.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument()
    expect(console.error).toHaveBeenCalled()
  })

  it('renders children normally when no render error occurs', () => {
    render(
      <ErrorBoundary>
        <p>Healthy page</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('Healthy page')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
