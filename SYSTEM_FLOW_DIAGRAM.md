# 🔄 LAB TEST ADDITION SYSTEM FLOW DIAGRAM

## 📊 **COMPLETE SYSTEM FLOW VISUALIZATION**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CLINIC SYSTEM FLOW                                         │
└─────────────────────────────────────────────────────────────────────────────────────┘

PHASE 1: INITIAL APPOINTMENT
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PATIENT        │    │   APPOINTMENT   │    │   BILLING       │
│   BOOKS          │───▶│   CREATED       │───▶│   TRANSACTION   │
│   CONSULTATION   │    │   ₱300.00       │    │   ₱300.00       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   APPOINTMENT   │    │   STATUS:       │    │   STATUS:       │
│   CONFIRMED     │    │   CONFIRMED     │    │   PENDING       │
└─────────────────┘    └─────────────────┘    └─────────────────┘

PHASE 2: DOCTOR CONSULTATION
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DOCTOR        │    │   EXAMINATION   │    │   DIAGNOSIS     │
│   STARTS        │───▶│   & ASSESSMENT  │───▶│   DETERMINES    │
│   CONSULTATION  │    │                 │    │   LAB TESTS     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DOCTOR        │    │   SELECTS       │    │   LAB TESTS     │
│   OPENS         │    │   LAB TESTS:    │    │   NEEDED:       │
│   DASHBOARD     │    │   • CBC          │    │   • CBC (₱500)  │
│                 │    │   • Urinalysis   │    │   • Urinalysis  │
│                 │    │   • Blood Sugar  │    │     (₱500)     │
│                 │    │                 │    │   • Blood Sugar │
│                 │    │                 │    │     (₱500)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘

PHASE 3: LAB TEST ADDITION PROCESS
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DOCTOR        │    │   SYSTEM        │    │   DATABASE      │
│   CLICKS        │───▶│   PROCESSES     │───▶│   UPDATES       │
│   "ADD LAB      │    │   ADDITION      │    │   RECORDS       │
│   TESTS"        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   VALIDATION    │    │   CALCULATION    │    │   CREATION      │
│   & SECURITY    │    │   NEW TOTAL:     │    │   NEW RECORDS:  │
│   CHECKS        │    │   ₱300 + ₱1,500  │    │   • appointment_ │
│                 │    │   = ₱1,800       │    │     lab_tests    │
│                 │    │                 │    │   • billing_     │
│                 │    │                 │    │     transaction_ │
│                 │    │                 │    │     items        │
│                 │    │                 │    │   • lab_orders   │
└─────────────────┘    └─────────────────┘    └─────────────────┘

PHASE 4: SYSTEM UPDATES
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   APPOINTMENT   │    │   BILLING       │    │   LAB ORDER     │
│   UPDATED       │    │   TRANSACTION   │    │   CREATED       │
│   • total_lab_  │    │   UPDATED       │    │   • patient_id  │
│     amount:     │    │   • total_      │    │   • lab_tests   │
│     ₱1,500      │    │     amount:     │    │   • status:     │
│   • final_      │    │     ₱1,800      │    │     ordered     │
│     total:      │    │   • is_itemized │    │   • ordered_by  │
│     ₱1,800      │    │     true        │    │     doctor      │
└─────────────────┘    └─────────────────┘    └─────────────────┘

PHASE 5: NOTIFICATIONS & NEXT STEPS
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DOCTOR        │    │   PATIENT       │    │   LAB           │
│   NOTIFICATION  │    │   NOTIFICATION  │    │   TECHNICIAN    │
│   • Success     │    │   • Updated     │    │   NOTIFICATION  │
│   • New total   │    │     total       │    │   • New order   │
│   • Lab order   │    │   • Lab tests   │    │   • Tests list  │
│     created     │    │     added       │    │   • Priority    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 **DETAILED DATA FLOW**

