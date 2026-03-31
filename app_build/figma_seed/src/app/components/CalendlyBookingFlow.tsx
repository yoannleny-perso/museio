import { useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Globe, Calendar, Clock } from 'lucide-react';

interface CalendlyBookingFlowProps {
  artistName: string;
  onClose: () => void;
  theme: any;
}

type BookingStep = 'date' | 'time' | 'details';

interface BookingFormData {
  date: Date | null;
  startTime: string;
  duration: number; // in minutes
  name: string;
  email: string;
  notes: string;
}

// Mock availability: DJ is available 10:00 AM - 11:00 PM (23:00)
const DJ_START_HOUR = 10;
const DJ_END_HOUR = 23;

export function CalendlyBookingFlow({ artistName, onClose, theme }: CalendlyBookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('date');
  const [formData, setFormData] = useState<BookingFormData>({
    date: null,
    startTime: '',
    duration: 120, // default 2 hours
    name: '',
    email: '',
    notes: '',
  });

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate time slots (30-minute intervals)
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = DJ_START_HOUR; hour <= DJ_END_HOUR; hour++) {
      for (let minute of [0, 30]) {
        if (hour === DJ_END_HOUR && minute > 0) break;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Check if a time slot is available based on selected duration
  const isTimeSlotAvailable = (timeSlot: string): boolean => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + formData.duration;
    const djEndMinutes = DJ_END_HOUR * 60;

    return endMinutes <= djEndMinutes;
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const calendarDays = useMemo(() => getCalendarDays(), [currentMonth]);

  // Check if date is in the past
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if date is selected
  const isDateSelected = (date: Date | null): boolean => {
    if (!date || !formData.date) return false;
    return date.toDateString() === formData.date.toDateString();
  };

  // Format duration for display
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return hours === 1 ? '1 hour' : `${hours} hours`;
    return `${hours}h ${mins}m`;
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (isPastDate(date)) return;
    setFormData({ ...formData, date });
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setFormData({ ...formData, startTime: time });
  };

  // Handle form submission
  const handleSubmit = () => {
    alert(`Booking submitted!\n\nDate: ${formData.date?.toLocaleDateString()}\nTime: ${formData.startTime}\nDuration: ${formatDuration(formData.duration)}\nName: ${formData.name}\nEmail: ${formData.email}`);
    onClose();
  };

  // Check if can proceed to next step
  const canProceedFromDate = formData.date !== null;
  const canProceedFromTime = formData.startTime !== '';
  const canSubmit = formData.name !== '' && formData.email !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full md:max-w-2xl rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: '#FFFFFF' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[#E8E9ED]" style={{ background: '#FFFFFF' }}>
          {currentStep !== 'date' ? (
            <button
              onClick={() => {
                if (currentStep === 'time') setCurrentStep('date');
                if (currentStep === 'details') setCurrentStep('time');
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#4B5563]" />
            </button>
          ) : (
            <div className="w-9" />
          )}

          <div className="text-center flex-1">
            <div className="text-sm text-[#6B7280] font-medium">
              {artistName}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-[#4B5563]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* DATE SELECTION STEP */}
          {currentStep === 'date' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#111827] mb-2">Select a Day</h2>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#4B5563]" />
                </button>

                <div className="text-lg font-semibold text-[#111827]">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>

                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-[#4B5563]" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="mb-6">
                {/* Day labels */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-[#6B7280] py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} />;
                    }

                    const isPast = isPastDate(date);
                    const isSelected = isDateSelected(date);
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        disabled={isPast}
                        className={`
                          aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all
                          ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-[#111827] hover:bg-blue-50 cursor-pointer'}
                          ${isSelected ? 'bg-[#0066FF] text-white hover:bg-[#0066FF]' : ''}
                          ${isToday && !isSelected ? 'bg-blue-50 font-bold text-[#0066FF]' : ''}
                        `}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timezone */}
              <div className="pt-6 border-t border-[#E8E9ED]">
                <div className="text-sm font-semibold text-[#111827] mb-3">Time zone</div>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[#E8E9ED] hover:border-[#D1D5DB] transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#6B7280]" />
                    <span className="text-[#111827]">Eastern Time - US & Canada ({new Date().toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' })})</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setCurrentStep('time')}
                disabled={!canProceedFromDate}
                className="w-full py-3 rounded-full font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: canProceedFromDate ? '#0066FF' : '#D1D5DB',
                }}
              >
                Continue
              </button>
            </div>
          )}

          {/* TIME SELECTION STEP */}
          {currentStep === 'time' && formData.date && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#111827] mb-1">
                  {formData.date.toLocaleDateString('en-US', { weekday: 'long' })}
                </h2>
                <p className="text-[#6B7280]">
                  {formData.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Duration Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#111827]">Duration</label>
                  <span className="text-sm font-semibold text-[#0066FF]">{formatDuration(formData.duration)}</span>
                </div>

                <input
                  type="range"
                  min="30"
                  max="360"
                  step="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value), startTime: '' })}
                  className="w-full h-2 bg-[#E8E9ED] rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #0066FF 0%, #0066FF ${((formData.duration - 30) / (360 - 30)) * 100}%, #E8E9ED ${((formData.duration - 30) / (360 - 30)) * 100}%, #E8E9ED 100%)`
                  }}
                />

                <div className="flex justify-between text-xs text-[#6B7280]">
                  <span>30 min</span>
                  <span>6 hours</span>
                </div>
              </div>

              {/* Time Slots */}
              <div className="pt-4 border-t border-[#E8E9ED]">
                <h3 className="text-sm font-semibold text-[#111827] mb-4">Select a Time</h3>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {timeSlots.map((time) => {
                    const isAvailable = isTimeSlotAvailable(time);
                    const isSelected = formData.startTime === time;

                    return (
                      <button
                        key={time}
                        onClick={() => isAvailable && handleTimeSelect(time)}
                        disabled={!isAvailable}
                        className={`
                          w-full py-3 rounded-lg font-semibold text-center transition-all
                          ${!isAvailable ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : ''}
                          ${isAvailable && !isSelected ? 'bg-white border-2 border-[#0066FF] text-[#0066FF] hover:bg-blue-50' : ''}
                          ${isSelected ? 'bg-[#0066FF] text-white border-2 border-[#0066FF]' : ''}
                        `}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setCurrentStep('details')}
                disabled={!canProceedFromTime}
                className="w-full py-3 rounded-full font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: canProceedFromTime ? '#0066FF' : '#D1D5DB',
                }}
              >
                Continue
              </button>
            </div>
          )}

          {/* DETAILS FORM STEP */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#111827] mb-1">Enter Details</h2>
                <p className="text-[#6B7280]">
                  {formData.date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {formData.startTime}
                </p>
              </div>

              {/* Booking Summary */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-[#0066FF] mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#111827]">
                      {formData.date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-sm text-[#6B7280]">
                      {formData.startTime} ({formatDuration(formData.duration)})
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#E8E9ED] focus:border-[#0066FF] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#E8E9ED] focus:border-[#0066FF] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    Additional notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Please share anything that will help prepare for our meeting."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#E8E9ED] focus:border-[#0066FF] focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-3 rounded-full font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: canSubmit ? '#0066FF' : '#D1D5DB',
                }}
              >
                Schedule Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom slider styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #0066FF;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #0066FF;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
