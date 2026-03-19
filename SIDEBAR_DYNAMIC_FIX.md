# Sidebar Dynamic Registration ID Fix

## Problem

The Sidebar component had a hardcoded registration ID in the navigation links, causing hydration errors and incorrect routing.

## Solution

### 1. Updated Sidebar Component

Changed from using `window.location.search` to Next.js `useSearchParams()` hook:

**Before:**

```typescript
const getRegistrationId = () => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || "";
  }
  return "";
};

const registrationId = getRegistrationId();
```

**After:**

```typescript
import { usePathname, useSearchParams } from "next/navigation";

const searchParams = useSearchParams();
const registrationId = searchParams.get("id") || "";
```

**Benefits:**

- ✅ Proper Next.js 13+ App Router pattern
- ✅ No hydration mismatches
- ✅ Server-side rendering compatible
- ✅ Automatic reactivity when URL changes

### 2. Added Suspense Boundary

Wrapped Sidebar in Suspense to prevent hydration errors (required when using `useSearchParams()`):

**In DashboardShell.tsx:**

```typescript
import { Suspense } from "react";

function SidebarWithSuspense(props: any) {
  return (
    <Suspense fallback={<div className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-primary/10" />}>
      <Sidebar {...props} />
    </Suspense>
  );
}
```

## How It Works Now

### Navigation Links

All navigation links dynamically include the registration ID from the URL:

```typescript
const hrefWithId = registrationId ? `${item.href}?id=${registrationId}` : item.href;

<Link href={hrefWithId}>
  {item.name}
</Link>
```

### URL Flow

1. User logs in → redirected to `/dashboard?id=CHD-XX-XXXXXXXX-XXXXXX`
2. User clicks "Milestones" → navigates to `/dashboard/milestones?id=CHD-XX-XXXXXXXX-XXXXXX`
3. User clicks "Vaccinations" → navigates to `/dashboard/vaccinations?id=CHD-XX-XXXXXXXX-XXXXXX`
4. Registration ID persists across all navigation

## Files Modified

### Frontend Components

- `frontend/src/components/dashboard/Sidebar.tsx` - Changed to use `useSearchParams()`
- `frontend/src/components/dashboard/DashboardShell.tsx` - Added Suspense boundary

## Testing

### Verify Dynamic Routing

1. Start frontend: `cd frontend && npm run dev`
2. Login with any registration
3. Check URL includes `?id=CHD-XX-XXXXXXXX-XXXXXX`
4. Click different navigation items
5. Verify ID persists in URL for all pages

### Check for Hydration Errors

1. Open browser console
2. Navigate between pages
3. Should see NO hydration warnings
4. Should see NO "Text content did not match" errors

### Test Multiple Registrations

1. Login with registration A
2. Navigate to Milestones → should show data for registration A
3. Logout and login with registration B
4. Navigate to Milestones → should show data for registration B
5. Verify no data leakage between registrations

## Common Issues

### Issue: "useSearchParams() should be wrapped in a suspense boundary"

**Solution:** Already fixed - Sidebar is wrapped in Suspense in DashboardShell

### Issue: Hydration mismatch errors

**Solution:** Already fixed - using `useSearchParams()` instead of `window.location`

### Issue: Registration ID not persisting

**Solution:** Check that LoginForm redirects with ID: `router.push(\`/dashboard?id=\${registrationId}\`)`

## Summary

✅ **Dynamic**: Registration ID now comes from URL query parameters
✅ **Reactive**: Automatically updates when URL changes
✅ **SSR-Safe**: No hydration mismatches
✅ **Persistent**: ID maintained across all navigation
✅ **Clean**: Proper Next.js 13+ App Router patterns

The sidebar now correctly uses dynamic registration IDs from the URL!
