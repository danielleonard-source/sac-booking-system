import React from 'react';
import { useDataStore } from '../../store/dataStore';
import useDashboardStore from '../../store/dashboardStore';
import { useUIStore } from '../../store/uiStore';

const MetricsCards = ({ setActiveView }) => {
  const { setAdminTab } = useUIStore();
  
  const bookings = useDataStore(state => state.bookings);
  const learners = useDataStore(state => state.learners);
  const readerWriters = useDataStore(state => state.readerWriters);
  const getBookedSlotsCount = useDataStore(state => state.getBookedSlotsCount);
  const getMaxCapacity = useDataStore(state => state.getMaxCapacity);

  const {
    getFilteredBookings,
    getPendingApprovals,
    getCapacityWarnings,
    getHighUsageLearners,
    getRWUtilization
  } = useDashboardStore();

  const filteredBookings = getFilteredBookings(bookings);
  const pending = getPendingApprovals(filteredBookings);
  const warnings = getCapacityWarnings(filteredBookings, getBookedSlotsCount, getMaxCapacity);
  const highUsage = getHighUsageLearners(filteredBookings, learners);
// NEW R/W COVER CALCULATION
// Count approved bookings with R/W assignments
const approvedBookings = filteredBookings.filter(b => b.status === 'confirmed' || b.status === 'approved');
const bookingsWithRW = approvedBookings.filter(b => {
  let rwObj = {};
  try {
    if (typeof b.readerWriters === 'string') {
      rwObj = JSON.parse(b.readerWriters);
    } else if (typeof b.readerWriters === 'object') {
      rwObj = b.readerWriters || {};
    }
  } catch (e) {}
  return Object.keys(rwObj).length > 0;
});

// Count sessions covered by casual vs permanent
let casualSessions = 0;
let permanentSessions = 0;

bookingsWithRW.forEach(booking => {
  let rwObj = {};
  try {
    if (typeof booking.readerWriters === 'string') {
      rwObj = JSON.parse(booking.readerWriters);
    } else if (typeof booking.readerWriters === 'object') {
      rwObj = booking.readerWriters || {};
    }
  } catch (e) {}
  
  Object.values(rwObj).forEach(rwName => {
    const rw = readerWriters.find(r => r.name === rwName);
    if (rw) {
      if ((rw.employmentType || 'casual') === 'casual') {
        casualSessions++;
      } else {
        permanentSessions++;
      }
    }
  });
});

const totalCovered = casualSessions + permanentSessions;
const casualCoverPercent = totalCovered > 0 ? Math.round((casualSessions / totalCovered) * 100) : 0;
const permanentCoverPercent = totalCovered > 0 ? Math.round((permanentSessions / totalCovered) * 100) : 0;
const coveragePercent = approvedBookings.length > 0 ? Math.round((bookingsWithRW.length / approvedBookings.length) * 100) : 0;

  const cards = [
    {
      title: 'CAPACITY WARNINGS',
      icon: '🔴',
      value: warnings.length,
      subtitle: 'Periods Near Full',
      color: warnings.length > 5 ? 'red' : warnings.length > 0 ? 'yellow' : 'green',
      action: 'View Details',
      onClick: () => setActiveView('calendar')
    },
    {
      title: 'LEARNERS WITH SAC',
      icon: '👥',
      value: learners.filter(l => l.specialConditions && l.specialConditions !== '[]' && l.specialConditions !== '""' && l.specialConditions.trim()).length,
      subtitle: 'Require Support',
      color: highUsage.length > 20 ? 'red' : highUsage.length > 10 ? 'yellow' : 'green',
      action: 'View List',
      onClick: () => setActiveView('admin')
    },
    {
      title: 'PENDING ACTIONS',
      icon: '⏳',
      value: pending.total,
      subtitle: 'Need Review',
      color: pending.total > 10 ? 'red' : pending.total > 0 ? 'yellow' : 'green',
      action: 'Approve Now',
      onClick: () => setActiveView('bookings')
    },
    {
      title: 'R/W COVER',
      icon: '📚',
      value: `${coveragePercent}%`,
      subtitle: `${casualCoverPercent}% Casual · ${permanentCoverPercent}% Perm`,
      color: coveragePercent < 70 ? 'red' : coveragePercent < 85 ? 'yellow' : 'green',
      action: 'Manage R/Ws',
      onClick: () => { 
        setAdminTab('readerwriters'); 
        setActiveView('admin'); 
      }
    }
  ];


  const getColorClasses = (color) => {
    switch (color) {
      case 'red':
        return 'bg-red-50 border-red-200';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200';
      case 'green':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (color) => {
    switch (color) {
      case 'red':
        return 'text-red-700';
      case 'yellow':
        return 'text-yellow-700';
      case 'green':
        return 'text-green-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${getColorClasses(card.color)} border-2 rounded-lg p-6 hover:shadow-lg transition-shadow`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="text-2xl">{card.icon}</div>
          </div>
          
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            {card.title}
          </h3>
          
          <div className={`text-3xl font-bold ${getTextColor(card.color)} mb-1`}>
            {card.value}
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            {card.subtitle}
          </p>
          
          <button 
            onClick={card.onClick}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {card.action}
          </button>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
