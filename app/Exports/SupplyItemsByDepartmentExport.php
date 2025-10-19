<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SupplyItemsByDepartmentExport implements FromArray, WithHeadings, WithStyles, WithTitle
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function array(): array
    {
        $items = [];
        
        foreach ($this->data['all_items'] as $item) {
            $items[] = [
                $item['item_name'],
                $item['category'],
                $item['assigned_to'],
                $item['stock'],
                $item['status'],
            ];
        }
        
        return $items;
    }

    public function headings(): array
    {
        return [
            'Item Name',
            'Category',
            'Department',
            'Current Stock',
            'Status',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text.
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Supply Items by Department';
    }
}
