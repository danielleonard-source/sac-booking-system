import React from 'react';

function ConfirmationModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm SAC Booking</h2>
        
        <div className="mb-6">
          <p className="text-gray-700 font-semibold mb-3">I confirm that:</p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>I have discussed the assessment format in detail with each learner (e.g., digital or paper-based, diagram-heavy vs text-heavy, availability of text-to-speech, etc.)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>I have asked each learner which SAC accommodations they will be using for this assessment</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>I have communicated via email with the parents of learners who declined SAC for this assessment</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