```
BEFORE LAB TEST ADDITION:
┌─────────────────────────────────────────────────────────────────┐
│ APPOINTMENT TABLE                                               │
├─────────────────────────────────────────────────────────────────┤
│ id: 123                                                        │
│ patient_name: "John Doe"                                       │
│ appointment_type: "consultation"                               │
│ price: 300.00                                                  │
│ total_lab_amount: 0.00                                         │
│ final_total_amount: 300.00                                     │
│ status: "Confirmed"                                            │
│ billing_status: "pending"                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BILLING_TRANSACTIONS TABLE                                      │
├─────────────────────────────────────────────────────────────────┤
│ id: 456                                                        │
│ transaction_id: "TXN-000001"                                  │
│ patient_id: 789                                                │
│ total_amount: 300.00                                           │
│ amount: 300.00                                                 │
│ status: "pending"                                              │
│ description: "Payment for consultation appointment"           │
│ is_itemized: false                                            │
└─────────────────────────────────────────────────────────────────┘

AFTER LAB TEST ADDITION:
┌─────────────────────────────────────────────────────────────────┐
│ APPOINTMENT TABLE (UPDATED)                                     │
├─────────────────────────────────────────────────────────────────┤
│ id: 123                                                        │
│ patient_name: "John Doe"                                       │
│ appointment_type: "consultation"                               │
│ price: 300.00                                                  │
│ total_lab_amount: 1500.00  ← UPDATED                          │
│ final_total_amount: 1800.00  ← UPDATED                        │
│ status: "Confirmed"                                            │
│ billing_status: "pending"                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BILLING_TRANSACTIONS TABLE (UPDATED)                            │
├─────────────────────────────────────────────────────────────────┤
│ id: 456                                                        │
│ transaction_id: "TXN-000001"                                  │
│ patient_id: 789                                                │
│ total_amount: 1800.00  ← UPDATED                             │
│ amount: 1800.00  ← UPDATED                                    │
│ status: "pending"                                              │
│ description: "Payment for consultation appointment"           │
│ is_itemized: true  ← UPDATED                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ APPOINTMENT_LAB_TESTS TABLE (NEW)                              │
├─────────────────────────────────────────────────────────────────┤
│ id: 1, appointment_id: 123, lab_test_id: 1, unit_price: 500.00 │
│ id: 2, appointment_id: 123, lab_test_id: 2, unit_price: 500.00 │
│ id: 3, appointment_id: 123, lab_test_id: 3, unit_price: 500.00 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BILLING_TRANSACTION_ITEMS TABLE (NEW)                           │
├─────────────────────────────────────────────────────────────────┤
│ id: 1, billing_transaction_id: 456, item_type: "appointment"   │
│ id: 2, billing_transaction_id: 456, item_type: "lab_test"      │
│ id: 3, billing_transaction_id: 456, item_type: "lab_test"      │
│ id: 4, billing_transaction_id: 456, item_type: "lab_test"      │
└─────────────────────────────────────────────────────────────────┘
```

## 💰 **BILLING BREAKDOWN VISUALIZATION**

```
ORIGINAL BILLING:
┌─────────────────────────────────────────────────────────────────┐
│                    BILLING TRANSACTION #TXN-000001              │
├─────────────────────────────────────────────────────────────────┤
│ Patient: John Doe                                               │
│ Date: 2024-01-15                                               │
│                                                                 │
│ ITEMS:                                                          │
│ • Consultation                                      ₱300.00     │
│                                                                 │
│ TOTAL:                                              ₱300.00     │
│ STATUS: pending                                                 │
└─────────────────────────────────────────────────────────────────┘

UPDATED BILLING (After Lab Tests):
┌─────────────────────────────────────────────────────────────────┐
│                    BILLING TRANSACTION #TXN-000001              │
├─────────────────────────────────────────────────────────────────┤
│ Patient: John Doe                                               │
│ Date: 2024-01-15                                               │
│                                                                 │
│ ITEMS:                                                          │
│ • Consultation                                      ₱300.00     │
│ • CBC (Complete Blood Count)                        ₱500.00     │
│ • Urinalysis                                        ₱500.00     │
│ • Blood Sugar                                       ₱500.00     │
│                                                                 │
│ TOTAL:                                              ₱1,800.00   │
│ STATUS: pending                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 **USER INTERFACE FLOW**

```
DOCTOR DASHBOARD:
┌─────────────────────────────────────────────────────────────────┐
│                    TODAY'S APPOINTMENTS                        │
├─────────────────────────────────────────────────────────────────┤
│ 09:00 AM │ John Doe │ Consultation │ ₱300.00 │ [Add Lab Tests] │
│ 10:00 AM │ Jane Smith│ Checkup     │ ₱300.00 │ [Add Lab Tests] │
│ 11:00 AM │ Bob Wilson│ Consultation│ ₱300.00 │ [Add Lab Tests] │
└─────────────────────────────────────────────────────────────────┘

