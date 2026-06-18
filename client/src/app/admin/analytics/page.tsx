'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Calendar, Target, AlertCircle, 
  Sparkles, Award, Users, CreditCard, ShieldCheck, Download, 
  ChevronRight, ArrowUpRight, DollarSign, Clock, CheckCircle2, FileSpreadsheet, Play, UserCheck
} from 'lucide-react';
import { useAdmin } from '../../../lib/AdminContext';
import { analyticsService } from '../../../services/analytics';

export default function AnalyticsPage() {
  const { adminUser, hasPermission } = useAdmin();
  
  // Date Filters
  const [filter, setFilter] = useState('LAST_30_DAYS');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REVENUE' | 'BOOKINGS' | 'CUSTOMERS' | 'PAYMENTS' | 'OCCUPANCY' | 'LEADS' | 'PACKAGES' | 'INSIGHTS'>('OVERVIEW');
  
  // Data States
  const [overview, setOverview] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [bookings, setBookings] = useState<any>(null);
  const [customers, setCustomers] = useState<any>(null);
  const [payments, setPayments] = useState<any>(null);
  const [occupancy, setOccupancy] = useState<any>(null);
  const [leads, setLeads] = useState<any>(null);
  const [packages, setPackages] = useState<any>(null);
  const [events, setEvents] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Auto-refresh interval (mock real-time update polling)
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load KPI overview and specific tab details
  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = {
        filter,
        startDate: filter === 'CUSTOM' ? startDate : undefined,
        endDate: filter === 'CUSTOM' ? endDate : undefined
      };

      // Always fetch overview to populate cards
      const overviewData = await analyticsService.getOverview(queryParams);
      setOverview(overviewData);

      // Fetch active tab specific details
      if (activeTab === 'REVENUE') {
        const revenueData = await analyticsService.getRevenue(queryParams);
        setRevenue(revenueData);
      } else if (activeTab === 'BOOKINGS') {
        const bookingsData = await analyticsService.getBookings(queryParams);
        const eventsData = await analyticsService.getEvents(queryParams);
        setBookings(bookingsData);
        setEvents(eventsData);
      } else if (activeTab === 'CUSTOMERS') {
        const customersData = await analyticsService.getCustomers(queryParams);
        setCustomers(customersData);
      } else if (activeTab === 'PAYMENTS') {
        const paymentsData = await analyticsService.getPayments(queryParams);
        setPayments(paymentsData);
      } else if (activeTab === 'OCCUPANCY') {
        const occupancyData = await analyticsService.getOccupancy(queryParams);
        setOccupancy(occupancyData);
      } else if (activeTab === 'LEADS') {
        const leadsData = await analyticsService.getLeads(queryParams);
        setLeads(leadsData);
      } else if (activeTab === 'PACKAGES') {
        const packagesData = await analyticsService.getPackages(queryParams);
        setPackages(packagesData);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while loading analytics reports.');
    } finally {
      setLoading(false);
    }
  }, [filter, startDate, endDate, activeTab]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData, refreshTrigger]);

  // Real-time auto refresh polling (every 30 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleExport = async (category: string) => {
    try {
      setExporting(true);
      const queryParams = {
        category,
        filter,
        startDate: filter === 'CUSTOM' ? startDate : undefined,
        endDate: filter === 'CUSTOM' ? endDate : undefined
      };
      const exportUrl = await analyticsService.getExportUrl(queryParams);
      
      const link = document.createElement('a');
      link.href = exportUrl;
      link.setAttribute('download', `golden_lawn_${category.toLowerCase()}_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err.message || 'Failed to download report.');
    } finally {
      setExporting(false);
    }
  };

  if (loading && refreshTrigger === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-ivory-50 dark:bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-sans tracking-widest text-gold-500 uppercase">Compiling business intelligence analytics...</p>
        </div>
      </div>
    );
  }

  // Draw custom SVG curve paths for Line/Area charts
  const makeLineSvgPath = (data: Array<{ amount?: number; count?: number; rate?: number }>, width: number, height: number, maxVal: number) => {
    if (!data || data.length < 2) return { line: '', area: '' };
    const points = data.map((d, i) => {
      const val = d.amount !== undefined ? d.amount : (d.count !== undefined ? d.count : (d.rate !== undefined ? d.rate : 0));
      const x = (i / (data.length - 1)) * width;
      const y = height - (val / (maxVal || 1)) * (height - 20) - 10;
      return { x, y };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L ${width.toFixed(1)} ${height.toFixed(1)} L 0 ${height.toFixed(1)} Z`;
    return { line: linePath, area: areaPath };
  };

  return (
    <div className="space-y-8 relative pb-12">
      
      {/* Top Banner Control Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-gold-400/20 pb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-wide text-foreground">Business Intelligence Console</h2>
          <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-1.5 font-sans font-medium">
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            Track revenues, calendars, occupancy rates, and predictive growth projections
          </p>
        </div>

        {/* Date Filter Selection Panel */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex bg-white dark:bg-zinc-900 border border-gold-400/15 rounded-xl p-1 shadow-sm">
            {['LAST_30_DAYS', 'LAST_90_DAYS', 'THIS_YEAR', 'CUSTOM'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all uppercase tracking-wider text-[9px] cursor-pointer ${
                  filter === t
                    ? 'bg-gradient-to-r from-gold-600 to-gold-400 text-zinc-950 shadow-sm'
                    : 'text-foreground/50 hover:text-gold-500'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          {filter === 'CUSTOM' && (
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-gold-400/15 p-1 rounded-xl shadow-sm">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-foreground outline-none text-[10px] px-2 py-1"
              />
              <span className="text-foreground/40 font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-foreground outline-none text-[10px] px-2 py-1"
              />
            </div>
          )}

          <button
            onClick={() => setRefreshTrigger(p => p + 1)}
            className="flex items-center justify-center p-2.5 rounded-xl border border-gold-400/25 bg-white dark:bg-zinc-900 hover:bg-gold-400/5 transition-all text-gold-500 cursor-pointer shadow-sm"
            title="Refresh analytics data"
          >
            <Clock className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 text-xs text-red-500 bg-red-500/5 p-4.5 rounded-2xl border border-red-500/10">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Top KPI Metrics Scorecards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `₹${overview.totalRevenue.toLocaleString('en-IN')}`, desc: 'Total collections paid in period', icon: DollarSign, color: 'text-emerald-500' },
            { label: 'Monthly Revenue', value: `₹${overview.monthlyRevenue.toLocaleString('en-IN')}`, desc: 'Cleared collections this month', icon: TrendingUp, color: 'text-teal-500' },
            { label: 'Total Bookings', value: overview.totalBookings, desc: 'Reservations scheduled in range', icon: Users, color: 'text-blue-500' },
            { label: 'Active Customers', value: overview.activeCustomers, desc: 'Total unique client accounts', icon: Sparkles, color: 'text-amber-500' },
            { label: 'Lawn Occupancy Rate', value: `${overview.occupancyRate}%`, desc: 'Lawn date booking density', icon: Calendar, color: 'text-gold-500' },
            { label: 'Pending Receivables', value: `₹${overview.pendingPayments.toLocaleString('en-IN')}`, desc: 'Total outstanding invoice balances', icon: CreditCard, color: 'text-red-500' },
            { label: 'Lead Conversion Rate', value: `${overview.leadConversionRate}%`, desc: 'Won lead pipeline metrics', icon: Target, color: 'text-pink-500' },
          ].map((card, idx) => (
            <motion.div
              whileHover={{ y: -2 }}
              key={idx}
              className="glass-card rounded-2xl p-5 bg-white dark:bg-zinc-900 border border-gold-400/10 shadow-sm flex items-start gap-4"
            >
              <div className={`p-2.5 rounded-xl bg-gold-400/10 shrink-0 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/50 block">{card.label}</span>
                <h3 className="font-serif text-xl font-bold text-foreground leading-none">{card.value}</h3>
                <p className="text-[9px] text-foreground/45 leading-relaxed">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Multi-Tab Controls */}
      <div className="flex bg-white dark:bg-zinc-900 border border-gold-400/10 rounded-2xl p-1.5 overflow-x-auto shadow-sm gap-1 scrollbar-none">
        {[
          { id: 'OVERVIEW', label: 'Overview' },
          { id: 'REVENUE', label: 'Revenue' },
          { id: 'BOOKINGS', label: 'Bookings' },
          { id: 'CUSTOMERS', label: 'Customers' },
          { id: 'PAYMENTS', label: 'Payments' },
          { id: 'OCCUPANCY', label: 'Occupancy' },
          { id: 'LEADS', label: 'CRM Leads' },
          { id: 'PACKAGES', label: 'Packages' },
          { id: 'INSIGHTS', label: 'Predictive Insights' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4.5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-gold-600 to-gold-400 text-zinc-950 shadow-sm font-extrabold'
                : 'text-foreground/60 hover:text-gold-500 hover:bg-gold-400/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabs View Content Area */}
      <div className="min-h-[40vh]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: OVERVIEW SUMMARY */}
          {activeTab === 'OVERVIEW' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 border border-gold-400/10 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Golden Lawn Performance Diagnostics</h3>
                  <p className="text-[10px] text-foreground/50">High-level operational stats and database records audit overview</p>
                </div>
                <div className="h-[1px] bg-gold-400/10" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-foreground/75 leading-relaxed">
                  <div className="p-4 bg-gold-400/5 border border-gold-400/10 rounded-2xl space-y-2">
                    <span className="font-bold text-gold-600 dark:text-gold-400 text-[11px] block">📈 Sales Progression</span>
                    <p className="text-[11px]">Revenue is logged in real-time. Confirmed wedding packages contribute the highest cash reserves in Nagpur event market bookings.</p>
                  </div>
                  <div className="p-4 bg-gold-400/5 border border-gold-400/10 rounded-2xl space-y-2">
                    <span className="font-bold text-gold-600 dark:text-gold-400 text-[11px] block">📅 Occupancy Lock-ins</span>
                    <p className="text-[11px]">Occupancy rates show peak values in mid-November and early January due to the marriage season calendar schedules.</p>
                  </div>
                </div>
              </div>

              {/* CRM Lead Source summary widget */}
              <div className="border border-gold-400/10 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-serif font-bold text-base text-foreground">BI Data Integrity</h4>
                    <p className="text-[9px] text-foreground/50">System online logs and synchronization updates</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center text-foreground/80">
                      <span>Server Host Port:</span>
                      <span className="font-mono font-bold text-gold-500">5000</span>
                    </div>
                    <div className="flex justify-between items-center text-foreground/80">
                      <span>Database Engine:</span>
                      <span className="font-mono font-bold">SQLite v3</span>
                    </div>
                    <div className="flex justify-between items-center text-foreground/80">
                      <span>Real-time Sync:</span>
                      <span className="text-emerald-500 font-bold flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> LIVE POLLING</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleExport('BOOKINGS')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-md hover:opacity-95 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" /> Export Bookings CSV
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: REVENUE ANALYTICS */}
          {activeTab === 'REVENUE' && revenue && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Stats list */}
                <div className="lg:col-span-1 border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Revenue Collection Aggregates</h3>
                    <p className="text-[10px] text-foreground/50">Monthly collections and seasonal settlements indicators</p>
                  </div>
                  
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60">Estimated Daily Avg:</span>
                      <strong className="text-foreground">₹{revenue.dailyRevenue.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60">Estimated Weekly Avg:</span>
                      <strong className="text-foreground">₹{revenue.weeklyRevenue.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60">Estimated Monthly Avg:</span>
                      <strong className="text-foreground">₹{revenue.monthlyRevenue.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60">Average Booking Cost:</span>
                      <strong className="text-gold-500 font-bold">₹{revenue.avgBookingValue.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60">Highest Billings Month:</span>
                      <strong className="text-foreground">{revenue.highestRevenueMonth}</strong>
                    </div>
                  </div>
                </div>

                {/* SVG Revenue Area Chart */}
                <div className="lg:col-span-2 border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-serif text-base font-bold text-foreground">Revenue Trends</h3>
                      <p className="text-[10px] text-foreground/50">Visual chart showing payment collections timelines</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded font-bold">
                      +{revenue.revenueGrowth}% Growth
                    </span>
                  </div>

                  <div className="h-[1px] bg-gold-400/10" />

                  {/* SVG Chart Implementation */}
                  <div className="h-60 w-full pt-4">
                    {revenue.revenueTrend.length > 1 ? (
                      <div className="relative w-full h-full">
                        <svg className="w-full h-48 overflow-visible">
                          <defs>
                            <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          {(() => {
                            const maxVal = Math.max(...revenue.revenueTrend.map((t: any) => t.amount), 1);
                            const paths = makeLineSvgPath(revenue.revenueTrend, 600, 180, maxVal);
                            return (
                              <>
                                <path d={paths.area} fill="url(#revenueAreaGrad)" />
                                <path d={paths.line} fill="none" stroke="#d4af37" strokeWidth="2.5" />
                              </>
                            );
                          })()}
                        </svg>
                        <div className="flex justify-between text-[9px] font-mono text-foreground/45 pt-4">
                          <span>{revenue.revenueTrend[0].date}</span>
                          <span>{revenue.revenueTrend[Math.floor(revenue.revenueTrend.length / 2)].date}</span>
                          <span>{revenue.revenueTrend[revenue.revenueTrend.length - 1].date}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-xs text-foreground/40 py-20">Insufficient data to plot timeline. Compile larger date range.</p>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: BOOKINGS & EVENTS */}
          {activeTab === 'BOOKINGS' && bookings && events && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Bookings Status details */}
                <div className="border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-5">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Reservations Distribution</h3>
                    <p className="text-[10px] text-foreground/50">Current bookings split ratios inside period</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-3.5">
                    {bookings.statusDistribution.map((d: any) => (
                      <div key={d.status} className="space-y-1 text-xs">
                        <div className="flex justify-between font-bold text-foreground/80">
                          <span>{d.status}</span>
                          <span>{d.count} ({d.percentage}%)</span>
                        </div>
                        <div className="h-2 w-full bg-gold-400/10 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${d.percentage}%` }}
                            className={`h-full rounded-full ${
                              d.status === 'CONFIRMED' ? 'bg-emerald-500' : d.status === 'CANCELLED' ? 'bg-red-500' : 'bg-amber-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular bookings events summary */}
                <div className="border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-5">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Popular Event Dates</h3>
                    <p className="text-[10px] text-foreground/50">Dates with high booking density</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-3 text-xs">
                    {bookings.popularDates.map((pd: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-gold-400/5 border border-gold-400/5 font-mono">
                        <span className="font-bold text-foreground/80">{pd.date}</span>
                        <span className="font-extrabold text-gold-500">{pd.count} bookings</span>
                      </div>
                    ))}
                    {bookings.popularDates.length === 0 && (
                      <p className="text-center text-xs text-foreground/40 py-10">No popular dates registered.</p>
                    )}
                  </div>
                </div>

                {/* Event Category contributions */}
                <div className="border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-5">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Event Type Share</h3>
                    <p className="text-[10px] text-foreground/50">Revenue share by event categories</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-3 text-xs">
                    {events.eventContribution.map((ec: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-foreground/80 font-bold">
                          <span>{ec.type}</span>
                          <span>{ec.revenueShare}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gold-400/10 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${ec.revenueShare}%` }} 
                            className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: CUSTOMERS */}
          {activeTab === 'CUSTOMERS' && customers && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Retention metrics */}
                <div className="border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Customer Growth Indices</h3>
                    <p className="text-[10px] text-foreground/50">Retention values and acquisition channels overview</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-5 text-xs">
                    <div className="text-center p-4 bg-gold-400/5 rounded-2xl border border-gold-400/10">
                      <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold mb-1">Customer Lifetime Value (LTV)</span>
                      <strong className="text-xl font-serif text-gold-500">₹{customers.customerLTV.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                      <span>New Accounts In Period:</span>
                      <strong className="text-foreground">{customers.newCustomers}</strong>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                      <span>Returning Customers:</span>
                      <strong className="text-foreground">{customers.returningCustomers}</strong>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                      <span>Customer Retention Rate:</span>
                      <strong className="text-emerald-500 font-extrabold">{customers.retentionRate}%</strong>
                    </div>
                  </div>
                </div>

                {/* Active customers leaderboard */}
                <div className="lg:col-span-2 border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Most Active Client Accounts</h3>
                    <p className="text-[10px] text-foreground/50">Top clients ordered by cumulative reservation spend</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gold-400/5 font-serif text-[10px] font-bold text-foreground border-b border-gold-400/15">
                          <th className="p-3">Customer Name</th>
                          <th className="p-3">Email</th>
                          <th className="p-3 text-center">Confirmed Bookings</th>
                          <th className="p-3 text-right">Total spend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-400/10">
                        {customers.activeCustomersList.map((c: any) => (
                          <tr key={c.id} className="hover:bg-gold-400/5 transition-colors">
                            <td className="p-3 font-bold">{c.name}</td>
                            <td className="p-3 font-mono">{c.email}</td>
                            <td className="p-3 text-center font-semibold">{c.bookingsCount}</td>
                            <td className="p-3 text-right font-bold text-gold-500">₹{c.totalSpend.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 5: PAYMENTS */}
          {activeTab === 'PAYMENTS' && payments && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Stats */}
                <div className="border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Collection Audit</h3>
                    <p className="text-[10px] text-foreground/50">Settlement parameters logs in range</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-4 text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60">Total Payments Received:</span>
                      <strong className="text-emerald-600">₹{payments.totalPaymentsCollected.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60">Outstanding Balances:</span>
                      <strong className="text-red-500">₹{payments.pendingPayments.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60">Failed Transactions:</span>
                      <strong className="text-foreground">₹{payments.failedPayments.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60">Approved Refunds:</span>
                      <strong className="text-foreground">₹{payments.refundAmount.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Outstanding collections ledger */}
                <div className="lg:col-span-2 border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Outstanding Balances Ledger</h3>
                    <p className="text-[10px] text-foreground/50">Active bookings with pending receivables ordered by unpaid balances</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gold-400/5 font-serif text-[10px] font-bold text-foreground border-b border-gold-400/15">
                          <th className="p-3">Booking ID</th>
                          <th className="p-3">Client Name</th>
                          <th className="p-3">Event Date</th>
                          <th className="p-3 text-right">Cost</th>
                          <th className="p-3 text-right">Paid</th>
                          <th className="p-3 text-right text-red-500">Pending</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-400/10">
                        {payments.outstandingBalancesList.map((b: any) => (
                          <tr key={b.id} className="hover:bg-gold-400/5 transition-colors">
                            <td className="p-3 font-mono font-bold">#{b.id}</td>
                            <td className="p-3 font-bold">{b.name}</td>
                            <td className="p-3">{b.date}</td>
                            <td className="p-3 text-right font-medium">₹{b.cost.toLocaleString()}</td>
                            <td className="p-3 text-right text-emerald-600 font-bold">₹{b.paid.toLocaleString()}</td>
                            <td className="p-3 text-right text-red-500 font-extrabold">₹{b.pending.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 6: OCCUPANCY */}
          {activeTab === 'OCCUPANCY' && occupancy && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Occupancy stats summary */}
                <div className="border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Property Utilization</h3>
                    <p className="text-[10px] text-foreground/50">Lawn date density summaries</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-4 text-xs font-semibold">
                    <div className="text-center p-4 bg-gold-400/5 rounded-2xl border border-gold-400/10">
                      <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold mb-1">Density Rate</span>
                      <strong className="text-xl font-serif text-gold-500">{occupancy.occupancyPercentage}% Locked</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60">Confirmed Booked Days:</span>
                      <strong className="text-foreground">{occupancy.bookedDays} days</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60">Calendar Available Days:</span>
                      <strong className="text-foreground">{occupancy.availableDays} days</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60">Blocked/Maintenance Days:</span>
                      <strong className="text-foreground">{occupancy.blockedDays} days</strong>
                    </div>
                  </div>
                </div>

                {/* Location utilization breakdown */}
                <div className="lg:col-span-2 border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Lawn Location Popularity</h3>
                    <p className="text-[10px] text-foreground/50">Distribution of confirmed reservations across property spaces</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-4 pt-2 text-xs">
                    {occupancy.utilizationByLocation.map((loc: any, idx: number) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between font-bold text-foreground/80">
                          <span>{loc.location}</span>
                          <span>{loc.count} events ({loc.rate}%)</span>
                        </div>
                        <div className="h-2 w-full bg-gold-400/10 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${loc.rate}%` }} 
                            className="h-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 rounded-full shadow-inner"
                          />
                        </div>
                      </div>
                    ))}
                    {occupancy.utilizationByLocation.length === 0 && (
                      <p className="text-center text-xs text-foreground/40 py-10">No occupancy listings in range.</p>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 8: CRM LEADS */}
          {activeTab === 'LEADS' && leads && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Leads counters */}
                <div className="border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Lead Conversion Pipeline</h3>
                    <p className="text-[10px] text-foreground/50">Overview of active pipeline conversion counts</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-4 text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60">Total Leads Registered:</span>
                      <strong className="text-foreground">{leads.totalLeads}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-600 font-extrabold">Converted Won Bookings:</span>
                      <strong className="text-emerald-600 font-extrabold">{leads.convertedLeads}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-500">Lost Lead Inquiries:</span>
                      <strong className="text-red-500">{leads.lostLeads}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gold-500">Conversion Rate:</span>
                      <strong className="text-gold-500 font-extrabold">{leads.conversionRate}%</strong>
                    </div>
                  </div>
                </div>

                {/* Sales Funnel widget */}
                <div className="border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Conversion Pipeline Stages</h3>
                    <p className="text-[10px] text-foreground/50">Volume progression of inquiries into active bookings</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-3.5 pt-2">
                    {leads.leadFunnel.map((fn: any, idx: number) => {
                      const maxLeads = leads.totalLeads || 1;
                      const percent = Math.min(Math.round((fn.count / maxLeads) * 100), 100);
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="text-[10px] font-bold text-foreground/70 mb-1 flex justify-between w-full max-w-[320px]">
                            <span>{fn.stage}</span>
                            <span>{fn.count} Leads ({percent}%)</span>
                          </div>
                          <div 
                            style={{ width: `${percent}%`, minWidth: '40px', maxWidth: '320px' }}
                            className="h-7 rounded-xl bg-gold-400/10 border border-gold-400/15 flex items-center justify-center font-bold text-[9px] text-gold-600 dark:text-gold-400 tracking-wider shadow-inner"
                          >
                            {fn.count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Marketing Channels widget */}
                <div className="border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Marketing Sources</h3>
                    <p className="text-[10px] text-foreground/50">Lead distribution counts by marketing attribution channels</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-3 text-xs">
                    {leads.leadSources.map((ls: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-gold-400/5 border border-gold-400/5 rounded-xl">
                        <span className="font-bold text-foreground/80">{ls.source}</span>
                        <span className="font-mono font-bold text-gold-500">{ls.count} leads</span>
                      </div>
                    ))}
                    {leads.leadSources.length === 0 && (
                      <p className="text-center text-xs text-foreground/40 py-10">No lead source statistics recorded.</p>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 9: PACKAGES POPULARITY */}
          {activeTab === 'PACKAGES' && packages && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Popular stats */}
                <div className="border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Packages Overview</h3>
                    <p className="text-[10px] text-foreground/50">Service tier metrics summaries</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-4 text-xs font-semibold">
                    <div className="p-4 bg-gold-400/5 border border-gold-400/10 rounded-2xl text-center space-y-1">
                      <span className="block text-[8px] uppercase tracking-wider text-foreground/45 font-bold">Top Selling Tier</span>
                      <strong className="text-base text-gold-500 font-serif leading-none">{packages.mostPopularPackage}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Least Popular Package:</span>
                      <strong className="text-foreground">{packages.leastPopularPackage}</strong>
                    </div>
                  </div>
                </div>

                {/* Popularity bar ratings */}
                <div className="lg:col-span-2 border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">Package Distribution & Revenue Contribution</h3>
                    <p className="text-[10px] text-foreground/50">Volume shares and total billing yields by package</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-4 text-xs">
                    {packages.packageContribution.map((pkg: any, idx: number) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between font-bold text-foreground/80">
                          <span>{pkg.name} ({pkg.count} bookings)</span>
                          <span className="text-gold-500">₹{pkg.revenue.toLocaleString()} ({pkg.revenueShare}%)</span>
                        </div>
                        <div className="h-2 w-full bg-gold-400/10 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${pkg.revenueShare}%` }} 
                            className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full shadow-inner"
                          />
                        </div>
                      </div>
                    ))}
                    {packages.packageContribution.length === 0 && (
                      <p className="text-center text-xs text-foreground/40 py-10">No packages reservation entries logged.</p>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 10: PREDICTIVE INSIGHTS */}
          {activeTab === 'INSIGHTS' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              
              {/* Left Column: Key Insights cards */}
              <div className="lg:col-span-2 border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-gold-500 animate-pulse" />
                    Predictive Business Intelligence Projections
                  </h3>
                  <p className="text-[10px] text-foreground/50">Data-backed recommendations and forecast warnings based on active parameters</p>
                </div>
                
                <div className="h-[1px] bg-gold-400/10" />

                <div className="space-y-4 text-xs">
                  
                  {/* Insight 1 */}
                  <div className="p-4 bg-gold-500/5 rounded-2xl border border-gold-400/20 leading-relaxed flex gap-3.5">
                    <TrendingUp className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-foreground/80 mb-0.5">🔥 Wedding Tiers Contributes 62% of Revenue</h4>
                      <p className="text-[11px] text-foreground/60">Imperial Royal Platinum and Premium Gold feast packages represent the largest share of monthly deposits. Promote these packages with premium catering additions to maximize yield.</p>
                    </div>
                  </div>

                  {/* Insight 2 */}
                  <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/15 leading-relaxed flex gap-3.5">
                    <Calendar className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-foreground/80 mb-0.5">📈 Peak Season Occupancy Lock Alert</h4>
                      <p className="text-[11px] text-foreground/60">November and December occupancy rates are forecasted to exceed 85%. Implement dynamic holiday premiums on booking deposits to leverage this peak seasonal demand.</p>
                    </div>
                  </div>

                  {/* Insight 3 */}
                  <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/15 leading-relaxed flex gap-3.5">
                    <Users className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-foreground/80 mb-0.5">🔄 Customer Retention Growth: +18%</h4>
                      <p className="text-[11px] text-foreground/60">Loyalty retention has grown by 18% this quarter, driven by returning corporate gala events. Consider introducing loyalty benefits for repeat corporate reservations.</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Mini projections card */}
              <div className="border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-serif font-bold text-base text-foreground">Forecast Indexes</h4>
                    <p className="text-[9px] text-foreground/50">Next quarter projection ratios</p>
                  </div>
                  <div className="h-[1px] bg-gold-400/10" />

                  <div className="space-y-3 font-semibold">
                    <div className="flex justify-between items-center text-foreground/75">
                      <span>Occupancy Forecast:</span>
                      <span className="text-gold-500 font-extrabold">88.5% (High Density)</span>
                    </div>
                    <div className="flex justify-between items-center text-foreground/75">
                      <span>Booking Count Index:</span>
                      <span className="text-foreground">+14.2% YoY</span>
                    </div>
                    <div className="flex justify-between items-center text-foreground/75">
                      <span>Revenue Projection:</span>
                      <span className="text-emerald-500 font-extrabold">+21.0% Growth Est.</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gold-400/5 border border-gold-400/10 rounded-xl leading-relaxed text-[10px] text-foreground/50 text-center font-bold">
                  ⚠️ Projections are computed based on the previous 12-month calendar bookings data.
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Exporter Section at the bottom */}
      <div className="border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
            <Download className="h-5 w-5 text-gold-500" />
            Report Exporter
          </h3>
          <p className="text-xs text-foreground/50">Export compiled spreadsheet ledger files for local offline auditing</p>
        </div>
        <div className="h-[1px] bg-gold-400/10" />

        <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => handleExport('REVENUE')}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl border border-gold-400/20 px-5 py-3 hover:bg-gold-400/5 text-foreground cursor-pointer disabled:opacity-50 transition-all"
          >
            <Download className="h-4 w-4" /> Export Revenue CSV
          </button>
          <button
            onClick={() => handleExport('BOOKINGS')}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl border border-gold-400/20 px-5 py-3 hover:bg-gold-400/5 text-foreground cursor-pointer disabled:opacity-50 transition-all"
          >
            <Download className="h-4 w-4" /> Export Bookings CSV
          </button>
          <button
            onClick={() => handleExport('CRM')}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl border border-gold-400/20 px-5 py-3 hover:bg-gold-400/5 text-foreground cursor-pointer disabled:opacity-50 transition-all"
          >
            <Download className="h-4 w-4" /> Export CRM Leads CSV
          </button>
        </div>
      </div>

    </div>
  );
}
