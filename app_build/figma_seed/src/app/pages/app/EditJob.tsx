import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  X, Plus, GripVertical, Trash2, ChevronDown, ChevronUp, FileText,
  MessageSquare, Paperclip, Share2, Clock, CheckCircle, AlertTriangle,
  DollarSign, Send, Download, Copy, Link as LinkIcon, Upload,
  Calendar, Users, CreditCard, Wallet, BarChart3, Eye, MoreVertical,
  Check, CheckCheck, AtSign, ArrowRight, Zap, AlertCircle, File,
  Image as ImageIcon, FileSpreadsheet, Layers, ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LineItem } from '../../types';

type JobTab = 'summary' | 'invoice' | 'payments' | 'chat' | 'files' | 'share' | 'timeline';

// ─── Mock extra data ──────────────────────────────────────────────────────────
const mockMessages = [
  { id: 'm1', sender: 'client', content: 'Hi! Really looking forward to the event. Just confirming — does the quote include sound setup?', time: '2026-03-15T10:00:00', read: true },
  { id: 'm2', sender: 'artist', content: "Yes, sound setup is included. I'll bring my own PA system. The quote covers everything end-to-end.", time: '2026-03-15T11:30:00', read: true },
  { id: 'm3', sender: 'system', content: 'Quote sent — $3,500', time: '2026-03-16T09:00:00', systemType: 'quote-sent', read: true },
  { id: 'm4', sender: 'client', content: "Perfect! We'll send the deposit by Friday.", time: '2026-03-17T14:20:00', read: false },
];

const mockAttachments = [
  { id: 'a1', name: 'Stage Plot - April Gala.pdf', size: '245 KB', type: 'pdf', attachmentType: 'stage-plot', includeInEmail: true, uploadDate: '2026-03-15' },
  { id: 'a2', name: 'Tech Rider 2026.pdf', size: '180 KB', type: 'pdf', attachmentType: 'tech-spec', includeInEmail: true, uploadDate: '2026-03-15' },
  { id: 'a3', name: 'Contract Signed.pdf', size: '320 KB', type: 'pdf', attachmentType: 'contract', includeInEmail: false, uploadDate: '2026-03-16' },
];

const mockTimeline = [
  { id: 't1', event: 'Job Created', detail: 'Job created manually', time: '2026-03-10T09:00:00', type: 'created' },
  { id: 't2', event: 'Quote Drafted', detail: 'Line items added — $3,500 total', time: '2026-03-12T14:00:00', type: 'draft' },
  { id: 't3', event: 'Quote Sent', detail: 'Sent to client@grandballroom.com.au', time: '2026-03-16T09:00:00', type: 'sent' },
  { id: 't4', event: 'Invoice Viewed', detail: 'Client opened invoice link', time: '2026-03-17T10:30:00', type: 'viewed' },
  { id: 't5', event: 'Message Received', detail: '"We\'ll send the deposit by Friday"', time: '2026-03-17T14:20:00', type: 'message' },
];

const quickReplies = [
  'Thanks! I\'ll send the updated invoice shortly.',
  'Happy to confirm that detail — let me check.',
  'The deposit link has been resent to your email.',
  'Could you share more details about the event?',
];

