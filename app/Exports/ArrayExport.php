<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class ArrayExport implements FromArray, WithHeadings, WithTitle
{
    protected array $rows;
    protected string $title;

    public function __construct(array $rows, string $title = 'Export')
    {
        $this->rows = $rows;
        $this->title = $title;
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function headings(): array
    {
        return count($this->rows) ? array_keys($this->rows[0]) : [];
    }

    public function title(): string
    {
        return $this->title;
    }
}


