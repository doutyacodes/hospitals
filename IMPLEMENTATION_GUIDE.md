# 🎯 Implementation Guide - Simplified Consultation Flow

## Overview

The consultation system has been redesigned for simplicity and efficiency. The doctor can now manage consultations without popups, with automatic progression and smart recall handling.

## Key Changes from Previous Version

### ✅ What Changed

1. **Removed Popup on Complete**: No more diagnosis/prescription popup - just click "Complete & Next"
2. **API-Driven Recall Logic**: Recall decisions moved from frontend to backend for consistency
3. **Completed Count Based**: Recalls trigger based on completed patient count, not token numbers
4. **Auto-Progression**: Both "Complete" and "No Show" automatically call next token
5. **Simplified UI**: Cleaner interface with focus on quick actions

### 📁 Files Modified

- `app/doctor/consultation/page.jsx` - Complete redesign (old backed up to `page-old.jsx`)
- `app/api/doctor/consultation/complete/route.js` - Made diagnosis optional
- `app/api/doctor/consultation/next/route.js` - Fixed recall logic to use completed count

## How It Works

### 1. Start Session

**User Action**: Click "Start Session" button

**What Happens**:
- Calls `/api/doctor/consultation/next` to get first token
- Sets `sessionStarted = true`
- Displays first token as "current"
- Shows "Complete & Next" and "No Show & Next" buttons

**Code**:
```javascript
const startSession = async () => {
  await callNextToken(true);
  setSessionStarted(true);
  setDoctorStatus('consulting');
  success('Session started! Calling first token...');
};
```

### 2. Complete Consultation

**User Action**: Click "Complete & Next" button

**What Happens**:
1. Calls `/api/doctor/consultation/complete` with minimal data
2. Marks appointment as completed
3. Increments completed count
4. After 500ms delay, automatically calls next token
5. If at recall interval, recalls missed token

**Code**:
```javascript
const completeConsultation = async () => {
  await fetch('/api/doctor/consultation/complete', {
    method: 'POST',
    body: JSON.stringify({
      appointmentId: appointment.id,
      diagnosis: 'Consultation completed', // Auto-filled
    }),
  });

  setCompletedCount(prev => prev + 1);

  // Auto-call next
  setTimeout(() => {
    callNextToken();
  }, 500);
};
```

### 3. Mark No Show

**User Action**: Click "No Show & Next" button

**What Happens**:
1. Calls `/api/doctor/consultation/no-show`
2. Marks appointment as `missedAppointment = true`
3. Adds to `missedTokens` list
4. After 500ms delay, automatically calls next token

**Code**:
```javascript
const markNoShow = async (tokenNumber) => {
  await fetch('/api/doctor/consultation/no-show', {
    method: 'POST',
    body: JSON.stringify({ appointmentId: appointment.id }),
  });

  setMissedTokens(prev => [...prev, tokenNumber]);

  // Auto-call next
  setTimeout(() => {
    callNextToken();
  }, 500);
};
```

### 4. Call Next Token (with Recall)

**User Action**: Automatically triggered after Complete/No Show

**What Happens** (Backend Logic):

```javascript
// 1. Count total completed appointments
const totalCompleted = await db
  .select({ count: sql`COUNT(*)` })
  .from(appointments)
  .where(eq(appointments.status, 'completed'));

// 2. Check if we should recall
if (totalCompleted % recallInterval === 0) {
  // Get missed tokens (confirmed, not started, token < currentToken)
  const missedTokens = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.status, 'confirmed'),
        lt(appointments.tokenNumber, currentToken),
        sql`${appointments.actualStartTime} IS NULL`
      )
    )
    .orderBy(appointments.tokenNumber);

  if (missedTokens.length > 0) {
    // Return first missed token
    return {
      tokenNumber: missedTokens[0].tokenNumber,
      isRecall: true,
      missedTokensCount: missedTokens.length
    };
  }
}

// 3. Otherwise, return next confirmed appointment
const nextAppointment = await db
  .select()
  .from(appointments)
  .where(
    and(
      eq(appointments.status, 'confirmed'),
      gt(appointments.tokenNumber, currentToken)
    )
  )
  .orderBy(appointments.tokenNumber)
  .limit(1);

return {
  tokenNumber: nextAppointment.tokenNumber,
  isRecall: false
};
```

## Example Scenarios

### Scenario 1: Normal Flow (All Patients Present)

```
Start Session
→ Token #1 called
→ Complete & Next
→ Token #2 called
→ Complete & Next
→ Token #3 called
→ Complete & Next
→ Token #4 called
...
```

### Scenario 2: No Shows with Recall (Interval = 5)

```
Token #1 → Complete (count: 1)
Token #2 → No Show (missed: [2])
Token #3 → Complete (count: 2)
Token #4 → No Show (missed: [2, 4])
Token #5 → Complete (count: 3)
Token #6 → Complete (count: 4)
Token #7 → Complete (count: 5) ← 5 completed!

[Next call triggers recall]
Token #2 → Recall (isRecall: true)
  → If shows up: Start → Complete (count: 6)
  → If still no-show: No Show

Token #4 → Recall (next missed)
  → If shows up: Start → Complete (count: 7)
  → If still no-show: No Show

Token #8 → Continue normal sequence
Token #9 → Complete (count: 8)
Token #10 → Complete (count: 9)
Token #11 → Complete (count: 10) ← 10 completed!

[Recall again if any missed]
```

### Scenario 3: Missing Token Numbers

