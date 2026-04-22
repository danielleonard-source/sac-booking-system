// =======================================
// CONFIGURATION
// =======================================

export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzg-94gbFfLs6tPzfqVIsVZ5engBz6O-vyVa5-xHqQiJ5Y-T308XK8Nn_wexLFk_Nzm_A/exec';

export const SYSTEM_ADMINS = [
  'daniel.leonard@beth.school.nz',
  'chanel.debruin@beth.school.nz'
];

export const SCHEDULE = {
  Monday: {
    '1': { start: '8:30', end: '9:30', name: 'Period 1' },
    '2': { start: '9:45', end: '10:45', name: 'Period 2' },
    '3': { start: '11:15', end: '12:15', name: 'Period 3' },
    '4': { start: '12:15', end: '1:15', name: 'Period 4' },
    '5': { start: '2:15', end: '3:15', name: 'Period 5' }
  },
  Tuesday: {
    '1': { start: '8:30', end: '9:30', name: 'Period 1' },
    '2': { start: '9:45', end: '10:45', name: 'Period 2' },
    '3': { start: '11:15', end: '12:15', name: 'Period 3' },
    '4': { start: '12:15', end: '1:15', name: 'Period 4' },
    '5': { start: '2:15', end: '3:15', name: 'Period 5' }
  },
  Wednesday: {
    '1': { start: '8:45', end: '9:35', name: 'Period 1' },
    '2': { start: '9:35', end: '10:25', name: 'Period 2' },
    '3': { start: '10:55', end: '11:45', name: 'Period 3' },
    '4': { start: '11:45', end: '12:35', name: 'Period 4' },
    '5': { start: '12:35', end: '1:25', name: 'Period 5' },
    '6': { start: '2:25', end: '3:15', name: 'Period 6' }
  },
  Thursday: {
    '1': { start: '8:30', end: '9:30', name: 'Period 1' },
    '2': { start: '9:45', end: '10:45', name: 'Period 2' },
    '3': { start: '11:15', end: '12:15', name: 'Period 3' },
    '4': { start: '12:15', end: '1:15', name: 'Period 4' },
    '5': { start: '2:15', end: '3:15', name: 'Period 5' }
  },
  Friday: {
    '1': { start: '8:30', end: '9:20', name: 'Period 1' },
    '2': { start: '9:35', end: '10:25', name: 'Period 2' },
    '3': { start: '10:55', end: '11:45', name: 'Period 3' },
    '4': { start: '11:45', end: '12:35', name: 'Period 4' },
    '5': { start: '12:35', end: '1:25', name: 'Period 5' },
    '6': { start: '2:25', end: '3:15', name: 'Period 6' }
  }
};

export const DEFAULT_MAX_CAPACITY = 6;

export const YEAR_LEVELS = ['7', '8', '9', '10', '11', '12', '13'];

export const SPECIAL_CONDITIONS = [
  'Reader',
  'Writer',
  'Computer',
  'Enlarged Paper',
  'Extra Time',
  'Rest Breaks',
  'Separate Accommodation',
  'Separate Accommodation (Small Groups)'
];

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const SAC_DECLINE_REASONS = [
  'No explanation provided',
  'SAC not needed for this subject',
  'Learner not requiring SAC for specific assessment',
  'All future SAC declined for this subject'
];