<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\HmoProvider;
use App\Models\HmoClaim;
use App\Models\HmoPatientCoverage;
use App\Models\HmoReport;
use App\Models\Patient;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class EnhancedHmoReportController extends Controller
{
    /**
     * Display the enhanced HMO reports dashboard
     */
    public function index(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));
        $providerId = $request->get('hmo_provider_id');

        // Get summary statistics
        $summary = $this->getSummaryStatistics($dateFrom, $dateTo);
        
        // Get HMO providers
        $hmoProviders = HmoProvider::active()->get();
        
        // Get HMO transactions
        $hmoTransactions = $this->getHmoTransactions($dateFrom, $dateTo, $providerId);

        return Inertia::render('admin/billing/enhanced-hmo-report', [
            'summary' => $summary,
            'hmoProviders' => $hmoProviders,
            'hmoTransactions' => $hmoTransactions,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'hmo_provider_id' => $providerId,
            ]
        ]);
    }

    /**
     * Generate detailed HMO report
     */
    public function generateReport(Request $request)
    {
        $request->validate([
            'report_name' => 'required|string|max:255',
            'report_type' => 'required|in:summary,detailed,claims_analysis,provider_performance,patient_coverage',
            'period' => 'required|in:daily,weekly,monthly,quarterly,yearly,custom',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'hmo_provider_id' => 'nullable|exists:hmo_providers,id',
        ]);

        $report = HmoReport::create([
            'report_name' => $request->report_name,
            'report_type' => $request->report_type,
            'period' => $request->period,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'filters' => $request->only(['hmo_provider_id']),
            'created_by' => auth()->id(),
        ]);

        // Generate report data based on type
        switch ($request->report_type) {
            case 'summary':
                $this->generateSummaryReport($report);
                break;
            case 'detailed':
                $this->generateDetailedReport($report);
                break;
            case 'claims_analysis':
                $this->generateClaimsAnalysisReport($report);
                break;
            case 'provider_performance':
                $this->generateProviderPerformanceReport($report);
                break;
            case 'patient_coverage':
                $this->generatePatientCoverageReport($report);
                break;
        }

        return redirect()->route('admin.billing.hmo-report.show', $report->id)
            ->with('success', 'Report generated successfully');
    }

    /**
     * Display specific report
     */
    public function show(HmoReport $report)
    {
        $report->load('createdBy');
        
        return Inertia::render('admin/billing/hmo-report-detail', [
            'report' => $report,
        ]);
    }

    /**
     * Get HMO provider performance data
     */
    public function providerPerformance(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));
        $providerId = $request->get('hmo_provider_id');

        $query = HmoProvider::with(['claims' => function ($q) use ($dateFrom, $dateTo) {
            $q->whereBetween('submission_date', [$dateFrom, $dateTo]);
        }]);

        if ($providerId) {
            $query->where('id', $providerId);
        }

        $providers = $query->get()->map(function ($provider) {
            $claims = $provider->claims;
            
            return [
                'id' => $provider->id,
                'name' => $provider->name,
                'code' => $provider->code,
                'status' => $provider->status,
                'total_claims' => $claims->count(),
                'total_claim_amount' => $claims->sum('claim_amount'),
                'approved_claims' => $claims->where('status', 'approved')->count(),
                'approved_amount' => $claims->where('status', 'approved')->sum('approved_amount'),
                'rejected_claims' => $claims->where('status', 'rejected')->count(),
                'rejected_amount' => $claims->where('status', 'rejected')->sum('rejected_amount'),
                'approval_rate' => $claims->count() > 0 ? 
                    ($claims->where('status', 'approved')->count() / $claims->count()) * 100 : 0,
                'average_claim_amount' => $claims->count() > 0 ? 
                    $claims->sum('claim_amount') / $claims->count() : 0,
                'average_processing_days' => $this->getAverageProcessingDays($claims),
            ];
        });

        return response()->json([
            'providers' => $providers,
            'summary' => $this->getProviderPerformanceSummary($providers),
        ]);
    }

    /**
     * Get patient coverage analysis
     */
    public function patientCoverage(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));
        $providerId = $request->get('hmo_provider_id');

        $query = HmoPatientCoverage::with(['patient', 'hmoProvider', 'claims' => function ($q) use ($dateFrom, $dateTo) {
            $q->whereBetween('submission_date', [$dateFrom, $dateTo]);
        }]);

        if ($providerId) {
            $query->where('hmo_provider_id', $providerId);
        }

        $coverages = $query->get()->map(function ($coverage) {
            $claims = $coverage->claims;
            
            return [
                'id' => $coverage->id,
                'patient' => [
                    'id' => $coverage->patient->id,
                    'name' => $coverage->patient->first_name . ' ' . $coverage->patient->last_name,
                    'patient_no' => $coverage->patient->patient_no,
                ],
                'hmo_provider' => [
                    'id' => $coverage->hmoProvider->id,
                    'name' => $coverage->hmoProvider->name,
                ],
                'member_id' => $coverage->member_id,
                'annual_limit' => $coverage->annual_limit,
                'used_amount' => $coverage->used_amount,
                'remaining_amount' => $coverage->remaining_amount,
                'coverage_percentage' => $coverage->getCoveragePercentage(),
                'status' => $coverage->status,
                'is_active' => $coverage->isCoverageActive(),
                'has_remaining' => $coverage->hasRemainingCoverage(),
                'total_claims' => $claims->count(),
                'approved_claims' => $claims->where('status', 'approved')->count(),
                'total_claim_amount' => $claims->sum('claim_amount'),
                'approved_amount' => $claims->where('status', 'approved')->sum('approved_amount'),
            ];
        });

        return response()->json([
            'coverages' => $coverages,
            'summary' => $this->getPatientCoverageSummary($coverages),
        ]);
    }

    /**
     * Export HMO report data
     */
    public function exportData(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));
        $format = $request->get('format', 'excel');
        $providerId = $request->get('hmo_provider_id');

        try {
            // Get HMO data
            $hmoTransactions = $this->getHmoTransactions($dateFrom, $dateTo, $providerId);
            $hmoProviders = HmoProvider::all()->toArray();
            $summary = $this->getHmoSummary($dateFrom, $dateTo, $providerId);

            // Create filename
            $filename = 'hmo-report-' . $dateFrom . '-to-' . $dateTo . '-' . now()->format('Y-m-d-H-i-s');

            if ($format === 'excel') {
                $export = new \App\Exports\HmoReportExport(
                    $summary,
                    $hmoTransactions->toArray(),
                    $hmoProviders,
                    $dateFrom,
                    $dateTo
                );
                
                return Excel::download($export, $filename . '.xlsx');
            } elseif ($format === 'pdf') {
                return $this->exportToPdf($hmoTransactions, $hmoProviders, $summary, $dateFrom, $dateTo, $filename);
            } else {
                // For CSV format, we'll use a simpler approach
                return $this->exportToCsv($hmoTransactions, $hmoProviders, $summary, $filename);
            }
        } catch (\Exception $e) {
            \Log::error('HMO export failed: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export HMO report
     */
    public function export(Request $request, HmoReport $report)
    {
        $format = $request->get('format', 'excel');
        
        // Mark report as exported
        $report->markAsExported($format);
        
        // Here you would implement the actual export logic
        // For now, return a success message
        return response()->json([
            'message' => 'Report exported successfully',
            'export_format' => $format,
            'exported_at' => $report->exported_at,
        ]);
    }

    /**
     * Get HMO transactions with provider information
     */
    private function getHmoTransactions($dateFrom, $dateTo, $providerId = null)
    {
        $startDateTime = $dateFrom . ' 00:00:00';
        $endDateTime = $dateTo . ' 23:59:59';

        $query = BillingTransaction::with(['patient', 'doctor'])
            ->whereBetween('transaction_date', [$startDateTime, $endDateTime])
            ->where('payment_method', 'hmo')
            ->whereNotNull('hmo_provider');

        if ($providerId) {
            $query->where('hmo_provider', $providerId);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();

        return $transactions->map(function ($transaction) {
            $patient = $transaction->patient;
            $doctor = $transaction->doctor;
            
            return [
                'id' => $transaction->id,
                'transaction_id' => $transaction->transaction_id,
                'patient_name' => $patient ? $patient->first_name . ' ' . $patient->last_name : 'N/A',
                'doctor_name' => $doctor ? $doctor->name : 'N/A',
                'total_amount' => $transaction->total_amount,
                'hmo_provider' => $transaction->hmo_provider,
                'payment_method' => $transaction->payment_method,
                'status' => $transaction->status,
                'transaction_date' => $transaction->transaction_date->format('Y-m-d H:i:s'),
                'description' => $transaction->description,
            ];
        });
    }

    /**
     * Get HMO summary data
     */
    private function getHmoSummary($dateFrom, $dateTo, $providerId = null)
    {
        $startDateTime = $dateFrom . ' 00:00:00';
        $endDateTime = $dateTo . ' 23:59:59';

        // HMO Transactions
        $query = BillingTransaction::whereBetween('transaction_date', [$startDateTime, $endDateTime])
            ->where('payment_method', 'hmo')
            ->whereNotNull('hmo_provider');

        if ($providerId) {
            $query->where('hmo_provider', $providerId);
        }

        $hmoTransactions = $query->get();

        // HMO Claims
        $claimsQuery = HmoClaim::whereBetween('submission_date', [$startDateTime, $endDateTime]);
        if ($providerId) {
            $claimsQuery->where('hmo_provider_id', $providerId);
        }
        $claims = $claimsQuery->get();

        // HMO Providers
        $providersQuery = HmoProvider::query();
        if ($providerId) {
            $providersQuery->where('id', $providerId);
        }
        $hmoProviders = $providersQuery->get();

        // Patient Coverages
        $coveragesQuery = HmoPatientCoverage::where('status', 'active');
        if ($providerId) {
            $coveragesQuery->where('hmo_provider_id', $providerId);
        }
        $patientCoverages = $coveragesQuery->get();

        return [
            'total_hmo_revenue' => $hmoTransactions->sum('total_amount'),
            'total_hmo_transactions' => $hmoTransactions->count(),
            'total_claims_amount' => $claims->sum('claim_amount'),
            'total_approved_amount' => $claims->where('status', 'approved')->sum('approved_amount'),
            'total_rejected_amount' => $claims->where('status', 'rejected')->sum('rejected_amount'),
            'total_claims_count' => $claims->count(),
            'approved_claims_count' => $claims->where('status', 'approved')->count(),
            'rejected_claims_count' => $claims->where('status', 'rejected')->count(),
            'approval_rate' => $claims->count() > 0 ? ($claims->where('status', 'approved')->count() / $claims->count()) * 100 : 0,
            'hmo_providers_count' => $hmoProviders->count(),
            'active_patient_coverages' => $patientCoverages->count(),
            'pending_claims_count' => $claims->where('status', 'pending')->count(),
            'paid_claims_count' => $claims->where('status', 'paid')->count(),
        ];
    }

    /**
     * Get summary statistics
     */
    private function getSummaryStatistics($dateFrom, $dateTo)
    {
        $startDateTime = $dateFrom . ' 00:00:00';
        $endDateTime = $dateTo . ' 23:59:59';

        // HMO Transactions
        $hmoTransactions = BillingTransaction::whereBetween('transaction_date', [$startDateTime, $endDateTime])
            ->where('payment_method', 'hmo')
            ->whereNotNull('hmo_provider')
            ->get();

        return [
            'total_hmo_revenue' => $hmoTransactions->sum('total_amount'),
            'total_hmo_transactions' => $hmoTransactions->count(),
        ];
    }

    /**
     * Generate summary report
     */
    private function generateSummaryReport(HmoReport $report)
    {
        $summary = $report->generateSummaryData();
        $providerBreakdown = $report->generateProviderBreakdown();
        
        $report->update([
            'detailed_data' => [
                'summary' => $summary,
                'provider_breakdown' => $providerBreakdown,
            ]
        ]);
    }

    /**
     * Generate detailed report
     */
    private function generateDetailedReport(HmoReport $report)
    {
        // Implementation for detailed report
        $report->update([
            'detailed_data' => [
                'message' => 'Detailed report data will be implemented here'
            ]
        ]);
    }

    /**
     * Generate claims analysis report
     */
    private function generateClaimsAnalysisReport(HmoReport $report)
    {
        // Implementation for claims analysis report
        $report->update([
            'claims_analysis' => [
                'message' => 'Claims analysis report data will be implemented here'
            ]
        ]);
    }

    /**
     * Generate provider performance report
     */
    private function generateProviderPerformanceReport(HmoReport $report)
    {
        // Implementation for provider performance report
        $report->update([
            'provider_breakdown' => [
                'message' => 'Provider performance report data will be implemented here'
            ]
        ]);
    }

    /**
     * Generate patient coverage report
     */
    private function generatePatientCoverageReport(HmoReport $report)
    {
        // Implementation for patient coverage report
        $report->update([
            'detailed_data' => [
                'message' => 'Patient coverage report data will be implemented here'
            ]
        ]);
    }

    /**
     * Get average processing days for claims
     */
    private function getAverageProcessingDays($claims)
    {
        $processedClaims = $claims->filter(function ($claim) {
            return $claim->approval_date || $claim->review_date;
        });

        if ($processedClaims->isEmpty()) {
            return 0;
        }

        $totalDays = $processedClaims->sum(function ($claim) {
            $endDate = $claim->approval_date ?? $claim->review_date;
            return $claim->submission_date->diffInDays($endDate);
        });

        return $totalDays / $processedClaims->count();
    }

    /**
     * Get provider performance summary
     */
    private function getProviderPerformanceSummary($providers)
    {
        return [
            'total_providers' => $providers->count(),
            'total_claims' => $providers->sum('total_claims'),
            'total_claim_amount' => $providers->sum('total_claim_amount'),
            'total_approved_amount' => $providers->sum('approved_amount'),
            'average_approval_rate' => $providers->avg('approval_rate'),
            'average_processing_days' => $providers->avg('average_processing_days'),
        ];
    }

    /**
     * Get patient coverage summary
     */
    private function getPatientCoverageSummary($coverages)
    {
        return [
            'total_coverages' => $coverages->count(),
            'active_coverages' => $coverages->where('status', 'active')->count(),
            'expired_coverages' => $coverages->where('status', 'expired')->count(),
            'coverages_with_remaining' => $coverages->where('remaining_amount', '>', 0)->count(),
            'total_annual_limit' => $coverages->sum('annual_limit'),
            'total_used_amount' => $coverages->sum('used_amount'),
            'total_remaining_amount' => $coverages->sum('remaining_amount'),
            'average_coverage_percentage' => $coverages->avg('coverage_percentage'),
        ];
    }

    /**
     * Export to CSV format
     */
    private function exportToCsv($hmoTransactions, $hmoProviders, $summary, $filename)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
        ];

        $callback = function() use ($hmoTransactions, $hmoProviders, $summary) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for proper UTF-8 encoding in Excel
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Write summary data
            fputcsv($file, ['HMO Report Summary']);
            fputcsv($file, []);
            fputcsv($file, ['Metric', 'Value']);
            fputcsv($file, ['Total HMO Revenue', '₱' . number_format($summary['total_hmo_revenue'] ?? 0, 2)]);
            fputcsv($file, ['Total HMO Transactions', $summary['total_hmo_transactions'] ?? 0]);
            fputcsv($file, ['Total Claims Amount', '₱' . number_format($summary['total_claims_amount'] ?? 0, 2)]);
            fputcsv($file, ['Total Approved Amount', '₱' . number_format($summary['total_approved_amount'] ?? 0, 2)]);
            fputcsv($file, ['Total Rejected Amount', '₱' . number_format($summary['total_rejected_amount'] ?? 0, 2)]);
            fputcsv($file, ['Total Claims Count', $summary['total_claims_count'] ?? 0]);
            fputcsv($file, ['Approved Claims Count', $summary['approved_claims_count'] ?? 0]);
            fputcsv($file, ['Rejected Claims Count', $summary['rejected_claims_count'] ?? 0]);
            fputcsv($file, ['Approval Rate', number_format($summary['approval_rate'] ?? 0, 2) . '%']);
            fputcsv($file, []);
            fputcsv($file, []);

            // Write HMO transactions
            fputcsv($file, ['HMO Transactions']);
            fputcsv($file, ['Transaction ID', 'Patient Name', 'Doctor Name', 'HMO Provider', 'Amount', 'Status', 'Transaction Date']);
            foreach ($hmoTransactions as $transaction) {
                fputcsv($file, [
                    $transaction['transaction_id'] ?? '',
                    $transaction['patient_name'] ?? '',
                    $transaction['doctor_name'] ?? '',
                    $transaction['hmo_provider'] ?? '',
                    '₱' . number_format($transaction['total_amount'] ?? 0, 2),
                    ucfirst($transaction['status'] ?? ''),
                    isset($transaction['transaction_date']) ? \Carbon\Carbon::parse($transaction['transaction_date'])->format('M d, Y') : '',
                ]);
            }
            fputcsv($file, []);
            fputcsv($file, []);

            // Write HMO providers
            fputcsv($file, ['HMO Providers']);
            fputcsv($file, ['Provider Name', 'Code', 'Status', 'Contact Person', 'Contact Email', 'Contact Phone']);
            foreach ($hmoProviders as $provider) {
                fputcsv($file, [
                    $provider['name'] ?? '',
                    $provider['code'] ?? '',
                    ucfirst($provider['status'] ?? ''),
                    $provider['contact_person'] ?? '',
                    $provider['contact_email'] ?? '',
                    $provider['contact_phone'] ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export to PDF format
     */
    private function exportToPdf($hmoTransactions, $hmoProviders, $summary, $dateFrom, $dateTo, $filename)
    {
        try {
            $pdf = Pdf::loadView('reports.hmo-report-pdf', [
                'hmoTransactions' => $hmoTransactions->toArray(),
                'hmoProviders' => $hmoProviders,
                'summary' => $summary,
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo,
            ]);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'Arial'
            ]);

            return $pdf->download($filename . '.pdf');
        } catch (\Exception $e) {
            \Log::error('PDF export failed: ' . $e->getMessage());
            return response()->json(['error' => 'PDF export failed: ' . $e->getMessage()], 500);
        }
    }
}
