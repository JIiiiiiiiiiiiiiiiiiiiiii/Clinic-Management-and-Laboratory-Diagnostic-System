<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Patient as PatientModel;
use App\Models\PatientVisit;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\Supply\Supply as Item;
use App\Models\Supply\SupplyTransaction as Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user && $user->role === 'patient') {
            $patient = PatientModel::where('user_id', $user->id)->first();

            $orders = LabOrder::with(['labTests', 'results'])
                ->when($patient, function ($q) use ($patient) {
                    $q->where('patient_id', $patient->id);
                })
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(['id','patient_id','created_at']);

            return Inertia::render('patient/dashboard', [
                'dashboard' => [
                    'orders' => $orders,
                ],
            ]);
        }

        $totals = [
            'doctors' => User::where('role', 'doctor')->where('is_active', true)->count(),
            'patients' => Patient::count(),
            'newPatientsThisMonth' => Patient::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count(),
            'todayAppointments' => PatientVisit::whereDate('arrival_date', now()->toDateString())->count(),
            'pendingLabTests' => LabResult::whereNull('verified_at')->count(),
            'lowStockSupplies' => DB::table('supply_stock_levels')
                ->join('supplies', 'supplies.id', '=', 'supply_stock_levels.product_id')
                ->whereColumn('supply_stock_levels.current_stock', '<=', 'supplies.minimum_stock_level')
                ->where('supply_stock_levels.current_stock', '>', 0)
                ->distinct('product_id')
                ->count('product_id'),
            'unpaidBills' => Transaction::where('type', 'out')
                ->where('approval_status', 'pending')
                ->count(),
            'items' => Item::count(),
            'labOrders' => LabOrder::count(),
            'todayRevenue' => (float) Transaction::where('type', 'in')
                ->whereDate('transaction_date', now()->toDateString())
                ->sum('total_cost'),
        ];

        $recent = [
            'patients' => Patient::orderByDesc('created_at')->limit(5)->get(['id','first_name','last_name','created_at']),
            'items' => Item::withSum('stockLevels as current_stock', 'current_stock')
                ->orderByDesc('created_at')->limit(5)->get(['id','name','code']),
            'labOrders' => LabOrder::with(['patient','labTests'])
                ->orderByDesc('created_at')->limit(5)->get(['id','patient_id','created_at']),
        ];

        return Inertia::render('admin/dashboard', [
            'dashboard' => [
                'totals' => $totals,
                'recent' => $recent,
            ],
        ]);
    }
}


