<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

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

class ReportSheet extends BaseExport implements FromArray
{
    protected $data;

    public function __construct($data, $title)
    {
        parent::__construct($title);
        $this->data = $data;
    }

    public function array(): array
    {
        return $this->data;
    }
}
