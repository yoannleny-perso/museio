import { useState } from 'react';
import {
  Calendar, Plus, Trash2, Settings as SettingsIcon, Eye, EyeOff,
  Link as LinkIcon, AlertTriangle, CheckCircle, Clock, Briefcase,
  ChevronRight, X, Layers, RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DayAvailability, TimeSlot } from '../../types';
import { useNavigate } from 'react-router';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Layer legend ─────────────────────────────────────────────────────────────
const availabilityLayers = [
  { id: 'internal', label: 'My schedule', color: 'bg-[#7A42E8]', description: 'Weekly working hours' },
  { id: 'jobs', label: 'Booked jobs', color: 'bg-blue-500', description: 'Confirmed and upcoming gigs' },
  { id: 'vacation', label: 'Vacations', color: 'bg-amber-500', description: 'Blocked vacation periods' },
  { id: 'google', label: 'Google Calendar', color: 'bg-red-500', description: 'External calendar events' },
  { id: 'calendly', label: 'Calendly', color: 'bg-indigo-500', description: 'Calendly bookings' },
];

// ─── Sample external events overlaid on days ──────────────────────────────────
const externalBlocks = [
  { day: 'tuesday', start: '14:00', end: '15:00', source: 'google', title: 'Busy', masked: true },
  { day: 'thursday', start: '10:00', end: '11:30', source: 'google', title: 'Busy', masked: true },
  { day: 'saturday', start: '13:00', end: '14:00', source: 'calendly', title: 'Consultation', masked: false },
];

