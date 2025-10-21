# 💰 LAB TEST ADDITION - BILLING FLOW

## 🔄 **COMPLETE BILLING FLOW DIAGRAM**

### **SCENARIO: Dr. Maria adds 3 lab tests to John's consultation**

---

## 📊 **BILLING FLOW STEPS**

### **STEP 1: INITIAL APPOINTMENT BILLING**
```
┌─────────────────────────────────────────────────────────────────┐
│                    INITIAL BILLING STATE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ APPOINTMENT:                                                     │
│ • Patient: John Doe                                             │
│ • Type: Consultation                                            │
│ • Base Price: ₱300.00                                          │
│ • Lab Tests: None                                               │
│ • Total: ₱300.00                                               │
│                                                                 │
│ BILLING TRANSACTION:                                            │
│ • Transaction ID: TXN-000001                                   │
│ • Amount: ₱300.00                                              │
│ • Status: pending                                              │
│ • Description: "Payment for consultation appointment"        │
│ • is_itemized: false                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **STEP 2: DOCTOR ADDS LAB TESTS**
```
┌─────────────────────────────────────────────────────────────────┐
│                    LAB TEST SELECTION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ DOCTOR SELECTS:                                                 │
│ • CBC (Complete Blood Count) - ₱500.00                        │
│ • Urinalysis - ₱500.00                                         │
│ • Blood Sugar - ₱500.00                                        │
│                                                                 │
│ CALCULATION:                                                    │
│ • Base Appointment: ₱300.00                                    │
│ • Lab Tests Total: ₱1,500.00                                   │
│ • NEW TOTAL: ₱1,800.00                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **STEP 3: SYSTEM PROCESSING**
```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM PROCESSING                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. VALIDATION:                                                  │
│    ✅ All lab tests exist and are active                       │
│    ✅ Doctor is authorized to add tests                         │
│    ✅ Appointment is in valid state                             │
│                                                                 │
│ 2. DATABASE UPDATES:                                            │
│    ├── appointment_lab_tests table:                             │
│    │   ├── CBC (₱500.00) - added by Dr. Maria                  │
│    │   ├── Urinalysis (₱500.00) - added by Dr. Maria           │
│    │   └── Blood Sugar (₱500.00) - added by Dr. Maria          │
│    │                                                           │
│    ├── appointments table:                                     │
│    │   ├── total_lab_amount: ₱1,500.00                        │
│    │   └── final_total_amount: ₱1,800.00                      │
│    │                                                           │
│    ├── billing_transactions table:                             │
│    │   ├── total_amount: ₱1,800.00                            │
│    │   ├── amount: ₱1,800.00                                  │
│    │   └── is_itemized: true                                  │
│    │                                                           │
│    └── billing_transaction_items table:                       │
│        ├── Consultation (₱300.00)                            │
│        ├── CBC (₱500.00)                                      │
│        ├── Urinalysis (₱500.00)                               │
│        └── Blood Sugar (₱500.00)                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **STEP 4: UPDATED BILLING TRANSACTION**
```
┌─────────────────────────────────────────────────────────────────┐
│                UPDATED BILLING TRANSACTION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ TRANSACTION #TXN-000001                                         │
│ Patient: John Doe                                               │
│ Date: 2024-01-15                                               │
│                                                                 │
│ ITEMIZED BREAKDOWN:                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ITEM                    │ QTY │ UNIT PRICE │ TOTAL         │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Consultation            │ 1   │ ₱300.00    │ ₱300.00       │ │
│ │ CBC (Complete Blood)    │ 1   │ ₱500.00    │ ₱500.00       │ │
│ │ Urinalysis              │ 1   │ ₱500.00    │ ₱500.00       │ │
│ │ Blood Sugar             │ 1   │ ₱500.00    │ ₱500.00       │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ SUBTOTAL                │     │            │ ₱1,800.00     │ │
│ │ DISCOUNT                │     │            │ ₱0.00         │ │
│ │ TOTAL                   │     │            │ ₱1,800.00     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ STATUS: pending                                                 │
│ PAYMENT METHOD: Not selected                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 **DETAILED BILLING PROCESS**

### **PHASE 1: BEFORE LAB TEST ADDITION**

#### **Database State:**
```sql
-- appointments table
id: 123
patient_name: "John Doe"
appointment_type: "consultation"
price: 300.00
total_lab_amount: 0.00
final_total_amount: 300.00
status: "Confirmed"
billing_status: "pending"

-- billing_transactions table
id: 456
transaction_id: "TXN-000001"
patient_id: 789
total_amount: 300.00
amount: 300.00
status: "pending"
description: "Payment for consultation appointment"
is_itemized: false

-- appointment_billing_links table
appointment_id: 123
billing_transaction_id: 456
status: "pending"
```

