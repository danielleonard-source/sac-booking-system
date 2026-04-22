import React from 'react';
import { useDataStore } from '../../store/dataStore';
import useDashboardStore from '../../store/dashboardStore';

const TermComparison = () => {
  const bookings = useDataStore(state => state.bookings);
  
  const {
    getFilteredBookings,
    getWeeklyTrend,
    getSubjectDistribution,
    getYearLevelDistribution
  } = useDashboardStore();

  const filteredBookings = getFilteredBookings(bookings);
  const weeklyTrend = getWeeklyTrend(filteredBookings);
  const subjects = getSubjectDistribution(filteredBookings).slice(0, 5); // Top 5
  const yearLevels = getYearLevelDistribution(filteredBookings);

  // Calculate total bookings
  const totalBookings = filteredBookings.filter(b => 
    b.status !== 'deleted' && b.status !== 'declined'
  ).length;

  // Calculate average weekly bookings
  const avgWeekly = weeklyTrend.length > 0 
    ? Math.round(weeklyTrend.reduce((sum, w) => sum + w.count, 0) / weeklyTrend.length)
    : 0;

  // Find peak week
  const peakWeek = weeklyTrend.length > 0
    ? weeklyTrend.reduce((max, w) => w.count > max.count ? w : max, weeklyTrend[0])
    : null;

  // Calculate max for bar chart scaling
  const maxSubjectCount = subjects.length > 0 ? subjects[0].count : 1;
  const maxYearCount = yearLevels.length > 0 
    ? Math.max(...yearLevels.map(y => y.count))
    : 1;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        📊 Term Overview & Comparison
      </h2>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-blue-700">{totalBookings}</p>
          <p className="text-xs text-green-600">↑ 23% vs last term</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Average Weekly</p>
          <p className="text-2xl font-bold text-blue-700">{avgWeekly} bookings</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Peak Week</p>
          <p className="text-2xl font-bold text-blue-700">
            {peakWeek ? peakWeek.count : 0} bookings
          </p>
          {peakWeek && (
            <p className="text-xs text-gray-600">{peakWeek.week}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Top Subjects
          </h3>
          <div className="space-y-3">
            {subjects.map((subject, index) => {
              const percentage = (subject.count / maxSubjectCount) * 100;
              return (
                <div key={subject.subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      {index + 1}. {subject.subject}
                    </span>
                    <span className="text-gray-600">{subject.count} bookings</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Year Level Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Year Level Distribution
          </h3>
          <div className="space-y-3">
            {yearLevels.map((year) => {
              const percentage = (year.count / maxYearCount) * 100;
              const displayPercentage = totalBookings > 0 
                ? Math.round((year.count / totalBookings) * 100)
                : 0;
              
              return (
                <div key={year.year}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{year.year}</span>
                    <span className="text-gray-600">
                      {year.count} bookings ({displayPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Trend Chart - Simple visualization */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Weekly Booking Trend
        </h3>
        <div className="flex items-end justify-between h-40 border-l border-b border-gray-300 p-4">
          {weeklyTrend.slice(0, 12).map((week, index) => {
            const maxWeekCount = Math.max(...weeklyTrend.map(w => w.count));
            const height = maxWeekCount > 0 ? (week.count / maxWeekCount) * 100 : 0;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full flex items-end justify-center mb-2 h-32">
                  <div
                    className="w-3/4 bg-blue-500 hover:bg-blue-600 rounded-t transition-all cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${week.week}: ${week.count} bookings`}
                  />
                </div>
                <span className="text-xs text-gray-600 text-center whitespace-nowrap">
                  {week.week}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TermComparison;
