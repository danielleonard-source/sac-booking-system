import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import useDashboardStore from '../../store/dashboardStore';

const AnalyticsTables = () => {
  const [expandedSections, setExpandedSections] = useState({
    learners: true,
    teachers: true,
    sac: false,
    rw: false
  });

  const bookings = useDataStore(state => state.bookings);
  const learners = useDataStore(state => state.learners);
  const teachers = useDataStore(state => state.teachers);
  const readerWriters = useDataStore(state => state.readerWriters);

  const {
    getFilteredBookings,
    getHighUsageLearners,
    getTeacherEngagement,
    getSACBreakdown,
    getRWUtilization
  } = useDashboardStore();

  const filteredBookings = getFilteredBookings(bookings);
  const highUsage = getHighUsageLearners(filteredBookings, learners);
  const teacherStats = getTeacherEngagement(filteredBookings, teachers);
  const sacBreakdown = getSACBreakdown(filteredBookings, learners);
  const rwUtilization = getRWUtilization(filteredBookings, readerWriters);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusBadge = (status) => {
    const styles = {
      not_using: 'bg-red-100 text-red-800',
      low_usage: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      available: 'bg-green-100 text-green-800',
      busy: 'bg-yellow-100 text-yellow-800',
      overloaded: 'bg-red-100 text-red-800'
    };

    const labels = {
      not_using: 'Not Using',
      low_usage: 'Low Usage',
      active: 'Active',
      available: 'Available',
      busy: 'Busy',
      overloaded: 'Overloaded'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* HIGH-USAGE LEARNERS */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div
          className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors flex justify-between items-center"
          onClick={() => toggleSection('learners')}
        >
          <h2 className="text-lg font-bold text-gray-800">
            👥 High-Usage Learners ({highUsage.length})
          </h2>
          <svg
            className={`w-5 h-5 text-gray-600 transform transition-transform ${expandedSections.learners ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {expandedSections.learners && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Learner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SAC Conditions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {highUsage.slice(0, 20).map((item) => (
                  <tr key={item.learner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.learner.firstName} {item.learner.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Y{item.learner.yearLevel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.totalBookings} <span className="text-gray-500">(↑ {item.perWeek}/wk)</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {(() => {
                        // Try conditions array first, then sacConditions string
                        let conditions = item.learner.conditions;
                        
                        // If conditions is empty, try sacConditions (JSON string)
                        if ((!conditions || conditions.length === 0) && item.learner.sacConditions) {
                          try {
                            conditions = JSON.parse(item.learner.sacConditions);
                          } catch (e) {
                            conditions = [];
                          }
                        }
                        
                        return conditions && conditions.length > 0 ? (
                          <>
                            {conditions.slice(0, 3).join(', ')}
                            {conditions.length > 3 && '...'}
                          </>
                        ) : (
                          'No SAC conditions'
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {highUsage.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No high-usage learners found
              </div>
            )}
          </div>
        )}
      </div>

      {/* TEACHER ENGAGEMENT */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div
          className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors flex justify-between items-center"
          onClick={() => toggleSection('teachers')}
        >
          <h2 className="text-lg font-bold text-gray-800">
            📚 Teacher Engagement ({teacherStats.length})
          </h2>
          <svg
            className={`w-5 h-5 text-gray-600 transform transition-transform ${expandedSections.teachers ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {expandedSections.teachers && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teacherStats.map((item) => (
                  <tr key={item.teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.teacher.department || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.bookings} bookings
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.status === 'not_using' && (
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          Send Reminder
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SAC BREAKDOWN */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div
          className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors flex justify-between items-center"
          onClick={() => toggleSection('sac')}
        >
          <h2 className="text-lg font-bold text-gray-800">
            📋 SAC Accommodations Summary
          </h2>
          <svg
            className={`w-5 h-5 text-gray-600 transform transition-transform ${expandedSections.sac ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {expandedSections.sac && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accommodation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Learners
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sacBreakdown.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.condition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.learnerCount} learners
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.bookingCount} bookings
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-green-600">↑ 12%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* R/W UTILIZATION */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div
          className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors flex justify-between items-center"
          onClick={() => toggleSection('rw')}
        >
          <h2 className="text-lg font-bold text-gray-800">
            📚 Reader/Writer Workload Distribution
          </h2>
          <svg
            className={`w-5 h-5 text-gray-600 transform transition-transform ${expandedSections.rw ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {expandedSections.rw && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reader/Writer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rwUtilization.map((item) => (
                  <tr key={item.rw.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.rw.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (item.rw.employmentType || 'casual') === 'permanent' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(item.rw.employmentType || 'casual') === 'permanent' ? 'Permanent' : 'Casual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.assignments} bookings
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.utilizationPercent >= 90 ? 'bg-red-600' :
                              item.utilizationPercent >= 70 ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${item.utilizationPercent}%` }}
                          />
                        </div>
                        <span>{item.utilizationPercent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTables;
