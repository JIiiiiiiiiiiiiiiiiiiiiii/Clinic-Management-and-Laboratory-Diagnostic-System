<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\DoctorPayment;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\Supply\Supply;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\FinancialReportExport;

class ReportsController extends Controller
{
    /**
     * Display the main reports dashboard
     */
    public function index(): Response
    {
        $user = Auth::user();

        try {
            // Get summary statistics with proper error handling
            $summary = [
                'total_patients' => Patient::count(),
                'total_appointments' => Appointment::count(),
                'total_transactions' => BillingTransaction::count(),
                'total_revenue' => BillingTransaction::sum('amount') ?? 0,
                'total_lab_orders' => LabOrder::count(),
                'total_products' => Supply::count(),
            ];

            // Get filter options for dropdowns
            $filterOptions = $this->getFilterOptions();

            // Get recent reports
            $recentReports = $this->getRecentReports();

            // Chart data from database with error handling
            $chartData = $this->getChartData();

            return Inertia::render('admin/reports/index', [
                'summary' => $summary,
                'recentReports' => $recentReports,
                'filterOptions' => $filterOptions,
                'user' => $user,
                'metadata' => $this->getReportMetadata(),
                'chartData' => $chartData,
            ]);
        } catch (\Exception $e) {
            Log::error('Reports index error: ' . $e->getMessage());
            
            return Inertia::render('admin/reports/index', [
                'summary' => [
                    'total_patients' => 0,
                    'total_appointments' => 0,
                    'total_transactions' => 0,
                    'total_revenue' => 0,
                    'total_expenses' => 0,
                    'total_lab_orders' => 0,
                    'total_products' => 0,
                ],
                'recentReports' => [],
                'filterOptions' => $this->getFilterOptions(),
                'user' => $user,
                'metadata' => $this->getReportMetadata(),
                'chartData' => [],
                'error' => 'Unable to load report data. Please try again.'
            ]);
        }
    }

