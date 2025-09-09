<?php

namespace App\Http\Controllers\Lab;

use App\Exports\LabOrderResultsExport;
use App\Exports\LabOrdersExport;
use App\Http\Controllers\Controller;
use App\Models\LabOrder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class LabExportController extends Controller
{
    private function buildHtmlTable(string $title, array $rows): string
    {
        $headings = count($rows) ? array_keys($rows[0]) : [];
        $thead = '';
        if ($headings) {
            $thead .= '<tr>';
            foreach ($headings as $h) {
                $thead .= '<th style="border:1px solid #ddd;padding:6px;text-align:left;white-space:nowrap">' . e($h) . '</th>';
            }
            $thead .= '</tr>';
        }
        $tbody = '';
        foreach ($rows as $row) {
            $tbody .= '<tr>';
            foreach ($headings as $h) {
                $val = $row[$h] ?? '';
                if (is_float($val) || is_int($val)) {
                    $val = (string) $val;
                }
                $tbody .= '<td style="border:1px solid #ddd;padding:6px">' . e((string) $val) . '</td>';
            }
            $tbody .= '</tr>';
        }
        return '<!doctype html><html><head><meta charset="utf-8"><title>' . e($title) . '</title></head><body>' .
            '<h2 style="font-family:Arial,Helvetica,sans-serif;margin:0 0 12px 0">' . e($title) . '</h2>' .
            '<table style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:12px">' .
            '<thead style="background:#f3f4f6">' . $thead . '</thead>' .
            '<tbody>' . $tbody . '</tbody>' .
            '</table>' .
            '</body></html>';
    }
    public function exportOrders(Request $request)
    {
        $format = strtolower((string) $request->get('format', 'excel'));
        $export = new LabOrdersExport();
        if (in_array($format, ['pdf', 'word', 'doc', 'docx'])) {
            $rows = $export->collection()->map(function ($row) {
                return $row->toArray();
            })->toArray();
            $html = $this->buildHtmlTable('Lab Orders', $rows);
            if ($format === 'pdf') {
                return Pdf::loadHTML($html)->download('lab_orders_' . now()->format('Ymd_His') . '.pdf');
            }
            return response($html)
                ->header('Content-Type', 'application/msword')
                ->header('Content-Disposition', 'attachment; filename="lab_orders_' . now()->format('Ymd_His') . '.doc"');
        }
        return Excel::download($export, 'lab_orders_' . now()->format('Ymd_His') . '.xlsx');
    }

    public function exportOrderResults(Request $request, LabOrder $order)
    {
        $order->load(['patient', 'labTests', 'results.test']);
        $format = strtolower((string) $request->get('format', 'excel'));
        $export = new LabOrderResultsExport($order);
        if (in_array($format, ['pdf', 'word', 'doc', 'docx'])) {
            $rows = $export->collection()->map(function ($row) {
                return $row->toArray();
            })->toArray();
            $html = $this->buildHtmlTable('Lab Order Results', $rows);
            if ($format === 'pdf') {
                return Pdf::loadHTML($html)->download('lab_order_' . $order->id . '_results_' . now()->format('Ymd_His') . '.pdf');
            }
            return response($html)
                ->header('Content-Type', 'application/msword')
                ->header('Content-Disposition', 'attachment; filename="lab_order_' . $order->id . '_results_' . now()->format('Ymd_His') . '.doc"');
        }
        return Excel::download($export, 'lab_order_' . $order->id . '_results_' . now()->format('Ymd_His') . '.xlsx');
    }
}


