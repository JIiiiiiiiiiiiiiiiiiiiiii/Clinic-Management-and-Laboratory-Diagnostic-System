# 💰 LAB TEST BILLING FLOW - VISUAL DIAGRAM

## 🔄 **COMPLETE BILLING FLOW VISUALIZATION**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           LAB TEST BILLING FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

PHASE 1: INITIAL APPOINTMENT
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   APPOINTMENT   │    │   BILLING       │    │   STATUS        │
│   CREATED       │───▶│   TRANSACTION   │───▶│   PENDING       │
│   ₱300.00       │    │   ₱300.00       │    │   PAYMENT       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CONSULTATION  │    │   ITEMIZED:     │    │   WAITING FOR   │
│   ONLY          │    │   FALSE         │    │   PAYMENT       │
└─────────────────┘    └─────────────────┘    └─────────────────┘

PHASE 2: DOCTOR ADDS LAB TESTS
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DOCTOR        │    │   LAB TEST      │    │   CALCULATION   │
│   SELECTS       │───▶│   SELECTION     │───▶│   NEW TOTAL:    │
│   TESTS         │    │   • CBC (₱500)  │    │   ₱1,800.00     │
│                 │    │   • Urinalysis  │    │                 │
│                 │    │   • Blood Sugar │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SYSTEM        │    │   DATABASE      │    │   BILLING       │
│   PROCESSES     │    │   UPDATES       │    │   RECALCULATES  │
│   ADDITION      │    │   RECORDS       │    │   TRANSACTION   │
└─────────────────┘    └─────────────────┘    └─────────────────┘

PHASE 3: BILLING TRANSACTION UPDATE
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   APPOINTMENT   │    │   BILLING       │    │   ITEMIZED      │
│   UPDATED       │    │   TRANSACTION   │    │   BILLING       │
│   • total_lab:  │    │   UPDATED       │    │   CREATED       │
│     ₱1,500      │    │   • amount:     │    │   • Consultation│
│   • final_total:│    │     ₱1,800      │    │     ₱300.00     │
│     ₱1,800      │    │   • itemized:   │    │   • CBC ₱500.00 │
│                 │    │     true        │    │   • Urinalysis  │
│                 │    │                 │    │     ₱500.00     │
│                 │    │                 │    │   • Blood Sugar │
│                 │    │                 │    │     ₱500.00     │
└─────────────────┘    └─────────────────┘    └─────────────────┘

PHASE 4: PAYMENT PROCESSING
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PATIENT       │    │   CASHIER       │    │   PAYMENT       │
│   PAYS          │───▶│   PROCESSES     │───▶│   CONFIRMED     │
│   ₱1,800.00     │    │   PAYMENT       │    │   • Status: paid│
│                 │    │                 │    │   • Method: cash │
│                 │    │                 │    │   • Reference:  │
│                 │    │                 │    │     CASH-001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘

PHASE 5: COMPLETION
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   APPOINTMENT   │    │   LAB TESTS     │    │   LAB ORDER     │
│   COMPLETED     │    │   ORDERED       │    │   CREATED       │
│   • billing_    │    │   • Status:     │    │   • Order #:    │
│     status:     │    │     ordered     │    │     LO-789      │
│     paid        │    │   • Tests: 3    │    │   • Patient:    │
│   • final_total:│    │   • Total:      │    │     John Doe    │
│     ₱1,800      │    │     ₱1,500      │    │   • Status:     │
│                 │    │                 │    │     ordered     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 💰 **BILLING BREAKDOWN VISUALIZATION**

### **BEFORE LAB TEST ADDITION:**
```
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
│ ITEMIZED: false                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **AFTER LAB TEST ADDITION:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    BILLING TRANSACTION #TXN-000001              │
├─────────────────────────────────────────────────────────────────┤
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
│ ITEMIZED: true                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 **DATABASE STATE CHANGES**

### **BEFORE LAB TEST ADDITION:**
```
┌─────────────────────────────────────────────────────────────────┐
│ APPOINTMENTS TABLE                                              │
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
```

### **AFTER LAB TEST ADDITION:**
```
┌─────────────────────────────────────────────────────────────────┐
│ APPOINTMENTS TABLE (UPDATED)                                    │
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
│ BILLING_TRANSACTIONS TABLE (UPDATED)                           │
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

## 💳 **PAYMENT PROCESSING FLOW**

```
PAYMENT INITIATION:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PATIENT       │    │   CASHIER       │    │   SYSTEM        │
│   APPROACHES    │───▶│   OPENS         │───▶│   DISPLAYS      │
│   COUNTER       │    │   BILLING       │    │   ITEMIZED      │
│                 │    │   SYSTEM        │    │   BREAKDOWN     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SHOWS         │    │   REVIEWS       │    │   CALCULATES     │
│   RECEIPT       │    │   ITEMS         │    │   TOTAL:        │
│   ₱1,800.00     │    │   • Consultation│    │   ₱1,800.00     │
│                 │    │   • 3 Lab Tests │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘

PAYMENT PROCESSING:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PATIENT       │    │   CASHIER       │    │   SYSTEM        │
│   PAYS          │───▶│   PROCESSES     │───▶│   UPDATES       │
│   ₱1,800.00     │    │   PAYMENT       │    │   STATUS        │
│   CASH          │    │   • Method: cash│    │   • paid        │
│                 │    │   • Reference:  │    │   • timestamp   │
│                 │    │     CASH-001    │    │   • method      │
└─────────────────┘    └─────────────────┘    └─────────────────┘

PAYMENT CONFIRMATION:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   RECEIPT       │    │   APPOINTMENT   │    │   LAB ORDER     │
│   PRINTED       │    │   UPDATED       │    │   CREATED       │
│   • Transaction │    │   • billing_    │    │   • Order #:    │
│     #TXN-000001 │    │     status:     │    │     LO-789      │
│   • Amount:     │    │     paid        │    │   • Tests: 3    │
│     ₱1,800.00   │    │   • final_total:│    │   • Status:     │
│   • Date:       │    │     ₱1,800      │    │     ordered     │
│     2024-01-15   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 **BILLING REPORTS FLOW**

```
DAILY REPORTING:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SYSTEM        │    │   GENERATES     │    │   ADMIN         │
│   COLLECTS      │───▶│   DAILY         │───▶│   REVIEWS       │
│   DATA          │    │   REPORTS       │    │   ANALYTICS     │
│   • Transactions│    │   • Revenue     │    │   • Lab Test    │
│   • Lab Tests   │    │   • Lab Tests   │    │     Revenue     │
│   • Payments    │    │   • Breakdown   │    │   • Trends      │
└─────────────────┘    └─────────────────┘    └─────────────────┘

ANALYTICS BREAKDOWN:
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

This comprehensive billing flow diagram shows exactly how the billing system will work when doctors add lab tests to existing appointments, from the initial appointment through payment processing and reporting.