### **PHASE 2: DURING LAB TEST ADDITION**

#### **User Interface Flow:**
```
1. Doctor clicks "Add Lab Tests" button
2. System shows lab test selection page
3. Doctor selects tests:
   ├── ☑️ CBC (₱500.00)
   ├── ☑️ Urinalysis (₱500.00)
   └── ☑️ Blood Sugar (₱500.00)
4. System shows calculation:
   ├── Base appointment: ₱300.00
   ├── Lab tests: ₱1,500.00
   └── New total: ₱1,800.00
5. Doctor confirms addition
```

#### **Backend Processing:**
```php
// 1. Validate request
$validated = $request->validate([
    'lab_test_ids' => ['required', 'array', 'min:1'],
    'lab_test_ids.*' => ['exists:lab_tests,id'],
    'notes' => ['nullable', 'string']
]);

// 2. Get lab tests
$labTests = LabTest::whereIn('id', $validated['lab_test_ids'])->get();

// 3. Calculate totals
$totalLabAmount = $labTests->sum('price'); // ₱1,500.00
$newTotal = $appointment->price + $totalLabAmount; // ₱1,800.00

// 4. Create appointment lab test records
foreach ($labTests as $labTest) {
    AppointmentLabTest::create([
        'appointment_id' => $appointment->id,
        'lab_test_id' => $labTest->id,
        'unit_price' => $labTest->price,
        'total_price' => $labTest->price,
        'added_by' => auth()->id(),
        'status' => 'pending'
    ]);
}

// 5. Update appointment
$appointment->update([
    'total_lab_amount' => $totalLabAmount,
    'final_total_amount' => $newTotal
]);

// 6. Update billing transaction
$billingTransaction->update([
    'total_amount' => $newTotal,
    'amount' => $newTotal,
    'is_itemized' => true
]);

// 7. Create billing transaction items
foreach ($labTests as $labTest) {
    BillingTransactionItem::create([
        'billing_transaction_id' => $billingTransaction->id,
        'item_type' => 'lab_test',
        'item_id' => $labTest->id,
        'item_name' => $labTest->name,
        'unit_price' => $labTest->price,
        'total_price' => $labTest->price
    ]);
}
```

### **PHASE 3: AFTER LAB TEST ADDITION**

#### **Updated Database State:**
```sql
-- appointments table (UPDATED)
id: 123
patient_name: "John Doe"
appointment_type: "consultation"
price: 300.00
total_lab_amount: 1500.00  -- NEW
final_total_amount: 1800.00  -- NEW
status: "Confirmed"
billing_status: "pending"

-- billing_transactions table (UPDATED)
id: 456
transaction_id: "TXN-000001"
patient_id: 789
total_amount: 1800.00  -- UPDATED
amount: 1800.00  -- UPDATED
status: "pending"
description: "Payment for consultation appointment"
is_itemized: true  -- NEW

-- appointment_lab_tests table (NEW)
id: 1, appointment_id: 123, lab_test_id: 1, unit_price: 500.00, total_price: 500.00, added_by: 2, status: "pending"
id: 2, appointment_id: 123, lab_test_id: 2, unit_price: 500.00, total_price: 500.00, added_by: 2, status: "pending"
id: 3, appointment_id: 123, lab_test_id: 3, unit_price: 500.00, total_price: 500.00, added_by: 2, status: "pending"

-- billing_transaction_items table (NEW)
id: 1, billing_transaction_id: 456, item_type: "appointment", item_id: 123, item_name: "consultation", unit_price: 300.00, total_price: 300.00
id: 2, billing_transaction_id: 456, item_type: "lab_test", item_id: 1, item_name: "CBC", unit_price: 500.00, total_price: 500.00
id: 3, billing_transaction_id: 456, item_type: "lab_test", item_id: 2, item_name: "Urinalysis", unit_price: 500.00, total_price: 500.00
id: 4, billing_transaction_id: 456, item_type: "lab_test", item_id: 3, item_name: "Blood Sugar", unit_price: 500.00, total_price: 500.00
```

---

## 💳 **PAYMENT PROCESSING FLOW**

