import { useState } from 'react';
import {
  DollarSign, TrendingUp, Calendar, ExternalLink, FileText, ChevronRight,
  Download, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Clock,
  CheckCircle, AlertTriangle, AlertCircle, CreditCard, Layers, FileSpreadsheet,
  Receipt, Users, Wallet, Activity, Plus, Eye, Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router';

type FinanceTab = 'overview' | 'deposits' | 'reports';

// ─── Mock deposit data ────────────────────────────────────────────────────────
const mockDeposits = [
  { id: 'd1', client: 'The Grand Ballroom', event: 'Spring Gala 2026', depositAmount: 1750, totalAmount: 3500, depositDue: '2026-03-28', depositPaid: false, balanceDue: '2026-04-10' },
  { id: 'd2', client: 'Eclipse Nightclub', event: 'Friday Residency April', depositAmount: 750, totalAmount: 1500, depositDue: '2026-03-22', depositPaid: true, depositPaidDate: '2026-03-20', balanceDue: '2026-04-05' },
  { id: 'd3', client: 'Harbour View Events', event: 'Corporate Dinner', depositAmount: 500, totalAmount: 2200, depositDue: '2026-03-15', depositPaid: true, depositPaidDate: '2026-03-14', balancePaid: false, balanceDue: '2026-03-30' },
];

const mockPayouts = [
  { id: 'p1', event: 'Friday Residency March', gross: 1500, platformFee: 75, artistNet: 1425, status: 'completed', date: '2026-03-15' },
  { id: 'p2', event: 'Private Event DJ Set', gross: 800, platformFee: 40, artistNet: 760, status: 'completed', date: '2026-03-10' },
  { id: 'p3', event: 'Festival Performance', gross: 4500, platformFee: 225, agentShare: 450, artistNet: 3825, status: 'pending', date: '2026-04-02' },
];

const mockReportPeriods = [
  { id: 'r1', label: 'Q1 2026 (Jan–Mar)', revenue: 48505, gst: 4850.50, jobs: 12, exported: false },
  { id: 'r2', label: 'Q4 2025 (Oct–Dec)', revenue: 52000, gst: 5200, jobs: 14, exported: true, exportedDate: '2026-01-15' },
  { id: 'r3', label: 'Q3 2025 (Jul–Sep)', revenue: 41000, gst: 4100, jobs: 10, exported: true, exportedDate: '2025-10-14' },
  { id: 'r4', label: 'Q2 2025 (Apr–Jun)', revenue: 38500, gst: 3850, jobs: 9, exported: true, exportedDate: '2025-07-12' },
];

// ─── Reusable metric card ─────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, color, bg, trend }: any) {
  return (
    <div className={`p-5 rounded-2xl border ${bg}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wide ${color}`}>{label}</span>
      </div>
      <div className={`text-2xl font-bold mb-1 ${color}`}>{value}</div>
      {sub && <div className={`text-xs ${color} opacity-70`}>{sub}</div>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {Math.abs(trend)}% vs last quarter
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ jobs, bankDetails, navigate }: any) {
  const [earningsPeriod, setEarningsPeriod] = useState('last-90-days');

  const paidJobs = jobs.filter((j: any) => j.status === 'paid');
  const upcomingJobs = jobs.filter((j: any) => j.status === 'upcoming');
  const invoicedJobs = jobs.filter((j: any) => j.status === 'invoice-sent');

  const calcJobTotal = (job: any) => {
    const sub = job.lineItems.reduce((s: number, i: any) => s + i.unitCost * i.quantity, 0);
    return sub - sub * (job.discountPercent / 100);
  };

  const totalEarnings = paidJobs.reduce((s: number, j: any) => s + calcJobTotal(j), 0);
  const forecast = upcomingJobs.reduce((s: number, j: any) => s + calcJobTotal(j), 0);
  const outstanding = invoicedJobs.reduce((s: number, j: any) => s + calcJobTotal(j), 0);
  const estimatedGST = totalEarnings * 0.1;

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#7A7F8C] font-medium">Period:</span>
        
        {/* Desktop: Horizontal buttons (hidden on mobile) */}
        <div className="hidden md:flex gap-2">
          {['last-30-days', 'last-90-days', 'this-year'].map(p => (
            <button key={p} onClick={() => setEarningsPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${earningsPeriod === p ? 'bg-[#7A42E8] text-white' : 'bg-white border border-[#DDDCE7] text-[#4F5868] hover:border-[#7A42E8]'}`}>
              {p === 'last-30-days' ? 'Last 30 Days' : p === 'last-90-days' ? 'Last 90 Days' : 'This Year'}
            </button>
          ))}
        </div>

        {/* Mobile: Dropdown (shown only on mobile) */}
        <select
          value={earningsPeriod}
          onChange={(e) => setEarningsPeriod(e.target.value)}
          className="md:hidden flex-1 px-4 py-2.5 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none bg-white text-sm font-semibold text-[#1F2430]"
        >
          <option value="last-30-days">Last 30 Days</option>
          <option value="last-90-days">Last 90 Days</option>
          <option value="this-year">This Year</option>
        </select>
      </div>

      {/* Key metric cards */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={DollarSign} label="Total Earned" value={`$${totalEarnings.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`} sub={`${paidJobs.length} paid jobs`} color="text-[#7A42E8]" bg="bg-gradient-to-br from-[#F4EEFD] to-[#E3DBF9] border-[#DDDCE7]" trend={8.2} />
        <MetricCard icon={TrendingUp} label="Forecast" value={`$${forecast.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`} sub={`${upcomingJobs.length} upcoming`} color="text-blue-700" bg="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200" />
        <MetricCard icon={Clock} label="Outstanding" value={`$${outstanding.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`} sub={`${invoicedJobs.length} invoices sent`} color="text-amber-700" bg="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" />
        <MetricCard icon={Receipt} label="GST Collected" value={`$${estimatedGST.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`} sub="Estimated this period" color="text-green-700" bg="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" />
      </div>

      {/* Earnings detail + Forecast */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Earnings */}
        <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#1F2430]">Recent Earnings</h2>
            <span className="text-sm text-[#7A42E8] font-medium">View all</span>
          </div>
          {paidJobs.length > 0 ? (
            <div className="space-y-3">
              {paidJobs.slice(0, 5).map((job: any) => {
                const amount = calcJobTotal(job);
                return (
                  <div key={job.id} className="flex items-center justify-between py-2 border-b border-[#F8F9FB] last:border-0">
                    <div>
                      <div className="font-medium text-[#1F2430] text-sm">{job.title}</div>
                      <div className="text-xs text-[#7A7F8C]">{new Date(job.startDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#1F2430]">${amount.toFixed(2)}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">Paid</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-10 h-10 text-[#DDDCE7] mx-auto mb-3" />
              <p className="text-sm text-[#7A7F8C]">No earnings yet</p>
            </div>
          )}
        </div>

        {/* Forecast */}
        <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#1F2430]">Upcoming Revenue</h2>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          {upcomingJobs.length > 0 ? (
            <div className="space-y-3">
              {upcomingJobs.slice(0, 5).map((job: any) => {
                const amount = calcJobTotal(job);
                return (
                  <div key={job.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F4EEFD]">
                    <Calendar className="w-5 h-5 text-[#7A42E8] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#1F2430] text-sm truncate">{job.title}</div>
                      <div className="text-xs text-[#7A7F8C]">{new Date(job.startDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className="font-bold text-[#7A42E8]">${amount.toFixed(0)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-10 h-10 text-[#DDDCE7] mx-auto mb-3" />
              <p className="text-sm text-[#7A7F8C]">No upcoming jobs scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* Tax Centre entry */}
      <button
        onClick={() => navigate('/app/tax-centre')}
        className="w-full p-5 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:border-green-400 transition-all flex items-center gap-4 group"
      >
        <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
          <FileText className="w-7 h-7 text-green-600" />
        </div>
        <div className="flex-1 text-left">
          <div className="font-bold text-green-900 mb-1">Tax Centre</div>
          <div className="text-sm text-green-700">Manage GST, track BAS readiness, export ATO reports — stay on top of GST without spreadsheet chaos.</div>
        </div>
        <ChevronRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Stripe */}
      <div className="bg-gradient-to-br from-[#F4EEFD] to-[#E3DBF9] rounded-3xl p-6 border border-[#DDDCE7]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2430] mb-1">Stripe Dashboard</h2>
            <p className="text-[#4F5868] text-sm">
              {bankDetails.stripeConnected
                ? 'View detailed payment analytics, manage payouts, and access your full Stripe dashboard.'
                : 'Connect Stripe to accept card payments and access advanced analytics.'}
            </p>
          </div>
          {bankDetails.stripeConnected ? (
            <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-white border-2 border-[#7A42E8] text-[#7A42E8] font-semibold hover:bg-[#F4EEFD] transition-colors flex items-center gap-2 flex-shrink-0">
              Open Dashboard <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all flex-shrink-0">
              Connect Stripe
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Deposits & Payouts Tab ───────────────────────────────────────────────────
function DepositsTab() {
  const [subView, setSubView] = useState<'deposits' | 'payouts'>('deposits');
  const [showDepositModal, setShowDepositModal] = useState(false);

  const pendingDeposits = mockDeposits.filter(d => !d.depositPaid);
  const paidDeposits = mockDeposits.filter(d => d.depositPaid);
  const totalPendingDeposits = pendingDeposits.reduce((s, d) => s + d.depositAmount, 0);
  const totalPaidDeposits = paidDeposits.reduce((s, d) => s + d.depositAmount, 0);
  const totalPayouts = mockPayouts.filter(p => p.status === 'completed').reduce((s, p) => s + (p as any).artistNet, 0);

  return (
    <div className="space-y-6">
      {/* Sub-view toggle */}
      <div className="flex gap-2 bg-[#F8F9FB] p-1 rounded-xl w-fit">
        <button onClick={() => setSubView('deposits')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${subView === 'deposits' ? 'bg-white shadow-sm text-[#1F2430]' : 'text-[#7A7F8C]'}`}>
          Deposits
        </button>
        <button onClick={() => setSubView('payouts')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${subView === 'payouts' ? 'bg-white shadow-sm text-[#1F2430]' : 'text-[#7A7F8C]'}`}>
          Payouts
        </button>
      </div>

      {subView === 'deposits' && (
        <>
          {/* Summary metrics */}
          <div className="flex flex-col gap-4 max-w-md">
            <MetricCard icon={Clock} label="Awaiting Deposit" value={`$${totalPendingDeposits.toLocaleString('en-AU')}`} sub={`${pendingDeposits.length} clients`} color="text-amber-700" bg="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" />
            <MetricCard icon={CheckCircle} label="Deposits Received" value={`$${totalPaidDeposits.toLocaleString('en-AU')}`} sub={`${paidDeposits.length} confirmed`} color="text-green-700" bg="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" />
            <MetricCard icon={Wallet} label="Balance Outstanding" value="$1,700" sub="3 final invoices" color="text-blue-700" bg="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200" />
          </div>

          {/* Deposit list */}
          <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#1F2430] text-lg">All Deposits</h3>
              <button onClick={() => setShowDepositModal(true)}
                className="flex items-center justify-center gap-2 w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full sm:rounded-xl bg-[#7A42E8] text-white text-sm font-semibold hover:bg-[#6816B0] transition-colors">
                <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">New Deposit Request</span>
              </button>
            </div>
            <div className="space-y-4">
              {mockDeposits.map(dep => (
                <div key={dep.id} className="p-5 rounded-2xl border border-[#DDDCE7] hover:border-[#8F6EE6] transition-all">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F4EEFD] flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-5 h-5 text-[#7A42E8]" />
                        </div>
                        <div>
                          <div className="font-bold text-[#1F2430]">{dep.event}</div>
                          <div className="text-sm text-[#7A7F8C]">{dep.client}</div>
                        </div>
                      </div>

                      {/* Payment split bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-[#7A7F8C] mb-1">
                          <span>Payment Progress</span>
                          <span>${dep.depositPaid ? dep.depositAmount : 0} / ${dep.totalAmount}</span>
                        </div>
                        <div className="h-2.5 bg-[#F8F9FB] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${dep.depositPaid ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-[#DDDCE7]'}`}
                            style={{ width: dep.depositPaid ? `${(dep.depositAmount / dep.totalAmount) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>

                      {/* Phase badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${dep.depositPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {dep.depositPaid ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          Deposit {dep.depositPaid ? `Paid ${new Date(dep.depositPaidDate!).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}` : `Due ${new Date(dep.depositDue).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${(dep as any).balancePaid ? 'bg-green-100 text-green-700' : 'bg-[#F4EEFD] text-[#7A42E8]'}`}>
                          <Clock className="w-3 h-3" />
                          Balance Due {new Date(dep.balanceDue).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#1F2430]">${dep.depositAmount.toLocaleString()}</div>
                        <div className="text-xs text-[#7A7F8C]">of ${dep.totalAmount.toLocaleString()} total</div>
                      </div>
                      {!dep.depositPaid && (
                        <button className="px-4 py-2 rounded-xl bg-[#7A42E8] text-white text-sm font-semibold hover:bg-[#6816B0] transition-colors flex items-center gap-2">
                          <Send className="w-3.5 h-3.5" /> Send Reminder
                        </button>
                      )}
                      {dep.depositPaid && !(dep as any).balancePaid && (
                        <button className="px-4 py-2 rounded-xl border border-[#7A42E8] text-[#7A42E8] text-sm font-semibold hover:bg-[#F4EEFD] transition-colors">
                          Send Balance Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Default deposit policy */}
          <div className="p-5 rounded-2xl bg-[#F4EEFD] border border-[#E3DBF9]">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#7A42E8] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[#1F2430] mb-1">Default Deposit Policy</div>
                <div className="text-sm text-[#4F5868]">Currently set to 50% deposit on all new bookings. Deposit received confirms the booking commercially.</div>
                <button className="mt-2 text-sm text-[#7A42E8] font-semibold hover:underline">Edit Policy</button>
              </div>
            </div>
          </div>
        </>
      )}

      {subView === 'payouts' && (
        <>
          {/* Payout metrics */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard icon={Wallet} label="Total Net Payouts" value={`$${totalPayouts.toLocaleString('en-AU')}`} sub="Completed this year" color="text-[#7A42E8]" bg="bg-gradient-to-br from-[#F4EEFD] to-[#E3DBF9] border-[#DDDCE7]" />
            <MetricCard icon={Activity} label="Pending Payouts" value="$3,825" sub="1 upcoming job" color="text-amber-700" bg="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" />
          </div>

          {/* Payout list */}
          <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#1F2430] text-lg">Payout History</h3>
              <button className="flex items-center gap-2 text-sm text-[#7A42E8] font-semibold hover:underline">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
            <div className="space-y-4">
              {mockPayouts.map(payout => (
                <div key={payout.id} className="p-5 rounded-2xl border border-[#DDDCE7]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-[#1F2430]">{payout.event}</div>
                      <div className="text-sm text-[#7A7F8C]">{new Date(payout.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${payout.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {payout.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </div>

                  {/* Payout waterfall */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#7A7F8C]">Gross Amount</span>
                      <span className="font-semibold text-[#1F2430]">${payout.gross.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#7A7F8C]">Platform Fee (5%)</span>
                      <span className="font-semibold text-red-600">−${payout.platformFee}</span>
                    </div>
                    {(payout as any).agentShare && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#7A7F8C]">Agent Share (10%)</span>
                        <span className="font-semibold text-red-600">−${(payout as any).agentShare}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm border-t border-[#DDDCE7] pt-2">
                      <span className="font-bold text-[#1F2430]">Your Net</span>
                      <span className="font-bold text-[#7A42E8] text-lg">${payout.artistNet.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Deposit setup modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDepositModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-[#1F2430] mb-6">New Deposit Request</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Linked Job</label>
                <select className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none">
                  <option>Select a job...</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Deposit Type</label>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 rounded-xl border-2 border-[#7A42E8] bg-[#F4EEFD] text-[#7A42E8] font-semibold text-sm">
                    Percentage
                  </button>
                  <button className="flex-1 py-3 rounded-xl border-2 border-[#DDDCE7] text-[#4F5868] font-semibold text-sm">
                    Fixed Amount
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Deposit Percentage</label>
                <div className="relative">
                  <input type="number" placeholder="50" defaultValue="50"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A7F8C] font-semibold">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Deposit Due Date</label>
                <input type="date" className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDepositModal(false)} className="flex-1 py-3 rounded-xl border-2 border-[#DDDCE7] font-semibold text-[#4F5868]">Cancel</button>
              <button onClick={() => setShowDepositModal(false)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold">Send Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reports Tab ──────────────────────────────────────────────────────────────
function ReportsTab({ navigate }: any) {
  const [accountingBasis, setAccountingBasis] = useState<'cash' | 'accrual'>('cash');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPeriod, setExportPeriod] = useState('Q1 2026');

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2 bg-[#F8F9FB] p-1 rounded-xl">
          <button onClick={() => setAccountingBasis('cash')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${accountingBasis === 'cash' ? 'bg-white shadow-sm text-[#1F2430]' : 'text-[#7A7F8C]'}`}>
            Cash Basis
          </button>
          <button onClick={() => setAccountingBasis('accrual')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${accountingBasis === 'accrual' ? 'bg-white shadow-sm text-[#1F2430]' : 'text-[#7A7F8C]'}`}>
            Accrual Basis
          </button>
        </div>
        <button onClick={() => navigate('/app/tax-centre')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DDDCE7] text-[#4F5868] text-sm font-semibold hover:border-[#7A42E8] hover:text-[#7A42E8] transition-colors">
          <FileText className="w-4 h-4" /> Open Tax Centre
        </button>
      </div>

      {/* Annual summary */}
      <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#1F2430] text-lg">Annual Summary 2025–2026</h3>
          <span className="text-xs text-[#7A7F8C]">{accountingBasis === 'cash' ? 'Cash basis' : 'Accrual basis'}</span>
        </div>
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          {[
            { l: 'Total Revenue', v: '$180,005', change: '+12%' },
            { l: 'GST Collected', v: '$18,000', change: '+12%' },
            { l: 'GST-Free Revenue', v: '$4,500', change: '+5%' },
            { l: 'Net Revenue (ex GST)', v: '$162,005', change: '+12%' },
          ].map(m => (
            <div key={m.l} className="p-4 rounded-xl bg-[#F8F9FB]">
              <div className="text-xs text-[#7A7F8C] mb-1">{m.l}</div>
              <div className="font-bold text-xl text-[#1F2430]">{m.v}</div>
              <div className="text-xs text-green-600 font-semibold mt-1">{m.change} vs prior year</div>
            </div>
          ))}
        </div>
        <button onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all">
          <Download className="w-4 h-4" /> Export Annual Report
        </button>
      </div>

      {/* Period reports */}
      <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6">
        <h3 className="font-bold text-[#1F2430] text-lg mb-5">Quarterly Reports</h3>
        <div className="space-y-3">
          {mockReportPeriods.map(rp => (
            <div key={rp.id} className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl border border-[#DDDCE7] hover:border-[#8F6EE6] transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#F4EEFD] flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-[#7A42E8]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1F2430]">{rp.label}</div>
                    <div className="text-xs text-[#7A7F8C]">{rp.jobs} jobs</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div><span className="text-[#7A7F8C]">Revenue:</span> <span className="font-semibold text-[#1F2430]">${rp.revenue.toLocaleString()}</span></div>
                  <div><span className="text-[#7A7F8C]">GST:</span> <span className="font-semibold text-[#1F2430]">${rp.gst.toLocaleString()}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {rp.exported && (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    Exported {new Date(rp.exportedDate!).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </span>
                )}
                <button onClick={() => { setExportPeriod(rp.label); setShowExportModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#DDDCE7] text-[#4F5868] text-sm font-semibold hover:border-[#7A42E8] hover:text-[#7A42E8] transition-colors">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick export shortcuts */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: FileSpreadsheet, label: 'BAS Package', sub: 'Complete ATO submission package', color: 'text-green-600', bg: 'bg-green-50' },
          { icon: FileText, label: 'PDF Summary', sub: 'Clean formatted income report', color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Download, label: 'Transaction CSV', sub: 'All transactions with GST detail', color: 'text-[#7A42E8]', bg: 'bg-[#F4EEFD]' },
        ].map(ex => (
          <button key={ex.label} onClick={() => setShowExportModal(true)}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#DDDCE7] hover:border-[#8F6EE6] transition-all text-left group">
            <div className={`w-12 h-12 rounded-xl ${ex.bg} flex items-center justify-center flex-shrink-0`}>
              <ex.icon className={`w-6 h-6 ${ex.color}`} />
            </div>
            <div>
              <div className="font-semibold text-[#1F2430]">{ex.label}</div>
              <div className="text-xs text-[#7A7F8C]">{ex.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Export modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowExportModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-[#1F2430] mb-2">Export Report</h2>
            <p className="text-[#7A7F8C] text-sm mb-6">Configure and download your tax report</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Period</label>
                <select value={exportPeriod} onChange={e => setExportPeriod(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none">
                  {mockReportPeriods.map(r => <option key={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {['BAS Package', 'PDF Report', 'CSV'].map(fmt => (
                    <button key={fmt} className="py-3 rounded-xl border-2 border-[#DDDCE7] text-sm font-semibold text-[#4F5868] hover:border-[#7A42E8] hover:text-[#7A42E8] transition-colors">
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Accounting Basis</label>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 rounded-xl border-2 border-[#7A42E8] bg-[#F4EEFD] text-[#7A42E8] text-sm font-semibold">Cash</button>
                  <button className="flex-1 py-3 rounded-xl border-2 border-[#DDDCE7] text-[#4F5868] text-sm font-semibold">Accrual</button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowExportModal(false)} className="flex-1 py-3 rounded-xl border-2 border-[#DDDCE7] font-semibold text-[#4F5868]">Cancel</button>
              <button onClick={() => { setShowExportModal(false); }} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Finance component ───────────────────────────────────────────────────
export function Finance() {
  const navigate = useNavigate();
  const { jobs, bankDetails } = useApp();
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');

  const tabs: { id: FinanceTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'deposits', label: 'Deposits & Payouts', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 md:p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1F2430]">Finance</h1>
            <p className="text-sm text-[#7A7F8C]">Track earnings, deposits, GST, and payouts</p>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 bg-white border border-[#DDDCE7] rounded-2xl p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white shadow-md'
                    : 'text-[#7A7F8C] hover:text-[#1F2430] hover:bg-[#F8F9FB]'
                }`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && <OverviewTab jobs={jobs} bankDetails={bankDetails} navigate={navigate} />}
        {activeTab === 'deposits' && <DepositsTab />}
        {activeTab === 'reports' && <ReportsTab navigate={navigate} />}
      </div>
    </div>
  );
}