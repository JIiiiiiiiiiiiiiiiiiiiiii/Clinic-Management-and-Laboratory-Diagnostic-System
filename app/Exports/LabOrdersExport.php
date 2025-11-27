<?php

namespace App\Exports;

use App\Models\LabOrder;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Illuminate\Support\Collection;

class LabOrdersExport extends BaseExport implements FromArray, WithHeadings
{
    public function __construct()
    {
        parent::__construct('Lab Orders');
    }

    public function array(): array
    {
        // Fetch orders from database with all necessary relationships
        $orders = LabOrder::with([
            'patient',
            'visit',
            'orderedBy',
            'results' => function ($query) {
                $query->with([
                    'test' => function ($q) {
                        $q->select('id', 'name', 'code', 'price');
                    }
                ]);
            }
        ])->latest()->get();

        return $orders->map(function (LabOrder $order) {
            $patient = $order->patient;
            return [
                'Order ID' => $order->id,
                'Status' => $order->status,
                'Patient No' => $patient?->id ?? 'N/A',
                'Patient Name' => $patient ? ($patient->last_name . ', ' . $patient->first_name) : 'N/A',
                'Visit Date' => optional($order->visit?->visit_date_time)->format('Y-m-d'),
                'Tests' => $order->results->map(function ($result) {
                    return $result->test?->name;
                })->filter()->join(', '),
                'Test Codes' => $order->results->map(function ($result) {
                    return $result->test?->code;
                })->filter()->join(', '),
                'Ordered At' => optional($order->created_at)->format('Y-m-d H:i:s'),
                'Ordered By' => $order->orderedBy?->name ?? 'N/A',
            ];
        })->toArray();
    }

    public function headings(): array
    {
        return [
            'Order ID', 
            'Status', 
            'Patient No', 
            'Patient Name', 
            'Visit Date',
            'Tests', 
            'Test Codes',
            'Ordered At',
            'Ordered By'
        ];
    }

    public function collection(): Collection
    {
        // Fetch orders from database with all necessary relationships
        $orders = LabOrder::with([
            'patient',
            'visit',
            'orderedBy',
            'results' => function ($query) {
                $query->with([
                    'test' => function ($q) {
                        $q->select('id', 'name', 'code', 'price');
                    }
                ]);
            }
        ])->latest()->get();

        return $orders->map(function (LabOrder $order) {
            $patient = $order->patient;
            return (object) [
                'Order ID' => $order->id,
                'Status' => $order->status,
                'Patient No' => $patient?->id ?? 'N/A',
                'Patient Name' => $patient ? ($patient->last_name . ', ' . $patient->first_name) : 'N/A',
                'Visit Date' => optional($order->visit?->visit_date_time)->format('Y-m-d'),
                'Tests' => $order->results->map(function ($result) {
                    return $result->test?->name;
                })->filter()->join(', '),
                'Test Codes' => $order->results->map(function ($result) {
                    return $result->test?->code;
                })->filter()->join(', '),
                'Ordered At' => optional($order->created_at)->format('Y-m-d H:i:s'),
                'Ordered By' => $order->orderedBy?->name ?? 'N/A',
            ];
        });
    }
}


