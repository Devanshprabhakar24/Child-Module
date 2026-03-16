# Health Records Upload Test Guide

## Testing the Upload Functionality

### 1. **Access the Health Records Page**

- Navigate to: `http://localhost:3000/dashboard/health-records`
- The page should automatically set a test admin token for development

### 2. **Test File Upload**

- Click the "Upload Record" button
- Drag and drop a PDF or image file (max 10MB)
- Fill in the required fields:
  - Document Name: e.g., "Test Certificate"
  - Category: Select from dropdown (e.g., "Other")
  - Date of Record: Select a date
  - Notes (optional): Add any notes
  - Doctor's Name (optional): Add doctor name

### 3. **Upload Process**

- Click "Upload Document" button
- Check browser console for debug logs
- Should see success message if upload works
- File should appear in the records list

### 4. **View Documents**

- Click "View" button on any uploaded document
- Should open document viewer modal
- PDFs will show in iframe
- Images will display directly
- Download button should work

### 5. **Troubleshooting**

#### If Upload Fails:

1. Check browser console for error messages
2. Verify backend is running on port 8000
3. Check network tab for API call details
4. Ensure file is under 10MB and correct format (PDF, JPG, PNG)

#### If Documents Don't Display:

1. Check if Cloudinary credentials are configured
2. Verify file URL is accessible
3. Check browser console for errors

#### Common Issues:

- **401 Unauthorized**: Token expired or invalid
- **403 Forbidden**: User doesn't have permission
- **400 Bad Request**: Missing required fields or invalid file
- **File too large**: Reduce file size under 10MB

### 6. **Backend Endpoints**

- Categories: `GET /health-records/categories` (public)
- Upload: `POST /health-records/upload/:registrationId` (auth required)
- Get Records: `GET /health-records/:registrationId` (auth required)

### 7. **Test Registration ID**

- Using: `CHD-KL-20260306-000001`
- This is set automatically for testing

### 8. **File Storage**

- Files are stored in Cloudinary
- Organized in folders by registration ID
- Secure URLs provided for access

## Expected Behavior

1. **Upload Success**: File uploads to Cloudinary, record saved to database
2. **View Success**: Documents display in modal viewer
3. **Download Success**: Files download with original names
4. **Search/Filter**: Records can be filtered by category and searched
5. **Responsive**: Works on mobile and desktop

## Debug Information

The frontend includes console logging for:

- File selection and validation
- API calls and responses
- Upload progress and results
- Error messages and details

Check the browser console for detailed debug information during testing.
