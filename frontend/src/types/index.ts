export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Company {
  id: string;
  ticker: string;
  name: string;
  exchange?: string;
  isin?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  holdings_count: number;
  created_at: string;
}

export interface UpcomingEventSummary {
  event_id: string;
  ex_date?: string;
  dividend_per_share: string;
  estimated_gross_amount: string;
  status: string;
}

export interface Holding {
  id: string;
  portfolio_id: string;
  company: Company;
  quantity: number;
  average_price?: string;
  purchase_date?: string;
  upcoming_event?: UpcomingEventSummary;
}

export interface PortfolioSummary {
  portfolio_id: string;
  currency: string;
  expected_income_fy: string;
  received_income_fy: string;
  upcoming_30_days: string;
  unverified_amount: string;
  last_calculated_at: string;
}

export interface EventSource {
  id: string;
  source_name: string;
  source_url?: string;
  observed_dps: string;
  observed_at: string;
}

export interface CalculationBreakdown {
  eligible_shares: number;
  dividend_per_share: string;
  estimated_gross_amount: string;
  formula: string;
  calculation_status: 'calculated' | 'provisional' | 'unavailable';
  calculated_at: string;
}

export interface DividendEvent {
  id: string;
  company: {
    ticker: string;
    name: string;
  };
  event_type: 'interim' | 'final' | 'special' | 'other';
  dividend_per_share: string;
  currency: string;
  announcement_date?: string;
  ex_date?: string;
  record_date?: string;
  payment_date?: string;
  business_status: 'announced' | 'scheduled' | 'paid' | 'cancelled' | 'unknown';
  validation_status: 'unverified' | 'valid' | 'conflict' | 'stale' | 'incomplete' | 'failed';
  is_demo_data: boolean;
  last_validated_at?: string;
  calculation?: CalculationBreakdown;
  sources?: EventSource[];
}

export interface PaymentReport {
  id: string;
  event_id: string;
  amount_received: string;
  received_date: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface CalendarEventEntry {
  event_id: string;
  company_ticker: string;
  date: string;
  date_type: 'ex_date' | 'payment_date' | 'record_date' | 'announcement_date';
  dividend_per_share: string;
  estimated_gross_amount: string;
  validation_status: string;
  business_status: string;
}

export interface AgentState {
  agent_id: string;
  name: string;
  role: string;
  status: 'online' | 'degraded' | 'offline';
  last_heartbeat: string;
  current_task?: string;
  is_simulated: boolean;
}

export interface AgentRun {
  run_id: string;
  task_id: string;
  correlation_id: string;
  agent_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  summary?: string;
  started_at: string;
  completed_at?: string;
}

export interface DataAlertObservation {
  id: string;
  source_name: string;
  observed_dps: string;
  observed_at: string;
}

export interface DataAlert {
  id: string;
  event_id: string;
  company_ticker: string;
  alert_type: 'conflict' | 'stale' | 'missing_fields' | 'duplicate';
  description: string;
  is_resolved: boolean;
  observations: DataAlertObservation[];
  created_at: string;
}

export interface DashboardOverview {
  is_demo_data: boolean;
  metrics: {
    expected_income_fy: string;
    received_income_fy: string;
    upcoming_30_days: string;
    currency: string;
  };
  upcoming_events: Array<{
    event_id: string;
    company_ticker: string;
    company_name: string;
    ex_date?: string;
    dividend_per_share: string;
    eligible_shares: number;
    estimated_gross_amount: string;
    status: string;
  }>;
  alerts_count: number;
  agent_system_health: 'healthy' | 'degraded' | 'unhealthy';
  last_updated_at: string;
}

export interface ExplanationResponse {
  event_id: string;
  company_ticker: string;
  explanation_text: string;
  provider_used: 'template' | 'openai';
  generated_at: string;
}
