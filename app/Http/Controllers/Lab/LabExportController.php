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
                $thead .= '<th style="border:1px solid #000;padding:8px;text-align:left;white-space:nowrap;background-color:#f0f0f0;font-weight:bold">' . e($h) . '</th>';
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
                $tbody .= '<td style="border:1px solid #000;padding:8px;vertical-align:top">' . e((string) $val) . '</td>';
            }
            $tbody .= '</tr>';
        }
        return '<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>' . e($title) . '</title><meta name="ProgId" content="Word.Document"><meta name="Generator" content="Microsoft Word 15"><meta name="Originator" content="Microsoft Word 15"></head><body>' .
            '<h2 style="font-family:Arial,Helvetica,sans-serif;margin:0 0 16px 0;color:#333">' . e($title) . '</h2>' .
            '<table style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;width:100%;mso-table-lspace:0pt;mso-table-rspace:0pt">' .
            '<thead>' . $thead . '</thead>' .
            '<tbody>' . $tbody . '</tbody>' .
            '</table>' .
            '<p style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#666;margin-top:20px">Generated on ' . now()->format('F j, Y \a\t g:i A') . '</p>' .
            '</body></html>';
    }
    public function exportOrders(Request $request)
    {
        $format = strtolower((string) $request->get('format', 'excel'));
        $export = new LabOrdersExport();
        if (in_array($format, ['pdf', 'word', 'doc', 'docx'])) {
            $rows = $export->collection()->map(function ($row) {
                return (array) $row;
            })->toArray();
            $html = $this->buildHtmlTable('Lab Orders', $rows);
            if ($format === 'pdf') {
                return Pdf::loadHTML($html)->download('lab_orders_' . now()->format('Ymd_His') . '.pdf');
            }
            return response($html)
                ->header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                ->header('Content-Disposition', 'attachment; filename="lab_orders_' . now()->format('Ymd_His') . '.docx"');
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
                return (array) $row;
            })->toArray();
            $html = $this->buildHtmlTable('Lab Order Results', $rows);
            if ($format === 'pdf') {
                return Pdf::loadHTML($html)->download('lab_order_' . $order->id . '_results_' . now()->format('Ymd_His') . '.pdf');
            }
            return response($html)
                ->header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                ->header('Content-Disposition', 'attachment; filename="lab_order_' . $order->id . '_results_' . now()->format('Ymd_His') . '.docx"');
        }
        return Excel::download($export, 'lab_order_' . $order->id . '_results_' . now()->format('Ymd_His') . '.xlsx');
    }
}


