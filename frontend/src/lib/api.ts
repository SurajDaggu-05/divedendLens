import axios from 'axios';
import {
  DashboardOverview,
  Portfolio,
  Holding,
  PortfolioSummary,
  DividendEvent,
  CalendarEventEntry,
  AgentState,
  AgentRun,
  DataAlert,
  ExplanationResponse,
  PaymentReport
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fallback Mock Data for resilient presentation
export const MOCK_DASHBOARD: DashboardOverview = {
  is_demo_data: true,
  metrics: {
    expected_income_fy: '1450.00',
    received_income_fy: '800.00',
    upcoming_30_days: '400.00',
    currency: 'INR',
  },
  upcoming_events: [
    {
      event_id: 'f6a7b890-1234-5678-f012-678901234567',
      company_ticker: 'TCS',
      company_name: 'Tata Consultancy Services Ltd',
      ex_date: '2026-10-10',
      dividend_per_share: '10.00',
      eligible_shares: 25,
      estimated_gross_amount: '250.00',
      status: 'announced',
    },
    {
      event_id: 'evt-infy-002',
      company_ticker: 'INFY',
      company_name: 'Infosys Limited',
      ex_date: '2026-10-15',
      dividend_per_share: '18.00',
      eligible_shares: 50,
      estimated_gross_amount: '900.00',
      status: 'announced',
    },
    {
      event_id: 'evt-rel-003',
      company_ticker: 'RELIANCE',
      company_name: 'Reliance Industries Ltd',
      ex_date: '2026-11-01',
      dividend_per_share: '15.00',
      eligible_shares: 30,
      estimated_gross_amount: '450.00',
      status: 'announced',
    },
  ],
  alerts_count: 1,
  agent_system_health: 'healthy',
  last_updated_at: new Date().toISOString(),
};

export const MOCK_PORTFOLIOS: Portfolio[] = [
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    name: 'My Core Equities',
    holdings_count: 3,
    created_at: '2026-09-26T15:30:00Z',
  },
];

export const MOCK_HOLDINGS: Holding[] = [
  {
    id: 'd4e5f6a7-b890-1234-def0-456789012345',
    portfolio_id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    company: {
      id: 'comp-tcs-001',
      ticker: 'TCS',
      name: 'Tata Consultancy Services Ltd',
      exchange: 'NSE',
    },
    quantity: 25,
    average_price: '3850.00',
    purchase_date: '2026-01-15',
    upcoming_event: {
      event_id: 'f6a7b890-1234-5678-f012-678901234567',
      ex_date: '2026-10-10',
      dividend_per_share: '10.00',
      estimated_gross_amount: '250.00',
      status: 'announced',
    },
  },
  {
    id: 'e5f6a7b8-9012-3456-ef01-567890123457',
    portfolio_id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    company: {
      id: 'comp-infy-002',
      ticker: 'INFY',
      name: 'Infosys Limited',
      exchange: 'NSE',
    },
    quantity: 50,
    average_price: '1520.50',
    purchase_date: '2026-03-10',
    upcoming_event: {
      event_id: 'evt-infy-002',
      ex_date: '2026-10-15',
      dividend_per_share: '18.00',
      estimated_gross_amount: '900.00',
      status: 'announced',
    },
  },
  {
    id: 'hld-rel-003',
    portfolio_id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    company: {
      id: 'comp-rel-003',
      ticker: 'RELIANCE',
      name: 'Reliance Industries Ltd',
      exchange: 'NSE',
    },
    quantity: 30,
    average_price: '2450.00',
    purchase_date: '2026-02-20',
    upcoming_event: {
      event_id: 'evt-rel-003',
      ex_date: '2026-11-01',
      dividend_per_share: '15.00',
      estimated_gross_amount: '450.00',
      status: 'announced',
    },
  },
];

