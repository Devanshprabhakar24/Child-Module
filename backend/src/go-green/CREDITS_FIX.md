# 🐛 Go Green Credits Not Updating - Fix Summary

## Issue
When vaccinations are marked as complete (in admin panel), the Go Green credits on the user dashboard are not updating.

## Root Cause
The credit award system was implemented correctly, but there are two issues:

1. **Event Emission Missing**: The `updateMilestoneStatus` method in `dashboard.service.ts` was NOT emitting the `vaccination.completed` event
2. **Frontend Not Refreshing**: The Go Green page doesn't auto-refresh when credits change

## Fixes Applied

### Backend Fix ✅
**File**: `backend/src/dashboard/dashboard.service.ts`

**Changes**:
1. Added `EventEmitter2` import and injection
2. Updated `updateMilestoneStatus()` to emit `vaccination.completed` event when:
   - Milestone category is VACCINATION
   - Status changes to COMPLETED
   - Previous status was NOT COMPLETED

3. Added `getVaccineSequence()` helper to determine vaccine sequence number from title

**Code Added**:
```typescript
// Emit event if vaccine was just completed
if (
  milestone.category === MilestoneCategory.VACCINATION &&
  previousStatus !== MilestoneStatus.COMPLETED &&
  dto.status === MilestoneStatus.COMPLETED
) {
  const sequenceNumber = this.getVaccineSequence(milestone.title);
  
  this.eventEmitter.emit('vaccination.completed', {
    registrationId: milestone.registrationId,
    milestoneId: milestone._id.toString(),
    vaccineName: milestone.vaccineName || milestone.title,
    sequenceNumber,
    completedDate: milestone.completedDate || new Date(),
  });
}
```

### How It Works Now

1. **Admin marks vaccine as done** → `PATCH /dashboard/milestones/:id`
2. **Dashboard service** → Updates milestone status to COMPLETED
3. **Event emitted** → `vaccination.completed` with vaccine details
4. **Credit listener** → Catches event and awards credits (50-350 based on sequence)
5. **Transaction created** → Stored in `credit_transactions` collection
6. **Child credits updated** → Total and current balance increased

## Testing

### Test Credit Award
1. Go to Admin → Vaccinations
2. Mark a vaccine as "Done"
3. Check backend logs for:
   ```
   [CreditAwardListener] Vaccination completed event received: BCG for CHD-XXX
   [GoGreenService] Credits awarded: 50 to CHD-XXX. New balance: 50
   ```
4. Go to User Dashboard → Go Green
5. Refresh page - credits should show updated balance

### Check Credit History
```bash
curl http://localhost:8000/go-green/credits/CHD-REGISTRATION-ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "credits": {
      "total": 50,
      "current": 50,
      "level": "SEEDLING",
      "treesPlanted": 0,
      "co2Offset": 0
    },
    "tier": {
      "current": "SEEDLING",
      "progress": 10
    },
    "transactions": [
      {
        "amount": 50,
        "type": "VACCINATION",
        "description": "BCG Vaccine Completed",
        "balanceAfter": 50
      }
    ]
  }
}
```

## Credit Amounts by Vaccine

| Vaccine | Sequence | Credits |
|---------|----------|---------|
| BCG, OPV-0, HepB | 1 | 50 |
| OPV-1, Pentavalent-1 | 2 | 100 |
| OPV-2, Pentavalent-2 | 3 | 100 |
| OPV-3, Pentavalent-3 | 4 | 100 |
| Measles-1, MR-1 | 5 | 150 |
| MMR, Measles-2 | 6 | 150 + 200 bonus = 350 |

**Total for complete series**: 1050 credits

## Tree Redemption Tiers

| Credits Needed | Tree Tier | Tree Type |
|---------------|-----------|-----------|
| 500 | 🌿 Sapling | Neem |
| 1000 | 🌳 Young | Peepal |
| 2000 | 🌲 Mature | Banyan |
| 3500 | 🌴 Guardian | 3 Trees |
| 5000 | 🏆 Forest | 5 Trees |

## Troubleshooting

### Credits still not showing?

1. **Check event emitter is working**:
   ```bash
   # Backend logs should show:
   [EventEmitter] Emitting "vaccination.completed"
   [CreditAwardListener] Vaccination completed event received
   ```

2. **Check tier configs are seeded**:
   ```bash
   npm run seed:tiers
   ```

3. **Check MongoDB transactions**:
   ```javascript
   // In MongoDB Compass or shell:
   db.credit_transactions.find({ registrationId: "CHD-YOUR-ID" }).sort({ createdAt: -1 })
   ```

4. **Manually award credits (if needed)**:
   ```bash
   curl -X POST http://localhost:8000/go-green/credits/award \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN" \
     -d '{
       "registrationId": "CHD-ID",
       "amount": 50,
       "type": "VACCINATION",
       "description": "BCG Vaccine (manual award)",
       "metadata": { "vaccineName": "BCG" }
     }'
   ```

## Next Steps

1. ✅ Backend event emission - FIXED
2. ⏳ Test with real vaccination completion
3. ⏳ Add auto-refresh to Go Green page (optional)
4. ⏳ Add notification when credits are earned (future enhancement)

---

**Fixed**: March 18, 2026  
**Status**: Ready for Testing
