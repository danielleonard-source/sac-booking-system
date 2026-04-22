import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { useDataStore } from '../../store/dataStore';
import LearnersList from './LearnersList';
import TeachersList from './TeachersList';
import ReaderWritersList from './ReaderWritersList';
import VenuesList from './VenuesList';
import SubjectsList from './SubjectsList';

function AdminPanel() {
  const { adminTab, setAdminTab } = useUIStore();
  const { learners, teachers, readerWriters, venues, subjects } = useDataStore();

  const tabs = [
    { id: 'learners', label: 'Learners', count: learners.length },
    { id: 'teachers', label: 'Teachers', count: teachers.length },
    { id: 'readerwriters', label: 'Reader/Writers', count: readerWriters.length },
    { id: 'venues', label: 'Venues', count: venues.length },
    { id: 'subjects', label: 'Subjects', count: subjects.length }
  ];

  // Default to first tab if on pending
  React.useEffect(() => {
    if (adminTab === 'pending') {
      setAdminTab('learners');
    }
  }, [adminTab, setAdminTab]);

  return (
    <div>
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="flex flex-wrap space-x-1 p-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                adminTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {adminTab === 'learners' && <LearnersList />}
        {adminTab === 'teachers' && <TeachersList />}
        {adminTab === 'readerwriters' && <ReaderWritersList />}
        {adminTab === 'venues' && <VenuesList />}
        {adminTab === 'subjects' && <SubjectsList />}
      </div>
    </div>
  );
}

export default AdminPanel;
