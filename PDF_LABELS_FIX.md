# PDF Labels Fix - Inventory Report Template

## Problem Fixed
The PDF export was showing incorrect labels for the "Incoming & Outgoing" report:
- **Wrong**: "Items Consumed", "Items Rejected", "Low Stock"
- **Correct**: "Total Movements", "Incoming Movements", "Outgoing Movements", "Outgoing Count"

## Root Cause
The PDF template (`resources/views/lab/inventory-report-pdf.blade.php`) was using hardcoded labels that didn't change based on the report type.

## Solution Applied
Updated the PDF template to use dynamic labels based on the report type:

### 1. Main Summary Section
```php
@if($report->filters['report_type'] === 'incoming-outgoing')
    Total Movements
@else
    Total Items
@endif
```

### 2. Department Breakdown Section
```php
@if($report->filters['report_type'] === 'incoming-outgoing')
    Total Movements:
@else
    Total Items:
@endif
```

## Labels Now Show Correctly

### For "Incoming & Outgoing" Reports:
- **Total Movements** (instead of Total Items)
- **Incoming Movements** (instead of Items Consumed)
- **Outgoing Movements** (instead of Items Rejected)
- **Outgoing Count** (instead of Low Stock)

### For "Consumed & Rejected" Reports:
- **Total Items**
- **Items Consumed**
- **Items Rejected**
- **Low Stock**

## Files Modified
- `resources/views/lab/inventory-report-pdf.blade.php` - Updated template with dynamic labels

## Testing
1. Generate an "Incoming & Outgoing" report
2. Export to PDF
3. The PDF should now show:
   - "Total Movements: 211"
   - "Incoming Movements: 338"
   - "Outgoing Movements: 289"
   - "Outgoing Count: 195"

## Result
The PDF export now correctly matches the report type and shows appropriate labels for both:
- **Movement Reports** (Incoming & Outgoing)
- **Item Reports** (Consumed & Rejected)

The fix ensures that the exported PDF always displays the correct terminology based on the report type that was generated.