export const MOCK_AGENTS: AgentState[] = [
  {
    agent_id: 'collector-agent-1',
    name: 'Data Collection Agent',
    role: 'Ingest raw corporate action disclosures',
    status: 'online',
    last_heartbeat: new Date().toISOString(),
    current_task: 'Idle',
    is_simulated: true,
  },
  {
    agent_id: 'date-tracker-1',
    name: 'Date Tracking Agent',
    role: 'Normalize and validate calendar date fields',
    status: 'online',
    last_heartbeat: new Date().toISOString(),
    current_task: 'Idle',
    is_simulated: true,
  },
  {
    agent_id: 'validator-agent-1',
    name: 'Data Validation Agent',
    role: 'Detect duplicates, stale data, and source conflicts',
    status: 'online',
    last_heartbeat: new Date().toISOString(),
    current_task: 'Idle',
    is_simulated: true,
  },
  {
    agent_id: 'calculator-agent-1',
    name: 'Dividend Calculation Agent',
    role: 'Compute gross income estimates using deterministic rules',
    status: 'online',
    last_heartbeat: new Date().toISOString(),
    current_task: 'Idle',
    is_simulated: true,
  },
  {
    agent_id: 'explanation-agent-1',
    name: 'Explanation Agent',
    role: 'Generate plain-language context & text breakdowns',
    status: 'online',
    last_heartbeat: new Date().toISOString(),
    current_task: 'Idle',
    is_simulated: true,
  },
  {
    agent_id: 'monitoring-recovery-agent-1',
    name: 'Monitoring & Recovery Agent',
    role: 'Monitor agent heartbeats, retry failed tasks, and manage recovery',
    status: 'online',
    last_heartbeat: new Date().toISOString(),
    current_task: 'Monitoring worker cluster',
    is_simulated: true,
  },
];

export const MOCK_ALERTS: DataAlert[] = [
  {
    id: 'alert-infy-001',
    event_id: 'evt-infy-002',
    company_ticker: 'INFY',
    alert_type: 'conflict',
    description: 'BSE Official Disclosure reports ₹18.00 DPS while NSE Market Feed reports ₹20.00 DPS.',
    is_resolved: false,
    observations: [
      {
        id: 'src-infy-001',
        source_name: 'BSE Official Disclosure',
        observed_dps: '18.00',
        observed_at: '2026-09-20T10:00:00Z',
      },
      {
        id: 'src-infy-002',
        source_name: 'NSE Market Feed',
        observed_dps: '20.00',
        observed_at: '2026-09-20T10:05:00Z',
      },
    ],
    created_at: '2026-09-20T10:10:00Z',
  },
];

// API Functions with automatic fallback
export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  try {
    const res = await apiClient.get('/dashboard/overview');
    return res.data.data;
  } catch (err) {
    console.warn('Backend API unavailable, using fallback mock dashboard data:', err);
    return MOCK_DASHBOARD;
  }
}

export async function fetchPortfolios(): Promise<Portfolio[]> {
  try {
    const res = await apiClient.get('/portfolios');
    return res.data.data;
  } catch (err) {
    return MOCK_PORTFOLIOS;
  }
}

export async function fetchHoldings(portfolioId: string): Promise<Holding[]> {
  try {
    const res = await apiClient.get(`/portfolios/${portfolioId}/holdings`);
    return res.data.data;
  } catch (err) {
    return MOCK_HOLDINGS;
  }
}

export async function addHolding(portfolioId: string, payload: { ticker: string; quantity: number; average_price?: number; purchase_date?: string }): Promise<Holding> {
  try {
    const res = await apiClient.post(`/portfolios/${portfolioId}/holdings`, payload);
    return res.data.data;
  } catch (err) {
    // Local state fallback insertion
    const newHolding: Holding = {
      id: `hld-${Date.now()}`,
      portfolio_id: portfolioId,
      company: {
        id: `comp-${payload.ticker.toLowerCase()}`,
        ticker: payload.ticker.toUpperCase(),
        name: `${payload.ticker.toUpperCase()} Equity`,
        exchange: 'NSE',
      },
      quantity: payload.quantity,
      average_price: payload.average_price ? payload.average_price.toFixed(2) : undefined,
      purchase_date: payload.purchase_date,
    };
    MOCK_HOLDINGS.push(newHolding);
    return newHolding;
  }
}

export async function deleteHolding(holdingId: string): Promise<void> {
  try {
    await apiClient.delete(`/holdings/${holdingId}`);
  } catch (err) {
    const idx = MOCK_HOLDINGS.findIndex(h => h.id === holdingId);
    if (idx !== -1) MOCK_HOLDINGS.splice(idx, 1);
  }
}

