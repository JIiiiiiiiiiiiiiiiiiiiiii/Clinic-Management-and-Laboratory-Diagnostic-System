<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SystemWideDataIntegrityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SystemFixController extends Controller
{
    protected $dataIntegrityService;

    public function __construct(SystemWideDataIntegrityService $dataIntegrityService)
    {
        $this->dataIntegrityService = $dataIntegrityService;
    }

    /**
     * Fix all system data integrity issues
     */
    public function fixAllIssues(Request $request)
    {
        try {
            Log::info('System fix API called', [
                'user_id' => auth()->id(),
                'request_data' => $request->all()
            ]);

            // Run comprehensive system fix
            $result = $this->dataIntegrityService->fixAllDataIntegrityIssues();

            if ($result['success']) {
                Log::info('System fix completed successfully', $result);
                
                return response()->json([
                    'success' => true,
                    'message' => 'All system issues have been fixed successfully',
                    'data' => $result
                ]);
            } else {
                Log::error('System fix failed', $result);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fix system issues: ' . $result['message']
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('System fix API error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'System fix failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check system health and identify issues
     */
    public function checkSystemHealth(Request $request)
    {
        try {
            $healthCheck = [
                'database_connection' => $this->checkDatabaseConnection(),
                'table_structure' => $this->checkTableStructure(),
                'data_integrity' => $this->checkDataIntegrity(),
                'foreign_keys' => $this->checkForeignKeys(),
                'indexes' => $this->checkIndexes(),
                'data_relationships' => $this->checkDataRelationships()
            ];

            $overallHealth = $this->calculateOverallHealth($healthCheck);

            return response()->json([
                'success' => true,
                'overall_health' => $overallHealth,
                'health_details' => $healthCheck,
                'recommendations' => $this->getRecommendations($healthCheck)
            ]);

        } catch (\Exception $e) {
            Log::error('System health check failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'System health check failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fix specific system component
     */
    public function fixComponent(Request $request, $component)
    {
        try {
            $validComponents = [
                'patients', 'appointments', 'visits', 'billing', 
                'daily_transactions', 'pending_appointments', 'relationships'
            ];

            if (!in_array($component, $validComponents)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid component specified'
                ], 400);
            }

            $result = $this->fixSpecificComponent($component);

            return response()->json([
                'success' => true,
                'message' => "Component '{$component}' fixed successfully",
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to fix component: {$component}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => "Failed to fix component '{$component}': " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check database connection
     */
    private function checkDatabaseConnection()
    {
        try {
            DB::connection()->getPdo();
            return ['status' => 'healthy', 'message' => 'Database connection successful'];
        } catch (\Exception $e) {
            return ['status' => 'unhealthy', 'message' => 'Database connection failed: ' . $e->getMessage()];
        }
    }

    /**
     * Check table structure
     */
    private function checkTableStructure()
    {
        $requiredTables = [
            'users', 'patients', 'appointments', 'visits', 
            'billing_transactions', 'appointment_billing_links', 
            'daily_transactions', 'pending_appointments'
        ];

        $missingTables = [];
        $existingTables = [];

        foreach ($requiredTables as $table) {
            if (DB::getSchemaBuilder()->hasTable($table)) {
                $existingTables[] = $table;
            } else {
                $missingTables[] = $table;
            }
        }

        if (empty($missingTables)) {
            return ['status' => 'healthy', 'message' => 'All required tables exist', 'tables' => $existingTables];
        } else {
            return ['status' => 'unhealthy', 'message' => 'Missing tables: ' . implode(', ', $missingTables), 'missing' => $missingTables];
        }
    }

    /**
     * Check data integrity
     */
    private function checkDataIntegrity()
    {
        $issues = [];

        // Check patients without user_id
        $patientsWithoutUser = DB::table('patients')->whereNull('user_id')->count();
        if ($patientsWithoutUser > 0) {
            $issues[] = "{$patientsWithoutUser} patients without user_id";
        }

        // Check appointments without patient_id
        $appointmentsWithoutPatient = DB::table('appointments')->whereNull('patient_id')->count();
        if ($appointmentsWithoutPatient > 0) {
            $issues[] = "{$appointmentsWithoutPatient} appointments without patient_id";
        }

        // Check visits without appointment_id
        $visitsWithoutAppointment = DB::table('visits')->whereNull('appointment_id')->count();
        if ($visitsWithoutAppointment > 0) {
            $issues[] = "{$visitsWithoutAppointment} visits without appointment_id";
        }

        // Check billing transactions without patient_id
        $billingWithoutPatient = DB::table('billing_transactions')->whereNull('patient_id')->count();
        if ($billingWithoutPatient > 0) {
            $issues[] = "{$billingWithoutPatient} billing transactions without patient_id";
        }

        if (empty($issues)) {
            return ['status' => 'healthy', 'message' => 'No data integrity issues found'];
        } else {
            return ['status' => 'unhealthy', 'message' => 'Data integrity issues found', 'issues' => $issues];
        }
    }

    /**
     * Check foreign keys
     */
    private function checkForeignKeys()
    {
        try {
            // Check if foreign keys exist
            $foreignKeys = DB::select("
                SELECT 
                    TABLE_NAME,
                    COLUMN_NAME,
                    CONSTRAINT_NAME,
                    REFERENCED_TABLE_NAME,
                    REFERENCED_COLUMN_NAME
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ");

            if (count($foreignKeys) > 0) {
                return ['status' => 'healthy', 'message' => 'Foreign keys exist', 'count' => count($foreignKeys)];
            } else {
                return ['status' => 'unhealthy', 'message' => 'No foreign keys found'];
            }
        } catch (\Exception $e) {
            return ['status' => 'unhealthy', 'message' => 'Failed to check foreign keys: ' . $e->getMessage()];
        }
    }

    /**
     * Check indexes
     */
    private function checkIndexes()
    {
        try {
            $indexes = DB::select("
                SELECT 
                    TABLE_NAME,
                    INDEX_NAME,
                    COLUMN_NAME
                FROM information_schema.STATISTICS 
                WHERE TABLE_SCHEMA = DATABASE()
                AND INDEX_NAME != 'PRIMARY'
            ");

            if (count($indexes) > 0) {
                return ['status' => 'healthy', 'message' => 'Indexes exist', 'count' => count($indexes)];
            } else {
                return ['status' => 'unhealthy', 'message' => 'No indexes found'];
            }
        } catch (\Exception $e) {
            return ['status' => 'unhealthy', 'message' => 'Failed to check indexes: ' . $e->getMessage()];
        }
    }

    /**
     * Check data relationships
     */
    private function checkDataRelationships()
    {
        $issues = [];

        // Check appointments without visits
        $appointmentsWithoutVisits = DB::table('appointments')
            ->leftJoin('visits', 'appointments.id', '=', 'visits.appointment_id')
            ->whereNull('visits.id')
            ->whereIn('appointments.status', ['Confirmed', 'Completed'])
            ->count();

        if ($appointmentsWithoutVisits > 0) {
            $issues[] = "{$appointmentsWithoutVisits} confirmed appointments without visits";
        }

        // Check appointments without billing
        $appointmentsWithoutBilling = DB::table('appointments')
            ->leftJoin('appointment_billing_links', 'appointments.id', '=', 'appointment_billing_links.appointment_id')
            ->whereNull('appointment_billing_links.id')
            ->whereIn('appointments.status', ['Confirmed', 'Completed'])
            ->count();

        if ($appointmentsWithoutBilling > 0) {
            $issues[] = "{$appointmentsWithoutBilling} confirmed appointments without billing";
        }

        if (empty($issues)) {
            return ['status' => 'healthy', 'message' => 'All data relationships are intact'];
        } else {
            return ['status' => 'unhealthy', 'message' => 'Data relationship issues found', 'issues' => $issues];
        }
    }

    /**
     * Calculate overall system health
     */
    private function calculateOverallHealth($healthCheck)
    {
        $healthyCount = 0;
        $totalCount = count($healthCheck);

        foreach ($healthCheck as $check) {
            if ($check['status'] === 'healthy') {
                $healthyCount++;
            }
        }

        $percentage = ($healthyCount / $totalCount) * 100;

        if ($percentage >= 90) {
            return 'excellent';
        } elseif ($percentage >= 70) {
            return 'good';
        } elseif ($percentage >= 50) {
            return 'fair';
        } else {
            return 'poor';
        }
    }

    /**
     * Get recommendations based on health check
     */
    private function getRecommendations($healthCheck)
    {
        $recommendations = [];

        foreach ($healthCheck as $component => $check) {
            if ($check['status'] === 'unhealthy') {
                switch ($component) {
                    case 'database_connection':
                        $recommendations[] = 'Check database configuration and connection settings';
                        break;
                    case 'table_structure':
                        $recommendations[] = 'Run database migrations to create missing tables';
                        break;
                    case 'data_integrity':
                        $recommendations[] = 'Run data integrity fix to resolve data issues';
                        break;
                    case 'foreign_keys':
                        $recommendations[] = 'Add foreign key constraints to ensure data relationships';
                        break;
                    case 'indexes':
                        $recommendations[] = 'Add database indexes to improve performance';
                        break;
                    case 'data_relationships':
                        $recommendations[] = 'Sync data relationships between tables';
                        break;
                }
            }
        }

        return $recommendations;
    }

    /**
     * Fix specific component
     */
    private function fixSpecificComponent($component)
    {
        switch ($component) {
            case 'patients':
                return $this->dataIntegrityService->fixPatientDataIntegrity();
            case 'appointments':
                return $this->dataIntegrityService->fixAppointmentDataIntegrity();
            case 'visits':
                return $this->dataIntegrityService->fixVisitDataIntegrity();
            case 'billing':
                return $this->dataIntegrityService->fixBillingTransactionDataIntegrity();
            case 'daily_transactions':
                return $this->dataIntegrityService->fixDailyTransactions();
            case 'pending_appointments':
                return $this->dataIntegrityService->fixPendingAppointments();
            case 'relationships':
                return $this->dataIntegrityService->syncAllDataRelationships();
            default:
                throw new \InvalidArgumentException("Unknown component: {$component}");
        }
    }
}
