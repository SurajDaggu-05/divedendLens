export type EnvironmentCheck = {
  name: string
  status: 'ready'
}

export type EnvironmentSnapshot = {
  product: 'DividendLens'
  phase: 'frontend-environment'
  checks: EnvironmentCheck[]
}
