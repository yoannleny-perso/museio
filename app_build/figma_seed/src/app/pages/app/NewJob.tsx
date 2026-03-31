import { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Plus, GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LineItem } from '../../types';

export function NewJob() {
  const navigate = useNavigate();
  const { addJob, clients, addClient } = useApp();
  
  const [title, setTitle] = useState('');
  const [jobNumber, setJobNumber] = useState(`MUS-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', name: 'DJ Service', unitCost: 0, quantity: 1, taxEnabled: false }
  ]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['1']));

  // Add Client Modal State
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    venueName: '',
    contactName: '',
    email: '',
    phone: '',
    location: '',
  });

  const MAX_LINE_ITEMS = 10;

  const addLineItem = () => {
    if (lineItems.length >= MAX_LINE_ITEMS) return;
    const newItem: LineItem = {
      id: String(Date.now()),
      name: '',
      unitCost: 0,
      quantity: 1,
      taxEnabled: false,
    };
    setLineItems([...lineItems, newItem]);
    setExpandedItems(new Set([...expandedItems, newItem.id]));
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return; // Keep at least one
    setLineItems(lineItems.filter(item => item.id !== id));
    const newExpanded = new Set(expandedItems);
    newExpanded.delete(id);
    setExpandedItems(newExpanded);
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const toggleItemExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = subtotal * (discountPercent / 100);
    return subtotal - discount;
  };

  const handleSaveDraft = () => {
    addJob({
      title: title || 'Untitled Job',
      jobNumber,
      status: 'drafted',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      startTime: startTime || '09:00',
      endTime: endTime || '17:00',
      clientId: selectedClientId,
      lineItems,
      discountPercent,
      notes,
    });
    navigate('/app/jobs');
  };

  const handleCreateJob = () => {
    if (!title || !startDate || !endDate || !startTime || !endTime) {
      alert('Please fill in all required fields');
      return;
    }
    addJob({
      title,
      jobNumber,
      status: 'upcoming',
      startDate,
      endDate,
      startTime,
      endTime,
      clientId: selectedClientId,
      lineItems,
      discountPercent,
      notes,
    });
    navigate('/app/jobs');
  };

  const handleAddClient = () => {
    if (!newClientForm.venueName || !newClientForm.contactName || !newClientForm.email) {
      alert('Please fill in all required fields');
      return;
    }
    const newClient = addClient(newClientForm);
    setSelectedClientId(newClient.id);
    setShowClientModal(false);
    // Reset form
    setNewClientForm({
      venueName: '',
      contactName: '',
      email: '',
      phone: '',
      location: '',
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <div className="bg-white border-b border-[#DDDCE7] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#1F2430]">New Job</h1>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold">
              Upcoming
            </span>
          </div>
          <button
            onClick={() => navigate('/app/jobs')}
            className="p-2 rounded-full hover:bg-[#F8F9FB] transition-colors"
          >
            <X className="w-6 h-6 text-[#7A7F8C]" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto p-6 space-y-8 pb-32">
        {/* Job Details */}
        <section>
          <h2 className="text-xl font-bold text-[#1F2430] mb-4">Job Details</h2>
          <div className="bg-white rounded-2xl border border-[#DDDCE7] p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2430] mb-2">
                Job Title <span className="text-[#7A42E8]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Corporate Gala Night"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2430] mb-2">Job Number</label>
              <input
                type="text"
                value={jobNumber}
                onChange={(e) => setJobNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">
                  Start Date <span className="text-[#7A42E8]">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Select date"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors overflow-hidden"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">
                  Start Time <span className="text-[#7A42E8]">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="Select time"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors overflow-hidden"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">
                  End Date <span className="text-[#7A42E8]">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Select date"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors overflow-hidden"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">
                  End Time <span className="text-[#7A42E8]">*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="Select time"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors overflow-hidden"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Line Items */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1F2430]">Line Items</h2>
            <span className="text-sm text-[#7A7F8C]">{lineItems.length}/{MAX_LINE_ITEMS}</span>
          </div>
          <div className="space-y-3">
            {lineItems.map((item, index) => {
              const isExpanded = expandedItems.has(item.id);
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-[#DDDCE7] overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <GripVertical className="w-5 h-5 text-[#A4A9B6] flex-shrink-0 cursor-move" />
                    <button
                      onClick={() => toggleItemExpanded(item.id)}
                      className="flex-1 text-left font-medium text-[#1F2430] hover:text-[#7A42E8] transition-colors"
                    >
                      {item.name || `Line Item ${index + 1}`}
                    </button>
                    <button onClick={() => toggleItemExpanded(item.id)} className="p-2">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-[#7A7F8C]" /> : <ChevronDown className="w-5 h-5 text-[#7A7F8C]" />}
                    </button>
                    {lineItems.length > 1 && (
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {isExpanded && (
                    <div className="border-t border-[#DDDCE7] p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1F2430] mb-2">Item Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateLineItem(item.id, { name: e.target.value })}
                          placeholder="e.g., DJ Service"
                          className="w-full px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#1F2430] mb-2">Unit Cost</label>
                          <input
                            type="number"
                            value={item.unitCost}
                            onChange={(e) => updateLineItem(item.id, { unitCost: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1F2430] mb-2">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                            min="1"
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.taxEnabled}
                          onChange={(e) => updateLineItem(item.id, { taxEnabled: e.target.checked })}
                          className="w-5 h-5 rounded border-2 border-[#DDDCE7] text-[#7A42E8] focus:ring-[#7A42E8]"
                        />
                        <span className="text-sm font-medium text-[#1F2430]">Tax Enabled</span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {lineItems.length < MAX_LINE_ITEMS && (
            <button
              onClick={addLineItem}
              className="w-full py-3 mt-6 rounded-xl border-2 border-dashed border-[#DDDCE7] text-[#7A42E8] font-semibold hover:border-[#7A42E8] hover:bg-[#F4EEFD] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Line Item</span>
            </button>
          )}
        </section>

        {/* Discount & Totals */}
        <section className="bg-white rounded-2xl border border-[#DDDCE7] p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1F2430] mb-2">Discount (%)</label>
            <input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              placeholder="0"
              className="w-full md:w-48 px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            />
          </div>
          <div className="border-t border-[#DDDCE7] pt-4 space-y-2">
            <div className="flex justify-between text-[#4F5868]">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-[#4F5868]">
                <span>Discount ({discountPercent}%):</span>
                <span>-${(calculateSubtotal() * discountPercent / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-[#1F2430] pt-2 border-t border-[#DDDCE7]">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section>
          <h2 className="text-xl font-bold text-[#1F2430] mb-4">Notes</h2>
          <div className="bg-white rounded-2xl border border-[#DDDCE7] p-6">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or requirements..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none resize-none"
            />
          </div>
        </section>

        {/* Client Information */}
        <section>
          <h2 className="text-xl font-bold text-[#1F2430] mb-4">Client Information</h2>
          <div className="bg-white rounded-2xl border border-[#DDDCE7] p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[#1F2430]">Select Client</label>
              <button
                onClick={() => setShowClientModal(true)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
                title="Add New Client"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
            >
              <option value="">No client selected</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.venueName} - {client.contactName}
                </option>
              ))}
            </select>
          </div>
        </section>
      </div>

      {/* Add Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowClientModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1F2430]">Add Client</h2>
              <button onClick={() => setShowClientModal(false)} className="p-2 rounded-full hover:bg-[#F8F9FB]">
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
                    value={(newClientForm as any)[f.key]}
                    onChange={e => setNewClientForm({ ...newClientForm, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowClientModal(false)} className="flex-1 py-3 rounded-xl border-2 border-[#DDDCE7] font-semibold text-[#4F5868]">
                Cancel
              </button>
              <button onClick={handleAddClient} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all">
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDDCE7] p-6 md:pl-64">
        <div className="max-w-4xl mx-auto flex gap-4">
          <button
            onClick={handleSaveDraft}
            className="flex-1 md:flex-initial md:px-8 py-4 rounded-xl border-2 border-[#DDDCE7] text-[#4F5868] font-semibold hover:bg-[#F8F9FB] transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handleCreateJob}
            className="flex-1 md:flex-initial md:px-8 py-4 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all"
          >
            Create Job
          </button>
        </div>
      </div>
    </div>
  );
}