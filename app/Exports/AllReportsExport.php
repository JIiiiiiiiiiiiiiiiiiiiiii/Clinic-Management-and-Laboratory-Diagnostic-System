<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;

class AllReportsExport implements WithMultipleSheets
{
    protected $allReportsData;

    public function __construct($allReportsData)
    {
        $this->allReportsData = $allReportsData;
    }

    public function sheets(): array
    {
        $sheets = [];
        
        foreach ($this->allReportsData as $reportName => $data) {
            $sheets[] = new ReportSheet($data, $reportName);
        }

        return $sheets;
    }
}

class ReportSheet implements FromArray, WithTitle
{
    protected $data;
    protected $title;

    public function __construct($data, $title)
    {
        $this->data = $data;
        $this->title = $title;
    }

    public function array(): array
    {
        return $this->data;
    }

    public function title(): string
    {
        return $this->title;
    }
}
