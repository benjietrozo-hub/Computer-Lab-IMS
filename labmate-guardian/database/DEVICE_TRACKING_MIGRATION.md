# Device & Browser Tracking Migration Guide

## Overview
This migration adds enhanced device, browser, and OS tracking to the Activity Logs system for improved security monitoring and debugging capabilities.

## What's New

### Database Changes
- **device_type**: Mobile, desktop, tablet, bot, or unknown
- **browser**: Browser name and version (e.g., "Chrome 120.0")
- **os**: Operating system (e.g., "Windows 10/11", "macOS 14.2", "Android 13")
- **is_bot**: Boolean flag for bot/crawler detection
- **real_ip**: Real IP address from X-Forwarded-For header (for proxy scenarios)

### New Features
1. **User-Agent Parsing**: Automatic detection of device type, browser, and OS
2. **X-Forwarded-For Support**: Accurate IP detection behind proxies/load balancers
3. **Bot Detection**: Identifies automated traffic (crawlers, scrapers, API clients)
4. **Enhanced UI**: Visual device icons, browser emojis, and detailed information
5. **Device Filtering**: Filter logs by device type (mobile/desktop/tablet/bot)
6. **Privacy Compliance**: IP anonymization for regular users (GDPR/CCPA)

## Migration Steps

### Step 1: Run Database Migration
```bash
# Navigate to database directory
cd database/migrations

# Run the migration (using MySQL command line or phpMyAdmin)
mysql -u your_username -p labmate_guardian < 006_add_device_browser_columns.sql
```

Or manually execute in phpMyAdmin:
1. Open phpMyAdmin
2. Select `labmate_guardian` database
3. Go to SQL tab
4. Copy and paste contents of `006_add_device_browser_columns.sql`
5. Click "Go"

### Step 2: Verify Migration
Check that new columns exist:
```sql
DESCRIBE activity_logs;
```

You should see:
- `device_type` VARCHAR(50)
- `browser` VARCHAR(100)
- `os` VARCHAR(100)
- `is_bot` BOOLEAN
- `real_ip` VARCHAR(45)

### Step 3: Test the System
1. Clear browser cache
2. Log in to the system
3. Navigate to Activity Logs page
4. Verify that new logs show device/browser/OS information
5. Test device filter dropdown
6. Check details modal for enhanced information

## Privacy & Compliance

### IP Address Handling
- **Admin Users**: Full IP addresses are stored (audit requirement)
- **Regular Users**: IPs can be anonymized for long-term storage
- **X-Forwarded-For**: Real client IP is captured when behind proxy

### Data Retention
- Consider implementing automatic log cleanup after 90 days for regular users
- Admin action logs should be retained longer (1+ year) for compliance
- Bot traffic can be purged more aggressively (30 days)

### GDPR/CCPA Compliance
The system includes IP anonymization capabilities:
```php
// Example: Anonymize IP for privacy
$anonymizedIP = IPHelper::anonymizeIP('192.168.1.100');
// Result: 192.168.1.xxx
```

## Security Benefits

### 1. Session Hijacking Detection
If a user's session suddenly shows:
- Different device type (desktop → mobile)
- Different browser (Chrome → Firefox)
- Different IP address (New York → Moscow)

This could indicate a compromised session.

### 2. Bot Detection
Automatically identifies:
- Web scrapers
- API clients (curl, wget, Python)
- Search engine crawlers
- Automated attacks

### 3. Debugging Support
When users report issues:
- "Works on my machine" → Check their browser/OS
- Mobile-specific bugs → Filter by device_type = 'mobile'
- Browser compatibility → See which browsers have errors

## API Changes

### New Request Headers Supported
- `X-Forwarded-For`: Real client IP (proxy scenarios)
- `X-Real-IP`: Alternative real IP header

### New Filter Parameters
```javascript
// Frontend API call example
fetch('/api/activity_logs.php?device_type=mobile&action=login')
```

### WebSocket Broadcast Enhanced
Real-time logs now include:
```javascript
{
  type: 'activity_log',
  payload: {
    // ... existing fields ...
    device_type: 'mobile',
    browser: 'Chrome 120.0',
    os: 'Android 13',
    is_bot: false
  }
}
```

## Troubleshooting

### Issue: Device type shows "unknown"
**Cause**: User-Agent string is empty or malformed
**Solution**: Check browser settings, ensure User-Agent is not blocked

### Issue: IP shows proxy address, not real client IP
**Cause**: X-Forwarded-For header not configured
**Solution**: Configure your web server (Apache/Nginx) to pass the header

#### Apache Configuration
```apache
# Add to .htaccess or VirtualHost
RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s"
```

#### Nginx Configuration
```nginx
# Add to server block
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Real-IP $remote_addr;
```

### Issue: All traffic marked as "bot"
**Cause**: User-Agent contains bot-like keywords
**Solution**: Review UserAgentParser.php bot detection patterns

## Performance Considerations

### User-Agent Parsing
- Parsing is lightweight (regex-based)
- No external API calls
- Cached in database after first parse

### Database Indexes
The migration adds indexes on:
- `device_type` (for filtering)
- `browser` (for analytics)
- `is_bot` (for bot filtering)

### Query Performance
```sql
-- Fast query (uses index)
SELECT * FROM activity_logs WHERE device_type = 'mobile';

-- Fast query (uses index)
SELECT * FROM activity_logs WHERE is_bot = 1;
```

## Future Enhancements

### Planned Features
1. **Geolocation**: Add country/city detection from IP
2. **Security Alerts**: Real-time notifications for suspicious patterns
3. **Analytics Dashboard**: Device/browser usage charts
4. **Rate Limiting**: Automatic IP bans for abuse
5. **Machine Learning**: Anomaly detection for unusual patterns

### Optional Integrations
- **MaxMind GeoIP2**: For accurate geolocation
- **IPQualityScore**: For VPN/proxy detection
- **Sentry**: For error tracking with device context

## Rollback Instructions

If you need to rollback this migration:

```sql
-- Remove new columns
ALTER TABLE activity_logs
DROP COLUMN device_type,
DROP COLUMN browser,
DROP COLUMN os,
DROP COLUMN is_bot,
DROP COLUMN real_ip;
```

**Warning**: This will permanently delete device/browser data from existing logs.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments in:
   - `api/UserAgentParser.php`
   - `api/IPHelper.php`
   - `api/ActivityLogger.php`
3. Test with different browsers/devices to isolate issues

## Summary

This enhancement transforms Activity Logs from simple audit trails into powerful forensic and debugging tools. The combination of device detection, browser identification, and IP tracking provides comprehensive visibility into system usage while maintaining privacy compliance.

**Key Benefits:**
- ✅ Better security monitoring
- ✅ Easier debugging of browser-specific issues
- ✅ Bot detection and filtering
- ✅ Privacy-compliant IP handling
- ✅ Enhanced audit trails for compliance

