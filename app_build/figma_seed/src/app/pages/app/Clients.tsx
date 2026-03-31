import { useState } from 'react';
import {
  Users, Plus, Search, Edit, Trash2, X, ChevronRight, Briefcase,
  MessageSquare, DollarSign, MapPin, Mail, Phone, Building,
  FileText, Clock, CheckCircle, AlertTriangle, StickyNote, Send,
  MoreVertical, ArrowLeft, CreditCard, Star,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import { useNavigate } from 'react-router';

// ─── Mock supplemental client data ────────────────────────────────────────────
const mockClientExtras: Record<string, {
  notes: string;
  tags: string[];
  linkedJobs: { id: string; title: string; date: string; amount: number; status: string }[];
  outstandingBalance: number;
  totalRevenue: number;
  lastContact: string;
}> = {
  default: {
    notes: '',
    tags: [],
    linkedJobs: [],
    outstandingBalance: 0,
    totalRevenue: 0,
    lastContact: '',
  },
  'c1': {
    notes: 'Prefers communication via email. Always books well in advance. VIP client — treat with priority.',
    tags: ['VIP', 'Corporate', 'Recurring'],
    linkedJobs: [
      { id: 'job-1', title: 'Spring Gala 2026', date: '2026-04-12', amount: 3500, status: 'upcoming' },
      { id: 'job-2', title: 'Christmas Gala 2025', date: '2025-12-20', amount: 4200, status: 'paid' },
    ],
    outstandingBalance: 1750,
    totalRevenue: 7700,
    lastContact: '2026-03-20',
  },
  'c2': {
    notes: 'Need stage plot 2 weeks before. Marcus handles bookings. Load-in is via rear entrance.',
    tags: ['Nightclub', 'Residency'],
    linkedJobs: [
      { id: 'job-3', title: 'Friday Residency April', date: '2026-04-04', amount: 1500, status: 'upcoming' },
      { id: 'job-4', title: 'Friday Residency March', date: '2026-03-07', amount: 1500, status: 'paid' },
    ],
    outstandingBalance: 750,
    totalRevenue: 3000,
    lastContact: '2026-03-19',
  },
};

function getExtras(clientId: string) {
  return mockClientExtras[clientId] ?? mockClientExtras['default'];
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    upcoming: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Upcoming' },
    paid: { bg: 'bg-green-50', text: 'text-green-600', label: 'Paid' },
    'invoice-sent': { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Invoice Sent' },
    drafted: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Draft' },
  };
  const s = cfg[status] ?? { bg: 'bg-gray-50', text: 'text-gray-600', label: status };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>;
}

// ─── Client Detail Panel ──────────────────────────────────────────────────────
function ClientDetail({ client, onClose, onEdit, onDelete }: { client: Client; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const navigate = useNavigate();
  const extras = getExtras(client.id);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'messages' | 'notes'>('overview');
  const [notes, setNotes] = useState(extras.notes);
  const [editingNotes, setEditingNotes] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notes', label: 'Notes', icon: StickyNote },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-4 p-6 border-b border-[#DDDCE7]">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-[#F8F9FB] md:hidden flex-shrink-0">
          <ArrowLeft className="w-5 h-5 text-[#7A7F8C]" />
        </button>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-2xl">{client.venueName[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-[#1F2430] text-lg leading-tight">{client.venueName}</h2>
          <p className="text-[#7A7F8C] text-sm">{client.contactName}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {extras.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-[#F4EEFD] text-[#7A42E8] text-xs font-semibold">{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-[#F4EEFD] text-[#7A42E8] transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric pills */}
      <div className="flex gap-3 px-6 py-4 border-b border-[#DDDCE7] overflow-x-auto">
        <div className="flex-shrink-0 text-center px-4 py-3 rounded-xl bg-[#F4EEFD] min-w-[90px]">
          <div className="font-bold text-[#7A42E8] text-lg">${extras.totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-[#7A7F8C]">Total Revenue</div>
        </div>
        <div className="flex-shrink-0 text-center px-4 py-3 rounded-xl bg-amber-50 min-w-[90px]">
          <div className="font-bold text-amber-700 text-lg">${extras.outstandingBalance.toLocaleString()}</div>
          <div className="text-xs text-[#7A7F8C]">Outstanding</div>
        </div>
        <div className="flex-shrink-0 text-center px-4 py-3 rounded-xl bg-green-50 min-w-[90px]">
          <div className="font-bold text-green-700 text-lg">{extras.linkedJobs.length}</div>
          <div className="text-xs text-[#7A7F8C]">Jobs</div>
        </div>
        {extras.lastContact && (
          <div className="flex-shrink-0 text-center px-4 py-3 rounded-xl bg-[#F8F9FB] min-w-[100px]">
            <div className="font-bold text-[#1F2430] text-sm">{new Date(extras.lastContact).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</div>
            <div className="text-xs text-[#7A7F8C]">Last Contact</div>
          </div>
        )}
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-[#DDDCE7] px-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id ? 'border-[#7A42E8] text-[#7A42E8]' : 'border-transparent text-[#7A7F8C]'
              }`}>
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Contact details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-[#1F2430] text-sm uppercase tracking-wide">Contact Details</h3>
              {[
                { icon: Mail, label: 'Email', value: client.email },
                { icon: Phone, label: 'Phone', value: client.phone },
                { icon: MapPin, label: 'Location', value: client.location },
                { icon: Users, label: 'Contact', value: client.contactName },
              ].map(row => row.value && (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F4EEFD] flex items-center justify-center flex-shrink-0">
                    <row.icon className="w-4 h-4 text-[#7A42E8]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#7A7F8C]">{row.label}</div>
                    <div className="text-sm font-medium text-[#1F2430]">{row.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Outstanding balance */}
            {extras.outstandingBalance > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-amber-900 text-sm">Outstanding Balance</span>
                  </div>
                  <span className="font-bold text-amber-900 text-lg">${extras.outstandingBalance.toLocaleString()}</span>
                </div>
                <button className="w-full mt-2 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2">
                  <Send className="w-3.5 h-3.5" /> Send Reminder
                </button>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'New Job', icon: Briefcase, action: () => navigate('/app/jobs/new') },
                { label: 'Send Message', icon: MessageSquare, action: () => navigate('/app/messages') },
                { label: 'New Invoice', icon: FileText, action: () => {} },
                { label: 'Add Note', icon: StickyNote, action: () => setActiveTab('notes') },
              ].map(a => (
                <button key={a.label} onClick={a.action}
                  className="flex items-center gap-2 p-3 rounded-xl border border-[#DDDCE7] bg-white hover:border-[#7A42E8] hover:bg-[#F4EEFD] transition-all text-left">
                  <a.icon className="w-4 h-4 text-[#7A42E8]" />
                  <span className="text-sm font-medium text-[#1F2430]">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#1F2430]">Linked Jobs</h3>
              <button onClick={() => navigate('/app/jobs/new')}
                className="flex items-center gap-1.5 text-sm text-[#7A42E8] font-semibold hover:underline">
                <Plus className="w-3.5 h-3.5" /> New Job
              </button>
            </div>
            {extras.linkedJobs.length > 0 ? (
              <div className="space-y-3">
                {extras.linkedJobs.map(j => (
                  <div key={j.id} className="p-4 rounded-xl border border-[#DDDCE7] hover:border-[#8F6EE6] transition-all cursor-pointer bg-white"
                    onClick={() => navigate(`/app/jobs/${j.id}/edit`)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-[#1F2430] text-sm">{j.title}</div>
                      <StatusBadge status={j.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#7A7F8C]">
                      <span>{new Date(j.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="font-semibold text-[#1F2430]">${j.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-10 h-10 text-[#DDDCE7] mx-auto mb-3" />
                <p className="text-sm text-[#7A7F8C]">No jobs linked to this client yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#1F2430]">Recent Conversations</h3>
            <div className="p-4 rounded-xl bg-[#F4EEFD] border border-[#E3DBF9] text-center">
              <MessageSquare className="w-8 h-8 text-[#7A42E8] mx-auto mb-2" />
              <p className="font-semibold text-[#1F2430] text-sm mb-1">Chat with {client.contactName}</p>
              <p className="text-xs text-[#7A7F8C] mb-3">All messages are tied to your jobs and booking records</p>
              <button onClick={() => navigate('/app/messages')}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white text-sm font-semibold hover:shadow-lg transition-all">
                Open Messages
              </button>
            </div>
            {/* Sample threads */}
            <div className="space-y-2">
              {extras.linkedJobs.map(j => (
                <div key={j.id} className="flex items-center gap-3 p-4 rounded-xl border border-[#DDDCE7] hover:border-[#8F6EE6] cursor-pointer transition-all bg-white"
                  onClick={() => navigate('/app/messages')}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{client.venueName[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#1F2430] text-sm">{j.title}</div>
                    <div className="text-xs text-[#7A7F8C] truncate">Tap to open conversation</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#7A7F8C]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#1F2430]">Client Notes</h3>
              <button onClick={() => setEditingNotes(!editingNotes)}
                className="text-sm text-[#7A42E8] font-semibold hover:underline">
                {editingNotes ? 'Done' : 'Edit'}
              </button>
            </div>
            {editingNotes ? (
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={8}
                placeholder="Add notes about this client — load-in preferences, contact preferences, dietary requirements, etc."
                className="w-full px-4 py-3 rounded-xl border-2 border-[#7A42E8] focus:outline-none resize-none text-sm"
                autoFocus
              />
            ) : (
              <div className="min-h-[120px] p-4 rounded-xl bg-[#F8F9FB] border border-[#DDDCE7]">
                {notes ? (
                  <p className="text-sm text-[#4F5868] whitespace-pre-wrap">{notes}</p>
                ) : (
                  <p className="text-sm text-[#7A7F8C] italic">No notes yet. Click "Edit" to add client notes, logistics, or preferences.</p>
                )}
              </div>
            )}

            {/* Logistics tags */}
            <div>
              <h4 className="font-semibold text-[#1F2430] text-sm mb-2">Quick Tags</h4>
              <div className="flex flex-wrap gap-2">
                {['VIP', 'Corporate', 'Recurring', 'Festival', 'Nightclub', 'Private Event', 'Government'].map(tag => (
                  <button key={tag}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      extras.tags.includes(tag)
                        ? 'bg-[#7A42E8] text-white border-[#7A42E8]'
                        : 'bg-white text-[#4F5868] border-[#DDDCE7] hover:border-[#7A42E8]'
                    }`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Clients component ───────────────────────────────────────────────────
export function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    venueName: '', contactName: '', email: '', phone: '', location: '',
  });

  const filteredClients = clients.filter(c =>
    c.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({ venueName: client.venueName, contactName: client.contactName, email: client.email, phone: client.phone, location: client.location });
    } else {
      setEditingClient(null);
      setFormData({ venueName: '', contactName: '', email: '', phone: '', location: '' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.venueName || !formData.contactName || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }
    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }
    setShowModal(false);
    setEditingClient(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      deleteClient(id);
      if (selectedClient?.id === id) setSelectedClient(null);
    }
  };

  return (
    <div className="h-screen flex bg-[#F8F9FB] overflow-hidden">
      {/* ── Client List Panel ────────────────────────────────── */}
      <div className={`${selectedClient ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[360px] border-r border-[#DDDCE7] bg-white flex-shrink-0`}>
        {/* Header */}
        <div className="p-5 border-b border-[#DDDCE7]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-[#7A42E8]" />
              <h1 className="text-xl font-bold text-[#1F2430]">Clients</h1>
              <span className="w-6 h-6 rounded-full bg-[#F4EEFD] text-[#7A42E8] text-xs font-bold flex items-center justify-center">
                {clients.length}
              </span>
            </div>
            <button onClick={() => openModal()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4A9B6]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search clients…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DDDCE7] bg-[#F8F9FB] text-sm focus:outline-none focus:border-[#7A42E8]"
            />
          </div>
        </div>

        {/* Client list */}
        <div className="flex-1 overflow-y-auto">
          {filteredClients.length > 0 ? (
            filteredClients.map(client => {
              const extras = getExtras(client.id);
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full flex items-start gap-3 px-4 py-4 text-left border-b border-[#F8F9FB] transition-colors ${selectedClient?.id === client.id ? 'bg-[#F4EEFD]' : 'hover:bg-[#F8F9FB]'}`}
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{client.venueName[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-[#1F2430] text-sm truncate">{client.venueName}</span>
                      {extras.tags.includes('VIP') && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                    </div>
                    <div className="text-xs text-[#7A7F8C] truncate">{client.contactName}</div>
                    {extras.outstandingBalance > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-[10px] text-amber-600 font-semibold">${extras.outstandingBalance.toLocaleString()} outstanding</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#DDDCE7] flex-shrink-0 mt-1" />
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-full bg-[#F4EEFD] flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-[#7A42E8]" />
              </div>
              <p className="font-semibold text-[#1F2430] mb-1">
                {searchQuery ? 'No clients found' : 'No clients yet'}
              </p>
              <p className="text-sm text-[#7A7F8C]">
                {searchQuery ? 'Try a different search' : 'Add your first client to start building your network'}
              </p>
              {!searchQuery && (
                <button onClick={() => openModal()}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold text-sm hover:shadow-lg transition-all">
                  Add Client
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Panel ─────────────────────────────────────── */}
      <div className={`${!selectedClient ? 'hidden md:flex' : 'flex'} flex-col flex-1 bg-white overflow-hidden`}>
        {selectedClient ? (
          <ClientDetail
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
            onEdit={() => { openModal(selectedClient); }}
            onDelete={() => handleDelete(selectedClient.id)}
          />
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-12">
            <div className="w-24 h-24 rounded-full bg-[#F4EEFD] flex items-center justify-center mb-6">
              <Users className="w-12 h-12 text-[#7A42E8]" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2430] mb-2">Select a client</h3>
            <p className="text-[#7A7F8C] max-w-xs">Choose a client from the list to see their profile, linked jobs, messages, and outstanding balances.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1F2430]">{editingClient ? 'Edit Client' : 'Add Client'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-[#F8F9FB]">
                <X className="w-5 h-5 text-[#7A7F8C]" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'venueName', label: 'Venue / Company Name', req: true, placeholder: 'The Grand Ballroom', type: 'text' },
                { key: 'contactName', label: 'Contact Name', req: true, placeholder: 'Sarah Mitchell', type: 'text' },
                { key: 'email', label: 'Email', req: true, placeholder: 'sarah@example.com.au', type: 'email' },
                { key: 'phone', label: 'Phone', req: false, placeholder: '+61 412 345 678', type: 'tel' },
                { key: 'location', label: 'Location', req: false, placeholder: 'Sydney, NSW', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-[#1F2430] mb-1.5">
                    {f.label} {f.req && <span className="text-[#7A42E8]">*</span>}
                  </label>
                  <input
                    type={f.type}
                    value={(formData as any)[f.key]}
                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border-2 border-[#DDDCE7] font-semibold text-[#4F5868]">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all">
                {editingClient ? 'Save Changes' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
