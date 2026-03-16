# Go Green Image Upload System - Testing Guide

## 🌳 System Overview

The Go Green image upload system allows admins to upload tree photos that are automatically displayed to users in their Go Green dashboard.

## 📁 File Storage Structure

```
backend/
├── uploads/
│   └── go-green/
│       ├── TREE-2026-000001_1710598234567.jpg
│       ├── TREE-2026-000002_1710598345678.png
│       └── test-image.txt (test file)
```

## 🔧 Backend Endpoints

### Image Upload

- **POST** `/go-green/admin/tree/:treeId/upload-image`
- **Auth**: Admin only
- **Body**: FormData with `file`, `notes`, `updatedBy`
- **Response**: `{ success: true, data: tree, imageUrl: "/uploads/go-green/filename.jpg" }`

### Image Serving

- **GET** `/go-green/files/:filename`
- **Public**: Serves uploaded images
- **Example**: `http://localhost:8000/go-green/files/TREE-2026-000001_1710598234567.jpg`

### Test Endpoints

- **GET** `/go-green/health` - API health check
- **POST** `/go-green/admin/test-upload` - Test file upload

### Tree Data

- **GET** `/go-green/tree/registration/:registrationId` - Get tree data for user

## 🎨 Frontend Components

### Admin Panel (`/admin/go-green`)

- **File Upload**: Drag & drop or click to upload
- **Image Preview**: Shows uploaded image
- **Test Upload**: Yellow button to test upload system
- **Tree Management**: Update status and add growth stages

### User Dashboard (`/dashboard/green`)

- **Main Tree Image**: Shows latest uploaded photo
- **Growth Timeline**: Displays photos in timeline with status
- **Photo Gallery**: Grid of all uploaded photos
- **Fallback**: Shows placeholder when no photos available

## 🧪 Testing Steps

### 1. Test API Connection

1. Go to user Go Green page (`/dashboard/green`)
2. If no tree data shows, click "Test API" button
3. Should show "API Connection: Working"

### 2. Test File Upload (Admin)

1. Login as admin (`/admin/login`)
   - Username: `admin`
   - Password: `admin123`
2. Go to Go Green management (`/admin/go-green`)
3. Click "Edit" on any tree
4. Click "Test Upload" (yellow button)
5. Select an image file (JPG/PNG, max 5MB)
6. Should show success message with filename

### 3. Test Tree Image Upload (Admin)

1. In the edit tree modal
2. Click "Upload Photo" (blue button)
3. Select an image file
4. Add notes if desired
5. Click "Add Growth Stage"
6. Should update tree timeline and refresh data

### 4. Verify User Display

1. Go to user Go Green page (`/dashboard/green`)
2. Should see uploaded image as main tree photo
3. Timeline should show growth stages with photos
4. Photo gallery should display all uploaded images

## 🔍 Debugging

### Check Console Logs

- **User Page**: Look for fetch errors, API responses
- **Admin Page**: Check upload progress, response data

### Verify File Storage

- Check `backend/uploads/go-green/` directory
- Files should be named: `TREE-ID_timestamp.ext`

### API Testing

- Test health endpoint: `GET http://localhost:8000/go-green/health`
- Test image serving: `GET http://localhost:8000/go-green/files/filename.jpg`

## 🚨 Common Issues

### "Failed to fetch" Error

- **Cause**: Backend not running or wrong port
- **Fix**: Ensure backend runs on port 8000

### "File not found" Error

- **Cause**: Upload directory doesn't exist
- **Fix**: Directory created automatically, check permissions

### Images not displaying

- **Cause**: Wrong image URL format
- **Fix**: Check if URL starts with `/uploads/go-green/`

### Upload fails

- **Cause**: File too large or wrong type
- **Fix**: Use JPG/PNG files under 5MB

## 📊 File Validation

### Allowed Types

- `image/jpeg`
- `image/png`
- `image/jpg`

### Size Limit

- Maximum: 5MB per file

### Naming Convention

- Format: `{treeId}_{timestamp}.{extension}`
- Example: `TREE-2026-000001_1710598234567.jpg`

## 🔐 Security

### Authentication

- All upload endpoints require admin authentication
- Uses JWT token from `localStorage.getItem('wt18_token')`

### File Validation

- Type checking on both frontend and backend
- Size limits enforced
- Secure file naming to prevent conflicts

## 🎯 Success Criteria

✅ Admin can upload tree images
✅ Images are stored locally in uploads directory  
✅ Users see uploaded images in their dashboard
✅ Timeline updates with new growth stages
✅ Photo gallery displays all images
✅ Proper error handling and validation
✅ Secure authentication and file handling

## 🔄 Data Flow

1. **Admin uploads image** → File saved to `/uploads/go-green/`
2. **Growth timeline updated** → New entry with image URL
3. **User fetches tree data** → API returns tree with image URLs
4. **Images displayed** → Frontend shows images from API URLs
5. **Real-time updates** → Changes reflect immediately

This system provides a complete local image upload and display solution for the Go Green tree tracking feature.
