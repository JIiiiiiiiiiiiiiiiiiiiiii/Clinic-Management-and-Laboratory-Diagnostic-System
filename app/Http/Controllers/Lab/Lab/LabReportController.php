<?php

namespace App\Http\Controllers\Lab;

use App\Http\Controllers\Controller;
use App\Models\LabOrder;
use App\Models\LabResult;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class LabReportController extends Controller
{
    public function generateReport(Request $request, LabOrder $order)
    {
        $order->load(['patient', 'results.test']);

        $results = $order->results->groupBy('lab_test_id');

        $data = [
            'order' => $order,
            'patient' => $order->patient,
            'results' => $results,
            'generated_at' => now(),
            'clinic_name' => 'St. James Clinic',
            'clinic_address' => '123 Medical Street, Health City',
            'clinic_phone' => '(555) 123-4567',
        ];

        $pdf = Pdf::loadView('lab.reports.generic', $data);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download("lab_report_order_{$order->id}_{$order->patient->last_name}.pdf");
    }

    public function generateCBCReport(Request $request, LabOrder $order)
    {
        $order->load(['patient', 'results.test']);

        $cbcResult = $order->results->where('test.code', 'CBC')->first();

        if (!$cbcResult) {
            return back()->with('error', 'CBC test not found for this order.');
        }

        $data = [
            'order' => $order,
            'patient' => $order->patient,
            'result' => $cbcResult,
            'generated_at' => now(),
            'clinic_name' => 'St. James Clinic',
            'clinic_address' => '123 Medical Street, Health City',
            'clinic_phone' => '(555) 123-4567',
        ];

        $pdf = Pdf::loadView('lab.reports.cbc', $data);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download("cbc_report_order_{$order->id}_{$order->patient->last_name}.pdf");
    }

    public function generateUrinalysisReport(Request $request, LabOrder $order)
    {
        $order->load(['patient', 'results.test']);

        $urinalysisResult = $order->results->where('test.code', 'URINALYSIS')->first();

        if (!$urinalysisResult) {
            return back()->with('error', 'Urinalysis test not found for this order.');
        }

        $data = [
            'order' => $order,
            'patient' => $order->patient,
            'result' => $urinalysisResult,
            'generated_at' => now(),
            'clinic_name' => 'St. James Clinic',
            'clinic_address' => '123 Medical Street, Health City',
            'clinic_phone' => '(555) 123-4567',
        ];

        $pdf = Pdf::loadView('lab.reports.urinalysis', $data);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download("urinalysis_report_order_{$order->id}_{$order->patient->last_name}.pdf");
    }

    public function generateFecalysisReport(Request $request, LabOrder $order)
    {
        $order->load(['patient', 'results.test']);

        $fecalysisResult = $order->results->where('test.code', 'FECALYSIS')->first();

        if (!$fecalysisResult) {
            return back()->with('error', 'Fecalysis test not found for this order.');
        }

        $data = [
            'order' => $order,
            'patient' => $order->patient,
            'result' => $fecalysisResult,
            'generated_at' => now(),
            'clinic_name' => 'St. James Clinic',
            'clinic_address' => '123 Medical Street, Health City',
            'clinic_phone' => '(555) 123-4567',
        ];

        $pdf = Pdf::loadView('lab.reports.fecalysis', $data);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download("fecalysis_report_order_{$order->id}_{$order->patient->last_name}.pdf");
    }
}
