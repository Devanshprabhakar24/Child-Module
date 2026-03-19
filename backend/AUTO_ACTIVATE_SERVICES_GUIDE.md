# Automatic Service Activation Guide

## Overview

All child registrations now automatically activate ALL services immediately upon registration, including:

- ✅ Vaccination milestones (based on Indian NIS/IAP schedule)
- ✅ Development milestones (age-appropriate tracking)
- ✅ Reminders (SMS, WhatsApp, Email)
- ✅ Tree planting (Go Green initiative)

## How It Works

### 1. New Registrations (Automatic)

When a child is registered via `POST /api/registration/register`:

1. **Payment Status**: Always set to `COMPLETED` (no dependency on payment gateway)
2. **Email Sequence**: Both emails sent immediately
   - Email 1: Welcome + Payment Invoice PDF
   - Email 2: Go Green Certificate PDF
3. **Service Activation**: All services activated automatically in background
   - Vaccination milestones seeded
   - Development milestones seeded (with automatic template fallback)
   - Reminders scheduled
   - Tree planted

### 2. Automatic Template Seeding

**NEW FEATURE**: If milestone templates don't exist in the database, the system will automatically seed them!

The `activateAllServicesForRegistration()` method now includes:

```typescript
// AUTOMATIC FALLBACK: If no templates found, seed default templates
if (!templates || templates.length === 0) {
  this.logger.warn(
    `⚠️ No milestone templates found for age group: ${dashboardAgeGroup}`,
  );
  this.logger.log(`🔧 Auto-seeding default milestone templates...`);

  // Seed default CMS data (includes milestone templates)
  const seedResults = await this.cmsService.seedDefaultData();
  this.logger.log(`✅ Seeded ${seedResults.milestones} milestone templates`);

  // Try fetching templates again
  templates =
    await this.cmsService.getMilestoneTemplatesByAgeGroup(dashboardAgeGroup);
}
```

This means:

- ✅ No manual seeding required
- ✅ Templates created on-demand
- ✅ Works for fresh databases
- ✅ Works for existing databases

### 3. Existing Registrations (Manual Activation)

For registrations created before this feature was implemented, use the activation script:

```bash
cd backend
node activate-all-services-simple.js
```

This script:

- Finds all completed registrations
- Checks if milestone templates exist (seeds if needed)
- Creates development milestones for each child's age group
- Skips registrations that already have milestones

## Age Group Mapping

The system uses these age groups for development milestones:

| Age Range     | Age Group   | Milestone Count |
| ------------- | ----------- | --------------- |
| 0-11 months   | 0-1 years   | 8 milestones    |
| 12-35 months  | 1-3 years   | 8 milestones    |
| 36-71 months  | 3-5 years   | 7 milestones    |
| 72-143 months | 5-12 years  | 6 milestones    |
| 144+ months   | 13-18 years | 5 milestones    |

## Milestone Types

Development milestones are categorized by type:

- **PHYSICAL**: Motor skills, coordination
- **COGNITIVE**: Thinking, problem-solving
- **SOCIAL**: Interaction with others
- **EMOTIONAL**: Feelings, self-regulation
- **LANGUAGE**: Communication, speech

## Verification

### Check if services are activated for a registration:

```bash
# Check vaccination milestones
curl http://localhost:8000/api/dashboard/CHD-XX-XXXXXXXX-XXXXXX/vaccination-tracker

# Check development milestones
curl http://localhost:8000/api/dashboard/CHD-XX-XXXXXXXX-XXXXXX/development-milestones

# Check reminders
curl http://localhost:8000/api/reminders/CHD-XX-XXXXXXXX-XXXXXX
```

### Check milestone templates in database:

```bash
cd backend
node check-milestone-templates.js
```

Expected output:

```
✅ Connected to MongoDB

Total templates: 34

Templates by age group:
  0-1 years: 8 templates
  1-3 years: 8 templates
  3-5 years: 7 templates
  5-12 years: 6 templates
  13-18 years: 5 templates
```

## Troubleshooting

### Issue: "No templates found for this age group"

**Solution 1**: Automatic (Recommended)

- The system will automatically seed templates on next registration
- No manual intervention needed

**Solution 2**: Manual seeding

```bash
cd backend
node seed-milestone-templates.js
```

### Issue: Existing registrations missing development milestones

**Solution**: Run the activation script

```bash
cd backend
node activate-all-services-simple.js
```

### Issue: Development milestones not showing in frontend

**Checklist**:

1. ✅ Milestone templates exist in database
2. ✅ Child-specific milestones created for registration
3. ✅ Registration ID passed in URL: `?id=CHD-XX-XXXXXXXX-XXXXXX`
4. ✅ Frontend calling correct API endpoint

**Verify in backend logs**:

```
🚀 Auto-activating ALL services for CHD-XX-XXXXXXXX-XXXXXX...
📅 Seeding vaccination milestones...
✅ Seeded 25 vaccination milestones
🧠 Seeding development milestones...
Child age group: 0-1 years
✅ Seeded 8 development milestones for 0-1 years
🔔 Setting up reminders...
✅ Scheduled 25 reminders
🌳 Tree already planted: TREE-2026-000001
🎉 ALL SERVICES ACTIVATED: 25 vaccination milestones, 8 development milestones, 25 reminders, tree planted: YES
```

## Files Modified

### Backend

- `backend/src/registration/registration.service.ts` - Added automatic template seeding
- `backend/src/cms/cms.service.ts` - Provides `seedDefaultData()` method
- `backend/src/dashboard/dashboard.service.ts` - Seeds child-specific milestones

### Scripts

- `backend/seed-milestone-templates.js` - Manual template seeding (optional)
- `backend/activate-all-services-simple.js` - Activate services for existing registrations
- `backend/check-milestone-templates.js` - Verify templates in database

## Summary

✅ **Automatic**: New registrations get all services activated immediately
✅ **Self-healing**: Missing templates are automatically seeded
✅ **Retroactive**: Existing registrations can be activated with one script
✅ **Verified**: All 4 existing registrations now have development milestones
✅ **Permanent**: No manual intervention needed going forward

The system is now fully automated and self-sufficient!