export async function fetchDividends(): Promise<DividendEvent[]> {
  try {
    const res = await apiClient.get('/dividends');
    return res.data.data;
  } catch (err) {
    return [
      {
        id: 'f6a7b890-1234-5678-f012-678901234567',
        company: { ticker: 'TCS', name: 'Tata Consultancy Services Ltd' },
        event_type: 'interim',
        dividend_per_share: '10.00',
        currency: 'INR',
        announcement_date: '2026-09-15',
        ex_date: '2026-10-10',
        record_date: '2026-10-11',
        payment_date: '2026-10-25',
        business_status: 'announced',
        validation_status: 'valid',
        is_demo_data: true,
      },
      {
        id: 'evt-infy-002',
        company: { ticker: 'INFY', name: 'Infosys Limited' },
        event_type: 'interim',
        dividend_per_share: '18.00',
        currency: 'INR',
        announcement_date: '2026-09-20',
        ex_date: '2026-10-15',
        record_date: '2026-10-16',
        payment_date: '2026-10-30',
        business_status: 'announced',
        validation_status: 'conflict',
        is_demo_data: true,
      },
      {
        id: 'evt-rel-003',
        company: { ticker: 'RELIANCE', name: 'Reliance Industries Ltd' },
        event_type: 'final',
        dividend_per_share: '15.00',
        currency: 'INR',
        announcement_date: '2026-09-22',
        ex_date: '2026-11-01',
        record_date: '2026-11-02',
        payment_date: '2026-11-15',
        business_status: 'announced',
        validation_status: 'valid',
        is_demo_data: true,
      }
    ];
  }
}

export async function fetchCalendarEvents(): Promise<CalendarEventEntry[]> {
  try {
    const res = await apiClient.get('/calendar');
    return res.data.data;
  } catch (err) {
    return [
      {
        event_id: 'f6a7b890-1234-5678-f012-678901234567',
        company_ticker: 'TCS',
        date: '2026-10-10',
        date_type: 'ex_date',
        dividend_per_share: '10.00',
        estimated_gross_amount: '250.00',
        validation_status: 'valid',
        business_status: 'announced',
      },
      {
        event_id: 'evt-infy-002',
        company_ticker: 'INFY',
        date: '2026-10-15',
        date_type: 'ex_date',
        dividend_per_share: '18.00',
        estimated_gross_amount: '900.00',
        validation_status: 'conflict',
        business_status: 'announced',
      },
      {
        event_id: 'f6a7b890-1234-5678-f012-678901234567',
        company_ticker: 'TCS',
        date: '2026-10-25',
        date_type: 'payment_date',
        dividend_per_share: '10.00',
        estimated_gross_amount: '250.00',
        validation_status: 'valid',
        business_status: 'scheduled',
      },
      {
        event_id: 'evt-infy-002',
        company_ticker: 'INFY',
        date: '2026-10-30',
        date_type: 'payment_date',
        dividend_per_share: '18.00',
        estimated_gross_amount: '900.00',
        validation_status: 'conflict',
        business_status: 'scheduled',
      },
      {
        event_id: 'evt-rel-003',
        company_ticker: 'RELIANCE',
        date: '2026-11-01',
        date_type: 'ex_date',
        dividend_per_share: '15.00',
        estimated_gross_amount: '450.00',
        validation_status: 'valid',
        business_status: 'announced',
      },
    ];
  }
}

export async function fetchAgents(): Promise<AgentState[]> {
  try {
    const res = await apiClient.get('/agents');
    return res.data.data;
  } catch (err) {
    return MOCK_AGENTS;
  }
}

export async function fetchAlerts(): Promise<DataAlert[]> {
  try {
    const res = await apiClient.get('/alerts');
    return res.data.data;
  } catch (err) {
    return MOCK_ALERTS;
  }
}

export async function resolveAlert(alertId: string, selectedSourceId: string, notes?: string): Promise<void> {
  try {
    await apiClient.post(`/alerts/${alertId}/resolve`, {
      selected_source_id: selectedSourceId,
      resolution_notes: notes || 'Resolved via human review.',
    });
  } catch (err) {
    const alert = MOCK_ALERTS.find(a => a.id === alertId);
    if (alert) alert.is_resolved = true;
  }
}

export async function simulateAgentFailure(agentId: string): Promise<void> {
  try {
    await apiClient.post(`/agents/${agentId}/simulate-failure`);
  } catch (err) {
    const agent = MOCK_AGENTS.find(a => a.agent_id === agentId);
    if (agent) {
      agent.status = 'offline';
      agent.current_task = 'Process failure simulated (Demo Control)';
    }
  }
}

export async function restartAgent(agentId: string): Promise<void> {
  try {
    await apiClient.post(`/agents/${agentId}/restart`);
  } catch (err) {
    const agent = MOCK_AGENTS.find(a => a.agent_id === agentId);
    if (agent) {
      agent.status = 'online';
      agent.current_task = 'Idle';
    }
  }
}

export async function triggerSwarmRefresh(): Promise<void> {
  try {
    await apiClient.post('/agents/trigger');
  } catch (err) {
    console.log('Swarm refresh triggered locally');
  }
}

export async function resetDemoData(): Promise<void> {
  try {
    await apiClient.post('/demo/reset');
  } catch (err) {
    console.log('Demo data reset locally');
  }
}
