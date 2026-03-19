# Cascading Deletion Implementation Guide

## Overview

When an admin deletes a child from the children dashboard, all related data is automatically deleted to maintain data consistency and prevent orphaned records.

## What Gets Deleted

When a child is deleted, the following related data is automatically removed:

1. **Child Registration** - The main child record
2. **Milestones** - All vaccination and health milestones
3. **Development Milestones** - All developmental tracking records
4. **Health Records** - All uploaded health documents and records
5. **Reminders** - All scheduled reminders for the child
6. **Payments** - All payment records associated with the child
7. **Go Green Trees** - All planted trees linked to the child
8. **Parent User Link** - Removes the child's registration ID from parent user account

## API Endpoints

### Get Deletion Summary

```
GET /dashboard/admin/delete-child-summary/:registrationId
```

Returns a summary of what would be deleted without actually deleting anything. Useful for admin confirmation.

**Response:**

```json
{
  "success": true,
  "data": {
    "child": {
      /* child registration object */
    },
    "relatedDataCounts": {
      "milestones": 12,
      "developmentMilestones": 8,
      "healthRecords": 5,
      "reminders": 3,
      "payments": 1,
      "goGreenTrees": 1
    },
    "totalRecords": 31
  },
  "message": "Found 31 records that would be deleted for child John Doe"
}
```

### Delete Child (Cascading)

```
DELETE /dashboard/admin/delete-child/:registrationId
```

Performs the actual cascading deletion of the child and all related data.

**Response:**

```json
{
  "success": true,
  "message": "Child deleted successfully"
}
```

## Implementation Details

### Performance Optimization

- Related data deletion is performed in parallel using `Promise.all()`
- Counts are fetched before deletion for audit logging
- Efficient MongoDB queries with proper indexing

### Error Handling

- Validates child exists before attempting deletion
- Comprehensive error logging with context
- Atomic operations to prevent partial deletions
- Detailed audit trail in server logs

### Audit Logging

The system logs detailed information about each deletion:

- Child information (ID, name)
- Count of each type of related record found
- Count of each type of record actually deleted
- Parent user unlink operations
- Total records deleted
- Any errors encountered

### Safety Features

- Admin-only access (requires proper authentication and authorization)
- Detailed logging for audit trails
- Pre-deletion summary endpoint for confirmation
- Comprehensive error handling and rollback

## Frontend Integration

The frontend admin dashboard already includes:

- Delete button with confirmation dialog
- Integration with the DELETE endpoint
- Error handling and user feedback

## Database Relationships

All related entities reference the child via `registrationId`:

- `milestones.registrationId`
- `development_milestones.registrationId`
- `health_records.registrationId`
- `reminders.registrationId`
- `payments.registrationId`
- `go_green_trees.registrationId`
- `users.registrationIds[]` (array field)

## Testing

To test the cascading deletion:

1. Create a test child with related data
2. Use the summary endpoint to verify what would be deleted
3. Perform the deletion
4. Verify all related records are removed
5. Check audit logs for proper logging

## Security Considerations

- Only admin users can perform deletions
- All operations are logged for audit purposes
- No soft delete - this is permanent data removal
- Consider implementing backup/export before deletion in production

## Future Enhancements

Potential improvements:

- Soft delete option (mark as deleted instead of removing)
- Bulk deletion for multiple children
- Export child data before deletion
- Scheduled deletion with grace period
- Database transactions for atomic operations
