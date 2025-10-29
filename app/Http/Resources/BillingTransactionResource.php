<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Helpers\DateHelper;

class BillingTransactionResource extends JsonResource
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
            'transaction_id' => $this->transaction_id,
            'patient' => $this->whenLoaded('patient'),
            'doctor' => $this->whenLoaded('doctor'),
            'payment_type' => $this->payment_type,
            'total_amount' => $this->total_amount,
            'amount' => $this->amount,
            'discount_amount' => $this->discount_amount,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'description' => $this->description,
            'notes' => $this->notes,
            'items' => $this->whenLoaded('items'),
            'createdBy' => $this->whenLoaded('createdBy'),
            
            // Safely formatted dates
            'transaction_date' => DateHelper::safeFormatDate($this->transaction_date),
            'transaction_time' => DateHelper::safeFormatTime($this->transaction_date),
            'due_date' => DateHelper::safeFormatDate($this->due_date),
            'created_at' => DateHelper::safeFormatDateTime($this->created_at),
            'updated_at' => DateHelper::safeFormatDateTime($this->updated_at),
            
            // Raw dates for internal use (if needed)
            'raw_transaction_date' => $this->transaction_date,
            'raw_due_date' => $this->due_date,
            'raw_created_at' => $this->created_at,
            'raw_updated_at' => $this->updated_at,
        ];
    }
}

