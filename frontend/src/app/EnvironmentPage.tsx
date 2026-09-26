import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { EnvironmentSnapshot } from '@/types/env'

const chartSample = [
  { label: 'A', value: 4 },
  { label: 'B', value: 7 },
  { label: 'C', value: 5 },
]

function loadEnvironmentSnapshot(): Promise<EnvironmentSnapshot> {
  return Promise.resolve({
    product: 'DividendLens',
    phase: 'frontend-environment',
    checks: [
      { name: 'React + TypeScript + Vite', status: 'ready' },
      { name: 'Tailwind CSS + shadcn/ui', status: 'ready' },
      { name: 'React Router', status: 'ready' },
      { name: 'TanStack Query', status: 'ready' },
      { name: 'Recharts', status: 'ready' },
    ],
  })
}

export function EnvironmentPage() {
  const snapshotQuery = useQuery({
    queryKey: ['environment-snapshot'],
    queryFn: loadEnvironmentSnapshot,
  })

  const snapshot = snapshotQuery.data

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold leading-tight text-foreground">
          Development environment is running
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
          This shell confirms the frontend toolchain. Product screens, API
          clients, and the overview dashboard are intentionally not included
          yet.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stack checks</CardTitle>
            <CardDescription>
              Local query result used only to verify TanStack Query.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {snapshotQuery.isPending ? (
              <p className="text-sm text-muted-foreground">Loading checks…</p>
            ) : (
              <ul className="space-y-2">
                {snapshot?.checks.map((check) => (
                  <li
                    key={check.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{check.name}</span>
                    <span className="font-medium text-success">{check.status}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Button type="button">shadcn Button</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chart library check</CardTitle>
            <CardDescription>
              Placeholder bars, not income data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40" role="img" aria-label="Sample bar chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartSample}>
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} width={24} />
                  <Bar dataKey="value" fill="var(--primary)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
