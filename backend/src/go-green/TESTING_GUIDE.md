# 🧪 Testing Go Green Credits - Step by Step

## Quick Test (5 minutes)

### Step 1: Restart Backend
```bash
cd backend
# Press Ctrl+C to stop current server
npm run start:dev
```

**Wait for**: `Nest application successfully started`

### Step 2: Check Backend Logs
You should see:
```
[EventEmitterModule] EventEmitterModule initialized
[GoGreenModule] GoGreenModule dependencies initialized
```

### Step 3: Mark Vaccine as Complete
1. Go to **Admin Panel** → **Vaccinations**
2. Find a child with vaccines
3. Click **"Mark as Done"** on any vaccine

### Step 4: Check Backend Logs Again
You should see:
```
[CreditAwardListener] Vaccination completed event received: BCG for CHD-XXX
[GoGreenService] Credits awarded: 50 to CHD-XXX. New balance: 50
```

**If you DON'T see this**: The event isn't being emitted. Check Step 1.

### Step 5: Check Credits in Database
```bash
cd backend
npx ts-node src/go-green/test-credits.ts
```

**Edit the registration ID** in the file first!

Expected output:
```
✅ CREDITS FOUND!

Found 1 transaction(s):

1. BCG Vaccine Completed
   Amount: +50
   Balance After: 50
   Type: VACCINATION
   Date: 3/18/2026, 1:30 PM
```

### Step 6: Check Frontend
1. Go to **User Dashboard** → **Go Green**
2. Click the **Refresh** button (circular arrow icon)
3. Check browser console (F12) for logs:
   ```
   Fetching credits for: CHD-XXX
   Credit API response status: 200
   Credit data: { credits: { total: 50, current: 50, ... } }
   ```

### Step 7: Verify Display
The Credit Widget should now show:
- **Total Earned**: 50 (or more)
- **Current Level**: SEEDLING → SAPLING (at 500 credits)
- **Available**: 50
- **Progress bar**: Should show progress

---

## Troubleshooting

### ❌ No credits in database
**Solution**: Backend event not emitting
1. Verify backend restarted
2. Check for TypeScript errors
3. Try manual award:
```bash
curl -X POST http://localhost:8000/go-green/credits/award ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d "{\"registrationId\":\"YOUR_ID\",\"amount\":250,\"type\":\"VACCINATION\",\"description\":\"Test\"}"
```

### ❌ Credits in DB but not showing in UI
**Solution**: Frontend not fetching
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click Refresh button
4. Look for: `GET /go-green/credits/CHD-XXX`
5. Check response - should have credits data
6. Check Console tab for errors

### ❌ API returns 401/403
**Solution**: Token issue
1. Check localStorage has `wt18_token`
2. Token might be expired - login again
3. Check Authorization header in request

### ❌ Widget shows "Loading..." forever
**Solution**: API endpoint issue
1. Check API_BASE env variable
2. Verify backend is running on port 8000
3. Check CORS settings in backend

---

## Manual Credit Award (For Testing)

If automatic credits aren't working, manually award for testing:

```bash
# Get your token from browser console:
# localStorage.getItem('wt18_token')

# Get your registration ID from profile

# Award 250 credits
curl -X POST http://localhost:8000/go-green/credits/award ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." ^
  -d "{\"registrationId\":\"CHD-KL-20260306-000001\",\"amount\":250,\"type\":\"VACCINATION\",\"description\":\"Test credits for BCG, OPV, HepB\",\"metadata\":{\"test\":true}}"
```

Then refresh Go Green page - should show 250 credits!

---

## Expected Credit Amounts

Mark these vaccines as done to test:

| Vaccine | Credits | Cumulative |
|---------|---------|------------|
| BCG | +50 | 50 |
| OPV-0 | +50 | 100 |
| HepB | +50 | 150 |
| OPV-1 | +100 | 250 |
| Pentavalent-1 | +100 | 350 |
| OPV-2 | +100 | 450 |
| OPV-3 | +100 | 550 ✅ (Can plant 1st tree!) |
| Measles-1 | +150 | 700 |
| MMR | +150 + 200 bonus | 1050 ✅ (Can plant 2nd tree!) |

---

## Success Checklist

- [ ] Backend restarted successfully
- [ ] Event logs appear when marking vaccine as done
- [ ] Credits appear in database (test script)
- [ ] Credits show in Go Green UI
- [ ] Refresh button works
- [ ] Credit history shows transactions
- [ ] Progress bar updates
- [ ] Can click "Plant Tree" when credits >= 500

---

**Last Updated**: March 18, 2026  
**Status**: Ready for Testing