export function Availability() {
  const navigate = useNavigate();
  const { weekAvailability, updateWeekAvailability, vacationPeriods, addVacationPeriod, deleteVacationPeriod, availabilitySettings, updateAvailabilitySettings } = useApp();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [vacationForm, setVacationForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(['internal', 'jobs', 'vacation', 'google', 'calendly']));
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'layers' | 'vacations'>('schedule');

  const toggleDayEnabled = (day: typeof DAYS[number]) => {
    updateWeekAvailability({ ...weekAvailability, [day]: { ...weekAvailability[day], enabled: !weekAvailability[day].enabled } });
  };

  const addTimeSlot = (day: typeof DAYS[number]) => {
    const slots = weekAvailability[day].slots;
    const newSlot: TimeSlot = { start: slots.length > 0 ? slots[slots.length - 1].end : '09:00', end: '17:00' };
    updateWeekAvailability({ ...weekAvailability, [day]: { ...weekAvailability[day], slots: [...slots, newSlot] } });
  };

  const removeTimeSlot = (day: typeof DAYS[number], index: number) => {
    const slots = weekAvailability[day].slots.filter((_, i) => i !== index);
    updateWeekAvailability({ ...weekAvailability, [day]: { ...weekAvailability[day], slots } });
  };

  const updateTimeSlot = (day: typeof DAYS[number], index: number, field: 'start' | 'end', value: string) => {
    const slots = [...weekAvailability[day].slots];
    slots[index] = { ...slots[index], [field]: value };
    updateWeekAvailability({ ...weekAvailability, [day]: { ...weekAvailability[day], slots } });
  };

  const handleAddVacation = () => {
    if (vacationForm.startDate && vacationForm.endDate) {
      addVacationPeriod(vacationForm);
      setVacationForm({ startDate: '', endDate: '', reason: '' });
      setShowVacationModal(false);
    }
  };

  const toggleLayer = (id: string) => {
    const s = new Set(activeLayers);
    s.has(id) ? s.delete(id) : s.add(id);
    setActiveLayers(s);
  };

  const activeLayerCount = activeLayers.size;
  const externalConflicts = externalBlocks.filter(() => activeLayers.has('google') || activeLayers.has('calendly'));

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 md:p-6 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Calendar className="w-7 h-7 text-[#7A42E8]" />
            <div>
              <h1 className="text-2xl font-bold text-[#1F2430]">My Availability</h1>
              <p className="text-xs text-[#7A7F8C]">Manage your working hours, blocks, and external calendars</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${showPreview ? 'bg-[#F4EEFD] border-[#7A42E8] text-[#7A42E8]' : 'border-[#DDDCE7] text-[#4F5868] hover:bg-white'}`}>
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
            <button onClick={() => setShowSettingsModal(true)}
              className="p-2.5 rounded-xl border border-[#DDDCE7] text-[#4F5868] hover:bg-white transition-colors">
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* External conflicts banner */}
        {externalConflicts.length > 0 && activeLayers.has('google') && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-amber-900 text-sm">External Calendar Active</div>
                <div className="text-xs text-amber-700">{externalBlocks.length} external events are currently blocking public booking slots</div>
              </div>
            </div>
            <button onClick={() => navigate('/app/connected-calendars')}
              className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold hover:underline flex-shrink-0">
              Manage <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex gap-1 bg-white border border-[#DDDCE7] rounded-2xl p-1 mb-5">
          {[
            { id: 'schedule', label: 'Weekly Schedule', icon: Clock },
            { id: 'layers', label: 'Availability Layers', icon: Layers },
            { id: 'vacations', label: 'Vacations & Blocks', icon: Calendar },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white' : 'text-[#7A7F8C] hover:text-[#1F2430]'}`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Public booking preview banner */}
        {showPreview && (
          <div className="mb-5 p-5 rounded-2xl bg-white border-2 border-[#7A42E8]">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-[#7A42E8]" />
              <span className="font-bold text-[#1F2430] text-sm">Public Booking Preview</span>
              <span className="text-xs text-[#7A7F8C]">This is what clients see when booking</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((day, i) => {
                const dayData = weekAvailability[day];
                const hasExternal = activeLayers.has('google') && externalBlocks.some(b => b.day === day);
                return (
                  <div key={day} className="text-center">
                    <div className="text-xs text-[#7A7F8C] mb-1">{DAY_SHORT[i]}</div>
                    <div className={`h-16 rounded-lg text-xs flex flex-col items-center justify-center gap-1 border ${
                      !dayData.enabled ? 'bg-[#F8F9FB] border-[#DDDCE7] text-[#A4A9B6]'
                      : hasExternal ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-green-50 border-green-200 text-green-700'
                    }`}>
                      {!dayData.enabled ? (
                        <span className="text-[10px]">Off</span>
                      ) : hasExternal ? (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-[9px]">Partial</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span className="text-[9px]">Open</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[#7A7F8C] mt-2 text-center">Legend: <span className="text-green-600 font-medium">Green = Open</span> · <span className="text-amber-600 font-medium">Yellow = Partial (external block)</span> · <span className="text-[#A4A9B6] font-medium">Gray = Unavailable</span></p>
          </div>
        )}

        {/* ── Schedule tab ───────────────────────────────────────── */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6">
            <h2 className="font-bold text-[#1F2430] mb-5">Weekly Working Hours</h2>
            <div className="space-y-3">
              {DAYS.map((day, index) => {
                const dayData = weekAvailability[day];
                const hasExternalBlock = activeLayers.has('google') && externalBlocks.some(b => b.day === day);
                return (
                  <div key={day} className={`flex flex-col md:flex-row gap-4 p-4 rounded-2xl border transition-all ${dayData.enabled ? 'border-[#DDDCE7] bg-white' : 'border-[#F8F9FB] bg-[#F8F9FB]'}`}>
                    <div className="flex items-center gap-4 md:w-48 flex-shrink-0">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => toggleDayEnabled(day)}
                          className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${dayData.enabled ? 'bg-[#7A42E8]' : 'bg-[#DDDCE7]'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${dayData.enabled ? 'left-5' : 'left-1'}`} />
                        </div>
                        <span className={`font-semibold ${dayData.enabled ? 'text-[#1F2430]' : 'text-[#A4A9B6]'}`}>
                          {DAY_LABELS[index]}
                        </span>
                      </label>
                    </div>

                    {dayData.enabled ? (
                      <div className="flex-1 space-y-2">
                        {dayData.slots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex items-center gap-3">
                            <input type="time" value={slot.start}
                              onChange={e => updateTimeSlot(day, slotIndex, 'start', e.target.value)}
                              className="px-3 py-2 rounded-lg border border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none text-sm" />
                            <span className="text-[#7A7F8C] text-sm">to</span>
                            <input type="time" value={slot.end}
                              onChange={e => updateTimeSlot(day, slotIndex, 'end', e.target.value)}
                              className="px-3 py-2 rounded-lg border border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none text-sm" />
                            {dayData.slots.length > 1 && (
                              <button onClick={() => removeTimeSlot(day, slotIndex)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => addTimeSlot(day)}
                          className="text-xs text-[#7A42E8] font-medium hover:underline flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Add time slot
                        </button>
                        {hasExternalBlock && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-xs text-amber-700 font-medium">External calendar blocks part of this day</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center text-[#A4A9B6] italic text-sm">Unavailable</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Layers tab ──────────────────────────────────────────── */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-[#1F2430]">Availability Layers</h2>
                  <p className="text-xs text-[#7A7F8C] mt-0.5">Control which calendars and event types affect your public booking availability</p>
                </div>
                <span className="text-sm text-[#7A7F8C]">{activeLayerCount} active</span>
              </div>

              <div className="space-y-3">
                {availabilityLayers.map(layer => (
                  <div key={layer.id} className="flex items-center justify-between p-4 rounded-xl border border-[#DDDCE7]">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-8 rounded-full ${layer.color}`} />
                      <div>
                        <div className="font-medium text-[#1F2430]">{layer.label}</div>
                        <div className="text-xs text-[#7A7F8C]">{layer.description}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleLayer(layer.id)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${activeLayers.has(layer.id) ? 'bg-[#7A42E8]' : 'bg-[#DDDCE7]'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${activeLayers.has(layer.id) ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* External calendar events */}
            <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#1F2430]">Active External Blocks</h3>
                <button onClick={() => navigate('/app/connected-calendars')}
                  className="text-sm text-[#7A42E8] font-semibold hover:underline flex items-center gap-1">
                  Manage Calendars <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {externalBlocks.length > 0 ? (
                <div className="space-y-3">
                  {externalBlocks.map((block, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FB] border border-[#DDDCE7]">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${block.source === 'google' ? 'bg-red-500' : 'bg-indigo-500'}`} />
                        <div>
                          <div className="font-medium text-[#1F2430] text-sm">
                            {DAY_LABELS[DAYS.indexOf(block.day as any)]} {block.start}–{block.end}
                          </div>
                          <div className="text-xs text-[#7A7F8C] flex items-center gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${block.source === 'google' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                              {block.source === 'google' ? 'Google' : 'Calendly'}
                            </span>
                            {block.masked ? 'Shown as "Busy" to public' : block.title}
                          </div>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg border border-[#DDDCE7] text-xs text-[#7A7F8C] hover:bg-white transition-colors">
                        Ignore
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <RefreshCw className="w-8 h-8 text-[#DDDCE7] mx-auto mb-2" />
                  <p className="text-sm text-[#7A7F8C]">No external calendar events found</p>
                </div>
              )}
            </div>

            {/* Connect calendar CTA */}
            <button onClick={() => navigate('/app/connected-calendars')}
              className="w-full p-5 rounded-2xl bg-white border border-[#DDDCE7] hover:border-[#7A42E8] transition-all flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-[#F4EEFD] flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-6 h-6 text-[#7A42E8]" />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-[#1F2430]">Connected Calendars</div>
                <div className="text-sm text-[#7A7F8C]">Your calendar is protecting public booking slots — manage Google Calendar and Calendly sync</div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#7A7F8C] group-hover:text-[#7A42E8] transition-colors" />
            </button>
          </div>
        )}

        {/* ── Vacations tab ───────────────────────────────────────── */}
        {activeTab === 'vacations' && (
          <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[#1F2430]">Vacation Periods & Manual Blocks</h2>
              <button onClick={() => setShowVacationModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7A42E8] text-white text-sm font-semibold hover:bg-[#6816B0] transition-colors">
                <Plus className="w-4 h-4" /> Add Block
              </button>
            </div>
            {vacationPeriods.length > 0 ? (
              <div className="space-y-3">
                {vacationPeriods.map(period => (
                  <div key={period.id} className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-amber-900">
                          {new Date(period.startDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} –{' '}
                          {new Date(period.endDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        {period.reason && <div className="text-sm text-amber-700">{period.reason}</div>}
                      </div>
                    </div>
                    <button onClick={() => deleteVacationPeriod(period.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Calendar className="w-12 h-12 text-[#DDDCE7] mx-auto mb-3" />
                <p className="font-medium text-[#1F2430] mb-1">No vacation periods</p>
                <p className="text-sm text-[#7A7F8C]">Add vacation periods or manual blocks to temporarily pause public bookings</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettingsModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-[#1F2430] mb-6">Booking Settings</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Minimum Notice (hours)</label>
                <input type="number" value={availabilitySettings.minimumNoticeHours}
                  onChange={e => updateAvailabilitySettings({ minimumNoticeHours: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none" />
                <p className="text-xs text-[#7A7F8C] mt-1">Minimum lead time for booking requests</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Booking Buffer (minutes)</label>
                <input type="number" value={availabilitySettings.bookingBufferMinutes}
                  onChange={e => updateAvailabilitySettings({ bookingBufferMinutes: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none" />
                <p className="text-xs text-[#7A7F8C] mt-1">Gap between bookings (setup/breakdown time)</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-[#DDDCE7]">
                <input type="checkbox" checked={availabilitySettings.breaksEnabled}
                  onChange={e => updateAvailabilitySettings({ breaksEnabled: e.target.checked })} className="w-5 h-5 rounded" />
                <div>
                  <div className="font-medium text-[#1F2430]">Enable Breaks</div>
                  <div className="text-xs text-[#7A7F8C]">Allow break time between bookings</div>
                </div>
              </label>
            </div>
            <button onClick={() => setShowSettingsModal(false)}
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold">
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Vacation Modal */}
      {showVacationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowVacationModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-[#1F2430] mb-6">Add Vacation / Block</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Start Date</label>
                <input type="date" value={vacationForm.startDate}
                  onChange={e => setVacationForm({ ...vacationForm, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">End Date</label>
                <input type="date" value={vacationForm.endDate}
                  onChange={e => setVacationForm({ ...vacationForm, endDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Label (Optional)</label>
                <input type="text" value={vacationForm.reason}
                  onChange={e => setVacationForm({ ...vacationForm, reason: e.target.value })}
                  placeholder="e.g. Summer vacation, Tour, Unavailable"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowVacationModal(false)} className="flex-1 py-3 rounded-xl border-2 border-[#DDDCE7] font-semibold text-[#4F5868]">
                Cancel
              </button>
              <button onClick={handleAddVacation} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold">
                Add Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
