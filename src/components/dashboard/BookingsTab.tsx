import React, { useState } from 'react';
import { Appointment, Service, AppointmentStatus } from '../../types';
import { db } from '../../lib/db';
import { StatusBadge, Modal, AnimatedNumber } from '../ui';
import {
  Search,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  FileText,
  Filter,
  TrendingUp,
} from 'lucide-react';

interface BookingsTabProps {
  businessId: string;
  appointments: Appointment[];
  services: Service[];
  onRefresh: () => void;
  selectedAppointment: Appointment | null;
  onSelectAppointment: (app: Appointment | null) => void;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({
  businessId,
  appointments,
  services,
  onRefresh,
  selectedAppointment,
  onSelectAppointment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Filtered appointments
  const filtered = appointments.filter((app) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = app.customerName.toLowerCase().includes(q);
      const matchEmail = app.customerEmail.toLowerCase().includes(q);
      const matchPhone = app.customerPhone.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }

    if (statusFilter !== 'all' && app.status !== statusFilter) {
      return false;
    }

    if (serviceFilter !== 'all' && app.serviceId !== serviceFilter) {
      return false;
    }

    if (dateFilter && app.date !== dateFilter) {
      return false;
    }

    return true;
  });

  const handleUpdateStatus = (appId: string, status: AppointmentStatus) => {
    try {
      db.updateAppointmentStatus(appId, status);
      onRefresh();
      if (selectedAppointment && selectedAppointment.id === appId) {
        onSelectAppointment({ ...selectedAppointment, status });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-[#274c77] font-heading tracking-tight">Bookings Manager</h2>
          <p className="text-xs text-[#6096ba] mt-0.5">
            Monitor incoming appointments, intake questionnaires, and fulfillment status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/60">
            <Calendar className="w-4 h-4 text-[#274c77]" />
            <span className="text-xs font-semibold text-[#274c77]">
              Total Bookings: <AnimatedNumber value={appointments.length} duration={800} />
            </span>
          </div>
        </div>
      </div>

      {/* Top Controls: Glass Search & Filters */}
      <div className="glass-card p-4 rounded-3xl border border-white/70 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6096ba]" />
            <input
              type="text"
              placeholder="Search customer name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs text-[#274c77] bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#274c77] placeholder:text-[#8b8c89]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] font-medium focus:outline-none focus:ring-2 focus:ring-[#274c77] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No-Show</option>
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] font-medium focus:outline-none focus:ring-2 focus:ring-[#274c77] cursor-pointer"
            >
              <option value="all">All Services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] font-medium focus:outline-none"
            />

            {(statusFilter !== 'all' || serviceFilter !== 'all' || dateFilter || searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setServiceFilter('all');
                  setDateFilter('');
                  setSearchTerm('');
                }}
                className="text-xs font-semibold text-[#6096ba] hover:text-[#274c77] whitespace-nowrap px-2 cursor-pointer transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table / Card Container */}
      <div className="glass-card rounded-3xl border border-white/70 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-white/40 flex items-center justify-between bg-white/30 backdrop-blur-md">
          <span className="text-xs font-semibold text-[#274c77] font-heading uppercase tracking-wider">
            Appointments (<AnimatedNumber value={filtered.length} duration={600} />)
          </span>
          <span className="text-xs text-[#6096ba]">Click row to view intake details & answers</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[#8b8c89]">
            <Calendar className="w-10 h-10 text-[#6096ba]/40 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-[#274c77]">No appointments found</h3>
            <p className="text-xs text-[#6096ba] mt-1">
              Try adjusting your search filters or scheduled date.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/40 border-b border-white/40 text-[#6096ba] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/30">
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => onSelectAppointment(app)}
                    className="hover:bg-white/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#274c77]/10 text-[#274c77] font-bold text-xs flex items-center justify-center">
                          {app.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[#274c77] group-hover:translate-x-0.5 transition-transform">
                            {app.customerName}
                          </div>
                          <div className="text-[11px] text-[#6096ba]">{app.customerEmail}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-[#274c77]">{app.serviceSnapshot.name}</div>
                      <div className="text-[11px] text-[#6096ba]">
                        {app.serviceSnapshot.duration} min •{' '}
                        {app.serviceSnapshot.price === 0 ? 'Free' : `$${app.serviceSnapshot.price}`}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-[#274c77]">{app.date}</div>
                      <div className="text-[11px] text-[#6096ba]">
                        {app.startTime} - {app.endTime}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={app.status} />
                    </td>

                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {app.status !== 'confirmed' && app.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full border border-emerald-500/20 transition-colors cursor-pointer"
                          >
                            Confirm
                          </button>
                        )}
                        {app.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app.id, 'completed')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-[#274c77] bg-[#274c77]/10 hover:bg-[#274c77]/20 rounded-full border border-[#274c77]/20 transition-colors cursor-pointer"
                          >
                            Complete
                          </button>
                        )}
                        {app.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-500/10 hover:bg-rose-500/20 rounded-full border border-rose-500/20 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={true}
          onClose={() => onSelectAppointment(null)}
          title={`Appointment — ${selectedAppointment.customerName}`}
          description={`Created on ${new Date(selectedAppointment.createdAt).toLocaleDateString()}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* Top Status Bar */}
            <div className="p-4 bg-white/40 border border-white/60 rounded-2xl flex items-center justify-between backdrop-blur-md">
              <div>
                <span className="text-[10px] text-[#6096ba] uppercase tracking-wider block font-semibold">
                  Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={selectedAppointment.status} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                  className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full border border-emerald-500/20 cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
                  className="px-3 py-1 text-xs font-semibold text-[#274c77] bg-[#274c77]/10 hover:bg-[#274c77]/20 rounded-full border border-[#274c77]/20 cursor-pointer"
                >
                  Complete
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'no_show')}
                  className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 rounded-full border border-amber-500/20 cursor-pointer"
                >
                  No-Show
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                  className="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-500/10 hover:bg-rose-500/20 rounded-full border border-rose-500/20 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Service & Time Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/40 border border-white/60 rounded-2xl space-y-1 text-xs">
                <span className="text-[10px] font-semibold text-[#6096ba] uppercase">Service Booked</span>
                <p className="font-medium text-[#274c77] text-sm font-heading">{selectedAppointment.serviceSnapshot.name}</p>
                <p className="text-[#6096ba]">
                  Duration: {selectedAppointment.serviceSnapshot.duration} min • Price:{' '}
                  {selectedAppointment.serviceSnapshot.price === 0
                    ? 'Free'
                    : `$${selectedAppointment.serviceSnapshot.price}`}
                </p>
              </div>

              <div className="p-4 bg-white/40 border border-white/60 rounded-2xl space-y-1 text-xs">
                <span className="text-[10px] font-semibold text-[#6096ba] uppercase">Scheduled Time</span>
                <p className="font-medium text-[#274c77] text-sm font-heading">{selectedAppointment.date}</p>
                <p className="text-[#6096ba]">
                  {selectedAppointment.startTime} - {selectedAppointment.endTime}
                </p>
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="p-4 bg-white/40 border border-white/60 rounded-2xl space-y-2 text-xs">
              <span className="text-[10px] font-semibold text-[#6096ba] uppercase block">
                Customer Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[#8b8c89] block text-[10px]">Name</span>
                  <span className="font-semibold text-[#274c77]">{selectedAppointment.customerName}</span>
                </div>
                <div>
                  <span className="text-[#8b8c89] block text-[10px]">Email</span>
                  <span className="font-semibold text-[#274c77]">{selectedAppointment.customerEmail}</span>
                </div>
                <div>
                  <span className="text-[#8b8c89] block text-[10px]">Phone</span>
                  <span className="font-semibold text-[#274c77]">{selectedAppointment.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Intake Answers Snapshot */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#274c77] font-heading uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-[#6096ba]" />
                <span>Intake Questionnaire Answers</span>
              </div>

              {selectedAppointment.answersSnapshot && selectedAppointment.answersSnapshot.length > 0 ? (
                <div className="bg-white/40 border border-white/60 rounded-2xl p-4 space-y-3">
                  {selectedAppointment.answersSnapshot.map((ans, i) => (
                    <div key={i} className="pb-2 border-b border-white/40 last:border-0 last:pb-0 text-xs">
                      <span className="text-[#6096ba] font-medium block">{ans.fieldLabel}</span>
                      <span className="font-semibold text-[#274c77] mt-0.5 block">
                        {typeof ans.value === 'boolean'
                          ? ans.value
                            ? 'Yes / Consented'
                            : 'No'
                          : ans.value || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-white/30 border border-white/50 rounded-2xl text-xs text-[#8b8c89]">
                  No custom intake answers submitted for this booking.
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
