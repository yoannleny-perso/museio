import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Search, Send, Paperclip, Smile, ChevronLeft, X,
  Briefcase, Clock, CheckCheck, Check, AlertCircle, Wifi, WifiOff,
  Plus, MoreVertical, Pin, Archive, Trash2, Star, Filter, AtSign,
} from 'lucide-react';
import type { Conversation, Message } from '../../types';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    clientId: 'client-1',
    clientName: 'Sarah Johnson',
    clientAvatar: null,
    jobTitle: 'Corporate Gala Performance',
    lastMessage: "That works perfectly — we'll confirm the 50% deposit by Friday.",
    lastMessageTime: '2026-03-20T09:45:00',
    unreadCount: 2,
    messages: [
      { id: 'm1', conversationId: 'conv-1', senderId: 'system', senderType: 'system', content: 'Booking request received', timestamp: '2026-03-15T10:00:00', read: true, systemEventType: 'job-confirmed' },
      { id: 'm2', conversationId: 'conv-1', senderId: 'client-1', senderType: 'client', content: "Hi! We're super excited to have you perform at our gala on April 12th. Just wanted to confirm the set length — we're thinking 2 hours?", timestamp: '2026-03-15T10:05:00', read: true },
      { id: 'm3', conversationId: 'conv-1', senderId: 'artist', senderType: 'artist', content: "Hey Sarah! Absolutely, 2 hours works great. I'll put together a setlist that covers a range of moods for the evening. Happy to chat through the vibe you're going for!", timestamp: '2026-03-15T11:30:00', read: true },
      { id: 'm4', conversationId: 'conv-1', senderId: 'system', senderType: 'system', content: 'Quote sent — $3,500 for 2-hour performance', timestamp: '2026-03-16T09:00:00', read: true, systemEventType: 'quote-sent' },
      { id: 'm5', conversationId: 'conv-1', senderId: 'client-1', senderType: 'client', content: 'The quote looks great. One question — is there a travel fee if you need accommodation?', timestamp: '2026-03-17T14:20:00', read: true },
      { id: 'm6', conversationId: 'conv-1', senderId: 'artist', senderType: 'artist', content: "Yes, for interstate gigs I typically add a flat $250 travel allowance. Happy to waive it for this one given it's local. I'll update the invoice accordingly.", timestamp: '2026-03-17T15:00:00', read: true },
      { id: 'm7', conversationId: 'conv-1', senderId: 'client-1', senderType: 'client', content: "That works perfectly — we'll confirm the 50% deposit by Friday.", timestamp: '2026-03-20T09:45:00', read: false },
    ],
  },
  {
    id: 'conv-2',
    jobId: 'job-2',
    clientId: 'c2',
    clientName: 'Eclipse Nightclub',
    lastMessage: 'Can you send the stage plot and tech rider before Tuesday?',
    lastMessageTime: '2026-03-19T22:10:00',
    unreadCount: 1,
    messages: [
      { id: 'm10', conversationId: 'conv-2', senderId: 'system', senderType: 'system', content: 'Job confirmed — Friday Residency Series', timestamp: '2026-03-10T12:00:00', read: true, systemEventType: 'job-confirmed' },
      { id: 'm11', conversationId: 'conv-2', senderId: 'client-2', senderType: 'client', content: 'Hey, really looking forward to having you headline the April slot. The crowd loved your set last time.', timestamp: '2026-03-10T14:00:00', read: true },
      { id: 'm12', conversationId: 'conv-2', senderId: 'artist', senderType: 'artist', content: 'Thanks Marcus! I\'ve got some new material ready for April — going to be a big night. I\'ll send over the rider and tech spec this week.', timestamp: '2026-03-10T16:30:00', read: true },
      { id: 'm13', conversationId: 'conv-2', senderId: 'system', senderType: 'system', content: 'Deposit received — $750 of $1,500', timestamp: '2026-03-18T09:00:00', read: true, systemEventType: 'deposit-paid' },
      { id: 'm14', conversationId: 'conv-2', senderId: 'client-2', senderType: 'client', content: 'Can you send the stage plot and tech rider before Tuesday?', timestamp: '2026-03-19T22:10:00', read: false },
    ],
  },
  {
    id: 'conv-3',
    clientId: 'c3',
    clientName: 'Sunrise Music Festival',
    lastMessage: 'We\'re very interested in the residency package. Do you have July availability?',
    lastMessageTime: '2026-03-18T10:00:00',
    unreadCount: 0,
    messages: [
      { id: 'm20', conversationId: 'conv-3', senderId: 'client-3', senderType: 'client', content: 'Hi! We came across your portfolio and love your sound. We\'re putting together our summer lineup and would love to have you.', timestamp: '2026-03-17T09:00:00', read: true },
      { id: 'm21', conversationId: 'conv-3', senderId: 'artist', senderType: 'artist', content: 'Hi! Thanks for reaching out — Sunrise is such a great festival. Would love to be part of the lineup. What dates are you looking at?', timestamp: '2026-03-17T11:00:00', read: true },
      { id: 'm22', conversationId: 'conv-3', senderId: 'client-3', senderType: 'client', content: 'We\'re very interested in the residency package. Do you have July availability?', timestamp: '2026-03-18T10:00:00', read: true },
    ],
  },
  {
    id: 'conv-4',
    clientId: 'c4',
    clientName: 'Harbour View Events',
    lastMessage: 'Invoice viewed — awaiting payment',
    lastMessageTime: '2026-03-15T16:00:00',
    unreadCount: 0,
    messages: [
      { id: 'm30', conversationId: 'conv-4', senderId: 'system', senderType: 'system', content: 'Invoice sent — $2,200 due 30 March', timestamp: '2026-03-14T09:00:00', read: true },
      { id: 'm31', conversationId: 'conv-4', senderId: 'system', senderType: 'system', content: 'Invoice viewed — awaiting payment', timestamp: '2026-03-15T16:00:00', read: true, systemEventType: 'invoice-viewed' },
    ],
  },
];

