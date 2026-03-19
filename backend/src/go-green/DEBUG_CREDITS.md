# 🐛 Credits Not Increasing - Debugging Steps

## Quick Checklist

### 1. Did You Restart the Backend? ⚠️
The event emission code was JUST added. You MUST restart:

```bash
cd backend
# Press Ctrl+C to stop
npm run start:dev
# Wait for: "Nest application successfully started"
```

**Check logs for**:
```
[EventEmitterModule] EventEmitterModule initialized
[GoGreenModule] GoGreenModule dependencies initialized
[CreditAwardListener] CreditAwardListener initialized
```

### 2. Are Tier Configs Seeded?
Run this to check:

```bash
cd backend
npx ts-node src/go-green/test-credits.ts
```

If it says "NO CREDITS FOUND", the events aren't being emitted.

### 3. Test Manual Credit Award
Try awarding credits manually to verify the API works:

```bash
# Get your token from browser console:
# localStorage.getItem('wt18_token')

# Get your registration ID from profile

# Then run:
curl -X POST http://localhost:8000/go-green/credits/award ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"registrationId\":\"YOUR_REGISTRATION_ID\",\"amount\":250,\"type\":\"VACCINATION\",\"description\":\"Test credits\"}"
```

Then refresh Go Green page - do you see 250 credits?

### 4. Check Backend Logs When Marking Vaccine as Done

**What you SHOULD see**:
```
[Nest] XXXX  - [DashboardService] Updating milestone status
[Nest] XXXX  - [EventEmitter] Emitting "vaccination.completed"
[Nest] XXXX  - [CreditAwardListener] Vaccination completed event received: BCG for CHD-XXX
[Nest] XXXX  - [GoGreenService] Credits awarded: 50 to CHD-XXX
```

**If you DON'T see the event emission**, check:
- Is `EventEmitterModule.forRoot()` in `app.module.ts`?
- Is `private eventEmitter: EventEmitter2` in dashboard service constructor?
- Did you restart the backend?

### 5. Check Database Directly

Open MongoDB Compass or shell:

```javascript
// Check if credits exist
db.credit_transactions.find({ registrationId: "YOUR_REG_ID" }).sort({ createdAt: -1 })

// Check tier configs exist
db.tier_configs.find()
```

If `credit_transactions` is empty but `tier_configs` has data → Events not firing
If `tier_configs` is empty → Run: `npm run seed:tiers`

## Common Issues & Solutions

### Issue: "EventEmitter2 is not defined"
**Solution**: Install the package
```bash
npm install @nestjs/event-emitter
npm run start:dev
```

### Issue: "Cannot find module '@nestjs/passport'"
**Solution**: This was removed, but if you see it:
```bash
npm uninstall @nestjs/passport
npm run start:dev
```

### Issue: Backend compiles but no event logs
**Solution**: Check if milestone category is correct
```javascript
// In MongoDB, check your milestone:
db.milestones.findOne({ _id: "MILESTONE_ID" })
// category should be "VACCINATION" (case-sensitive!)
```

### Issue: Credits awarded but UI shows 0
**Solution**: Frontend caching issue
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Check browser console for API errors
4. Click the refresh button in Credit Widget

## Step-by-Step Test

1. **Restart backend**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Open two terminal windows**:
   - Window 1: Backend logs
   - Window 2: Run test script

3. **In Window 2, run**:
   ```bash
   npx ts-node src/go-green/test-credits.ts
   ```
   Note the current credit count.

4. **Go to Admin → Vaccinations**

5. **Mark a vaccine as "Done"**

6. **Watch Window 1 (backend logs)** - you should see:
   ```
   [CreditAwardListener] Vaccination completed event received
   [GoGreenService] Credits awarded: XX
   ```

7. **Run test script again**:
   ```bash
   npx ts-node src/go-green/test-credits.ts
   ```
   Credits should have increased!

8. **Go to Go Green page** and click refresh button

9. **Credits should show!**

## Still Not Working?

### Enable Debug Logging

Add this to `dashboard.service.ts` temporarily:

```typescript
async updateMilestoneStatus(...) {
  this.logger.warn('=== UPDATE CALLED ===');
  this.logger.warn('Category:', milestone.category);
  this.logger.warn('Previous:', previousStatus);
  this.logger.warn('New:', dto.status);
  // ... rest of code
}
```

Then check logs when marking as done.

### Check Event Listener Registration

In `go-green.module.ts`, verify:
```typescript
providers: [GoGreenService, CreditAwardListener],
```

If `CreditAwardListener` is missing, add it!

### Force Event Emission Test

Add this endpoint temporarily to test:

```typescript
// In go-green.controller.ts
@Post('test-event')
async testEvent(@Query('regId') regId: string) {
  this.eventEmitter.emit('vaccination.completed', {
    registrationId: regId,
    milestoneId: 'test',
    vaccineName: 'TEST',
    sequenceNumber: 1,
    completedDate: new Date(),
  });
  return { success: true, message: 'Event emitted' };
}
```

Then call: `POST http://localhost:8000/go-green/test-event?regId=YOUR_ID`

Check if credits increase!

---

**Last Resort**: Manually award credits for all completed vaccines using the test script or curl command above, then continue development. The automatic system can be debugged later.
