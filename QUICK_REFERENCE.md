# Quick Reference Card - WombTo18 Dashboard

## 🔐 Login Credentials

**Admin:**

- Username: `admin`
- Password: `admin123`
- URL: `http://localhost:3000/admin/login`

**Parent/User:**

- Login via OTP (phone number)
- URL: `http://localhost:3000/login`

## 🚀 Quick Start

### Backend

```bash
cd backend
npm install
npm run start:dev
# Runs on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## 📊 Feature Access Matrix

| Feature                 | User | Admin |
| ----------------------- | ---- | ----- |
| View Vaccinations       | ✅   | ✅    |
| Mark Vaccination Done   | ❌   | ✅    |
| Undo Vaccination        | ❌   | ✅    |
| View Milestones         | ✅   | ✅    |
| Mark Milestone Achieved | ✅   | ✅    |
| Undo Milestone          | ✅   | ✅    |
| Manage Templates        | ❌   | ✅    |
| Download Certificates   | ✅   | ✅    |

## 🎯 Key Endpoints

### Development Milestones

```bash
# Get milestones
GET /dashboard/development-milestones/:registrationId

# Seed milestones
POST /dashboard/development-milestones/seed
Body: { registrationId, ageGroup, templates[] }

# Update status
PATCH /dashboard/development-milestones/:milestoneId
Body: { status: "ACHIEVED", achievedDate: "2024-03-16" }
```

### Vaccinations

```bash
# Get vaccination tracker
GET /dashboard/vaccination/:registrationId

# Update vaccination status (admin only)
PATCH /dashboard/milestones/:milestoneId
Body: { status: "COMPLETED", completedDate: "2024-03-16" }
```

### CMS

```bash
# Get milestone templates
GET /cms/milestone-templates
GET /cms/milestone-templates/:ageGroup

# Seed default data (admin only)
POST /cms/seed
```

## 📱 User Workflows

### Parent - Track Milestones

1. Login → Dashboard → Milestones
2. Select age group tab
3. Click "Load Milestones" (first time)
4. Click "Mark Achieved" when child demonstrates skill
5. View progress percentage

### Parent - View Vaccinations

1. Login → Dashboard → Vaccinations
2. View vaccination schedule
3. See status badges (Completed/Due/Upcoming)
4. Download certificates for completed vaccines

### Admin - Manage Vaccinations

1. Login → Admin → Vaccinations
2. Select child from dropdown
3. Click "Mark as Done" to complete
4. Click "Unmark" to undo
5. Status toggles automatically

### Admin - Seed Data

1. Login → Admin → CMS
2. Click "Seed Default Data"
3. Verify 25+ milestones created
4. Templates ready for use

## 🎨 Age Groups

| Age Group   | Label      | Emoji | Status              |
| ----------- | ---------- | ----- | ------------------- |
| 0-1 years   | Infant     | 👶    | Unlocked from birth |
| 1-3 years   | Toddler    | 🧒    | Unlocks at 1 year   |
| 3-5 years   | Preschool  | 👦    | Unlocks at 3 years  |
| 5-12 years  | School Age | 🧑    | Unlocks at 5 years  |
| 13-18 years | Teen       | 👨    | Unlocks at 13 years |

## 🏷️ Milestone Types

| Type      | Icon | Color  | Description                |
| --------- | ---- | ------ | -------------------------- |
| PHYSICAL  | 💪   | Blue   | Motor skills, coordination |
| COGNITIVE | 🧠   | Purple | Thinking, learning         |
| SOCIAL    | 👥   | Green  | Interaction, friendships   |
| EMOTIONAL | ❤️   | Pink   | Feelings, self-regulation  |
| LANGUAGE  | 💬   | Amber  | Communication, speech      |

## 🎯 Status Indicators

### Vaccination Status

- **Completed** - Green badge with ✓
- **Due** - Amber badge
- **Upcoming** - Gray badge
- **Missed** - Red badge

### Milestone Status

- **Achieved** - Green checkmark ✓
- **In Progress** - Blue clock 🕐
- **Not Started** - Gray circle ○
- **Delayed** - Red clock 🕐

## 🔧 Common Tasks

### Seed Milestone Templates

```bash
# Via UI
Admin → CMS → Seed Default Data

# Via API
curl -X POST http://localhost:8000/cms/seed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark Vaccination Complete (Admin)

```bash
curl -X PATCH http://localhost:8000/dashboard/milestones/MILESTONE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED","completedDate":"2024-03-16"}'
```

### Mark Milestone Achieved (User)

```bash
curl -X PATCH http://localhost:8000/dashboard/development-milestones/MILESTONE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ACHIEVED","achievedDate":"2024-03-16"}'
```

## 🐛 Troubleshooting

### Age group locked

- Check child's DOB in profile
- Age calculated automatically from DOB

### No milestones showing

- Click "Load Milestones" button
- Ensure templates are seeded (Admin → CMS)

### Cannot mark vaccination

- Users cannot mark vaccinations (admin only)
- Login as admin to update vaccination status

### Mark achieved not working

- Check authentication token
- Verify internet connection
- Check browser console for errors

## 📚 Documentation Files

- `DEVELOPMENT_MILESTONES_GUIDE.md` - User guide
- `DEVELOPMENT_MILESTONES_TECHNICAL.md` - Technical docs
- `MILESTONE_MODULE_SUMMARY.md` - Implementation summary
- `MILESTONE_QUICK_START.md` - Quick start guide
- `USER_PERMISSIONS_UPDATE.md` - Permissions overview
- `FINAL_IMPLEMENTATION_SUMMARY.md` - Complete summary
- `QUICK_REFERENCE.md` - This file

## 🎉 Quick Wins

✅ 25+ default milestones ready to use
✅ Age-based automatic unlocking
✅ Real-time progress tracking
✅ Admin full control over vaccinations
✅ User-friendly milestone tracking
✅ Certificate downloads
✅ Responsive design
✅ No setup required (just seed data)

---

**Need Help?** Check the documentation files or contact your system administrator.