ADD LAB TESTS PAGE:
┌─────────────────────────────────────────────────────────────────┐
│                ADD LAB TESTS - John Doe's Consultation         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ APPOINTMENT DETAILS:                                            │
│ • Patient: John Doe                                             │
│ • Type: Consultation                                            │
│ • Base Price: ₱300.00                                          │
│ • Current Lab Total: ₱0.00                                     │
│ • Current Total: ₱300.00                                       │
│                                                                 │
│ AVAILABLE LAB TESTS:                                            │
│                                                                 │
│ ☐ CBC (Complete Blood Count)                   ₱500.00         │
│ ☐ Urinalysis                                  ₱500.00         │
│ ☐ Blood Sugar                                 ₱500.00         │
│ ☐ X-Ray                                       ₱700.00         │
│ ☐ Ultrasound                                  ₱800.00         │
│                                                                 │
│ NOTES:                                                          │
│ [Text area for doctor's notes]                                 │
│                                                                 │
│ ORDER SUMMARY:                                                  │
│ • Selected Tests: 3                                            │
│ • Lab Tests Total: ₱1,500.00                                  │
│ • New Total: ₱1,800.00                                        │
│                                                                 │
│ [Cancel] [Add Lab Tests]                                        │
└─────────────────────────────────────────────────────────────────┘

UPDATED APPOINTMENT VIEW:
┌─────────────────────────────────────────────────────────────────┐
│                APPOINTMENT DETAILS - John Doe                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ BASIC INFO:                                                     │
│ • Patient: John Doe                                            │
│ • Type: Consultation                                           │
│ • Date: 2024-01-15                                            │
│ • Time: 09:00 AM                                               │
│ • Status: Confirmed                                            │
│                                                                 │
│ BILLING BREAKDOWN:                                              │
│ • Base Appointment: ₱300.00                                    │
│ • Lab Tests: ₱1,500.00                                        │
│ • TOTAL: ₱1,800.00                                            │
│                                                                 │
│ LAB TESTS ADDED:                                                │
│ • CBC (₱500.00) - Pending                                      │
│ • Urinalysis (₱500.00) - Pending                              │
│ • Blood Sugar (₱500.00) - Pending                              │
│                                                                 │
│ [Edit Lab Tests] [Process Payment]                              │
└─────────────────────────────────────────────────────────────────┘
```

## 🔔 **NOTIFICATION FLOW**

```
SYSTEM NOTIFICATIONS:
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION CENTER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. DOCTOR NOTIFICATION:                                        │
│    ✅ "3 lab tests added to John Doe's appointment"             │
│    ✅ "Total updated to ₱1,800.00"                            │
│    ✅ "Lab order #LO-789 created"                              │
│                                                                 │
│ 2. PATIENT NOTIFICATION (if enabled):                         │
│    📱 SMS: "Your consultation now includes lab tests"          │
│    📧 Email: "Updated amount: ₱1,800.00"                      │
│    📋 Instructions: "Please proceed to lab for testing"        │
│                                                                 │
│ 3. LAB TECHNICIAN NOTIFICATION:                               │
│    🔬 "Lab order #LO-789 for John Doe"                        │
│    📋 "Tests: CBC, Urinalysis, Blood Sugar"                   │
│    ⚡ "Priority: Routine"                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

This comprehensive system flow diagram shows exactly how the lab test addition feature will work in your clinic system, from the initial appointment through the complete billing and lab order process.
