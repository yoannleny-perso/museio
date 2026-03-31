import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, CheckCircle, AlertTriangle, Download, Settings, TrendingUp,
  DollarSign, Calendar, AlertCircle, ChevronRight, Filter, FileSpreadsheet,
  ArrowLeft, X, Plus, Check, ChevronDown, ChevronUp, Zap, Shield,
  BarChart3, PieChart, Clock, RefreshCw,
} from 'lucide-react';
import type { TaxSettings, TaxPeriodReport, TaxTransaction, GSTHealthScore } from '../../types';

type TaxView = 'dashboard' | 'setup-wizard' | 'classify' | 'export';

// ─── Classification pill ──────────────────────────────────────────────────────
function ClassificationPill({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = [
    { id: 'taxable', label: 'Taxable', color: 'bg-green-100 text-green-700 border-green-300' },
    { id: 'gst-free', label: 'GST-Free', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { id: 'out-of-scope', label: 'Out of Scope', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { id: 'needs-review', label: 'Needs Review', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${value === o.id ? o.color + ' border-2' : 'bg-[#F8F9FB] text-[#7A7F8C] border-[#DDDCE7]'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Reconciliation badge ─────────────────────────────────────────────────────
function ReconciliationBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; bg: string; text: string }> = {
    matched: { label: 'Synced', bg: 'bg-green-100', text: 'text-green-700' },
    partial: { label: 'Partial', bg: 'bg-amber-100', text: 'text-amber-700' },
    manual: { label: 'Manual', bg: 'bg-blue-100', text: 'text-blue-700' },
  };
  const s = cfg[status] ?? cfg.manual;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>;
}

// ─── GST Setup Wizard ─────────────────────────────────────────────────────────
function GSTSetupWizard({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [abn, setAbn] = useState('');
  const [regDate, setRegDate] = useState('');
  const [cadence, setCadence] = useState('quarterly');
  const [basis, setBasis] = useState('cash');

  const steps = ['ABN & Registration', 'Reporting Setup', 'Defaults', 'Confirm'];

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-[#7A42E8] font-semibold mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Tax Centre
      </button>

      <div className="bg-white rounded-3xl border border-[#DDDCE7] p-8">
        <h2 className="text-2xl font-bold text-[#1F2430] mb-2">GST Setup Wizard</h2>
        <p className="text-[#7A7F8C] mb-6">Get set up in under 2 minutes</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'bg-[#7A42E8] text-white' : 'bg-[#F8F9FB] text-[#7A7F8C] border border-[#DDDCE7]'
              }`}>
                {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${i + 1 < step ? 'bg-green-500' : 'bg-[#DDDCE7]'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <h3 className="font-bold text-[#1F2430]">ABN & GST Registration</h3>
            <div>
              <label className="block text-sm font-medium text-[#1F2430] mb-2">ABN <span className="text-[#7A42E8]">*</span></label>
              <input type="text" value={abn} onChange={e => setAbn(e.target.value)} placeholder="12 345 678 901"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none" />
              <p className="text-xs text-[#7A7F8C] mt-1">Your 11-digit Australian Business Number</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2430] mb-2">GST Registration Date</label>
              <input type="date" value={regDate} onChange={e => setRegDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none" />
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700">You're required to register for GST if your annual turnover is $75,000 or more.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="font-bold text-[#1F2430]">Reporting Setup</h3>
            <div>
              <label className="block text-sm font-medium text-[#1F2430] mb-3">Reporting Cadence</label>
              <div className="space-y-2">
                {['monthly', 'quarterly', 'annual'].map(c => (
                  <button key={c} onClick={() => setCadence(c)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${cadence === c ? 'border-[#7A42E8] bg-[#F4EEFD]' : 'border-[#DDDCE7] hover:border-[#8F6EE6]'}`}>
                    <div className="text-left">
                      <div className="font-semibold text-[#1F2430] capitalize">{c}</div>
                      <div className="text-xs text-[#7A7F8C]">
                        {c === 'monthly' ? 'Report and pay monthly — best for high turnover' : c === 'quarterly' ? 'Most common for freelancers — report every 3 months' : 'Annual reporting for smaller businesses'}
                      </div>
                    </div>
                    {cadence === c && <Check className="w-5 h-5 text-[#7A42E8]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="font-bold text-[#1F2430]">Default Settings</h3>
            <div>
              <label className="block text-sm font-medium text-[#1F2430] mb-3">Accounting Basis</label>
              <div className="flex gap-3">
                {['cash', 'accrual'].map(b => (
                  <button key={b} onClick={() => setBasis(b)}
                    className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm capitalize transition-all ${basis === b ? 'border-[#7A42E8] bg-[#F4EEFD] text-[#7A42E8]' : 'border-[#DDDCE7] text-[#4F5868]'}`}>
                    {b} basis
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#7A7F8C] mt-2">
                {basis === 'cash' ? 'Cash basis: report GST when you receive/pay — most common for freelancers.' : 'Accrual basis: report GST when invoiced, regardless of payment date.'}
              </p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-[#DDDCE7]">
              <div>
                <div className="font-medium text-[#1F2430]">Tax Reserve Tracker</div>
                <div className="text-xs text-[#7A7F8C]">Get reminders to set aside GST liability</div>
              </div>
              <div className="w-10 h-6 rounded-full bg-[#7A42E8] relative">
                <div className="absolute top-1 left-5 w-4 h-4 rounded-full bg-white" />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h3 className="font-bold text-[#1F2430]">Confirm Your Setup</h3>
            <div className="space-y-3">
              {[
                { label: 'ABN', value: abn || '12 345 678 901' },
                { label: 'Registration Date', value: regDate || 'Not set' },
                { label: 'Reporting Cadence', value: cadence.charAt(0).toUpperCase() + cadence.slice(1) },
                { label: 'Accounting Basis', value: basis.charAt(0).toUpperCase() + basis.slice(1) + ' Basis' },
              ].map(r => (
                <div key={r.label} className="flex justify-between p-4 rounded-xl bg-[#F8F9FB]">
                  <span className="text-sm text-[#7A7F8C]">{r.label}</span>
                  <span className="text-sm font-semibold text-[#1F2430]">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">Your GST settings will apply to all new invoices and quotes created from today.</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-xl border-2 border-[#DDDCE7] font-semibold text-[#4F5868]">
              Back
            </button>
          )}
          <button
            onClick={() => step < 4 ? setStep(step + 1) : onComplete()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all">
            {step === 4 ? 'Complete Setup' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main TaxCentre ───────────────────────────────────────────────────────────
export function TaxCentre() {
  const navigate = useNavigate();
  const [view, setView] = useState<TaxView>('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [accountingBasis, setAccountingBasis] = useState<'cash' | 'accrual'>('cash');

  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    gstRegistered: true,
    abn: '12 345 678 901',
    gstRegistrationDate: '2024-01-01',
    reportingCadence: 'quarterly',
    defaultTaxMode: 'cash',
    taxReserveEnabled: true,
  });

  const healthScore: GSTHealthScore = {
    score: 85,
    readinessLevel: 'ready',
    unclassifiedTransactions: 3,
    missingABN: false,
    conflictingGSTModes: 0,
  };

  const currentPeriod: TaxPeriodReport = {
    id: '1',
    periodStart: '2026-01-01',
    periodEnd: '2026-03-31',
    gstCollected: 4850.50,
    gstPayable: 4850.50,
    gstFreeRevenue: 2500,
    taxableRevenue: 48505,
    adjustments: 0,
    reconciliationStatus: 'matched',
    exported: false,
  };

  const previousPeriods: TaxPeriodReport[] = [
    { id: '2', periodStart: '2025-10-01', periodEnd: '2025-12-31', gstCollected: 5200, gstPayable: 5200, gstFreeRevenue: 1000, taxableRevenue: 52000, adjustments: 0, reconciliationStatus: 'matched', exported: true, exportedDate: '2026-01-15' },
    { id: '3', periodStart: '2025-07-01', periodEnd: '2025-09-30', gstCollected: 4100, gstPayable: 4100, gstFreeRevenue: 500, taxableRevenue: 41000, adjustments: 0, reconciliationStatus: 'matched', exported: true, exportedDate: '2025-10-14' },
    { id: '4', periodStart: '2025-04-01', periodEnd: '2025-06-30', gstCollected: 3850, gstPayable: 3850, gstFreeRevenue: 300, taxableRevenue: 38500, adjustments: -200, reconciliationStatus: 'partial', exported: true, exportedDate: '2025-07-12' },
  ];

  const [transactions, setTransactions] = useState<TaxTransaction[]>([
    { id: '1', date: '2026-03-15', description: 'Festival Performance – Cash Payment', amount: 1500, gstAmount: 0, classification: 'needs-review', jobId: 'job-123' },
    { id: '2', date: '2026-03-10', description: 'DJ Set – Private Event', amount: 800, gstAmount: 0, classification: 'needs-review' },
    { id: '3', date: '2026-02-28', description: 'Equipment Rental Recovery', amount: 350, gstAmount: 0, classification: 'needs-review' },
  ]);

  // ── Not registered empty state ─────────────────────────────────────────────
  if (!taxSettings.gstRegistered) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] p-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate('/app/finance')} className="flex items-center gap-2 text-[#7A42E8] font-semibold mb-6 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Finance
          </button>
          <div className="text-center py-16 bg-white rounded-3xl border border-[#DDDCE7] px-8">
            <div className="w-24 h-24 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-[#7A42E8]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1F2430] mb-3">Set Up Tax Centre</h2>
            <p className="text-[#7A7F8C] mb-2 max-w-md mx-auto">
              Stay on top of GST without spreadsheet chaos. Set up your ABN and GST details to unlock BAS reporting, transaction classification, and ATO-ready exports.
            </p>
            <p className="text-sm text-[#7A7F8C] mb-8">Required if your annual turnover exceeds $75,000.</p>
            <button onClick={() => { setView('setup-wizard'); setTaxSettings(s => ({ ...s, gstRegistered: true })); }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all">
              Set Up GST →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Setup wizard ───────────────────────────────────────────────────────────
  if (view === 'setup-wizard') {
    return (
      <div className="min-h-screen bg-[#F8F9FB] p-6 pb-24">
        <GSTSetupWizard onComplete={() => setView('dashboard')} onBack={() => setView('dashboard')} />
      </div>
    );
  }

  // ── Classify transactions ──────────────────────────────────────────────────
  if (view === 'classify') {
    const unclassified = transactions.filter(t => t.classification === 'needs-review');
    return (
      <div className="min-h-screen bg-[#F8F9FB] p-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-[#7A42E8] font-semibold mb-6 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Tax Centre
          </button>
          <h1 className="text-2xl font-bold text-[#1F2430] mb-2">Classify Transactions</h1>
          <p className="text-[#7A7F8C] mb-6">{unclassified.length} transactions need a GST classification before your BAS can be submitted.</p>
          <div className="space-y-4">
            {transactions.map(tx => (
              <div key={tx.id} className="bg-white rounded-2xl border border-[#DDDCE7] p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="font-semibold text-[#1F2430]">{tx.description}</div>
                    <div className="text-sm text-[#7A7F8C]">
                      {new Date(tx.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })} · ${tx.amount.toLocaleString()}
                    </div>
                  </div>
                  {tx.classification !== 'needs-review' && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
                <ClassificationPill
                  value={tx.classification}
                  onChange={v => setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, classification: v as any } : t))}
                />
                {tx.classification === 'taxable' && (
                  <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between">
                    <span className="text-sm text-green-700 font-medium">GST Amount</span>
                    <span className="font-bold text-green-700">${(tx.amount / 11).toFixed(2)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setView('dashboard')}
            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all">
            Save Classifications
          </button>
        </div>
      </div>
    );
  }

  // ── Main dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 md:p-6 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => navigate('/app/finance')} className="flex items-center gap-2 text-[#7A42E8] font-semibold mb-1 hover:underline text-sm">
              <ArrowLeft className="w-4 h-4" /> Finance
            </button>
            <h1 className="text-2xl font-bold text-[#1F2430]">Tax Centre</h1>
            <p className="text-sm text-[#7A7F8C]">GST management & ATO reporting</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white text-sm font-semibold hover:shadow-lg transition-all">
              <Download className="w-4 h-4" /> Export BAS
            </button>
            <button onClick={() => setShowSettingsModal(true)}
              className="p-2.5 rounded-xl border border-[#DDDCE7] text-[#4F5868] hover:bg-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* GST Status Banner */}
        <div className="mb-5 p-5 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-bold text-green-900">GST Registered</div>
                <div className="text-sm text-green-700">ABN: {taxSettings.abn} · {taxSettings.reportingCadence} reporting</div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs text-green-600">Next BAS due</div>
              <div className="font-bold text-green-900">28 April 2026</div>
            </div>
          </div>
        </div>

        {/* BAS Health Score */}
        <div className="mb-5 p-5 rounded-2xl bg-white border border-[#DDDCE7]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1F2430]">BAS Readiness Score</h3>
              <p className="text-xs text-[#7A7F8C]">How ready you are for your next BAS submission</p>
            </div>
            <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center flex-shrink-0 ${
              healthScore.score >= 80 ? 'border-green-500' : healthScore.score >= 60 ? 'border-amber-500' : 'border-red-500'
            }`}>
              <span className={`text-xl font-bold ${healthScore.score >= 80 ? 'text-green-600' : healthScore.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                {healthScore.score}
              </span>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2 mb-4">
            {[
              { ok: !healthScore.missingABN, label: 'ABN registered and verified' },
              { ok: healthScore.conflictingGSTModes === 0, label: 'No conflicting GST modes on invoices' },
              { ok: healthScore.unclassifiedTransactions === 0, label: `All transactions classified (${healthScore.unclassifiedTransactions} remaining)` },
              { ok: true, label: 'Reporting cadence configured' },
              { ok: true, label: 'Current period data available' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F9FB]">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.ok ? 'bg-green-100' : 'bg-amber-100'}`}>
                  {item.ok ? <Check className="w-3 h-3 text-green-600" /> : <AlertCircle className="w-3 h-3 text-amber-600" />}
                </div>
                <span className={`text-sm ${item.ok ? 'text-[#4F5868]' : 'text-amber-700 font-medium'}`}>{item.label}</span>
              </div>
            ))}
          </div>

          {healthScore.unclassifiedTransactions > 0 && (
            <button onClick={() => setView('classify')}
              className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" /> Fix {healthScore.unclassifiedTransactions} Unclassified Transactions
            </button>
          )}
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-[#7A7F8C] font-medium">Period:</span>
          <div className="flex gap-2">
            {(['monthly', 'quarterly', 'annual'] as const).map(p => (
              <button key={p} onClick={() => setSelectedPeriod(p)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${selectedPeriod === p ? 'bg-[#7A42E8] text-white' : 'bg-white border border-[#DDDCE7] text-[#4F5868] hover:border-[#7A42E8]'}`}>
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => setAccountingBasis('cash')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${accountingBasis === 'cash' ? 'bg-[#F4EEFD] text-[#7A42E8] border border-[#E3DBF9]' : 'text-[#7A7F8C] hover:bg-[#F8F9FB]'}`}>
              Cash
            </button>
            <button onClick={() => setAccountingBasis('accrual')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${accountingBasis === 'accrual' ? 'bg-[#F4EEFD] text-[#7A42E8] border border-[#E3DBF9]' : 'text-[#7A7F8C] hover:bg-[#F8F9FB]'}`}>
              Accrual
            </button>
          </div>
        </div>

        {/* Current period summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'GST Collected', value: `$${currentPeriod.gstCollected.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, color: 'text-[#7A42E8]', bg: 'bg-gradient-to-br from-[#F4EEFD] to-[#E3DBF9] border-[#DDDCE7]', icon: DollarSign },
            { label: 'Taxable Revenue', value: `$${currentPeriod.taxableRevenue.toLocaleString()}`, color: 'text-blue-700', bg: 'bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200', icon: TrendingUp },
            { label: 'GST-Free Revenue', value: `$${currentPeriod.gstFreeRevenue.toLocaleString()}`, color: 'text-green-700', bg: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200', icon: CheckCircle },
            { label: 'GST Payable', value: `$${currentPeriod.gstPayable.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, color: 'text-amber-700', bg: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200', icon: AlertTriangle },
          ].map(m => (
            <div key={m.label} className={`p-5 rounded-2xl border ${m.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <m.icon className={`w-4 h-4 ${m.color}`} />
                <div className={`text-xs font-semibold ${m.color}`}>{m.label}</div>
              </div>
              <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Smart insight */}
        <div className="mb-5 p-5 rounded-2xl bg-[#F4EEFD] border border-[#E3DBF9]">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-[#7A42E8] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#1F2430] mb-1">Smart Monthly Insight</div>
              <div className="text-sm text-[#4F5868]">
                You collected <strong>${currentPeriod.gstCollected.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</strong> in GST this quarter. 
                Set aside at least <strong>${(currentPeriod.gstPayable * 0.9).toLocaleString('en-AU', { minimumFractionDigits: 2 })}</strong> in your tax wallet before 28 April.
              </div>
            </div>
          </div>
        </div>

        {/* Tax reserve tracker */}
        {taxSettings.taxReserveEnabled && (
          <div className="mb-5 p-5 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-amber-900 mb-1">Tax Reserve</h4>
                <p className="text-sm text-amber-700 mb-3">Reserve ${currentPeriod.gstPayable.toLocaleString('en-AU', { minimumFractionDigits: 2 })} for your upcoming BAS</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-amber-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <span className="text-sm font-bold text-amber-900">75% reserved</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export shortcuts */}
        <div className="mb-5 bg-white rounded-2xl border border-[#DDDCE7] p-5">
          <h3 className="font-bold text-[#1F2430] mb-4">Export Reports</h3>
          <div className="space-y-3">
            {[
              { icon: FileSpreadsheet, label: 'BAS Summary Package', sub: 'Complete report ready for accountant or ATO', onClick: () => setShowExportModal(true) },
              { icon: FileText, label: 'PDF Summary Report', sub: 'Formatted summary with all calculations', onClick: () => setShowExportModal(true) },
              { icon: FileSpreadsheet, label: 'Transaction CSV', sub: 'All transactions with GST classifications', onClick: () => setShowExportModal(true) },
            ].map(e => (
              <button key={e.label} onClick={e.onClick}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-[#DDDCE7] hover:border-[#7A42E8] hover:bg-[#F8F9FB] transition-colors">
                <div className="flex items-center gap-3">
                  <e.icon className="w-5 h-5 text-[#7A42E8]" />
                  <div className="text-left">
                    <div className="font-semibold text-[#1F2430] text-sm">{e.label}</div>
                    <div className="text-xs text-[#7A7F8C]">{e.sub}</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-[#7A7F8C]" />
              </button>
            ))}
          </div>
        </div>

        {/* Unclassified transactions */}
        {transactions.filter(t => t.classification === 'needs-review').length > 0 && (
          <div className="mb-5 bg-white rounded-2xl border border-[#DDDCE7] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1F2430]">Needs Review</h3>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                {transactions.filter(t => t.classification === 'needs-review').length} transactions
              </span>
            </div>
            <div className="space-y-3">
              {transactions.filter(t => t.classification === 'needs-review').map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FB] border border-[#DDDCE7]">
                  <div>
                    <div className="font-medium text-[#1F2430] text-sm">{tx.description}</div>
                    <div className="text-xs text-[#7A7F8C] mt-0.5">
                      {new Date(tx.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} · ${tx.amount.toLocaleString()}
                    </div>
                  </div>
                  <button onClick={() => setView('classify')}
                    className="px-3 py-2 rounded-xl bg-[#7A42E8] text-white text-xs font-semibold hover:bg-[#6816B0] transition-colors">
                    Classify
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous periods */}
        <div className="bg-white rounded-2xl border border-[#DDDCE7] p-5">
          <h3 className="font-bold text-[#1F2430] mb-4">Previous Periods</h3>
          <div className="space-y-3">
            {previousPeriods.map(period => (
              <div key={period.id} className="flex items-center justify-between p-4 rounded-xl border border-[#DDDCE7] hover:border-[#8F6EE6] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F4EEFD] flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-[#7A42E8]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1F2430] text-sm">
                      {new Date(period.periodStart).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })} –{' '}
                      {new Date(period.periodEnd).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-[#7A7F8C]">
                      GST: ${period.gstCollected.toLocaleString()} · Revenue: ${period.taxableRevenue.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ReconciliationBadge status={period.reconciliationStatus} />
                  {period.exported && (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Exported</span>
                  )}
                  <button onClick={() => setShowExportModal(true)} className="p-1.5 hover:bg-[#F8F9FB] rounded-lg">
                    <Download className="w-4 h-4 text-[#7A7F8C]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettingsModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1F2430]">Tax Settings</h2>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 rounded-full hover:bg-[#F8F9FB]">
                <X className="w-5 h-5 text-[#7A7F8C]" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">ABN</label>
                <input type="text" value={taxSettings.abn} onChange={e => setTaxSettings(s => ({ ...s, abn: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Reporting Cadence</label>
                <select value={taxSettings.reportingCadence} onChange={e => setTaxSettings(s => ({ ...s, reportingCadence: e.target.value as any }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#DDDCE7]">
                <div>
                  <div className="font-medium text-[#1F2430]">GST Registered</div>
                  <div className="text-xs text-[#7A7F8C]">Toggle GST on/off for all invoices</div>
                </div>
                <button onClick={() => setTaxSettings(s => ({ ...s, gstRegistered: !s.gstRegistered }))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${taxSettings.gstRegistered ? 'bg-[#7A42E8]' : 'bg-[#DDDCE7]'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${taxSettings.gstRegistered ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#DDDCE7]">
                <div>
                  <div className="font-medium text-[#1F2430]">Tax Reserve Tracker</div>
                  <div className="text-xs text-[#7A7F8C]">Show GST reserve recommendations</div>
                </div>
                <button onClick={() => setTaxSettings(s => ({ ...s, taxReserveEnabled: !s.taxReserveEnabled }))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${taxSettings.taxReserveEnabled ? 'bg-[#7A42E8]' : 'bg-[#DDDCE7]'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${taxSettings.taxReserveEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
            <button onClick={() => setShowSettingsModal(false)}
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold">
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Export modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowExportModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-[#1F2430]">Export BAS Package</h2>
              <button onClick={() => setShowExportModal(false)} className="p-2 rounded-full hover:bg-[#F8F9FB]">
                <X className="w-5 h-5 text-[#7A7F8C]" />
              </button>
            </div>
            <p className="text-sm text-[#7A7F8C] mb-6">Configure your export for ATO submission</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Period</label>
                <select className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none">
                  <option>Q1 2026 (Jan – Mar)</option>
                  <option>Q4 2025 (Oct – Dec)</option>
                  <option>Q3 2025 (Jul – Sep)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {['BAS Package', 'PDF Report', 'CSV'].map(f => (
                    <button key={f} className="py-3 rounded-xl border-2 border-[#DDDCE7] text-sm font-semibold text-[#4F5868] hover:border-[#7A42E8] hover:text-[#7A42E8] transition-colors first:border-[#7A42E8] first:text-[#7A42E8] first:bg-[#F4EEFD]">
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Accounting Basis</label>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 rounded-xl border-2 border-[#7A42E8] bg-[#F4EEFD] text-[#7A42E8] font-semibold text-sm">Cash</button>
                  <button className="flex-1 py-3 rounded-xl border-2 border-[#DDDCE7] text-[#4F5868] font-semibold text-sm">Accrual</button>
                </div>
              </div>
            </div>
            {/* Success preview */}
            <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">BAS package ready — 12 transactions, $4,850.50 GST payable, all items classified.</p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowExportModal(false)} className="flex-1 py-3 rounded-xl border-2 border-[#DDDCE7] font-semibold text-[#4F5868]">Cancel</button>
              <button onClick={() => setShowExportModal(false)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
