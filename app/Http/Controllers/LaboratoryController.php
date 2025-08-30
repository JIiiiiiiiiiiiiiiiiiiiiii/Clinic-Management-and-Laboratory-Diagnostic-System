<?php

namespace App\Http\Controllers;

use App\Models\LaboratoryRequest;
use App\Models\LaboratoryTest;
use App\Models\Patient;
use App\Models\CbcResult;
use App\Models\UrinalysisResult;
use App\Models\FecalysisResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class LaboratoryController extends Controller
{
    public function index(Request $request)
    {
        $query = LaboratoryRequest::with(['consultation', 'test', 'requestedBy', 'cbcResults', 'urinalysisResults', 'fecalysisResults']);

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }
        if ($request->filled('test_id')) {
            $query->where('test_id', $request->test_id);
        }
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->byDateRange($request->date_from, $request->date_to);
        }

        $requests = $query->latest()->paginate(10);
        $tests = LaboratoryTest::orderBy('test_name')->get(['test_id','test_name']);

        return Inertia::render('management/laboratory/index', [
            'requests' => $requests->items(),
            'pagination' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
            'tests' => $tests,
            'filters' => $request->only(['status','test_id','date_from','date_to'])
        ]);
    }

    public function create()
    {
        $patients = Patient::orderBy('last_name')->get(['patient_id','first_name','last_name']);
        $tests = LaboratoryTest::orderBy('test_name')->get(['test_id','test_name']);

        return Inertia::render('management/laboratory/create', [
            'patients' => $patients,
            'tests' => $tests,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,patient_id',
            'test_id' => 'required|exists:laboratory_tests,test_id',
            'request_date' => 'nullable|date',
        ]);
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        DB::transaction(function () use ($request) {
            LaboratoryRequest::create([
                'consultation_id' => $request->consultation_id, // optional
                'test_id' => $request->test_id,
                'requested_by_user_id' => auth()->id(),
                'request_date' => $request->request_date ?: now()->toDateString(),
                'status' => 'Requested',
            ]);
        });

        return redirect()->route('laboratory.index')->with('success', 'Laboratory request created.');
    }

    public function show(LaboratoryRequest $laboratory)
    {
        $laboratory->load(['consultation.patient', 'test', 'requestedBy', 'cbcResults', 'urinalysisResults', 'fecalysisResults']);

        $resultSchema = $this->getResultSchemaForTest($laboratory->test_id);

        return Inertia::render('management/laboratory/show', [
            'request' => $laboratory,
            'resultSchema' => $resultSchema,
        ]);
    }

    public function saveResults(Request $request, LaboratoryRequest $laboratory)
    {
        $laboratory->load('test');
        $testName = strtolower($laboratory->test->test_name);

        $payload = $request->all();

        DB::transaction(function () use ($testName, $payload, $laboratory) {
            if (str_contains($testName, 'cbc')) {
                CbcResult::updateOrCreate(
                    ['laboratory_request_id' => $laboratory->laboratory_request_id],
                    array_merge(['laboratory_request_id' => $laboratory->laboratory_request_id], $this->filterPayload($payload, [
                        'hemoglobin','hematocrit','white_blood_cell','red_blood_cell','platelet_count','segmenters','lymphocytes','mixed','mcv','mch','mchc'
                    ]))
                );
            } elseif (str_contains($testName, 'urinalysis')) {
                UrinalysisResult::updateOrCreate(
                    ['laboratory_request_id' => $laboratory->laboratory_request_id],
                    array_merge(['laboratory_request_id' => $laboratory->laboratory_request_id], $this->filterPayload($payload, [
                        'color','transparency','specific_gravity','ph','albumin','glucose','ketone','bile','urobilinogen','blood','white_blood_cell','red_blood_cell','casts','crystals','epithelial_cells','bacteria','mucus_threads','others'
                    ]))
                );
            } elseif (str_contains($testName, 'fecal')) {
                FecalysisResult::updateOrCreate(
                    ['laboratory_request_id' => $laboratory->laboratory_request_id],
                    array_merge(['laboratory_request_id' => $laboratory->laboratory_request_id], $this->filterPayload($payload, [
                        'color','consistency','parasites','ova'
                    ]))
                );
            }

            $laboratory->update([
                'status' => $payload['status'] ?? 'Completed',
                'result_date' => now()->toDateString(),
            ]);
        });

        return back()->with('success', 'Results saved successfully.');
    }

    public function testsList()
    {
        return response()->json(LaboratoryTest::orderBy('test_name')->get(['test_id','test_name','description','price']));
    }

    public function resultSchema($testId)
    {
        return response()->json($this->getResultSchemaForTest($testId));
    }

    private function getResultSchemaForTest($testId)
    {
        $test = LaboratoryTest::find($testId);
        if (!$test) return [];
        $name = strtolower($test->test_name);

        if (str_contains($name, 'cbc')) {
            return [
                'fields' => [
                    ['key' => 'hemoglobin','label' => 'Hemoglobin','type' => 'number'],
                    ['key' => 'hematocrit','label' => 'Hematocrit','type' => 'number'],
                    ['key' => 'white_blood_cell','label' => 'WBC','type' => 'number'],
                    ['key' => 'red_blood_cell','label' => 'RBC','type' => 'number'],
                    ['key' => 'platelet_count','label' => 'Platelet Count','type' => 'number'],
                    ['key' => 'segmenters','label' => 'Segmenters %','type' => 'number'],
                    ['key' => 'lymphocytes','label' => 'Lymphocytes %','type' => 'number'],
                    ['key' => 'mixed','label' => 'Mixed %','type' => 'number'],
                    ['key' => 'mcv','label' => 'MCV','type' => 'number'],
                    ['key' => 'mch','label' => 'MCH','type' => 'number'],
                    ['key' => 'mchc','label' => 'MCHC','type' => 'number'],
                ]
            ];
        }
        if (str_contains($name, 'urinalysis')) {
            return [
                'fields' => [
                    ['key' => 'color','label' => 'Color','type' => 'text'],
                    ['key' => 'transparency','label' => 'Transparency','type' => 'text'],
                    ['key' => 'specific_gravity','label' => 'Specific Gravity','type' => 'number','step' => '0.001'],
                    ['key' => 'ph','label' => 'pH','type' => 'number','step' => '0.1'],
                    ['key' => 'albumin','label' => 'Albumin','type' => 'text'],
                    ['key' => 'glucose','label' => 'Glucose','type' => 'text'],
                    ['key' => 'ketone','label' => 'Ketone','type' => 'text'],
                    ['key' => 'bile','label' => 'Bile','type' => 'text'],
                    ['key' => 'urobilinogen','label' => 'Urobilinogen','type' => 'text'],
                    ['key' => 'blood','label' => 'Blood','type' => 'text'],
                    ['key' => 'white_blood_cell','label' => 'WBC (HPF)','type' => 'number'],
                    ['key' => 'red_blood_cell','label' => 'RBC (HPF)','type' => 'number'],
                    ['key' => 'casts','label' => 'Casts','type' => 'text'],
                    ['key' => 'crystals','label' => 'Crystals','type' => 'text'],
                    ['key' => 'epithelial_cells','label' => 'Epithelial Cells','type' => 'text'],
                    ['key' => 'bacteria','label' => 'Bacteria','type' => 'text'],
                    ['key' => 'mucus_threads','label' => 'Mucus Threads','type' => 'text'],
                    ['key' => 'others','label' => 'Others','type' => 'text'],
                ]
            ];
        }
        if (str_contains($name, 'fecal')) {
            return [
                'fields' => [
                    ['key' => 'color','label' => 'Color','type' => 'text'],
                    ['key' => 'consistency','label' => 'Consistency','type' => 'text'],
                    ['key' => 'parasites','label' => 'Parasites','type' => 'text'],
                    ['key' => 'ova','label' => 'Ova','type' => 'text'],
                ]
            ];
        }

        // default empty schema; custom tests could be supported via CustomClinicalRecord
        return ['fields' => []];
    }

    private function filterPayload(array $payload, array $keys): array
    {
        return array_filter(
            array_intersect_key($payload, array_flip($keys)),
            fn ($v) => $v !== null && $v !== ''
        );
    }
}
