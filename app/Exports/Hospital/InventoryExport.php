<?php

namespace App\Exports\Hospital;

use App\Models\Supply\Supply as Inventory;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InventoryExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $dateRange;

    public function __construct($dateRange)
    {
        $this->dateRange = $dateRange;
    }

    public function collection()
    {
        return Inventory::with(['transactions'])
            ->whereBetween('created_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->get();
    }

    public function headings(): array
    {
        return [
            'Supply ID',
            'Name',
            'Description',
            'Category',
            'Unit',
            'Current Stock',
            'Minimum Stock',
            'Maximum Stock',
            'Unit Price',
            'Total Value',
            'Status',
            'Created At'
        ];
    }

    public function map($inventory): array
    {
        $currentStock = $inventory->transactions->sum('quantity');
        $totalValue = $currentStock * $inventory->unit_price;

        return [
            $inventory->id,
            $inventory->name,
            $inventory->description,
            $inventory->category,
            $inventory->unit,
            $currentStock,
            $inventory->minimum_stock,
            $inventory->maximum_stock,
            number_format($inventory->unit_price, 2),
            number_format($totalValue, 2),
            $currentStock <= $inventory->minimum_stock ? 'Low Stock' : 'In Stock',
            $inventory->created_at->format('Y-m-d H:i:s')
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 15,
            'B' => 25,
            'C' => 30,
            'D' => 20,
            'E' => 15,
            'F' => 15,
            'G' => 15,
            'H' => 15,
            'I' => 15,
            'J' => 15,
            'K' => 15,
            'L' => 20,
        ];
    }
}
