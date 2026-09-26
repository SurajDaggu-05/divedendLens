import React, { FormEvent, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Cpu,
  AlertCircle,
  Zap,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

interface SignInPageProps {
  onSignIn?: () => void;
}

interface AgentNodeInfo {
  id: string;
  name: string;
  role: string;
  x: string;
  y: string;
  color: string;
  badge: string;
}

const AGENTS: AgentNodeInfo[] = [
  {
    id: 'collector',
    name: 'Collector Agent',
    role: 'Ingests corporate disclosures',
    x: '15%',
    y: '20%',
    color: '#2563EB', // blue
    badge: 'NSE / BSE Feed',
  },
  {
    id: 'validator',
    name: 'Validator Agent',
    role: 'Cross-checks source agreement',
    x: '85%',
    y: '22%',
    color: '#059669', // emerald
    badge: 'Consensus 100%',
  },
  {
    id: 'calculator',
    name: 'Calculator Agent',
    role: 'Computes net & gross yields',
    x: '80%',
    y: '78%',
    color: '#7C3AED', // purple
    badge: 'Tax Rules Engine',
  },
  {
    id: 'monitor',
    name: 'Monitor Agent',
    role: 'Tracks ex-dates & payment status',
    x: '20%',
    y: '75%',
    color: '#D97706', // amber
    badge: 'Active Watcher',
  },
  {
    id: 'core',
    name: 'Dividend AI Core',
    role: 'Orchestrates swarm consensus',
    x: '50%',
    y: '48%',
    color: '#2563EB', // blue accent
    badge: 'Swarm Leader',
  },
];

export default function SignInPage({ onSignIn }: SignInPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredAgent, setHoveredAgent] = useState<AgentNodeInfo | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  );

  function handleFillDemoCredentials() {
    setEmail('arjun@example.com');
    setPassword('SecurePassword123!');
    setError('');
    setAutoFilled(true);
    setTimeout(() => setAutoFilled(false), 2000);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      await login(trimmedEmail, password);
      if (onSignIn) {
        onSignIn();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#F6F8FB] text-[#17212F] flex flex-col justify-between overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Dynamic 3D depth background layers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft floating gradient orbs */}
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[120px]" />
        <div className="absolute right-[-5%] bottom-[-5%] h-[600px] w-[600px] rounded-full bg-purple-400/10 blur-[140px]" />
        <div className="absolute left-[35%] top-[40%] h-[400px] w-[400px] rounded-full bg-emerald-400/10 blur-[130px]" />

        {/* Clean Fintech Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Main Responsive Layout */}
      <div className="relative z-10 my-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ============================================================ */}
          {/* LEFT SIDE: Brand & Swarm Intelligence Presentation */}
          {/* ============================================================ */}
          <section className="lg:col-span-6 xl:col-span-7 space-y-8">
            {/* Top Brand Header */}
            <div>
              {/* Swarm Live Status Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs mb-6"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Swarm Intelligence
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  4 Core Agents Active
                </span>
              </motion.div>

              {/* Product Identity */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/20">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">
                      DividendLens
                    </h1>
                    <p className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
                      Financial Intelligence Platform
                    </p>
                  </div>
                </div>

                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                  Understand every dividend.{' '}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-slate-700">
                    Track every payment.
                  </span>
                </h2>

                <p className="max-w-xl text-base text-slate-600 leading-relaxed pt-1">
                  Intelligent dividend tracking powered by distributed data validation.
                  Multi-agent consensus automatically reconciles corporate action feeds,
                  calculates yield estimates, and alerts you to discrepancies.
                </p>
              </motion.div>
            </div>

            {/* Interactive Swarm Visual Graph (Lightweight CSS/SVG) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden sm:block h-64 sm:h-72 w-full rounded-2xl bg-white/70 border border-slate-200/80 shadow-md backdrop-blur-md p-4 overflow-hidden"
            >
              {/* Subtle visual grid background inside card */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 via-transparent to-purple-50/30" />

              {/* Dynamic SVG Connection Lines */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <line x1="15" y1="20" x2="50" y2="48" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="85" y1="22" x2="50" y2="48" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="80" y1="78" x2="50" y2="48" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="20" y1="75" x2="50" y2="48" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Outer interconnected mesh */}
                <line x1="15" y1="20" x2="85" y2="22" stroke="#E2E8F0" strokeWidth="1" />
                <line x1="20" y1="75" x2="80" y2="78" stroke="#E2E8F0" strokeWidth="1" />
              </svg>

              {/* Swarm Agent Nodes */}
              {AGENTS.map((agent, index) => {
                const isCenter = agent.id === 'core';
                const isHovered = hoveredAgent?.id === agent.id;

                return (
                  <motion.div
                    key={agent.id}
                    className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ left: agent.x, top: agent.y }}
                    animate={{
                      y: [0, index % 2 === 0 ? -6 : 6, 0],
                    }}
                    transition={{
                      duration: 4 + index * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    onMouseEnter={() => setHoveredAgent(agent)}
                    onMouseLeave={() => setHoveredAgent(null)}
                  >
                    <div
                      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 ${
                        isCenter
                          ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30 scale-105'
                          : isHovered
                          ? 'bg-white text-slate-900 border-blue-400 shadow-md scale-105'
                          : 'bg-white/90 text-slate-800 border-slate-200 shadow-xs'
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isCenter ? 'bg-white animate-pulse' : ''
                        }`}
                        style={{ backgroundColor: isCenter ? '#FFFFFF' : agent.color }}
                      />
                      <div>
                        <div className="text-[11px] font-bold leading-tight whitespace-nowrap">
                          {agent.name}
                        </div>
                        <div
                          className={`text-[9px] whitespace-nowrap ${
                            isCenter ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {agent.badge}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Bottom Interactive Hint */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>Real-time Consensus Protocol</span>
                </div>
                <div className="text-slate-400">Hover nodes to inspect topology</div>
              </div>
            </motion.div>

            {/* Feature Value Cards */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-transform hover:-translate-y-0.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Dividend Intelligence</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Real-time yield & ex-date tracking</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-transform hover:-translate-y-0.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Swarm Validation</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Cross-source feed agreement</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-transform hover:-translate-y-0.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Payment Tracking</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Automated bank reconciliation</p>
              </div>
            </motion.div>
          </section>

          {/* ============================================================ */}
          {/* RIGHT SIDE: Large Visually Dominant Sign-In Card */}
          {/* ============================================================ */}
          <section className="lg:col-span-6 xl:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="w-full max-w-[520px] bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_rgba(37,99,235,0.09)] p-8 sm:p-10 relative overflow-hidden"
            >
              {/* Top Accent Gradient Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 absolute top-0 left-0" />

              {/* Mobile Product Logo Header */}
              <div className="mb-6 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">DividendLens</div>
                  <div className="text-xs text-slate-500">Fintech Intelligence</div>
                </div>
              </div>

              {/* Card Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <Zap className="w-3 h-3 text-blue-600 fill-blue-600" />
                  Portfolio Access Portal
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Welcome back 👋
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Sign in to continue to your DividendLens portfolio.
                </p>
              </div>

              {/* Error Alert Box */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Unable to sign in</div>
                        <div className="mt-0.5 text-rose-700">{error}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setError('Password reset demo available: Click "Use Demo Account" below.')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 accent-blue-600"
                    />
                    <span>Keep me signed in</span>
                  </label>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!canSubmit || isLoading}
                  whileHover={canSubmit && !isLoading ? { scale: 1.01 } : {}}
                  whileTap={canSubmit && !isLoading ? { scale: 0.99 } : {}}
                  className="h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Connecting to Swarm...
                    </>
                  ) : (
                    <>
                      <span>Sign In to DividendLens</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Hackathon Demo Access Credentials Box */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-purple-50/50 to-slate-50 border border-blue-100/80">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Demo Access
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200">
                      Hackathon Ready
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-0.5 font-mono bg-white/70 p-2 rounded-xl border border-slate-200/60 mb-2.5">
                    <div>Email: <span className="font-semibold text-slate-800">arjun@example.com</span></div>
                    <div>Password: <span className="font-semibold text-slate-800">SecurePassword123!</span></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFillDemoCredentials}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      autoFilled
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-blue-700 border-blue-200 shadow-2xs'
                    }`}
                  >
                    {autoFilled ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Credentials Loaded! Click Sign In</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Use Demo Account</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>256-bit Encrypted Swarm Portfolio Intelligence</span>
              </div>
            </motion.div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/40 backdrop-blur-xs">
        DividendLens &copy; 2026 • Intelligent Distributed Dividend Analytics
      </footer>
    </main>
  );
}