    /**
     * Financial Reports
     */
    public function financial(Request $request): Response
    {
        if (!$this->checkReportAccess('financial')) {
            abort(403, 'You do not have permission to access financial reports.');
        }

        try {
            $filter = $request->get('filter', 'daily');
            $date = $request->get('date', now()->format('Y-m-d'));
            $reportType = $request->get('report_type', 'all');
            
            $data = $this->getFinancialReportData($filter, $date, $reportType);
            
            // Get paginated transactions for the table
            $query = BillingTransaction::query();
            // Check if transaction_date column exists, otherwise use created_at
            $dateField = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
                ? 'transaction_date' 
                : 'created_at';
            $this->applyDateRangeFilter($query, $filter, $date, $dateField);
            
            // Apply report type filtering
            if ($reportType === 'cash') {
                $query->where('payment_method', 'cash');
            } elseif ($reportType === 'hmo') {
                $query->where('payment_method', 'hmo');
            }
            // 'all' shows all payment methods
            
            if ($request->filled('doctor_id')) {
                $query->where('doctor_id', $request->doctor_id);
            }

            if ($request->filled('payment_method')) {
                $query->where('payment_method', $request->payment_method);
            }

            if ($request->filled('hmo_provider')) {
                $query->where('hmo_provider', $request->hmo_provider);
            }

            // Use the same date field for ordering
            $transactions = $query->with(['patient', 'doctor'])
                ->orderBy($dateField, 'desc')
                ->paginate(20);

            // Debug: Log the count of transactions
            \Log::info('Financial Reports - Transaction count: ' . $transactions->count());
            \Log::info('Financial Reports - Total transactions in DB: ' . \App\Models\BillingTransaction::count());
            
            // Debug: Log first transaction data
            if ($transactions->count() > 0) {
                $firstTransaction = $transactions->first();
                \Log::info('First transaction data: ' . json_encode([
                    'id' => $firstTransaction->id,
                    'patient' => $firstTransaction->patient ? $firstTransaction->patient->first_name . ' ' . $firstTransaction->patient->last_name : 'No patient',
                    'doctor' => $firstTransaction->doctor ? $firstTransaction->doctor->name : 'No doctor',
                    'amount' => $firstTransaction->total_amount,
                ]));
            }

            // Transform data to match frontend expectations
            $transformedData = $transactions->getCollection()->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'patient_name' => $transaction->patient ? 
                        $transaction->patient->first_name . ' ' . $transaction->patient->last_name : 
                        'Unknown Patient',
                    'doctor_name' => $transaction->doctor ? 
                        $transaction->doctor->name : 
                        'Unknown Doctor',
                    'total_amount' => $transaction->amount, // Use final amount after discounts
                    'original_amount' => $transaction->total_amount, // Original amount before discounts
                    'discount_amount' => $transaction->discount_amount ?? 0,
                    'senior_discount_amount' => $transaction->senior_discount_amount ?? 0,
                    'payment_method' => $transaction->payment_method,
                    'transaction_date' => $transaction->transaction_date,
                    'status' => $transaction->status,
                ];
            });

            // Create a new paginated result with transformed data
            $transactions = new \Illuminate\Pagination\LengthAwarePaginator(
                $transformedData,
                $transactions->total(),
                $transactions->perPage(),
                $transactions->currentPage(),
                [
                    'path' => $transactions->url($transactions->currentPage()),
                    'pageName' => 'page',
                ]
            );

            // Debug: Log transformed data
            \Log::info('Transformed data count: ' . $transformedData->count());
            if ($transformedData->count() > 0) {
                \Log::info('First transformed transaction: ' . json_encode($transformedData->first()));
            }

            // Calculate summary with null checks - use final amounts after discounts
            $summary = [
                'total_revenue' => $transactions->sum('amount') ?? 0, // Use final amount after discounts
                'total_transactions' => $transactions->count(),
                'average_transaction' => $transactions->avg('amount') ?? 0, // Use final amount after discounts
                'cash_payments' => $transactions->where('payment_method', 'cash')->sum('amount') ?? 0,
                'hmo_payments' => $transactions->where('payment_method', 'hmo')->sum('amount') ?? 0,
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
            ];

            // Get chart data
            $chartData = $this->getFinancialChartData($request);

            return Inertia::render('admin/reports/financial', [
                'filter' => $filter,
                'date' => $date,
                'reportType' => $reportType,
                'data' => $data,
                'transactions' => $transactions,
                'summary' => $summary,
                'chartData' => $chartData,
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
            ]);
        } catch (\Exception $e) {
            Log::error('Financial reports error: ' . $e->getMessage());
            return Inertia::render('admin/reports/financial', [
                'transactions' => collect(),
                'summary' => [
                    'total_revenue' => 0,
                    'total_transactions' => 0,
                    'average_transaction' => 0,
                    'cash_payments' => 0,
                    'hmo_payments' => 0,
                ],
                'chartData' => [],
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
                'error' => 'Unable to load financial report data.'
            ]);
        }
    }

    /**
     * Patient Reports
     */
    public function patients(Request $request): Response
    {
        if (!$this->checkReportAccess('patients')) {
            abort(403, 'You do not have permission to access patient reports.');
        }

        try {
            $filter = $request->get('filter', 'daily');
            $date = $request->get('date', now()->format('Y-m-d'));
            
            $data = $this->getPatientReportData($filter, $date);
            
            // Get paginated patients for the table
            $query = Patient::query();
            $this->applyDateRangeFilter($query, $filter, $date, 'created_at');
            
            if ($request->filled('sex')) {
                $query->where('sex', $request->sex);
            }

            if ($request->filled('age_range')) {
                $ageRange = explode('-', $request->age_range);
                if (count($ageRange) == 2) {
                    $query->whereBetween('age', [$ageRange[0], $ageRange[1]]);
                }
            }

            $patients = $query->withCount(['appointments', 'labOrders'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            // Transform data to match frontend expectations
            $transformedData = $patients->getCollection()->map(function ($patient) {
                return [
                    'id' => $patient->id,
                    'patient_no' => $patient->patient_no,
                    'full_name' => $patient->first_name . ' ' . $patient->last_name,
                    'birthdate' => $patient->birthdate,
                    'age' => $patient->age,
                    'sex' => $patient->sex,
                    'mobile_no' => $patient->phone,
                    'present_address' => $patient->address,
                    'created_at' => $patient->created_at,
                    'appointments_count' => $patient->appointments_count,
                    'lab_orders_count' => $patient->lab_orders_count,
                ];
            });

            // Create a new paginated result with transformed data
            $patients = new \Illuminate\Pagination\LengthAwarePaginator(
                $transformedData,
                $patients->total(),
                $patients->perPage(),
                $patients->currentPage(),
                [
                    'path' => $patients->url($patients->currentPage()),
                    'pageName' => 'page',
                ]
            );

            $summary = [
                'total_patients' => $patients->count(),
                'new_patients' => $patients->where('created_at', '>=', now()->startOfMonth())->count(),
                'male_patients' => $patients->where('sex', 'male')->count(),
                'female_patients' => $patients->where('sex', 'female')->count(),
                'age_groups' => $this->getAgeGroupDistribution($patients),
            ];

            // Get chart data
            $chartData = $this->getPatientChartData($request);

            return Inertia::render('admin/reports/patients', [
                'filter' => $filter,
                'date' => $date,
                'data' => $data,
                'patients' => $patients,
                'summary' => $summary,
                'chartData' => $chartData,
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
            ]);
        } catch (\Exception $e) {
            Log::error('Patient reports error: ' . $e->getMessage());
            return Inertia::render('admin/reports/patients', [
                'filter' => 'daily',
                'date' => now()->format('Y-m-d'),
                'data' => [
                    'total_patients' => 0,
                    'new_patients' => 0,
                    'male_patients' => 0,
                    'female_patients' => 0,
                    'age_groups' => [],
                    'patient_details' => [],
                    'period' => 'No data available',
                    'start_date' => now()->format('Y-m-d'),
                    'end_date' => now()->format('Y-m-d')
                ],
                'patients' => collect(),
                'summary' => [
                    'total_patients' => 0,
                    'new_patients' => 0,
                    'male_patients' => 0,
                    'female_patients' => 0,
                    'age_groups' => [],
                ],
                'chartData' => [],
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
                'error' => 'Unable to load patient report data.'
            ]);
        }
    }

    /**
     * Laboratory Reports
     */
    public function laboratory(Request $request): Response
    {
        try {
            $query = LabOrder::query();

            if ($request->filled('date_from')) {
                $query->where('created_at', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->where('created_at', '<=', $request->date_to);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $labOrders = $query->with(['patient', 'orderedBy'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            $summary = [
                'total_orders' => $labOrders->count(),
                'pending_orders' => $labOrders->where('status', 'pending')->count(),
                'completed_orders' => $labOrders->where('status', 'completed')->count(),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
            ];

            return Inertia::render('admin/reports/laboratory', [
                'labOrders' => $labOrders,
                'summary' => $summary,
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
            ]);
        } catch (\Exception $e) {
            Log::error('Laboratory reports error: ' . $e->getMessage());
            return Inertia::render('admin/reports/laboratory', [
                'labOrders' => collect(),
                'summary' => [
                    'total_orders' => 0,
                    'pending_orders' => 0,
                    'completed_orders' => 0,
                ],
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
                'error' => 'Unable to load laboratory report data.'
            ]);
        }
    }

    /**
     * Test inventory data availability
     */
    public function testInventoryData()
    {
        $totalSupplies = \App\Models\Supply\Supply::count();
        $totalTransactions = \App\Models\Supply\SupplyTransaction::count();
        
        $supplies = \App\Models\Supply\Supply::with('stockLevels')->take(5)->get();
        $transactions = \App\Models\Supply\SupplyTransaction::with('product')->take(5)->get();
        
        return response()->json([
            'total_supplies' => $totalSupplies,
            'total_transactions' => $totalTransactions,
            'sample_supplies' => $supplies->map(function($supply) {
                return [
                    'id' => $supply->id,
                    'name' => $supply->name,
                    'created_at' => $supply->created_at,
                    'current_stock' => $supply->current_stock,
                ];
            }),
            'sample_transactions' => $transactions->map(function($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'subtype' => $transaction->subtype,
                    'transaction_date' => $transaction->transaction_date,
                    'product_name' => $transaction->product->name ?? 'Unknown',
                ];
            }),
        ]);
    }

    /**
     * Test inventory reports data fetching
     */
    public function testInventoryReports()
    {
        $filter = 'daily';
        $date = '2025-10-26';
        $reportType = 'all';
        
        $data = $this->getInventoryReportData($filter, $date, $reportType);
        
        // Also test the full inventory method
        $request = new \Illuminate\Http\Request([
            'filter' => $filter,
            'date' => $date,
            'report_type' => $reportType
        ]);
        
        // Temporarily bypass permission check for testing
        $originalMethod = $this->checkReportAccess('inventory');
        
        return response()->json([
            'filter' => $filter,
            'date' => $date,
            'report_type' => $reportType,
            'data' => $data,
            'inventory_items_count' => \App\Models\InventoryItem::count(),
            'inventory_items_sample' => \App\Models\InventoryItem::take(3)->get()->map(function($item) {
                return [
                    'id' => $item->id,
                    'item_name' => $item->item_name,
                    'item_code' => $item->item_code,
                    'stock' => $item->stock,
                    'low_stock_alert' => $item->low_stock_alert,
                    'unit_cost' => $item->unit_cost,
                    'category' => $item->category
                ];
            })
        ]);
    }

    /**
     * Test full inventory method with Inertia response
     */
    public function testInventoryFull(Request $request)
    {
        // Temporarily disable permission check for testing
        try {
            $filter = $request->get('filter', 'daily');
            $date = $request->get('date', now()->format('Y-m-d'));
            $reportType = $request->get('report_type', 'all');
            
            \Log::info('Test Inventory Full Request', [
                'filter' => $filter,
                'date' => $date,
                'report_type' => $reportType
            ]);
            
            // Get paginated inventory items for the table - apply same date filtering as the data
            $startDate = $this->getStartDate($filter, $date);
            $endDate = $this->getEndDate($filter, $date);
            
            $data = $this->getInventoryReportData($filter, $date, $reportType);
            
            \Log::info('Test Inventory Full Data', [
                'total_products' => $data['total_products'] ?? 0,
                'supply_details_count' => count($data['supply_details'] ?? []),
                'period' => $data['period'] ?? 'Unknown',
                'start_date' => $startDate->format('Y-m-d H:i:s'),
                'end_date' => $endDate->format('Y-m-d H:i:s'),
                'report_type' => $reportType
            ]);
            
            // Debug: Check if there are any inventory items in the database
            $totalItems = \App\Models\InventoryItem::count();
            \Log::info('Database Debug', [
                'total_items_in_db' => $totalItems,
                'items_updated_today' => \App\Models\InventoryItem::whereDate('updated_at', today())->count(),
                'items_updated_this_month' => \App\Models\InventoryItem::whereMonth('updated_at', now()->month)->count(),
                'items_updated_this_year' => \App\Models\InventoryItem::whereYear('updated_at', now()->year)->count(),
            ]);
            
            $query = \App\Models\InventoryItem::query();
            
            // Apply date range filter based on report type
            if ($reportType === 'used_rejected' || $reportType === 'in_out') {
                // For transaction-based reports, we need to get items that have movements in the date range
                $query->whereHas('movements', function($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                });
            } else {
                // For "all" report type, show all items regardless of date
                // This ensures users always see data when they select "All Supplies"
                if ($reportType === 'all') {
                    // Don't apply date filter for "all" - show all items
                    \Log::info('All report type selected - showing all items without date filter');
                } else {
                    // For other report types, filter by updated_at
                    $query->whereBetween('updated_at', [$startDate, $endDate]);
                }
            }
            
            if ($request->filled('category')) {
                $query->where('category', $request->category);
            }

            if ($request->filled('low_stock')) {
                $query->where('low_stock_alert', '>', 0);
            }

            $supplies = $query->orderBy('item_name')
                ->paginate(20);

            // Transform data to match frontend expectations
            $transformedData = $supplies->getCollection()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->item_name,
                    'code' => $item->item_code,
                    'category' => $item->category,
                    'unit_of_measure' => $item->unit,
                    'current_stock' => $item->stock,
                    'minimum_stock_level' => $item->low_stock_alert,
                    'maximum_stock_level' => $item->max_stock ?? 0,
                    'unit_cost' => $item->unit_cost ?? 0,
                    'total_value' => $item->stock * ($item->unit_cost ?? 0),
                    'is_low_stock' => $item->stock <= $item->low_stock_alert,
                    'is_out_of_stock' => $item->stock <= 0,
                    'is_active' => $item->status === 'Active',
                    'created_at' => $item->created_at,
                ];
            });

            // Create a new paginated result with transformed data
            $supplies = new \Illuminate\Pagination\LengthAwarePaginator(
                $transformedData,
                $supplies->total(),
                $supplies->perPage(),
                $supplies->currentPage(),
                [
                    'path' => $supplies->url($supplies->currentPage()),
                    'pageName' => 'page',
                ]
            );

            $summary = [
                'total_products' => $supplies->count(),
                'low_stock_items' => $supplies->filter(function($item) {
                    return $item['current_stock'] <= $item['minimum_stock_level'];
                })->count(),
                'out_of_stock' => $supplies->filter(function($item) {
                    return $item['current_stock'] <= 0;
                })->count(),
                'total_value' => $supplies->sum('total_value') ?? 0,
            ];

            return Inertia::render('admin/reports/inventory', [
                'filter' => $filter,
                'date' => $date,
                'reportType' => $reportType,
                'data' => $data,
                'supplies' => $supplies,
                'summary' => $summary,
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => [
                    'generated_at' => now()->format('Y-m-d H:i:s'),
                    'generated_by' => 'Test User',
                    'generated_by_role' => 'Admin',
                    'system_version' => '1.0.0',
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Test inventory reports error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Inventory Reports
     */
    public function inventory(Request $request): Response
    {
        // Temporarily disable permission check for testing
        // if (!$this->checkReportAccess('inventory')) {
        //     abort(403, 'You do not have permission to access inventory reports.');
        // }

        try {
            $filter = $request->get('filter', 'daily');
            $date = $request->get('date', now()->format('Y-m-d'));
            $reportType = $request->get('report_type', 'all');
            
            \Log::info('Inventory Report Request', [
                'filter' => $filter,
                'date' => $date,
                'report_type' => $reportType
            ]);
            
            // Get paginated inventory items for the table - apply same date filtering as the data
            $startDate = $this->getStartDate($filter, $date);
            $endDate = $this->getEndDate($filter, $date);
            
            $data = $this->getInventoryReportData($filter, $date, $reportType);
            
            \Log::info('Inventory Report Data', [
                'total_products' => $data['total_products'] ?? 0,
                'supply_details_count' => count($data['supply_details'] ?? []),
                'period' => $data['period'] ?? 'Unknown',
                'start_date' => $startDate->format('Y-m-d H:i:s'),
                'end_date' => $endDate->format('Y-m-d H:i:s'),
                'report_type' => $reportType
            ]);
            
            // Debug: Check if there are any inventory items in the database
            $totalItems = \App\Models\InventoryItem::count();
            \Log::info('Database Debug', [
                'total_items_in_db' => $totalItems,
                'items_updated_today' => \App\Models\InventoryItem::whereDate('updated_at', today())->count(),
                'items_updated_this_month' => \App\Models\InventoryItem::whereMonth('updated_at', now()->month)->count(),
                'items_updated_this_year' => \App\Models\InventoryItem::whereYear('updated_at', now()->year)->count(),
            ]);
            
            $query = \App\Models\InventoryItem::query();
            
            // Apply date range filter based on report type
            if ($reportType === 'used_rejected' || $reportType === 'in_out') {
                // For transaction-based reports, we need to get items that have movements in the date range
                $query->whereHas('movements', function($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                });
            } else {
                // For "all" report type, show all items regardless of date
                // This ensures users always see data when they select "All Supplies"
                if ($reportType === 'all') {
                    // Don't apply date filter for "all" - show all items
                    \Log::info('All report type selected - showing all items without date filter');
                } else {
                    // For other report types, filter by updated_at
                    $query->whereBetween('updated_at', [$startDate, $endDate]);
                }
            }
            
            if ($request->filled('category')) {
                $query->where('category', $request->category);
            }

            if ($request->filled('low_stock')) {
                $query->where('low_stock_alert', '>', 0);
            }

            $supplies = $query->orderBy('item_name')
                ->paginate(20);

            // Transform data to match frontend expectations
            $transformedData = $supplies->getCollection()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->item_name,
                    'code' => $item->item_code,
                    'category' => $item->category,
                    'unit_of_measure' => $item->unit,
                    'current_stock' => $item->stock,
                    'minimum_stock_level' => $item->low_stock_alert,
                    'maximum_stock_level' => $item->max_stock ?? 0,
                    'unit_cost' => $item->unit_cost ?? 0,
                    'total_value' => $item->stock * ($item->unit_cost ?? 0),
                    'is_low_stock' => $item->stock <= $item->low_stock_alert,
                    'is_out_of_stock' => $item->stock <= 0,
                    'is_active' => $item->status === 'Active',
                    'created_at' => $item->created_at,
                ];
            });

            // Create a new paginated result with transformed data
            $supplies = new \Illuminate\Pagination\LengthAwarePaginator(
                $transformedData,
                $supplies->total(),
                $supplies->perPage(),
                $supplies->currentPage(),
                [
                    'path' => $supplies->url($supplies->currentPage()),
                    'pageName' => 'page',
                ]
            );

            $summary = [
                'total_products' => $supplies->count(),
                'low_stock_items' => $supplies->filter(function($item) {
                    return $item['current_stock'] <= $item['minimum_stock_level'];
                })->count(),
                'out_of_stock' => $supplies->filter(function($item) {
                    return $item['current_stock'] <= 0;
                })->count(),
                'total_value' => $supplies->sum('total_value') ?? 0,
            ];

            return Inertia::render('admin/reports/inventory', [
                'filter' => $filter,
                'date' => $date,
                'reportType' => $reportType,
                'data' => $data,
                'supplies' => $supplies,
                'summary' => $summary,
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
            ]);
        } catch (\Exception $e) {
            Log::error('Inventory reports error: ' . $e->getMessage());
            return Inertia::render('admin/reports/inventory', [
                'filter' => 'daily',
                'date' => now()->format('Y-m-d'),
                'reportType' => 'all',
                'data' => [
                    'total_products' => 0,
                    'low_stock_items' => 0,
                    'out_of_stock' => 0,
                    'category_summary' => [],
                    'supply_details' => [],
                    'period' => 'No data available',
                    'start_date' => now()->format('Y-m-d'),
                    'end_date' => now()->format('Y-m-d')
                ],
                'supplies' => collect(),
                'summary' => [
                    'total_products' => 0,
                    'low_stock_items' => 0,
                    'out_of_stock' => 0,
                ],
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
                'error' => 'Unable to load inventory report data.'
            ]);
        }
    }


    /**
     * Export reports in various formats
     */
    public function export(Request $request)
    {
        try {
            $type = $request->get('type', 'all');
            $format = $request->get('format', 'excel');
            $dateFrom = $request->get('date_from');
            $dateTo = $request->get('date_to');

            // Temporarily disable permission check for testing
            // if (!$this->checkReportAccess($type)) {
            //     abort(403, 'You do not have permission to export this report type.');
            // }

            $filename = $type . '_report_' . now()->format('Ymd_His');

            switch ($format) {
                case 'excel':
                    return $this->exportToExcel($type, $request, $filename);
                case 'pdf':
                    return $this->exportToPdf($type, $request, $filename);
                case 'csv':
                    return $this->exportToCsv($type, $request, $filename);
                default:
                    return response()->json(['error' => 'Unsupported format'], 400);
            }

        } catch (\Exception $e) {
            Log::error('Report export failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Export failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate growth rate for a model
     */
    private function calculateGrowthRate($model)
    {
        try {
            $currentMonth = $model::where('created_at', '>=', now()->startOfMonth())->count();
            $lastMonth = $model::whereBetween('created_at', [
                now()->subMonth()->startOfMonth(),
                now()->subMonth()->endOfMonth()
            ])->count();

            if ($lastMonth == 0) {
                return $currentMonth > 0 ? 100 : 0;
            }

            return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 2);
        } catch (\Exception $e) {
            Log::error('Growth rate calculation error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Calculate revenue growth rate
     */
    private function calculateRevenueGrowthRate()
    {
        try {
            // Check if transaction_date column exists, otherwise use created_at
            $dateColumn = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
                ? 'transaction_date' 
                : 'created_at';
            
            $currentMonth = BillingTransaction::where($dateColumn, '>=', now()->startOfMonth())->sum('amount') ?? 0;
            $lastMonth = BillingTransaction::whereBetween($dateColumn, [
                now()->subMonth()->startOfMonth(),
                now()->subMonth()->endOfMonth()
            ])->sum('amount') ?? 0;

            if ($lastMonth == 0) {
                return $currentMonth > 0 ? 100 : 0;
            }

            return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 2);
        } catch (\Exception $e) {
            Log::error('Revenue growth rate calculation error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get filter options for dropdowns
     */
    private function getFilterOptions()
    {
        try {
            return [
                'doctors' => User::where('role', 'doctor')->select('id', 'name')->get(),
                'departments' => ['General Medicine', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Laboratory'],
                'statuses' => ['Completed', 'Pending', 'Cancelled', 'In Progress'],
                'payment_methods' => ['Cash', 'Credit Card', 'HMO', 'Insurance'],
                'hmo_providers' => ['Maxicare', 'PhilHealth', 'Intellicare', 'MediCard'],
            ];
        } catch (\Exception $e) {
            Log::error('Filter options error: ' . $e->getMessage());
            return [
                'doctors' => [],
                'departments' => [],
                'statuses' => [],
                'payment_methods' => [],
                'hmo_providers' => [],
            ];
        }
    }

    /**
     * Get recent reports
     */
    private function getRecentReports()
    {
        $user = Auth::user();

        return [
            [
                'id' => 1,
                'name' => 'Monthly Financial Report',
                'type' => 'Financial',
                'dateRange' => 'January 2025',
                'generatedBy' => $user->name,
                'status' => 'Generated',
                'lastGenerated' => now()->format('Y-m-d H:i A'),
                'downloadUrl' => '/reports/financial-jan-2025.pdf'
            ],
            [
                'id' => 2,
                'name' => 'Patient Analytics Report',
                'type' => 'Analytics',
                'dateRange' => 'Q4 2024',
                'generatedBy' => $user->name,
                'status' => 'Generated',
                'lastGenerated' => now()->subDays(5)->format('Y-m-d H:i A'),
                'downloadUrl' => '/reports/patient-analytics-q4-2024.pdf'
            ],
        ];
    }

    /**
     * Get start date based on filter and date
     */
    private function getStartDate($filter, $date)
    {
        $carbonDate = \Carbon\Carbon::parse($date);
        
        $result = match ($filter) {
            'daily' => $carbonDate->startOfDay(),
            'monthly' => $carbonDate->startOfMonth(),
            'yearly' => $carbonDate->startOfYear(),
            default => $carbonDate->startOfDay(),
        };
        
        \Log::info('getStartDate', [
            'filter' => $filter,
            'date' => $date,
            'result' => $result->format('Y-m-d H:i:s')
        ]);
        
        return $result;
    }

    /**
     * Get end date based on filter and date
     */
    private function getEndDate($filter, $date)
    {
        $carbonDate = \Carbon\Carbon::parse($date);
        
        $result = match ($filter) {
            'daily' => $carbonDate->endOfDay(),
            'monthly' => $carbonDate->endOfMonth(),
            'yearly' => $carbonDate->endOfYear(),
            default => $carbonDate->endOfDay(),
        };
        
        \Log::info('getEndDate', [
            'filter' => $filter,
            'date' => $date,
            'result' => $result->format('Y-m-d H:i:s')
        ]);
        
        return $result;
    }

    /**
     * Get period label for display
     */
    private function getPeriodLabel($filter, $date)
    {
        $carbonDate = \Carbon\Carbon::parse($date);
        
        switch ($filter) {
            case 'daily':
                return 'Daily Report - ' . $carbonDate->format('M d, Y');
            case 'monthly':
                return 'Monthly Report - ' . $carbonDate->format('F Y');
            case 'yearly':
                return 'Yearly Report - ' . $carbonDate->format('Y');
            default:
                return 'Daily Report - ' . $carbonDate->format('M d, Y');
        }
    }

    /**
     * Apply date range filter to query
     */
    private function applyDateRangeFilter($query, $filter, $date, $dateField = 'created_at')
    {
        $startDate = $this->getStartDate($filter, $date);
        $endDate = $this->getEndDate($filter, $date);
        
        return $query->whereBetween($dateField, [$startDate, $endDate]);
    }

    /**
     * Apply common filters to query
     */
    private function applyCommonFilters($query, Request $request, $dateField = 'created_at')
    {
        try {
            if ($request->filled('date_from')) {
                $query->where($dateField, '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->where($dateField, '<=', $request->date_to);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('patient_no', 'like', "%{$search}%");
                });
            }

            return $query;
        } catch (\Exception $e) {
            Log::error('Common filters error: ' . $e->getMessage());
            return $query;
        }
    }

    /**
     * Generate report metadata
     */
    private function getReportMetadata()
    {
        $user = Auth::user();
        return [
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'generated_by' => $user->name,
            'generated_by_role' => $user->role,
            'system_version' => '1.0.0',
        ];
    }

    /**
     * Check if user has access to specific report type
     */
    private function checkReportAccess($reportType)
    {
        $user = Auth::user();
        
        // If no user is authenticated, deny access
        if (!$user) {
            return false;
        }

        switch ($user->role) {
            case 'admin':
                return true; // Full access
            case 'hospital_admin':
            case 'hospital_staff':
                return in_array($reportType, ['patients', 'financial']); // Hospital roles have access to patients and financial reports
            case 'doctor':
                return in_array($reportType, ['patients', 'laboratory', 'appointments']);
            case 'cashier':
                return in_array($reportType, ['financial', 'patients']);
            case 'laboratory_technologist':
            case 'medtech':
                return in_array($reportType, ['laboratory', 'inventory']);
            default:
                return false;
        }
    }

    /**
     * Get financial chart data
     */
    private function getFinancialChartData(Request $request)
    {
        try {
            // Check if transaction_date column exists, otherwise use created_at
            $dateColumn = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
                ? 'transaction_date' 
                : 'created_at';
            
            $dateFrom = $request->get('date_from', now()->startOfMonth());
            $dateTo = $request->get('date_to', now()->endOfMonth());

            // Monthly revenue trend
            $monthlyData = BillingTransaction::whereBetween($dateColumn, [$dateFrom, $dateTo])
                ->selectRaw("DATE_FORMAT(`{$dateColumn}`, '%Y-%m') as month, SUM(amount) as revenue")
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            // Payment method distribution
            $paymentMethods = BillingTransaction::whereBetween($dateColumn, [$dateFrom, $dateTo])
                ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as amount')
                ->groupBy('payment_method')
                ->get();

            return [
                'monthly_revenue' => $monthlyData,
                'payment_methods' => $paymentMethods,
            ];
        } catch (\Exception $e) {
            Log::error('Financial chart data error: ' . $e->getMessage());
            return [
                'monthly_revenue' => collect(),
                'payment_methods' => collect(),
            ];
        }
    }

    /**
     * Get patient chart data
     */
    private function getPatientChartData(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->startOfMonth());
            $dateTo = $request->get('date_to', now()->endOfMonth());

            // Gender distribution
            $genderData = Patient::whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('sex, COUNT(*) as count')
                ->groupBy('sex')
                ->get();

            // Age group distribution
            $ageGroups = Patient::whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('
                    CASE
                        WHEN age < 18 THEN "0-17"
                        WHEN age BETWEEN 18 AND 30 THEN "18-30"
                        WHEN age BETWEEN 31 AND 50 THEN "31-50"
                        WHEN age BETWEEN 51 AND 70 THEN "51-70"
                        ELSE "70+"
                    END as age_group,
                    COUNT(*) as count
                ')
                ->groupBy('age_group')
                ->get();

            return [
                'gender_distribution' => $genderData,
                'age_groups' => $ageGroups,
            ];
        } catch (\Exception $e) {
            Log::error('Patient chart data error: ' . $e->getMessage());
            return [
                'gender_distribution' => collect(),
                'age_groups' => collect(),
            ];
        }
    }

    /**
     * Get age group distribution
     */
    private function getAgeGroupDistribution($patients)
    {
        try {
            return $patients->groupBy(function($patient) {
                if ($patient->age < 18) return '0-17';
                if ($patient->age <= 30) return '18-30';
                if ($patient->age <= 50) return '31-50';
                if ($patient->age <= 70) return '51-70';
                return '70+';
            })->map->count();
        } catch (\Exception $e) {
            Log::error('Age group distribution error: ' . $e->getMessage());
            return collect();
        }
    }

    /**
     * Export to Excel
     */
    private function exportToExcel($type, Request $request, $filename)
    {
        try {
            $data = $this->getReportData($type, $request);
            $metadata = $this->getReportMetadata();
            
            // Create export data based on type
            $exportData = [];
            
            if ($type === 'all') {
                // Export all data types
                $exportData = $this->getAllReportData($request);
            } else {
                // Export specific type
                $exportData = $this->formatDataForExport($data, $type);
            }
            
            return Excel::download(
                new \App\Exports\ArrayExport($exportData, ucfirst($type) . ' Report - ' . now()->format('Y-m-d')),
                $filename . '.xlsx'
            );
        } catch (\Exception $e) {
            Log::error('Excel export failed: ' . $e->getMessage());
            return response()->json(['error' => 'Excel export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export to PDF
     */
    private function exportToPdf($type, Request $request, $filename)
    {
        try {
            $data = $this->getReportData($type, $request);
            $metadata = $this->getReportMetadata();

            // Transform data for PDF template based on type
            $pdfData = $this->formatDataForPdf($data, $type);
            
            // Debug: Log the data being passed to PDF
            \Log::info('PDF Data Debug for ' . $type, [
                'pdf_data_keys' => array_keys($pdfData),
                'has_supply_details' => isset($pdfData['supply_details']),
                'supply_details_count' => isset($pdfData['supply_details']) ? count($pdfData['supply_details']) : 0,
                'supply_details_sample' => isset($pdfData['supply_details']) && count($pdfData['supply_details']) > 0 ? $pdfData['supply_details'][0] : 'empty'
            ]);

            // Convert logo to base64 for PDF
            $logoPath = public_path('st-james-logo.png');
            $logoBase64 = '';
            if (file_exists($logoPath)) {
                $logoData = file_get_contents($logoPath);
                $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
            }

            $pdf = Pdf::loadView("reports.{$type}", [
                'data' => $pdfData,
                'transactions' => $data['transactions'] ?? [],
                'metadata' => $metadata,
                'filters' => $request->all(),
                'title' => ucfirst($type) . ' Report',
                'dateRange' => $this->getDateRangeString($request),
                'logoBase64' => $logoBase64,
            ]);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'Arial',
            ]);

            return $pdf->download("{$filename}.pdf");

        } catch (\Exception $e) {
            Log::error("PDF export failed for {$type}: " . $e->getMessage());
            Log::error("PDF export stack trace: " . $e->getTraceAsString());
            return response()->json(['error' => 'PDF generation failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export to CSV
     */
    private function exportToCsv($type, Request $request, $filename)
    {
        try {
            $data = $this->getReportData($type, $request);
            $exportData = $this->formatDataForExport($data, $type);
            
            $csvData = [];
            
            // Add headers
            if (!empty($exportData)) {
                $csvData[] = array_keys($exportData[0]);
            }
            
            // Add data rows
            foreach ($exportData as $row) {
                $csvData[] = array_values($row);
            }
            
            $csvContent = '';
            foreach ($csvData as $row) {
                $csvContent .= implode(',', array_map(function($field) {
                    return '"' . str_replace('"', '""', $field) . '"';
                }, $row)) . "\n";
            }
            
            return response($csvContent)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '.csv"');
                
        } catch (\Exception $e) {
            Log::error('CSV export failed: ' . $e->getMessage());
            return response()->json(['error' => 'CSV export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get report data based on type
     */
    private function getReportData($type, Request $request)
    {
        try {
            switch ($type) {
                case 'financial':
                    return $this->getFinancialReportData($request);
                case 'patients':
                    $filter = $request->get('filter', 'daily');
                    $date = $request->get('date', now()->format('Y-m-d'));
                    return $this->getPatientReportData($filter, $date);
                case 'laboratory':
                    return $this->getLaboratoryReportData($request);
                case 'inventory':
                    $filter = $request->get('filter', 'daily');
                    $date = $request->get('date', now()->format('Y-m-d'));
                    $reportType = $request->get('report_type', 'all');
                    return $this->getInventoryReportData($filter, $date, $reportType);
                default:
                    return [];
            }
        } catch (\Exception $e) {
            Log::error("Report data error for {$type}: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get financial report data based on filter, date, and report type
     */
    private function getFinancialReportData($filter, $date, $reportType = 'all')
    {
        try {
            $startDate = $this->getStartDate($filter, $date);
            $endDate = $this->getEndDate($filter, $date);
            
            // Check if transaction_date column exists, otherwise use created_at
            $dateColumn = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
                ? 'transaction_date' 
                : 'created_at';
            
            // Get transactions for the period
            $query = BillingTransaction::with(['patient', 'doctor'])
                ->whereBetween($dateColumn, [$startDate, $endDate]);
            
            // Apply report type filtering
            if ($reportType === 'cash') {
                $query->where('payment_method', 'cash');
            } elseif ($reportType === 'hmo') {
                $query->where('payment_method', 'hmo');
            }
            // 'all' shows all payment methods
            
            $transactions = $query->get();

            // Calculate statistics
            $totalTransactions = $transactions->count();
            $pendingTransactions = $transactions->where('status', 'pending')->count();
            $completedTransactions = $transactions->where('status', 'paid')->count();
            
            // Get payment summary
            $paymentSummary = $transactions->groupBy('payment_method')
                ->map(function ($group) {
                    return $group->count();
                })->toArray();
            
            // Get transaction details
            $transactionDetails = $transactions->map(function ($transaction) use ($dateColumn) {
                return [
                    'id' => $transaction->id,
                    'patient_name' => $transaction->patient ? 
                        $transaction->patient->first_name . ' ' . $transaction->patient->last_name : 
                        'Unknown Patient',
                    'doctor_name' => $transaction->doctor ? 
                        $transaction->doctor->name : 
                        'Unknown Doctor',
                    'total_amount' => $transaction->amount, // Use final amount after discounts
                    'original_amount' => $transaction->total_amount, // Original amount before discounts
                    'discount_amount' => $transaction->discount_amount ?? 0,
                    'senior_discount_amount' => $transaction->senior_discount_amount ?? 0,
                    'payment_method' => $transaction->payment_method,
                    'transaction_date' => $transaction->{$dateColumn} ?? $transaction->created_at,
                    'status' => $transaction->status,
                ];
            });

            // Calculate financial summary
            $totalRevenue = $transactions->sum('amount'); // Use final amount after discounts
            $cashTotal = $transactions->where('payment_method', 'cash')->sum('amount');
            $hmoTotal = $transactions->where('payment_method', 'hmo')->sum('amount');
            $pendingAmount = $transactions->where('status', 'pending')->sum('amount');

            return [
                'summary' => [
                    'total_revenue' => $totalRevenue,
                    'total_transactions' => $totalTransactions,
                    'cash_total' => $cashTotal,
                    'hmo_total' => $hmoTotal,
                    'pending_amount' => $pendingAmount,
                ],
                'total_transactions' => $totalTransactions,
                'pending_transactions' => $pendingTransactions,
                'completed_transactions' => $completedTransactions,
                'completion_rate' => $totalTransactions > 0 ? round(($completedTransactions / $totalTransactions) * 100, 2) : 0,
                'payment_summary' => $paymentSummary,
                'transaction_details' => $transactionDetails,
                'period' => $this->getPeriodLabel($filter, $date),
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ];
        } catch (\Exception $e) {
            Log::error('Financial report data error: ' . $e->getMessage());
            return [
                'summary' => [
                    'total_revenue' => 0,
                    'total_transactions' => 0,
                    'cash_total' => 0,
                    'hmo_total' => 0,
                    'pending_amount' => 0,
                ],
                'total_transactions' => 0,
                'pending_transactions' => 0,
                'completed_transactions' => 0,
                'completion_rate' => 0,
                'payment_summary' => [],
                'transaction_details' => [],
                'period' => 'No data available',
                'start_date' => $date,
                'end_date' => $date
            ];
        }
    }

    /**
     * Get financial report data (legacy method)
     */
    private function getFinancialReportDataLegacy(Request $request)
    {
        try {
            // Check if transaction_date column exists, otherwise use created_at
            $dateField = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
                ? 'transaction_date' 
                : 'created_at';
            
            $query = BillingTransaction::query();
            $this->applyCommonFilters($query, $request, $dateField);

            if ($request->filled('doctor_id')) {
                $query->where('doctor_id', $request->doctor_id);
            }

            if ($request->filled('payment_method')) {
                $query->where('payment_method', $request->payment_method);
            }

            if ($request->filled('hmo_provider')) {
                $query->where('hmo_provider', $request->hmo_provider);
            }

            $transactions = $query->with(['patient', 'doctor'])
                ->orderBy($dateField, 'desc')
                ->get();

            // Transform data to match frontend expectations (same as main page)
            $transformedTransactions = $transactions->map(function ($transaction) use ($dateField) {
                return [
                    'id' => $transaction->id,
                    'patient_name' => $transaction->patient ? 
                        $transaction->patient->first_name . ' ' . $transaction->patient->last_name : 
                        'Unknown Patient',
                    'doctor_name' => $transaction->doctor ? 
                        $transaction->doctor->name : 
                        'Unknown Doctor',
                    'total_amount' => $transaction->amount, // Use final amount after discounts
                    'original_amount' => $transaction->total_amount, // Original amount before discounts
                    'discount_amount' => $transaction->discount_amount ?? 0,
                    'senior_discount_amount' => $transaction->senior_discount_amount ?? 0,
                    'payment_method' => $transaction->payment_method,
                    'transaction_date' => $transaction->{$dateField} ?? $transaction->created_at,
                    'status' => $transaction->status,
                ];
            });

            return [
                'transactions' => $transformedTransactions,
                'summary' => [
                    'total_revenue' => $transactions->sum('amount') ?? 0, // Use final amount after discounts
                    'total_transactions' => $transactions->count(),
                    'average_transaction' => $transactions->avg('amount') ?? 0, // Use final amount after discounts
                    'cash_payments' => $transactions->where('payment_method', 'cash')->sum('amount') ?? 0,
                    'hmo_payments' => $transactions->where('payment_method', 'hmo')->sum('amount') ?? 0,
                    'date_from' => $request->get('date_from'),
                    'date_to' => $request->get('date_to'),
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Financial report data error: ' . $e->getMessage());
            return [
                'transactions' => collect(),
                'summary' => [
                    'total_revenue' => 0,
                    'total_transactions' => 0,
                    'average_transaction' => 0,
                ]
            ];
        }
    }

    /**
     * Get patient report data based on filter and date
     */
    private function getPatientReportData($filter, $date)
    {
        try {
            $startDate = $this->getStartDate($filter, $date);
            $endDate = $this->getEndDate($filter, $date);
            
            // Get patients for the period
            $patients = Patient::whereBetween('created_at', [$startDate, $endDate])
                ->get();

            // Calculate statistics
            $totalPatients = $patients->count();
            $newPatients = $patients->filter(function($patient) {
                $createdDate = $patient->created_at;
                $now = now();
                $startOfMonth = $now->copy()->startOfMonth();
                return $createdDate->gte($startOfMonth);
            })->count();
            $malePatients = $patients->where('sex', 'male')->count();
            $femalePatients = $patients->where('sex', 'female')->count();
            
            // Calculate age groups
            $ageGroups = $patients->groupBy(function($patient) {
                $age = $patient->age;
                if ($age < 18) return '0-17';
                if ($age <= 30) return '18-30';
                if ($age <= 50) return '31-50';
                if ($age <= 70) return '51-70';
                return '70+';
            })->map->count()->toArray();
            
            // Get patient details
            $patientDetails = $patients->map(function ($patient) {
                return [
                    'id' => $patient->id,
                    'patient_no' => $patient->patient_no,
                    'full_name' => $patient->first_name . ' ' . $patient->last_name,
                    'birthdate' => $patient->birthdate,
                    'age' => $patient->age,
                    'sex' => $patient->sex,
                    'mobile_no' => $patient->phone,
                    'present_address' => $patient->address,
                    'created_at' => $patient->created_at,
                    'appointments_count' => $patient->appointments()->count(),
                    'lab_orders_count' => $patient->labOrders()->count(),
                ];
            });

            return [
                'total_patients' => $totalPatients,
                'new_patients' => $newPatients,
                'male_patients' => $malePatients,
                'female_patients' => $femalePatients,
                'age_groups' => $ageGroups,
                'patient_details' => $patientDetails->toArray(),
                'period' => $this->getPeriodLabel($filter, $date),
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ];
        } catch (\Exception $e) {
            Log::error('Patient report data error: ' . $e->getMessage());
            return [
                'total_patients' => 0,
                'new_patients' => 0,
                'male_patients' => 0,
                'female_patients' => 0,
                'age_groups' => [],
                'patient_details' => [],
                'period' => 'No data available',
                'start_date' => $date,
                'end_date' => $date
            ];
        }
    }

    /**
     * Get laboratory report data
     */
    private function getLaboratoryReportData(Request $request)
    {
        try {
            $query = LabOrder::query();
            $this->applyCommonFilters($query, $request, 'created_at');

            $labOrders = $query->with(['patient', 'orderedBy'])->get();

            return [
                'labOrders' => $labOrders,
                'summary' => [
                    'total_orders' => $labOrders->count(),
                    'pending' => $labOrders->where('status', 'pending')->count(),
                    'completed' => $labOrders->where('status', 'completed')->count(),
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Laboratory report data error: ' . $e->getMessage());
            return [
                'labOrders' => collect(),
                'summary' => [
                    'total_orders' => 0,
                    'pending' => 0,
                    'completed' => 0,
                ]
            ];
        }
    }

    /**
     * Get inventory report data based on filter, date, and report type
     */
    private function getInventoryReportData($filter, $date, $reportType = 'all')
    {
        try {
            $startDate = $this->getStartDate($filter, $date);
            $endDate = $this->getEndDate($filter, $date);
            
            // Get data based on report type
            if ($reportType === 'used_rejected') {
                return $this->getUsedRejectedReportData($startDate, $endDate, $filter, $date);
            } elseif ($reportType === 'in_out') {
                return $this->getInOutReportData($startDate, $endDate, $filter, $date);
            } else {
                // Default: all inventory items
                \Log::info('Calling getAllInventoryItemsReportData for report type: ' . $reportType);
                return $this->getAllInventoryItemsReportData($startDate, $endDate, $filter, $date);
            }
        } catch (\Exception $e) {
            Log::error('Inventory report data error: ' . $e->getMessage());
            return [
                'total_products' => 0,
                'low_stock_items' => 0,
                'out_of_stock' => 0,
                'category_summary' => [],
                'supply_details' => [],
                'period' => 'No data available',
                'start_date' => $date,
                'end_date' => $date
            ];
        }
    }

    /**
     * Appointment Reports
     */
    public function appointments(Request $request): Response
    {
        try {
            $filter = $request->get('filter', 'daily');
            $date = $request->get('date', now()->format('Y-m-d'));
            $reportType = $request->get('report_type', 'all');
            
            \Log::info('Appointment Report Request', [
                'filter' => $filter,
                'date' => $date,
                'report_type' => $reportType
            ]);
            
            // Get date range based on filter
            $startDate = $this->getStartDate($filter, $date);
            $endDate = $this->getEndDate($filter, $date);
            
            $data = $this->getAppointmentReportData($filter, $date, $reportType);
            
            \Log::info('Appointment Report Data Structure', [
                'data_type' => gettype($data),
                'appointment_details_type' => gettype($data['appointment_details'] ?? null),
                'appointment_details_count' => is_array($data['appointment_details'] ?? null) ? count($data['appointment_details']) : 'not_array',
                'appointment_details_sample' => is_array($data['appointment_details'] ?? null) && count($data['appointment_details']) > 0 ? array_slice($data['appointment_details'], 0, 2) : 'no_data',
                'appointment_codes_sample' => is_array($data['appointment_details'] ?? null) && count($data['appointment_details']) > 0 ? 
                    array_map(function($apt) { return ['id' => $apt['id'], 'appointment_code' => $apt['appointment_code']]; }, array_slice($data['appointment_details'], 0, 3)) : 'no_data'
            ]);
            
            // Get paginated appointments for the table
            $query = \App\Models\Appointment::with(['patient', 'specialist']);
            
            // Apply date range filter based on report type
            if ($reportType === 'all') {
                // For "all" report type, show all appointments regardless of date
                \Log::info('All appointment report type selected - showing all appointments without date filter');
            } else {
                // For other report types, filter by appointment_date
                // Check if appointments have appointment_date field populated
                $appointmentsWithDates = \App\Models\Appointment::whereNotNull('appointment_date')->count();
                if ($appointmentsWithDates === 0) {
                    \Log::info('No appointments with appointment_date found, using created_at for table filtering');
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                } else {
                    $query->whereBetween('appointment_date', [$startDate, $endDate]);
                }
            }
            
            // Apply specific filters based on report type
            if ($reportType === 'doctor_only') {
                $query->where('specialist_type', 'Doctor');
                \Log::info('Applied doctor_only filter');
            } elseif ($reportType === 'medtech_only') {
                $query->where('specialist_type', 'MedTech');
                \Log::info('Applied medtech_only filter');
            } elseif ($reportType === 'nurse_only') {
                $query->where('specialist_type', 'Nurse');
                \Log::info('Applied nurse_only filter');
            } elseif ($reportType === 'online_only') {
                $query->where('source', 'Online');
                \Log::info('Applied online_only filter');
            } elseif ($reportType === 'walkin_only') {
                $query->where('source', 'Walk-in');
                \Log::info('Applied walkin_only filter');
            } elseif ($reportType === 'consultation') {
                $query->where(function($q) {
                    $q->whereRaw('LOWER(appointment_type) LIKE ?', ['%consultation%'])
                      ->orWhereRaw('LOWER(appointment_type) LIKE ?', ['%consult%'])
                      ->orWhereRaw('LOWER(appointment_type) LIKE ?', ['%checkup%'])
                      ->orWhereRaw('LOWER(appointment_type) LIKE ?', ['%examination%']);
                });
                \Log::info('Applied consultation filter');
            } elseif ($reportType === 'follow_up') {
                $query->where(function($q) {
                    $q->whereRaw('LOWER(appointment_type) LIKE ?', ['%follow%'])
                      ->orWhereRaw('LOWER(appointment_type) LIKE ?', ['%followup%'])
                      ->orWhereRaw('LOWER(appointment_type) LIKE ?', ['%follow-up%'])
                      ->orWhereRaw('LOWER(appointment_type) LIKE ?', ['%return%']);
                });
                \Log::info('Applied follow_up filter');
            } elseif ($reportType === 'emergency') {
                $query->where(function($q) {
                    $q->whereRaw('LOWER(appointment_type) LIKE ?', ['%emergency%'])
                      ->orWhereRaw('LOWER(appointment_type) LIKE ?', ['%urgent%'])
                      ->orWhereRaw('LOWER(appointment_type) LIKE ?', ['%acute%']);
                });
                \Log::info('Applied emergency filter');
            } elseif ($reportType === 'routine_checkup') {
                $query->where(function($q) {
                    $q->whereRaw('LOWER(appointment_type) LIKE ?', ['%routine%'])
                      ->orWhereRaw('LOWER(appointment_type) LIKE ?', ['%checkup%'])
                      ->orWhereRaw('LOWER(appointment_type) LIKE ?', ['%preventive%'])
                      ->orWhereRaw('LOWER(appointment_type) LIKE ?', ['%annual%']);
                });
                \Log::info('Applied routine_checkup filter');
            }
            
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->filled('specialist_type')) {
                $query->where('specialist_type', $request->specialist_type);
            }
            
            if ($request->filled('appointment_type')) {
                $query->where('appointment_type', $request->appointment_type);
            }
            
            $appointments = $query->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->paginate(20);
            
            \Log::info('Appointment Query Results', [
                'report_type' => $reportType,
                'total_appointments' => $appointments->total(),
                'current_page_appointments' => $appointments->count(),
                'sample_appointments' => $appointments->items() ? array_map(function($apt) {
                    return [
                        'id' => $apt->id,
                        'specialist_type' => $apt->specialist_type,
                        'source' => $apt->source,
                        'appointment_type' => $apt->appointment_type,
                        'status' => $apt->status
                    ];
                }, array_slice($appointments->items(), 0, 3)) : []
            ]);
            
            return Inertia::render('admin/reports/appointments', [
                'filter' => $filter,
                'date' => $date,
                'reportType' => $reportType,
                'data' => $data,
                'appointments' => $appointments,
                'summary' => $data,
                'filterOptions' => $this->getAppointmentFilterOptions(),
                'metadata' => $this->getReportMetadata()
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Appointment Report Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('admin/reports/appointments', [
                'filter' => $request->get('filter', 'daily'),
                'date' => $request->get('date', now()->format('Y-m-d')),
                'reportType' => $request->get('report_type', 'all'),
                'data' => [
                    'total_appointments' => 0,
                    'pending_appointments' => 0,
                    'confirmed_appointments' => 0,
                    'completed_appointments' => 0,
                    'cancelled_appointments' => 0,
                    'total_revenue' => 0,
                    'online_appointments' => 0,
                    'walk_in_appointments' => 0,
                    'doctor_appointments' => 0,
                    'medtech_appointments' => 0,
                    'nurse_appointments' => 0,
                    'appointment_details' => [],
                    'period' => 'No data available',
                    'start_date' => $request->get('date', now()->format('Y-m-d')),
                    'end_date' => $request->get('date', now()->format('Y-m-d'))
                ],
                'appointments' => new \Illuminate\Pagination\LengthAwarePaginator([], 0, 20),
                'summary' => [],
                'filterOptions' => $this->getAppointmentFilterOptions(),
                'metadata' => $this->getReportMetadata()
            ]);
        }
    }

    /**
     * Get appointment report data
     */
    private function getAppointmentReportData($filter, $date, $reportType = 'all')
    {
        try {
            $startDate = $this->getStartDate($filter, $date);
            $endDate = $this->getEndDate($filter, $date);
            
            \Log::info('getAppointmentReportData Debug', [
                'start_date' => $startDate->format('Y-m-d H:i:s'),
                'end_date' => $endDate->format('Y-m-d H:i:s'),
                'filter' => $filter,
                'date' => $date,
                'report_type' => $reportType
            ]);
            
            // Debug: Check what appointments exist in the database
            $totalAppointments = \App\Models\Appointment::count();
            $appointmentsWithDates = \App\Models\Appointment::whereNotNull('appointment_date')->count();
            $doctorAppointments = \App\Models\Appointment::where('specialist_type', 'Doctor')->count();
            $yearlyAppointments = \App\Models\Appointment::whereBetween('appointment_date', [$startDate, $endDate])->count();
            $yearlyDoctorAppointments = \App\Models\Appointment::whereBetween('appointment_date', [$startDate, $endDate])
                ->where('specialist_type', 'Doctor')->count();
            
            \Log::info('Database Appointment Debug', [
                'total_appointments' => $totalAppointments,
                'appointments_with_dates' => $appointmentsWithDates,
                'doctor_appointments_total' => $doctorAppointments,
                'yearly_appointments' => $yearlyAppointments,
                'yearly_doctor_appointments' => $yearlyDoctorAppointments,
                'date_range' => $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d')
            ]);
            
            // Get appointments based on report type
            if ($reportType === 'all') {
                // For "all" report type, get all appointments regardless of date
                $appointments = \App\Models\Appointment::with(['patient', 'specialist'])->get();
                \Log::info('All appointment report type - getting all appointments without date filter');
            } else {
                // For other report types, filter by appointment_date
                // If no appointments have appointment_date, fall back to created_at
                if ($appointmentsWithDates === 0) {
                    \Log::info('No appointments with appointment_date found, using created_at for filtering');
                    $appointments = \App\Models\Appointment::with(['patient', 'specialist'])
                        ->whereBetween('created_at', [$startDate, $endDate])
                        ->get();
                } else {
                    $appointments = \App\Models\Appointment::with(['patient', 'specialist'])
                        ->whereBetween('appointment_date', [$startDate, $endDate])
                        ->get();
                }
            }
            
            // Apply specific filters based on report type
            if ($reportType === 'doctor_only') {
                $appointments = $appointments->where('specialist_type', 'Doctor');
                \Log::info('Applied doctor_only filter to summary data');
            } elseif ($reportType === 'medtech_only') {
                $appointments = $appointments->where('specialist_type', 'MedTech');
                \Log::info('Applied medtech_only filter to summary data');
            } elseif ($reportType === 'nurse_only') {
                $appointments = $appointments->where('specialist_type', 'Nurse');
                \Log::info('Applied nurse_only filter to summary data');
            } elseif ($reportType === 'online_only') {
                $appointments = $appointments->where('source', 'Online');
                \Log::info('Applied online_only filter to summary data');
            } elseif ($reportType === 'walkin_only') {
                $appointments = $appointments->where('source', 'Walk-in');
                \Log::info('Applied walkin_only filter to summary data');
            } elseif ($reportType === 'consultation') {
                $appointments = $appointments->filter(function($appointment) {
                    $type = strtolower($appointment->appointment_type);
                    return strpos($type, 'consultation') !== false ||
                           strpos($type, 'consult') !== false ||
                           strpos($type, 'checkup') !== false ||
                           strpos($type, 'examination') !== false;
                });
                \Log::info('Applied consultation filter to summary data');
            } elseif ($reportType === 'follow_up') {
                $appointments = $appointments->filter(function($appointment) {
                    $type = strtolower($appointment->appointment_type);
                    return strpos($type, 'follow') !== false ||
                           strpos($type, 'followup') !== false ||
                           strpos($type, 'follow-up') !== false ||
                           strpos($type, 'return') !== false;
                });
                \Log::info('Applied follow_up filter to summary data');
            } elseif ($reportType === 'emergency') {
                $appointments = $appointments->filter(function($appointment) {
                    $type = strtolower($appointment->appointment_type);
                    return strpos($type, 'emergency') !== false ||
                           strpos($type, 'urgent') !== false ||
                           strpos($type, 'acute') !== false;
                });
                \Log::info('Applied emergency filter to summary data');
            } elseif ($reportType === 'routine_checkup') {
                $appointments = $appointments->filter(function($appointment) {
                    $type = strtolower($appointment->appointment_type);
                    return strpos($type, 'routine') !== false ||
                           strpos($type, 'checkup') !== false ||
                           strpos($type, 'preventive') !== false ||
                           strpos($type, 'annual') !== false;
                });
                \Log::info('Applied routine_checkup filter to summary data');
            }
                
            \Log::info('Appointments Query Result', [
                'appointments_count' => $appointments->count(),
                'date_range' => $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d'),
                'first_appointment' => $appointments->first() ? [
                    'id' => $appointments->first()->id,
                    'patient_name' => $appointments->first()->patient_name ?? 'Unknown',
                    'appointment_date' => $appointments->first()->appointment_date
                ] : null
            ]);

            // Calculate statistics
            $totalAppointments = $appointments->count();
            $pendingAppointments = $appointments->where('status', 'Pending')->count();
            $confirmedAppointments = $appointments->where('status', 'Confirmed')->count();
            $completedAppointments = $appointments->where('status', 'Completed')->count();
            $cancelledAppointments = $appointments->where('status', 'Cancelled')->count();
            $totalRevenue = $appointments->sum('price');
            $onlineAppointments = $appointments->where('source', 'Online')->count();
            $walkInAppointments = $appointments->where('source', 'Walk-in')->count();
            $doctorAppointments = $appointments->where('specialist_type', 'Doctor')->count();
            $medtechAppointments = $appointments->where('specialist_type', 'MedTech')->count();
            $nurseAppointments = $appointments->where('specialist_type', 'Nurse')->count();
            
            // Get appointment details - transform to match frontend expectations
            $appointmentDetails = $appointments->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'appointment_code' => $appointment->appointment_code ?: 'A' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT),
                    'patient_name' => $appointment->patient ? trim($appointment->patient->first_name . ' ' . $appointment->patient->last_name) : 'Unknown Patient',
                    'patient_id' => $appointment->patient_id,
                    'contact_number' => $appointment->patient ? $appointment->patient->mobile_no : 'N/A',
                    'appointment_type' => $appointment->appointment_type,
                    'specialist_type' => $appointment->specialist_type,
                    'specialist_name' => $appointment->specialist ? $appointment->specialist->name : 'Unknown Specialist',
                    'specialist_id' => $appointment->specialist_id,
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'duration' => $appointment->duration,
                    'price' => $appointment->price,
                    'status' => $appointment->status,
                    'source' => $appointment->source,
                    'created_at' => $appointment->created_at,
                    'notes' => $appointment->notes,
                    'special_requirements' => $appointment->special_requirements,
                ];
            });
            
            return [
                'total_appointments' => $totalAppointments,
                'pending_appointments' => $pendingAppointments,
                'confirmed_appointments' => $confirmedAppointments,
                'completed_appointments' => $completedAppointments,
                'cancelled_appointments' => $cancelledAppointments,
                'total_revenue' => $totalRevenue,
                'online_appointments' => $onlineAppointments,
                'walk_in_appointments' => $walkInAppointments,
                'doctor_appointments' => $doctorAppointments,
                'medtech_appointments' => $medtechAppointments,
                'nurse_appointments' => $nurseAppointments,
                'appointment_details' => $appointmentDetails->toArray(),
                'period' => $this->getPeriodDescription($filter, $date),
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ];
            
        } catch (\Exception $e) {
            \Log::error('getAppointmentReportData Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'total_appointments' => 0,
                'pending_appointments' => 0,
                'confirmed_appointments' => 0,
                'completed_appointments' => 0,
                'cancelled_appointments' => 0,
                'total_revenue' => 0,
                'online_appointments' => 0,
                'walk_in_appointments' => 0,
                'doctor_appointments' => 0,
                'medtech_appointments' => 0,
                'nurse_appointments' => 0,
                'appointment_details' => [],
                'period' => 'No data available',
                'start_date' => $date,
                'end_date' => $date
            ];
        }
    }

    /**
     * Get appointment filter options
     */
    private function getAppointmentFilterOptions()
    {
        $appointmentTypes = \App\Models\Appointment::distinct()->pluck('appointment_type')->filter()->values()->toArray();
        
        \Log::info('Available appointment types in database:', $appointmentTypes);
        
        return [
            'statuses' => ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No Show'],
            'specialist_types' => ['Doctor', 'MedTech', 'Nurse'],
            'sources' => ['Online', 'Walk-in'],
            'appointment_types' => $appointmentTypes
        ];
    }

    /**
     * Get period description based on filter and date
     */
    private function getPeriodDescription($filter, $date)
    {
        switch ($filter) {
            case 'daily':
                return 'Daily Report - ' . \Carbon\Carbon::parse($date)->format('F j, Y');
            case 'monthly':
                return 'Monthly Report - ' . \Carbon\Carbon::parse($date)->format('F Y');
            case 'yearly':
                return 'Yearly Report - ' . \Carbon\Carbon::parse($date)->format('Y');
            default:
                return 'All Time';
        }
    }

    private function getAllInventoryItemsReportData($startDate, $endDate, $filter, $date)
    {
        try {
            \Log::info('getAllInventoryItemsReportData Debug', [
                'start_date' => $startDate->format('Y-m-d H:i:s'),
                'end_date' => $endDate->format('Y-m-d H:i:s'),
                'filter' => $filter,
                'date' => $date
            ]);
            
            // Get all inventory items (no date filtering for "All" inventory reports)
            $inventoryItems = \App\Models\InventoryItem::all();
            \Log::info('Getting all inventory items without date filter');
                
            \Log::info('Inventory Items Query Result', [
                'items_count' => $inventoryItems->count(),
                'date_range' => $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d'),
                'first_item' => $inventoryItems->first() ? [
                    'id' => $inventoryItems->first()->id,
                    'item_name' => $inventoryItems->first()->item_name,
                    'updated_at' => $inventoryItems->first()->updated_at
                ] : null
            ]);

            // Calculate statistics
            $totalProducts = $inventoryItems->count();
            $lowStockItems = $inventoryItems->filter(function($item) {
                return $item->stock <= $item->low_stock_alert || $item->status === 'Low Stock';
            })->count();
            $outOfStock = $inventoryItems->filter(function($item) {
                return $item->stock <= 0 || $item->status === 'Out of Stock';
            })->count();
            
            // Calculate category summary
            $categorySummary = $inventoryItems->groupBy('category')
                ->map(function ($categoryItems) {
                    return [
                        'count' => $categoryItems->count(),
                        'low_stock' => $categoryItems->filter(function($item) {
                            return $item->stock <= $item->low_stock_alert || $item->status === 'Low Stock';
                        })->count(),
                        'out_of_stock' => $categoryItems->filter(function($item) {
                            return $item->stock <= 0 || $item->status === 'Out of Stock';
                        })->count(),
                    ];
                })->toArray();
            
            // Get supply details - transform to match frontend expectations
            $supplyDetails = $inventoryItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->item_name,
                    'code' => $item->item_code,
                    'category' => $item->category,
                    'unit_of_measure' => $item->unit,
                    'current_stock' => $item->stock,
                    'minimum_stock_level' => $item->low_stock_alert,
                    'maximum_stock_level' => null, // Not available in InventoryItem
                    'is_low_stock' => $item->stock <= $item->low_stock_alert || $item->status === 'Low Stock',
                    'is_out_of_stock' => $item->stock <= 0 || $item->status === 'Out of Stock',
                    'is_active' => $item->status !== 'Out of Stock', // Consider active if not out of stock
                    'created_at' => $item->created_at,
                ];
            })->values()->toArray();

            $result = [
                'total_products' => $totalProducts,
                'low_stock_items' => $lowStockItems,
                'out_of_stock' => $outOfStock,
                'category_summary' => $categorySummary,
                'supply_details' => $supplyDetails,
                'period' => $this->getPeriodLabel($filter, $date),
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ];
            
            \Log::info('getAllInventoryItemsReportData returning data', [
                'total_products' => $totalProducts,
                'supply_details_count' => count($supplyDetails),
                'supply_details_sample' => count($supplyDetails) > 0 ? $supplyDetails[0] : 'empty'
            ]);
            
            return $result;
        } catch (\Exception $e) {
            Log::error('Inventory items report data error: ' . $e->getMessage());
            return [
                'total_products' => 0,
                'low_stock_items' => 0,
                'out_of_stock' => 0,
                'category_summary' => [],
                'supply_details' => [],
                'period' => 'No data available',
                'start_date' => $date,
                'end_date' => $date
            ];
        }
    }

    /**
     * Get all supplies report data
     */
    private function getAllSuppliesReportData($startDate, $endDate, $filter, $date)
    {
        try {
            \Log::info('getAllSuppliesReportData Debug', [
                'start_date' => $startDate->format('Y-m-d H:i:s'),
                'end_date' => $endDate->format('Y-m-d H:i:s'),
                'filter' => $filter,
                'date' => $date
            ]);
            
            // Get supplies for the period (based on created_at)
            $supplies = Supply::whereBetween('created_at', [$startDate, $endDate])
                ->with('stockLevels')
                ->get();
                
            // If no supplies found in date range, get all supplies
            if ($supplies->isEmpty()) {
                \Log::info('No supplies found in date range, getting all supplies');
                $supplies = Supply::with('stockLevels')->get();
            }
                
            \Log::info('Supplies Query Result', [
                'supplies_count' => $supplies->count(),
                'first_supply' => $supplies->first() ? [
                    'id' => $supplies->first()->id,
                    'name' => $supplies->first()->name,
                    'created_at' => $supplies->first()->created_at
                ] : null
            ]);

            // Calculate statistics
            $totalProducts = $supplies->count();
            $lowStockItems = $supplies->filter(function($supply) {
                return $supply->current_stock <= $supply->minimum_stock_level;
            })->count();
            $outOfStock = $supplies->filter(function($supply) {
                return $supply->current_stock <= 0;
            })->count();
            // Calculate category summary
            $categorySummary = $supplies->groupBy('category')
                ->map(function ($categorySupplies) {
                    return [
                        'count' => $categorySupplies->count(),
                        'low_stock' => $categorySupplies->filter(function($supply) {
                            return $supply->current_stock <= $supply->minimum_stock_level;
                        })->count(),
                        'out_of_stock' => $categorySupplies->filter(function($supply) {
                            return $supply->current_stock <= 0;
                        })->count(),
                    ];
                })->toArray();
            
            // Get supply details
            $supplyDetails = $supplies->map(function ($supply) {
                return [
                    'id' => $supply->id,
                    'name' => $supply->name,
                    'code' => $supply->code,
                    'category' => $supply->category,
                    'unit_of_measure' => $supply->unit_of_measure,
                    'current_stock' => $supply->current_stock,
                    'minimum_stock_level' => $supply->minimum_stock_level,
                    'maximum_stock_level' => $supply->maximum_stock_level,
                    'is_low_stock' => $supply->is_low_stock,
                    'is_out_of_stock' => $supply->is_out_of_stock,
                    'is_active' => $supply->is_active,
                    'created_at' => $supply->created_at,
                ];
            })->values()->toArray();

            return [
                'total_products' => $totalProducts,
                'low_stock_items' => $lowStockItems,
                'out_of_stock' => $outOfStock,
                'category_summary' => $categorySummary,
                'supply_details' => $supplyDetails,
                'period' => $this->getPeriodLabel($filter, $date),
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ];
        } catch (\Exception $e) {
            Log::error('Inventory report data error: ' . $e->getMessage());
            return [
                'total_products' => 0,
                'low_stock_items' => 0,
                'out_of_stock' => 0,
                'category_summary' => [],
                'supply_details' => [],
                'period' => 'No data available',
                'start_date' => $date,
                'end_date' => $date
            ];
        }
    }

    /**
     * Get used/rejected supplies report data
     */
    private function getUsedRejectedReportData($startDate, $endDate, $filter, $date)
    {
        try {
            \Log::info('getUsedRejectedReportData Debug', [
                'start_date' => $startDate->format('Y-m-d H:i:s'),
                'end_date' => $endDate->format('Y-m-d H:i:s'),
                'filter' => $filter,
                'date' => $date
            ]);
            
            // Get used/rejected items from the inventory_used_rejected_items table
            $usedRejectedItems = \App\Models\InventoryUsedRejectedItem::with(['inventoryItem', 'user'])
                ->whereBetween('date_used_rejected', [$startDate, $endDate])
                ->get();
            
            \Log::info('InventoryUsedRejectedItem Query Results', [
                'total_records' => $usedRejectedItems->count(),
                'used_count' => $usedRejectedItems->where('type', 'used')->count(),
                'rejected_count' => $usedRejectedItems->where('type', 'rejected')->count(),
            ]);
            
            // Get unique inventory items that have consumed/rejected records
            $itemIds = $usedRejectedItems->pluck('inventory_item_id')->unique();
            $items = \App\Models\InventoryItem::whereIn('id', $itemIds)->get();

            // Calculate summary data from the used/rejected records
            $consumedItems = $usedRejectedItems->where('type', 'used');
            $rejectedItems = $usedRejectedItems->where('type', 'rejected');
            
            $summary = [
                'total_items' => $items->count(),
                'total_consumed' => $consumedItems->sum('quantity'),
                'total_rejected' => $rejectedItems->sum('quantity'),
                'low_stock_items' => $items->where('status', 'Low Stock')->count(),
                'out_of_stock_items' => $items->where('status', 'Out of Stock')->count(),
            ];

            // Department breakdown from used/rejected records
            $doctorNurseItems = $usedRejectedItems->filter(function($item) {
                return $item->inventoryItem && $item->inventoryItem->assigned_to === 'Doctor & Nurse';
            });
            $medTechItems = $usedRejectedItems->filter(function($item) {
                return $item->inventoryItem && $item->inventoryItem->assigned_to === 'Med Tech';
            });
            
            $departmentStats = [
                'doctor_nurse' => [
                    'total_items' => $items->where('assigned_to', 'Doctor & Nurse')->count(),
                    'total_consumed' => $doctorNurseItems->where('type', 'used')->sum('quantity'),
                    'total_rejected' => $doctorNurseItems->where('type', 'rejected')->sum('quantity'),
                    'low_stock' => $items->where('assigned_to', 'Doctor & Nurse')->where('status', 'Low Stock')->count(),
                ],
                'med_tech' => [
                    'total_items' => $items->where('assigned_to', 'Med Tech')->count(),
                    'total_consumed' => $medTechItems->where('type', 'used')->sum('quantity'),
                    'total_rejected' => $medTechItems->where('type', 'rejected')->sum('quantity'),
                    'low_stock' => $items->where('assigned_to', 'Med Tech')->where('status', 'Low Stock')->count(),
                ],
            ];

            // Top consumed items from used/rejected records
            $topConsumedByItem = $consumedItems->groupBy('inventory_item_id')->map(function($group) {
                $item = $group->first()->inventoryItem;
                return [
                    'item_name' => $item ? $item->item_name : 'Unknown',
                    'item_code' => $item ? $item->item_code : 'N/A',
                    'category' => $item ? $item->category : 'Unknown',
                    'unit' => $item ? $item->unit : 'N/A',
                    'department' => $item ? $item->assigned_to : 'Unknown',
                    'quantity_consumed' => $group->sum('quantity'),
                ];
            })->sortByDesc('quantity_consumed')->take(10)->values();

            // Top rejected items from used/rejected records
            $topRejectedByItem = $rejectedItems->groupBy('inventory_item_id')->map(function($group) {
                $item = $group->first()->inventoryItem;
                $latest = $group->first();
                return [
                    'item_name' => $item ? $item->item_name : 'Unknown',
                    'item_code' => $item ? $item->item_code : 'N/A',
                    'category' => $item ? $item->category : 'Unknown',
                    'unit' => $item ? $item->unit : 'N/A',
                    'department' => $item ? $item->assigned_to : 'Unknown',
                    'quantity_rejected' => $group->sum('quantity'),
                    'reason' => $latest->reason,
                ];
            })->sortByDesc('quantity_rejected')->take(10)->values();

            // Prepare supply details for web interface compatibility
            $supplyDetails = $usedRejectedItems->map(function($item) {
                return [
                    'id' => $item->id,
                    'item_id' => $item->inventory_item_id,
                    'name' => $item->inventoryItem ? $item->inventoryItem->item_name : 'Unknown',
                    'code' => $item->inventoryItem ? $item->inventoryItem->item_code : 'N/A',
                    'category' => $item->inventoryItem ? $item->inventoryItem->category : 'Unknown',
                    'unit_of_measure' => $item->inventoryItem ? $item->inventoryItem->unit : 'N/A',
                    'type' => $item->type,
                    'quantity' => $item->quantity,
                    'used_quantity' => $item->type === 'used' ? $item->quantity : 0,
                    'rejected_quantity' => $item->type === 'rejected' ? $item->quantity : 0,
                    'reason' => $item->reason,
                    'location' => $item->location,
                    'used_by' => $item->used_by,
                    'date_used_rejected' => $item->date_used_rejected,
                    'remarks' => $item->remarks,
                ];
            });

            // Calculate category summary
            $categorySummary = $supplyDetails->groupBy('category')->map(function($items, $category) {
                return [
                    'count' => $items->count(),
                    'used_quantity' => $items->where('type', 'used')->sum('quantity'),
                    'rejected_quantity' => $items->where('type', 'rejected')->sum('quantity'),
                ];
            });

            return [
                'summary' => $summary,
                'department_stats' => $departmentStats,
                'top_consumed_items' => $topConsumedByItem->toArray(),
                'top_rejected_items' => $topRejectedByItem->toArray(),
                'date_range' => [
                    'start' => $startDate->format('Y-m-d'),
                    'end' => $endDate->format('Y-m-d'),
                    'label' => $this->getPeriodLabel($filter, $date)
                ],
                'supply_details' => $supplyDetails->toArray(),
                'category_summary' => $categorySummary->toArray(),
                'used_count' => $consumedItems->count(),
                'rejected_count' => $rejectedItems->count(),
                'used_quantity' => $consumedItems->sum('quantity'),
                'rejected_quantity' => $rejectedItems->sum('quantity'),
                'total_transactions' => $usedRejectedItems->count(),
                'total_products' => $items->count(),
                'low_stock_items' => $items->where('status', 'Low Stock')->count(),
                'out_of_stock' => $items->where('status', 'Out of Stock')->count(),
                'period' => $this->getPeriodLabel($filter, $date),
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ];
        } catch (\Exception $e) {
            Log::error('Used/Rejected report data error: ' . $e->getMessage());
            return [
                'summary' => [
                    'total_items' => 0,
                    'total_consumed' => 0,
                    'total_rejected' => 0,
                    'low_stock_items' => 0,
                    'out_of_stock_items' => 0,
                ],
                'total_products' => 0,
                'low_stock_items' => 0,
                'out_of_stock' => 0,
                'used_count' => 0,
                'rejected_count' => 0,
                'total_transactions' => 0,
                'category_summary' => [],
                'supply_details' => [],
                'period' => 'No data available',
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ];
        }
    }

    /**
     * Get in/out supplies report data
     */
    private function getInOutReportData($startDate, $endDate, $filter, $date)
    {
        try {
            \Log::info('getInOutReportData Debug', [
                'start_date' => $startDate->format('Y-m-d H:i:s'),
                'end_date' => $endDate->format('Y-m-d H:i:s'),
                'filter' => $filter,
                'date' => $date
            ]);
            
            // Get incoming and outgoing movements from InventoryMovement model
            // TEMPORARY: Show all movements for debugging
            $incomingMovements = \App\Models\InventoryMovement::where('movement_type', 'IN')
                ->with('inventoryItem')
                ->get();
                
            $outgoingMovements = \App\Models\InventoryMovement::where('movement_type', 'OUT')
                ->with('inventoryItem')
                ->get();
            
            // Get all movements for debugging
            $allMovements = \App\Models\InventoryMovement::with('inventoryItem')->orderBy('created_at', 'desc')->get();
            
            \Log::info('In/Out Movement Query Results', [
                'incoming_movements_count' => $incomingMovements->count(),
                'outgoing_movements_count' => $outgoingMovements->count(),
                'date_range' => $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d'),
                'total_movements_all_time' => $allMovements->count(),
                'sample_movement_data' => $allMovements->take(3)->map(function($m) {
                    return [
                        'id' => $m->id,
                        'movement_type' => $m->movement_type,
                        'quantity' => $m->quantity,
                        'created_by' => $m->created_by,
                        'remarks' => $m->remarks,
                        'item_name' => $m->inventoryItem ? $m->inventoryItem->item_name : 'No Item',
                        'created_at' => $m->created_at->format('Y-m-d H:i:s'),
                    ];
                })->toArray()
            ]);
            
            $allMovements = $incomingMovements->concat($outgoingMovements);
            
            // Calculate statistics
            $totalMovements = $allMovements->count();
            $incomingCount = $incomingMovements->count();
            $outgoingCount = $outgoingMovements->count();
            
            // Return individual movements instead of grouped data
            $movementDetails = $allMovements->map(function ($movement) {
                $item = $movement->inventoryItem;
                
                $mappedData = [
                    'id' => $movement->id,
                    'name' => $item ? $item->item_name : 'Unknown Item',
                    'code' => $item ? $item->item_code : 'N/A',
                    'category' => $item ? $item->category : 'Unknown',
                    'movement_type' => $movement->movement_type,
                    'quantity' => $movement->quantity,
                    'created_by' => $movement->created_by,
                    'remarks' => $movement->remarks,
                    'created_at' => $movement->created_at->format('Y-m-d H:i:s'),
                    'item_id' => $movement->inventory_id,
                ];
                
                // Debug log for first few items
                if ($movement->id <= 3) {
                    \Log::info('Movement mapping debug', [
                        'original_movement' => [
                            'id' => $movement->id,
                            'movement_type' => $movement->movement_type,
                            'created_by' => $movement->created_by,
                            'remarks' => $movement->remarks,
                        ],
                        'mapped_data' => $mappedData
                    ]);
                }
                
                return $mappedData;
            })->values();
            
            // Also create grouped summary for category summary
            $productSummary = $allMovements->groupBy('inventory_id')
                ->map(function ($movements) {
                    $item = $movements->first()->inventoryItem;
                    $incoming = $movements->where('movement_type', 'IN');
                    $outgoing = $movements->where('movement_type', 'OUT');
                    
                    return [
                        'id' => $item->id,
                        'name' => $item->item_name,
                        'code' => $item->item_code,
                        'category' => $item->category,
                        'unit_of_measure' => $item->unit,
                        'incoming_quantity' => $incoming->sum('quantity'),
                        'outgoing_quantity' => $outgoing->sum('quantity'),
                        'net_quantity' => $incoming->sum('quantity') - $outgoing->sum('quantity'),
                        'movement_count' => $movements->count(),
                        'last_movement_date' => $movements->max('created_at'),
                    ];
                })->values();
            
            // Category summary
            $categorySummary = $productSummary->groupBy('category')
                ->map(function ($products) {
                    return [
                        'count' => $products->count(),
                        'incoming_quantity' => $products->sum('incoming_quantity'),
                        'outgoing_quantity' => $products->sum('outgoing_quantity'),
                        'net_quantity' => $products->sum('incoming_quantity') - $products->sum('outgoing_quantity'),
                    ];
                })->toArray();

            // Debug: Log the final data being returned
            \Log::info('getInOutReportData Final Data', [
                'total_movements' => $totalMovements,
                'movement_details_count' => $movementDetails->count(),
                'sample_movement_details' => $movementDetails->take(3)->toArray(),
                'incoming_count' => $incomingCount,
                'outgoing_count' => $outgoingCount,
            ]);

            return [
                'total_products' => $productSummary->count(),
                'low_stock_items' => 0, // Not applicable for in/out
                'out_of_stock' => 0, // Not applicable for in/out
                'incoming_count' => $incomingCount,
                'outgoing_count' => $outgoingCount,
                'total_transactions' => $totalMovements,
                'incoming_quantity' => $incomingMovements->sum('quantity'),
                'outgoing_quantity' => $outgoingMovements->sum('quantity'),
                'net_quantity' => $incomingMovements->sum('quantity') - $outgoingMovements->sum('quantity'),
                'category_summary' => $categorySummary,
                'supply_details' => $movementDetails->toArray(), // Use movement details instead of product summary
                'period' => $this->getPeriodLabel($filter, $date),
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ];
        } catch (\Exception $e) {
            Log::error('In/Out report data error: ' . $e->getMessage());
            return [
                'total_products' => 0,
                'low_stock_items' => 0,
                'out_of_stock' => 0,
                'incoming_count' => 0,
                'outgoing_count' => 0,
                'total_transactions' => 0,
                'category_summary' => [],
                'supply_details' => [],
                'period' => 'No data available',
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ];
        }
    }

    /**
     * Get chart data from database
     */
    private function getChartData()
    {
        try {
            // Check if transaction_date column exists, otherwise use created_at
            $dateColumn = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
                ? 'transaction_date' 
                : 'created_at';
            
            // Monthly revenue data for the last 12 months
            $monthlyRevenue = [];
            for ($i = 11; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $revenue = BillingTransaction::whereYear($dateColumn, $date->year)
                    ->whereMonth($dateColumn, $date->month)
                    ->sum('amount') ?? 0;

                $appointments = Appointment::whereYear('appointment_date', $date->year)
                    ->whereMonth('appointment_date', $date->month)
                    ->count();

                $patients = Patient::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count();

                $monthlyRevenue[] = [
                    'month' => $date->format('M Y'),
                    'revenue' => $revenue,
                    'patients' => $patients,
                    'appointments' => $appointments,
                ];
            }

            // Patient demographics with more detailed breakdown
            $patientDemographics = [
                ['name' => 'Male', 'value' => Patient::where('sex', 'male')->count()],
                ['name' => 'Female', 'value' => Patient::where('sex', 'female')->count()],
            ];

            // Appointment status distribution with more statuses
            $appointmentStatus = [
                ['status' => 'Completed', 'count' => Appointment::where('status', 'Completed')->count()],
                ['status' => 'Confirmed', 'count' => Appointment::where('status', 'Confirmed')->count()],
                ['status' => 'Pending', 'count' => Appointment::where('status', 'Pending')->count()],
                ['status' => 'Cancelled', 'count' => Appointment::where('status', 'Cancelled')->count()],
                ['status' => 'No Show', 'count' => Appointment::where('status', 'No Show')->count()],
            ];

            // Lab test types (most common) - expanded to 10
            $labTestTypes = LabOrder::join('lab_results', 'lab_orders.id', '=', 'lab_results.lab_order_id')
                ->join('lab_tests', 'lab_results.lab_test_id', '=', 'lab_tests.id')
                ->selectRaw('lab_tests.name as test_name, COUNT(*) as count')
                ->groupBy('lab_tests.name')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'test' => $item->test_name,
                        'count' => $item->count,
                    ];
                })->toArray();

            // Enhanced age group distribution with more granular categories
            $ageGroups = Patient::selectRaw('
                CASE
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) < 5 THEN "0-4"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 5 AND 12 THEN "5-12"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 13 AND 17 THEN "13-17"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 18 AND 25 THEN "18-25"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 26 AND 35 THEN "26-35"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 36 AND 45 THEN "36-45"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 46 AND 55 THEN "46-55"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 56 AND 65 THEN "56-65"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 66 AND 75 THEN "66-75"
                    ELSE "75+"
                END as age_group,
                COUNT(*) as count
            ')
            ->groupBy('age_group')
            ->orderByRaw('
                CASE age_group
                    WHEN "0-4" THEN 1
                    WHEN "5-12" THEN 2
                    WHEN "13-17" THEN 3
                    WHEN "18-25" THEN 4
                    WHEN "26-35" THEN 5
                    WHEN "36-45" THEN 6
                    WHEN "46-55" THEN 7
                    WHEN "56-65" THEN 8
                    WHEN "66-75" THEN 9
                    WHEN "75+" THEN 10
                END
            ')
            ->get()
            ->map(function ($item) {
                return [
                    'age_group' => $item->age_group,
                    'count' => $item->count,
                ];
            })->toArray();

            // Enhanced payment method distribution with fallback data
            $paymentMethods = BillingTransaction::selectRaw('payment_method, COUNT(*) as count')
                ->groupBy('payment_method')
                ->orderBy('count', 'desc')
                ->get();

            // If no payment methods data, create sample data for demonstration
            if ($paymentMethods->isEmpty()) {
                $paymentMethods = collect([
                    (object)['payment_method' => 'cash', 'count' => 0],
                    (object)['payment_method' => 'card', 'count' => 0],
                    (object)['payment_method' => 'insurance', 'count' => 0],
                    (object)['payment_method' => 'hmo', 'count' => 0],
                ]);
            }

            $paymentMethods = $paymentMethods->map(function ($item) {
                return [
                    'method' => ucfirst(str_replace('_', ' ', $item->payment_method)),
                    'count' => $item->count,
                ];
            })->toArray();

            // Additional charts data
            $dailyAppointments = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $count = Appointment::whereDate('appointment_date', $date->toDateString())->count();
                $dailyAppointments[] = [
                    'day' => $date->format('D'),
                    'appointments' => $count,
                ];
            }

            // Lab test results distribution
            $labResultsDistribution = LabResult::selectRaw('
                    CASE
                        WHEN verified_at IS NOT NULL THEN "Verified"
                        ELSE "Pending"
                    END as status,
                    COUNT(*) as count
                ')
                ->groupBy('status')
                ->get()
                ->map(function ($item) {
                    return [
                        'status' => $item->status,
                        'count' => $item->count,
                    ];
                })->toArray();

            // Doctor performance (appointments per doctor)
            // Use relationships to get specialist information
            $doctorPerformance = Appointment::with('specialist')
                ->where('specialist_type', 'doctor')
                ->selectRaw('specialist_id, COUNT(*) as appointments')
                ->groupBy('specialist_id')
                ->orderBy('appointments', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'doctor' => $item->specialist ? $item->specialist->name : 'Unknown',
                        'appointments' => $item->appointments,
                    ];
                })->toArray();

            // Monthly patient registrations
            $monthlyRegistrations = [];
            for ($i = 11; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $count = Patient::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count();
                $monthlyRegistrations[] = [
                    'month' => $date->format('M'),
                    'registrations' => $count,
                ];
            }

            return [
                'monthlyRevenue' => $monthlyRevenue,
                'patientDemographics' => $patientDemographics,
                'appointmentStatus' => $appointmentStatus,
                'labTestTypes' => $labTestTypes,
                'ageGroups' => $ageGroups,
                'paymentMethods' => $paymentMethods,
                'dailyAppointments' => $dailyAppointments,
                'labResultsDistribution' => $labResultsDistribution,
                'doctorPerformance' => $doctorPerformance,
                'monthlyRegistrations' => $monthlyRegistrations,
            ];
        } catch (\Exception $e) {
            Log::error('Chart data error: ' . $e->getMessage());
            return [
                'monthlyRevenue' => [],
                'patientDemographics' => [],
                'appointmentStatus' => [],
                'labTestTypes' => [],
                'ageGroups' => [],
                'paymentMethods' => [],
                'dailyAppointments' => [],
                'labResultsDistribution' => [],
                'doctorPerformance' => [],
                'monthlyRegistrations' => [],
            ];
        }
    }

    /**
     * Format data for PDF template
     */
    private function formatDataForPdf($data, $type)
    {
        try {
            switch ($type) {
                case 'financial':
                    // Return summary data as flat array for PDF template
                    return $data['summary'] ?? [];
                    
                case 'patients':
                    return $data;
                    
                case 'laboratory':
                    return $data['summary'] ?? [];
                    
                case 'inventory':
                    return $data;
                    
                default:
                    return [];
            }
        } catch (\Exception $e) {
            Log::error('PDF data formatting error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get date range string for reports
     */
    private function getDateRangeString(Request $request)
    {
        $from = $request->get('date_from');
        $to = $request->get('date_to');

        if ($from && $to) {
            return "From: {$from} To: {$to}";
        } else {
            return "All Time";
        }
    }


    /**
     * Get all report data for comprehensive export
     */
    private function getAllReportData(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->startOfMonth()->format('Y-m-d'));
            $dateTo = $request->get('date_to', now()->endOfMonth()->format('Y-m-d'));
            
            $exportData = [];
            
            // Get patients data
            $patients = Patient::whereBetween('created_at', [$dateFrom, $dateTo])->get();
            foreach ($patients as $patient) {
                $exportData[] = [
                    'Type' => 'Patient',
                    'ID' => $patient->patient_no,
                    'Name' => $patient->first_name . ' ' . $patient->last_name,
                    'Age' => $patient->age,
                    'Sex' => $patient->sex,
                    'Phone' => $patient->phone,
                    'Email' => $patient->email,
                    'Address' => $patient->address,
                    'Created Date' => $patient->created_at->format('Y-m-d H:i:s'),
                ];
            }
            
            // Get appointments data
            $appointments = Appointment::whereBetween('appointment_date', [$dateFrom, $dateTo])->get();
            foreach ($appointments as $appointment) {
                $exportData[] = [
                    'Type' => 'Appointment',
                    'ID' => $appointment->id,
                    'Patient Name' => $appointment->patient_name,
                    'Specialist' => $appointment->specialist_name,
                    'Date' => $appointment->appointment_date->format('Y-m-d H:i:s'),
                    'Status' => $appointment->status,
                    'Type' => $appointment->appointment_type,
                    'Notes' => $appointment->notes ?? 'N/A',
                ];
            }
            
            // Get transactions data
            // Check if transaction_date column exists, otherwise use created_at
            $dateColumn = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
                ? 'transaction_date' 
                : 'created_at';
            $transactions = BillingTransaction::whereBetween($dateColumn, [$dateFrom, $dateTo])->get();
            foreach ($transactions as $transaction) {
                $exportData[] = [
                    'Type' => 'Transaction',
                    'ID' => $transaction->transaction_id,
                    'Patient' => $transaction->patient?->first_name . ' ' . $transaction->patient?->last_name ?? 'N/A',
                    'Amount' => $transaction->total_amount,
                    'Payment Method' => $transaction->payment_method,
                    'Status' => $transaction->status,
                    'Date' => $transaction->transaction_date->format('Y-m-d H:i:s'),
                    'Description' => $transaction->description ?? 'N/A',
                ];
            }
            
            // Get lab orders data
            $labOrders = LabOrder::whereBetween('created_at', [$dateFrom, $dateTo])->get();
            foreach ($labOrders as $order) {
                $exportData[] = [
                    'Type' => 'Lab Order',
                    'ID' => $order->id,
                    'Patient' => $order->patient?->first_name . ' ' . $order->patient?->last_name ?? 'N/A',
                    'Status' => $order->status,
                    'Created Date' => $order->created_at->format('Y-m-d H:i:s'),
                    'Notes' => $order->notes ?? 'N/A',
                ];
            }
            
            return $exportData;
        } catch (\Exception $e) {
            Log::error('Get all report data error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Format data for export based on type
     */
    private function formatDataForExport($data, $type)
    {
        try {
            $exportData = [];
            
            switch ($type) {
                case 'financial':
                    foreach ($data['transactions'] as $transaction) {
                        $exportData[] = [
                            'Transaction ID' => $transaction['id'],
                            'Patient Name' => $transaction['patient_name'],
                            'Doctor Name' => $transaction['doctor_name'],
                            'Amount' => $transaction['total_amount'],
                            'Payment Method' => $transaction['payment_method'],
                            'Status' => $transaction['status'],
                            'Date' => \Carbon\Carbon::parse($transaction['transaction_date'])->format('Y-m-d H:i:s'),
                        ];
                    }
                    break;
                    
                case 'patients':
                    foreach ($data['patients'] as $patient) {
                        $exportData[] = [
                            'Patient ID' => $patient->patient_no,
                            'Name' => $patient->first_name . ' ' . $patient->last_name,
                            'Age' => $patient->age,
                            'Sex' => $patient->sex,
                            'Phone' => $patient->phone,
                            'Email' => $patient->email,
                            'Created Date' => $patient->created_at->format('Y-m-d H:i:s'),
                        ];
                    }
                    break;
                    
                case 'laboratory':
                    foreach ($data['labOrders'] as $order) {
                        $exportData[] = [
                            'Order ID' => $order->id,
                            'Patient' => $order->patient?->first_name . ' ' . $order->patient?->last_name ?? 'N/A',
                            'Status' => $order->status,
                            'Created Date' => $order->created_at->format('Y-m-d H:i:s'),
                        ];
                    }
                    break;
                    
                case 'inventory':
                    foreach ($data['supply_details'] as $supply) {
                        $exportData[] = [
                            'Product ID' => $supply['id'],
                            'Name' => $supply['name'],
                            'Code' => $supply['code'],
                            'Category' => $supply['category'],
                            'Unit of Measure' => $supply['unit_of_measure'] ?? 'N/A',
                            'Current Stock' => $supply['current_stock'],
                            'Minimum Level' => $supply['minimum_stock_level'],
                            'Maximum Level' => $supply['maximum_stock_level'] ?? 0,
                            'Status' => $supply['is_out_of_stock'] ? 'Out of Stock' : ($supply['is_low_stock'] ? 'Low Stock' : 'Normal'),
                            'Active' => $supply['is_active'] ? 'Yes' : 'No',
                        ];
                    }
                    break;
            }
            
            return $exportData;
        } catch (\Exception $e) {
            Log::error('Format data for export error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Export financial report to Excel
     */
    public function exportFinancialExcel(Request $request)
    {
        try {
            $filter = $request->get('filter', 'daily');
            $date = $request->get('date', now()->format('Y-m-d'));
            $reportType = $request->get('report_type', 'all');
            
            $data = $this->getFinancialReportData($filter, $date, $reportType);
            
            // Get transactions for export
            // Check if transaction_date column exists, otherwise use created_at
            $dateField = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
                ? 'transaction_date' 
                : 'created_at';
            
            $query = BillingTransaction::query();
            $this->applyDateRangeFilter($query, $filter, $date, $dateField);
            
            // Apply report type filtering
            if ($reportType === 'cash') {
                $query->where('payment_method', 'cash');
            } elseif ($reportType === 'hmo') {
                $query->where('payment_method', 'hmo');
            }
            
            $transactions = $query->with(['patient', 'doctor', 'appointment.specialist'])
                ->orderBy($dateField, 'desc')
                ->get();
            
            $filename = 'financial_report_' . $filter . '_' . $date . '_' . $reportType . '_' . now()->format('Ymd_His');
            
            return $this->exportFinancialToExcel($data, $transactions, $filename, $filter, $date, $reportType);
            
        } catch (\Exception $e) {
            Log::error('Financial Excel export failed: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export financial report to PDF
     */
    public function exportFinancialPdf(Request $request)
    {
        try {
            $filter = $request->get('filter', 'daily');
            $date = $request->get('date', now()->format('Y-m-d'));
            $reportType = $request->get('report_type', 'all');
            
            $data = $this->getFinancialReportData($filter, $date, $reportType);
            
            // Get transactions for export
            // Check if transaction_date column exists, otherwise use created_at
            $dateField = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
                ? 'transaction_date' 
                : 'created_at';
            
            $query = BillingTransaction::query();
            $this->applyDateRangeFilter($query, $filter, $date, $dateField);
            
            // Apply report type filtering
            if ($reportType === 'cash') {
                $query->where('payment_method', 'cash');
            } elseif ($reportType === 'hmo') {
                $query->where('payment_method', 'hmo');
            }
            
            $transactions = $query->with(['patient', 'doctor', 'appointment.specialist'])
                ->orderBy($dateField, 'desc')
                ->get();
            
            $filename = 'financial_report_' . $filter . '_' . $date . '_' . $reportType . '_' . now()->format('Ymd_His');
            
            return $this->exportFinancialToPdf($data, $transactions, $filename, $filter, $date, $reportType);
            
        } catch (\Exception $e) {
            Log::error('Financial PDF export failed: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export financial data to Excel
     */
    private function exportFinancialToExcel($data, $transactions, $filename, $filter, $date, $reportType)
    {
        try {
            $export = new FinancialReportExport($data, $transactions, $filter, $date, $reportType);
            return Excel::download($export, "{$filename}.xlsx");
        } catch (\Exception $e) {
            Log::error('Excel generation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Excel generation failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export financial data to PDF
     */
    private function exportFinancialToPdf($data, $transactions, $filename, $filter, $date, $reportType)
    {
        try {
            // Convert logo to base64 for PDF
            $logoPath = public_path('st-james-logo.png');
            $logoBase64 = '';
            if (file_exists($logoPath)) {
                $logoData = file_get_contents($logoPath);
                $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
            }

            $pdf = PDF::loadView('exports.financial-report-pdf', [
                'data' => $data,
                'transactions' => $transactions,
                'filter' => $filter,
                'date' => $date,
                'reportType' => $reportType,
                'title' => 'Financial Report - ' . ucfirst($filter) . ' - ' . $date,
                'dateRange' => $this->getDateRangeString($request ?? new Request()),
                'logoBase64' => $logoBase64,
            ]);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'Arial',
            ]);

            return $pdf->download("{$filename}.pdf");
        } catch (\Exception $e) {
            Log::error('PDF generation failed: ' . $e->getMessage());
            return response()->json(['error' => 'PDF generation failed: ' . $e->getMessage()], 500);
        }
    }
}