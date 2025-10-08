# Consultation Flow - Updated Design

## Overview
The consultation system now allows flexible token calling with automatic no-show handling and recalls.

## Key Changes

### 1. **Call Next Token - Always Available**
- ✅ Can be called anytime (no need to complete previous consultation)
- ✅ Just announces the token number
- ✅ Doesn't block other actions

### 2. **Each Token Has Two Actions**
- ✅ **Start** - Begin consultation with patient
- ✅ **No Show** - Mark as missed, auto-calls next token

### 3. **Flexible Flow**
- ✅ Multiple consultations can be in progress
- ✅ Doctor controls the flow completely
- ✅ Recalls happen at configured intervals

## Detailed Flow

### Scenario 1: Normal Patient Flow

```
1. Doctor clicks "Call Next Token"
   → System calls Token #1
   → Toast: "📢 Calling Token #1"

2. Patient arrives
   → Doctor clicks "Start" on Token #1
   → Consultation begins
   → Status: "In Progress"

3. Doctor can now:
   a) Complete consultation (fills notes, prescription)
   b) Call next token while consulting #1
   c) Start another patient

4. Doctor clicks "Complete Consultation"
   → Fills diagnosis, prescription, notes
   → Token #1 marked as completed ✅
```

### Scenario 2: Patient No-Show

```
1. Doctor clicks "Call Next Token"
   → System calls Token #2
   → Toast: "📢 Calling Token #2"

2. Patient doesn't arrive
   → Doctor clicks "No Show" on Token #2
   → Toast: "Token #2 marked as no-show - Moving to next"
   → System automatically calls Token #3

3. Token #2 added to "Missed Tokens" list
   → Shows orange badge: #2
   → Will be recalled after interval
```

### Scenario 3: Multiple Patients Queue

```
Doctor can manage multiple patients:

1. Call Token #1 → Patient arrives → Start consultation
2. Call Token #2 → Patient arrives → Start consultation
3. Call Token #3 → No show → Auto-calls Token #4
4. Call Token #4 → Patient arrives → Start consultation

Now 3 patients (#1, #2, #4) are being consulted
Doctor completes them one by one
```

### Scenario 4: Recall After Interval

```
Interval = 5 patients

Tokens processed:
#1 ✅ Completed
#2 ⚠️ No Show
#3 ✅ Completed
#4 ⚠️ No Show
#5 ✅ Completed

[5 patients processed = Recall time!]

Doctor clicks "Call Next Token"
→ Instead of Token #6, system recalls Token #2
→ Toast: "🔁 Recalling Token #2 (2 missed tokens)"

If patient shows up:
→ Doctor clicks "Start" on Token #2
→ Consultation begins normally
→ System marks: attendedAfterRecall = true ✅

If patient still doesn't show:
→ Doctor clicks "No Show" on Token #2
→ Token #2 permanently marked as no-show
→ System calls Token #6 (next in sequence)
```

### Scenario 5: Continuous Recalls

```
Interval = 5, Missed: #2, #4, #7

After Token #10 (5th completed):
→ Recalls Token #2

After Token #15 (10th completed):
→ If #2 still missed: Recalls Token #2 again
→ If #2 completed: Recalls Token #4

After Token #20 (15th completed):
→ Recalls remaining missed tokens in order
```

## UI Elements

### Quick Actions Panel
```
┌─────────────────────────┐
│ Call Next Token         │ ← Always available
├─────────────────────────┤
│ Complete Consultation   │ ← Only when active
├─────────────────────────┤
│ Refresh List            │
└─────────────────────────┘
```

### Appointment Card (Confirmed)
```
┌─────────────────────────────────────┐
│ #3  Amit Kumar                      │
│     Email: patient003@test.com      │
│     Complaints: Blood sugar check   │
│                                     │
│  [Start]  [No Show]                 │
└─────────────────────────────────────┘
```

