import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export function Home() {
  const navigate = useNavigate();
  const { jobs } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get days for calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get jobs for selected date
  const getJobsForDate = (date: Date) => {
    return jobs.filter(job => {
      if (job.status === 'deleted') return false;
      const jobStart = new Date(job.startDate);
      const jobEnd = new Date(job.endDate);
      const checkDate = new Date(date.toDateString());
      const startDate = new Date(jobStart.toDateString());
      const endDate = new Date(jobEnd.toDateString());
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const getJobCountForDay = (date: Date) => {
    return getJobsForDate(date).length;
  };

  const selectedDayJobs = getJobsForDate(selectedDate);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-[#7A42E8]';
      case 'invoice-sent':
        return 'bg-orange-500';
      case 'paid':
        return 'bg-[#45C05A]';
      default:
        return 'bg-[#A4A9B6]';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] flex items-center justify-center">
              <span className="font-bold text-white text-lg">M</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1F2430]">MUSEIO</h1>
          </div>
          <button
            onClick={() => navigate('/app/jobs/new')}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New </span>
            <span>Job</span>
          </button>
        </div>

        {/* Calendar Card */}
        <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6 md:p-8 mb-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1F2430]">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousMonth}
                className="p-2 rounded-lg hover:bg-[#F4EEFD] transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#4F5868]" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-[#F4EEFD] transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#4F5868]" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-[#7A7F8C] py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const jobCount = getJobCountForDay(day);
              const hasJobs = jobCount > 0;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square p-2 rounded-xl transition-all relative ${
                    isSelected
                      ? 'bg-[#7A42E8] text-white'
                      : isCurrentMonth
                      ? 'hover:bg-[#F4EEFD] text-[#1F2430]'
                      : 'text-[#A4A9B6]'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={`text-sm font-medium ${!isCurrentMonth && !isSelected ? 'opacity-40' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {hasJobs && (
                      <div className={`flex gap-0.5 mt-1 ${isSelected ? 'opacity-100' : 'opacity-60'}`}>
                        {Array.from({ length: Math.min(jobCount, 3) }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#7A42E8]'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Jobs */}
        <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#1F2430]">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <span className="text-sm text-[#7A7F8C]">
              {selectedDayJobs.length} {selectedDayJobs.length === 1 ? 'job' : 'jobs'}
            </span>
          </div>

          {/* Jobs List */}
          {selectedDayJobs.length > 0 ? (
            <div className="space-y-4">
              {selectedDayJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl border-2 border-[#DDDCE7] hover:border-[#8F6EE6] transition-all cursor-pointer group"
                  onClick={() => navigate(`/app/jobs/${job.id}/edit`)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-1 h-16 rounded-full ${getStatusColor(job.status)}`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-[#1F2430] group-hover:text-[#7A42E8] transition-colors">
                          {job.title}
                        </h4>
                        <span className="text-sm font-medium text-[#7A7F8C] capitalize">
                          {job.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#7A7F8C]">
                        <span>{job.startTime} - {job.endTime}</span>
                        {job.clientId && <span>•</span>}
                        <span>{job.jobNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-10 h-10 text-[#7A42E8]" />
              </div>
              <h4 className="font-semibold text-[#1F2430] mb-2">No jobs scheduled</h4>
              <p className="text-[#7A7F8C] mb-6">
                You don't have any jobs on this date
              </p>
              <button
                onClick={() => navigate('/app/jobs/new')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all"
              >
                Add a Job
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}