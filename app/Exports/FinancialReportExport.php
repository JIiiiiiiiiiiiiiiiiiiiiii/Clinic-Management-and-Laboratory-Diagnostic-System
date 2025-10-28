<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class FinancialReportExport implements WithMultipleSheets
{
    protected array $summaryData;
    protected array $transactionsData;
    protected array $financialOverviewData;
    protected string $dateRange;

    public function __construct(array $summaryData, array $transactionsData, array $financialOverviewData, string $dateRange)
    {
        $this->summaryData = $summaryData;
        $this->transactionsData = $transactionsData;
        $this->financialOverviewData = $financialOverviewData;
        $this->dateRange = $dateRange;
    }

    /**
     * @return array
     */
    public function sheets(): array
    {
        $sheets = [];

        // Financial Overview Sheet
        $overviewRows = [
            ['Date', 'Total Transactions', 'Total Revenue', 'Pending Amount', 'Cash Total', 'HMO Total']
        ];
        foreach ($this->financialOverviewData as $overview) {
            $overviewRows[] = [
                \Carbon\Carbon::parse($overview['date'])->format('M d, Y'),
                $overview['total_transactions'],
                '₱' . number_format($overview['total_revenue'], 2),
                '₱' . number_format($overview['pending_amount'], 2),
                '₱' . number_format($overview['cash_total'], 2),
                '₱' . number_format($overview['hmo_total'], 2),
            ];
        }
        $sheets[] = new ArrayExport($overviewRows, [], 'Financial Overview', true);

        // Financial Transactions Sheet
        $transactionRows = [
            ['Transaction ID', 'Patient Name', 'Doctor Name', 'Final Amount', 'Original Amount', 'Discount Amount', 'Senior Discount', 'Payment Method', 'Status', 'Date']
        ];
        foreach ($this->transactionsData as $transaction) {
            $transactionRows[] = [
                $transaction->transaction_id,
                $transaction->patient_name,
                $transaction->doctor_name,
                '₱' . number_format($transaction->total_amount, 2), // Final amount after discounts
                '₱' . number_format($transaction->original_amount ?? $transaction->total_amount, 2), // Original amount
                '₱' . number_format($transaction->discount_amount ?? 0, 2), // Regular discount
                '₱' . number_format($transaction->senior_discount_amount ?? 0, 2), // Senior discount
                ucfirst($transaction->payment_method),
                ucfirst($transaction->status),
                \Carbon\Carbon::parse($transaction->transaction_date)->format('M d, Y'),
            ];
        }
        $sheets[] = new ArrayExport($transactionRows, [], 'Financial Transactions', true);

        return $sheets;
    }
}