### **STEP 1: PATIENT PAYMENT**
```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT PROCESSING                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ CASHIER INTERFACE:                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ BILLING TRANSACTION #TXN-000001                             │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Patient: John Doe                                           │ │
│ │ Date: 2024-01-15                                           │ │
│ │                                                             │ │
│ │ ITEMS:                                                      │ │
│ │ • Consultation                              ₱300.00         │ │
│ │ • CBC (Complete Blood Count)               ₱500.00         │ │
│ │ • Urinalysis                                ₱500.00         │ │
│ │ • Blood Sugar                               ₱500.00         │ │
│ │                                                             │ │
│ │ TOTAL:                                      ₱1,800.00       │ │
│ │ STATUS: pending                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ PAYMENT OPTIONS:                                                │
│ • Cash: ₱1,800.00                                              │
│ • Credit Card: ₱1,800.00                                       │
│ • HMO: ₱1,800.00                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **STEP 2: PAYMENT CONFIRMATION**
```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT CONFIRMED                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ TRANSACTION UPDATED:                                            │
│ • Status: pending → paid                                        │
│ • Payment Method: cash                                          │
│ • Payment Reference: CASH-001                                  │
│ • Paid At: 2024-01-15 10:30:00                                 │
│                                                                 │
│ APPOINTMENT UPDATED:                                            │
│ • billing_status: pending → paid                                │
│ • final_total_amount: ₱1,800.00                                │
│                                                                 │
│ LAB TESTS UPDATED:                                              │
│ • Status: pending → ordered                                     │
│ • Lab Order Created: #LO-789                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 **BILLING REPORTS & ANALYTICS**

### **DAILY BILLING REPORT**
```
┌─────────────────────────────────────────────────────────────────┐
│                    DAILY BILLING REPORT                         │
├─────────────────────────────────────────────────────────────────┤
│ Date: 2024-01-15                                               │
│                                                                 │
│ SUMMARY:                                                        │
│ • Total Transactions: 15                                       │
│ • Total Revenue: ₱25,500.00                                    │
│ • Appointments with Lab Tests: 8                               │
│ • Lab Test Revenue: ₱12,000.00                                 │
│                                                                 │
│ BREAKDOWN BY TYPE:                                              │
│ • Consultations: 7 (₱2,100.00)                                │
│ • Lab Tests: 24 (₱12,000.00)                                   │
│ • Other Services: 3 (₱1,400.00)                                │
│                                                                 │
│ TOP LAB TESTS:                                                 │
│ • CBC: 8 orders (₱4,000.00)                                    │
│ • Urinalysis: 6 orders (₱3,000.00)                            │
│ • Blood Sugar: 5 orders (₱2,500.00)                           │
│ • X-Ray: 3 orders (₱2,100.00)                                 │
│ • Ultrasound: 2 orders (₱1,600.00)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **APPOINTMENT BILLING BREAKDOWN**
```
┌─────────────────────────────────────────────────────────────────┐
│                APPOINTMENT BILLING BREAKDOWN                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ APPOINTMENT #123 - John Doe                                     │
│ Date: 2024-01-15                                               │
│ Doctor: Dr. Maria Santos                                        │
│                                                                 │
│ BILLING DETAILS:                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ITEM                    │ QTY │ UNIT PRICE │ TOTAL         │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Consultation            │ 1   │ ₱300.00    │ ₱300.00       │ │
│ │ CBC (Complete Blood)    │ 1   │ ₱500.00    │ ₱500.00       │ │
│ │ Urinalysis              │ 1   │ ₱500.00    │ ₱500.00       │ │
│ │ Blood Sugar             │ 1   │ ₱500.00    │ ₱500.00       │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ SUBTOTAL                │     │            │ ₱1,800.00     │ │
│ │ DISCOUNT                │     │            │ ₱0.00         │ │
│ │ TOTAL                   │     │            │ ₱1,800.00     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ PAYMENT:                                                        │
│ • Method: Cash                                                 │
│ • Amount: ₱1,800.00                                           │
│ • Status: Paid                                                 │
│ • Date: 2024-01-15 10:30:00                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 **BILLING FLOW SUMMARY**

### **1. INITIAL STATE:**
- Appointment: ₱300.00 (consultation only)
- Billing Transaction: ₱300.00, pending

### **2. LAB TEST ADDITION:**
- Doctor selects 3 lab tests (₱1,500.00)
- System calculates new total: ₱1,800.00
- Database updates automatically

### **3. BILLING UPDATE:**
- Transaction amount: ₱300.00 → ₱1,800.00
- Itemized billing: true
- New items added to transaction

### **4. PAYMENT PROCESSING:**
- Patient pays ₱1,800.00
- All items marked as paid
- Lab tests ordered for lab

### **5. COMPLETION:**
- Appointment: billing_status = paid
- Lab tests: status = ordered
- Lab order: created and sent to lab

This billing flow ensures accurate tracking, proper itemization, and seamless integration between appointments, lab tests, and billing transactions.
