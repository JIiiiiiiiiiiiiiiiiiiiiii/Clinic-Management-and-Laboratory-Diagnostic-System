<?php

namespace App\Http\Controllers\Lab;

use App\Exports\LabOrderResultsExport;
use App\Exports\LabOrdersExport;
use App\Http\Controllers\Controller;
use App\Models\LabOrder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Maatwebsite\Excel\Facades\Excel;

class LabExportController extends Controller
{
    public function exportOrders(Request $request): BinaryFileResponse
    {
        $fileName = 'lab_orders_' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new LabOrdersExport(), $fileName);
    }

    public function exportOrderResults(Request $request, LabOrder $order): BinaryFileResponse
    {
        $order->load(['patient', 'labTests', 'results.test']);
        $fileName = 'lab_order_' . $order->id . '_results_' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new LabOrderResultsExport($order), $fileName);
    }
}


