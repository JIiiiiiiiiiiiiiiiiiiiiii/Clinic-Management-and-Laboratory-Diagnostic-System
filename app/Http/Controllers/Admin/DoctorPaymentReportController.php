<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DoctorPayment;
use App\Models\Specialist;
use App\Services\DoctorPaymentReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DoctorPaymentReportController extends Controller
{
    protected $reportService;

    public function __construct(DoctorPaymentReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Display doctor payment reports with filtering options
     */
    public function index(Request $request)
    {
        try {
            $filters = [
                'date_from' => $request->get('date_from', now()->startOfMonth()->format('Y-m-d')),
                'date_to' => $request->get('date_to', now()->endOfMonth()->format('Y-m-d')),
                'report_type' => $request->get('report_type', 'daily'),
                'doctor_id' => $request->get('doctor_id', 'all'),
                'status' => $request->get('status', 'all'),
            ];

            // Get doctors for filter dropdown
            $doctors = Specialist::where('role', 'Doctor')
                ->when(\Schema::hasColumn('specialists', 'status'), function($query) {
                    return $query->where('status', 'Active');
                })
                ->select('specialist_id as id', 'name', 'specialization')
                ->orderBy('name')
                ->get();

            // Get report data based on filters
            $reportData = $this->reportService->getReportData($filters);
            
            // Get summary statistics
            $summary = $this->reportService->getSummaryStatistics($filters);

            return Inertia::render('admin/billing/doctor-payment-reports', [
                'reportData' => $reportData,
                'summary' => $summary,
                'doctors' => $doctors,
                'filters' => $filters,
            ]);

        } catch (\Exception $e) {
            \Log::error('Doctor Payment Report error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return Inertia::render('admin/billing/doctor-payment-reports', [
                'reportData' => [],
                'summary' => [
                    'total_payments' => 0,
                    'total_amount' => 0,
                    'paid_amount' => 0,
                    'pending_amount' => 0,
                    'average_payment' => 0,
                ],
                'doctors' => [],
                'filters' => [
                    'date_from' => now()->startOfMonth()->format('Y-m-d'),
                    'date_to' => now()->endOfMonth()->format('Y-m-d'),
                    'report_type' => 'daily',
                    'doctor_id' => 'all',
                    'status' => 'all',
                ],
            ]);
        }
    }

    /**
     * Daily doctor payment report
     */
    public function daily(Request $request)
    {
        $filters = [
            'date_from' => $request->get('date_from', now()->format('Y-m-d')),
            'date_to' => $request->get('date_to', now()->format('Y-m-d')),
            'report_type' => 'daily',
            'doctor_id' => $request->get('doctor_id', 'all'),
            'status' => $request->get('status', 'all'),
        ];

        $doctors = Specialist::where('role', 'Doctor')
            ->when(\Schema::hasColumn('specialists', 'status'), function($query) {
                return $query->where('status', 'Active');
            })
            ->select('specialist_id as id', 'name', 'specialization')
            ->orderBy('name')
            ->get();

        $reportData = $this->reportService->getDailyReport($filters);
        $summary = $this->reportService->getSummaryStatistics($filters);

        return Inertia::render('admin/billing/doctor-payment-reports', [
            'reportData' => $reportData,
            'summary' => $summary,
            'doctors' => $doctors,
            'filters' => $filters,
        ]);
    }

    /**
     * Monthly doctor payment report
     */
    public function monthly(Request $request)
    {
        $filters = [
            'date_from' => $request->get('date_from', now()->startOfMonth()->format('Y-m-d')),
            'date_to' => $request->get('date_to', now()->endOfMonth()->format('Y-m-d')),
            'report_type' => 'monthly',
            'doctor_id' => $request->get('doctor_id', 'all'),
            'status' => $request->get('status', 'all'),
        ];

        $doctors = Specialist::where('role', 'Doctor')
            ->when(\Schema::hasColumn('specialists', 'status'), function($query) {
                return $query->where('status', 'Active');
            })
            ->select('specialist_id as id', 'name', 'specialization')
            ->orderBy('name')
            ->get();

        $reportData = $this->reportService->getMonthlyReport($filters);
        $summary = $this->reportService->getSummaryStatistics($filters);

        return Inertia::render('admin/billing/doctor-payment-reports', [
            'reportData' => $reportData,
            'summary' => $summary,
            'doctors' => $doctors,
            'filters' => $filters,
        ]);
    }

    /**
     * Yearly doctor payment report
     */
    public function yearly(Request $request)
    {
        $filters = [
            'date_from' => $request->get('date_from', now()->startOfYear()->format('Y-m-d')),
            'date_to' => $request->get('date_to', now()->endOfYear()->format('Y-m-d')),
            'report_type' => 'yearly',
            'doctor_id' => $request->get('doctor_id', 'all'),
            'status' => $request->get('status', 'all'),
        ];

        $doctors = Specialist::where('role', 'Doctor')
            ->when(\Schema::hasColumn('specialists', 'status'), function($query) {
                return $query->where('status', 'Active');
            })
            ->select('specialist_id as id', 'name', 'specialization')
            ->orderBy('name')
            ->get();

        $reportData = $this->reportService->getYearlyReport($filters);
        $summary = $this->reportService->getSummaryStatistics($filters);

        return Inertia::render('admin/billing/doctor-payment-reports', [
            'reportData' => $reportData,
            'summary' => $summary,
            'doctors' => $doctors,
            'filters' => $filters,
        ]);
    }

    /**
     * Export doctor payment report
     */
    public function export(Request $request)
    {
        $filters = [
            'date_from' => $request->get('date_from', now()->startOfMonth()->format('Y-m-d')),
            'date_to' => $request->get('date_to', now()->endOfMonth()->format('Y-m-d')),
            'report_type' => $request->get('report_type', 'daily'),
            'doctor_id' => $request->get('doctor_id', 'all'),
            'status' => $request->get('status', 'all'),
            'format' => $request->get('format', 'excel'),
        ];

        try {
            return $this->reportService->exportReport($filters);
        } catch (\Exception $e) {
            \Log::error('Export error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to export report. Please try again.']);
        }
    }

    /**
     * Get doctor payment details for a specific doctor
     */
    public function doctorDetails(Request $request, $doctorId)
    {
        $filters = [
            'date_from' => $request->get('date_from', now()->startOfMonth()->format('Y-m-d')),
            'date_to' => $request->get('date_to', now()->endOfMonth()->format('Y-m-d')),
            'doctor_id' => $doctorId,
            'status' => $request->get('status', 'all'),
        ];

        $doctor = Specialist::where('specialist_id', $doctorId)
            ->where('role', 'Doctor')
            ->first();

        if (!$doctor) {
            return redirect()->route('admin.billing.doctor-payment-reports')
                ->with('error', 'Doctor not found.');
        }

        $reportData = $this->reportService->getDoctorDetails($filters);
        $summary = $this->reportService->getDoctorSummary($doctorId, $filters);

        return Inertia::render('admin/billing/doctor-payment-details', [
            'doctor' => $doctor,
            'reportData' => $reportData,
            'summary' => $summary,
            'filters' => $filters,
        ]);
    }
}
