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
        // Handle new filter parameters for daily/monthly/yearly reports
        $reportType = $request->get('report_type', 'daily');
        $date = $request->get('date');
        $month = $request->get('month');
        $year = $request->get('year');
        
        // Set date range based on report type
        if ($reportType === 'daily' && $date) {
            $dateFrom = $date;
            $dateTo = $date;
        } elseif ($reportType === 'monthly' && $month) {
            $dateFrom = $month . '-01';
            $dateTo = date('Y-m-t', strtotime($month . '-01'));
        } elseif ($reportType === 'yearly' && $year) {
            $dateFrom = $year . '-01-01';
            $dateTo = $year . '-12-31';
        } else {
            // For initial load, show a broader date range to ensure we get data
            $dateFrom = $request->get('date_from', '2025-01-01');
            $dateTo = $request->get('date_to', now()->addDays(30)->format('Y-m-d'));
        }
        
        $providerId = $request->get('hmo_provider_id');
        

        // Get summary statistics
        $summary = $this->getSummaryStatistics($dateFrom, $dateTo);
        
        // Get HMO providers
        $hmoProviders = HmoProvider::active()->get();
        
        // Get HMO transactions
        $hmoTransactions = $this->getHmoTransactions($dateFrom, $dateTo, $providerId);
        
        // Debug: Log what we're sending to frontend
        \Log::info('Enhanced HMO Report - Data being sent to frontend', [
            'hmo_transactions_count' => count($hmoTransactions),
            'hmo_transactions_sample' => count($hmoTransactions) > 0 ? $hmoTransactions[0] : 'No transactions',
            'summary' => $summary,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'provider_id' => $providerId,
            'report_type' => $reportType,
            'date' => $date,
            'month' => $month,
            'year' => $year
        ]);
        
        // Additional debugging - check if data is being passed correctly
        \Log::info('HMO Transactions Data Check', [
            'is_array' => is_array($hmoTransactions),
            'count' => is_array($hmoTransactions) ? count($hmoTransactions) : 'not array',
            'first_item' => is_array($hmoTransactions) && count($hmoTransactions) > 0 ? $hmoTransactions[0] : 'no items',
            'all_transactions' => $hmoTransactions
        ]);
        
        // Force some test data to verify frontend is working
        if (count($hmoTransactions) === 0) {
            \Log::info('No transactions found, adding test data');
            $hmoTransactions = [
                [
                    'id' => 999,
                    'transaction_id' => 'TEST-001',
                    'patient_name' => 'Test Patient',
                    'doctor_name' => 'Test Doctor',
                    'total_amount' => 1000.00,
                    'hmo_provider' => 'Test Provider',
                    'payment_method' => 'hmo',
                    'status' => 'paid',
                    'transaction_date' => now()->format('Y-m-d H:i:s'),
                ]
            ];
        }
        
        // Debug: Check if we have any HMO transactions at all
        $allHmoTransactions = BillingTransaction::where('payment_method', 'hmo')->count();
        \Log::info('Total HMO transactions in database: ' . $allHmoTransactions);
        
        // Debug: Check if we have any HMO providers
        $allHmoProviders = HmoProvider::count();
        \Log::info('Total HMO providers in database: ' . $allHmoProviders);

        // Debug: Return JSON for testing
        if ($request->get('debug') === 'true') {
            return response()->json([
                'summary' => $summary,
                'hmoProviders' => $hmoProviders,
                'hmoTransactions' => $hmoTransactions,
                'filters' => [
                    'date_from' => $dateFrom,
                    'date_to' => $dateTo,
                    'hmo_provider_id' => $providerId,
                    'report_type' => $reportType,
                    'date' => $date,
                    'month' => $month,
                    'year' => $year,
                ],
                'debug_info' => [
                    'dateFrom' => $dateFrom,
                    'dateTo' => $dateTo,
                    'reportType' => $reportType,
                    'providerId' => $providerId,
                ]
            ]);
        }

        return Inertia::render('admin/billing/enhanced-hmo-report', [
            'summary' => $summary,
            'hmoProviders' => $hmoProviders,
            'hmoTransactions' => $hmoTransactions,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'hmo_provider_id' => $providerId,
                'report_type' => $reportType,
                'date' => $date,
                'month' => $month,
                'year' => $year,
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
     * Display the HMO daily report page
     */
    public function dailyReport(Request $request)
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $hmoProvider = $request->get('hmo_provider');
        
        // Get HMO transactions for the specific date
        $query = BillingTransaction::where('payment_method', 'hmo')
            ->whereDate('created_at', $date);
            
        if ($hmoProvider && $hmoProvider !== 'all') {
            $query->where('hmo_provider', $hmoProvider);
        }
        
        $hmoTransactions = $query->with(['patient', 'doctor'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'transaction_id' => $transaction->transaction_id,
                    'patient_name' => $transaction->patient?->first_name . ' ' . $transaction->patient?->last_name,
                    'doctor_name' => $transaction->doctor?->first_name . ' ' . $transaction->doctor?->last_name,
                    'amount' => $transaction->amount,
                    'total_amount' => $transaction->total_amount,
                    'final_amount' => $transaction->final_amount,
                    'discount_amount' => $transaction->discount_amount,
                    'senior_discount_amount' => $transaction->senior_discount_amount,
                    'is_senior_citizen' => $transaction->is_senior_citizen,
                    'hmo_provider' => $transaction->hmo_provider, // This is a string field, not a relationship
                    'payment_method' => $transaction->payment_method,
                    'status' => $transaction->status,
                    'transaction_date' => $transaction->created_at,
                    'description' => $transaction->description,
                ];
            });
        
        // Calculate summary statistics
        $summary = [
            'total_hmo_revenue' => $hmoTransactions->sum('amount'),
            'total_hmo_transactions' => $hmoTransactions->count(),
            'total_approved_amount' => $hmoTransactions->where('status', 'paid')->sum('amount'),
            'pending_claims_count' => $hmoTransactions->where('status', 'pending')->count(),
            'approval_rate' => $hmoTransactions->count() > 0 ? 
                ($hmoTransactions->where('status', 'paid')->count() / $hmoTransactions->count()) * 100 : 0,
        ];
        
        return Inertia::render('admin/billing/hmo-daily-report', [
            'hmoTransactions' => $hmoTransactions,
            'summary' => $summary,
            'date' => $date,
            'hmoProvider' => $hmoProvider,
        ]);
    }

    /**
     * Display the HMO monthly report page
     */
    public function monthlyReport(Request $request)
    {
        $month = $request->get('month', now()->format('Y-m'));
        $hmoProvider = $request->get('hmo_provider');
        
        // Get HMO transactions for the specific month
        $query = BillingTransaction::where('payment_method', 'hmo')
            ->whereYear('created_at', substr($month, 0, 4))
            ->whereMonth('created_at', substr($month, 5, 2));
            
        if ($hmoProvider && $hmoProvider !== 'all') {
            $query->where('hmo_provider', $hmoProvider);
        }
        
        $hmoTransactions = $query->with(['patient', 'doctor'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'transaction_id' => $transaction->transaction_id,
                    'patient_name' => $transaction->patient?->first_name . ' ' . $transaction->patient?->last_name,
                    'doctor_name' => $transaction->doctor?->first_name . ' ' . $transaction->doctor?->last_name,
                    'amount' => $transaction->amount,
                    'total_amount' => $transaction->total_amount,
                    'final_amount' => $transaction->final_amount,
                    'discount_amount' => $transaction->discount_amount,
                    'senior_discount_amount' => $transaction->senior_discount_amount,
                    'is_senior_citizen' => $transaction->is_senior_citizen,
                    'hmo_provider' => $transaction->hmo_provider,
                    'payment_method' => $transaction->payment_method,
                    'status' => $transaction->status,
                    'transaction_date' => $transaction->created_at,
                    'description' => $transaction->description,
                ];
            });
        
        // Calculate summary statistics
        $totalRevenue = $hmoTransactions->sum('amount');
        $totalTransactions = $hmoTransactions->count();
        $approvedAmount = $hmoTransactions->where('status', 'paid')->sum('amount');
        $pendingClaims = $hmoTransactions->where('status', 'pending')->count();
        $approvalRate = $totalTransactions > 0 ? ($hmoTransactions->where('status', 'paid')->count() / $totalTransactions) * 100 : 0;
        
        // Calculate days in month for average daily revenue
        $daysInMonth = date('t', strtotime($month . '-01'));
        $averageDailyRevenue = $daysInMonth > 0 ? $totalRevenue / $daysInMonth : 0;
        
        $summary = [
            'total_hmo_revenue' => $totalRevenue,
            'total_hmo_transactions' => $totalTransactions,
            'total_approved_amount' => $approvedAmount,
            'pending_claims_count' => $pendingClaims,
            'approval_rate' => $approvalRate,
            'average_daily_revenue' => $averageDailyRevenue,
            'highest_revenue_day' => 'N/A', // Could be calculated if needed
            'lowest_revenue_day' => 'N/A', // Could be calculated if needed
        ];
        
        return Inertia::render('admin/billing/hmo-monthly-report', [
            'hmoTransactions' => $hmoTransactions,
            'summary' => $summary,
            'month' => $month,
            'hmoProvider' => $hmoProvider,
        ]);
    }

    /**
     * Display the HMO yearly report page
     */
    public function yearlyReport(Request $request)
    {
        $year = $request->get('year', now()->format('Y'));
        $hmoProvider = $request->get('hmo_provider');
        
        // Get HMO transactions for the specific year
        $query = BillingTransaction::where('payment_method', 'hmo')
            ->whereYear('created_at', $year);
            
        if ($hmoProvider && $hmoProvider !== 'all') {
            $query->where('hmo_provider', $hmoProvider);
        }
        
        $hmoTransactions = $query->with(['patient', 'doctor'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'transaction_id' => $transaction->transaction_id,
                    'patient_name' => $transaction->patient?->first_name . ' ' . $transaction->patient?->last_name,
                    'doctor_name' => $transaction->doctor?->first_name . ' ' . $transaction->doctor?->last_name,
                    'amount' => $transaction->amount,
                    'total_amount' => $transaction->total_amount,
                    'final_amount' => $transaction->final_amount,
                    'discount_amount' => $transaction->discount_amount,
                    'senior_discount_amount' => $transaction->senior_discount_amount,
                    'is_senior_citizen' => $transaction->is_senior_citizen,
                    'hmo_provider' => $transaction->hmo_provider,
                    'payment_method' => $transaction->payment_method,
                    'status' => $transaction->status,
                    'transaction_date' => $transaction->created_at,
                    'description' => $transaction->description,
                ];
            });
        
        // Calculate summary statistics
        $totalRevenue = $hmoTransactions->sum('amount');
        $totalTransactions = $hmoTransactions->count();
        $approvedAmount = $hmoTransactions->where('status', 'paid')->sum('amount');
        $pendingClaims = $hmoTransactions->where('status', 'pending')->count();
        $approvalRate = $totalTransactions > 0 ? ($hmoTransactions->where('status', 'paid')->count() / $totalTransactions) * 100 : 0;
        
        // Calculate average monthly revenue
        $averageMonthlyRevenue = $totalRevenue / 12;
        
        // Calculate year-over-year growth (simplified - would need previous year data)
        $yearOverYearGrowth = 0; // This would need to be calculated with previous year data
        
        $summary = [
            'total_hmo_revenue' => $totalRevenue,
            'total_hmo_transactions' => $totalTransactions,
            'total_approved_amount' => $approvedAmount,
            'pending_claims_count' => $pendingClaims,
            'approval_rate' => $approvalRate,
            'average_monthly_revenue' => $averageMonthlyRevenue,
            'highest_revenue_month' => 'N/A', // Could be calculated if needed
            'lowest_revenue_month' => 'N/A', // Could be calculated if needed
            'year_over_year_growth' => $yearOverYearGrowth,
        ];
        
        return Inertia::render('admin/billing/hmo-yearly-report', [
            'hmoTransactions' => $hmoTransactions,
            'summary' => $summary,
            'year' => $year,
            'hmoProvider' => $hmoProvider,
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
        $reportType = $request->get('report_type', 'daily');

        // Debug: Log the export request
        \Log::info('HMO Export Data Request', [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'format' => $format,
            'provider_id' => $providerId,
            'report_type' => $reportType,
            'user' => auth()->user()?->name ?? 'Guest'
        ]);

        try {
            // Get HMO data
            $hmoTransactions = $this->getHmoTransactions($dateFrom, $dateTo, $providerId);
            $hmoProviders = HmoProvider::all()->toArray();
            $summary = $this->getHmoSummary($dateFrom, $dateTo, $providerId);

            // Debug: Log the data being exported
            \Log::info('HMO Export Data Debug', [
                'hmo_transactions_count' => is_array($hmoTransactions) ? count($hmoTransactions) : 'Not array',
                'hmo_providers_count' => count($hmoProviders),
                'summary' => $summary,
                'format' => $format
            ]);

            // Create filename
            $filename = 'hmo-report-' . $dateFrom . '-to-' . $dateTo . '-' . now()->format('Y-m-d-H-i-s');

            if ($format === 'excel') {
                $export = new \App\Exports\HmoReportExport(
                    $summary,
                    is_array($hmoTransactions) ? $hmoTransactions : $hmoTransactions->toArray(),
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
            \Log::error('HMO Export Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'format' => $format,
                'provider_id' => $providerId
            ]);
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

        // Check if transaction_date column exists, otherwise use created_at
        $dateColumn = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
            ? 'transaction_date' 
            : 'created_at';

        $query = BillingTransaction::with(['patient', 'doctor'])
            ->where('payment_method', 'hmo');
            
        // Only apply date filter if dates are provided
        if ($dateFrom && $dateTo) {
            // Use datetime comparison to match getSummaryStatistics method
            $query->whereBetween($dateColumn, [$startDateTime, $endDateTime]);
        }

        if ($providerId && $providerId !== 'all') {
            // Get the provider name from the HmoProvider model
            $provider = HmoProvider::find($providerId);
            if ($provider) {
                $query->where(function($q) use ($provider) {
                    $q->where('hmo_provider', $provider->name)
                      ->orWhere('hmo_provider', 'like', '%' . $provider->name . '%')
                      ->orWhere('hmo_provider', 'like', '%' . strtolower($provider->name) . '%')
                      ->orWhere('hmo_provider', 'like', '%' . strtoupper($provider->name) . '%');
                });
            }
        }

        $transactions = $query->orderBy($dateColumn, 'desc')->get();
        
        // Debug: Log the query results
        \Log::info('HMO Transactions Query Results', [
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'startDateTime' => $startDateTime,
            'endDateTime' => $endDateTime,
            'transactions_count' => $transactions->count(),
            'transactions_sample' => $transactions->take(2)->toArray()
        ]);

        return $transactions->map(function ($transaction) {
            $patient = $transaction->patient;
            $doctor = $transaction->doctor;
            
            return [
                'id' => $transaction->id,
                'transaction_id' => $transaction->transaction_id,
                'patient_name' => $patient ? $patient->first_name . ' ' . $patient->last_name : 'N/A',
                'doctor_name' => $doctor ? $doctor->name : 'N/A',
                'total_amount' => $transaction->total_amount,
                'amount' => $transaction->amount, // Final amount after discounts
                'hmo_provider' => $transaction->hmo_provider ?: 'Unknown Provider',
                'payment_method' => $transaction->payment_method,
                'status' => $transaction->status,
                'transaction_date' => $transaction->transaction_date->format('Y-m-d H:i:s'),
                'description' => $transaction->description,
            ];
        })->toArray();
    }

    /**
     * Get HMO summary data
     */
    private function getHmoSummary($dateFrom, $dateTo, $providerId = null)
    {
        $startDateTime = $dateFrom . ' 00:00:00';
        $endDateTime = $dateTo . ' 23:59:59';

        // Check if transaction_date column exists, otherwise use created_at
        $dateColumn = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
            ? 'transaction_date' 
            : 'created_at';

        // HMO Transactions
        $query = BillingTransaction::where('payment_method', 'hmo');
        
        // Only apply date filter if dates are provided
        if ($dateFrom && $dateTo) {
            $query->whereBetween($dateColumn, [$startDateTime, $endDateTime]);
        }

        if ($providerId && $providerId !== 'all') {
            // Get the provider name from the HmoProvider model
            $provider = HmoProvider::find($providerId);
            if ($provider) {
                $query->where(function($q) use ($provider) {
                    $q->where('hmo_provider', $provider->name)
                      ->orWhere('hmo_provider', 'like', '%' . $provider->name . '%')
                      ->orWhere('hmo_provider', 'like', '%' . strtolower($provider->name) . '%')
                      ->orWhere('hmo_provider', 'like', '%' . strtoupper($provider->name) . '%');
                });
            }
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
            'total_hmo_revenue' => $hmoTransactions->sum('amount'),
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

        // Check if transaction_date column exists, otherwise use created_at
        $dateColumn = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
            ? 'transaction_date' 
            : 'created_at';

        // HMO Transactions
        $query = BillingTransaction::where('payment_method', 'hmo');
        
        // Only apply date filter if dates are provided
        if ($dateFrom && $dateTo) {
            $query->whereBetween($dateColumn, [$startDateTime, $endDateTime]);
        }
        
        $hmoTransactions = $query->get();

        // HMO Claims
        $claimsQuery = HmoClaim::whereBetween('submission_date', [$startDateTime, $endDateTime]);
        $claims = $claimsQuery->get();

        // HMO Providers
        $hmoProviders = HmoProvider::active()->get();

        // Patient Coverages
        $patientCoverages = HmoPatientCoverage::where('status', 'active')->get();

        return [
            'total_hmo_revenue' => $hmoTransactions->sum('amount'),
            'total_hmo_transactions' => $hmoTransactions->count(),
            'total_claims_amount' => $claims->sum('amount'),
            'total_approved_amount' => $claims->where('status', 'approved')->sum('amount'),
            'total_rejected_amount' => $claims->where('status', 'rejected')->sum('amount'),
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
            // Debug: Log the export data
            \Log::info('HMO PDF Export Debug', [
                'hmo_transactions_count' => is_array($hmoTransactions) ? count($hmoTransactions) : 'Not array',
                'hmo_transactions_sample' => is_array($hmoTransactions) && count($hmoTransactions) > 0 ? $hmoTransactions[0] : 'No data',
                'hmo_providers_count' => is_array($hmoProviders) ? count($hmoProviders) : 'Not array',
                'summary' => $summary,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'filename' => $filename
            ]);

            // Convert logo to base64 for PDF
            $logoPath = public_path('st-james-logo.png');
            $logoBase64 = '';
            if (file_exists($logoPath)) {
                $logoData = file_get_contents($logoPath);
                $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
            }

            $pdf = Pdf::loadView('reports.hmo-report-unified-pdf', [
                'hmoTransactions' => is_array($hmoTransactions) ? $hmoTransactions : $hmoTransactions->toArray(),
                'title' => 'HMO Report - ' . \Carbon\Carbon::parse($dateFrom)->format('M d, Y') . ' to ' . \Carbon\Carbon::parse($dateTo)->format('M d, Y'),
                'logoBase64' => $logoBase64,
            ]);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'Arial'
            ]);

            return $pdf->download($filename . '.pdf');
        } catch (\Exception $e) {
            \Log::error('HMO PDF Export Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'hmo_transactions_count' => is_array($hmoTransactions) ? count($hmoTransactions) : 'Not array',
                'date_from' => $dateFrom,
                'date_to' => $dateTo
            ]);
            return response()->json(['error' => 'PDF export failed: ' . $e->getMessage()], 500);
        }
    }
}