```
Booked tokens: #1, #3, #5, #7, #9
(Tokens #2, #4, #6, #8 not booked)

Token #1 → Complete
Token #3 → Complete (auto-skips #2)
Token #5 → No Show (missed: [5])
Token #7 → Complete
Token #9 → Complete (count: 4)

After interval:
Token #5 → Recall
```

## API Endpoints

### POST /api/doctor/consultation/next

**Purpose**: Get next token to call (handles recall logic)

**Request**: No body needed

**Response**:
```json
{
  "success": true,
  "tokenNumber": 2,
  "appointment": {...},
  "isRecall": true,
  "missedTokensCount": 3
}
```

**Logic**:
1. Count completed appointments
2. If `completedCount % interval === 0`, check for missed tokens
3. Return first missed token OR next confirmed appointment

### POST /api/doctor/consultation/complete

**Purpose**: Mark consultation as completed

**Request**:
```json
{
  "appointmentId": "appt-xxx",
  "diagnosis": "Consultation completed", // Optional
  "doctorNotes": "",  // Optional
  "prescription": ""  // Optional
}
```

**Response**:
```json
{
  "success": true,
  "message": "Consultation completed successfully"
}
```

**Changes**: Diagnosis is now optional (was required before)

### POST /api/doctor/consultation/no-show

**Purpose**: Mark patient as no-show

**Request**:
```json
{
  "appointmentId": "appt-xxx"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Marked as no-show"
}
```

## Configuration

### Recall Interval

Default: 5 patients

**How to Change**:
1. Click ⚙️ icon in "Recall Settings" panel
2. Adjust slider (1-20)
3. Click "Save Settings"

**API**: `PUT /api/doctor/session/recall-settings`

### Enable/Disable Recall

**How to Toggle**:
1. Click ⚙️ icon in "Recall Settings" panel
2. Uncheck "Enable auto-recall"
3. Click "Save Settings"

When disabled, missed patients are NOT recalled automatically.

## Testing Steps

### 1. Import Test Data

```bash
# Ensure base data exists
mysql -u root -p devuser_hospitals < ensure_base_data.sql

# Import 20 test appointments
mysql -u root -p devuser_hospitals < dummy_data.sql
```

### 2. Login

- URL: `http://localhost:3000/doctor/login`
- Email: `dr.spdhanya@gmail.com`
- Password: (your doctor password)

### 3. Test Normal Flow

1. Click "Start Session"
2. Verify Token #1 is called
3. Click "Complete & Next"
4. Verify Token #2 is automatically called
5. Repeat for tokens #3, #4, #5

### 4. Test No Show

1. On Token #6, click "No Show & Next"
2. Verify Token #7 is automatically called
3. Verify Token #6 appears in "Missed Tokens" panel

### 5. Test Recall (after 5 completed)

1. Complete Tokens #7, #8, #9, #10
2. After completing Token #10 (5th completed), click next
3. **Expected**: Token #6 is recalled
4. Toast should show: "🔁 Recalling Token #6 (1 missed)"

### 6. Test Recall Again

1. Mark Token #6 as No Show again
2. Complete 5 more tokens
3. **Expected**: Token #6 is recalled again at next interval

## Troubleshooting

### Issue: Recall not triggering after 5 patients

**Check**:
- Is recall enabled? (Settings panel)
- Are there missed tokens? (Missed Tokens panel)
- Count completed appointments: `SELECT COUNT(*) FROM appointments WHERE status = 'completed'`

**Fix**: The logic now counts completed appointments, not token numbers

### Issue: Skipping token numbers

**This is normal** if those token numbers weren't booked. The system only calls confirmed appointments.

### Issue: "No more appointments for today"

**Check**:
- Are there confirmed appointments? `SELECT * FROM appointments WHERE status = 'confirmed'`
- Is the date correct? System uses today's date

## Code Structure

### Frontend (page.jsx)

```
DoctorConsultationPage
├── State Management
│   ├── currentToken (number being called)
│   ├── sessionStarted (boolean)
│   ├── completedCount (total completed)
│   ├── missedTokens (array of token numbers)
│   └── recallInterval & recallEnabled
│
├── Functions
│   ├── startSession() - Begin calling tokens
│   ├── callNextToken() - API call for next token
│   ├── completeConsultation() - Mark done & auto-next
│   ├── markNoShow() - Mark missed & auto-next
│   └── updateRecallSettings() - Configure recall
│
└── UI Components
    ├── Quick Actions Panel
    ├── Current Token Display
    ├── Appointment List
    ├── Missed Tokens Panel
    └── Recall Settings Modal
```

### Backend (next/route.js)

```
POST /api/doctor/consultation/next
├── 1. Get current session
├── 2. Count completed appointments
├── 3. Check recall condition
│   └── If completedCount % interval === 0
│       ├── Find missed tokens
│       └── Return first missed
├── 4. Otherwise, find next confirmed
└── 5. Return appointment data
```

## Performance Considerations

- **Auto-refresh**: Page refreshes every 30 seconds
- **500ms delay**: Between complete and next call (prevents UI flicker)
- **Database queries**: Optimized with indexes on `status`, `tokenNumber`, `appointmentDate`

## Security

- All endpoints require doctor authentication
- Session verification on every API call
- JWT token in httpOnly cookie
- CSRF protection via Next.js

## Future Enhancements

1. **Detailed Medical Records**: Add ability to fill diagnosis after consultation
2. **Patient History**: Show previous appointments inline
3. **Voice Calling**: Announce tokens via speaker
4. **SMS Notifications**: Alert patients when recalled
5. **Analytics Dashboard**: Track no-show patterns

---

✅ **Implementation Complete**

The system is now live with the simplified consultation flow. Test thoroughly before deploying to production.
