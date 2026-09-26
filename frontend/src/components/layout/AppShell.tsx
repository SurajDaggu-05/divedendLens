import { CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              DividendLens
            </p>
            <p className="text-lg font-semibold text-foreground">
              Frontend environment
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-success">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Setup only
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
