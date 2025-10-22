<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Helpers\DateHelper;

class AppointmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'appointment_code' => $this->appointment_code,
            'patient_name' => $this->patient_name,
            'patient_id' => $this->patient_id,
            'appointment_type' => $this->appointment_type,
            'price' => $this->price,
            'specialist_name' => $this->specialist_name,
            'specialist_id' => $this->specialist_id,
            'status' => $this->status,
            'billing_status' => $this->billing_status,
            'notes' => $this->notes,
            
            // Safely formatted dates
            'appointment_date' => DateHelper::safeFormatDate($this->appointment_date),
            'appointment_time' => DateHelper::safeFormatTime($this->appointment_time),
            'created_at' => DateHelper::safeFormatDateTime($this->created_at),
            'updated_at' => DateHelper::safeFormatDateTime($this->updated_at),
            
            // Raw dates for internal use (if needed)
            'raw_appointment_date' => $this->appointment_date,
            'raw_appointment_time' => $this->appointment_time,
            'raw_created_at' => $this->created_at,
            'raw_updated_at' => $this->updated_at,
        ];
    }
}

