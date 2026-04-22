// =======================================
// EMAIL HELPERS - CLIENT-SIDE MAILTO
// =======================================

import { SCHEDULE } from '../config';

/**
 * Generate teacher booking notification email
 */
export function generateTeacherEmail(booking, learners) {
  const bookingDate = new Date(booking.date);
  const formattedDate = bookingDate.toLocaleDateString('en-NZ', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const periodInfo = SCHEDULE[booking.day]?.[booking.period] || { 
    name: `Period ${booking.period}`, 
    start: '', 
    end: '' 
  };

  // Build learner details
  const learnerDetails = learners.map(learner => {
    const rwName = booking.readerWriterAssignments?.[learner.id]?.readerWriter || 'Not assigned';
    const venueName = booking.readerWriterAssignments?.[learner.id]?.venue || 'TBD';
    const selectedSAC = booking.selectedSAC?.[learner.id] || learner.sacConditions || [];
    const conditions = Array.isArray(selectedSAC) ? selectedSAC.join(', ') : selectedSAC;
    
    return ` - ${learner.firstName} ${learner.lastName} (Year ${learner.yearLevel})
   R/W: ${rwName}
   Venue: ${venueName}
   Conditions: ${conditions || 'None'}`;
  }).join('\n');

  // Add declined SAC learners if any
  let declinedSACDetails = '';
  if (booking.declinedSACLearners && booking.declinedSACLearners.length > 0) {
    declinedSACDetails = '\n\nLEARNERS WHO DECLINED SAC FOR THIS ASSESSMENT:\n';
    declinedSACDetails += booking.declinedSACLearners.map(lid => {
      const learner = learners.find(l => l.id === lid);
      if (!learner) return '';
      
      const reason = booking.declinedSACReasons?.[lid] || 'No reason provided';
      const conditions = learner.sacConditions || 'None';
      return ` - ${learner.firstName} ${learner.lastName} (Year ${learner.yearLevel})
   SAC on Record: ${conditions}
   Decline Reason: ${reason}`;
    }).filter(Boolean).join('\n');
    
    declinedSACDetails += '\n\n(These learners have SAC but chose not to use it for this assessment)';
  }

  const emailBody = `BOOKING STATUS: ${booking.status.toUpperCase()}

${booking.status === 'declined' && booking.declineReason ? `REASON:
${booking.declineReason}

` : ''}DETAILS:
Date: ${formattedDate}
Period: ${periodInfo.name} (${periodInfo.start} - ${periodInfo.end})
Subject: ${booking.subject}
Room: ${booking.room}
Teacher: ${booking.teacher}
Year: ${booking.yearLevel}

LEARNERS USING SAC:
${learnerDetails}${declinedSACDetails}

---
This is an automated notification from the SAC Booking System.`;

  const subject = `SAC Booking ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}: ${booking.subject}`;

  return {
    to: booking.teacherEmail,
    subject,
    body: emailBody
  };
}

/**
 * Generate learner/parent notification email
 */
export function generateLearnerEmail(booking, learner) {
  const bookingDate = new Date(booking.date);
  const formattedDate = bookingDate.toLocaleDateString('en-NZ', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const periodInfo = SCHEDULE[booking.day]?.[booking.period] || { 
    name: `Period ${booking.period}`, 
    start: '', 
    end: '' 
  };

  const rwAssignment = booking.readerWriterAssignments?.[learner.id];
  const rwName = rwAssignment?.readerWriter || 'To be assigned';
  const venueName = rwAssignment?.venue || 'To be confirmed';

  const selectedSAC = booking.selectedSAC?.[learner.id] || learner.sacConditions || [];
  const conditions = Array.isArray(selectedSAC) ? selectedSAC.join(', ') : selectedSAC;

  const emailBody = `SAC ASSESSMENT NOTIFICATION

Dear ${learner.firstName} ${learner.lastName},

This is to confirm your Special Assessment Conditions for the upcoming assessment:

ASSESSMENT DETAILS:
Subject: ${booking.subject}
Teacher: ${booking.teacher}
Date: ${formattedDate}
Time: ${periodInfo.name} (${periodInfo.start} - ${periodInfo.end})

YOUR SAC ARRANGEMENTS:
Conditions: ${conditions || 'None specified'}
Reader/Writer: ${rwName}
Exam Venue: ${venueName}

IMPORTANT:
- Please arrive 5 minutes before the start time
- Bring all required materials (pens, pencils, calculator if permitted)
- Report to ${venueName}

If you have any questions, please contact your teacher or the SAC Coordinator.

---
This is an automated notification from the SAC Booking System.`;

  const subject = `SAC Assessment - ${booking.subject} on ${formattedDate}`;

  // Send to both student and parent if emails available
  const recipients = [];
  if (learner.studentEmail) recipients.push(learner.studentEmail);
  if (learner.parentEmail) recipients.push(learner.parentEmail);

  return {
    to: recipients.join(','),
    subject,
    body: emailBody
  };
}

/**
 * Generate R/W weekly duties email
 */
export function generateRWWeeklyEmail(rw, assignments, weekStart, weekEnd) {
  const emailBody = `READER/WRITER DUTIES
Week of ${weekStart.toLocaleDateString('en-NZ')} - ${weekEnd.toLocaleDateString('en-NZ')}

${assignments.map(a => `${a.date.toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
${a.period.name} (${a.period.start} - ${a.period.end})
Learner: ${a.learner}
Subject: ${a.subject}
Venue: ${a.venue || 'TBD'}

`).join('---\n\n')}
---
This is an automated notification from the SAC Booking System.`;

  const subject = `Your R/W Duties - Week of ${weekStart.toLocaleDateString('en-NZ')}`;

  return {
    to: rw.email,
    subject,
    body: emailBody
  };
}

/**
 * Open mailto link
 */
export function sendEmail({ to, subject, body }) {
  if (!to) {
    throw new Error('No recipient email address');
  }

  const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
  
  return {
    success: true,
    recipient: to
  };
}

/**
 * Track email sent status
 */
export function createEmailStatus(type, recipients = []) {
  return {
    lastSent: new Date().toISOString(),
    sentCount: recipients.length,
    recipients: recipients,
    type: type // 'teacher', 'learners', 'rw'
  };
}
