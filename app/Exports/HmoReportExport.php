<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class HmoReportExport implements WithMultipleSheets
{
    protected array $summaryData;
    protected array $hmoTransactions;
    protected array $hmoProviders;
    protected string $dateFrom;
    protected string $dateTo;

    public function __construct(array $summaryData, array $hmoTransactions, array $hmoProviders, string $dateFrom, string $dateTo)
    {
        $this->summaryData = $summaryData;
        $this->hmoTransactions = $hmoTransactions;
        $this->hmoProviders = $hmoProviders;
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
    }

    /**
     * @return array
     */
    public function sheets(): array
    {
        $sheets = [];

        // Summary Sheet
        $summaryRows = [
            ['HMO Report Summary'],
            [''],
            ['Report Period', $this->dateFrom . ' to ' . $this->dateTo],
            ['Generated On', now()->format('M d, Y H:i:s')],
            [''],
            ['Metric', 'Value'],
            ['Total HMO Revenue', '₱' . number_format($this->summaryData['total_hmo_revenue'] ?? 0, 2)],
            ['Total HMO Transactions', $this->summaryData['total_hmo_transactions'] ?? 0],
            ['Total Claims Amount', '₱' . number_format($this->summaryData['total_claims_amount'] ?? 0, 2)],
            ['Total Approved Amount', '₱' . number_format($this->summaryData['total_approved_amount'] ?? 0, 2)],
            ['Total Rejected Amount', '₱' . number_format($this->summaryData['total_rejected_amount'] ?? 0, 2)],
            ['Total Claims Count', $this->summaryData['total_claims_count'] ?? 0],
            ['Approved Claims Count', $this->summaryData['approved_claims_count'] ?? 0],
            ['Rejected Claims Count', $this->summaryData['rejected_claims_count'] ?? 0],
            ['Approval Rate', number_format($this->summaryData['approval_rate'] ?? 0, 2) . '%'],
            ['HMO Providers Count', $this->summaryData['hmo_providers_count'] ?? 0],
            ['Active Patient Coverages', $this->summaryData['active_patient_coverages'] ?? 0],
            ['Pending Claims Count', $this->summaryData['pending_claims_count'] ?? 0],
            ['Paid Claims Count', $this->summaryData['paid_claims_count'] ?? 0],
        ];
        $sheets[] = new ArrayExport($summaryRows, 'HMO Summary');

        // HMO Transactions Sheet
        $transactionRows = [
            ['Transaction ID', 'Patient Name', 'Doctor Name', 'HMO Provider', 'Amount', 'Status', 'Transaction Date']
        ];
        foreach ($this->hmoTransactions as $transaction) {
            $transactionRows[] = [
                $transaction['transaction_id'] ?? '',
                $transaction['patient_name'] ?? '',
                $transaction['doctor_name'] ?? '',
                $transaction['hmo_provider'] ?? '',
                '₱' . number_format($transaction['total_amount'] ?? 0, 2),
                ucfirst($transaction['status'] ?? ''),
                isset($transaction['transaction_date']) ? \Carbon\Carbon::parse($transaction['transaction_date'])->format('M d, Y') : '',
            ];
        }
        $sheets[] = new ArrayExport($transactionRows, 'HMO Transactions');

        // HMO Providers Sheet
        $providerRows = [
            ['Provider Name', 'Code', 'Status', 'Contact Person', 'Contact Email', 'Contact Phone']
        ];
        foreach ($this->hmoProviders as $provider) {
            $providerRows[] = [
                $provider['name'] ?? '',
                $provider['code'] ?? '',
                ucfirst($provider['status'] ?? ''),
                $provider['contact_person'] ?? '',
                $provider['contact_email'] ?? '',
                $provider['contact_phone'] ?? '',
            ];
        }
        $sheets[] = new ArrayExport($providerRows, 'HMO Providers');

        return $sheets;
    }
}
