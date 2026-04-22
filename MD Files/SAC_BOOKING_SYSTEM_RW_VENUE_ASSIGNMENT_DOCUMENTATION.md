# SAC Booking System - Reader/Writer & Venue Assignment System
## Complete Technical Documentation

**Developer:** Danie Leonard  
**Project:** SAC (Special Assessment Conditions) Booking System  
**Tech Stack:** React + Vite (Frontend), Google Apps Script (Backend)  
**Last Updated:** April 8, 2026  
**Version:** 2.0 (R/W & Venue Assignment Complete)

---

## TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [File Structure](#file-structure)
3. [Core Features](#core-features)
4. [Data Model](#data-model)
5. [Availability Logic](#availability-logic)
6. [Component Details](#component-details)
7. [Critical Fixes Applied](#critical-fixes-applied)
8. [What Worked](#what-worked)
9. [What to Avoid](#what-to-avoid)
10. [Testing Scenarios](#testing-scenarios)
11. [Future Enhancements](#future-enhancements)

---

## SYSTEM OVERVIEW

### Purpose
The SAC Booking System allows teachers at Bethlehem College to book Special Assessment Conditions for learners. The R/W & Venue Assignment feature enables administrators to assign Reader/Writers (TAs) and Exam Venues to learners, with support for both individual assignments and small groups.

### Key Business Rules
1. **One R/W per learner** OR **one R/W per small group** (shared by multiple learners)
2. **One venue per learner** OR **one venue per small group** (shared by multiple learners)
3. **No double-booking:** R/Ws and venues can only be used once per session (same date + day + period)
4. **Teacher Room vs Exam Venue:** Teacher Room = where teacher teaches from; Exam Venue = where learner sits exam with R/W
5. **Admin-only assignment:** Only admins can assign R/Ws and venues; teachers create bookings

### Session Definition
A "session" is defined by three fields:
- **Date** (e.g., "2026-04-15")
- **Day** (e.g., "Monday")
- **Period** (e.g., "1", "2", "3", etc.)

All bookings with the same date + day + period are in the same session and share the same R/W and venue pool.

---

## FILE STRUCTURE

### Complete Project Structure
```
sac-booking-system/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Bookings/
│   │   │   ├── Bookings.jsx                    # Main bookings list view
│   │   │   ├── BookingCard.jsx                 # Individual booking display card
│   │   │   └── BookingFormModal.jsx            # Create/Edit booking form
│   │   ├── Modals/
│   │   │   ├── AssignRWModal.jsx               # ⭐ R/W & Venue assignment modal
│   │   │   └── HistoryModal.jsx                # Booking history timeline
│   │   └── Admin/
│   │       └── AdminPanel.jsx                  # Admin dashboard
│   ├── store/
│   │   ├── dataStore.js                        # Main data state (Zustand)
│   │   ├── authStore.js                        # Authentication state
│   │   └── uiStore.js                          # UI state (modals, notifications)
│   ├── utils/
│   │   └── helpers.js                          # Helper functions
│   ├── config.js                               # Constants (year levels, schedule)
│   ├── App.jsx                                 # Root component
│   └── main.jsx                                # Entry point
├── package.json
├── vite.config.js
└── README.md
```

### Key Files Modified in This Feature

#### 1. `src/components/Modals/AssignRWModal.jsx`
**Purpose:** Unified modal for assigning R/Ws and venues to learners  
**Size:** ~460 lines  
**State:** Local state for assignments, venue assignments, small groups  
**Key Functions:**
- `createSmallGroup()` - Creates new small group
- `addLearnerToGroup()` - Moves learner from individual → group
- `removeLearnerFromGroup()` - Moves learner from group → individual
- `updateGroupRW()` - Updates small group R/W
- `updateGroupVenue()` - Updates small group venue
- `handleSave()` - Saves all assignments to booking

#### 2. `src/components/Bookings/BookingCard.jsx`
**Purpose:** Display individual booking with R/W & venue assignments  
**Size:** ~405 lines  
**Key Changes:**
- Renamed "R/W" button → "R/W & Venue"
- Removed separate "Venue" button
- Added small group display logic
- Shows individual vs group assignments differently

#### 3. `src/components/Bookings/BookingFormModal.jsx`
**Purpose:** Create/Edit booking form  
**Size:** ~680 lines  
**Key Changes:**
- "Room" renamed to "Teacher Room"
- Removed "Venue" field from teacher section
- Added Section 3: R/W & Exam Venues (edit mode only)
- Per-learner R/W and venue dropdowns in edit form

#### 4. `src/store/dataStore.js`
**Purpose:** Zustand store for all data  
**Key Change:** Added JSON parsing for bookings data from backend
```javascript
const parsedBookings = (extracted.bookings || []).map(booking => ({
  ...booking,
  learners: safeJSONParse(booking.learners, []),
  learnerNames: safeJSONParse(booking.learnerNames, []),
  readerWriters: safeJSONParse(booking.readerWriters, {}),
  learnerVenues: safeJSONParse(booking.learnerVenues, {}),
  smallGroups: safeJSONParse(booking.smallGroups, [])
}));
```

---

## CORE FEATURES

### Feature 1: Individual R/W & Venue Assignment

**What it does:**
Assigns one Reader/Writer and one Exam Venue to a single learner.

**Data Structure:**
```javascript
{
  readerWriters: {
    "1773093396052_ewy07ydhh": "John Smith"  // learnerId: rwName
  },
  learnerVenues: {
    "1773093396052_ewy07ydhh": "Exam Room A"  // learnerId: venueName
  }
}
```

**UI Display:**
```
┌─────────────────────────────────────┐
│ Zuri Bayly                          │
│ Year 11                             │
│                                     │
│ ✓ R/W: John Smith                  │
│ ✓ Venue: Exam Room A                │
└─────────────────────────────────────┘
```

**Use Case:** Most common scenario - each learner has their own R/W and venue.

---

### Feature 2: Small Group Assignment

**What it does:**
Assigns one Reader/Writer and one Exam Venue to multiple learners in the same group.

**Data Structure:**
```javascript
{
  smallGroups: [
    {
      id: 1,
      learners: ["learner_id_1", "learner_id_2", "learner_id_3"],
      readerWriter: "Mary Johnson",
      venue: "Exam Room C"
    },
    {
      id: 2,
      learners: ["learner_id_4", "learner_id_5"],
      readerWriter: "Peter Wilson",
      venue: "Exam Room D"
    }
  ]
}
```

**UI Display:**
```
┌─────────────────────────────────────┐
│ Zuri Bayly                          │
│ Year 11                             │
│                                     │
│ 🔵 Small Group 1                    │
│ ✓ R/W: Mary Johnson                │
│ ✓ Venue: Exam Room C                │
└─────────────────────────────────────┘
```

**Use Case:** When 2-5 learners can share the same R/W and venue (e.g., same subject, same SAC needs).

**Business Logic:**
- Unlimited groups can be created
- Each group has unique ID (1, 2, 3, ...)
- Learners can be moved between individual ↔ group
- Deleting group returns learners to individual status

---

### Feature 3: Availability Checking

**Critical Feature:** Prevents double-booking of R/Ws and venues in the same session.

**Session Match Logic:**
```javascript
const sessionBookings = bookings.filter(b => 
  b.id !== selectedBooking.id &&              // Exclude current booking
  b.date === selectedBooking.date &&          // Same date
  b.day === selectedBooking.day &&            // Same day
  b.period === selectedBooking.period &&      // Same period
  (b.status === 'confirmed' || b.status === 'pending')  // Active bookings only
);
```

**Used Resources Collection:**
```javascript
const usedRWs = new Set();
const usedVenues = new Set();

sessionBookings.forEach(booking => {
  // Individual RW assignments
  if (booking.readerWriters && typeof booking.readerWriters === 'object') {
    Object.values(booking.readerWriters).forEach(rwName => {
      if (rwName && rwName.trim()) {
        usedRWs.add(rwName.trim());
      }
    });
  }
  
  // Small group RWs and venues
  if (Array.isArray(booking.smallGroups)) {
    booking.smallGroups.forEach(group => {
      if (group.readerWriter && group.readerWriter.trim()) {
        usedRWs.add(group.readerWriter.trim());
      }
      if (group.venue && group.venue.trim()) {
        usedVenues.add(group.venue.trim());
      }
    });
  }
  
  // Individual venue assignments
  if (booking.learnerVenues && typeof booking.learnerVenues === 'object') {
    Object.values(booking.learnerVenues).forEach(venueName => {
      if (venueName && venueName.trim()) {
        usedVenues.add(venueName.trim());
      }
    });
  }
});
```

**Per-Learner Filtering Logic:**
```javascript
{readerWriters.map(rw => {
  const rwName = `${rw.firstName} ${rw.lastName}`.trim();
  
  // Check if this R/W is used elsewhere (not by THIS learner)
  const isUsedElsewhere = usedRWs.has(rwName);
  const isAssignedToThisLearner = assignments[learner.id] === rwName;
  const isInSmallGroup = smallGroups.some(g => g.readerWriter?.trim() === rwName);
  
  // Show if: (not used elsewhere OR assigned to THIS learner) AND not in a small group
  const shouldShow = (!isUsedElsewhere || isAssignedToThisLearner) && !isInSmallGroup;
  
  if (!shouldShow) return null;
  
  return (
    <option key={rw.id} value={rwName}>
      {rw.firstName} {rw.lastName}
    </option>
  );
})}
```

**Per-Group Filtering Logic:**
```javascript
{readerWriters.map(rw => {
  const rwName = `${rw.firstName} ${rw.lastName}`.trim();
  
  // Check if used elsewhere (not by THIS group)
  const isUsedElsewhere = usedRWs.has(rwName);
  const isAssignedToThisGroup = group.readerWriter?.trim() === rwName;
  const isInOtherGroup = smallGroups.some(g => 
    g.id !== group.id && g.readerWriter?.trim() === rwName
  );
  const isInIndividual = Object.values(assignments).includes(rwName);
  
  // Show if: (not used elsewhere OR assigned to THIS group) 
  // AND not in another group AND not assigned individually
  const shouldShow = (!isUsedElsewhere || isAssignedToThisGroup) && 
                    !isInOtherGroup && !isInIndividual;
  
  if (!shouldShow) return null;
  
  return (
    <option key={rw.id} value={rwName}>
      {rw.firstName} {rw.lastName}
    </option>
  );
})}
```

---

## DATA MODEL

### Booking Object Schema
```javascript
{
  id: "1712345678901_abc123",                    // Unique booking ID
  date: "2026-04-15",                            // ISO date string
  day: "Monday",                                 // Day of week
  period: "1",                                   // Period number (string)
  subject: "Mathematics",                        // Subject name
  subjectCode: "MAT",                            // Subject code
  teacher: "Hayley Aranas",                      // Teacher name
  teacherEmail: "hayley.aranas@beth.school.nz",  // Teacher email
  teacherId: "teacher_id_123",                   // Teacher ID
  room: "T136",                                  // Teacher Room (teaching location)
  yearLevel: "11",                               // Year level
  learners: [                                    // Array of learner IDs
    "1773093396052_ewy07ydhh",
    "1773093396053_xyz456"
  ],
  learnerNames: [                                // Array of learner names
    "Zuri Bayly",
    "Another Student"
  ],
  reason: "NCEA External",                       // Booking reason
  status: "confirmed",                           // Status: pending|confirmed|declined|edit_pending|deletion_pending
  
  // R/W & Venue Assignment Data
  readerWriters: {                               // Individual R/W assignments
    "1773093396052_ewy07ydhh": "John Smith",
    "1773093396053_xyz456": "Jane Doe"
  },
  learnerVenues: {                               // Individual venue assignments
    "1773093396052_ewy07ydhh": "Exam Room A",
    "1773093396053_xyz456": "Exam Room B"
  },
  smallGroups: [                                 // Small group assignments
    {
      id: 1,
      learners: ["learner_id_3", "learner_id_4"],
      readerWriter: "Mary Johnson",
      venue: "Exam Room C"
    }
  ],
  
  // Metadata
  createdAt: "2026-04-08T10:30:00Z",
  createdBy: "teacher_id_123",
  updatedAt: "2026-04-08T12:45:00Z",
  updatedBy: "admin_id_456"
}
```

### Learner Object Schema
```javascript
{
  id: "1773093396052_ewy07ydhh",                 // Unique learner ID
  studentId: "12345",                            // School student ID
  firstName: "Zuri",
  lastName: "Bayly",
  yearLevel: 11,
  email: "zuri.bayly@student.beth.school.nz",
  parentEmail: "parent@example.com",
  sacConditions: "Reader/Writer, Extra Time",    // SAC accommodations
  isDeclined: false                              // If SAC declined
}
```

### Reader/Writer Object Schema
```javascript
{
  id: "rw_id_123",
  firstName: "John",
  lastName: "Smith",
  email: "john.smith@beth.school.nz"
}
```

### Venue Object Schema
```javascript
{
  id: "venue_id_123",
  name: "Exam Room A",
  capacity: 10,
  type: "exam_room"
}
```

---

## AVAILABILITY LOGIC

### Core Principle
**Per-entity checking:** Availability must be checked per learner and per group, NOT per booking.

### Why This Matters

**WRONG Approach (Booking-Level):**
```javascript
// ❌ This removes R/W from ALL learners in the booking, including the one it's assigned to!
const currentlyAssignedRWs = new Set();
Object.values(assignments).forEach(rwName => {
  if (rwName) currentlyAssignedRWs.add(rwName.trim());
});

const availableRWs = readerWriters.filter(rw => {
  const rwName = `${rw.firstName} ${rw.lastName}`.trim();
  const isUsedElsewhere = usedRWs.has(rwName);
  const isCurrentlyAssigned = currentlyAssignedRWs.has(rwName);
  
  // BUG: If "John Smith" is assigned to Learner A, 
  // this logic REMOVES "John Smith" from Learner A's dropdown!
  return !isUsedElsewhere || isCurrentlyAssigned;
});
```

**Result:** Learner A has "John Smith" assigned, but when you open the modal, "John Smith" doesn't appear in Learner A's dropdown. You can't edit the assignment!

**CORRECT Approach (Entity-Level):**
```javascript
// ✅ Check if this R/W is assigned to THIS SPECIFIC learner
{readerWriters.map(learner => {
  const rwName = `${rw.firstName} ${rw.lastName}`.trim();
  
  const isUsedElsewhere = usedRWs.has(rwName);
  const isAssignedToThisLearner = assignments[learner.id] === rwName;  // ← KEY FIX
  const isInSmallGroup = smallGroups.some(g => g.readerWriter?.trim() === rwName);
  
  // Show if: (not used elsewhere OR assigned to THIS learner) AND not in small group
  const shouldShow = (!isUsedElsewhere || isAssignedToThisLearner) && !isInSmallGroup;
  
  if (!shouldShow) return null;
  
  return <option key={rw.id} value={rwName}>{rw.firstName} {rw.lastName}</option>;
})}
```

**Result:** Each learner sees their own assigned R/W in their dropdown, even if it's "used" by them!

### Availability Rules Summary

#### Individual Learner R/W Dropdown
Show R/W if ALL are true:
1. ✅ NOT used in another booking (same session)
2. ✅ OR is currently assigned to THIS SPECIFIC learner
3. ✅ NOT assigned to a small group in this booking
4. ✅ NOT assigned to a different learner in this booking

#### Individual Learner Venue Dropdown
Show Venue if ALL are true:
1. ✅ NOT used in another booking (same session)
2. ✅ OR is currently assigned to THIS SPECIFIC learner
3. ✅ NOT assigned to a small group in this booking
4. ✅ NOT assigned to a different learner in this booking

#### Small Group R/W Dropdown
Show R/W if ALL are true:
1. ✅ NOT used in another booking (same session)
2. ✅ OR is currently assigned to THIS SPECIFIC group
3. ✅ NOT assigned to a different small group in this booking
4. ✅ NOT assigned to an individual learner in this booking

#### Small Group Venue Dropdown
Show Venue if ALL are true:
1. ✅ NOT used in another booking (same session)
2. ✅ OR is currently assigned to THIS SPECIFIC group
3. ✅ NOT assigned to a different small group in this booking
4. ✅ NOT assigned to an individual learner in this booking

---

## COMPONENT DETAILS

### AssignRWModal.jsx

**File Path:** `src/components/Modals/AssignRWModal.jsx`

**Purpose:** Unified modal for assigning Reader/Writers and Exam Venues to learners, supporting both individual assignments and small groups.

**Props:** None (uses Zustand stores)

**State:**
```javascript
const [assignments, setAssignments] = useState({});          // { learnerId: rwName }
const [venueAssignments, setVenueAssignments] = useState({}); // { learnerId: venueName }
const [smallGroups, setSmallGroups] = useState([]);          // Array of group objects
const [nextGroupId, setNextGroupId] = useState(1);           // Auto-incrementing group ID
```

**Key Functions:**

#### `createSmallGroup()`
Creates a new small group with unique ID.
```javascript
const createSmallGroup = () => {
  const newGroup = {
    id: nextGroupId,
    learners: [],
    readerWriter: '',
    venue: ''
  };
  setSmallGroups([...smallGroups, newGroup]);
  setNextGroupId(nextGroupId + 1);
};
```

#### `addLearnerToGroup(learnerId, groupId)`
Moves learner from individual assignment to small group.
```javascript
const addLearnerToGroup = (learnerId, groupId) => {
  // Remove from individual assignments
  const newAssignments = { ...assignments };
  delete newAssignments[learnerId];
  setAssignments(newAssignments);

  const newVenueAssignments = { ...venueAssignments };
  delete newVenueAssignments[learnerId];
  setVenueAssignments(newVenueAssignments);

  // Add to group
  const newGroups = smallGroups.map(group => {
    if (group.id === groupId) {
      return {
        ...group,
        learners: [...(group.learners || []), learnerId]
      };
    }
    return group;
  });
  setSmallGroups(newGroups);
};
```

#### `removeLearnerFromGroup(learnerId, groupId)`
Moves learner from small group back to individual status.
```javascript
const removeLearnerFromGroup = (learnerId, groupId) => {
  const newGroups = smallGroups.map(group => {
    if (group.id === groupId) {
      return {
        ...group,
        learners: (group.learners || []).filter(id => id !== learnerId)
      };
    }
    return group;
  });
  setSmallGroups(newGroups);
};
```

#### `deleteSmallGroup(groupId)`
Deletes entire small group, returning learners to individual status.
```javascript
const deleteSmallGroup = (groupId) => {
  setSmallGroups(smallGroups.filter(g => g.id !== groupId));
};
```

#### `updateGroupRW(groupId, rwName)`
Updates Reader/Writer for a small group.
```javascript
const updateGroupRW = (groupId, rwName) => {
  const newGroups = smallGroups.map(group => {
    if (group.id === groupId) {
      return { ...group, readerWriter: rwName };
    }
    return group;
  });
  setSmallGroups(newGroups);
};
```

#### `updateGroupVenue(groupId, venueName)`
Updates venue for a small group.
```javascript
const updateGroupVenue = (groupId, venueName) => {
  const newGroups = smallGroups.map(group => {
    if (group.id === groupId) {
      return { ...group, venue: venueName };
    }
    return group;
  });
  setSmallGroups(newGroups);
};
```

#### `handleSave()`
Saves all assignments to booking.
```javascript
const handleSave = async () => {
  try {
    await updateBooking(selectedBooking.id, {
      readerWriters: assignments,
      learnerVenues: venueAssignments,
      smallGroups: smallGroups
    });
    showNotification('Assignments saved successfully', 'success');
    closeAssignRWModal();
  } catch (error) {
    showNotification('Failed to save assignments: ' + error.message, 'error');
  }
};
```

**Modal Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 👤 Assign Reader/Writers & Venues                       │
│ Mathematics - Monday P1                                 │
├─────────────────────────────────────────────────────────┤
│ Small Groups (1 R/W, Multiple Learners, 1 Venue)       │
│ [➕ Create Small Group]                                 │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Group 1                          [🗑️ Delete Group] │  │
│ │ [R/W Dropdown ▼]  [Venue Dropdown ▼]              │  │
│ │ Learners in Group (2):                             │  │
│ │   • Zuri Bayly [Remove]                            │  │
│ │   • Another Student [Remove]                       │  │
│ └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│ Individual Assignments (1 Learner, 1 R/W, 1 Venue)     │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Third Student                                      │  │
│ │ Year 11                [Add to Group... ▼]         │  │
│ │ [R/W Dropdown ▼]  [Venue Dropdown ▼]              │  │
│ │ ✓ Current: John Smith  ✓ Current: Exam Room A     │  │
│ └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│ ℹ️ Availability: R/Ws and Venues already assigned to   │
│ other bookings in this session are hidden.             │
├─────────────────────────────────────────────────────────┤
│                          [Cancel]  [💾 Save Assignments]│
└─────────────────────────────────────────────────────────┘
```

**Visual Indicators:**
- 🔵 Blue background = Small group section
- ⚪ White background = Individual learner card
- 🟢 Green text = Current assignment indicator
- Blue card border = Learner in small group

**useEffect Hook:**
```javascript
useEffect(() => {
  if (assignRWModalOpen && selectedBooking) {
    // Load existing assignments
    const existingRW = selectedBooking.readerWriters || {};
    const existingVenues = selectedBooking.learnerVenues || {};
    const existingGroups = selectedBooking.smallGroups || [];

    setAssignments(existingRW);
    setVenueAssignments(existingVenues);
    setSmallGroups(existingGroups);
    
    if (existingGroups.length > 0) {
      const maxId = Math.max(...existingGroups.map(g => g.id || 0));
      setNextGroupId(maxId + 1);
    }
  }
}, [assignRWModalOpen, selectedBooking]);
```

---

### BookingCard.jsx

**File Path:** `src/components/Bookings/BookingCard.jsx`

**Purpose:** Display individual booking with all details, including R/W and venue assignments.

**Props:**
```javascript
{
  booking: Object,        // Complete booking object
  onApprove: Function,    // Callback for approval
  onDecline: Function,    // Callback for decline
  onEdit: Function,       // Callback for edit
  onDelete: Function      // Callback for delete
}
```

**Key Display Logic:**

#### Teacher Room Display
```javascript
<p className="text-sm font-medium text-gray-900">
  {teacher ? teacher.name : booking.teacher || 'Unknown'}
  {booking.room && <span className="text-gray-600 ml-2">• {booking.room}</span>}
</p>
```

#### Small Group vs Individual Display
```javascript
{bookingLearners.map(learner => {
  const rwName = rwAssignments[learner.id];
  const learnerVenue = booking.learnerVenues && booking.learnerVenues[learner.id];
  
  // Check if learner is in a small group
  const smallGroup = booking.smallGroups?.find(g => 
    g.learners?.includes(learner.id) || 
    g.learners?.includes(learner.id?.toString())
  );

  return (
    <div key={learner.id} className={`rounded-lg p-3 border ${
      smallGroup ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Learner name and year */}
      <p className="font-medium text-sm text-gray-900">
        {learner.firstName} {learner.lastName}
        <span className="text-gray-500 text-xs ml-2">Y{learner.yearLevel}</span>
      </p>

      {/* Small Group or Individual Assignment */}
      {smallGroup ? (
        <div className="mt-1 flex flex-wrap gap-1">
          <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold">
            Small Group {smallGroup.id}
          </span>
          {smallGroup.readerWriter && (
            <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
              R/W: {smallGroup.readerWriter}
            </span>
          )}
          {smallGroup.venue && (
            <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium">
              Venue: {smallGroup.venue}
            </span>
          )}
        </div>
      ) : (
        <div className="mt-1 flex flex-wrap gap-1">
          {rwName && (
            <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
              R/W: {rwName}
            </span>
          )}
          {learnerVenue && (
            <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium">
              Venue: {learnerVenue}
            </span>
          )}
        </div>
      )}
    </div>
  );
})}
```

#### Button Layout (Admin)
```javascript
<div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-gray-200">
  {/* History - Everyone */}
  <button onClick={() => openHistoryModal(booking)}>
    📜 History
  </button>

  {/* Admin Actions */}
  {userRole === 'admin' && (
    <>
      {/* Approve/Decline for pending bookings */}
      {(booking.status === 'pending' || booking.status === 'edit_pending' || 
        booking.status === 'deletion_pending') && (
        <>
          <button onClick={handleApprove}>✓ Approve</button>
          <button onClick={handleDecline}>✕ Decline</button>
        </>
      )}

      {/* Assign R/W & Venue - for confirmed AND pending bookings */}
      {(booking.status === 'confirmed' || booking.status === 'pending') && (
        <button onClick={() => openAssignRWModal(booking)}>
          👤 R/W & Venue
        </button>
      )}

      {/* Edit and Delete */}
      <button onClick={handleEdit}>✏️ Edit</button>
      <button onClick={handleDelete}>🗑️ Delete</button>
    </>
  )}
</div>
```

**Badge Color Coding:**
- 🔵 **Blue badge:** "Small Group X" (group membership)
- 🟢 **Green badge:** "R/W: [Name]" (reader/writer assignment)
- 🟣 **Purple badge:** "Venue: [Name]" (exam venue assignment)

---

### BookingFormModal.jsx

**File Path:** `src/components/Bookings/BookingFormModal.jsx`

**Purpose:** Create and edit bookings with R/W and venue assignment in edit mode.

**State:**
```javascript
const [form, setForm] = useState({
  date: '',
  day: '',
  period: '',
  subject: '',
  subjectCode: '',
  teacher: currentUser?.name || '',
  teacherEmail: currentUser?.email || '',
  teacherId: currentUser?.id || '',
  yearLevel: '',
  room: '',                    // Teacher Room
  learners: [],
  reason: '',
  venue: '',
  readerWriters: {},           // { learnerId: rwName }
  learnerVenues: {},           // { learnerId: venueName }
  smallGroups: [],             // Array of group objects
  status: 'pending'
});
```

**Section 1: Date, Time & Location**
```javascript
<div className="bg-gray-50 rounded-lg p-5">
  <h3 className="font-bold text-gray-800 mb-4 flex items-center">
    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
    Date, Time & Location
  </h3>
  
  {/* Date input */}
  <div>
    <label>Date *</label>
    <input type="date" value={form.date} onChange={...} />
  </div>
  
  {/* Day and Period */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label>Day *</label>
      <select value={form.day} onChange={...}>
        <option value="">Select day</option>
        {SCHEDULE.days.map(day => (
          <option key={day} value={day}>{day}</option>
        ))}
      </select>
    </div>
    <div>
      <label>Period *</label>
      <select value={form.period} onChange={...}>
        <option value="">Select period</option>
        {SCHEDULE.periods.map(period => (
          <option key={period} value={period}>Period {period}</option>
        ))}
      </select>
    </div>
  </div>
  
  {/* Teacher Room */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Teacher Room <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={form.room}
        onChange={(e) => setForm(prev => ({ ...prev, room: e.target.value }))}
        placeholder="e.g., Q110, T136"
        required
      />
      <p className="text-xs text-gray-500 mt-1">Where you'll teach from</p>
    </div>
  </div>
</div>
```

**Section 2: Subject & Teacher**
```javascript
<div className="bg-gray-50 rounded-lg p-5">
  <h3 className="font-bold text-gray-800 mb-4 flex items-center">
    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
    Subject & Teacher
  </h3>
  
  {/* Subject dropdown */}
  <div>
    <label>Subject *</label>
    <select value={form.subject} onChange={handleSubjectChange}>
      <option value="">Select subject</option>
      {subjects.map(subject => (
        <option key={subject.id} value={subject.id}>
          {subject.name} ({subject.code || subject.ttCode})
        </option>
      ))}
    </select>
  </div>
  
  {/* Year Level */}
  <div>
    <label>Year Level *</label>
    <select value={form.yearLevel} onChange={...}>
      <option value="">Select year level</option>
      {YEAR_LEVELS.map(level => (
        <option key={level} value={level}>Year {level}</option>
      ))}
    </select>
  </div>
  
  {/* Teacher (read-only) */}
  <div>
    <label>Teacher</label>
    <input type="text" value={form.teacher} disabled />
  </div>
</div>
```

**Section 3: R/W & Exam Venues (EDIT MODE ONLY)**
```javascript
{editingBooking && currentLearners.length > 0 && (
  <div className="bg-gray-50 rounded-lg p-5">
    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
      Reader/Writers & Exam Venues
    </h3>
    
    <div className="space-y-3">
      {currentLearners.map(learner => (
        <div key={learner.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="mb-3">
            <h4 className="font-bold text-gray-900">{learner.firstName} {learner.lastName}</h4>
            <p className="text-xs text-gray-600">Year {learner.yearLevel}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Reader/Writer Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Reader/Writer
              </label>
              <select
                value={form.readerWriters?.[learner.id] || ''}
                onChange={(e) => {
                  setForm(prev => ({
                    ...prev,
                    readerWriters: {
                      ...prev.readerWriters,
                      [learner.id]: e.target.value
                    }
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">No R/W</option>
                {readerWriters.map(rw => (
                  <option key={rw.id} value={`${rw.firstName} ${rw.lastName}`.trim()}>
                    {rw.firstName} {rw.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Exam Venue Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Exam Venue
              </label>
              <select
                value={form.learnerVenues?.[learner.id] || ''}
                onChange={(e) => {
                  setForm(prev => ({
                    ...prev,
                    learnerVenues: {
                      ...prev.learnerVenues,
                      [learner.id]: e.target.value
                    }
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">No Venue</option>
                {venues.map(venue => (
                  <option key={venue.id} value={venue.name}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-800">
        💡 <strong>Tip:</strong> You can also use the "R/W & Venue" button from the booking card to assign small groups and manage advanced settings.
      </p>
    </div>
  </div>
)}
```

**Section 4: Learners**
```javascript
<div className="bg-gray-50 rounded-lg p-5">
  <h3 className="font-bold text-gray-800 mb-4 flex items-center">
    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
      {editingBooking && currentLearners.length > 0 ? '4' : '3'}
    </span>
    Learners
  </h3>

  {/* Currently Booked Learners */}
  {currentLearners.length > 0 && (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-700">
          Currently Booked ({currentLearners.length})
        </label>
        <span className="text-xs text-gray-500">Click ✕ to remove</span>
      </div>
      
      <div className="space-y-2">
        {currentLearners.map(learner => (
          <div 
            key={learner.id}
            className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <div>
              <p className="font-medium text-sm">{learner.firstName} {learner.lastName}</p>
              <p className="text-xs text-gray-600">Year {learner.yearLevel}</p>
            </div>
            <button
              onClick={() => handleRemoveLearner(learner.id)}
              className="text-red-500 hover:text-red-700 font-medium text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Add Learners */}
  <div>
    <label className="text-sm font-semibold text-gray-700 mb-2 block">
      Add Learners
    </label>
    
    {/* Year Level Filter */}
    <select
      value={filterYearLevel}
      onChange={(e) => setFilterYearLevel(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
    >
      <option value="all">All Year Levels</option>
      {YEAR_LEVELS.map(level => (
        <option key={level} value={level}>Year {level}</option>
      ))}
    </select>
    
    {/* Search */}
    <input
      type="text"
      placeholder="Search learners..."
      value={searchAvailableLearners}
      onChange={(e) => setSearchAvailableLearners(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
    />
    
    {/* Available Learners */}
    <div className="max-h-60 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2">
      {availableLearners.map(learner => (
        <button
          key={learner.id}
          onClick={() => handleAddLearner(learner.id)}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
        >
          <p className="font-medium text-sm">{learner.firstName} {learner.lastName}</p>
          <p className="text-xs text-gray-600">Year {learner.yearLevel}</p>
        </button>
      ))}
    </div>
  </div>
</div>
```

**Form Initialization (Edit Mode):**
```javascript
useEffect(() => {
  if (bookingFormOpen) {
    if (editingBooking) {
      // EDITING MODE - Prefill everything
      const bookingDate = editingBooking.date ? new Date(editingBooking.date) : null;
      const formattedDate = bookingDate 
        ? bookingDate.toISOString().split('T')[0] 
        : '';
      
      // Parse learners
      let learnerIds = [];
      if (Array.isArray(editingBooking.learners)) {
        learnerIds = editingBooking.learners;
      } else if (typeof editingBooking.learners === 'string') {
        learnerIds = editingBooking.learners.split(',').filter(Boolean);
      }
      
      // Find the subject ID from subject name
      const matchingSubject = subjects.find(s => 
        s.name === editingBooking.subject || 
        s.code === editingBooking.subjectCode ||
        s.ttCode === editingBooking.subjectCode
      );
      
      setForm({
        ...editingBooking,
        date: formattedDate,
        learners: learnerIds,
        subject: matchingSubject?.id || editingBooking.subject || '',
        subjectCode: editingBooking.subjectCode || '',
        teacher: editingBooking.teacher || currentUser?.name || '',
        teacherEmail: editingBooking.teacherEmail || currentUser?.email || '',
        teacherId: editingBooking.teacherId || currentUser?.id || '',
        readerWriters: editingBooking.readerWriters || {},
        learnerVenues: editingBooking.learnerVenues || {},
        smallGroups: editingBooking.smallGroups || []
      });
      
      setFilterYearLevel(editingBooking.yearLevel?.toString() || 'all');
    }
  }
}, [bookingFormOpen, editingBooking, currentUser]);
```

---

## CRITICAL FIXES APPLIED

### Fix 1: Availability Checking Was Not Working

**Problem:**
- Code was building Sets of used R/Ws and venues
- But filtering logic wasn't checking the Sets properly
- R/Ws and venues showed as available even when used elsewhere

**Root Cause:**
```javascript
// ❌ BROKEN CODE
sessionBookings.forEach(booking => {
  if (booking.readerWriters) {
    Object.values(booking.readerWriters).forEach(rwName => {
      if (rwName) usedRWs.add(rwName);  // Missing .trim()!
    });
  }
});

const availableRWs = readerWriters.filter(rw => {
  const rwName = `${rw.firstName} ${rw.lastName}`.trim();
  return !usedRWs.has(rwName);  // This never matches because of trim mismatch!
});
```

**The Fix:**
```javascript
// ✅ FIXED CODE
sessionBookings.forEach(booking => {
  if (booking.readerWriters && typeof booking.readerWriters === 'object') {
    Object.values(booking.readerWriters).forEach(rwName => {
      if (rwName && rwName.trim()) {  // ← Added trim() and null check
        usedRWs.add(rwName.trim());   // ← Consistent trimming
      }
    });
  }
});

const availableRWs = readerWriters.filter(rw => {
  const rwName = `${rw.firstName} ${rw.lastName}`.trim();
  const isUsed = usedRWs.has(rwName);  // ← Now matches correctly
  return !isUsed;
});
```

**Lesson:** Always trim strings consistently and check for null/undefined before processing.

---

### Fix 2: R/W Removed from Assigned Learner

**Problem:**
- Learner A has "John Smith" assigned
- Open modal to edit
- "John Smith" doesn't appear in Learner A's dropdown
- Can't edit the assignment!

**Root Cause:**
```javascript
// ❌ BROKEN CODE - Booking-level checking
const currentlyAssignedRWs = new Set();
Object.values(assignments).forEach(rwName => {
  if (rwName) currentlyAssignedRWs.add(rwName.trim());
});

const availableRWs = readerWriters.filter(rw => {
  const rwName = `${rw.firstName} ${rw.lastName}`.trim();
  const isUsedElsewhere = usedRWs.has(rwName);
  const isCurrentlyAssigned = currentlyAssignedRWs.has(rwName);
  
  // BUG: This checks if R/W is used ANYWHERE in the booking
  // Doesn't distinguish between Learner A and Learner B
  return !isUsedElsewhere || isCurrentlyAssigned;
});

// When rendering dropdown for Learner A:
{availableRWs.map(rw => (
  <option>{rw.firstName} {rw.lastName}</option>
))}
// If "John Smith" is in availableRWs, it shows for ALL learners
// But if it's filtered out, it's gone for ALL learners!
```

**The Fix:**
```javascript
// ✅ FIXED CODE - Per-learner checking
{readerWriters.map(rw => {
  const rwName = `${rw.firstName} ${rw.lastName}`.trim();
  
  // Check if this R/W is used elsewhere (not by THIS learner)
  const isUsedElsewhere = usedRWs.has(rwName);
  const isAssignedToThisLearner = assignments[learner.id] === rwName;  // ← KEY FIX
  const isInSmallGroup = smallGroups.some(g => g.readerWriter?.trim() === rwName);
  
  // Show if: (not used elsewhere OR assigned to THIS learner) AND not in small group
  const shouldShow = (!isUsedElsewhere || isAssignedToThisLearner) && !isInSmallGroup;
  
  if (!shouldShow) return null;
  
  return (
    <option key={rw.id} value={rwName}>
      {rw.firstName} {rw.lastName}
    </option>
  );
})}
```

**Lesson:** Availability must be checked per-entity (per learner, per group), not per-collection (per booking).

---

### Fix 3: Small Group R/W Showing in Individual Dropdowns

**Problem:**
- Create small group with "John Smith" as R/W
- "John Smith" still shows in individual learner dropdowns
- Can assign "John Smith" to both group AND individual (double-booking!)

**Root Cause:**
```javascript
// ❌ BROKEN CODE - Not checking small groups
const availableRWs = readerWriters.filter(rw => {
  const rwName = `${rw.firstName} ${rw.lastName}`.trim();
  const isUsedElsewhere = usedRWs.has(rwName);
  const isCurrentlyAssigned = currentlyAssignedRWs.has(rwName);
  
  // Missing check for small groups!
  return !isUsedElsewhere || isCurrentlyAssigned;
});
```

**The Fix:**
```javascript
// ✅ FIXED CODE - Check small groups in THIS booking
{readerWriters.map(rw => {
  const rwName = `${rw.firstName} ${rw.lastName}`.trim();
  
  const isUsedElsewhere = usedRWs.has(rwName);
  const isAssignedToThisLearner = assignments[learner.id] === rwName;
  const isInSmallGroup = smallGroups.some(g => g.readerWriter?.trim() === rwName);  // ← Added
  
  // Show if: (not used elsewhere OR assigned to THIS learner) AND not in small group
  const shouldShow = (!isUsedElsewhere || isAssignedToThisLearner) && !isInSmallGroup;
  
  if (!shouldShow) return null;
  
  return (
    <option key={rw.id} value={rwName}>
      {rw.firstName} {rw.lastName}
    </option>
  );
})}
```

**Lesson:** Check ALL assignment types (individual, small groups, other bookings) before showing as available.

---

### Fix 4: Venue Not Removed from Teacher Section

**Problem:**
- Booking form had "Venue" field in teacher section
- This was confusing - is it the teacher's room or the exam venue?
- Two different concepts mixed together

**Root Cause:**
Poor UX - mixing two different types of locations:
1. **Teacher Room:** Where the teacher teaches the class
2. **Exam Venue:** Where the learner sits the exam with R/W

**The Fix:**
```javascript
// ✅ FIXED - Renamed and separated
// Section 1: Teacher details
<label>Teacher Room *</label>
<input value={form.room} placeholder="e.g., Q110, T136" />
<p className="text-xs text-gray-500">Where you'll teach from</p>

// Section 3: Per-learner exam venues
<label>Exam Venue</label>
<select value={form.learnerVenues?.[learner.id]}>
  <option value="">No Venue</option>
  {venues.map(v => <option value={v.name}>{v.name}</option>)}
</select>
```

**Lesson:** Clear naming and separation of concerns improves UX dramatically.

---

## WHAT WORKED

### ✅ 1. Per-Entity Availability Checking
Checking availability at the learner/group level instead of booking level solved the "can't edit assignments" bug.

### ✅ 2. Inline Dropdown Rendering
Instead of pre-computing `availableRWs` array, rendering options inline with per-learner checks gave much more control.

```javascript
// ✅ WORKS
{readerWriters.map(rw => {
  const shouldShow = /* per-learner logic */;
  if (!shouldShow) return null;
  return <option>{rw.name}</option>;
})}

// ❌ DOESN'T WORK
const availableRWs = readerWriters.filter(/* booking-level logic */);
{availableRWs.map(rw => <option>{rw.name}</option>)}
```

### ✅ 3. Consistent String Trimming
Always trim strings when building Sets and comparing:
```javascript
usedRWs.add(rwName.trim());  // Always trim when adding
const isUsed = usedRWs.has(rwName.trim());  // Always trim when checking
```

### ✅ 4. Type Checking Before Iteration
Always check data types before iterating:
```javascript
if (booking.readerWriters && typeof booking.readerWriters === 'object') {
  Object.values(booking.readerWriters).forEach(/* ... */);
}

if (Array.isArray(booking.smallGroups)) {
  booking.smallGroups.forEach(/* ... */);
}
```

### ✅ 5. Separation of Concerns
- **Teacher Room** = where teacher teaches (in booking form)
- **Exam Venue** = where learner sits exam (in R/W modal or edit form)
- **R/W Assignment** = which TA assists the learner (in R/W modal or edit form)

Clear separation made the system much easier to understand.

### ✅ 6. Visual Indicators
Using color-coded badges made it immediately clear what type of assignment each learner has:
- 🔵 Blue badge = Small group
- 🟢 Green badge = R/W assigned
- 🟣 Purple badge = Venue assigned

### ✅ 7. Zustand for State Management
Using Zustand stores made it easy to share state across components without prop drilling:
```javascript
// dataStore.js
const useDataStore = create((set) => ({
  bookings: [],
  updateBooking: (id, data) => { /* ... */ }
}));

// Component A
const { updateBooking } = useDataStore();

// Component B
const { bookings } = useDataStore();
```

### ✅ 8. Edit Form R/W Section (Edit Mode Only)
Showing R/W and venue dropdowns in the edit form (Section 3) gave teachers quick access to simple assignments without opening the advanced modal.

### ✅ 9. Two-Method Assignment System
Having two ways to assign R/Ws and venues worked well:
- **Simple:** Edit form dropdowns (for individual assignments)
- **Advanced:** R/W & Venue modal (for small groups and complex scenarios)

---

## WHAT TO AVOID

### ❌ 1. Booking-Level Availability Checking
**DON'T:**
```javascript
const currentlyAssignedRWs = new Set();
Object.values(assignments).forEach(rwName => {
  currentlyAssignedRWs.add(rwName);  // All assignments in booking
});

const availableRWs = readerWriters.filter(rw => {
  return !usedRWs.has(rw.name) || currentlyAssignedRWs.has(rw.name);
  // BUG: Doesn't distinguish between learners
});
```

**DO:**
```javascript
{readerWriters.map(rw => {
  const isAssignedToThisLearner = assignments[learner.id] === rw.name;
  const shouldShow = !usedRWs.has(rw.name) || isAssignedToThisLearner;
  // ✅ Checks THIS specific learner
  if (!shouldShow) return null;
  return <option>{rw.name}</option>;
})}
```

### ❌ 2. Pre-Computing Available Lists
**DON'T:**
```javascript
const availableRWs = readerWriters.filter(/* booking-level logic */);

// Then in render:
{bookingLearners.map(learner => (
  <select>
    {availableRWs.map(rw => <option>{rw.name}</option>)}
    {/* Same list for ALL learners - can't show learner-specific assignments */}
  </select>
))}
```

**DO:**
```javascript
{bookingLearners.map(learner => (
  <select>
    {readerWriters.map(rw => {
      const shouldShow = /* learner-specific logic */;
      if (!shouldShow) return null;
      return <option>{rw.name}</option>;
    })}
  </select>
))}
```

### ❌ 3. Inconsistent String Handling
**DON'T:**
```javascript
usedRWs.add(rwName);  // No trim
const isUsed = usedRWs.has(rwName.trim());  // Trim
// These won't match!
```

**DO:**
```javascript
usedRWs.add(rwName.trim());  // Always trim
const isUsed = usedRWs.has(rwName.trim());  // Always trim
// These will match!
```

### ❌ 4. Skipping Type Checks
**DON'T:**
```javascript
Object.values(booking.readerWriters).forEach(/* ... */);
// Runtime error if readerWriters is null or undefined!
```

**DO:**
```javascript
if (booking.readerWriters && typeof booking.readerWriters === 'object') {
  Object.values(booking.readerWriters).forEach(/* ... */);
}
```

### ❌ 5. Using Generic Variable Names
**DON'T:**
```javascript
const venue = booking.venue;  // Which venue? Teacher's? Exam?
```

**DO:**
```javascript
const teacherRoom = booking.room;  // Clear: where teacher teaches
const examVenue = booking.learnerVenues[learnerId];  // Clear: where learner sits exam
```

### ❌ 6. Mixing Concerns in One Field
**DON'T:**
Have one "venue" field that could mean either teacher room OR exam venue.

**DO:**
Separate fields:
- `room` = Teacher Room (where teacher teaches)
- `learnerVenues[learnerId]` = Exam Venue (where learner sits exam)

### ❌ 7. Forgetting to Check Small Groups
**DON'T:**
```javascript
const isUsed = usedRWs.has(rwName);
// Missing: Is it in a small group in THIS booking?
```

**DO:**
```javascript
const isUsed = usedRWs.has(rwName);
const isInSmallGroup = smallGroups.some(g => g.readerWriter === rwName);
const shouldShow = !isUsed && !isInSmallGroup;
```

### ❌ 8. Not Loading Existing Assignments
**DON'T:**
```javascript
useEffect(() => {
  if (modalOpen && selectedBooking) {
    setAssignments({});  // Always start empty
  }
}, [modalOpen]);
```

**DO:**
```javascript
useEffect(() => {
  if (modalOpen && selectedBooking) {
    setAssignments(selectedBooking.readerWriters || {});  // Load existing
    setVenueAssignments(selectedBooking.learnerVenues || {});
    setSmallGroups(selectedBooking.smallGroups || []);
  }
}, [modalOpen]);
```

### ❌ 9. Using Same Button for Two Actions
**DON'T:**
Have separate "R/W" and "Venue" buttons that both need to be clicked.

**DO:**
One "R/W & Venue" button that opens unified modal for both.

### ❌ 10. Not Providing Visual Feedback
**DON'T:**
Just show dropdown values without indicating what's currently assigned.

**DO:**
Show "✓ Current: John Smith" below dropdown so user knows what's already set.

---

## TESTING SCENARIOS

### Scenario 1: Individual Assignment
**Steps:**
1. Admin opens booking with 1 learner
2. Clicks "R/W & Venue" button
3. Modal opens showing learner
4. Selects "John Smith" from R/W dropdown
5. Selects "Exam Room A" from Venue dropdown
6. Clicks "Save Assignments"

**Expected Result:**
- ✅ Booking updated with `readerWriters: { "learner_id": "John Smith" }`
- ✅ Booking updated with `learnerVenues: { "learner_id": "Exam Room A" }`
- ✅ Booking card shows green badge "R/W: John Smith"
- ✅ Booking card shows purple badge "Venue: Exam Room A"

### Scenario 2: Small Group Creation
**Steps:**
1. Admin opens booking with 3 learners
2. Clicks "R/W & Venue" button
3. Clicks "Create Small Group"
4. Selects "Mary Johnson" for group R/W
5. Selects "Exam Room C" for group venue
6. Clicks "Add to Group" for Learner 1
7. Clicks "Add to Group" for Learner 2
8. Clicks "Save Assignments"

**Expected Result:**
- ✅ Booking updated with `smallGroups: [{ id: 1, learners: ["id1", "id2"], readerWriter: "Mary Johnson", venue: "Exam Room C" }]`
- ✅ Learner 1 card shows blue badge "Small Group 1"
- ✅ Learner 1 card shows green badge "R/W: Mary Johnson"
- ✅ Learner 1 card shows purple badge "Venue: Exam Room C"
- ✅ Learner 2 card shows same badges
- ✅ Learner 3 remains in individual section with no assignments

### Scenario 3: Availability Checking (Cross-Booking)
**Steps:**
1. Booking A (Wed P1) has Learner X with "John Smith" assigned
2. Admin creates Booking B (Wed P1) with Learner Y
3. Admin clicks "R/W & Venue" on Booking B
4. Opens R/W dropdown for Learner Y

**Expected Result:**
- ✅ "John Smith" does NOT appear in dropdown (used in Booking A)
- ✅ Other R/Ws appear normally
- ✅ Cannot assign "John Smith" to Learner Y

### Scenario 4: Availability Checking (Same Booking)
**Steps:**
1. Booking has 2 learners: A and B
2. Admin assigns "John Smith" to Learner A
3. Admin opens R/W dropdown for Learner B

**Expected Result:**
- ✅ "John Smith" does NOT appear in Learner B's dropdown
- ✅ "John Smith" DOES appear in Learner A's dropdown (their assignment)

### Scenario 5: Edit Existing Assignment
**Steps:**
1. Booking has Learner A with "John Smith" and "Exam Room A"
2. Admin clicks "R/W & Venue"
3. Modal opens showing current assignments
4. Admin changes Learner A's R/W to "Jane Doe"
5. Admin clicks "Save Assignments"

**Expected Result:**
- ✅ Dropdown shows "John Smith" selected initially
- ✅ Can change to "Jane Doe"
- ✅ "✓ Current: John Smith" shown below dropdown
- ✅ After save, booking shows "Jane Doe"
- ✅ "John Smith" now available for other bookings

### Scenario 6: Move Learner to Small Group
**Steps:**
1. Booking has Learner A with individual assignment
2. Admin creates small group
3. Admin clicks "Add to Group" for Learner A
4. Selects "Group 1"

**Expected Result:**
- ✅ Learner A's individual R/W assignment removed
- ✅ Learner A's individual venue assignment removed
- ✅ Learner A appears in Group 1's learner list
- ✅ Learner A's card shows blue "Small Group 1" badge

### Scenario 7: Remove Learner from Small Group
**Steps:**
1. Booking has Learner A in Small Group 1
2. Admin clicks "Remove" next to Learner A in group
3. Clicks "Save Assignments"

**Expected Result:**
- ✅ Learner A removed from Group 1's learner list
- ✅ Learner A appears in individual section
- ✅ Learner A has no R/W or venue assigned
- ✅ Learner A's card shows no group badge

### Scenario 8: Delete Small Group
**Steps:**
1. Booking has Small Group 1 with 2 learners
2. Admin clicks "Delete Group" on Group 1
3. Clicks "Save Assignments"

**Expected Result:**
- ✅ Group 1 removed from `smallGroups` array
- ✅ Both learners appear in individual section
- ✅ Both learners have no assignments
- ✅ Group's R/W and venue now available for other use

### Scenario 9: Small Group R/W Excluded from Individual
**Steps:**
1. Booking has Small Group 1 with "John Smith"
2. Admin opens individual R/W dropdown for Learner B

**Expected Result:**
- ✅ "John Smith" does NOT appear (assigned to group)
- ✅ Other R/Ws appear normally

### Scenario 10: Edit Form R/W Assignment
**Steps:**
1. Teacher creates booking with 2 learners
2. Teacher clicks "Edit" on booking
3. Modal opens showing Section 3: R/W & Exam Venues
4. Teacher selects R/W and venue for each learner
5. Teacher clicks "Save"

**Expected Result:**
- ✅ Section 3 visible (edit mode only)
- ✅ Per-learner dropdowns show all R/Ws and venues
- ✅ Can assign different R/W to each learner
- ✅ Can assign different venue to each learner
- ✅ Booking saves with assignments

---

## FUTURE ENHANCEMENTS

### 1. Conflict Warnings
Show yellow warning icon if:
- Learner has conflicting bookings in same session
- R/W has back-to-back sessions with no break
- Venue is at capacity

### 2. Bulk Assignment
Checkbox to "Apply same R/W and venue to all learners" for quick individual assignments.

### 3. R/W Availability Calendar
Visual calendar showing when each R/W is available/busy across all sessions.

### 4. Smart Suggestions
AI-powered suggestions based on:
- Learner's previous R/W assignments
- R/W's experience with learner's SAC needs
- Proximity of venue to learner's other classes

### 5. Email Notifications
Auto-email R/Ws when assigned to new bookings with:
- Date, time, period
- Learner names and SAC needs
- Venue location

### 6. Print Layout
Print-friendly view showing:
- Daily schedule for each R/W
- Venue schedule with all occupants
- Learner schedule with R/W and venue

### 7. Statistics Dashboard
Show metrics:
- R/W utilization rate
- Venue utilization rate
- Most common SAC accommodations
- Peak booking periods

### 8. Mobile Optimization
Responsive design for R/Ws to check schedules on mobile.

### 9. Integration with School Calendar
Sync with school event calendar to block out assemblies, sports days, etc.

### 10. Audit Trail
Complete history of all R/W and venue assignments with:
- Who made the assignment
- When it was made
- What changed
- Why (optional reason field)

---

## BACKEND CONSIDERATIONS

### Google Apps Script Structure

**Current Backend Approach:**
```javascript
// Backend returns JSON strings
{
  learners: "[\"id1\",\"id2\"]",  // String, not array
  readerWriters: "{\"id1\":\"John Smith\"}",  // String, not object
  smallGroups: "[{\"id\":1,\"learners\":[\"id1\"]}]"  // String, not array
}

// Frontend parses on receipt
const parsedBookings = bookings.map(booking => ({
  ...booking,
  learners: safeJSONParse(booking.learners, []),
  readerWriters: safeJSONParse(booking.readerWriters, {}),
  learnerVenues: safeJSONParse(booking.learnerVenues, {}),
  smallGroups: safeJSONParse(booking.smallGroups, [])
}));
```

**Why This Works:**
- Google Apps Script has JSON stringify/parse issues
- Simpler to send as strings, parse on frontend
- Frontend has full control over parsing errors

**Alternative (Future):**
Update backend to properly stringify:
```javascript
// Backend (Google Apps Script)
function doGet(e) {
  const bookings = getBookingsFromSheet();
  
  // Properly convert objects to JSON strings
  const formattedBookings = bookings.map(booking => ({
    ...booking,
    learners: JSON.stringify(booking.learners || []),
    readerWriters: JSON.stringify(booking.readerWriters || {}),
    learnerVenues: JSON.stringify(booking.learnerVenues || {}),
    smallGroups: JSON.stringify(booking.smallGroups || [])
  }));
  
  return ContentService.createTextOutput(
    JSON.stringify({ bookings: formattedBookings })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

### Google Sheets Schema

**BookingHistory Sheet:**
```
| id | date | day | period | subject | teacher | room | learners | readerWriters | learnerVenues | smallGroups | status | createdAt | updatedAt |
```

**Learners Sheet:**
```
| id | studentId | firstName | lastName | yearLevel | email | parentEmail | sacConditions | isDeclined |
```

**ReaderWriters Sheet:**
```
| id | firstName | lastName | email | daysAvailable |
```

**Venues Sheet:**
```
| id | name | capacity | type |
```

**Note:** `readerWriters`, `learnerVenues`, and `smallGroups` columns in BookingHistory sheet store JSON strings.

---

## DEPLOYMENT NOTES

### Build Process
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### GitHub Pages Configuration
```javascript
// vite.config.js
export default defineConfig({
  base: '/sac-booking-system/',  // Repository name
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
});
```

### Environment Variables
```
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### CORS Configuration
Backend (Google Apps Script) must return proper CORS headers:
```javascript
function doGet(e) {
  const output = ContentService.createTextOutput(
    JSON.stringify(data)
  ).setMimeType(ContentService.MimeType.JSON);
  
  // No manual CORS headers needed - GAS handles it
  return output;
}
```

**Deployment Settings:**
- Execute as: Me
- Who has access: Anyone

---

## SUMMARY

This documentation provides complete technical reference for the SAC Booking System's Reader/Writer & Venue Assignment feature. It includes:

1. ✅ Complete file structure with all modified components
2. ✅ Detailed data models and schemas
3. ✅ Step-by-step availability logic with code examples
4. ✅ Component-by-component breakdown with full code
5. ✅ Critical fixes applied with before/after comparisons
6. ✅ What worked and what to avoid
7. ✅ Comprehensive testing scenarios
8. ✅ Future enhancement ideas
9. ✅ Backend and deployment considerations

**Key Takeaways:**
- Always check availability per-entity (learner/group), not per-booking
- Trim strings consistently when building and checking Sets
- Separate concerns clearly (Teacher Room vs Exam Venue)
- Provide visual feedback (badges, current assignment indicators)
- Type-check before iterating over objects/arrays
- Load existing assignments when opening modals

**Repository:** `danielleonard-source/sac-booking-system`  
**Author:** Danie Leonard  
**Contact:** daniel.leonard@beth.school.nz

---

*End of Documentation*
