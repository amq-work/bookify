import React, { useState } from 'react';
import { Customer } from '../../types';
import { db } from '../../lib/db';
import { Modal, AnimatedNumber } from '../ui';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

interface CustomersTabProps {
  businessId: string;
  onRefresh: () => void;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({ businessId, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const rawCustomers = db.getCustomers(businessId);

  const customersList: Customer[] = rawCustomers.length > 0 ? rawCustomers : [
    {
      id: 'cust_arc_1',
      businessId,
      fullName: 'Sarah Jenkins',
      email: 's.jenkins@cloudtech.io',
      phone: '+1 (555) 432-8819',
      totalBookings: 4,
      firstBookingDate: '2026-01-10',
      lastBookingDate: '2026-03-24',
    },
    {
      id: 'cust_arc_2',
      businessId,
      fullName: 'Marcus Vance',
      email: 'marcus.v@acme-corp.com',
      phone: '+1 (555) 891-2345',
      totalBookings: 2,
      firstBookingDate: '2026-02-14',
      lastBookingDate: '2026-03-22',
    },
    {
      id: 'cust_arc_3',
      businessId,
      fullName: 'Elena Rostova',
      email: 'elena@novasoft.dev',
      phone: '+1 (555) 234-9988',
      totalBookings: 6,
      firstBookingDate: '2025-11-04',
      lastBookingDate: '2026-03-25',
    },
    {
      id: 'cust_arc_4',
      businessId,
      fullName: 'David Sterling',
      email: 'david@sterlingventures.co',
      phone: '+1 (555) 345-6712',
      totalBookings: 1,
      firstBookingDate: '2026-03-18',
      lastBookingDate: '2026-03-18',
    },
    {
      id: 'cust_arc_5',
      businessId,
      fullName: 'Jessica Alba-Lee',
      email: 'jessica@apexdesign.studio',
      phone: '+1 (555) 912-4433',
      totalBookings: 3,
      firstBookingDate: '2026-01-28',
      lastBookingDate: '2026-03-20',
    },
  ];

  const filteredCustomers = customersList.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      businessId,
      fullName: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim() || '+1 (555) 000-0000',
      totalBookings: 1,
      firstBookingDate: new Date().toISOString().split('T')[0],
      lastBookingDate: new Date().toISOString().split('T')[0],
    };

    db.getState().customers.push(newCust);
    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-[#274c77] font-heading tracking-tight">Customer Directory</h2>
          <p className="text-xs text-[#6096ba] mt-0.5">
            Profiles automatically compiled from confirmed appointments and intake answers.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#274c77] via-[#1e3b5e] to-[#14263e] hover:shadow-lg text-white text-xs font-semibold transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add Customer
        </button>
      </div>

      {/* Customer Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#8b8c89] mb-1">
            <span className="text-xs font-semibold text-[#8b8c89]">Total Registered Customers</span>
            <Users className="w-4 h-4 text-[#274c77]" />
          </div>
          <div className="text-3xl font-medium text-[#274c77] font-heading">
            <AnimatedNumber value={customersList.length} duration={800} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18% from last month</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#8b8c89] mb-1">
            <span className="text-xs font-semibold text-[#8b8c89]">Repeat Clients</span>
            <UserCheck className="w-4 h-4 text-[#6096ba]" />
          </div>
          <div className="text-3xl font-medium text-[#274c77] font-heading">
            <AnimatedNumber value={142} duration={800} />
          </div>
          <span className="text-xs text-[#6096ba] mt-1 block">58% return booking rate</span>
        </div>

        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#8b8c89] mb-1">
            <span className="text-xs font-semibold text-[#8b8c89]">Average Value / Client</span>
            <ArrowUpRight className="w-4 h-4 text-[#274c77]" />
          </div>
          <div className="text-3xl font-medium text-[#274c77] font-heading">
            <AnimatedNumber value={340} prefix="$" duration={800} />
          </div>
          <span className="text-xs text-[#6096ba] mt-1 block">Lifetime value per customer</span>
        </div>
      </div>

      {/* Search and Table Card */}
      <div className="glass-card rounded-3xl border border-white/70 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-white/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/30 backdrop-blur-md">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6096ba]" />
            <input
              type="text"
              placeholder="Search by name, email, or telephone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs text-[#274c77] bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#274c77] placeholder:text-[#8b8c89]"
            />
          </div>

          <span className="text-xs text-[#6096ba]">
            Showing {filteredCustomers.length} of {customersList.length} customers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/40 border-b border-white/40 text-[#6096ba] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Bookings</th>
                <th className="py-3.5 px-4">First Booking</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-6 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/30">
              {filteredCustomers.map((cust) => (
                <tr
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className="hover:bg-white/50 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#274c77]/10 text-[#274c77] font-bold text-xs flex items-center justify-center">
                        {cust.fullName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-[#274c77] block group-hover:translate-x-0.5 transition-transform">{cust.fullName}</span>
                        <span className="text-[11px] text-[#6096ba]">Client ID #{cust.id.slice(-4)}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-[#274c77] font-medium">{cust.email}</div>
                    <div className="text-[11px] text-[#6096ba]">{cust.phone}</div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#274c77]/10 text-[#274c77] border border-[#274c77]/20">
                      {cust.totalBookings} booked
                    </span>
                  </td>

                  <td className="py-4 px-4 text-[#6096ba]">{cust.firstBookingDate}</td>
                  <td className="py-4 px-4 text-[#274c77] font-medium">{cust.lastBookingDate}</td>

                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(cust);
                      }}
                      className="px-3 py-1 text-xs font-semibold text-[#274c77] hover:bg-white/60 rounded-full transition-colors cursor-pointer"
                    >
                      View Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCustomer(null)}
          title={selectedCustomer.fullName}
          description="Customer Profile & Historical Appointment Records"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-white/40 rounded-2xl border border-white/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[#6096ba] font-medium">Customer Email</span>
                <span className="font-semibold text-[#274c77]">{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6096ba] font-medium">Phone Number</span>
                <span className="font-semibold text-[#274c77]">{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6096ba] font-medium">Lifetime Bookings</span>
                <span className="font-semibold text-[#274c77]">{selectedCustomer.totalBookings} sessions</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6096ba] font-medium">First Scheduled</span>
                <span className="text-[#274c77]">{selectedCustomer.firstBookingDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6096ba] font-medium">Latest Booking</span>
                <span className="text-[#274c77] font-semibold">{selectedCustomer.lastBookingDate}</span>
              </div>
            </div>

            <div className="p-3 bg-[#6096ba]/10 border border-[#6096ba]/30 rounded-2xl text-[#274c77] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#274c77] shrink-0" />
              <span>Customer profile securely preserved with historical appointment snapshots.</span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-[#274c77] hover:bg-[#1a3454] text-white font-semibold rounded-full text-xs transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Customer"
          description="Manually register a customer profile into your booking database"
        >
          <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">Full Name *</label>
              <input
                required
                placeholder="e.g. John Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">Email Address *</label>
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">Phone Number</label>
              <input
                placeholder="+1 (555) 000-0000"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
              />
            </div>

            <div className="pt-3 border-t border-white/40 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-[#8b8c89] hover:text-[#274c77] font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#274c77] hover:bg-[#1a3454] text-white font-semibold rounded-full text-xs cursor-pointer shadow-sm"
              >
                Create Customer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
