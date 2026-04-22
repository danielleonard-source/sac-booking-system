import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import BookingCard from './BookingCard';

function Bookings() {
  const { bookings } = useDataStore();
  const { openBookingForm, openHistoryModal } = useUIStore();
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    console.log('🔍 Total bookings from store:', bookings.length);
    let filtered = [...bookings];

    // Date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('🔍 Date filter:', dateFilter, 'Today:', today.toISOString());
    console.log('🔍 First booking date:', filtered[0]?.date);
    
    if (dateFilter === 'upcoming') {
      // Include today and future dates
      const beforeFilter = filtered.length;
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= today;
      });
      console.log('🔍 After date filter:', filtered.length, '(removed', beforeFilter - filtered.length, ')');
    } else if (dateFilter === 'past') {
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate < today;
      });
    }

    // Status filter with new statuses
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.subject?.toLowerCase().includes(term) ||
        b.teacher?.toLowerCase().includes(term) ||
        b.room?.toLowerCase().includes(term) ||
        b.learnerNames?.some(name => name.toLowerCase().includes(term))
      );
    }

    // SORT: Earliest to latest
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB; // Earliest first
      }
      // If same date, sort by period
      return (a.period || 0) - (b.period || 0);
    });

    console.log('🔍 Filtered bookings:', filtered.length);
    return filtered;
  }, [bookings, statusFilter, dateFilter, searchTerm]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
        <p className="text-gray-600">View and manage all SAC bookings</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
              <option value="edit_pending">Edit Pending</option>
              <option value="edit_approved">Edit Approved</option>
              <option value="deletion_pending">Deletion Pending</option>
              <option value="deletion_confirmed">Deletion Confirmed</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="upcoming">Upcoming (Today + Future)</option>
              <option value="past">Past</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Subject, teacher, room, learner..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
            />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No bookings found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your filters or search term
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;
