-- ============================================
-- COMPREHENSIVE PERFORMANCE INDEXES
-- ============================================
-- Run this SQL script in MySQL Workbench to add performance indexes
-- These indexes will significantly speed up common queries
-- ============================================

-- APPOINTMENTS TABLE INDEXES
-- ============================================
ALTER TABLE `appointments`
    ADD INDEX IF NOT EXISTS `appointments_patient_id_index` (`patient_id`),
    ADD INDEX IF NOT EXISTS `appointments_specialist_id_index` (`specialist_id`),
    ADD INDEX IF NOT EXISTS `appointments_status_index` (`status`),
    ADD INDEX IF NOT EXISTS `appointments_appointment_date_index` (`appointment_date`),
    ADD INDEX IF NOT EXISTS `appointments_appointment_type_index` (`appointment_type`),
    ADD INDEX IF NOT EXISTS `appointments_source_index` (`source`),
    ADD INDEX IF NOT EXISTS `appointments_billing_status_index` (`billing_status`),
    ADD INDEX IF NOT EXISTS `appointments_patient_id_status_index` (`patient_id`, `status`),
    ADD INDEX IF NOT EXISTS `appointments_appointment_date_status_index` (`appointment_date`, `status`),
    ADD INDEX IF NOT EXISTS `appointments_specialist_id_date_index` (`specialist_id`, `appointment_date`),
    ADD INDEX IF NOT EXISTS `appointments_date_status_type_index` (`appointment_date`, `status`, `appointment_type`);

-- BILLING TRANSACTIONS TABLE INDEXES
-- ============================================
ALTER TABLE `billing_transactions`
    ADD INDEX IF NOT EXISTS `billing_transactions_patient_id_index` (`patient_id`),
    ADD INDEX IF NOT EXISTS `billing_transactions_doctor_id_index` (`doctor_id`),
    ADD INDEX IF NOT EXISTS `billing_transactions_status_index` (`status`),
    ADD INDEX IF NOT EXISTS `billing_transactions_payment_method_index` (`payment_method`),
    ADD INDEX IF NOT EXISTS `billing_transactions_transaction_date_index` (`transaction_date`),
    ADD INDEX IF NOT EXISTS `billing_transactions_appointment_id_index` (`appointment_id`),
    ADD INDEX IF NOT EXISTS `billing_transactions_date_status_index` (`transaction_date`, `status`),
    ADD INDEX IF NOT EXISTS `billing_transactions_doctor_date_index` (`doctor_id`, `transaction_date`),
    ADD INDEX IF NOT EXISTS `billing_transactions_status_method_index` (`status`, `payment_method`);

-- PENDING APPOINTMENTS TABLE INDEXES
-- ============================================
ALTER TABLE `pending_appointments`
    ADD INDEX IF NOT EXISTS `pending_appointments_patient_id_index` (`patient_id`),
    ADD INDEX IF NOT EXISTS `pending_appointments_specialist_id_index` (`specialist_id`),
    ADD INDEX IF NOT EXISTS `pending_appointments_status_approval_index` (`status_approval`),
    ADD INDEX IF NOT EXISTS `pending_appointments_appointment_date_index` (`appointment_date`),
    ADD INDEX IF NOT EXISTS `pending_appointments_patient_status_index` (`patient_id`, `status_approval`);

-- PATIENTS TABLE INDEXES
-- ============================================
ALTER TABLE `patients`
    ADD INDEX IF NOT EXISTS `patients_user_id_index` (`user_id`),
    ADD INDEX IF NOT EXISTS `patients_patient_no_index` (`patient_no`),
    ADD INDEX IF NOT EXISTS `patients_status_index` (`status`),
    ADD INDEX IF NOT EXISTS `patients_first_last_name_index` (`first_name`, `last_name`);

-- USERS TABLE INDEXES
-- ============================================
ALTER TABLE `users`
    ADD INDEX IF NOT EXISTS `users_role_index` (`role`),
    ADD INDEX IF NOT EXISTS `users_is_active_index` (`is_active`),
    ADD INDEX IF NOT EXISTS `users_role_active_index` (`role`, `is_active`);

-- APPOINTMENT BILLING LINKS INDEXES
-- ============================================
ALTER TABLE `appointment_billing_links`
    ADD INDEX IF NOT EXISTS `appointment_billing_links_appointment_id_index` (`appointment_id`),
    ADD INDEX IF NOT EXISTS `appointment_billing_links_transaction_id_index` (`transaction_id`);

-- DAILY TRANSACTIONS INDEXES
-- ============================================
ALTER TABLE `daily_transactions`
    ADD INDEX IF NOT EXISTS `daily_transactions_date_index` (`date`),
    ADD INDEX IF NOT EXISTS `daily_transactions_status_index` (`status`),
    ADD INDEX IF NOT EXISTS `daily_transactions_date_status_index` (`date`, `status`);

-- LAB TESTS INDEXES
-- ============================================
ALTER TABLE `lab_tests`
    ADD INDEX IF NOT EXISTS `lab_tests_status_index` (`status`),
    ADD INDEX IF NOT EXISTS `lab_tests_category_index` (`category`);

-- NOTIFICATIONS INDEXES
-- ============================================
ALTER TABLE `notifications`
    ADD INDEX IF NOT EXISTS `notifications_user_id_index` (`user_id`),
    ADD INDEX IF NOT EXISTS `notifications_read_index` (`read`),
    ADD INDEX IF NOT EXISTS `notifications_type_index` (`type`),
    ADD INDEX IF NOT EXISTS `notifications_user_read_index` (`user_id`, `read`);

-- PATIENT TRANSFERS INDEXES
-- ============================================
ALTER TABLE `patient_transfers`
    ADD INDEX IF NOT EXISTS `patient_transfers_patient_id_index` (`patient_id`),
    ADD INDEX IF NOT EXISTS `patient_transfers_status_index` (`status`),
    ADD INDEX IF NOT EXISTS `patient_transfers_approval_status_index` (`approval_status`),
    ADD INDEX IF NOT EXISTS `patient_transfers_requested_by_index` (`requested_by`);

-- ============================================
-- INDEXES ADDED SUCCESSFULLY!
-- ============================================
-- Expected performance improvements:
-- - 50-90% faster queries on indexed columns
-- - Much faster filtering and sorting operations
-- - Improved performance for reports and dashboards
-- ============================================

