# Registration ID Propagation Fix

## Issue

Users were getting "Failed to upload: Registration not found" error when navigating to health records page from the sidebar because the registration ID was not being passed in the URL.

## Root Cause

1. Sidebar navigation links didn't include the registration ID parameter
2. Health records components were using hardcoded test registration IDs as fallback
3. Registration ID wasn't being propagated across page navigation

## Solution

### 1. Updated Sidebar Navigation (`frontend/src/components/dashboard/Sidebar.tsx`)

**Changes:**

- Added `getRegistrationId()` function to extract registration ID from current URL
- Updated all navigation links to append `?id={registrationId}` parameter
- Applied to all nav items: Overview, Vaccination Tracker, Health Records, Milestones, School, Go Green, Settings

**Code:**

```typescript
const getRegistrationId = () => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || "";
  }
  return "";
};

const registrationId = getRegistrationId();
const hrefWithId = registrationId
  ? `${item.href}?id=${registrationId}`
  : item.href;
```

### 2. Updated RecordsGrid Component (`frontend/src/components/dashboard/records/RecordsGrid.tsx`)

**Changes:**

- Removed hardcoded test registration ID fallback
- Updated to get registration ID from URL params → localStorage → user data
- Added proper error handling when no registration ID found

**Before:**

```typescript
let registrationId = localStorage.getItem("currentRegistrationId");
if (!registrationId) {
  registrationId = "CHD-KL-20260306-000001"; // ❌ Hardcoded test ID
  localStorage.setItem("currentRegistrationId", registrationId);
}
```

**After:**

```typescript
const params = new URLSearchParams(window.location.search);
let registrationId =
  params.get("id") || localStorage.getItem("currentRegistrationId");

if (!registrationId) {
  const user = JSON.parse(localStorage.getItem("wt18_user") || "{}");
  registrationId = user.registrationId || user.registrationIds?.[0];
}

if (!registrationId) {
  console.error("No registration ID found");
  setLoading(false);
  return;
}
```

### 3. Updated UploadRecordModal (`frontend/src/components/dashboard/records/UploadRecordModal.tsx`)

**Changes:**

- Removed hardcoded test registration ID fallback
- Updated to get registration ID from URL params → localStorage → user data
- Added user-friendly error message

### 4. Updated Health Records Page (`frontend/src/app/dashboard/health-records/page.tsx`)

**Changes:**

- Added registration ID state management
- Updated to get registration ID from URL params first
- Improved error handling and user feedback

## Navigation Flow

### Correct Flow (After Fix):

```
1. User logs in
   ↓
2. Redirected to /dashboard?id=CHD-XX-XXXXXXXX-XXXXXX
   ↓
3. User clicks "Health Records" in sidebar
   ↓
4. Navigates to /dashboard/records?id=CHD-XX-XXXXXXXX-XXXXXX
   ↓
5. Registration ID extracted from URL
   ↓
6. Health records loaded successfully
   ↓
7. Upload works with correct registration ID
```

### Previous Flow (Before Fix):

```
1. User logs in
   ↓
2. Redirected to /dashboard?id=CHD-XX-XXXXXXXX-XXXXXX
   ↓
3. User clicks "Health Records" in sidebar
   ↓
4. Navigates to /dashboard/records (❌ No ID parameter)
   ↓
5. Falls back to hardcoded test ID
   ↓
6. ❌ "Registration not found" error
```

## Registration ID Priority Order

All components now follow this priority:

```
1. URL Parameter (?id=CHD-XX-XXXXXXXX-XXXXXX)
   ↓ (if not found)
2. localStorage.getItem('currentRegistrationId')
   ↓ (if not found)
3. User data from localStorage.getItem('wt18_user')
   - user.registrationId
   - user.registrationIds[0]
   ↓ (if not found)
4. Show error / return early
```

## Testing

### Test Case 1: Normal Navigation

1. Login as user
2. Should redirect to `/dashboard?id=CHD-XX-XXXXXXXX-XXXXXX`
3. Click "Health Records" in sidebar
4. Should navigate to `/dashboard/records?id=CHD-XX-XXXXXXXX-XXXXXX`
5. Health records should load
6. Upload should work

### Test Case 2: Direct URL Access

1. Login as user
2. Manually navigate to `/dashboard/records?id=CHD-XX-XXXXXXXX-XXXXXX`
3. Health records should load
4. Upload should work

### Test Case 3: Missing Registration ID

1. Navigate to `/dashboard/records` (no ID parameter)
2. Should check localStorage and user data
3. If found, should work
4. If not found, should show error message

## Files Modified

1. `frontend/src/components/dashboard/Sidebar.tsx`
   - Added registration ID extraction from URL
   - Updated all navigation links to include ID parameter

2. `frontend/src/components/dashboard/records/RecordsGrid.tsx`
   - Removed hardcoded test registration ID
   - Added proper registration ID retrieval logic

3. `frontend/src/components/dashboard/records/UploadRecordModal.tsx`
   - Removed hardcoded test registration ID
   - Added proper registration ID retrieval logic

4. `frontend/src/app/dashboard/health-records/page.tsx`
   - Added registration ID state management
   - Improved error handling

## Benefits

✅ **Registration ID propagates across all pages**
✅ **No more hardcoded test IDs**
✅ **Consistent navigation experience**
✅ **Proper error handling**
✅ **Works with URL parameters (primary method)**
✅ **Falls back to localStorage and user data**
✅ **All sidebar links maintain registration ID**

## Important Notes

- The registration ID is now passed via URL parameters across all dashboard pages
- This ensures consistency and makes the app more stateless
- Users can bookmark specific child dashboards with the ID in the URL
- The sidebar automatically maintains the registration ID when navigating between pages

## Future Enhancements

- Add React Context for global registration ID management
- Add registration ID to session storage for better persistence
- Add child selector dropdown for users with multiple children
- Add registration ID validation on page load
- Add loading states while fetching registration data
