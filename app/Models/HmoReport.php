<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HmoReport extends Model
{
    use HasFactory;

    protected $table = 'hmo_reports';

    protected $fillable = [
        'report_name',
        'report_type',
        'period',
        'start_date',
        'end_date',
        'filters',
        'summary_data',
        'detailed_data',
        'provider_breakdown',
        'claims_analysis',
        'total_claims_amount',
        'total_approved_amount',
        'total_rejected_amount',
        'total_claims_count',
        'approved_claims_count',
        'rejected_claims_count',
        'approval_rate',
        'status',
        'created_by',
        'exported_at',
        'export_format',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'filters' => 'array',
        'summary_data' => 'array',
        'detailed_data' => 'array',
        'provider_breakdown' => 'array',
        'claims_analysis' => 'array',
        'total_claims_amount' => 'decimal:2',
        'total_approved_amount' => 'decimal:2',
        'total_rejected_amount' => 'decimal:2',
        'approval_rate' => 'decimal:2',
        'exported_at' => 'datetime',
    ];

    // Relationships
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('report_type', $type);
    }

    public function scopeByPeriod($query, $period)
    {
        return $query->where('period', $period);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate]);
    }

    // Report type constants
    const TYPE_SUMMARY = 'summary';
    const TYPE_DETAILED = 'detailed';
    const TYPE_CLAIMS_ANALYSIS = 'claims_analysis';
    const TYPE_PROVIDER_PERFORMANCE = 'provider_performance';
    const TYPE_PATIENT_COVERAGE = 'patient_coverage';

    // Period constants
    const PERIOD_DAILY = 'daily';
    const PERIOD_WEEKLY = 'weekly';
    const PERIOD_MONTHLY = 'monthly';
    const PERIOD_QUARTERLY = 'quarterly';
    const PERIOD_YEARLY = 'yearly';
    const PERIOD_CUSTOM = 'custom';

    // Status constants
    const STATUS_ACTIVE = 'active';
    const STATUS_ARCHIVED = 'archived';

    // Helper methods
    public function generateSummaryData()
    {
        $startDate = $this->start_date;
        $endDate = $this->end_date;

        // Get HMO transactions for the period
        $hmoTransactions = BillingTransaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->where('payment_method', 'hmo')
            ->whereNotNull('hmo_provider')
            ->get();

        // Get claims for the period
        $claims = HmoClaim::whereBetween('submission_date', [$startDate, $endDate])
            ->get();

        // Calculate summary statistics
        $summary = [
            'total_hmo_revenue' => $hmoTransactions->sum('total_amount'),
            'total_hmo_transactions' => $hmoTransactions->count(),
            'total_claims_amount' => $claims->sum('claim_amount'),
            'total_approved_amount' => $claims->where('status', 'approved')->sum('approved_amount'),
            'total_rejected_amount' => $claims->where('status', 'rejected')->sum('rejected_amount'),
            'total_claims_count' => $claims->count(),
            'approved_claims_count' => $claims->where('status', 'approved')->count(),
            'rejected_claims_count' => $claims->where('status', 'rejected')->count(),
            'approval_rate' => $claims->count() > 0 ? 
                ($claims->where('status', 'approved')->count() / $claims->count()) * 100 : 0,
            'hmo_providers_count' => $hmoTransactions->pluck('hmo_provider')->unique()->count(),
        ];

        $this->update([
            'summary_data' => $summary,
            'total_claims_amount' => $summary['total_claims_amount'],
            'total_approved_amount' => $summary['total_approved_amount'],
            'total_rejected_amount' => $summary['total_rejected_amount'],
            'total_claims_count' => $summary['total_claims_count'],
            'approved_claims_count' => $summary['approved_claims_count'],
            'rejected_claims_count' => $summary['rejected_claims_count'],
            'approval_rate' => $summary['approval_rate'],
        ]);

        return $summary;
    }

    public function generateProviderBreakdown()
    {
        $startDate = $this->start_date;
        $endDate = $this->end_date;

        $hmoTransactions = BillingTransaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->where('payment_method', 'hmo')
            ->whereNotNull('hmo_provider')
            ->get();

        $claims = HmoClaim::whereBetween('submission_date', [$startDate, $endDate])
            ->get();

        $providerBreakdown = $hmoTransactions->groupBy('hmo_provider')
            ->map(function ($transactions, $provider) use ($claims) {
                $providerClaims = $claims->where('hmo_provider_id', 
                    HmoProvider::where('name', $provider)->first()?->id
                );

                return [
                    'provider' => $provider,
                    'total_revenue' => $transactions->sum('total_amount'),
                    'transaction_count' => $transactions->count(),
                    'claims_amount' => $providerClaims->sum('claim_amount'),
                    'approved_amount' => $providerClaims->where('status', 'approved')->sum('approved_amount'),
                    'rejected_amount' => $providerClaims->where('status', 'rejected')->sum('rejected_amount'),
                    'claims_count' => $providerClaims->count(),
                    'approved_claims_count' => $providerClaims->where('status', 'approved')->count(),
                    'rejected_claims_count' => $providerClaims->where('status', 'rejected')->count(),
                    'approval_rate' => $providerClaims->count() > 0 ? 
                        ($providerClaims->where('status', 'approved')->count() / $providerClaims->count()) * 100 : 0,
                ];
            });

        $this->update(['provider_breakdown' => $providerBreakdown]);
        return $providerBreakdown;
    }

    public function markAsExported($format = 'excel')
    {
        $this->update([
            'exported_at' => now(),
            'export_format' => $format,
        ]);
    }
}
