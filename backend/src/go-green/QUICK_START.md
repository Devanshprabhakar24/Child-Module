# 🚀 Go Green Credit System - Quick Start Guide

## ✅ What's Been Implemented

### Backend Components Created:

1. **Schemas** (3 files)
   - `credit-transaction.schema.ts` - Stores all credit transactions
   - `tier-config.schema.ts` - Tier configuration reference
   - `go-green-tree.schema.ts` - Updated with credit fields

2. **Service** 
   - `go-green.service.ts` - Complete credit management logic

3. **Controller**
   - `go-green.controller.ts` - REST API endpoints

4. **Event Listener**
   - `credit-award.listener.ts` - Auto-awards credits on events

5. **Database Seeder**
   - `seed-tiers.ts` - Populates tier configurations

---

## 🎯 Quick Setup (5 Minutes)

### Step 1: Seed Tier Configurations

```bash
cd backend
npm run seed:tiers
```

Expected output:
```
✅ Connected to MongoDB
✅ Created tier: SEEDLING (🌱) - 0-499 credits
✅ Created tier: SAPLING (🌿) - 500-999 credits
✅ Created tier: YOUNG (🌳) - 1000-1999 credits
✅ Created tier: MATURE (🌲) - 2000-3499 credits
✅ Created tier: GUARDIAN (🌴) - 3500-4999 credits
✅ Created tier: FOREST (🏆) - 5000+ credits
```

### Step 2: Restart Backend

```bash
npm run start:dev
```

Look for these logs:
```
[Nest] XXXX  - [InstanceWrapper] GoGreenModule dependencies initialized
[Nest] XXXX  - [EventEmitterModule] EventEmitterModule initialized
```

---

## 🧪 Test the System

### Test 1: Get Credit Balance

```bash
curl http://localhost:3000/go-green/credits/CHD-KL-20260306-000001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test 2: Award Credits Manually

```bash
curl -X POST http://localhost:3000/go-green/credits/award \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "registrationId": "CHD-KL-20260306-000001",
    "amount": 100,
    "type": "VACCINATION",
    "description": "Test vaccine",
    "metadata": { "vaccineName": "BCG" }
  }'
```

### Test 3: Get Tree Options

```bash
curl "http://localhost:3000/go-green/tree/options?registrationId=CHD-KL-20260306-000001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test 4: Redeem Tree

```bash
curl -X POST http://localhost:3000/go-green/tree/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "registrationId": "CHD-KL-20260306-000001",
    "tier": "SAPLING",
    "dedicateTo": "Arjun Kumar"
  }'
```

---

## 📊 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/go-green/credits/:registrationId` | Get credit balance & history |
| GET | `/go-green/credits/:registrationId/history` | Get transaction history |
| POST | `/go-green/credits/award` | Award credits manually |
| POST | `/go-green/credits/bulk-award` | Award for multiple vaccines |
| GET | `/go-green/tree/options` | Get tree redemption options |
| POST | `/go-green/tree/redeem` | Redeem credits for tree |
| GET | `/go-green/levels` | Get all tier configurations |
| GET | `/go-green/config` | Get credit earning rates |
| GET | `/go-green/leaderboard` | Get leaderboard (coming soon) |

---

## 🔄 Automatic Credit Awards

Credits are automatically awarded when:

1. **Vaccination Completed** - Emits `vaccination.completed` event
2. **Health Record Uploaded** - Emits `health-record.uploaded` event  
3. **Profile Completed** - Emits `profile.completed` event

### Credit Amounts:

| Action | Credits | Trigger |
|--------|---------|---------|
| 1st Vaccine (BCG) | +50 | Mark as Done |
| 2nd Vaccine (6 weeks) | +100 | Mark as Done |
| 3rd Vaccine (10 weeks) | +100 | Mark as Done |
| 4th Vaccine (14 weeks) | +100 | Mark as Done |
| 5th Vaccine (9 months) | +150 | Mark as Done |
| 6th Vaccine (12-18 months) | +350 | Mark as Done (includes 200 bonus) |
| Health Record Upload | +10 | Upload file |
| Growth Check | +25 | Admin logs data |
| Share Certificate | +5 | Social share |

---

## 🌳 Tree Tiers

| Tier | Credits | Tree | CO₂/Year | Certificate |
|------|---------|------|----------|-------------|
| 🌱 Seedling | 0-499 | Virtual | 0 kg | Digital Badge |
| 🌿 Sapling | 500-999 | Neem | 15 kg | Bronze |
| 🌳 Young | 1000-1999 | Peepal | 30 kg | Silver |
| 🌲 Mature | 2000-3499 | Banyan | 50 kg | Gold |
| 🌴 Guardian | 3500-4999 | 3 Trees | 100 kg | Platinum |
| 🏆 Forest | 5000+ | 5 Trees | 200 kg | Diamond |

---

## 📱 Frontend Integration

### 1. Update Vaccination Page

When marking vaccine as done, the backend automatically awards credits.
Frontend just needs to listen for the response and show animation.

### 2. Add Credit Widget to Go Green Page

Display:
- Current credits
- Tier level with emoji
- Progress bar to next tier
- Quick actions

### 3. Create Credit History Modal

Show transaction history with filters.

### 4. Add Tree Redemption Modal

Let users select and redeem trees.

---

## 🐛 Troubleshooting

### Credits not appearing?
1. Check backend logs for event emission
2. Verify tier configs are seeded: `npm run seed:tiers`
3. Check MongoDB connection

### Event listener not working?
1. Ensure `EventEmitterModule.forRoot()` is in `app.module.ts`
2. Check vaccination service emits `vaccination.completed` event
3. Verify GoGreenModule is imported

### Tree redemption fails?
1. Check credit balance is sufficient
2. Verify tier configs exist in database
3. Check MongoDB session support

---

## 📝 Next Steps

### Immediate (Required)
1. ✅ Seed tier configurations
2. ✅ Test credit award endpoints
3. ⏳ Update vaccination service to emit events
4. ⏳ Update health records service to emit events

### Short Term
1. Create frontend Credit Widget component
2. Build tree selection modal
3. Add credit earning animations
4. Implement certificate generation

### Long Term
1. Leaderboard functionality
2. Achievement badge system
3. Physical certificate printing
4. Tree planting GPS tracking

---

## 📞 Need Help?

1. **Full Documentation**: `GO_GREEN_CREDIT_SYSTEM.md` (root folder)
2. **Backend Setup**: `backend/src/go-green/SETUP_CREDIT_SYSTEM.md`
3. **API Examples**: See test commands above

---

**Status**: ✅ Backend Complete, Ready for Frontend Integration  
**Last Updated**: March 16, 2026
