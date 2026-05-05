# Incident Report Type-Specific Fields

## Summary

Added conditional type-specific fields to the incident report form, similar to the hardware issue type. Now when users select different incident types (Software, Network, Security, Facility), they see relevant fields specific to that type.

## What Changed

### Before
- Only Hardware incidents had type-specific fields (Hardware Type, Damage Description)
- Other incident types (Software, Network, Security, Facility) had no specific fields

### After
All incident types now have type-specific fields that appear conditionally:

#### 1. Hardware Issue
- **Hardware Type**: Computer, Monitor, Keyboard, Mouse, Printer, Scanner, Projector, Router, Switch, Cable, Other
- **Damage Description**: Free text field for damage details

#### 2. Software Issue (NEW!)
- **Software Type**: Operating System, Application, Browser, Antivirus, Office Suite, Database, Development Tools, Driver, Update/Patch, License, Other
- **Issue Type**: Crash, Freeze, Slow Performance, Error Message, Won't Open, Compatibility, Missing Features, Corrupted Files, Other

#### 3. Network Issue (NEW!)
- **Network Type**: WiFi, Ethernet, Internet Connection, Server Connection, VPN, Network Printer, File Sharing, Other
- **Issue Type**: No Connection, Slow Speed, Intermittent Connection, Can't Connect, Limited Access, DNS Error, Connection Timeout, Other

#### 4. Security Incident (NEW!)
- **Security Type**: Malware/Virus, Phishing, Unauthorized Access, Data Breach, Suspicious Activity, Password Issue, Physical Security, Policy Violation, Other
- **Security Details**: Free text field for security incident details

#### 5. Facility Issue (NEW!)
- **Facility Type**: Electrical, Lighting, HVAC/Air Conditioning, Plumbing, Furniture, Door/Lock, Window, Floor/Ceiling, Cleanliness, Safety Hazard, Other
- **Issue Description**: Free text field for facility issue details

## Database Changes

### New Columns Added
```sql
-- Software fields
software_type VARCHAR(100) NULL
software_issue VARCHAR(100) NULL

-- Network fields
network_type VARCHAR(100) NULL
network_issue VARCHAR(100) NULL

-- Security fields
security_type VARCHAR(100) NULL
security_details TEXT NULL

-- Facility fields
facility_type VARCHAR(100) NULL
facility_issue TEXT NULL
```

### Migration File
`database/migrations/007_add_incident_type_fields.sql`

## How It Works

### Form Behavior
1. User selects an **Incident Type** (Hardware, Software, Network, Security, Facility, Other)
2. Based on the selection, **type-specific fields appear** below the incident type dropdown
3. These fields are **required** when their incident type is selected
4. Fields are **hidden** when a different incident type is selected

### Example Flow

**Creating a Software Issue:**
1. Select "Software Issue" as Incident Type
2. Two new fields appear:
   - Software Type (dropdown)
   - Issue Type (dropdown)
3. Fill in the required fields
4. Submit the report

**Creating a Network Issue:**
1. Select "Network Issue" as Incident Type
2. Two new fields appear:
   - Network Type (dropdown)
   - Issue Type (dropdown)
3. Fill in the required fields
4. Submit the report

## View Details

When viewing an incident report, the type-specific details are displayed:

### Hardware Incident
```
Hardware Type: Monitor
Damage Description: Screen cracked, not powering on
```

### Software Incident
```
Software Type: Operating System
Issue Type: Application Crash
```

### Network Incident
```
Network Type: WiFi/Wireless
Issue Type: No Connection
```

### Security Incident
```
Security Type: Malware/Virus
Security Details: Suspicious email received with attachment
```

### Facility Incident
```
Facility Type: Electrical
Issue Description: Power outlet not working in Lab 5
```

## Benefits

### Better Categorization
- More specific incident tracking
- Easier to identify patterns
- Better reporting and analytics

### Improved Workflow
- Relevant fields for each incident type
- Faster incident resolution
- Better communication between users and admins

### Data Quality
- Structured data instead of free text
- Consistent categorization
- Easier to search and filter

## Files Modified

1. **Frontend**
   - `src/pages/IncidentReports.tsx` - Added conditional fields for all incident types

2. **Database**
   - `database/migrations/007_add_incident_type_fields.sql` - Added new columns

3. **Backend** (No changes needed)
   - `api/incident_reports.php` - Already handles dynamic fields

## Testing

### Test Each Incident Type

1. **Hardware Issue**
   - Create incident with Hardware type
   - Select hardware type (e.g., Monitor)
   - Enter damage description
   - Verify it saves and displays correctly

2. **Software Issue**
   - Create incident with Software type
   - Select software type (e.g., Operating System)
   - Select issue type (e.g., Crash)
   - Verify it saves and displays correctly

3. **Network Issue**
   - Create incident with Network type
   - Select network type (e.g., WiFi)
   - Select issue type (e.g., No Connection)
   - Verify it saves and displays correctly

4. **Security Incident**
   - Create incident with Security type
   - Select security type (e.g., Malware/Virus)
   - Enter security details
   - Verify it saves and displays correctly

5. **Facility Issue**
   - Create incident with Facility type
   - Select facility type (e.g., Electrical)
   - Enter issue description
   - Verify it saves and displays correctly

### Verification Steps

1. ✅ Create incident with each type
2. ✅ Verify type-specific fields appear
3. ✅ Verify fields are required
4. ✅ Submit and check database
5. ✅ View incident details
6. ✅ Edit incident and verify fields populate
7. ✅ Check that fields hide when changing incident type

## Example Incidents

### Software Issue Example
```
Incident Name: Microsoft Word Crashing
Incident Type: Software Issue
Software Type: Office Suite
Issue Type: Application Crash
Description: Microsoft Word crashes when opening large documents
Severity: Medium
Location: Computer Lab 1
```

### Network Issue Example
```
Incident Name: WiFi Not Working
Incident Type: Network Issue
Network Type: WiFi/Wireless
Issue Type: No Connection
Description: Unable to connect to campus WiFi in Building A
Severity: High
Location: Building A - 2nd Floor
```

### Security Incident Example
```
Incident Name: Suspicious Email
Incident Type: Security Incident
Security Type: Phishing Attempt
Security Details: Received email claiming to be from IT asking for password
Description: Phishing email received by multiple students
Severity: Critical
Location: N/A
```

### Facility Issue Example
```
Incident Name: Broken Chair
Incident Type: Facility Issue
Facility Type: Furniture
Issue Description: Chair leg broken, unsafe to use
Description: Student chair in Lab 3 has broken leg
Severity: Medium
Location: Computer Lab 3
```

## Summary

✅ All incident types now have type-specific fields  
✅ Fields appear conditionally based on incident type  
✅ Database schema updated with new columns  
✅ View details shows type-specific information  
✅ Form validation ensures required fields are filled  
✅ Consistent with existing hardware issue functionality  

The incident report system now provides structured, type-specific data collection for all incident types, making it easier to track, categorize, and resolve issues in the laboratory.
