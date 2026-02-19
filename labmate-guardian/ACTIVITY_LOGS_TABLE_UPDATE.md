# Activity Logs Table - IP Address Column Added

## What Changed

Added the **IP Address** column to the Activity Logs table so admins can see the IP address of each activity directly in the table view, without needing to click "View" to see details.

## Before

The table had these columns:
1. Date/Time
2. User
3. Action
4. Module
5. Device
6. Browser/OS
7. Description
8. Severity
9. Actions

**IP Address was only visible in the details dialog.**

## After

The table now has these columns:
1. Date/Time
2. User
3. Action
4. Module
5. Device
6. Browser/OS
7. **IP Address** ← NEW!
8. Description
9. Severity
10. Actions

**IP Address is now visible directly in the table.**

## Why This Matters

### Security & Monitoring
- Admins can quickly scan for suspicious IP addresses
- Easier to identify patterns of activity from specific locations
- No need to click into each log to see the IP address

### Audit Trail
- Complete activity information at a glance
- Better for compliance and security audits
- Faster investigation of security incidents

### User Experience
- Less clicking required to see important information
- IP addresses displayed in monospace font for readability
- Consistent with other admin monitoring tools

## Technical Details

### Frontend Changes
**File:** `src/pages/ActivityLogs.tsx`

**Table Header:**
```tsx
<TableHead className="w-[120px]">IP Address</TableHead>
```

**Table Cell:**
```tsx
<TableCell className="text-xs font-mono">
  {log.ip_address || "-"}
</TableCell>
```

### Styling
- Width: 120px (enough for IPv4 and most IPv6 addresses)
- Font: Monospace (better readability for IP addresses)
- Size: text-xs (consistent with other columns)
- Fallback: Shows "-" if IP address is not available

## Example Display

```
IP Address
──────────────
192.168.1.100
10.0.0.45
172.16.0.1
-
```

## Related Features

The IP address column works together with:
- **Real-time updates** - New logs show IP immediately
- **Device tracking** - See device type, browser, and OS
- **Details dialog** - Click "View" for full IP info including real_ip (if behind proxy)
- **Filtering** - Can search by IP address using the search box

## Privacy Considerations

IP addresses are sensitive information. This feature is:
- ✅ Only visible to admin users
- ✅ Part of the audit trail for security
- ✅ Stored securely in the database
- ✅ Can be anonymized for long-term storage if needed

## Testing

To verify the IP address column is working:

1. Open Activity Logs page as admin
2. Look for the "IP Address" column header
3. Check that IP addresses are displayed for each log
4. Verify the font is monospace (easier to read)
5. Perform a new action and see the IP appear in real-time

## Files Changed

- `src/pages/ActivityLogs.tsx` - Added IP Address column to table
