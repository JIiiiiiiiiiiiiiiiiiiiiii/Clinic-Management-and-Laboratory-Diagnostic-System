<?php

namespace App\Services;

use App\Models\LabOrder;
use App\Models\LabResult;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LabTestAnalyticsService
{
    /**
     * Get most frequently used individual lab tests
     *
     * @param int $limit Number of results to return
     * @param Carbon|null $startDate Start date for filtering
     * @param Carbon|null $endDate End date for filtering
     * @return Collection Collection of test data with usage count
     */
    public function getMostUsedTests(int $limit = 10, ?Carbon $startDate = null, ?Carbon $endDate = null): Collection
    {
        $query = LabResult::query()
            ->select('lab_tests.id', 'lab_tests.name', 'lab_tests.code', DB::raw('COUNT(*) as usage_count'))
            ->join('lab_tests', 'lab_results.lab_test_id', '=', 'lab_tests.id')
            ->join('lab_orders', 'lab_results.lab_order_id', '=', 'lab_orders.id');

        // Apply date filtering if provided
        if ($startDate && $endDate) {
            $query->whereBetween('lab_orders.created_at', [$startDate, $endDate]);
        }

        return $query
            ->groupBy('lab_tests.id', 'lab_tests.name', 'lab_tests.code')
            ->orderByDesc('usage_count')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'code' => $item->code,
                    'count' => $item->usage_count,
                ];
            });
    }

    /**
     * Get most common test combinations (2 or more tests in the same order)
     *
     * @param int $limit Number of combinations to return
     * @param Carbon|null $startDate Start date for filtering
     * @param Carbon|null $endDate End date for filtering
     * @return Collection Collection of test combinations with usage count
     */
    public function getMostCommonCombinations(int $limit = 10, ?Carbon $startDate = null, ?Carbon $endDate = null): Collection
    {
        // Get orders with their test IDs, filtered by date if provided
        $query = LabOrder::with(['results.test'])
            ->whereHas('results');

        // Apply date filtering if provided
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $orders = $query->get();

        $combinations = [];

        foreach ($orders as $order) {
            // Filter out results without valid tests
            $validResults = $order->results->filter(function ($result) {
                return $result->test !== null;
            });

            if ($validResults->count() < 2) {
                continue;
            }

            $testIds = $validResults->pluck('lab_test_id')->sort()->values();
            $testNames = $validResults->map(function ($result) {
                return $result->test->name;
            })->sort()->values();

            // Create a unique key for this combination (sorted test IDs)
            $combinationKey = $testIds->implode(',');
            $displayName = $testNames->implode(' + ');

            if (!isset($combinations[$combinationKey])) {
                $combinations[$combinationKey] = [
                    'test_ids' => $testIds->toArray(),
                    'test_names' => $testNames->toArray(),
                    'display_name' => $displayName,
                    'count' => 0,
                ];
            }

            $combinations[$combinationKey]['count']++;
        }

        // Sort by count and return top combinations
        $sortedCombinations = collect($combinations)
            ->sortByDesc('count')
            ->take($limit)
            ->values()
            ->map(function ($item) {
                return [
                    'test_ids' => $item['test_ids'],
                    'test_names' => $item['test_names'],
                    'display_name' => $item['display_name'],
                    'count' => $item['count'],
                ];
            });

        return $sortedCombinations;
    }

    /**
     * Get analytics summary for dashboard/reports
     *
     * @param int $topTestsLimit Number of top tests to return
     * @param int $topCombinationsLimit Number of top combinations to return
     * @param Carbon|null $startDate Start date for filtering
     * @param Carbon|null $endDate End date for filtering
     * @return array Analytics data
     */
    public function getAnalyticsSummary(int $topTestsLimit = 5, int $topCombinationsLimit = 5, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        return [
            'most_used_tests' => $this->getMostUsedTests($topTestsLimit, $startDate, $endDate),
            'most_common_combinations' => $this->getMostCommonCombinations($topCombinationsLimit, $startDate, $endDate),
        ];
    }
}

