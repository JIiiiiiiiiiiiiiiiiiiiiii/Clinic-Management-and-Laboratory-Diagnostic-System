<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ArrayExport extends BaseExport implements FromArray, WithHeadings
{
    protected array $rows;
    protected string $title;

    public function __construct(array $rows, string $title = 'Export')
    {
        parent::__construct($title);
        $this->rows = $rows;
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function headings(): array
    {
        return count($this->rows) ? array_keys($this->rows[0]) : [];
    }

}


