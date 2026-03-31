import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, User, MapPin,
  DollarSign, CheckCircle2, Loader2, Plus, Trash2, Star, Package, AlertTriangle,
  Check,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

type BookingMode = 'single' | 'multiple' | 'residency';
type BookingStep = 0 | 1 | 2 | 3 | 4 | 5;

interface SlotEntry {
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'unavailable';
}

interface BookingData {
  mode: BookingMode;
  date: string;
  time: string;
  slots: SlotEntry[];
  name: string;
  email: string;
  phone: string;
  eventName: string;
  eventDescription: string;
  location: string;
  budget: string;
  packageDiscount: number;
}

export function PublicBooking() {
  const { nickname } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<BookingStep>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    mode: 'single',
    date: '',
    time: '',
    slots: [],
    name: '',
    email: '',
    phone: '',
    eventName: '',
    eventDescription: '',
    location: '',
    budget: '',
    packageDiscount: 0,
  });

  const availableDates = ['2026-03-28', '2026-03-29', '2026-04-05', '2026-04-12', '2026-04-19', '2026-04-26'];
  const availableTimes = ['14:00', '16:00', '18:00', '20:00'];
  const totalSteps = bookingData.mode === 'single' ? 4 : 5;

  const updateData = (field: keyof BookingData, value: any) => {
    setBookingData({ ...bookingData, [field]: value });
  };

  const toggleMultiDate = (date: string) => {
    const existing = bookingData.slots.find(s => s.date === date);
    if (existing) {
      updateData('slots', bookingData.slots.filter(s => s.date !== date));
    } else {
      updateData('slots', [...bookingData.slots, { date, startTime: '18:00', endTime: '22:00', status: 'available' }]);
    }
  };

  const updateSlotTime = (date: string, field: 'startTime' | 'endTime', value: string) => {
    updateData('slots', bookingData.slots.map(s => s.date === date ? { ...s, [field]: value } : s));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // mode is always selected
      case 1:
        return bookingData.mode === 'single' ? bookingData.date !== '' : bookingData.slots.length > 0;
      case 2:
        return bookingData.mode === 'single' ? bookingData.time !== '' : true;
      case 3:
        return !!(bookingData.name && bookingData.email && bookingData.phone);
      case 4:
        return !!(bookingData.eventName && bookingData.eventDescription && bookingData.location);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (bookingData.mode === 'single' && currentStep === 2) {
      // Skip slot review step for single mode
      setCurrentStep(3);
    } else if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as BookingStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      if (bookingData.mode === 'single' && currentStep === 3) {
        setCurrentStep(2);
      } else {
        setCurrentStep((currentStep - 1) as BookingStep);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setCurrentStep(5);
  };

  const totalSlots = bookingData.mode === 'single' ? 1 : bookingData.slots.length;
  const displayStep = currentStep === 0 ? 0 : currentStep;

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#DDDCE7]">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={() => navigate(`/${nickname}`)}
            className="flex items-center gap-2 text-[#7A42E8] font-medium hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Portfolio</span>
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      {currentStep > 0 && currentStep < 5 && (
        <div className="bg-white border-b border-[#DDDCE7] py-4">
          <div className="container mx-auto px-6 max-w-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#4F5868]">Step {currentStep} of {totalSteps}</span>
              <div className="flex items-center gap-2">
                {bookingData.mode !== 'single' && (
                  <span className="px-2 py-0.5 rounded-full bg-[#F4EEFD] text-[#7A42E8] text-xs font-semibold">
                    {bookingData.mode === 'multiple' ? 'Multi-date' : 'Residency'}
                  </span>
                )}
                <span className="text-sm text-[#7A7F8C]">{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-[#F4EEFD] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-12 max-w-2xl">

        {/* Step 0: Booking Mode Selection */}
        {currentStep === 0 && (
          <div className="animate-in fade-in slide-in-from-right-5 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-[#7A42E8]" />
              </div>
              <h1 className="text-3xl font-bold text-[#1F2430] mb-2">How would you like to book?</h1>
              <p className="text-[#7A7F8C]">Choose a booking type to get started</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 'single' as BookingMode,
                  label: 'Single Date',
                  sub: 'One-off performance or event',
                  icon: CalendarIcon,
                  color: 'text-[#7A42E8]',
                  bg: 'bg-[#F4EEFD]',
                },
                {
                  id: 'multiple' as BookingMode,
                  label: 'Multiple Dates',
                  sub: 'Book several performances in one request — tours, event series, or festival packages',
                  icon: Plus,
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                  badge: 'Popular for festivals',
                },
                {
                  id: 'residency' as BookingMode,
                  label: 'Residency Package',
                  sub: 'Regular recurring bookings — weekly Friday residency, monthly series, or seasonal slots',
                  icon: Star,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50',
                  badge: 'Best value',
                },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateData('mode', opt.id)}
                  className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                    bookingData.mode === opt.id
                      ? 'border-[#7A42E8] bg-[#F4EEFD]'
                      : 'border-[#DDDCE7] bg-white hover:border-[#8F6EE6]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${opt.bg} flex items-center justify-center flex-shrink-0`}>
                    <opt.icon className={`w-6 h-6 ${opt.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#1F2430]">{opt.label}</span>
                      {(opt as any).badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[#7A42E8] text-white text-[10px] font-bold">{(opt as any).badge}</span>
                      )}
                    </div>
                    <p className="text-sm text-[#7A7F8C]">{opt.sub}</p>
                  </div>
                  {bookingData.mode === opt.id && (
                    <div className="w-6 h-6 rounded-full bg-[#7A42E8] flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {bookingData.mode === 'residency' && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-sm font-semibold text-amber-900 mb-2">Residency Presets</div>
                <div className="flex flex-wrap gap-2">
                  {['Weekly Friday residency', 'Weekend series', 'Monthly recurring set', 'Festival run'].map(preset => (
                    <button key={preset} className="px-3 py-1.5 rounded-full bg-white border border-amber-300 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors">
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Date Selection */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-right-5 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-[#7A42E8]" />
              </div>
              <h1 className="text-3xl font-bold text-[#1F2430] mb-2">
                {bookingData.mode === 'single' ? 'Select a Date' : 'Select Your Dates'}
              </h1>
              <p className="text-[#7A7F8C]">
                {bookingData.mode === 'single' ? 'Choose your preferred event date' : `Select all dates — ${bookingData.slots.length} selected`}
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#DDDCE7] p-8">
              {bookingData.mode !== 'single' && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-700">Tap multiple dates to add them to your booking package</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {availableDates.map((date) => {
                  const dateObj = new Date(date);
                  const isSingle = bookingData.mode === 'single';
                  const isSelectedSingle = isSingle && bookingData.date === date;
                  const isSelectedMulti = !isSingle && bookingData.slots.some(s => s.date === date);
                  const isSelected = isSelectedSingle || isSelectedMulti;

                  return (
                    <button
                      key={date}
                      onClick={() => isSingle ? updateData('date', date) : toggleMultiDate(date)}
                      className={`p-6 rounded-2xl border-2 transition-all relative ${
                        isSelected
                          ? 'border-[#7A42E8] bg-[#F4EEFD]'
                          : 'border-[#DDDCE7] hover:border-[#8F6EE6] hover:bg-[#F8F9FB]'
                      }`}
                    >
                      {!isSingle && isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#7A42E8] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="text-sm text-[#7A7F8C] mb-1">
                        {dateObj.toLocaleDateString('en-AU', { weekday: 'short' })}
                      </div>
                      <div className="text-2xl font-bold text-[#1F2430]">
                        {dateObj.getDate()}
                      </div>
                      <div className="text-sm text-[#4F5868]">
                        {dateObj.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Multi-date selected summary */}
              {bookingData.mode !== 'single' && bookingData.slots.length > 0 && (
                <div className="mt-5 p-4 rounded-xl bg-[#F4EEFD] border border-[#E3DBF9]">
                  <div className="font-semibold text-[#7A42E8] mb-2 text-sm">{bookingData.slots.length} dates selected</div>
                  <div className="flex flex-wrap gap-2">
                    {bookingData.slots.map(s => (
                      <span key={s.date} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7A42E8] text-white text-xs font-semibold">
                        {new Date(s.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                        <button onClick={() => toggleMultiDate(s.date)} className="hover:opacity-70">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Time Selection / Slot Review */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-5 duration-300">
            {bookingData.mode === 'single' ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-[#7A42E8]" />
                  </div>
                  <h1 className="text-3xl font-bold text-[#1F2430] mb-2">Select a Time</h1>
                  <p className="text-[#7A7F8C]">
                    Available slots for {new Date(bookingData.date).toLocaleDateString('en-AU', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-white rounded-3xl border border-[#DDDCE7] p-8">
                  <div className="grid grid-cols-2 gap-4">
                    {availableTimes.map((time) => {
                      const isSelected = bookingData.time === time;
                      return (
                        <button
                          key={time}
                          onClick={() => updateData('time', time)}
                          className={`p-6 rounded-2xl border-2 transition-all ${
                            isSelected
                              ? 'border-[#7A42E8] bg-[#F4EEFD]'
                              : 'border-[#DDDCE7] hover:border-[#8F6EE6] hover:bg-[#F8F9FB]'
                          }`}
                        >
                          <div className="text-xl font-bold text-[#1F2430]">{time}</div>
                          <div className="text-sm text-[#7A7F8C] mt-1">Available</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-[#7A42E8]" />
                  </div>
                  <h1 className="text-3xl font-bold text-[#1F2430] mb-2">Set Times for Each Date</h1>
                  <p className="text-[#7A7F8C]">Configure start and end times for each slot</p>
                </div>

                {/* Bulk apply */}
                <div className="mb-4 bg-white rounded-2xl border border-[#DDDCE7] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1F2430]">Apply to all dates</span>
                    <div className="flex items-center gap-3">
                      <input type="time" defaultValue="18:00"
                        onChange={e => updateData('slots', bookingData.slots.map(s => ({ ...s, startTime: e.target.value })))}
                        className="px-3 py-1.5 rounded-lg border border-[#DDDCE7] text-sm" />
                      <span className="text-[#7A7F8C] text-sm">to</span>
                      <input type="time" defaultValue="22:00"
                        onChange={e => updateData('slots', bookingData.slots.map(s => ({ ...s, endTime: e.target.value })))}
                        className="px-3 py-1.5 rounded-lg border border-[#DDDCE7] text-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {bookingData.slots.map(slot => (
                    <div key={slot.date} className={`bg-white rounded-2xl border-2 p-5 ${slot.status === 'unavailable' ? 'border-red-200' : 'border-[#DDDCE7]'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-[#1F2430]">
                          {new Date(slot.date).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                        {slot.status === 'unavailable' ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                            <AlertTriangle className="w-3 h-3" /> Unavailable
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            <Check className="w-3 h-3" /> Available
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="time" value={slot.startTime}
                          onChange={e => updateSlotTime(slot.date, 'startTime', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none text-sm flex-1" />
                        <span className="text-[#7A7F8C] text-sm">to</span>
                        <input type="time" value={slot.endTime}
                          onChange={e => updateSlotTime(slot.date, 'endTime', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none text-sm flex-1" />
                        <button onClick={() => toggleMultiDate(slot.date)} className="p-2 text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Contact Details */}
        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-right-5 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-[#7A42E8]" />
              </div>
              <h1 className="text-3xl font-bold text-[#1F2430] mb-2">Your Contact Details</h1>
              <p className="text-[#7A7F8C]">How can we reach you?</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#DDDCE7] p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Full Name <span className="text-[#7A42E8]">*</span></label>
                <input type="text" value={bookingData.name} onChange={e => updateData('name', e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Email <span className="text-[#7A42E8]">*</span></label>
                <input type="email" value={bookingData.email} onChange={e => updateData('email', e.target.value)}
                  placeholder="john@example.com.au"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Phone <span className="text-[#7A42E8]">*</span></label>
                <input type="tel" value={bookingData.phone} onChange={e => updateData('phone', e.target.value)}
                  placeholder="+61 412 345 678"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors" />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Event Details */}
        {currentStep === 4 && (
          <div className="animate-in fade-in slide-in-from-right-5 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#7A42E8]" />
              </div>
              <h1 className="text-3xl font-bold text-[#1F2430] mb-2">Event Details</h1>
              <p className="text-[#7A7F8C]">Tell us about your event</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#DDDCE7] p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Event Name <span className="text-[#7A42E8]">*</span></label>
                <input type="text" value={bookingData.eventName} onChange={e => updateData('eventName', e.target.value)}
                  placeholder="Summer Pool Party"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Event Description <span className="text-[#7A42E8]">*</span></label>
                <textarea value={bookingData.eventDescription} onChange={e => updateData('eventDescription', e.target.value)}
                  placeholder="Tell us about your event, expected number of guests, music preferences, etc."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Location <span className="text-[#7A42E8]">*</span></label>
                <input type="text" value={bookingData.location} onChange={e => updateData('location', e.target.value)}
                  placeholder="Sydney, NSW"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Budget (Optional)</label>
                <input type="text" value={bookingData.budget} onChange={e => updateData('budget', e.target.value)}
                  placeholder="$1,000 – $1,500 per session"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors" />
              </div>

              {/* Package summary for multi-slot */}
              {bookingData.mode !== 'single' && bookingData.slots.length > 0 && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-[#F4EEFD] to-[#E3DBF9] border border-[#DDDCE7]">
                  <h4 className="font-bold text-[#1F2430] mb-3">Package Summary</h4>
                  <div className="space-y-2 mb-3">
                    {bookingData.slots.map(slot => (
                      <div key={slot.date} className="flex items-center justify-between text-sm">
                        <span className="text-[#4F5868]">{new Date(slot.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        <span className="text-[#7A7F8C]">{slot.startTime} – {slot.endTime}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#DDDCE7]">
                    <span className="font-semibold text-[#1F2430] text-sm">{bookingData.slots.length} date{bookingData.slots.length > 1 ? 's' : ''} in package</span>
                    {bookingData.slots.length >= 3 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#7A42E8] text-white text-xs font-bold">Eligible for package discount</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {currentStep === 5 && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h1 className="text-4xl font-bold text-[#1F2430] mb-4">Request Submitted!</h1>
              <p className="text-xl text-[#4F5868] mb-8 max-w-md mx-auto">
                {bookingData.mode === 'single'
                  ? "Your booking request has been sent. You'll receive a quote within 24 hours."
                  : `Your ${bookingData.slots.length > 0 ? bookingData.slots.length + '-date ' : ''}package request has been sent. The artist will send a consolidated quote.`}
              </p>

              <div className="bg-white rounded-3xl border border-[#DDDCE7] p-8 max-w-md mx-auto mb-8 text-left">
                <h2 className="font-bold text-[#1F2430] mb-4">Booking Summary</h2>
                <div className="space-y-3 text-sm">
                  {bookingData.mode === 'single' ? (
                    <>
                      <div className="flex items-center gap-3 text-[#4F5868]">
                        <CalendarIcon className="w-5 h-5 text-[#7A42E8]" />
                        <span>{bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#4F5868]">
                        <Clock className="w-5 h-5 text-[#7A42E8]" />
                        <span>{bookingData.time || '—'}</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      {bookingData.slots.map(slot => (
                        <div key={slot.date} className="flex items-center justify-between p-3 rounded-xl bg-[#F4EEFD]">
                          <span className="font-medium text-[#1F2430]">{new Date(slot.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                          <span className="text-[#7A7F8C]">{slot.startTime} – {slot.endTime}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[#4F5868]">
                    <MapPin className="w-5 h-5 text-[#7A42E8]" />
                    <span>{bookingData.location || '—'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/${nickname}`)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all"
              >
                Back to Portfolio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 5 && (
        <div className="bg-white border-t border-[#DDDCE7] py-6">
          <div className="container mx-auto px-6 max-w-2xl flex items-center justify-between gap-4">
            {currentStep > 0 ? (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl border-2 border-[#DDDCE7] text-[#4F5868] font-semibold hover:bg-[#F8F9FB] transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep === 4 ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> Submit Request</>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}