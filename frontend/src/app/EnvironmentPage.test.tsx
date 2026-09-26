import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AppRoutes } from '@/app/routes'

function renderShell() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('frontend environment shell', () => {
  it('renders the setup shell without product dashboard copy', async () => {
    renderShell()

    expect(
      screen.getByRole('heading', {
        name: /development environment is running/i,
      }),
    ).toBeInTheDocument()

    expect(
      await screen.findByText('React + TypeScript + Vite'),
    ).toBeInTheDocument()

    expect(screen.queryByText(/expected this financial year/i)).not.toBeInTheDocument()
  })
})
