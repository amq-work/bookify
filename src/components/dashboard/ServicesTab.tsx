import React, { useState } from 'react';
import { Service, ServiceStatus } from '../../types';
import { db } from '../../lib/db';
import { StatusBadge, Modal, AnimatedNumber } from '../ui';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Clock,
  DollarSign,
  CheckCircle,
  Scissors,
  Sliders,
} from 'lucide-react';

interface ServicesTabProps {
  businessId: string;
  services: Service[];
  onRefresh: () => void;
}

export const ServicesTab: React.FC<ServicesTabProps> = ({ businessId, services, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [bufferBeforeMinutes, setBufferBeforeMinutes] = useState(0);
  const [bufferAfterMinutes, setBufferAfterMinutes] = useState(10);
  const [status, setStatus] = useState<ServiceStatus>('active');
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setDurationMinutes(30);
    setPrice(50);
    setCurrency('USD');
    setBufferBeforeMinutes(0);
    setBufferAfterMinutes(10);
    setStatus('active');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description);
    setDurationMinutes(service.durationMinutes);
    setPrice(service.price);
    setCurrency(service.currency);
    setBufferBeforeMinutes(service.bufferBeforeMinutes);
    setBufferAfterMinutes(service.bufferAfterMinutes);
    setStatus(service.status);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Service name is required');
      return;
    }

    try {
      if (editingService) {
        db.updateService(editingService.id, {
          name: name.trim(),
          description: description.trim(),
          durationMinutes: Number(durationMinutes),
          price: Number(price),
          currency,
          bufferBeforeMinutes: Number(bufferBeforeMinutes),
          bufferAfterMinutes: Number(bufferAfterMinutes),
          status,
        });
      } else {
        db.createService({
          businessId,
          name: name.trim(),
          description: description.trim(),
          durationMinutes: Number(durationMinutes),
          price: Number(price),
          currency,
          bufferBeforeMinutes: Number(bufferBeforeMinutes),
          bufferAfterMinutes: Number(bufferAfterMinutes),
          status,
          order: services.length + 1,
        });
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save service');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        db.deleteService(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleToggleStatus = (service: Service) => {
    try {
      db.updateService(service.id, {
        status: service.status === 'active' ? 'inactive' : 'active'
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-[#274c77] font-heading tracking-tight">Services Catalog</h2>
          <p className="text-xs text-[#6096ba] mt-0.5">
            Configure bookable offerings, duration, buffer times, and pricing schemas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#274c77] via-[#1e3b5e] to-[#14263e] hover:shadow-lg text-white text-xs font-semibold transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Service
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s) => (
          <div
            key={s.id}
            className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white/90"
          >
            <div className="space-y-4">
              {/* Card Header: Icon, Name & Status */}
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#274c77]/10 flex items-center justify-center text-[#274c77] shadow-xs">
                  <Scissors className="w-5 h-5" />
                </div>
                <StatusBadge status={s.status} />
              </div>

              <div>
                <h3 className="text-base font-medium text-[#274c77] font-heading">{s.name}</h3>
                <p className="text-xs text-[#6096ba] mt-1 line-clamp-2 min-h-[32px]">
                  {s.description || 'No description provided.'}
                </p>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/40">
                <div className="bg-white/40 p-2.5 rounded-2xl border border-white/60">
                  <span className="text-[10px] font-semibold text-[#8b8c89] uppercase block">Duration</span>
                  <span className="text-xs font-medium text-[#274c77] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-[#6096ba]" />
                    {s.durationMinutes} min
                  </span>
                </div>

                <div className="bg-white/40 p-2.5 rounded-2xl border border-white/60">
                  <span className="text-[10px] font-semibold text-[#8b8c89] uppercase block">Price</span>
                  <span className="text-xs font-medium text-[#274c77] flex items-center gap-1 mt-0.5">
                    <DollarSign className="w-3 h-3 text-[#6096ba]" />
                    {s.price === 0 ? 'Free' : `$${s.price} ${s.currency}`}
                  </span>
                </div>
              </div>

              {/* Buffer indicator */}
              {(s.bufferBeforeMinutes > 0 || s.bufferAfterMinutes > 0) && (
                <div className="text-[10px] font-semibold text-[#6096ba] bg-white/30 px-3 py-1.5 rounded-xl border border-white/50 flex items-center justify-between">
                  <span>Buffer Time:</span>
                  <span>+{s.bufferBeforeMinutes}m before / +{s.bufferAfterMinutes}m after</span>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="pt-4 mt-4 border-t border-white/40 flex items-center justify-end gap-2">
              <button
                onClick={() => handleToggleStatus(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer flex items-center gap-1 border ${
                  s.status === 'active' 
                    ? 'text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20' 
                    : 'text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20'
                }`}
              >
                {s.status === 'active' ? 'Disable' : 'Activate'}
              </button>
              <button
                onClick={() => openEditModal(s)}
                className="px-3 py-1.5 text-xs font-semibold text-[#274c77] hover:bg-white/60 rounded-full transition-colors cursor-pointer flex items-center gap-1 border border-transparent"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-500/10 rounded-full transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="col-span-full glass-card rounded-3xl p-12 text-center text-[#8b8c89]">
            <Scissors className="w-10 h-10 text-[#6096ba]/40 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-[#274c77]">No services configured</h3>
            <p className="text-xs text-[#6096ba] mt-1">
              Click 'Add New Service' to list bookable offerings.
            </p>
          </div>
        )}
      </div>

      {/* Service Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingService ? 'Edit Service' : 'Add New Service'}
          description="Configure service duration, buffer time, pricing, and availability"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 rounded-2xl">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">Service Title *</label>
              <input
                required
                placeholder="e.g. Executive Strategy Session"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">Description</label>
              <textarea
                rows={3}
                placeholder="Describe what client receives during this session..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">Duration (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">Price ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">Buffer Before (Min)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={bufferBeforeMinutes}
                  onChange={(e) => setBufferBeforeMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">Buffer After (Min)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={bufferAfterMinutes}
                  onChange={(e) => setBufferAfterMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="pt-3 border-t border-white/40 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-[#8b8c89] hover:text-[#274c77] font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#274c77] hover:bg-[#1a3454] text-white font-semibold rounded-full text-xs cursor-pointer shadow-sm"
              >
                {editingService ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
