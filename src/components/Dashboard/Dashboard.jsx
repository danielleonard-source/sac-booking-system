import React from 'react';
import WarningBanner from './WarningBanner';
import FilterBar from './FilterBar';
import MetricsCards from './MetricsCards';
import TermComparison from './TermComparison';
import AnalyticsTables from './AnalyticsTables';
import OperationalHealth from './OperationalHealth';

const Dashboard = ({ setActiveView }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              SAC Booking System - Comprehensive Analytics & Management
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Banner */}
        <WarningBanner />

        {/* Filter Bar */}
        <FilterBar />

        {/* Critical Metrics Cards */}
        <MetricsCards setActiveView={setActiveView} />

        {/* Term Comparison Charts */}
        <TermComparison />

        {/* Analytics Tables */}
        <AnalyticsTables />

        {/* Operational Health */}
        <OperationalHealth />

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>SAC Booking System Dashboard</p>
          <p className="mt-1">Developed by Danie Leonard</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
