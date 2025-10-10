# Inventory In/Out Movement Guide

## Current Issue
The "Incoming & Outgoing" report is not showing data because:
1. **Date Range**: The default "This Month" filter might not include your movements
2. **No Recent Movements**: You might not have movements in the current month
3. **Data Structure**: The system needs proper IN/OUT movement records

## How to Create In/Out Movements

### Method 1: Using the Inventory Interface
1. **Go to Inventory Management** → Select any item
2. **Click "Add Stock" or "Remove Stock"** buttons
3. **Fill in the movement form**:
   - **Movement Type**: IN (for incoming) or OUT (for outgoing)
   - **Quantity**: Number of units
   - **Remarks**: Description (e.g., "Stock received", "Used in procedure")

### Method 2: Using the Movement Modal
1. **In any inventory page**, look for the movement buttons
2. **Click the movement button** (usually shows + or - icons)
3. **Select movement type**:
   - **IN**: Add Stock (incoming)
   - **OUT**: Remove Stock (outgoing)
4. **Enter quantity and remarks**

### Method 3: Programmatically (for testing)
I've created a command that adds sample movements:
```bash
php artisan inventory:create-sample-movements
```

## How to Test the In/Out Report

### Step 1: Generate the Report
1. **Go to Inventory Reports**
2. **Select Report Type**: "Incoming and Outgoing Movements"
3. **Choose Date Range**: 
   - Try "This Year" first (to see all movements)
   - Or "Custom Range" with a wider date range
4. **Click "Generate Report"**

### Step 2: Check the Data
The report should show:
- **Total Movements**: Count of all IN/OUT movements
- **Incoming Movements**: Sum of IN movement quantities
- **Outgoing Movements**: Sum of OUT movement quantities
- **Department Breakdown**: Movements by Doctor/Nurse vs Med Tech

### Step 3: Export the Report
1. **After generating**, you should see "Report Generated" status
2. **Click "Export to PDF"** or "Export to Excel"
3. **The exported file should match the generated report type**

## Troubleshooting

### If No Data Shows:
1. **Check Date Range**: Use "This Year" or a custom range that includes your movements
2. **Check Movements Exist**: Run `php artisan tinker` and check:
   ```php
   echo 'Total Movements: ' . App\Models\InventoryMovement::count();
   echo 'IN Movements: ' . App\Models\InventoryMovement::where('movement_type', 'IN')->count();
   echo 'OUT Movements: ' . App\Models\InventoryMovement::where('movement_type', 'OUT')->count();
   ```

### If Wrong Report Type Exports:
- The fix I implemented should prevent this
- The export now uses the exact report that was generated
- Check the server logs for debugging info

## Sample Data Creation

I've created sample movements for testing. To create more:

```bash
# Create sample movements for testing
php artisan inventory:create-sample-movements

# Check what was created
php artisan tinker --execute="
echo 'Total Movements: ' . App\Models\InventoryMovement::count() . PHP_EOL;
echo 'IN: ' . App\Models\InventoryMovement::where('movement_type', 'IN')->count() . PHP_EOL;
echo 'OUT: ' . App\Models\InventoryMovement::where('movement_type', 'OUT')->count() . PHP_EOL;
"
```

## Expected Results

### For "Incoming & Outgoing" Report:
- **Total Items**: Number of movement records
- **Incoming Movements**: Sum of IN movement quantities  
- **Outgoing Movements**: Sum of OUT movement quantities
- **Department Stats**: Breakdown by Doctor/Nurse vs Med Tech

### For "Consumed & Rejected" Report:
- **Total Items**: Number of inventory items
- **Items Consumed**: Sum of consumed quantities
- **Items Rejected**: Sum of rejected quantities
- **Low Stock**: Items below threshold

## Next Steps

1. **Test with "This Year" date range** to see all movements
2. **Create some real movements** using the inventory interface
3. **Try both report types** to ensure they work correctly
4. **Export both types** to verify the fix works

The system should now properly track which report was generated and export the correct type!
