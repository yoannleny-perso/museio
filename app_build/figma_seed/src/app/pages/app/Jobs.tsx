import { useState } from 'react';
import { Search, Briefcase, Plus, DollarSign, CheckCircle2, FileText, FilePlus, MessageSquare, X, Trash2, Calendar, MapPin, Users, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { JobStatus, BookingRequest } from '../../types';

type JobTab = 'requests' | 'upcoming' | 'invoiced' | 'paid' | 'drafts';

export function Jobs() {
  const navigate = useNavigate();
  const { jobs, bookingRequests, clients, quoteRequest, declineRequest, removeRequest } = useApp();
  const [activeTab, setActiveTab] = useState<JobTab>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [quoteModal, setQuoteModal] = useState<{ show: boolean; request: BookingRequest | null }>({
    show: false,
    request: null,
  });
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');

  // Filter jobs by status
  const getFilteredJobs = (status: JobStatus | JobStatus[]) => {
    const statuses = Array.isArray(status) ? status : [status];
    return jobs.filter(job => statuses.includes(job.status));
  };

  const requestsJobs = bookingRequests;
  const upcomingJobs = getFilteredJobs('upcoming');
  const invoicedJobs = getFilteredJobs('invoice-sent');
  const paidJobs = getFilteredJobs('paid');
  const draftJobs = getFilteredJobs('drafted');

  // Get client name
  const getClientName = (clientId?: string) => {
    if (!clientId) return 'No client';
    const client = clients.find(c => c.id === clientId);
    return client?.venueName || 'Unknown client';
  };

  // Search filter
  const filterBySearch = (items: any[], searchFields: string[]) => {
    if (!searchQuery) return items;
    return items.filter(item =>
      searchFields.some(field =>
        item[field]?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  // Handle quote submission
  const handleSendQuote = () => {
    if (quoteModal.request && quoteAmount) {
      quoteRequest(quoteModal.request.id, parseFloat(quoteAmount), quoteMessage);
      setQuoteModal({ show: false, request: null });
      setQuoteAmount('');
      setQuoteMessage('');
    }
  };

  const tabs = [
    { id: 'requests' as JobTab, label: 'Requests', count: requestsJobs.length, icon: MessageSquare },
    { id: 'upcoming' as JobTab, label: 'Upcoming', count: upcomingJobs.length, icon: Briefcase },
    { id: 'invoiced' as JobTab, label: 'Invoiced', count: invoicedJobs.length, icon: FileText },
    { id: 'paid' as JobTab, label: 'Paid', count: paidJobs.length, icon: CheckCircle2 },
    { id: 'drafts' as JobTab, label: 'Drafts', count: draftJobs.length, icon: FilePlus },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-[#7A42E8]" />
            <h1 className="text-3xl font-bold text-[#1F2430]">Jobs</h1>
          </div>
          <button
            onClick={() => navigate('/app/jobs/new')}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Job</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A4A9B6]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors bg-white"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#7A42E8] text-white'
                    : 'bg-white text-[#4F5868] border border-[#DDDCE7] hover:border-[#8F6EE6]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-[#F4EEFD] text-[#7A42E8]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl border border-[#DDDCE7] p-6 md:p-8">
          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <>
              {requestsJobs.length > 0 ? (
                <div className="space-y-3">
                  {filterBySearch(requestsJobs, ['name', 'eventName']).map((request) => (
                    <BookingRequestCard
                      key={request.id}
                      request={request}
                      expanded={expandedRequest === request.id}
                      onToggleExpand={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                      onQuote={() => setQuoteModal({ show: true, request })}
                      onDecline={() => {
                        if (confirm('Decline this booking request?')) {
                          declineRequest(request.id);
                        }
                      }}
                      onRemove={() => {
                        if (confirm('Remove this request?')) {
                          removeRequest(request.id);
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="No booking requests"
                  message="You don't have any pending booking requests at the moment"
                />
              )}
            </>
          )}

          {/* Upcoming Tab */}
          {activeTab === 'upcoming' && (
            <>
              {upcomingJobs.length > 0 ? (
                <div className="space-y-4">
                  {filterBySearch(upcomingJobs, ['title', 'jobNumber']).map((job) => (
                    <JobCard key={job.id} job={job} clientName={getClientName(job.clientId)} navigate={navigate} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="No upcoming jobs"
                  message="You don't have any upcoming jobs scheduled"
                  action={{ label: 'Create Job', onClick: () => navigate('/app/jobs/new') }}
                />
              )}
            </>
          )}

          {/* Invoiced Tab */}
          {activeTab === 'invoiced' && (
            <>
              {invoicedJobs.length > 0 ? (
                <div className="space-y-4">
                  {filterBySearch(invoicedJobs, ['title', 'jobNumber']).map((job) => (
                    <JobCard key={job.id} job={job} clientName={getClientName(job.clientId)} navigate={navigate} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No invoiced jobs"
                  message="You haven't sent any invoices yet"
                />
              )}
            </>
          )}

          {/* Paid Tab */}
          {activeTab === 'paid' && (
            <>
              {paidJobs.length > 0 ? (
                <div className="space-y-4">
                  {filterBySearch(paidJobs, ['title', 'jobNumber']).map((job) => (
                    <JobCard key={job.id} job={job} clientName={getClientName(job.clientId)} navigate={navigate} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CheckCircle2}
                  title="No paid jobs"
                  message="You don't have any paid jobs yet"
                />
              )}
            </>
          )}

          {/* Drafts Tab */}
          {activeTab === 'drafts' && (
            <>
              {draftJobs.length > 0 ? (
                <div className="space-y-4">
                  {filterBySearch(draftJobs, ['title', 'jobNumber']).map((job) => (
                    <JobCard key={job.id} job={job} clientName={getClientName(job.clientId)} navigate={navigate} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FilePlus}
                  title="No draft jobs"
                  message="You don't have any draft jobs"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Quote Modal */}
      {quoteModal.show && quoteModal.request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setQuoteModal({ show: false, request: null })} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1F2430]">Send Quote</h2>
              <button
                onClick={() => setQuoteModal({ show: false, request: null })}
                className="p-2 rounded-full hover:bg-[#F8F9FB] transition-colors"
              >
                <X className="w-5 h-5 text-[#7A7F8C]" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-[#7A7F8C] mb-4">
                Sending quote for: <strong className="text-[#1F2430]">{quoteModal.request.eventName}</strong>
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">
                  Quote Amount <span className="text-[#7A42E8]">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A4A9B6]" />
                  <input
                    type="number"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    placeholder="1500"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                  placeholder="Add a personal message to your quote..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setQuoteModal({ show: false, request: null })}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-[#DDDCE7] text-[#4F5868] font-semibold hover:bg-[#F8F9FB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendQuote}
                disabled={!quoteAmount}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                Send Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Booking Request Card Component
function BookingRequestCard({ request, expanded, onToggleExpand, onQuote, onDecline, onRemove }: any) {
  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden transition-all ${
        expanded
          ? 'border-2 border-brand shadow-xl'
          : 'border border-[#DDDCE7] shadow-sm'
      }`}
    >
      {/* Collapsed View - Always Visible */}
      <div 
        className="p-8 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Header Row: Event Name + Actions */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#1F2430] text-2xl mb-3 leading-tight">
              {request.eventName}
            </h3>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
              request.status === 'quoted'
                ? 'bg-blue-50 text-blue-600'
                : request.status === 'declined'
                ? 'bg-red-50 text-red-600'
                : 'bg-[#F4EEFD] text-brand'
            }`}>
              {request.status === 'quoted' ? 'Quoted' : request.status === 'declined' ? 'Declined' : 'Pending'}
            </span>
          </div>
          
          {/* Status Indicator & Chevron */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {request.status === 'pending' && (
              <div className="w-3 h-3 rounded-full bg-brand animate-pulse" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="p-2 rounded-xl hover:bg-[#F8F9FB] transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? (
                <ChevronUp className="w-6 h-6 text-[#7A7F8C]" />
              ) : (
                <ChevronDown className="w-6 h-6 text-[#7A7F8C]" />
              )}
            </button>
          </div>
        </div>

        {/* Metadata Stack - Vertical Layout */}
        <div className="space-y-4">
          {/* Client */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#F4EEFD] flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#A4A9B6] uppercase tracking-wide mb-1">Client</div>
              <div className="font-bold text-[#1F2430] text-base truncate">{request.name}</div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#F4EEFD] flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#A4A9B6] uppercase tracking-wide mb-1">Date</div>
              <div className="font-bold text-[#1F2430] text-base">
                {new Date(request.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#F4EEFD] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#A4A9B6] uppercase tracking-wide mb-1">Location</div>
              <div className="font-bold text-[#1F2430] text-base truncate">{request.location}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Action Panel */}
      {expanded && (
        <div className="border-t border-[#DDDCE7] bg-[#F8F9FB]">
          {/* Details Section */}
          <div className="p-8 space-y-6">
            {/* Client Contact */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4EEFD] flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#A4A9B6] uppercase tracking-wide mb-2">Client Contact</div>
                <div className="font-bold text-[#1F2430] text-xl mb-1 break-words">{request.name}</div>
                <div className="text-base text-[#7A7F8C] break-all">{request.email}</div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4EEFD] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#A4A9B6] uppercase tracking-wide mb-2">Date & Time</div>
                <div className="font-bold text-[#1F2430] text-lg mb-1">
                  {new Date(request.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
                <div className="text-base text-[#7A7F8C] font-medium">{request.time}</div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4EEFD] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#A4A9B6] uppercase tracking-wide mb-2">Location</div>
                <div className="font-bold text-[#1F2430] text-lg leading-snug break-words">
                  {request.location}
                </div>
              </div>
            </div>

            {/* Budget (if available) */}
            {request.budget && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F4EEFD] flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#A4A9B6] uppercase tracking-wide mb-2">Client Budget</div>
                  <div className="font-bold text-[#1F2430] text-xl">{request.budget}</div>
                </div>
              </div>
            )}

            {/* Description */}
            {request.eventDescription && (
              <div className="pt-2">
                <div className="text-xs font-bold text-[#A4A9B6] uppercase tracking-wide mb-3">Event Description</div>
                <div className="text-base text-[#4F5868] leading-relaxed break-words">
                  {request.eventDescription}
                </div>
              </div>
            )}

            {/* Quoted Info Banner */}
            {request.status === 'quoted' && request.quotedAmount && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Quote Sent</div>
                  <div className="font-bold text-blue-900 text-3xl mb-2">
                    ${request.quotedAmount.toLocaleString()}
                  </div>
                  {request.quotedMessage && (
                    <div className="text-base text-blue-700 mb-2 leading-relaxed break-words">{request.quotedMessage}</div>
                  )}
                  <div className="text-sm text-blue-600 font-medium">
                    Sent {new Date(request.quotedDate!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Only for Pending */}
          {request.status === 'pending' && (
            <div className="px-8 pb-8 space-y-3">
              {/* Primary Action: Send Quote */}
              <button
                onClick={onQuote}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#7C6FDC] text-white font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95"
              >
                <DollarSign className="w-6 h-6" />
                <span>Send Quote</span>
              </button>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onDecline}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white border-2 border-[#DDDCE7] text-[#4F5868] font-semibold hover:border-brand hover:text-brand hover:bg-[#F4EEFD] transition-all active:scale-95"
                >
                  <X className="w-5 h-5" />
                  <span>Decline</span>
                </button>

                <button
                  onClick={onRemove}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 hover:border-red-300 transition-all active:scale-95"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Job Card Component
function JobCard({ job, clientName, navigate }: any) {
  const getStatusBadge = (status: string) => {
    const config = {
      upcoming: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Upcoming' },
      'invoice-sent': { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Invoice Sent' },
      paid: { bg: 'bg-green-50', text: 'text-green-600', label: 'Paid' },
      drafted: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Draft' },
    };
    const style = config[status as keyof typeof config] || { bg: 'bg-gray-50', text: 'text-gray-600', label: status };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>{style.label}</span>;
  };

  return (
    <div
      className="p-6 rounded-2xl border-2 border-[#DDDCE7] hover:border-[#8F6EE6] transition-all cursor-pointer"
      onClick={() => navigate(`/app/jobs/${job.id}/edit`)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-[#1F2430] text-lg">{job.title}</h3>
        {getStatusBadge(job.status)}
      </div>
      <div className="grid md:grid-cols-2 gap-3 text-sm text-[#4F5868]">
        <div>
          <span className="text-[#7A7F8C]">Job #:</span> {job.jobNumber}
        </div>
        <div>
          <span className="text-[#7A7F8C]">Client:</span> {clientName}
        </div>
        <div>
          <span className="text-[#7A7F8C]">Date:</span> {new Date(job.startDate).toLocaleDateString()}
        </div>
        <div>
          <span className="text-[#7A7F8C]">Time:</span> {job.startTime} - {job.endTime}
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ icon: Icon, title, message, action }: any) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-[#F4EEFD] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-[#7A42E8]" />
      </div>
      <h3 className="font-bold text-[#1F2430] text-lg mb-2">{title}</h3>
      <p className="text-[#7A7F8C] mb-6">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}