### Appointment Card (In Progress)
```
┌─────────────────────────────────────┐
│ #1  Rahul Sharma                    │
│     Email: patient001@test.com      │
│     Complaints: Headache and fever  │
│                                     │
│  [Start (disabled)]  [No Show]      │
│  [In Progress] 🔵                   │
└─────────────────────────────────────┘
```

### Appointment Card (Recalled)
```
┌─────────────────────────────────────┐
│ 🔁 #2  Priya Nair  (RECALLED)       │
│     Email: patient002@test.com      │
│     Complaints: Breathing difficulty│
│     Recalled: 2 times               │
│                                     │
│  [Start]  [No Show]                 │
└─────────────────────────────────────┘
```

### Missed Tokens Panel
```
┌─────────────────────────────────────┐
│ Missed Tokens                       │
│                                     │
│ [#2] [#4] [#7]                      │
│                                     │
│ 3 patients will be recalled         │
│ at token #10                        │
└─────────────────────────────────────┘
```

### Recall Settings Panel
```
┌─────────────────────────────────────┐
│ Recall Settings              [⚙️]  │
│                                     │
│ Recall Interval: Every 5 patients   │
│ Status: [Enabled]                   │
└─────────────────────────────────────┘
```

## API Behavior

### POST /api/doctor/consultation/next
```javascript
// Normal flow
{
  success: true,
  tokenNumber: 3,
  appointment: {...},
  isRecall: false
}

// Recall flow (at interval)
{
  success: true,
  tokenNumber: 2,
  appointment: {...},
  isRecall: true,
  missedTokensCount: 2
}
```

### POST /api/doctor/consultation/start
```javascript
// Request
{
  appointmentId: "appt-test-002"
}

// Response
{
  success: true,
  message: "Consultation started",
  appointment: {
    ...
    attendedAfterRecall: true  // If was recalled
  }
}
```

### POST /api/doctor/consultation/no-show
```javascript
// Request
{
  appointmentId: "appt-test-002"
}

// Response
{
  success: true,
  message: "Marked as no-show"
}

// Frontend automatically calls next token after 500ms
```

## Database Updates

### When Token Called
```sql
-- Tracked in token_call_history (if table exists)
INSERT INTO token_call_history (
  session_id,
  token_number,
  call_type,
  is_recall
) VALUES (
  'sess-xxx',
  2,
  'recall',
  true
);
```

### When Patient Shows Up After Recall
```sql
UPDATE appointments
SET
  actualStartTime = '10:30',
  attendedAfterRecall = true
WHERE id = 'appt-xxx';
```

### When Marked No-Show
```sql
UPDATE appointments
SET
  status = 'no_show',
  missedAppointment = true,
  tokenStatus = 'missed'
WHERE id = 'appt-xxx';
```

## Benefits

1. **Flexibility**: Doctor can manage multiple patients simultaneously
2. **Efficiency**: No need to wait for consultations to complete
3. **Automatic**: No-show auto-advances to next patient
4. **Fair**: Missed patients get multiple recall chances
5. **Configurable**: Doctors control recall frequency
6. **Traceable**: Complete audit trail (optional)

## Edge Cases Handled

1. **Multiple No-Shows**: Each gets recalled at intervals
2. **Patient Late Arrival**: Can still start consultation even after recall
3. **Concurrent Consultations**: Multiple patients can be "in progress"
4. **Recall Priority**: Always FIFO (first missed gets recalled first)
5. **Database Errors**: Gracefully continues without history/callback
6. **No More Patients**: Clear message "No more appointments for today"

## Testing Checklist

- [ ] Call next token works without completing previous
- [ ] No-show automatically calls next token
- [ ] Recalled tokens show orange badge
- [ ] Can start consultation on recalled patient
- [ ] Multiple consultations can be in progress
- [ ] Recall interval is configurable
- [ ] Missed tokens panel updates in real-time
- [ ] Toast messages are clear and informative
