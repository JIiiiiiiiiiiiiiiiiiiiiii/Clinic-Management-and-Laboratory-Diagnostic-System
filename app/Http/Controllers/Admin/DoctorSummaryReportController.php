<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\DoctorPayment;
use App\Models\Specialist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DoctorSummaryReportController extends Controller
{
    public function index(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
            $dateTo = $request->get('date_to', now()->format('Y-m-d'));
            $doctorId = $request->get('doctor_id', 'all');

            // Get doctor payments
            $query = DoctorPayment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $query->where('doctor_id', $doctorId);
            }

            $doctorPayments = $query->get();

            // Group doctor payments by doctor
            $doctorPaymentsGrouped = $doctorPayments->groupBy('doctor_id')
                ->map(function ($payments, $doctorId) {
                    $doctor = $payments->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_paid' => $payments->where('status', 'paid')->sum('net_payment'),
                        'pending_amount' => $payments->where('status', 'pending')->sum('net_payment'),
                        'payment_count' => $payments->count(),
                        'paid_payments' => $payments->where('status', 'paid')->count(),
                    ];
                });

            // Get revenue by doctor
            $startDateTime = $dateFrom . ' 00:00:00';
            $endDateTime = $dateTo . ' 23:59:59';
            
            $revenueQuery = BillingTransaction::whereBetween('transaction_date', [$startDateTime, $endDateTime])
                ->where('status', 'paid')
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $revenueQuery->where('doctor_id', $doctorId);
            }

            $revenueByDoctor = $revenueQuery->get()
                ->groupBy('doctor_id')
                ->map(function ($transactions, $doctorId) {
                    $doctor = $transactions->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_revenue' => $transactions->sum('total_amount'),
                        'transaction_count' => $transactions->count(),
                    ];
                });

            // Calculate summary
            $summary = [
                'total_doctor_payments' => $doctorPayments->where('status', 'paid')->sum('net_payment'),
                'total_doctor_revenue' => $revenueByDoctor->sum('total_revenue'),
                'doctors_count' => $doctorPaymentsGrouped->count(),
            ];

            // Get all doctors for filter
            $doctors = Specialist::where('role', 'Doctor')
                ->when(\Schema::hasColumn('specialists', 'status'), function($query) {
                    return $query->where('status', 'Active');
                })
                ->select('specialist_id as id', 'name', 'specialization')
                ->orderBy('name')
                ->get();

            return inertia('admin/billing/doctor-summary-report', [
                'doctorPayments' => $doctorPaymentsGrouped,
                'revenueByDoctor' => $revenueByDoctor,
                'summary' => $summary,
                'doctors' => $doctors,
                'filters' => [
                    'date_from' => $dateFrom,
                    'date_to' => $dateTo,
                    'doctor_id' => $doctorId,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Doctor Summary Report index error: ' . $e->getMessage());
            
            return inertia('admin/billing/doctor-summary-report', [
                'doctorPayments' => collect(),
                'revenueByDoctor' => collect(),
                'summary' => [
                    'total_doctor_payments' => 0,
                    'total_doctor_revenue' => 0,
                    'doctors_count' => 0,
                ],
                'doctors' => collect(),
                'filters' => [
                    'date_from' => now()->subDays(30)->format('Y-m-d'),
                    'date_to' => now()->format('Y-m-d'),
                    'doctor_id' => 'all',
                ],
                'error' => 'Unable to load doctor summary report data. Please try again.'
            ]);
        }
    }

    public function dailyReport(Request $request)
    {
        try {
            $date = $request->get('date', now()->format('Y-m-d'));
            $doctorId = $request->get('doctor_id', 'all');

            Log::info('Generating daily doctor summary report', [
                'date' => $date,
                'doctor_id' => $doctorId,
                'user_id' => auth()->id(),
            ]);

            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                throw new \InvalidArgumentException('Invalid date format. Expected YYYY-MM-DD');
            }

            // Get doctor payments for the date
            $query = DoctorPayment::whereDate('payment_date', $date)
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $query->where('doctor_id', $doctorId);
            }

            $doctorPayments = $query->get();

            // Group doctor payments by doctor
            $doctorPaymentsGrouped = $doctorPayments->groupBy('doctor_id')
                ->map(function ($payments, $doctorId) {
                    $doctor = $payments->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_paid' => $payments->where('status', 'paid')->sum('net_payment'),
                        'pending_amount' => $payments->where('status', 'pending')->sum('net_payment'),
                        'payment_count' => $payments->count(),
                        'paid_payments' => $payments->where('status', 'paid')->count(),
                    ];
                });

            // Get revenue by doctor for the date
            $startDateTime = $date . ' 00:00:00';
            $endDateTime = $date . ' 23:59:59';
            
            $revenueQuery = BillingTransaction::whereBetween('transaction_date', [$startDateTime, $endDateTime])
                ->where('status', 'paid')
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $revenueQuery->where('doctor_id', $doctorId);
            }

            $revenueByDoctor = $revenueQuery->get()
                ->groupBy('doctor_id')
                ->map(function ($transactions, $doctorId) {
                    $doctor = $transactions->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_revenue' => $transactions->sum('total_amount'),
                        'transaction_count' => $transactions->count(),
                    ];
                });

            // Calculate summary
            $summary = [
                'total_doctor_payments' => $doctorPayments->where('status', 'paid')->sum('net_payment'),
                'total_doctor_revenue' => $revenueByDoctor->sum('total_revenue'),
                'doctors_count' => $doctorPaymentsGrouped->count(),
            ];

            // Get all doctors for filter
            $doctors = Specialist::where('role', 'Doctor')
                ->when(\Schema::hasColumn('specialists', 'status'), function($query) {
                    return $query->where('status', 'Active');
                })
                ->select('specialist_id as id', 'name', 'specialization')
                ->orderBy('name')
                ->get();

            return inertia('admin/billing/doctor-summary-daily-report', [
                'doctorPayments' => $doctorPaymentsGrouped,
                'revenueByDoctor' => $revenueByDoctor,
                'summary' => $summary,
                'doctors' => $doctors,
                'date' => $date,
                'filters' => [
                    'date' => $date,
                    'doctor_id' => $doctorId,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Daily doctor summary report generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'date' => $date ?? 'unknown',
                'doctor_id' => $doctorId ?? 'unknown',
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Failed to generate daily doctor summary report: ' . $e->getMessage());
        }
    }

    public function monthlyReport(Request $request)
    {
        try {
            $month = $request->get('month', now()->format('Y-m'));
            $doctorId = $request->get('doctor_id', 'all');

            Log::info('Generating monthly doctor summary report', [
                'month' => $month,
                'doctor_id' => $doctorId,
                'user_id' => auth()->id(),
            ]);

            // Get doctor payments for the month
            $query = DoctorPayment::whereYear('payment_date', substr($month, 0, 4))
                ->whereMonth('payment_date', substr($month, 5, 2))
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $query->where('doctor_id', $doctorId);
            }

            $doctorPayments = $query->get();

            // Group doctor payments by doctor
            $doctorPaymentsGrouped = $doctorPayments->groupBy('doctor_id')
                ->map(function ($payments, $doctorId) {
                    $doctor = $payments->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_paid' => $payments->where('status', 'paid')->sum('net_payment'),
                        'pending_amount' => $payments->where('status', 'pending')->sum('net_payment'),
                        'payment_count' => $payments->count(),
                        'paid_payments' => $payments->where('status', 'paid')->count(),
                    ];
                });

            // Get revenue by doctor for the month
            $revenueQuery = BillingTransaction::whereYear('transaction_date', substr($month, 0, 4))
                ->whereMonth('transaction_date', substr($month, 5, 2))
                ->where('status', 'paid')
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $revenueQuery->where('doctor_id', $doctorId);
            }

            $revenueByDoctor = $revenueQuery->get()
                ->groupBy('doctor_id')
                ->map(function ($transactions, $doctorId) {
                    $doctor = $transactions->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_revenue' => $transactions->sum('total_amount'),
                        'transaction_count' => $transactions->count(),
                    ];
                });

            // Calculate summary
            $summary = [
                'total_doctor_payments' => $doctorPayments->where('status', 'paid')->sum('net_payment'),
                'total_doctor_revenue' => $revenueByDoctor->sum('total_revenue'),
                'doctors_count' => $doctorPaymentsGrouped->count(),
            ];

            // Get all doctors for filter
            $doctors = Specialist::where('role', 'Doctor')
                ->when(\Schema::hasColumn('specialists', 'status'), function($query) {
                    return $query->where('status', 'Active');
                })
                ->select('specialist_id as id', 'name', 'specialization')
                ->orderBy('name')
                ->get();

            return inertia('admin/billing/doctor-summary-monthly-report', [
                'doctorPayments' => $doctorPaymentsGrouped,
                'revenueByDoctor' => $revenueByDoctor,
                'summary' => $summary,
                'doctors' => $doctors,
                'month' => $month,
                'filters' => [
                    'month' => $month,
                    'doctor_id' => $doctorId,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Monthly doctor summary report generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'month' => $month ?? 'unknown',
                'doctor_id' => $doctorId ?? 'unknown',
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Failed to generate monthly doctor summary report: ' . $e->getMessage());
        }
    }

    public function yearlyReport(Request $request)
    {
        try {
            $year = $request->get('year', now()->format('Y'));
            $doctorId = $request->get('doctor_id', 'all');

            Log::info('Generating yearly doctor summary report', [
                'year' => $year,
                'doctor_id' => $doctorId,
                'user_id' => auth()->id(),
            ]);

            // Get doctor payments for the year
            $query = DoctorPayment::whereYear('payment_date', $year)
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $query->where('doctor_id', $doctorId);
            }

            $doctorPayments = $query->get();

            // Group doctor payments by doctor
            $doctorPaymentsGrouped = $doctorPayments->groupBy('doctor_id')
                ->map(function ($payments, $doctorId) {
                    $doctor = $payments->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_paid' => $payments->where('status', 'paid')->sum('net_payment'),
                        'pending_amount' => $payments->where('status', 'pending')->sum('net_payment'),
                        'payment_count' => $payments->count(),
                        'paid_payments' => $payments->where('status', 'paid')->count(),
                    ];
                });

            // Get revenue by doctor for the year
            $revenueQuery = BillingTransaction::whereYear('transaction_date', $year)
                ->where('status', 'paid')
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $revenueQuery->where('doctor_id', $doctorId);
            }

            $revenueByDoctor = $revenueQuery->get()
                ->groupBy('doctor_id')
                ->map(function ($transactions, $doctorId) {
                    $doctor = $transactions->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_revenue' => $transactions->sum('total_amount'),
                        'transaction_count' => $transactions->count(),
                    ];
                });

            // Calculate summary
            $summary = [
                'total_doctor_payments' => $doctorPayments->where('status', 'paid')->sum('net_payment'),
                'total_doctor_revenue' => $revenueByDoctor->sum('total_revenue'),
                'doctors_count' => $doctorPaymentsGrouped->count(),
            ];

            // Get all doctors for filter
            $doctors = Specialist::where('role', 'Doctor')
                ->when(\Schema::hasColumn('specialists', 'status'), function($query) {
                    return $query->where('status', 'Active');
                })
                ->select('specialist_id as id', 'name', 'specialization')
                ->orderBy('name')
                ->get();

            return inertia('admin/billing/doctor-summary-yearly-report', [
                'doctorPayments' => $doctorPaymentsGrouped,
                'revenueByDoctor' => $revenueByDoctor,
                'summary' => $summary,
                'doctors' => $doctors,
                'year' => $year,
                'filters' => [
                    'year' => $year,
                    'doctor_id' => $doctorId,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Yearly doctor summary report generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'year' => $year ?? 'unknown',
                'doctor_id' => $doctorId ?? 'unknown',
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Failed to generate yearly doctor summary report: ' . $e->getMessage());
        }
    }

    public function exportReport(Request $request)
    {
        $format = $request->get('format', 'excel');
        $type = $request->get('type', 'daily');
        $doctorId = $request->get('doctor_id', 'all');

        // Redirect to appropriate export method based on type
        switch ($type) {
            case 'daily':
                return $this->exportDailyReport($request);
            case 'monthly':
                return $this->exportMonthlyReport($request);
            case 'yearly':
                return $this->exportYearlyReport($request);
            default:
                return $this->exportDailyReport($request);
        }
    }

    public function exportDailyReport(Request $request)
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $doctorId = $request->get('doctor_id', 'all');
        $format = $request->get('format', 'excel');

        try {
            // Get doctor payments for the date
            $query = DoctorPayment::whereDate('payment_date', $date)
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $query->where('doctor_id', $doctorId);
            }

            $doctorPayments = $query->get();

            // Group doctor payments by doctor
            $doctorPaymentsGrouped = $doctorPayments->groupBy('doctor_id')
                ->map(function ($payments, $doctorId) {
                    $doctor = $payments->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_paid' => $payments->where('status', 'paid')->sum('net_payment'),
                        'pending_amount' => $payments->where('status', 'pending')->sum('net_payment'),
                        'payment_count' => $payments->count(),
                        'paid_payments' => $payments->where('status', 'paid')->count(),
                    ];
                });

            // Get revenue by doctor for the date
            $startDateTime = $date . ' 00:00:00';
            $endDateTime = $date . ' 23:59:59';
            
            $revenueQuery = BillingTransaction::whereBetween('transaction_date', [$startDateTime, $endDateTime])
                ->where('status', 'paid')
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $revenueQuery->where('doctor_id', $doctorId);
            }

            $revenueByDoctor = $revenueQuery->get()
                ->groupBy('doctor_id')
                ->map(function ($transactions, $doctorId) {
                    $doctor = $transactions->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_revenue' => $transactions->sum('total_amount'),
                        'transaction_count' => $transactions->count(),
                    ];
                });

            // Create export data
            $exportData = [];
            foreach ($doctorPaymentsGrouped as $doctorId => $paymentData) {
                $revenueData = $revenueByDoctor->get($doctorId, ['total_revenue' => 0, 'transaction_count' => 0]);
                
                $exportData[] = [
                    'Doctor Name' => $paymentData['doctor']['name'],
                    'Total Paid' => 'PHP ' . number_format($paymentData['total_paid'], 2),
                    'Pending Amount' => 'PHP ' . number_format($paymentData['pending_amount'], 2),
                    'Payment Count' => $paymentData['payment_count'],
                    'Paid Payments' => $paymentData['paid_payments'],
                    'Total Revenue' => 'PHP ' . number_format($revenueData['total_revenue'], 2),
                    'Transaction Count' => $revenueData['transaction_count'],
                ];
            }

            $filename = 'Doctor_Summary_Daily_Report_' . $date . '.' . $format;

            if ($format === 'pdf') {
                // Convert logo to base64 for PDF
                $logoPath = public_path('st-james-logo.png');
                $logoBase64 = null;
                if (file_exists($logoPath)) {
                    $logoData = file_get_contents($logoPath);
                    $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
                }
                
                $html = $this->buildHtmlTable('Doctor Summary Daily Report - ' . $date, $exportData, $logoBase64);
                return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download($filename);
            }
            
            if (in_array($format, ['word', 'doc', 'docx'])) {
                $html = $this->buildHtmlTable('Doctor Summary Daily Report - ' . $date, $exportData);
                return response($html)
                    ->header('Content-Type', 'application/msword')
                    ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
            }

            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\ArrayExport($exportData, 'Doctor Summary Daily Report - ' . $date),
                $filename,
                \Maatwebsite\Excel\Excel::XLSX
            );

        } catch (\Exception $e) {
            Log::error('Doctor Summary Daily Export Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to export doctor summary daily report. Please try again.']);
        }
    }

    public function exportMonthlyReport(Request $request)
    {
        $month = $request->get('month', now()->format('Y-m'));
        $doctorId = $request->get('doctor_id', 'all');
        $format = $request->get('format', 'excel');

        try {
            // Get doctor payments for the month
            $query = DoctorPayment::whereYear('payment_date', substr($month, 0, 4))
                ->whereMonth('payment_date', substr($month, 5, 2))
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $query->where('doctor_id', $doctorId);
            }

            $doctorPayments = $query->get();

            // Group doctor payments by doctor
            $doctorPaymentsGrouped = $doctorPayments->groupBy('doctor_id')
                ->map(function ($payments, $doctorId) {
                    $doctor = $payments->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_paid' => $payments->where('status', 'paid')->sum('net_payment'),
                        'pending_amount' => $payments->where('status', 'pending')->sum('net_payment'),
                        'payment_count' => $payments->count(),
                        'paid_payments' => $payments->where('status', 'paid')->count(),
                    ];
                });

            // Get revenue by doctor for the month
            $revenueQuery = BillingTransaction::whereYear('transaction_date', substr($month, 0, 4))
                ->whereMonth('transaction_date', substr($month, 5, 2))
                ->where('status', 'paid')
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $revenueQuery->where('doctor_id', $doctorId);
            }

            $revenueByDoctor = $revenueQuery->get()
                ->groupBy('doctor_id')
                ->map(function ($transactions, $doctorId) {
                    $doctor = $transactions->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_revenue' => $transactions->sum('total_amount'),
                        'transaction_count' => $transactions->count(),
                    ];
                });

            // Create export data
            $exportData = [];
            foreach ($doctorPaymentsGrouped as $doctorId => $paymentData) {
                $revenueData = $revenueByDoctor->get($doctorId, ['total_revenue' => 0, 'transaction_count' => 0]);
                
                $exportData[] = [
                    'Doctor Name' => $paymentData['doctor']['name'],
                    'Total Paid' => 'PHP ' . number_format($paymentData['total_paid'], 2),
                    'Pending Amount' => 'PHP ' . number_format($paymentData['pending_amount'], 2),
                    'Payment Count' => $paymentData['payment_count'],
                    'Paid Payments' => $paymentData['paid_payments'],
                    'Total Revenue' => 'PHP ' . number_format($revenueData['total_revenue'], 2),
                    'Transaction Count' => $revenueData['transaction_count'],
                ];
            }

            $filename = 'Doctor_Summary_Monthly_Report_' . $month . '.' . $format;

            if ($format === 'pdf') {
                // Convert logo to base64 for PDF
                $logoPath = public_path('st-james-logo.png');
                $logoBase64 = null;
                if (file_exists($logoPath)) {
                    $logoData = file_get_contents($logoPath);
                    $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
                }
                
                $html = $this->buildHtmlTable('Doctor Summary Monthly Report - ' . $month, $exportData, $logoBase64);
                return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download($filename);
            }
            
            if (in_array($format, ['word', 'doc', 'docx'])) {
                $html = $this->buildHtmlTable('Doctor Summary Monthly Report - ' . $month, $exportData);
                return response($html)
                    ->header('Content-Type', 'application/msword')
                    ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
            }

            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\ArrayExport($exportData, 'Doctor Summary Monthly Report - ' . $month),
                $filename,
                \Maatwebsite\Excel\Excel::XLSX
            );

        } catch (\Exception $e) {
            Log::error('Doctor Summary Monthly Export Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to export doctor summary monthly report. Please try again.']);
        }
    }

    public function exportYearlyReport(Request $request)
    {
        $year = $request->get('year', now()->format('Y'));
        $doctorId = $request->get('doctor_id', 'all');
        $format = $request->get('format', 'excel');

        try {
            // Get doctor payments for the year
            $query = DoctorPayment::whereYear('payment_date', $year)
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $query->where('doctor_id', $doctorId);
            }

            $doctorPayments = $query->get();

            // Group doctor payments by doctor
            $doctorPaymentsGrouped = $doctorPayments->groupBy('doctor_id')
                ->map(function ($payments, $doctorId) {
                    $doctor = $payments->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_paid' => $payments->where('status', 'paid')->sum('net_payment'),
                        'pending_amount' => $payments->where('status', 'pending')->sum('net_payment'),
                        'payment_count' => $payments->count(),
                        'paid_payments' => $payments->where('status', 'paid')->count(),
                    ];
                });

            // Get revenue by doctor for the year
            $revenueQuery = BillingTransaction::whereYear('transaction_date', $year)
                ->where('status', 'paid')
                ->with(['doctor']);

            if ($doctorId !== 'all') {
                $revenueQuery->where('doctor_id', $doctorId);
            }

            $revenueByDoctor = $revenueQuery->get()
                ->groupBy('doctor_id')
                ->map(function ($transactions, $doctorId) {
                    $doctor = $transactions->first()->doctor;
                    return [
                        'doctor' => [
                            'id' => $doctorId,
                            'name' => $doctor ? $doctor->name : 'Unknown Doctor',
                        ],
                        'total_revenue' => $transactions->sum('total_amount'),
                        'transaction_count' => $transactions->count(),
                    ];
                });

            // Create export data
            $exportData = [];
            foreach ($doctorPaymentsGrouped as $doctorId => $paymentData) {
                $revenueData = $revenueByDoctor->get($doctorId, ['total_revenue' => 0, 'transaction_count' => 0]);
                
                $exportData[] = [
                    'Doctor Name' => $paymentData['doctor']['name'],
                    'Total Paid' => 'PHP ' . number_format($paymentData['total_paid'], 2),
                    'Pending Amount' => 'PHP ' . number_format($paymentData['pending_amount'], 2),
                    'Payment Count' => $paymentData['payment_count'],
                    'Paid Payments' => $paymentData['paid_payments'],
                    'Total Revenue' => 'PHP ' . number_format($revenueData['total_revenue'], 2),
                    'Transaction Count' => $revenueData['transaction_count'],
                ];
            }

            $filename = 'Doctor_Summary_Yearly_Report_' . $year . '.' . $format;

            if ($format === 'pdf') {
                // Convert logo to base64 for PDF
                $logoPath = public_path('st-james-logo.png');
                $logoBase64 = null;
                if (file_exists($logoPath)) {
                    $logoData = file_get_contents($logoPath);
                    $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
                }
                
                $html = $this->buildHtmlTable('Doctor Summary Yearly Report - ' . $year, $exportData, $logoBase64);
                return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download($filename);
            }
            
            if (in_array($format, ['word', 'doc', 'docx'])) {
                $html = $this->buildHtmlTable('Doctor Summary Yearly Report - ' . $year, $exportData);
                return response($html)
                    ->header('Content-Type', 'application/msword')
                    ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
            }

            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\ArrayExport($exportData, 'Doctor Summary Yearly Report - ' . $year),
                $filename,
                \Maatwebsite\Excel\Excel::XLSX
            );

        } catch (\Exception $e) {
            Log::error('Doctor Summary Yearly Export Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to export doctor summary yearly report. Please try again.']);
        }
    }

    private function buildHtmlTable($title, $data, $logoBase64 = null)
    {
        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>' . $title . '</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        
        .hospital-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2d5a27;
            padding-bottom: 20px;
        }
        
        .hospital-logo {
            display: inline-block;
            vertical-align: top;
            margin-right: 20px;
        }
        
        .hospital-info {
            display: inline-block;
            text-align: left;
            vertical-align: top;
        }
        
        .hospital-name {
            font-size: 24px;
            font-weight: bold;
            color: #2d5a27;
            margin: 0 0 5px 0;
        }
        
        .hospital-address {
            font-size: 12px;
            color: #333;
            margin: 0 0 3px 0;
        }
        
        .hospital-slogan {
            font-size: 14px;
            font-style: italic;
            color: #1e40af;
            margin: 0 0 5px 0;
        }
        
        .hospital-motto {
            font-size: 16px;
            font-weight: bold;
            color: #2d5a27;
            margin: 0 0 5px 0;
        }
        
        .hospital-contact {
            font-size: 10px;
            color: #666;
            margin: 0;
        }
        
        .report-title {
            text-align: center;
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
            color: #2d5a27;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .data-table th,
        .data-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        .data-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #64748b;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="hospital-header">
        <div class="hospital-logo">
            <img src="' . ($logoBase64 ?? public_path('st-james-logo.png')) . '" alt="St. James Hospital Logo" style="width: 80px; height: 80px;">
        </div>
        <div class="hospital-info">
            <div class="hospital-name">St. James Hospital Clinic, Inc.</div>
            <div class="hospital-address">San Isidro City of Cabuyao Laguna</div>
            <div class="hospital-slogan">Santa Rosa\'s First in Quality Healthcare Service</div>
            <div class="hospital-motto">PASYENTE MUNA</div>
            <div class="hospital-contact">
                Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307<br>
                email add: info@stjameshospital.com.ph
            </div>
        </div>
    </div>
    
    <div class="report-title">' . $title . '</div>
    
    <table class="data-table">';
        if (!empty($data)) {
            // Add headers
            $html .= '<tr>';
            foreach (array_keys($data[0]) as $header) {
                $html .= '<th>' . $header . '</th>';
            }
            $html .= '</tr>';

            // Add data rows
            foreach ($data as $row) {
                $html .= '<tr>';
                foreach ($row as $cell) {
                    $html .= '<td>' . $cell . '</td>';
                }
                $html .= '</tr>';
            }
        }
        
        $html .= '</table>
    
    <div class="footer">
        <p>This report was generated automatically by the Clinic Management System</p>
        <p>For questions or support, please contact the system administrator</p>
    </div>
</body>
</html>';
        return $html;
    }
}
