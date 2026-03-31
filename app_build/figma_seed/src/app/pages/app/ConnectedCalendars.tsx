import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar, Plus, Check, X, RefreshCw, AlertTriangle, Settings,
  Eye, EyeOff, Link as LinkIcon, Unlink, CheckCircle, XCircle,
  Clock, ChevronRight, Shield, Zap, AlertCircle, ArrowLeft,
  Wifi, Activity, Lock,
} from 'lucide-react';
import type { ConnectedCalendar, ExternalEvent, CalendarConflict } from '../../types';

// ─── Sync status helpers ──────────────────────────────────────────────────────
function getSyncInfo(status: string) {
  const map: Record<string, { color: string; bg: string; label: string; icon: any }> = {
    active:           { color: 'text-green-600',  bg: 'bg-green-100',  label: 'Active',        icon: CheckCircle },
    refreshing:       { color: 'text-blue-600',   bg: 'bg-blue-100',   label: 'Syncing…',      icon: RefreshCw },
    stale:            { color: 'text-amber-600',  bg: 'bg-amber-100',  label: 'Stale',         icon: Clock },
    'permission-error':{ color: 'text-red-600',   bg: 'bg-red-100',    label: 'Perm. Error',   icon: XCircle },
    disconnected:     { color: 'text-gray-600',   bg: 'bg-gray-100',   label: 'Disconnected',  icon: Unlink },
  };
  return map[status] ?? { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Unknown', icon: AlertTriangle };
}

function getSourceLabel(source: string) {
  return source === 'google' ? 'Google Calendar' : source === 'calendly' ? 'Calendly' : 'Gmail';
}

function getSourceColor(source: string) {
  return source === 'google' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700';
}

// ─── Freshness meter ──────────────────────────────────────────────────────────
function FreshnessMeter({ lastSync }: { lastSync: string }) {
  const minutesAgo = Math.floor((Date.now() - new Date(lastSync).getTime()) / 60000);
  const pct = Math.max(0, Math.min(100, 100 - minutesAgo));
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-[#DDDCE7] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-green-500' : pct > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[#7A7F8C]">
        {minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ConnectedCalendars() {
  const navigate = useNavigate();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSourceSettings, setShowSourceSettings] = useState<string | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [connectingSource, setConnectingSource] = useState<string | null>(null);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [activeTab, setActiveTab] = useState<'accounts' | 'events' | 'conflicts'>('accounts');

  const [connectedCalendars, setConnectedCalendars] = useState<ConnectedCalendar[]>([
    {
      id: '1',
      source: 'google',
      accountEmail: 'artist@example.com',
      syncStatus: 'active',
      lastSyncDate: new Date(Date.now() - 5 * 60000).toISOString(),
      isBlocking: true,
      includeTentative: false,
      privacyMaskEnabled: true,
      calendars: [
        { id: 'cal-1', name: 'Personal', color: '#4285F4', enabled: true, isBlocking: true },
        { id: 'cal-2', name: 'Work', color: '#EA4335', enabled: true, isBlocking: true },
        { id: 'cal-3', name: 'Holidays in Australia', color: '#34A853', enabled: false, isBlocking: false },
      ],
    },
    {
      id: '2',
      source: 'calendly',
      accountEmail: 'artist@example.com',
      syncStatus: 'active',
      lastSyncDate: new Date(Date.now() - 20 * 60000).toISOString(),
      isBlocking: true,
      includeTentative: true,
      privacyMaskEnabled: false,
      calendars: [
        { id: 'cal-4', name: 'Consulting Sessions', color: '#006BFF', enabled: true, isBlocking: true },
      ],
    },
  ]);

  const upcomingExternalEvents: ExternalEvent[] = [
    { id: 'ext-1', source: 'google', title: 'Team Meeting', startDate: '2026-03-21', endDate: '2026-03-21', startTime: '14:00', endTime: '15:00', status: 'confirmed', maskedTitle: 'Busy', calendarId: 'cal-2', ignored: false },
    { id: 'ext-2', source: 'google', title: 'Doctor Appointment', startDate: '2026-03-22', endDate: '2026-03-22', startTime: '10:00', endTime: '11:00', status: 'confirmed', maskedTitle: 'Busy', calendarId: 'cal-1', ignored: false },
    { id: 'ext-3', source: 'calendly', title: 'Strategy Call with Sarah', startDate: '2026-03-23', endDate: '2026-03-23', startTime: '13:00', endTime: '14:00', status: 'confirmed', calendarId: 'cal-4', ignored: false },
    { id: 'ext-4', source: 'google', title: 'Dinner Party', startDate: '2026-03-25', endDate: '2026-03-25', startTime: '19:00', endTime: '22:00', status: 'tentative', maskedTitle: 'Busy', calendarId: 'cal-1', ignored: false },
  ];

  const conflicts: CalendarConflict[] = [
    { id: 'conflict-1', date: '2026-03-25', internalEventId: 'job-123', externalEventId: 'ext-4', conflictType: 'overlap', resolved: false },
  ];

  const toggleCalendarSetting = (calId: string, setting: 'isBlocking' | 'includeTentative' | 'privacyMaskEnabled') => {
    setConnectedCalendars(prev => prev.map(c =>
      c.id === calId ? { ...c, [setting]: !(c as any)[setting] } : c
    ));
  };

  const toggleSubCalendar = (sourceId: string, calId: string) => {
    setConnectedCalendars(prev => prev.map(c =>
      c.id === sourceId
        ? { ...c, calendars: c.calendars.map(cal => cal.id === calId ? { ...cal, enabled: !cal.enabled } : cal) }
        : c
    ));
  };

  const simulateConnect = (source: string) => {
    setConnectingSource(source);
    setTimeout(() => {
      setConnectingSource(null);
      setShowConnectModal(false);
      setShowSuccessState(true);
      setTimeout(() => setShowSuccessState(false), 4000);
    }, 1500);
  };

  const unresolvedConflicts = conflicts.filter(c => !c.resolved);

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 md:p-6 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <button onClick={() => navigate('/app/availability')}
              className="flex items-center gap-2 text-[#7A42E8] font-semibold mb-1 hover:underline text-sm">
              <ArrowLeft className="w-4 h-4" /> Availability
            </button>
            <h1 className="text-2xl font-bold text-[#1F2430]">Connected Calendars</h1>
            <p className="text-sm text-[#7A7F8C]">Sync external events to protect your availability</p>
          </div>
          <button onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all text-sm">
            <Plus className="w-4 h-4" /> Connect
          </button>
        </div>

        {/* Success banner */}
        {showSuccessState && (
          <div className="mb-4 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-bold text-green-900">Your calendar is now protecting public booking slots.</div>
              <div className="text-sm text-green-700">External events have been synced and are blocking overlapping slots.</div>
            </div>
          </div>
        )}

        {/* Conflicts alert */}
        {unresolvedConflicts.length > 0 && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <div className="font-bold text-amber-900 text-sm">{unresolvedConflicts.length} Scheduling Conflict{unresolvedConflicts.length > 1 ? 's' : ''}</div>
                <div className="text-xs text-amber-700">Overlapping events need your review</div>
              </div>
            </div>
            <button onClick={() => setShowConflictModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors flex-shrink-0">
              Review
            </button>
          </div>
        )}

        {/* Tab nav */}
        <div className="flex gap-1 bg-white border border-[#DDDCE7] rounded-2xl p-1 mb-5">
          {[
            { id: 'accounts', label: 'Connected Accounts' },
            { id: 'events', label: 'Upcoming Events' },
            { id: 'conflicts', label: `Conflicts${unresolvedConflicts.length > 0 ? ` (${unresolvedConflicts.length})` : ''}` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white' : 'text-[#7A7F8C] hover:text-[#1F2430]'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Accounts tab ─────────────────────────────────────────── */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            {connectedCalendars.map(cal => {
              const si = getSyncInfo(cal.syncStatus);
              const StatusIcon = si.icon;
              return (
                <div key={cal.id} className="bg-white rounded-3xl border border-[#DDDCE7] p-6">
                  {/* Source header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cal.source === 'google' ? 'bg-red-50' : 'bg-indigo-50'}`}>
                        <Calendar className={`w-6 h-6 ${cal.source === 'google' ? 'text-red-600' : 'text-indigo-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1F2430]">{getSourceLabel(cal.source)}</h3>
                        <p className="text-sm text-[#7A7F8C]">{cal.accountEmail}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${si.bg} ${si.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {si.label}
                          </span>
                          {cal.lastSyncDate && <FreshnessMeter lastSync={cal.lastSyncDate} />}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-2 rounded-lg hover:bg-[#F8F9FB] transition-colors" title="Refresh">
                        <RefreshCw className="w-4 h-4 text-[#7A7F8C]" />
                      </button>
                      <button onClick={() => setShowSourceSettings(cal.id)} className="p-2 rounded-lg hover:bg-[#F8F9FB] transition-colors" title="Settings">
                        <Settings className="w-4 h-4 text-[#7A7F8C]" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Disconnect">
                        <Unlink className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="grid md:grid-cols-3 gap-3 mb-4">
                    {[
                      { key: 'isBlocking', label: 'Block public booking', value: cal.isBlocking },
                      { key: 'includeTentative', label: 'Include tentative events', value: cal.includeTentative },
                      { key: 'privacyMaskEnabled', label: 'Privacy masking', value: cal.privacyMaskEnabled },
                    ].map(toggle => (
                      <div key={toggle.key} className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FB] border border-[#DDDCE7]">
                        <span className="text-xs font-medium text-[#4F5868]">{toggle.label}</span>
                        <button
                          onClick={() => toggleCalendarSetting(cal.id, toggle.key as any)}
                          className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ml-2 ${toggle.value ? 'bg-[#7A42E8]' : 'bg-[#DDDCE7]'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${toggle.value ? 'left-4' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Sub-calendars */}
                  <div>
                    <div className="text-xs font-semibold text-[#7A7F8C] uppercase tracking-wide mb-2">Calendars in this account</div>
                    <div className="space-y-2">
                      {cal.calendars.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl border border-[#DDDCE7]">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }} />
                            <span className="font-medium text-[#1F2430] text-sm">{sub.name}</span>
                            {sub.isBlocking && sub.enabled && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F4EEFD] text-[#7A42E8]">Blocking</span>
                            )}
                          </div>
                          <button
                            onClick={() => toggleSubCalendar(cal.id, sub.id)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${sub.enabled ? 'bg-[#7A42E8]' : 'bg-[#DDDCE7]'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${sub.enabled ? 'left-4' : 'left-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Backfill option */}
                  <div className="mt-4 p-3 rounded-xl bg-[#F4EEFD] border border-[#E3DBF9] flex items-center justify-between">
                    <div className="text-xs text-[#4F5868]">
                      <span className="font-semibold text-[#7A42E8]">One-tap backfill</span> — sync last 30 days and next 180 days
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-[#7A42E8] text-white text-xs font-semibold hover:bg-[#6816B0] transition-colors">
                      Sync
                    </button>
                  </div>
                </div>
              );
            })}

            {/* How it works */}
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">How Calendar Sync Works</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• External events automatically block your public booking availability</li>
                    <li>• Privacy masking shows "Busy" to clients instead of event titles</li>
                    <li>• Tentative events can be included or excluded from blocking</li>
                    <li>• Sync refreshes every 15 minutes to keep availability current</li>
                    <li>• If permissions are revoked, safe mode temporarily hides exposed slots</li>
                  </ul>
                  <button onClick={() => setShowPermissionsModal(true)} className="mt-2 text-sm text-blue-800 font-semibold hover:underline">
                    View permissions explainer →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Events tab ───────────────────────────────────────────── */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#1F2430]">Upcoming External Events</h3>
              <button className="flex items-center gap-1.5 text-sm text-[#7A42E8] font-semibold hover:underline">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
            <div className="space-y-3">
              {upcomingExternalEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FB] border border-[#DDDCE7]">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[40px]">
                      <div className="text-xl font-bold text-[#1F2430] leading-none">{new Date(event.startDate).getDate()}</div>
                      <div className="text-xs text-[#7A7F8C] uppercase">{new Date(event.startDate).toLocaleDateString('en-AU', { month: 'short' })}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-[#1F2430] text-sm">{event.maskedTitle || event.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getSourceColor(event.source)}`}>
                          {getSourceLabel(event.source)}
                        </span>
                        {event.status === 'tentative' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Tentative</span>
                        )}
                      </div>
                      <div className="text-xs text-[#7A7F8C]">{event.startTime} – {event.endTime}</div>
                      {event.maskedTitle && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Lock className="w-2.5 h-2.5 text-[#7A42E8]" />
                          <span className="text-[10px] text-[#7A42E8] font-medium">Title masked from clients</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="px-3 py-2 rounded-xl border border-[#DDDCE7] text-xs text-[#7A7F8C] hover:bg-white transition-colors">
                    Ignore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Conflicts tab ────────────────────────────────────────── */}
        {activeTab === 'conflicts' && (
          <div className="space-y-4">
            {unresolvedConflicts.length > 0 ? (
              <>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <p className="text-sm text-amber-700">These events overlap between your internal schedule and external calendars. Choose how to resolve each conflict.</p>
                  </div>
                </div>
                {unresolvedConflicts.map(conflict => (
                  <div key={conflict.id} className="bg-white rounded-2xl border border-[#DDDCE7] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-bold text-[#1F2430]">
                        Conflict on {new Date(conflict.date).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                        {conflict.conflictType === 'overlap' ? 'Overlap' : 'Duplicate'}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      <div className="p-4 rounded-xl bg-[#F4EEFD] border border-[#E3DBF9]">
                        <div className="text-xs font-semibold text-[#7A42E8] mb-1">Internal Event</div>
                        <div className="font-medium text-[#1F2430]">Spring Gala Performance</div>
                        <div className="text-xs text-[#7A7F8C]">18:00 – 22:00 · Booked job</div>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="text-xs font-semibold text-amber-700 mb-1">External Event</div>
                        <div className="font-medium text-[#1F2430]">Dinner Party (Tentative)</div>
                        <div className="text-xs text-[#7A7F8C]">19:00 – 22:00 · Google Calendar</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2.5 rounded-xl bg-[#7A42E8] text-white text-sm font-semibold hover:bg-[#6816B0] transition-colors">
                        Keep Museio Event
                      </button>
                      <button className="flex-1 py-2.5 rounded-xl border border-[#DDDCE7] text-[#4F5868] text-sm font-semibold hover:bg-[#F8F9FB] transition-colors">
                        Ignore External
                      </button>
                      <button className="flex-1 py-2.5 rounded-xl border border-[#DDDCE7] text-[#4F5868] text-sm font-semibold hover:bg-[#F8F9FB] transition-colors">
                        Split Slots
                      </button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#DDDCE7]">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#1F2430] mb-2">No Conflicts</h3>
                <p className="text-[#7A7F8C]">All your calendars are in sync with no overlapping events</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connect Calendar Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConnectModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1F2430]">Connect Calendar</h2>
              <button onClick={() => setShowConnectModal(false)} className="p-2 rounded-full hover:bg-[#F8F9FB]">
                <X className="w-5 h-5 text-[#7A7F8C]" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { source: 'google', label: 'Google Calendar', sub: 'Sync events and block availability', icon: '🗓️', color: 'bg-red-50' },
                { source: 'calendly', label: 'Calendly', sub: 'Sync your Calendly bookings', icon: '📅', color: 'bg-indigo-50' },
              ].map(opt => (
                <button
                  key={opt.source}
                  onClick={() => simulateConnect(opt.source)}
                  disabled={connectingSource !== null}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[#DDDCE7] hover:border-[#7A42E8] hover:bg-[#F4EEFD] transition-all disabled:opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${opt.color} flex items-center justify-center text-2xl`}>
                      {opt.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-[#1F2430]">{opt.label}</div>
                      <div className="text-sm text-[#7A7F8C]">{opt.sub}</div>
                    </div>
                  </div>
                  {connectingSource === opt.source ? (
                    <RefreshCw className="w-5 h-5 text-[#7A42E8] animate-spin" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#7A7F8C]" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[#F4EEFD] border border-[#E3DBF9] flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#7A42E8] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#4F5868]">Museio only reads event times and status — never event details or personal data. You can revoke access at any time.</p>
            </div>
          </div>
        </div>
      )}

      {/* Permissions explainer modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPermissionsModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-[#1F2430] mb-2">Calendar Permissions</h2>
            <p className="text-[#7A7F8C] text-sm mb-6">What Museio can and cannot see from your external calendars</p>
            <div className="space-y-3 mb-6">
              {[
                { can: true, text: 'See when you are busy (event time and status)' },
                { can: true, text: 'Determine which time slots to block for public booking' },
                { can: true, text: 'Refresh availability automatically every 15 minutes' },
                { can: false, text: 'Read event titles, descriptions, or attendees' },
                { can: false, text: 'Create, edit, or delete your calendar events' },
                { can: false, text: 'Access your email or any other Google account data' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.can ? 'bg-green-100' : 'bg-red-100'}`}>
                    {item.can ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-red-500" />}
                  </div>
                  <span className="text-sm text-[#4F5868]">{item.text}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPermissionsModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold">
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