const quickReplies = [
  "Thanks for your message — I'll get back to you shortly.",
  "Happy to confirm! I'll send the updated invoice now.",
  "Could you share more details about the event?",
  "The deposit link has been resent to your email.",
  "I've attached the stage plot and tech rider.",
  "Let me check my availability and come back to you.",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString('en-AU', { weekday: 'short' });
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function formatMessageDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
}

const systemEventConfig: Record<string, { label: string; color: string; bg: string }> = {
  'quote-sent':     { label: 'Quote sent',         color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200' },
  'deposit-paid':   { label: 'Deposit received',   color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  'invoice-viewed': { label: 'Invoice viewed',     color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'slot-changed':   { label: 'Slot changed',       color: 'text-purple-700',bg: 'bg-purple-50 border-purple-200' },
  'job-confirmed':  { label: 'Job confirmed',      color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function ConversationRow({ conv, isActive, onClick }: { conv: Conversation; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-colors border-b border-[#DDDCE7] ${
        isActive ? 'bg-[#F4EEFD]' : 'hover:bg-[#F8F9FB]'
      }`}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] flex items-center justify-center flex-shrink-0 relative">
        <span className="text-white font-bold text-lg">{conv.clientName[0]}</span>
        {conv.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#7A42E8] border-2 border-white text-[10px] text-white font-bold flex items-center justify-center">
            {conv.unreadCount}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={`font-semibold text-sm truncate ${conv.unreadCount > 0 ? 'text-[#1F2430]' : 'text-[#4F5868]'}`}>
            {conv.clientName}
          </span>
          <span className="text-[10px] text-[#7A7F8C] flex-shrink-0">
            {conv.lastMessageTime ? formatTime(conv.lastMessageTime) : ''}
          </span>
        </div>

        {conv.jobId && (
          <div className="flex items-center gap-1 mb-1">
            <Briefcase className="w-3 h-3 text-[#7A42E8]" />
            <span className="text-[10px] text-[#7A42E8] font-medium">Linked Job</span>
          </div>
        )}

        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-[#1F2430] font-medium' : 'text-[#7A7F8C]'}`}>
          {conv.lastMessage}
        </p>
      </div>
    </button>
  );
}

function SystemMessage({ msg }: { msg: Message }) {
  const cfg = systemEventConfig[msg.systemEventType || ''] ?? { label: msg.content, color: 'text-[#7A7F8C]', bg: 'bg-[#F8F9FB] border-[#DDDCE7]' };
  return (
    <div className="flex justify-center my-4">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
        <AlertCircle className="w-3.5 h-3.5" />
        {msg.content}
      </div>
    </div>
  );
}

function MessageBubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  if (msg.senderType === 'system') return <SystemMessage msg={msg} />;
  return (
    <div className={`flex gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DDDCE7] to-[#C8C6D9] flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-[#4F5868] text-xs font-bold">C</span>
        </div>
      )}
      <div className={`max-w-[72%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isOwn
            ? 'bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] text-white rounded-tr-sm'
            : 'bg-white border border-[#DDDCE7] text-[#1F2430] rounded-tl-sm'
        }`}>
          {msg.content}
        </div>
        <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-[#A4A9B6]">
            {new Date(msg.timestamp).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}
          </span>
          {isOwn && (msg.read ? <CheckCheck className="w-3 h-3 text-[#7A42E8]" /> : <Check className="w-3 h-3 text-[#A4A9B6]" />)}
        </div>
      </div>
    </div>
  );
}

function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-[#DDDCE7]" />
      <span className="text-xs text-[#7A7F8C] font-medium px-2">{formatMessageDate(date)}</span>
      <div className="flex-1 h-px bg-[#DDDCE7]" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConvId, setActiveConvId] = useState<string | null>('conv-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [isOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId) ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, activeConv?.messages.length]);

  const filteredConvs = conversations.filter(c => {
    const matchesSearch = !searchQuery || c.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      || c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterUnread || c.unreadCount > 0;
    return matchesSearch && matchesFilter;
  });

  const sendMessage = () => {
    if (!messageText.trim() || !activeConvId) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      conversationId: activeConvId,
      senderId: 'artist',
      senderType: 'artist',
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setConversations(prevConvs =>
      prevConvs.map(c =>
        c.id === activeConvId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.content, lastMessageTime: newMsg.timestamp, unreadCount: 0 }
          : c
      )
    );
    setMessageText('');
    setShowQuickReplies(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const markAsRead = (convId: string) => {
    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, read: true })) } : c)
    );
  };

  const handleSelectConv = (convId: string) => {
    setActiveConvId(convId);
    markAsRead(convId);
  };

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  // Group messages by date
  const groupedMessages = (() => {
    if (!activeConv) return [];
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    for (const msg of activeConv.messages) {
      const d = msg.timestamp.split('T')[0];
      if (d !== currentDate) { currentDate = d; groups.push({ date: d, messages: [] }); }
      groups[groups.length - 1].messages.push(msg);
    }
    return groups;
  })();

  return (
    <div className="h-screen flex flex-col bg-[#F8F9FB]">
      {/* Connection banner */}
      {!isOnline && (
        <div className="bg-red-600 text-white text-sm text-center py-2 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          You're offline. Messages will send when reconnected.
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar: Inbox ──────────────────────────────────────── */}
        <div className={`${activeConvId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[340px] border-r border-[#DDDCE7] bg-white flex-shrink-0`}>
          {/* Header */}
          <div className="px-4 pt-5 pb-3 border-b border-[#DDDCE7]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1F2430]">Messages</h1>
                {totalUnread > 0 && (
                  <span className="w-6 h-6 rounded-full bg-[#7A42E8] text-white text-xs font-bold flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowNewConvModal(true)}
                className="p-2 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white hover:shadow-md transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4A9B6]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search messages…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DDDCE7] text-sm bg-[#F8F9FB] focus:outline-none focus:border-[#7A42E8]"
              />
            </div>

            {/* Filter chips */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterUnread(false)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${!filterUnread ? 'bg-[#7A42E8] text-white' : 'bg-[#F8F9FB] text-[#7A7F8C] border border-[#DDDCE7]'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterUnread(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterUnread ? 'bg-[#7A42E8] text-white' : 'bg-[#F8F9FB] text-[#7A7F8C] border border-[#DDDCE7]'}`}
              >
                Unread {totalUnread > 0 && `(${totalUnread})`}
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 rounded-full bg-[#F4EEFD] flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-[#7A42E8]" />
                </div>
                <p className="font-semibold text-[#1F2430] mb-1">
                  {filterUnread ? 'No unread messages' : 'No conversations yet'}
                </p>
                <p className="text-sm text-[#7A7F8C]">
                  {filterUnread ? 'You\'re all caught up!' : 'Start a conversation from a job or booking request'}
                </p>
              </div>
            ) : (
              filteredConvs.map(conv => (
                <ConversationRow
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeConvId}
                  onClick={() => handleSelectConv(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Main: Thread ──────────────────────────────────────────── */}
        <div className={`${!activeConvId ? 'hidden md:flex' : 'flex'} flex-col flex-1 min-w-0`}>
          {activeConv ? (
            <>
              {/* Thread header */}
              <div className="bg-white border-b border-[#DDDCE7] px-4 py-3 flex items-center gap-3">
                <button
                  onClick={() => setActiveConvId(null)}
                  className="md:hidden p-2 rounded-lg hover:bg-[#F8F9FB] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#7A7F8C]" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{activeConv.clientName[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#1F2430]">{activeConv.clientName}</div>
                  {activeConv.jobId && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-[#7A42E8]" />
                      <span className="text-xs text-[#7A42E8]">Linked to job</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-[#7A7F8C]">Online</span>
                </div>
                <button className="p-2 rounded-lg hover:bg-[#F8F9FB] transition-colors">
                  <MoreVertical className="w-5 h-5 text-[#7A7F8C]" />
                </button>
              </div>

              {/* Thread messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {groupedMessages.map(group => (
                  <div key={group.date}>
                    <DateDivider date={group.messages[0].timestamp} />
                    {group.messages.map(msg => (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isOwn={msg.senderType === 'artist'}
                      />
                    ))}
                  </div>
                ))}
                {/* Typing indicator (demo) */}
                {false && (
                  <div className="flex gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#DDDCE7] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#7A7F8C]">C</span>
                    </div>
                    <div className="bg-white border border-[#DDDCE7] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#7A7F8C] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#7A7F8C] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#7A7F8C] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              {showQuickReplies && (
                <div className="px-4 pb-2">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {quickReplies.map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => { setMessageText(reply); setShowQuickReplies(false); inputRef.current?.focus(); }}
                        className="flex-shrink-0 px-3 py-2 rounded-full bg-[#F4EEFD] text-[#7A42E8] text-xs font-medium border border-[#E3DBF9] hover:bg-[#E3DBF9] transition-colors"
                      >
                        {reply.length > 40 ? reply.slice(0, 40) + '…' : reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Composer */}
              <div className="bg-white border-t border-[#DDDCE7] px-4 py-3">
                <div className="flex items-end gap-3">
                  <button
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${showQuickReplies ? 'bg-[#F4EEFD] text-[#7A42E8]' : 'hover:bg-[#F8F9FB] text-[#7A7F8C]'}`}
                    title="Quick replies"
                  >
                    <AtSign className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message…"
                      rows={1}
                      className="w-full px-4 py-3 rounded-2xl border border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none resize-none bg-[#F8F9FB] text-sm transition-colors"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    className="p-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[10px] text-[#A4A9B6] text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
              </div>
            </>
          ) : (
            // Empty state on desktop when no thread selected
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-12">
              <div className="w-24 h-24 rounded-full bg-[#F4EEFD] flex items-center justify-center mb-6">
                <MessageSquare className="w-12 h-12 text-[#7A42E8]" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2430] mb-2">Your messages</h3>
              <p className="text-[#7A7F8C] max-w-xs">
                Select a conversation from the left, or start a new one to communicate with a client.
              </p>
              <button
                onClick={() => setShowNewConvModal(true)}
                className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewConvModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1F2430]">New Message</h2>
              <button onClick={() => setShowNewConvModal(false)} className="p-2 rounded-full hover:bg-[#F8F9FB]">
                <X className="w-5 h-5 text-[#7A7F8C]" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">To</label>
                <input
                  type="text"
                  placeholder="Search clients or type email..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Message</label>
                <textarea
                  rows={4}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewConvModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-[#DDDCE7] font-semibold text-[#4F5868] hover:bg-[#F8F9FB]"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNewConvModal(false)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}