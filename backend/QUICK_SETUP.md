# Quick Setup Guide - Development Milestones

## For Fresh Installations

### Option 1: Automatic (Recommended)

Just register a child - the system will automatically:

1. Seed milestone templates if they don't exist
2. Create child-specific development milestones
3. Activate all services (vaccinations, reminders, tree planting)

**No manual steps required!**

### Option 2: Pre-seed Templates (Optional)

If you want to seed templates before any registrations:

```bash
cd backend
node seed-milestone-templates.js
```

## For Existing Installations

### Step 1: Seed Milestone Templates (if not already done)

```bash
cd backend
node seed-milestone-templates.js
```

Expected output:

```
✅ Successfully seeded 34 milestone templates!

📊 Templates by age group:
   0-1 years: 8 milestones
   1-3 years: 8 milestones
   3-5 years: 7 milestones
   5-12 years: 6 milestones
   13-18 years: 5 milestones
```

### Step 2: Activate Services for Existing Registrations

```bash
cd backend
node activate-all-services-simple.js
```

Expected output:

```
Found 4 completed registrations

📋 Processing: CHD-ML-20260306-000001 (Aarav)
   Age: 0 months → Age group: 0-1 years
   ✅ Created 8 development milestones

📋 Processing: CHD-DL-20240115-000001 (Test Child)
   Age: 26 months → Age group: 1-3 years
   ✅ Created 8 development milestones

🎉 All services activated successfully!
```

## Verification

### Check Templates in Database

```bash
cd backend
node check-milestone-templates.js
```

### Check Milestones for Specific Registration

```bash
cd backend
node verify-milestones.js
```

### Test in Frontend

1. Start backend: `cd backend && npm run start:dev`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to: `http://localhost:3000/dashboard/milestones?id=CHD-ML-20260306-000001`
4. Should see 8 development milestones for "0-1 years" age group

### Test via API

```bash
# Get development milestones
curl http://localhost:8000/api/dashboard/CHD-ML-20260306-000001/development-milestones

# Get vaccination tracker
curl http://localhost:8000/api/dashboard/CHD-ML-20260306-000001/vaccination-tracker
```

## Troubleshooting

### Issue: "No templates found for this age group"

**Automatic Fix**: The system will auto-seed templates on next registration

**Manual Fix**:

```bash
cd backend
node seed-milestone-templates.js
```

### Issue: Existing registrations missing milestones

**Fix**:

```bash
cd backend
node activate-all-services-simple.js
```

### Issue: Backend won't start

**Check**:

1. MongoDB connection string in `.env`
2. MongoDB Atlas cluster is running
3. Network access configured in MongoDB Atlas

**Verify**:

```bash
cd backend
npm run build
```

## Scripts Reference

| Script                            | Purpose                                      | When to Use                         |
| --------------------------------- | -------------------------------------------- | ----------------------------------- |
| `seed-milestone-templates.js`     | Seed 34 milestone templates                  | Fresh database or missing templates |
| `activate-all-services-simple.js` | Activate services for existing registrations | After adding milestone feature      |
| `check-milestone-templates.js`    | Verify templates in database                 | Debugging template issues           |
| `verify-milestones.js`            | Check milestones for specific registration   | Verify activation worked            |

## What Gets Activated

For each registration, the system activates:

1. **Vaccination Milestones** (25 milestones)
   - Based on Indian NIS/IAP schedule
   - From birth to 18 years
   - Includes BCG, OPV, Pentavalent, MMR, etc.

2. **Development Milestones** (varies by age)
   - 0-1 years: 8 milestones
   - 1-3 years: 8 milestones
   - 3-5 years: 7 milestones
   - 5-12 years: 6 milestones
   - 13-18 years: 5 milestones

3. **Reminders** (25 reminders)
   - SMS, WhatsApp, Email
   - 7 days before each vaccination
   - Milestone achievement reminders

4. **Tree Planting** (1 tree)
   - Go Green initiative
   - Certificate generated and emailed

## Summary

✅ **Automatic**: New registrations get everything automatically
✅ **Self-healing**: Missing templates are auto-seeded
✅ **Retroactive**: Existing registrations can be activated with one script
✅ **Verified**: All systems tested and working
✅ **Permanent**: No manual intervention needed going forward

The system is production-ready!
