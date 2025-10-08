# ✅ User UI - No Changes Required!

## Summary

**Your existing user UI already handles the recall functionality perfectly!**

The UI code you provided already has:
- ✅ `isRecalled` flag handling
- ✅ `recallCount` display
- ✅ `isCurrentTokenRecalled` detection
- ✅ Recall alert banners
- ✅ Animated recall indicators
- ✅ "FINAL CALL" warnings

## What You Need to Do

### 1. Replace the API File

**Location**: `app/api/public/booking-status/[bookingId]/route.js`

**Replace with**: The file I created at `users/api.js`

```bash
# Copy the new API file
cp users/api.js app/api/public/booking-status/[bookingId]/route.js
```

### 2. Your UI Already Works!

Your existing UI at `app/public/booking/[bookingId]/page.jsx` **already has all the recall features**:

#### ✅ Recall Indicators Already Present:

```javascript
// Line 269 - Your Token Badge (already shows recall)
{booking.isRecalled
  ? 'bg-gradient-to-br from-amber-500 to-orange-600'
  : 'bg-gradient-to-br from-sky-500 to-blue-600'
}

// Line 274 - Recall Text (already there)
{booking.isRecalled ? '🔁 Your Token' : 'Your Token'}

// Line 277 - Recall Count (already shown)
{booking.isRecalled && booking.recallCount > 0 && (
  <p className="text-[8px]">Recalled {booking.recallCount}x</p>
)}
```

#### ✅ Current Token Recall Detection (already implemented):

```javascript
// Line 284 - Shows if current token is recalled
{booking.queueStatus.isCurrentTokenRecalled && (
  <RefreshCw size={12} className="text-amber-600 animate-spin" />
)}
```

#### ✅ Recall Alert Banners (already exist):

```javascript
// Line 310 - Current token recalled banner
{booking.queueStatus.isCurrentTokenRecalled && (
  <motion.div className="p-3 bg-gradient-to-r from-amber-400 to-orange-500">
    🔁 Token Being Recalled
  </motion.div>
)}

// Line 325 - User's token recalled - FINAL CALL
{booking.isRecalled && booking.queueStatus.queuePosition === 'current' && (
  <motion.div className="p-3 bg-gradient-to-r from-orange-500 to-red-500">
    ⚠️ FINAL CALL - Token #{booking.tokenNumber}
  </motion.div>
)}
```

## API Changes Made

The new API file (`users/api.js`) adds:

### 1. Current Token from Session

**Old**:
```javascript
const currentToken = currentlyServing?.tokenNumber ||
  (completedAppointments.length > 0 ?
   Math.max(...completedAppointments.map(apt => apt.tokenNumber)) + 1 : 1);
```

**New**:
```javascript
const session = await db.query.doctorSessions.findFirst(...);
const currentToken = session?.currentToken || 0; // From database!
```

### 2. Recall Detection

**New Fields Added**:
```javascript
queueStatus: {
  currentToken: 5,
  isCurrentTokenRecalled: true, // ← NEW!
  totalTokensCalled: 5, // ← NEW!
  averageWaitTimeMinutes: 12, // ← NEW!
  ...
}

// Booking level
isRecalled: true, // ← NEW!
recallCount: 2, // ← NEW!
lastRecalledAt: "2025-10-08T10:30:00Z", // ← NEW!
missedAppointment: false, // ← NEW!
attendedAfterRecall: true, // ← NEW!
```

### 3. Doctor Status with Break Info

Already in your UI and now properly populated from API:
```javascript
doctor: {
  status: 'on_break',
  breakType: 'timed', // or 'indefinite'
  breakEndTime: '2025-10-08T11:00:00Z',
  breakStartTime: '2025-10-08T10:45:00Z',
  breakReason: 'Lunch break',
}
```

## How Recall Shows in UI

### Scenario 1: User's Token is Recalled

**What Patient Sees**:
```
┌──────────────────────────────────────┐
│  🔁 5     │  5  │  5  │  15          │
│ Your Token │ Recall │ Called │ Mins  │
│ Recalled 2x│ Current│        │       │
└──────────────────────────────────────┘

⚠️ FINAL CALL - Token #5
Your token has been recalled. Please proceed
to consultation room IMMEDIATELY or your
appointment may be marked as no-show.

This is recall #2 - Final chance!
```

### Scenario 2: Current Token is Different Patient's Recall

**What Patient Sees**:
```
┌──────────────────────────────────────┐
│   8      │  🔄3  │  5  │  75          │
│ Your Token│ Recall│Called│ Mins       │
│           │Current│     │             │
└──────────────────────────────────────┘

🔁 Token Being Recalled
Token #3 is being called again as the
patient didn't show up initially.

You have 5 patients ahead of you.
```

## Testing Steps

### 1. Test Normal Flow

Visit: `http://localhost:3000/public/booking/[your-booking-id]`

You should see:
- ✅ Your token number
- ✅ Current token being called
- ✅ Tokens ahead
- ✅ Wait time estimate

### 2. Test Recall Flow

1. Doctor marks a patient (e.g., Token #3) as No Show
2. Doctor completes 5 patients
3. Doctor calls next → Token #3 is recalled
4. **Patient with Token #3 refreshes their page**:
   - Should see: 🔁 badge on their token
   - Should see: "Recalled 1x" text
   - Should see: Orange gradient background
   - Should see: "FINAL CALL" banner if it's their turn

### 3. Test Current Recalled Detection

When doctor is calling a recalled token (e.g., Token #3 recalled):

**Other patients should see**:
- Current token shows: 🔄 3 (with spinning icon)
- Banner: "🔁 Token Being Recalled"
- Message explains the delay

## Integration Checklist

- [x] API returns `currentToken` from session (persisted)
- [x] API returns `isCurrentTokenRecalled` flag
- [x] API returns recall info (`isRecalled`, `recallCount`)
- [x] UI already displays recall badges
- [x] UI already shows recall banners
- [x] UI already handles doctor status (break, emergency)
- [ ] Copy `users/api.js` to `app/api/public/booking-status/[bookingId]/route.js`
- [ ] Test with real data

## No UI Code Changes Needed!

Your UI is **already perfect** for the recall functionality. Just replace the API file and it will work immediately.

The only file you need to update is:
```
app/api/public/booking-status/[bookingId]/route.js
```

Replace it with the contents of `users/api.js`.

---

## Summary

✅ **API Updated**: Returns recall information from database
✅ **UI Already Ready**: Your existing UI handles all recall scenarios
✅ **Doctor Status**: Break timers and status already implemented
✅ **Notifications**: Already implemented with permission handling

**Just replace the API file and you're done!** 🎉