// ─── Tab Component ────────────────────────────────────────────────────────────
function TabButton({ id, label, icon: Icon, active, badge, onClick }: any) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all relative ${
        active
          ? 'border-[#7A42E8] text-[#7A42E8]'
          : 'border-transparent text-[#7A7F8C] hover:text-[#1F2430]'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      {badge > 0 && (
        <span className="w-5 h-5 rounded-full bg-[#7A42E8] text-white text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Summary Tab ──────────────────────────────────────────────────────────────
function SummaryTab({ job, clients, title, setTitle, jobNumber, setJobNumber, startDate, setStartDate, endDate, setEndDate, startTime, setStartTime, endTime, setEndTime, selectedClientId, setSelectedClientId, notes, setNotes }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#DDDCE7] p-6 space-y-5">
        <h3 className="font-bold text-[#1F2430]">Job Details</h3>
        <div>
          <label className="block text-sm font-medium text-[#1F2430] mb-2">Job Title <span className="text-[#7A42E8]">*</span></label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1F2430] mb-2">Job Number</label>
          <input type="text" value={jobNumber} onChange={e => setJobNumber(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors" />
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#1F2430] mb-2">Start Date <span className="text-[#7A42E8]">*</span></label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2430] mb-2">End Date <span className="text-[#7A42E8]">*</span></label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#1F2430] mb-2">Start Time <span className="text-[#7A42E8]">*</span></label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2430] mb-2">End Time <span className="text-[#7A42E8]">*</span></label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1F2430] mb-2">Client</label>
          <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none">
            <option value="">No client selected</option>
            {clients.map((c: any) => <option key={c.id} value={c.id}>{c.venueName} – {c.contactName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1F2430] mb-2">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Load-in time, stage requirements, parking, etc."
            className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none resize-none" />
        </div>
      </div>
    </div>
  );
}

// ─── Invoice Tab ──────────────────────────────────────────────────────────────
function InvoiceTab({ lineItems, setLineItems, discountPercent, setDiscountPercent, job }: any) {
  const MAX = 10;
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(lineItems.map((i: any) => i.id)));
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositType, setDepositType] = useState<'percentage' | 'fixed'>('percentage');
  const [depositValue, setDepositValue] = useState(50);
  const [depositEnabled, setDepositEnabled] = useState(false);

  const subtotal = lineItems.reduce((s: number, i: any) => s + i.unitCost * i.quantity, 0);
  const discount = subtotal * (discountPercent / 100);
  const gstItems = lineItems.filter((i: any) => i.taxEnabled);
  const gstBase = gstItems.reduce((s: number, i: any) => s + i.unitCost * i.quantity, 0);
  const gstAmount = gstBase * 0.1;
  const total = subtotal - discount + gstAmount;
  const depositAmount = depositEnabled
    ? depositType === 'percentage' ? total * (depositValue / 100) : depositValue
    : 0;

  const addItem = () => {
    if (lineItems.length >= MAX) return;
    const n: LineItem = { id: String(Date.now()), name: '', unitCost: 0, quantity: 1, taxEnabled: false };
    setLineItems([...lineItems, n]);
    setExpandedItems(new Set([...expandedItems, n.id]));
  };

  const removeItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((i: any) => i.id !== id));
  };

  const updateItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(lineItems.map((i: any) => i.id === id ? { ...i, ...updates } : i));
  };

  const toggleExpand = (id: string) => {
    const s = new Set(expandedItems);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedItems(s);
  };

  return (
    <div className="space-y-6">
      {/* Line items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[#1F2430]">Line Items</h3>
          <span className="text-xs text-[#7A7F8C]">{lineItems.length}/{MAX}</span>
        </div>
        <div className="space-y-3">
          {lineItems.map((item: any, index: number) => {
            const expanded = expandedItems.has(item.id);
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-[#DDDCE7] overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <GripVertical className="w-5 h-5 text-[#A4A9B6] flex-shrink-0" />
                  <button onClick={() => toggleExpand(item.id)} className="flex-1 text-left font-medium text-[#1F2430] text-sm">
                    {item.name || `Line Item ${index + 1}`}
                    {item.unitCost > 0 && <span className="text-[#7A7F8C] ml-2 text-xs">${(item.unitCost * item.quantity).toFixed(2)}</span>}
                  </button>
                  {item.taxEnabled && <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-semibold">GST</span>}
                  <button onClick={() => toggleExpand(item.id)} className="p-1">
                    {expanded ? <ChevronUp className="w-4 h-4 text-[#7A7F8C]" /> : <ChevronDown className="w-4 h-4 text-[#7A7F8C]" />}
                  </button>
                  {lineItems.length > 1 && (
                    <button onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {expanded && (
                  <div className="border-t border-[#DDDCE7] p-4 space-y-4 bg-[#FAFBFD]">
                    <div>
                      <label className="block text-xs font-medium text-[#7A7F8C] mb-1">Item Name</label>
                      <input type="text" value={item.name} onChange={e => updateItem(item.id, { name: e.target.value })}
                        placeholder="Performance fee, Equipment hire..."
                        className="w-full px-3 py-2 rounded-lg border border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#7A7F8C] mb-1">Unit Cost</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7F8C] text-sm">$</span>
                          <input type="number" value={item.unitCost} onChange={e => updateItem(item.id, { unitCost: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#7A7F8C] mb-1">Quantity</label>
                        <input type="number" value={item.quantity} min="1" onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 rounded-lg border border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none text-sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={item.taxEnabled} onChange={e => updateItem(item.id, { taxEnabled: e.target.checked })} className="w-4 h-4 rounded" />
                        <span className="text-sm font-medium text-[#1F2430]">GST Applicable (10%)</span>
                      </label>
                      {item.taxEnabled && (
                        <span className="text-xs text-green-600 font-medium">+${(item.unitCost * item.quantity * 0.1).toFixed(2)} GST</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {lineItems.length < MAX && (
          <button onClick={addItem}
            className="w-full mt-3 py-3 rounded-xl border-2 border-dashed border-[#DDDCE7] text-[#7A42E8] font-semibold hover:border-[#7A42E8] hover:bg-[#F4EEFD] transition-all flex items-center justify-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Line Item
          </button>
        )}
      </div>

      {/* Totals */}
      <div className="bg-white rounded-2xl border border-[#DDDCE7] p-6 space-y-3">
        <div>
          <label className="block text-sm font-medium text-[#1F2430] mb-2">Discount (%)</label>
          <input type="number" value={discountPercent} onChange={e => setDiscountPercent(parseFloat(e.target.value) || 0)} min="0" max="100"
            className="w-36 px-4 py-2 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none" />
        </div>
        <div className="border-t border-[#DDDCE7] pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-[#4F5868]"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          {discountPercent > 0 && <div className="flex justify-between text-red-600"><span>Discount ({discountPercent}%)</span><span>−${discount.toFixed(2)}</span></div>}
          {gstAmount > 0 && <div className="flex justify-between text-green-600"><span>GST (10%)</span><span>+${gstAmount.toFixed(2)}</span></div>}
          <div className="flex justify-between text-xl font-bold pt-2 border-t border-[#DDDCE7] text-[#1F2430]"><span>Total</span><span>${total.toFixed(2)}</span></div>
          {depositEnabled && (
            <>
              <div className="flex justify-between text-[#7A42E8] font-semibold"><span>Deposit ({depositType === 'percentage' ? `${depositValue}%` : 'Fixed'})</span><span>${depositAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-[#7A7F8C]"><span>Balance Remaining</span><span>${(total - depositAmount).toFixed(2)}</span></div>
            </>
          )}
        </div>
      </div>

      {/* Deposit setup */}
      <div className="bg-white rounded-2xl border border-[#DDDCE7] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[#1F2430]">Deposit Setup</h3>
            <p className="text-xs text-[#7A7F8C] mt-0.5">Request a deposit to confirm this booking</p>
          </div>
          <button
            onClick={() => setDepositEnabled(!depositEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${depositEnabled ? 'bg-[#7A42E8]' : 'bg-[#DDDCE7]'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${depositEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        {depositEnabled && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button onClick={() => setDepositType('percentage')}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${depositType === 'percentage' ? 'border-[#7A42E8] bg-[#F4EEFD] text-[#7A42E8]' : 'border-[#DDDCE7] text-[#4F5868]'}`}>
                Percentage
              </button>
              <button onClick={() => setDepositType('fixed')}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${depositType === 'fixed' ? 'border-[#7A42E8] bg-[#F4EEFD] text-[#7A42E8]' : 'border-[#DDDCE7] text-[#4F5868]'}`}>
                Fixed Amount
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                {depositType === 'fixed' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7F8C] text-sm">$</span>}
                <input type="number" value={depositValue} onChange={e => setDepositValue(parseFloat(e.target.value) || 0)}
                  className={`w-full ${depositType === 'fixed' ? 'pl-7' : 'pl-4'} pr-10 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none`} />
                {depositType === 'percentage' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7F8C] text-sm">%</span>}
              </div>
              <div className="text-sm text-[#7A7F8C]">= <span className="font-bold text-[#1F2430]">${depositAmount.toFixed(2)}</span></div>
            </div>
            <div className="p-4 rounded-xl bg-[#F4EEFD] border border-[#E3DBF9]">
              <p className="text-sm text-[#4F5868]">
                <span className="font-semibold text-[#7A42E8]">Deposit received</span> confirms this booking commercially. Balance of <span className="font-semibold">${(total - depositAmount).toFixed(2)}</span> will be invoiced separately.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Send actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#DDDCE7] text-[#4F5868] font-semibold hover:bg-[#F8F9FB] transition-colors text-sm">
          <Eye className="w-4 h-4" /> Preview Invoice
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all text-sm">
          <Send className="w-4 h-4" /> Send Invoice
        </button>
      </div>
    </div>
  );
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────
function PaymentsTab({ job }: any) {
  const [showSplitModal, setShowSplitModal] = useState(false);
  const total = job.lineItems.reduce((s: number, i: any) => s + i.unitCost * i.quantity, 0) * (1 - job.discountPercent / 100);
  const depositAmount = total * 0.5;
  const depositPaid = job.status === 'paid' || job.status === 'invoice-sent';

  return (
    <div className="space-y-6">
      {/* Payment status summary */}
      <div className="bg-white rounded-2xl border border-[#DDDCE7] p-6">
        <h3 className="font-bold text-[#1F2430] mb-5">Payment Status</h3>
        <div className="space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm text-[#7A7F8C] mb-2">
              <span>Total collected</span>
              <span className="font-bold text-[#1F2430]">${depositPaid ? depositAmount.toFixed(2) : '0.00'} / ${total.toFixed(2)}</span>
            </div>
            <div className="h-3 bg-[#F8F9FB] rounded-full overflow-hidden border border-[#DDDCE7]">
              <div className="h-full bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] rounded-full transition-all"
                style={{ width: depositPaid ? '50%' : '0%' }} />
            </div>
            <div className="flex justify-between text-xs text-[#7A7F8C] mt-1">
              <span>50% deposit</span>
              <span>100% paid</span>
            </div>
          </div>

          {/* Phase status */}
          <div className="space-y-3">
            {[
              { phase: 'Deposit (50%)', amount: depositAmount, paid: depositPaid, dueDate: '2026-03-28', paidDate: depositPaid ? '2026-03-20' : null },
              { phase: 'Balance (50%)', amount: total - depositAmount, paid: job.status === 'paid', dueDate: '2026-04-10', paidDate: null },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-[#DDDCE7]">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${p.paid ? 'bg-green-100' : 'bg-[#F8F9FB]'}`}>
                    {p.paid ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-[#7A7F8C]" />}
                  </div>
                  <div>
                    <div className="font-medium text-[#1F2430] text-sm">{p.phase}</div>
                    <div className="text-xs text-[#7A7F8C]">
                      {p.paid ? `Paid ${p.paidDate}` : `Due ${new Date(p.dueDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#1F2430]">${p.amount.toFixed(2)}</div>
                  {!p.paid && (
                    <button className="text-xs text-[#7A42E8] font-semibold hover:underline">Send reminder</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Split payment setup */}
      <div className="bg-white rounded-2xl border border-[#DDDCE7] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[#1F2430]">Split Payments</h3>
            <p className="text-xs text-[#7A7F8C] mt-0.5">Distribute payout across multiple beneficiaries</p>
          </div>
          <button onClick={() => setShowSplitModal(true)}
            className="px-4 py-2 rounded-xl bg-[#F4EEFD] text-[#7A42E8] text-sm font-semibold hover:bg-[#E3DBF9] transition-colors flex items-center gap-2">
            <Layers className="w-4 h-4" /> Configure
          </button>
        </div>
        {/* Default split preview */}
        <div className="space-y-2">
          {[
            { role: 'Artist (You)', pct: 90, amount: total * 0.9, status: 'verified' },
            { role: 'Platform Fee', pct: 5, amount: total * 0.05, status: 'platform' },
            { role: 'Agent', pct: 5, amount: total * 0.05, status: 'pending' },
          ].map((b, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FB]">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${b.role === 'Artist (You)' ? 'bg-[#7A42E8]' : b.role === 'Platform Fee' ? 'bg-[#DDDCE7]' : 'bg-amber-400'}`} />
                <div>
                  <div className="font-medium text-[#1F2430] text-sm">{b.role}</div>
                  <div className="text-xs text-[#7A7F8C]">{b.pct}% — ${b.amount.toFixed(2)}</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${b.status === 'verified' ? 'bg-green-100 text-green-700' : b.status === 'platform' ? 'bg-[#F4EEFD] text-[#7A42E8]' : 'bg-amber-100 text-amber-700'}`}>
                {b.status === 'verified' ? 'Verified' : b.status === 'platform' ? 'Museio' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Split modal */}
      {showSplitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSplitModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-[#1F2430] mb-2">Split Payment Setup</h2>
            <p className="text-sm text-[#7A7F8C] mb-6">Define how the total payout is distributed</p>
            <div className="space-y-3 mb-6">
              {[
                { role: 'Artist (You)', pct: 90, color: 'bg-[#7A42E8]' },
                { role: 'Platform Fee', pct: 5, color: 'bg-[#DDDCE7]' },
                { role: 'Agent', pct: 5, color: 'bg-amber-400' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-[#DDDCE7]">
                  <div className={`w-2 h-8 rounded-full ${b.color}`} />
                  <div className="flex-1 font-medium text-[#1F2430]">{b.role}</div>
                  <div className="flex items-center gap-2">
                    <input type="number" defaultValue={b.pct} className="w-16 px-2 py-1.5 rounded-lg border border-[#DDDCE7] text-sm text-center" />
                    <span className="text-sm text-[#7A7F8C]">%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-medium mb-5 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Total = 100% — Split is valid
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSplitModal(false)} className="flex-1 py-3 rounded-xl border-2 border-[#DDDCE7] font-semibold text-[#4F5868]">Cancel</button>
              <button onClick={() => setShowSplitModal(false)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold">Save Split</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────
function ChatTab({ job }: any) {
  const [messages, setMessages] = useState(mockMessages);
  const [text, setText] = useState('');
  const [showQuick, setShowQuick] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const send = () => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: `m${Date.now()}`, sender: 'artist', content: text.trim(), time: new Date().toISOString(), read: false }]);
    setText('');
    setShowQuick(false);
  };

  return (
    <div className="flex flex-col" style={{ height: '520px' }}>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-4">
        {messages.map(msg => {
          if (msg.sender === 'system') {
            const sysConfig: Record<string, any> = {
              'quote-sent': { label: msg.content, bg: 'bg-blue-50 border-blue-200 text-blue-700' },
            };
            const cfg = sysConfig[msg.systemType || ''] ?? { label: msg.content, bg: 'bg-[#F8F9FB] border-[#DDDCE7] text-[#7A7F8C]' };
            return (
              <div key={msg.id} className="flex justify-center my-3">
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-semibold ${cfg.bg}`}>
                  <AlertCircle className="w-3 h-3" />{cfg.label}
                </span>
              </div>
            );
          }
          const isOwn = msg.sender === 'artist';
          return (
            <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isOwn && (
                <div className="w-8 h-8 rounded-full bg-[#DDDCE7] flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-[#4F5868]">C</span>
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${isOwn ? 'bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] text-white rounded-tr-sm' : 'bg-white border border-[#DDDCE7] text-[#1F2430] rounded-tl-sm'}`}>
                {msg.content}
                <div className={`text-[10px] mt-1 ${isOwn ? 'text-white/60' : 'text-[#A4A9B6]'}`}>
                  {new Date(msg.time).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {showQuick && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
          {quickReplies.map((r, i) => (
            <button key={i} onClick={() => { setText(r); setShowQuick(false); }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[#F4EEFD] text-[#7A42E8] text-xs font-medium border border-[#E3DBF9]">
              {r.length > 35 ? r.slice(0, 35) + '…' : r}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 pt-3 border-t border-[#DDDCE7]">
        <button onClick={() => setShowQuick(!showQuick)}
          className={`p-2 rounded-lg transition-colors ${showQuick ? 'bg-[#F4EEFD] text-[#7A42E8]' : 'text-[#7A7F8C] hover:bg-[#F8F9FB]'}`}>
          <AtSign className="w-5 h-5" />
        </button>
        <textarea value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type a message…" rows={1}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none text-sm resize-none bg-[#F8F9FB]"
          style={{ maxHeight: '80px' }} />
        <button onClick={send} disabled={!text.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white disabled:opacity-40">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Files Tab ─────────────────────────────────────────────────────────��──────
function FilesTab() {
  const [attachments, setAttachments] = useState(mockAttachments);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileTypeIcons: Record<string, any> = { pdf: FileText, image: ImageIcon, doc: File };
  const typeLabels: Record<string, string> = {
    'stage-plot': 'Stage Plot', 'tech-spec': 'Tech Spec', 'contract': 'Contract',
    'receipt': 'Receipt', 'rider': 'Rider', 'other': 'Other',
  };
  const typeColors: Record<string, string> = {
    'stage-plot': 'bg-blue-100 text-blue-700', 'tech-spec': 'bg-purple-100 text-purple-700',
    'contract': 'bg-green-100 text-green-700', 'receipt': 'bg-amber-100 text-amber-700',
    'rider': 'bg-orange-100 text-orange-700', 'other': 'bg-[#F4EEFD] text-[#7A42E8]',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#1F2430]">Attachments</h3>
          <p className="text-xs text-[#7A7F8C] mt-0.5">Stage plots, tech riders, contracts, receipts</p>
        </div>
        <button onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7A42E8] text-white text-sm font-semibold hover:bg-[#6816B0] transition-colors">
          <Plus className="w-4 h-4" /> Upload File
        </button>
      </div>

      {/* Smart recommendation */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-amber-900 text-sm">Smart Suggestion</div>
          <div className="text-xs text-amber-700 mt-0.5">You have a hospitality rider on file from your previous booking with this venue. <button className="underline font-semibold">Attach it here?</button></div>
        </div>
      </div>

      {/* File list */}
      {attachments.length > 0 ? (
        <div className="bg-white rounded-2xl border border-[#DDDCE7] divide-y divide-[#DDDCE7]">
          {attachments.map(att => {
            const Icon = fileTypeIcons[att.type] ?? File;
            return (
              <div key={att.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-[#F4EEFD] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#7A42E8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#1F2430] text-sm truncate">{att.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#7A7F8C]">{att.size}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeColors[att.attachmentType] ?? 'bg-[#F4EEFD] text-[#7A42E8]'}`}>
                      {typeLabels[att.attachmentType] ?? att.attachmentType}
                    </span>
                    {att.includeInEmail && (
                      <span className="text-[10px] text-green-600 font-semibold">Included in email</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-lg hover:bg-[#F8F9FB] transition-colors" title="Download">
                    <Download className="w-4 h-4 text-[#7A7F8C]" />
                  </button>
                  <button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors" title="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-[#DDDCE7]">
          <Paperclip className="w-10 h-10 text-[#DDDCE7] mx-auto mb-3" />
          <p className="font-medium text-[#1F2430]">No files attached</p>
          <p className="text-sm text-[#7A7F8C] mt-1">Upload stage plots, tech riders, contracts, and more</p>
        </div>
      )}

      {/* Upload modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUploadModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-[#1F2430] mb-5">Upload Attachment</h2>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors mb-4 ${isDragging ? 'border-[#7A42E8] bg-[#F4EEFD]' : 'border-[#DDDCE7]'}`}
            >
              <Upload className="w-10 h-10 text-[#DDDCE7] mx-auto mb-3" />
              <p className="font-semibold text-[#1F2430] mb-1">Drop files here or tap to browse</p>
              <p className="text-xs text-[#7A7F8C]">PDF, JPG, PNG, DOCX up to 20MB</p>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-1">Attachment Type</label>
                <select className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none">
                  <option value="stage-plot">Stage Plot</option>
                  <option value="tech-spec">Tech Spec / Rider</option>
                  <option value="contract">Contract</option>
                  <option value="receipt">Receipt</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-[#1F2430]">Include in invoice email</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowUploadModal(false)} className="flex-1 py-3 rounded-xl border-2 border-[#DDDCE7] font-semibold text-[#4F5868]">Cancel</button>
              <button onClick={() => setShowUploadModal(false)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Share Tab ────────────────────────────────────────────────────────────────
function ShareTab({ job }: any) {
  const [cardType, setCardType] = useState<'job-summary' | 'quote' | 'invoice'>('quote');
  const [hidePrice, setHidePrice] = useState(false);
  const [showDepositOnly, setShowDepositOnly] = useState(false);
  const [showDueDate, setShowDueDate] = useState(true);
  const [showAvatar, setShowAvatar] = useState(true);
  const [copied, setCopied] = useState(false);
  const [linkExpiry, setLinkExpiry] = useState('7');

  const mockLink = `https://museio.app/c/${job.jobNumber.toLowerCase()}-abc123`;

  const copyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Card type selector */}
      <div>
        <h3 className="font-bold text-[#1F2430] mb-3">Share Type</h3>
        <div className="flex gap-2">
          {(['job-summary', 'quote', 'invoice'] as const).map(t => (
            <button key={t} onClick={() => setCardType(t)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${cardType === t ? 'border-[#7A42E8] bg-[#F4EEFD] text-[#7A42E8]' : 'border-[#DDDCE7] text-[#4F5868]'}`}>
              {t === 'job-summary' ? 'Job Summary' : t === 'quote' ? 'Quote' : 'Invoice'}
            </button>
          ))}
        </div>
      </div>

      {/* Preview card */}
      <div className="bg-gradient-to-br from-[#1F2430] to-[#2D1F4A] rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between mb-4">
          {showAvatar && (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] flex items-center justify-center">
              <span className="font-bold text-lg">M</span>
            </div>
          )}
          <div className="flex-1 ml-3">
            <div className="font-bold text-lg">{job.title}</div>
            <div className="text-white/60 text-sm">{new Date(job.startDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${cardType === 'invoice' ? 'bg-amber-500' : 'bg-[#7A42E8]'}`}>
            {cardType === 'job-summary' ? 'JOB' : cardType === 'quote' ? 'QUOTE' : 'INVOICE'}
          </div>
        </div>
        {!hidePrice && (
          <div className="mb-4">
            <div className="text-white/60 text-xs mb-1">{showDepositOnly ? 'DEPOSIT DUE' : 'TOTAL AMOUNT'}</div>
            <div className="text-3xl font-bold">
              {showDepositOnly ? '$1,750' : '$3,500'}
            </div>
          </div>
        )}
        {showDueDate && (
          <div className="text-white/60 text-xs">Due: {new Date(job.endDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        )}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-white/40 text-xs">via Museio</span>
          <div className="flex items-center gap-1 text-white/60 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span>Secure link</span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl border border-[#DDDCE7] p-5 space-y-3">
        <h3 className="font-semibold text-[#1F2430] text-sm">Display Options</h3>
        {[
          { label: 'Show price', value: !hidePrice, setter: (v: boolean) => setHidePrice(!v) },
          { label: 'Show deposit amount only', value: showDepositOnly, setter: setShowDepositOnly },
          { label: 'Show due date', value: showDueDate, setter: setShowDueDate },
          { label: 'Show artist avatar', value: showAvatar, setter: setShowAvatar },
        ].map(opt => (
          <div key={opt.label} className="flex items-center justify-between">
            <span className="text-sm text-[#4F5868]">{opt.label}</span>
            <button onClick={() => opt.setter(!opt.value)}
              className={`w-10 h-6 rounded-full transition-colors relative ${opt.value ? 'bg-[#7A42E8]' : 'bg-[#DDDCE7]'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${opt.value ? 'left-5' : 'left-1'}`} />
            </button>
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-[#7A7F8C] mb-1">Link expires in</label>
          <select value={linkExpiry} onChange={e => setLinkExpiry(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#DDDCE7] text-sm focus:outline-none focus:border-[#7A42E8]">
            <option value="1">1 day</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="never">Never</option>
          </select>
        </div>
      </div>

      {/* Link + share buttons */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F8F9FB] border border-[#DDDCE7]">
          <LinkIcon className="w-4 h-4 text-[#7A7F8C] flex-shrink-0" />
          <span className="flex-1 text-sm text-[#7A7F8C] truncate">{mockLink}</span>
          <button onClick={copyLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-[#7A42E8] text-white hover:bg-[#6816B0]'}`}>
            {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'WhatsApp', color: 'bg-green-500 hover:bg-green-600', icon: MessageSquare },
            { label: 'Instagram DM', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: Share2 },
            { label: 'Copy Link', color: 'bg-[#F8F9FB] hover:bg-[#DDDCE7] text-[#1F2430] border border-[#DDDCE7]', icon: LinkIcon },
            { label: 'Email', color: 'bg-blue-500 hover:bg-blue-600', icon: Send },
          ].map(ch => (
            <button key={ch.label}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all text-white ${ch.color}`}>
              <ch.icon className="w-4 h-4" />
              {ch.label}
            </button>
          ))}
        </div>

        {/* Security note */}
        <div className="p-4 rounded-xl bg-[#F4EEFD] border border-[#E3DBF9] flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#7A42E8] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[#4F5868]">
            <span className="font-semibold text-[#7A42E8]">Share with confidence.</span> This link contains only the details you've selected. Sensitive financial data and personal info are never exposed.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────
function TimelineTab() {
  const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
    created: { icon: Plus, color: 'text-[#7A42E8]', bg: 'bg-[#F4EEFD]' },
    draft: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    sent: { icon: Send, color: 'text-green-600', bg: 'bg-green-50' },
    viewed: { icon: Eye, color: 'text-amber-600', bg: 'bg-amber-50' },
    message: { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
    paid: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  };

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-[#1F2430] mb-4">Job Timeline</h3>
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#DDDCE7]" />
        <div className="space-y-4">
          {mockTimeline.map(entry => {
            const cfg = typeConfig[entry.type] ?? typeConfig.created;
            const Icon = cfg.icon;
            return (
              <div key={entry.id} className="flex gap-4 relative pl-2">
                <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm z-10`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 bg-white border border-[#DDDCE7] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[#1F2430] text-sm">{entry.event}</div>
                      <div className="text-xs text-[#7A7F8C] mt-0.5">{entry.detail}</div>
                    </div>
                    <div className="text-xs text-[#7A7F8C] flex-shrink-0">
                      {new Date(entry.time).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                      <span className="block text-right">{new Date(entry.time).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, updateJob, clients } = useApp();

  const job = jobs.find(j => j.id === id);

  const [activeTab, setActiveTab] = useState<JobTab>('summary');
  const [title, setTitle] = useState(job?.title || '');
  const [jobNumber, setJobNumber] = useState(job?.jobNumber || '');
  const [startDate, setStartDate] = useState(job?.startDate || '');
  const [endDate, setEndDate] = useState(job?.endDate || '');
  const [startTime, setStartTime] = useState(job?.startTime || '');
  const [endTime, setEndTime] = useState(job?.endTime || '');
  const [lineItems, setLineItems] = useState<LineItem[]>(job?.lineItems || []);
  const [discountPercent, setDiscountPercent] = useState(job?.discountPercent || 0);
  const [notes, setNotes] = useState(job?.notes || '');
  const [selectedClientId, setSelectedClientId] = useState(job?.clientId || '');

  useEffect(() => { if (!job) navigate('/app/jobs'); }, [job, navigate]);
  if (!job) return null;

  const handleSave = () => {
    if (!title || !startDate || !endDate || !startTime || !endTime) {
      alert('Please fill in all required fields');
      return;
    }
    updateJob(id!, { title, jobNumber, startDate, endDate, startTime, endTime, clientId: selectedClientId, lineItems, discountPercent, notes });
    navigate('/app/jobs');
  };

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    upcoming:      { bg: 'bg-blue-50',   text: 'text-blue-600',   label: 'Upcoming' },
    'invoice-sent':{ bg: 'bg-amber-50',  text: 'text-amber-600',  label: 'Invoice Sent' },
    paid:          { bg: 'bg-green-50',  text: 'text-green-600',  label: 'Paid' },
    drafted:       { bg: 'bg-gray-50',   text: 'text-gray-600',   label: 'Draft' },
    requested:     { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Requested' },
  };
  const sc = statusConfig[job.status] ?? { bg: 'bg-gray-50', text: 'text-gray-600', label: job.status };

  const tabs = [
    { id: 'summary' as JobTab, label: 'Summary', icon: FileText, badge: 0 },
    { id: 'invoice' as JobTab, label: 'Quote / Invoice', icon: DollarSign, badge: 0 },
    { id: 'payments' as JobTab, label: 'Payments', icon: CreditCard, badge: 0 },
    { id: 'chat' as JobTab, label: 'Chat', icon: MessageSquare, badge: mockMessages.filter(m => !m.read).length },
    { id: 'files' as JobTab, label: 'Files', icon: Paperclip, badge: mockAttachments.length },
    { id: 'share' as JobTab, label: 'Share', icon: Share2, badge: 0 },
    { id: 'timeline' as JobTab, label: 'Timeline', icon: Clock, badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <div className="bg-white border-b border-[#DDDCE7] px-4 py-3 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate('/app/jobs')} className="p-2 rounded-full hover:bg-[#F8F9FB] transition-colors">
              <X className="w-5 h-5 text-[#7A7F8C]" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-[#1F2430] text-lg truncate">{title || 'Untitled Job'}</h1>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span>
                <span className="text-xs text-[#7A7F8C]">{job.jobNumber}</span>
              </div>
            </div>
            <button onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold text-sm hover:shadow-lg transition-all">
              Save
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex overflow-x-auto gap-0 border-t border-[#DDDCE7] -mx-4 px-4">
            {tabs.map(tab => (
              <TabButton key={tab.id} {...tab} active={activeTab === tab.id} onClick={setActiveTab} />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
        {activeTab === 'summary' && (
          <SummaryTab job={job} clients={clients} title={title} setTitle={setTitle} jobNumber={jobNumber} setJobNumber={setJobNumber}
            startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}
            startTime={startTime} setStartTime={setStartTime} endTime={endTime} setEndTime={setEndTime}
            selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId}
            notes={notes} setNotes={setNotes} />
        )}
        {activeTab === 'invoice' && (
          <InvoiceTab lineItems={lineItems} setLineItems={setLineItems} discountPercent={discountPercent} setDiscountPercent={setDiscountPercent} job={job} />
        )}
        {activeTab === 'payments' && <PaymentsTab job={job} />}
        {activeTab === 'chat' && <ChatTab job={job} />}
        {activeTab === 'files' && <FilesTab />}
        {activeTab === 'share' && <ShareTab job={job} />}
        {activeTab === 'timeline' && <TimelineTab />}
      </div>
    </div>
  );
}