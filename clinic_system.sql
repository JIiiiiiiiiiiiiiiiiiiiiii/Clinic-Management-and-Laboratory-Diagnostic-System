-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 19, 2025 at 01:34 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `clinic_system`
--
CREATE DATABASE IF NOT EXISTS `clinic_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `clinic_system`;

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `appointment_code` varchar(10) DEFAULT NULL,
  `sequence_number` int(11) DEFAULT NULL,
  `patient_name` varchar(255) NOT NULL,
  `patient_id` bigint(20) UNSIGNED DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `appointment_type` varchar(255) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `additional_info` text DEFAULT NULL,
  `specialist_type` varchar(255) NOT NULL,
  `specialist_name` varchar(255) NOT NULL,
  `specialist_id` bigint(20) UNSIGNED DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `duration` varchar(255) NOT NULL DEFAULT '30 min',
  `status` enum('Pending','Confirmed','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `billing_status` enum('pending','in_transaction','paid','cancelled') NOT NULL DEFAULT 'pending',
  `appointment_source` enum('online','walk_in') NOT NULL DEFAULT 'online',
  `booking_method` varchar(255) NOT NULL DEFAULT 'Online',
  `billing_reference` varchar(255) DEFAULT NULL,
  `confirmation_sent` tinyint(1) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `special_requirements` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `source` enum('Online','Walk-in') DEFAULT 'Online',
  `admin_notes` text DEFAULT NULL,
  `patient_id_fk` bigint(20) UNSIGNED DEFAULT NULL,
  `specialist_id_fk` bigint(20) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appointments_appointment_date_appointment_time_index` (`appointment_date`,`appointment_time`),
  KEY `appointments_status_index` (`status`),
  KEY `appointments_specialist_type_specialist_id_index` (`specialist_type`),
  KEY `appointments_appointment_type_index` (`appointment_type`),
  KEY `appointments_patient_datetime_index` (`appointment_date`,`appointment_time`),
  KEY `appointments_status_appointment_date_index` (`status`,`appointment_date`),
  KEY `appointments_specialist_id_appointment_date_index` (`appointment_date`),
  KEY `appointments_patient_id_status_index` (`status`),
  KEY `appointments_billing_status_appointment_date_index` (`appointment_date`),
  KEY `appointments_sequence_number_index` (`sequence_number`),
  KEY `appointments_patient_id_appointment_date_index` (`patient_id`,`appointment_date`),
  KEY `appointments_specialist_id_foreign` (`specialist_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `appointment_code`, `sequence_number`, `patient_name`, `patient_id`, `contact_number`, `appointment_type`, `price`, `additional_info`, `specialist_type`, `specialist_name`, `specialist_id`, `appointment_date`, `appointment_time`, `duration`, `status`, `billing_status`, `appointment_source`, `booking_method`, `billing_reference`, `confirmation_sent`, `notes`, `special_requirements`, `created_at`, `updated_at`, `deleted_at`, `source`, `admin_notes`, `patient_id_fk`, `specialist_id_fk`) VALUES
(1, NULL, NULL, 'Ronnel Basierto', 1, '09494449144', 'cbc', 500.00, NULL, 'medtech', 'Med Tech Ron', 8, '2025-10-20', '14:00:00', '30 min', 'Confirmed', 'paid', 'online', 'Online', NULL, 0, NULL, NULL, '2025-10-18 01:40:24', '2025-10-18 01:41:41', NULL, 'Online', NULL, NULL, NULL),
(2, NULL, NULL, 'Jehus Cabalejo', 2, '0943255466', 'general_consultation', 300.00, NULL, 'doctor', 'Dr. Juan Dela Cruz', 2, '2025-10-20', '14:30:00', '30 min', 'Confirmed', 'in_transaction', 'online', 'Online', NULL, 0, NULL, NULL, '2025-10-18 01:55:23', '2025-10-18 02:55:29', NULL, 'Online', NULL, NULL, NULL),
(3, NULL, NULL, 'loyd Loyd', 3, '09123456789', 'fecalysis_test', 500.00, NULL, 'medtech', 'MedTech Robert Wilson', 7, '2025-10-29', '14:00:00', '30 min', 'Confirmed', 'in_transaction', 'online', 'Online', NULL, 0, NULL, NULL, '2025-10-18 02:31:43', '2025-10-18 02:55:33', NULL, 'Online', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `appointment_billing_links`
--

DROP TABLE IF EXISTS `appointment_billing_links`;
CREATE TABLE IF NOT EXISTS `appointment_billing_links` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint(20) UNSIGNED NOT NULL,
  `billing_transaction_id` bigint(20) UNSIGNED NOT NULL,
  `appointment_type` varchar(255) DEFAULT NULL,
  `appointment_price` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appt_billing_unique` (`appointment_id`,`billing_transaction_id`),
  KEY `appointment_billing_links_appointment_id_status_index` (`appointment_id`,`status`),
  KEY `appointment_billing_links_billing_transaction_id_status_index` (`billing_transaction_id`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointment_billing_links`
--

INSERT INTO `appointment_billing_links` (`id`, `appointment_id`, `billing_transaction_id`, `appointment_type`, `appointment_price`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'cbc', 500.00, 'paid', '2025-10-18 01:41:34', '2025-10-18 01:41:41'),
(2, 2, 2, 'general_consultation', 300.00, 'pending', '2025-10-18 02:55:29', '2025-10-18 02:55:29'),
(3, 3, 3, 'fecalysis_test', 500.00, 'pending', '2025-10-18 02:55:33', '2025-10-18 02:55:33');

-- --------------------------------------------------------

--
-- Table structure for table `billing_transactions`
--

DROP TABLE IF EXISTS `billing_transactions`;
CREATE TABLE IF NOT EXISTS `billing_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `transaction_code` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `patient_id` bigint(20) UNSIGNED DEFAULT NULL,
  `doctor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `payment_type` enum('cash','health_card','discount') NOT NULL DEFAULT 'cash',
  `total_amount` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_percentage` decimal(5,2) DEFAULT NULL,
  `hmo_provider` varchar(255) DEFAULT NULL,
  `hmo_reference` varchar(255) DEFAULT NULL,
  `payment_method` enum('cash','card','bank_transfer','check','hmo') NOT NULL DEFAULT 'cash',
  `reference_no` varchar(100) DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `status` enum('draft','pending','paid','cancelled','refunded') NOT NULL DEFAULT 'pending',
  `description` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `transaction_date` datetime DEFAULT NULL,
  `transaction_date_only` date DEFAULT NULL,
  `transaction_time_only` time DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `appointment_id` bigint(20) UNSIGNED NOT NULL,
  `specialist_id` bigint(20) UNSIGNED DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `billing_transactions_transaction_id_unique` (`transaction_id`),
  UNIQUE KEY `unique_transaction_per_patient_doctor_amount_status` (`patient_id`,`doctor_id`,`total_amount`,`status`),
  KEY `billing_transactions_created_by_foreign` (`created_by`),
  KEY `billing_transactions_updated_by_foreign` (`updated_by`),
  KEY `billing_transactions_patient_id_status_index` (`patient_id`,`status`),
  KEY `billing_transactions_doctor_id_status_index` (`doctor_id`,`status`),
  KEY `billing_transactions_transaction_date_status_index` (`transaction_date`,`status`),
  KEY `billing_transactions_payment_method_index` (`payment_method`),
  KEY `billing_transactions_patient_id_transaction_date_index` (`patient_id`,`transaction_date`),
  KEY `billing_transactions_doctor_id_transaction_date_index` (`doctor_id`,`transaction_date`),
  KEY `billing_transactions_payment_method_transaction_date_index` (`payment_method`,`transaction_date`),
  KEY `billing_transactions_hmo_provider_transaction_date_index` (`hmo_provider`,`transaction_date`),
  KEY `billing_transactions_status_transaction_date_index` (`status`,`transaction_date`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `billing_transactions`
--

INSERT INTO `billing_transactions` (`id`, `transaction_code`, `transaction_id`, `patient_id`, `doctor_id`, `payment_type`, `total_amount`, `discount_amount`, `discount_percentage`, `hmo_provider`, `hmo_reference`, `payment_method`, `reference_no`, `payment_reference`, `status`, `description`, `notes`, `transaction_date`, `transaction_date_only`, `transaction_time_only`, `due_date`, `created_by`, `updated_by`, `deleted_at`, `created_at`, `updated_at`, `appointment_id`, `specialist_id`, `amount`) VALUES
(1, NULL, 'TXN-000001', 1, 1, 'cash', 500.00, 0.00, NULL, NULL, NULL, 'cash', NULL, NULL, 'paid', 'Payment for 1 appointment(s)', NULL, '2025-10-18 09:41:34', '2025-10-18', '09:41:34', NULL, 1, 1, NULL, '2025-10-18 01:41:34', '2025-10-18 01:41:41', 1, NULL, 500.00),
(2, NULL, 'TXN-000002', 2, 1, 'cash', 300.00, 0.00, NULL, NULL, NULL, 'cash', NULL, NULL, 'pending', 'Payment for 1 appointment(s)', NULL, '2025-10-18 10:55:29', '2025-10-18', '10:55:29', NULL, 1, NULL, NULL, '2025-10-18 02:55:29', '2025-10-18 02:55:29', 2, NULL, 300.00),
(3, NULL, 'TXN-000003', 3, 1, 'cash', 500.00, 0.00, NULL, NULL, NULL, 'cash', NULL, NULL, 'pending', 'Payment for 1 appointment(s)', NULL, '2025-10-18 10:55:33', '2025-10-18', '10:55:33', NULL, 1, NULL, NULL, '2025-10-18 02:55:33', '2025-10-18 02:55:33', 3, NULL, 500.00);

-- --------------------------------------------------------

--
-- Table structure for table `billing_transaction_items`
--

DROP TABLE IF EXISTS `billing_transaction_items`;
CREATE TABLE IF NOT EXISTS `billing_transaction_items` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `billing_transaction_id` bigint(20) UNSIGNED NOT NULL,
  `item_type` enum('consultation','laboratory','medicine','procedure','other') NOT NULL DEFAULT 'consultation',
  `item_name` varchar(255) NOT NULL,
  `item_description` text DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `lab_test_id` bigint(20) UNSIGNED DEFAULT NULL,
  `service_id` varchar(255) DEFAULT NULL,
  `medicine_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `billing_transaction_items_lab_test_id_foreign` (`lab_test_id`),
  KEY `billing_transaction_items_billing_transaction_id_item_type_index` (`billing_transaction_id`,`item_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('st_james_clinic_cache_5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1760830951),
('st_james_clinic_cache_5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1760830951;', 1760830951);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clinic_procedures`
--

DROP TABLE IF EXISTS `clinic_procedures`;
CREATE TABLE IF NOT EXISTS `clinic_procedures` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `subcategory` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) NOT NULL DEFAULT 30,
  `requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requirements`)),
  `equipment_needed` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`equipment_needed`)),
  `personnel_required` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`personnel_required`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `requires_prescription` tinyint(1) NOT NULL DEFAULT 0,
  `is_emergency` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clinic_procedures_code_unique` (`code`),
  KEY `clinic_procedures_category_is_active_index` (`category`,`is_active`),
  KEY `clinic_procedures_subcategory_index` (`subcategory`),
  KEY `clinic_procedures_subcategory_is_active_index` (`subcategory`,`is_active`),
  KEY `clinic_procedures_is_active_sort_order_index` (`is_active`,`sort_order`),
  KEY `clinic_procedures_is_emergency_is_active_index` (`is_emergency`,`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `daily_transactions`
--

DROP TABLE IF EXISTS `daily_transactions`;
CREATE TABLE IF NOT EXISTS `daily_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `transaction_date` date NOT NULL,
  `transaction_type` enum('billing','doctor_payment','expense','appointment') NOT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `patient_name` varchar(255) DEFAULT NULL,
  `specialist_name` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','bank_transfer','check','hmo') NOT NULL DEFAULT 'cash',
  `status` enum('pending','paid','cancelled','approved','refunded') NOT NULL DEFAULT 'pending',
  `description` text DEFAULT NULL,
  `items_count` int(11) NOT NULL DEFAULT 0,
  `appointments_count` int(11) NOT NULL DEFAULT 0,
  `original_transaction_id` bigint(20) UNSIGNED DEFAULT NULL,
  `original_table` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `daily_transactions_transaction_date_transaction_type_index` (`transaction_date`,`transaction_type`),
  KEY `daily_transactions_transaction_date_status_index` (`transaction_date`,`status`),
  KEY `daily_transactions_original_transaction_id_index` (`original_transaction_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `daily_transactions`
--

INSERT INTO `daily_transactions` (`id`, `transaction_date`, `transaction_type`, `transaction_id`, `patient_name`, `specialist_name`, `amount`, `payment_method`, `status`, `description`, `items_count`, `appointments_count`, `original_transaction_id`, `original_table`, `created_at`, `updated_at`) VALUES
(11, '2025-10-18', 'billing', 'TXN-000001', 'Ronnel Basierto', 'Dr. Maria Santos', 500.00, 'cash', 'paid', 'Payment for 1 appointment(s)', 1, 1, 1, 'billing_transactions', '2025-10-18 20:02:20', '2025-10-18 20:02:20'),
(12, '2025-10-18', 'billing', 'TXN-000002', 'Jehus Cabalejo', 'Dr. Maria Santos', 300.00, 'cash', 'pending', 'Payment for 1 appointment(s)', 1, 1, 2, 'billing_transactions', '2025-10-18 20:02:20', '2025-10-18 20:02:20'),
(13, '2025-10-18', 'billing', 'TXN-000003', 'loyd Loyd', 'Dr. Maria Santos', 500.00, 'cash', 'pending', 'Payment for 1 appointment(s)', 1, 1, 3, 'billing_transactions', '2025-10-18 20:02:20', '2025-10-18 20:02:20');

-- --------------------------------------------------------

--
-- Table structure for table `doctor_payments`
--

DROP TABLE IF EXISTS `doctor_payments`;
CREATE TABLE IF NOT EXISTS `doctor_payments` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `doctor_id` bigint(20) UNSIGNED NOT NULL,
  `basic_salary` decimal(10,2) NOT NULL,
  `deductions` decimal(10,2) NOT NULL DEFAULT 0.00,
  `holiday_pay` decimal(10,2) NOT NULL DEFAULT 0.00,
  `incentives` decimal(10,2) NOT NULL DEFAULT 0.00,
  `net_payment` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
  `paid_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `doctor_payments_created_by_foreign` (`created_by`),
  KEY `doctor_payments_updated_by_foreign` (`updated_by`),
  KEY `doctor_payments_doctor_id_status_index` (`doctor_id`,`status`),
  KEY `doctor_payments_payment_date_status_index` (`payment_date`,`status`),
  KEY `doctor_payments_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctor_payment_billing_links`
--

DROP TABLE IF EXISTS `doctor_payment_billing_links`;
CREATE TABLE IF NOT EXISTS `doctor_payment_billing_links` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `doctor_payment_id` bigint(20) UNSIGNED NOT NULL,
  `billing_transaction_id` bigint(20) UNSIGNED NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dpbl_unique` (`doctor_payment_id`,`billing_transaction_id`),
  KEY `doctor_payment_billing_links_billing_transaction_id_status_index` (`billing_transaction_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctor_summary_reports`
--

DROP TABLE IF EXISTS `doctor_summary_reports`;
CREATE TABLE IF NOT EXISTS `doctor_summary_reports` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `doctor_id` bigint(20) UNSIGNED NOT NULL,
  `payment_id` bigint(20) UNSIGNED NOT NULL,
  `basic_salary` decimal(10,2) NOT NULL,
  `deductions` decimal(10,2) NOT NULL DEFAULT 0.00,
  `holiday_pay` decimal(10,2) NOT NULL DEFAULT 0.00,
  `incentives` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_paid` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'paid',
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `doctor_summary_reports_created_by_foreign` (`created_by`),
  KEY `doctor_summary_reports_doctor_id_payment_date_index` (`doctor_id`,`payment_date`),
  KEY `doctor_summary_reports_payment_id_index` (`payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `financial_overview`
--

DROP TABLE IF EXISTS `financial_overview`;
CREATE TABLE IF NOT EXISTS `financial_overview` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `total_transactions` int(11) NOT NULL DEFAULT 0,
  `total_revenue` decimal(10,2) NOT NULL DEFAULT 0.00,
  `pending_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cash_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `hmo_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `other_payment_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `paid_transactions` int(11) NOT NULL DEFAULT 0,
  `pending_transactions` int(11) NOT NULL DEFAULT 0,
  `cancelled_transactions` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `financial_overview_date_unique` (`date`),
  KEY `financial_overview_date_index` (`date`),
  KEY `financial_overview_date_total_revenue_index` (`date`,`total_revenue`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `financial_overview`
--

INSERT INTO `financial_overview` (`id`, `date`, `total_transactions`, `total_revenue`, `pending_amount`, `cash_total`, `hmo_total`, `other_payment_total`, `paid_transactions`, `pending_transactions`, `cancelled_transactions`, `created_at`, `updated_at`) VALUES
(1, '2025-10-18', 3, 500.00, 800.00, 1300.00, 0.00, 0.00, 1, 2, 0, '2025-10-18 20:40:47', '2025-10-18 20:40:47');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
CREATE TABLE IF NOT EXISTS `inventory_items` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `item_name` varchar(100) NOT NULL,
  `item_code` varchar(50) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `supplier` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `unit` varchar(20) NOT NULL,
  `assigned_to` enum('Doctor & Nurse','Med Tech') NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `low_stock_alert` int(11) NOT NULL DEFAULT 10,
  `consumed` int(11) NOT NULL DEFAULT 0,
  `rejected` int(11) NOT NULL DEFAULT 0,
  `status` enum('In Stock','Low Stock','Out of Stock') NOT NULL DEFAULT 'In Stock',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_items_item_code_unique` (`item_code`),
  KEY `inventory_items_assigned_status_index` (`assigned_to`,`status`),
  KEY `inventory_items_category_index` (`category`),
  KEY `inventory_items_supplier_index` (`supplier`),
  KEY `inventory_items_expiry_index` (`expiry_date`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_items`
--

INSERT INTO `inventory_items` (`id`, `item_name`, `item_code`, `category`, `description`, `supplier`, `location`, `unit_cost`, `expiry_date`, `barcode`, `unit`, `assigned_to`, `stock`, `low_stock_alert`, `consumed`, `rejected`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Alcohol 70%', 'ALCOHOL-001', 'Medical Supplies', NULL, NULL, NULL, NULL, NULL, NULL, 'bottles', 'Med Tech', 2, 2, 6, 0, 'Low Stock', '2025-10-17 18:37:21', '2025-10-18 18:03:31'),
(2, 'Test Item - Out of Stock', 'TEST-001', 'Test', NULL, NULL, NULL, NULL, NULL, NULL, 'pcs', 'Doctor & Nurse', 0, 2, 0, 0, 'Out of Stock', '2025-10-18 18:04:56', '2025-10-18 18:05:46');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_movements`
--

DROP TABLE IF EXISTS `inventory_movements`;
CREATE TABLE IF NOT EXISTS `inventory_movements` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `inventory_id` bigint(20) UNSIGNED NOT NULL,
  `movement_type` enum('IN','OUT') NOT NULL,
  `quantity` int(11) NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_by` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_movements_inventory_id_foreign` (`inventory_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_movements`
--

INSERT INTO `inventory_movements` (`id`, `inventory_id`, `movement_type`, `quantity`, `remarks`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'IN', 5, 'Initial stock', 'Admin User', '2025-10-17 18:37:21', '2025-10-17 18:37:21'),
(2, 1, 'OUT', 3, 'Consumed: No reason provided', 'Admin User', '2025-10-18 15:43:12', '2025-10-18 15:43:12'),
(3, 1, 'IN', 3, NULL, 'Admin', '2025-10-18 16:24:05', '2025-10-18 16:24:05'),
(4, 1, 'OUT', 3, 'Consumed: No reason provided', 'Admin User', '2025-10-18 16:45:39', '2025-10-18 16:45:39');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_reports`
--

DROP TABLE IF EXISTS `inventory_reports`;
CREATE TABLE IF NOT EXISTS `inventory_reports` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_name` varchar(255) NOT NULL,
  `report_type` enum('used_rejected','in_out_supplies','stock_levels','daily_consumption','usage_by_location') NOT NULL,
  `period` enum('daily','weekly','monthly','yearly','custom') NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`filters`)),
  `summary_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`summary_data`)),
  `detailed_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detailed_data`)),
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `exported_at` timestamp NULL DEFAULT NULL,
  `export_format` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_reports_created_by_foreign` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `queue`, `payload`, `attempts`, `reserved_at`, `available_at`, `created_at`) VALUES
(1, 'default', '{\"uuid\":\"3ceb50c2-2f10-412e-b143-2b8c1ea62db9\",\"displayName\":\"App\\\\Events\\\\AppointmentStatusUpdate\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":16:{s:5:\\\"event\\\";O:34:\\\"App\\\\Events\\\\AppointmentStatusUpdate\\\":2:{s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:28;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"userId\\\";i:54;}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1760739437,\"delay\":null}', 0, NULL, 1760739437, 1760739437),
(2, 'default', '{\"uuid\":\"cbc55427-c2f2-4a01-98f3-fb9f3a301831\",\"displayName\":\"App\\\\Events\\\\AppointmentStatusUpdate\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":16:{s:5:\\\"event\\\";O:34:\\\"App\\\\Events\\\\AppointmentStatusUpdate\\\":2:{s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:30;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"userId\\\";i:56;}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1760739767,\"delay\":null}', 0, NULL, 1760739767, 1760739767),
(3, 'default', '{\"uuid\":\"d3e65900-e37c-4d4f-8d8b-95f4a184726b\",\"displayName\":\"App\\\\Events\\\\AppointmentStatusUpdate\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":16:{s:5:\\\"event\\\";O:34:\\\"App\\\\Events\\\\AppointmentStatusUpdate\\\":2:{s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:32;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"userId\\\";i:57;}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1760740161,\"delay\":null}', 0, NULL, 1760740161, 1760740161),
(4, 'default', '{\"uuid\":\"8466443f-dc13-4b8d-abcd-593365d75dcb\",\"displayName\":\"App\\\\Events\\\\AppointmentStatusUpdate\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":16:{s:5:\\\"event\\\";O:34:\\\"App\\\\Events\\\\AppointmentStatusUpdate\\\":2:{s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:34;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"userId\\\";i:58;}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1760740232,\"delay\":null}', 0, NULL, 1760740232, 1760740232),
(5, 'default', '{\"uuid\":\"e2eff025-0510-4039-bcf6-4760e6058bea\",\"displayName\":\"App\\\\Events\\\\AppointmentStatusUpdate\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":16:{s:5:\\\"event\\\";O:34:\\\"App\\\\Events\\\\AppointmentStatusUpdate\\\":2:{s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:36;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"userId\\\";i:59;}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1760740971,\"delay\":null}', 0, NULL, 1760740971, 1760740971),
(6, 'default', '{\"uuid\":\"559a2ede-ccca-4473-9e5d-86fd29ca5271\",\"displayName\":\"App\\\\Events\\\\AppointmentStatusUpdate\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":16:{s:5:\\\"event\\\";O:34:\\\"App\\\\Events\\\\AppointmentStatusUpdate\\\":2:{s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:39;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"userId\\\";i:61;}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1760741670,\"delay\":null}', 0, NULL, 1760741670, 1760741670),
(7, 'default', '{\"uuid\":\"0b302dd6-d016-4d2b-adf6-7929b16ffd33\",\"displayName\":\"App\\\\Events\\\\AppointmentStatusUpdate\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":16:{s:5:\\\"event\\\";O:34:\\\"App\\\\Events\\\\AppointmentStatusUpdate\\\":2:{s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:41;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"userId\\\";i:62;}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1760741848,\"delay\":null}', 0, NULL, 1760741848, 1760741848),
(8, 'default', '{\"uuid\":\"caa28dd6-4071-4e51-8d1f-679133df3fd0\",\"displayName\":\"App\\\\Events\\\\AppointmentStatusUpdate\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":16:{s:5:\\\"event\\\";O:34:\\\"App\\\\Events\\\\AppointmentStatusUpdate\\\":2:{s:12:\\\"notification\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:23:\\\"App\\\\Models\\\\Notification\\\";s:2:\\\"id\\\";i:2;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:6:\\\"userId\\\";i:64;}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1760745765,\"delay\":null}', 0, NULL, 1760745765, 1760745765);

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `laboratory_reports`
--

DROP TABLE IF EXISTS `laboratory_reports`;
CREATE TABLE IF NOT EXISTS `laboratory_reports` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_type` varchar(255) NOT NULL,
  `report_date` date NOT NULL,
  `total_orders` int(11) NOT NULL DEFAULT 0,
  `pending_orders` int(11) NOT NULL DEFAULT 0,
  `completed_orders` int(11) NOT NULL DEFAULT 0,
  `order_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`order_details`)),
  `test_summary` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`test_summary`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `laboratory_reports_report_type_report_date_index` (`report_type`,`report_date`),
  KEY `laboratory_reports_report_date_index` (`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lab_orders`
--

DROP TABLE IF EXISTS `lab_orders`;
CREATE TABLE IF NOT EXISTS `lab_orders` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `patient_visit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ordered_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('ordered','processing','completed','cancelled') NOT NULL DEFAULT 'ordered',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lab_orders_ordered_by_foreign` (`ordered_by`),
  KEY `lab_orders_patient_id_created_at_index` (`patient_id`,`created_at`),
  KEY `lab_orders_status_created_at_index` (`status`,`created_at`),
  KEY `lab_orders_created_at_status_index` (`created_at`,`status`),
  KEY `lab_orders_patient_visit_id_index` (`patient_visit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lab_orders`
--

INSERT INTO `lab_orders` (`id`, `patient_id`, `patient_visit_id`, `ordered_by`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, 'ordered', 'Test lab order with visit connection', '2025-10-18 14:49:58', '2025-10-18 14:49:58'),
(2, 1, 1, NULL, 'ordered', 'Complete laboratory system test order', '2025-10-18 14:58:00', '2025-10-18 14:58:00'),
(3, 3, NULL, 1, 'ordered', NULL, '2025-10-18 15:02:04', '2025-10-18 15:02:04'),
(4, 2, NULL, 1, 'ordered', NULL, '2025-10-18 15:11:55', '2025-10-18 15:11:55');

-- --------------------------------------------------------

--
-- Table structure for table `lab_results`
--

DROP TABLE IF EXISTS `lab_results`;
CREATE TABLE IF NOT EXISTS `lab_results` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `lab_order_id` bigint(20) UNSIGNED NOT NULL,
  `lab_test_id` bigint(20) UNSIGNED NOT NULL,
  `results` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`results`)),
  `verified_by` bigint(20) UNSIGNED DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lab_results_lab_order_id_created_at_index` (`lab_order_id`,`created_at`),
  KEY `lab_results_lab_test_id_created_at_index` (`lab_test_id`,`created_at`),
  KEY `lab_results_verified_by_created_at_index` (`verified_by`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lab_results`
--

INSERT INTO `lab_results` (`id`, `lab_order_id`, `lab_test_id`, `results`, `verified_by`, `verified_at`, `created_at`, `updated_at`) VALUES
(1, 2, 1, '[]', NULL, NULL, '2025-10-18 14:58:00', '2025-10-18 14:58:00'),
(3, 3, 1, '[]', NULL, NULL, '2025-10-18 15:02:04', '2025-10-18 15:02:04'),
(4, 3, 4, '[]', NULL, NULL, '2025-10-18 15:02:04', '2025-10-18 15:02:04'),
(5, 3, 5, '[]', NULL, NULL, '2025-10-18 15:02:04', '2025-10-18 15:02:04'),
(6, 4, 1, '{\"red_blood_cells\":{\"hemoglobin\":\"0.05\",\"hematocrit\":\"0.05\",\"rbc_count\":\"0.04\",\"mcv\":\"0.04\",\"mch\":\"0.04\",\"mchc\":\"0.04\"},\"white_blood_cells\":{\"wbc_count\":\"0.03\",\"neutrophils\":\"0.03\",\"lymphocytes\":\"0.02\",\"monocytes\":\"0.03\",\"eosinophils\":\"0.02\",\"basophils\":\"0.02\"},\"platelets\":{\"platelet_count\":\"0.03\",\"mpv\":\"0.03\"}}', NULL, NULL, '2025-10-18 15:11:55', '2025-10-18 15:14:06'),
(7, 4, 5, '{\"physical_examination\":{\"consistency\":\"Soft\",\"color\":\"Yellow\",\"odor\":\"Pungent\",\"amount\":\"Large\"},\"chemical_examination\":{\"occult_blood\":\"Positive\",\"ph\":\"0.04\",\"fat\":\"1+\",\"reducing_substances\":\"2+\"},\"microscopic_examination\":{\"parasites\":null,\"ova\":\"Few\",\"cysts\":\"Few\",\"bacteria\":\"Increased\",\"yeast\":\"Moderate\",\"undigested_food\":\"Few\"}}', NULL, NULL, '2025-10-18 15:11:55', '2025-10-18 15:14:06'),
(8, 4, 4, '{\"physical_examination\":{\"color\":\"Dark Yellow\",\"clarity\":\"Hazy\",\"specific_gravity\":\"0.07\"},\"chemical_examination\":{\"ph\":\"0.03\",\"protein\":\"2+\",\"glucose\":\"1+\",\"ketones\":\"2+\",\"blood\":\"1+\",\"bilirubin\":\"1+\",\"urobilinogen\":\"Trace\",\"nitrite\":\"Positive\",\"leukocyte_esterase\":\"1+\"},\"microscopic_examination\":{\"rbc\":\"0.08\",\"wbc\":\"0.12\",\"epithelial_cells\":\"Moderate\",\"bacteria\":\"Moderate\",\"casts\":\"RBC\",\"crystals\":\"Triple Phosphate\"}}', NULL, NULL, '2025-10-18 15:11:55', '2025-10-18 15:14:06');

-- --------------------------------------------------------

--
-- Table structure for table `lab_result_values`
--

DROP TABLE IF EXISTS `lab_result_values`;
CREATE TABLE IF NOT EXISTS `lab_result_values` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `lab_result_id` bigint(20) UNSIGNED NOT NULL,
  `parameter_key` varchar(255) NOT NULL,
  `parameter_label` varchar(255) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `reference_text` varchar(255) DEFAULT NULL,
  `reference_min` varchar(255) DEFAULT NULL,
  `reference_max` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lab_result_values_lab_result_id_parameter_key_unique` (`lab_result_id`,`parameter_key`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lab_result_values`
--

INSERT INTO `lab_result_values` (`id`, `lab_result_id`, `parameter_key`, `parameter_label`, `value`, `unit`, `reference_text`, `reference_min`, `reference_max`, `created_at`, `updated_at`) VALUES
(1, 6, 'red_blood_cells.hemoglobin', 'Hemoglobin', '0.05', 'g/dL', NULL, '12', '16', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(2, 6, 'red_blood_cells.hematocrit', 'Hematocrit', '0.05', '%', NULL, '36', '46', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(3, 6, 'red_blood_cells.rbc_count', 'RBC Count', '0.04', 'x10^12/L', NULL, '4', '5.2', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(4, 6, 'red_blood_cells.mcv', 'MCV', '0.04', 'fL', NULL, '80', '100', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(5, 6, 'red_blood_cells.mch', 'MCH', '0.04', 'pg', NULL, '27', '32', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(6, 6, 'red_blood_cells.mchc', 'MCHC', '0.04', 'g/dL', NULL, '32', '36', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(7, 6, 'white_blood_cells.wbc_count', 'WBC Count', '0.03', 'x10^9/L', NULL, '4', '11', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(8, 6, 'white_blood_cells.neutrophils', 'Neutrophils', '0.03', '%', NULL, '40', '74', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(9, 6, 'white_blood_cells.lymphocytes', 'Lymphocytes', '0.02', '%', NULL, '19', '48', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(10, 6, 'white_blood_cells.monocytes', 'Monocytes', '0.03', '%', NULL, '3.4', '9', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(11, 6, 'white_blood_cells.eosinophils', 'Eosinophils', '0.02', '%', NULL, '0', '7', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(12, 6, 'white_blood_cells.basophils', 'Basophils', '0.02', '%', NULL, '0', '1.5', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(13, 6, 'platelets.platelet_count', 'Platelet Count', '0.03', 'x10^9/L', NULL, '150', '450', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(14, 6, 'platelets.mpv', 'MPV', '0.03', 'fL', NULL, '7', '12', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(15, 7, 'physical_examination.consistency', 'Consistency', 'Soft', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(16, 7, 'physical_examination.color', 'Color', 'Yellow', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(17, 7, 'physical_examination.odor', 'Odor', 'Pungent', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(18, 7, 'physical_examination.amount', 'Amount', 'Large', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(19, 7, 'chemical_examination.occult_blood', 'Occult Blood', 'Positive', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(20, 7, 'chemical_examination.ph', 'pH', '0.04', '', NULL, '6', '8', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(21, 7, 'chemical_examination.fat', 'Fat', '1+', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(22, 7, 'chemical_examination.reducing_substances', 'Reducing Substances', '2+', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(23, 7, 'microscopic_examination.parasites', 'Parasites', '', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(24, 7, 'microscopic_examination.ova', 'Ova', 'Few', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(25, 7, 'microscopic_examination.cysts', 'Cysts', 'Few', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(26, 7, 'microscopic_examination.bacteria', 'Bacteria', 'Increased', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(27, 7, 'microscopic_examination.yeast', 'Yeast', 'Moderate', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(28, 7, 'microscopic_examination.undigested_food', 'Undigested Food', 'Few', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(29, 8, 'physical_examination.color', 'Color', 'Dark Yellow', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(30, 8, 'physical_examination.clarity', 'Clarity', 'Hazy', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(31, 8, 'physical_examination.specific_gravity', 'Specific Gravity', '0.07', '', NULL, '1.003', '1.03', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(32, 8, 'chemical_examination.ph', 'pH', '0.03', '', NULL, '4.5', '8', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(33, 8, 'chemical_examination.protein', 'Protein', '2+', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(34, 8, 'chemical_examination.glucose', 'Glucose', '1+', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(35, 8, 'chemical_examination.ketones', 'Ketones', '2+', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(36, 8, 'chemical_examination.blood', 'Blood', '1+', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(37, 8, 'chemical_examination.bilirubin', 'Bilirubin', '1+', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(38, 8, 'chemical_examination.urobilinogen', 'Urobilinogen', 'Trace', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(39, 8, 'chemical_examination.nitrite', 'Nitrite', 'Positive', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(40, 8, 'chemical_examination.leukocyte_esterase', 'Leukocyte Esterase', '1+', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(41, 8, 'microscopic_examination.rbc', 'Red Blood Cells', '0.08', '/hpf', NULL, '0', '3', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(42, 8, 'microscopic_examination.wbc', 'White Blood Cells', '0.12', '/hpf', NULL, '0', '5', '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(43, 8, 'microscopic_examination.epithelial_cells', 'Epithelial Cells', 'Moderate', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(44, 8, 'microscopic_examination.bacteria', 'Bacteria', 'Moderate', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(45, 8, 'microscopic_examination.casts', 'Casts', 'RBC', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06'),
(46, 8, 'microscopic_examination.crystals', 'Crystals', 'Triple Phosphate', NULL, NULL, NULL, NULL, '2025-10-18 15:14:06', '2025-10-18 15:14:06');

-- --------------------------------------------------------

--
-- Table structure for table `lab_tests`
--

DROP TABLE IF EXISTS `lab_tests`;
CREATE TABLE IF NOT EXISTS `lab_tests` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `fields_schema` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fields_schema`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `version` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lab_tests_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lab_tests`
--

INSERT INTO `lab_tests` (`id`, `name`, `code`, `price`, `fields_schema`, `is_active`, `version`, `created_at`, `updated_at`) VALUES
(1, 'Complete Blood Count', 'CBC', 500.00, '{\"sections\":{\"red_blood_cells\":{\"title\":\"Red Blood Cells\",\"fields\":{\"hemoglobin\":{\"label\":\"Hemoglobin\",\"type\":\"number\",\"unit\":\"g\\/dL\",\"range\":[12,16],\"required\":true},\"hematocrit\":{\"label\":\"Hematocrit\",\"type\":\"number\",\"unit\":\"%\",\"range\":[36,46],\"required\":true},\"rbc_count\":{\"label\":\"RBC Count\",\"type\":\"number\",\"unit\":\"x10^12\\/L\",\"range\":[4,5.2],\"required\":true},\"mcv\":{\"label\":\"MCV\",\"type\":\"number\",\"unit\":\"fL\",\"range\":[80,100],\"required\":true},\"mch\":{\"label\":\"MCH\",\"type\":\"number\",\"unit\":\"pg\",\"range\":[27,32],\"required\":true},\"mchc\":{\"label\":\"MCHC\",\"type\":\"number\",\"unit\":\"g\\/dL\",\"range\":[32,36],\"required\":true}}},\"white_blood_cells\":{\"title\":\"White Blood Cells\",\"fields\":{\"wbc_count\":{\"label\":\"WBC Count\",\"type\":\"number\",\"unit\":\"x10^9\\/L\",\"range\":[4,11],\"required\":true},\"neutrophils\":{\"label\":\"Neutrophils\",\"type\":\"number\",\"unit\":\"%\",\"range\":[40,74],\"required\":true},\"lymphocytes\":{\"label\":\"Lymphocytes\",\"type\":\"number\",\"unit\":\"%\",\"range\":[19,48],\"required\":true},\"monocytes\":{\"label\":\"Monocytes\",\"type\":\"number\",\"unit\":\"%\",\"range\":[3.4,9],\"required\":true},\"eosinophils\":{\"label\":\"Eosinophils\",\"type\":\"number\",\"unit\":\"%\",\"range\":[0,7],\"required\":true},\"basophils\":{\"label\":\"Basophils\",\"type\":\"number\",\"unit\":\"%\",\"range\":[0,1.5],\"required\":true}}},\"platelets\":{\"title\":\"Platelets\",\"fields\":{\"platelet_count\":{\"label\":\"Platelet Count\",\"type\":\"number\",\"unit\":\"x10^9\\/L\",\"range\":[150,450],\"required\":true},\"mpv\":{\"label\":\"MPV\",\"type\":\"number\",\"unit\":\"fL\",\"range\":[7,12],\"required\":true}}}}}', 1, 1, '2025-10-18 14:49:55', '2025-10-18 15:09:33'),
(4, 'Urinalysis', 'URINALYSIS', 500.00, '{\"sections\":{\"physical_examination\":{\"title\":\"Physical Examination\",\"fields\":{\"color\":{\"label\":\"Color\",\"type\":\"select\",\"options\":[\"Yellow\",\"Amber\",\"Dark Yellow\",\"Red\",\"Brown\",\"Clear\"],\"required\":true},\"clarity\":{\"label\":\"Clarity\",\"type\":\"select\",\"options\":[\"Clear\",\"Slightly Hazy\",\"Hazy\",\"Cloudy\",\"Turbid\"],\"required\":true},\"specific_gravity\":{\"label\":\"Specific Gravity\",\"type\":\"number\",\"unit\":\"\",\"range\":[1.003,1.03],\"required\":true}}},\"chemical_examination\":{\"title\":\"Chemical Examination\",\"fields\":{\"ph\":{\"label\":\"pH\",\"type\":\"number\",\"unit\":\"\",\"range\":[4.5,8],\"required\":true},\"protein\":{\"label\":\"Protein\",\"type\":\"select\",\"options\":[\"Negative\",\"Trace\",\"1+\",\"2+\",\"3+\",\"4+\"],\"required\":true},\"glucose\":{\"label\":\"Glucose\",\"type\":\"select\",\"options\":[\"Negative\",\"Trace\",\"1+\",\"2+\",\"3+\",\"4+\"],\"required\":true},\"ketones\":{\"label\":\"Ketones\",\"type\":\"select\",\"options\":[\"Negative\",\"Trace\",\"1+\",\"2+\",\"3+\",\"4+\"],\"required\":true},\"blood\":{\"label\":\"Blood\",\"type\":\"select\",\"options\":[\"Negative\",\"Trace\",\"1+\",\"2+\",\"3+\",\"4+\"],\"required\":true},\"bilirubin\":{\"label\":\"Bilirubin\",\"type\":\"select\",\"options\":[\"Negative\",\"Trace\",\"1+\",\"2+\",\"3+\",\"4+\"],\"required\":true},\"urobilinogen\":{\"label\":\"Urobilinogen\",\"type\":\"select\",\"options\":[\"Negative\",\"Trace\",\"1+\",\"2+\",\"3+\",\"4+\"],\"required\":true},\"nitrite\":{\"label\":\"Nitrite\",\"type\":\"select\",\"options\":[\"Negative\",\"Positive\"],\"required\":true},\"leukocyte_esterase\":{\"label\":\"Leukocyte Esterase\",\"type\":\"select\",\"options\":[\"Negative\",\"Trace\",\"1+\",\"2+\",\"3+\",\"4+\"],\"required\":true}}},\"microscopic_examination\":{\"title\":\"Microscopic Examination\",\"fields\":{\"rbc\":{\"label\":\"Red Blood Cells\",\"type\":\"number\",\"unit\":\"\\/hpf\",\"range\":[0,3],\"required\":true},\"wbc\":{\"label\":\"White Blood Cells\",\"type\":\"number\",\"unit\":\"\\/hpf\",\"range\":[0,5],\"required\":true},\"epithelial_cells\":{\"label\":\"Epithelial Cells\",\"type\":\"select\",\"options\":[\"None\",\"Few\",\"Moderate\",\"Many\"],\"required\":true},\"bacteria\":{\"label\":\"Bacteria\",\"type\":\"select\",\"options\":[\"None\",\"Few\",\"Moderate\",\"Many\"],\"required\":true},\"casts\":{\"label\":\"Casts\",\"type\":\"select\",\"options\":[\"None\",\"Hyaline\",\"Granular\",\"Waxy\",\"RBC\",\"WBC\"],\"required\":true},\"crystals\":{\"label\":\"Crystals\",\"type\":\"select\",\"options\":[\"None\",\"Calcium Oxalate\",\"Uric Acid\",\"Triple Phosphate\",\"Amorphous\"],\"required\":true}}}}}', 1, 1, '2025-10-18 14:57:20', '2025-10-18 15:09:33'),
(5, 'Fecalysis', 'FECALYSIS', 500.00, '{\"sections\":{\"physical_examination\":{\"title\":\"Physical Examination\",\"fields\":{\"consistency\":{\"label\":\"Consistency\",\"type\":\"select\",\"options\":[\"Formed\",\"Soft\",\"Loose\",\"Watery\",\"Hard\"],\"required\":true},\"color\":{\"label\":\"Color\",\"type\":\"select\",\"options\":[\"Brown\",\"Yellow\",\"Green\",\"Black\",\"Red\",\"Clay-colored\"],\"required\":true},\"odor\":{\"label\":\"Odor\",\"type\":\"select\",\"options\":[\"Normal\",\"Foul\",\"Pungent\",\"Sweet\"],\"required\":true},\"amount\":{\"label\":\"Amount\",\"type\":\"select\",\"options\":[\"Small\",\"Moderate\",\"Large\"],\"required\":true}}},\"chemical_examination\":{\"title\":\"Chemical Examination\",\"fields\":{\"occult_blood\":{\"label\":\"Occult Blood\",\"type\":\"select\",\"options\":[\"Negative\",\"Positive\"],\"required\":true},\"ph\":{\"label\":\"pH\",\"type\":\"number\",\"unit\":\"\",\"range\":[6,8],\"required\":true},\"fat\":{\"label\":\"Fat\",\"type\":\"select\",\"options\":[\"Negative\",\"Trace\",\"1+\",\"2+\",\"3+\"],\"required\":true},\"reducing_substances\":{\"label\":\"Reducing Substances\",\"type\":\"select\",\"options\":[\"Negative\",\"Trace\",\"1+\",\"2+\",\"3+\"],\"required\":true}}},\"microscopic_examination\":{\"title\":\"Microscopic Examination\",\"fields\":{\"parasites\":{\"label\":\"Parasites\",\"type\":\"select\",\"options\":[\"None\",\"Ascaris lumbricoides\",\"Trichuris trichiura\",\"Hookworm\",\"Entamoeba histolytica\",\"Giardia lamblia\"],\"required\":true},\"ova\":{\"label\":\"Ova\",\"type\":\"select\",\"options\":[\"None\",\"Few\",\"Moderate\",\"Many\"],\"required\":true},\"cysts\":{\"label\":\"Cysts\",\"type\":\"select\",\"options\":[\"None\",\"Few\",\"Moderate\",\"Many\"],\"required\":true},\"bacteria\":{\"label\":\"Bacteria\",\"type\":\"select\",\"options\":[\"Normal\",\"Increased\",\"Decreased\"],\"required\":true},\"yeast\":{\"label\":\"Yeast\",\"type\":\"select\",\"options\":[\"None\",\"Few\",\"Moderate\",\"Many\"],\"required\":true},\"undigested_food\":{\"label\":\"Undigested Food\",\"type\":\"select\",\"options\":[\"None\",\"Few\",\"Moderate\",\"Many\"],\"required\":true}}}}}', 1, 1, '2025-10-18 14:57:20', '2025-10-18 15:09:33');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2024_01_01_000000_create_patients_table', 1),
(5, '2025_01_12_000000_fix_reports_database_conflicts', 1),
(6, '2025_01_12_000001_cleanup_old_data_and_optimize_database', 1),
(7, '2025_01_12_000002_simple_database_cleanup', 1),
(8, '2025_08_30_093240_add_roles', 1),
(9, '2025_09_04_000001_create_lab_tests_table', 1),
(10, '2025_09_04_000002_create_lab_orders_table', 1),
(11, '2025_09_04_000003_create_lab_results_table', 1),
(12, '2025_09_04_162945_add_version_to_lab_tests_table', 1),
(13, '2025_09_05_025017_add_doctor_role_to_users_table', 1),
(14, '2025_09_08_000001_create_lab_result_values_table', 1),
(15, '2025_09_09_001000_update_supply_transactions_subtype_enum', 1),
(16, '2025_09_17_130312_create_permission_tables', 1),
(17, '2025_10_06_092423_create_appointments_table', 1),
(18, '2025_10_06_094427_remove_booking_method_from_appointments_table', 1),
(19, '2025_10_06_102312_remove_unique_constraint_from_appointments_patient_id', 1),
(20, '2025_10_06_123157_create_billing_transactions_table', 1),
(21, '2025_10_06_123202_create_billing_transaction_items_table', 1),
(22, '2025_10_06_123208_create_doctor_payments_table', 1),
(23, '2025_10_06_141051_add_price_to_lab_tests_table', 1),
(24, '2025_10_06_231808_add_price_and_billing_fields_to_appointments_table', 1),
(25, '2025_10_06_231816_create_appointment_billing_links_table', 1),
(26, '2025_10_06_232953_make_patient_id_nullable_in_billing_transactions', 1),
(27, '2025_10_07_031901_update_appointments_billing_status_enum', 1),
(28, '2025_10_07_041334_create_daily_transactions_table', 1),
(29, '2025_10_07_053210_add_separate_date_time_to_billing_transactions_table', 1),
(30, '2025_10_07_071142_create_patient_transfers_table', 1),
(31, '2025_10_07_071529_create_notifications_table', 1),
(32, '2025_10_07_071643_create_clinic_procedures_table', 1),
(33, '2025_10_07_072000_optimize_database_indexes', 1),
(34, '2025_10_07_073523_update_roles_enum_add_hospital_admin', 1),
(35, '2025_10_07_082139_add_user_id_to_patients_table', 1),
(36, '2025_10_17_000002_create_specialists_table', 2),
(37, '2025_10_10_003614_create_inventory_items_table', 3),
(38, '2025_10_10_003616_create_inventory_movements_table', 4),
(39, '2025_10_15_022350_create_supplies_table', 5),
(40, '2025_10_15_022353_create_supply_stock_levels_table', 6),
(41, '2025_10_15_022524_create_supply_transactions_table', 7),
(42, '2025_10_17_194434_fix_appointments_table_foreign_keys', 8),
(43, '2025_10_17_194435_create_pending_appointments_view_fixed', 9),
(44, '2025_10_07_125941_create_pending_appointments_table', 10),
(45, '2025_10_08_013331_create_doctor_payment_billing_links_table', 10),
(46, '2025_10_08_131833_fix_doctor_payments_table_structure', 10),
(47, '2025_10_09_015509_add_appointment_source_to_appointments_and_pending_appointments', 10),
(48, '2025_10_09_032642_add_missing_doctor_fields_to_users_table', 10),
(49, '2025_10_09_061754_create_patient_referrals_table', 10),
(50, '2025_10_09_082324_create_reports_table', 10),
(51, '2025_10_10_124823_add_exported_at_to_reports_table', 10),
(52, '2025_10_12_063958_add_nurse_role_to_users_table', 10),
(53, '2025_10_12_073608_create_laboratory_reports_table', 10),
(54, '2025_10_14_040241_add_missing_fields_to_inventory_items_table', 10),
(55, '2025_10_14_050115_add_additional_fields_to_inventory_items_table', 10),
(56, '2025_10_14_050723_cleanup_unused_inventory_tables', 10),
(57, '2025_10_14_113519_create_inventory_reports_table', 10),
(58, '2025_10_15_022552_create_supply_suppliers_table', 10),
(59, '2025_10_15_101648_drop_visits_tables', 10),
(60, '2025_10_15_103559_create_visits_table', 10),
(61, '2025_10_15_193208_add_sequence_numbers_to_appointments_and_patients', 10),
(62, '2025_10_16_102044_fix_appointment_source_default_value', 10),
(63, '2025_10_16_102207_add_booking_method_to_appointments_table', 10),
(64, '2025_10_16_180108_update_patients_table_add_new_fields', 11),
(65, '2025_10_17_195752_make_patient_code_nullable', 12),
(66, '2025_10_17_200052_make_all_code_fields_nullable_with_defaults', 13),
(67, '2025_10_16_180111_update_appointments_table_new_structure', 14),
(68, '2025_10_18_020155_fix_visits_table_structure', 15),
(69, '2025_10_18_022219_fix_emergency_contact_field_mapping', 16),
(70, '2025_10_16_180112_update_visits_table_new_structure', 17),
(72, '2025_01_21_000000_fix_billing_status_and_foreign_keys', 18),
(73, '2025_01_20_000000_comprehensive_system_fix', 19),
(74, '2025_10_16_180113_update_billing_transactions_table_new_structure', 19),
(75, '2025_10_18_080000_fix_billing_transactions_schema', 20),
(76, '2025_10_18_090000_fix_visit_datetime', 21),
(77, '2025_10_18_100000_fix_visit_datetime_comprehensive', 22),
(78, '2025_10_18_085608_add_present_address_to_patients_table', 23),
(79, '2025_01_27_000000_ensure_present_address_consistency', 24),
(80, '2025_10_18_025714_add_default_value_to_visit_code', 25),
(81, '2025_10_18_224706_add_patient_visit_id_to_lab_orders_table', 25),
(82, '2025_10_19_042516_create_financial_overview_table', 26);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

DROP TABLE IF EXISTS `model_has_permissions`;
CREATE TABLE IF NOT EXISTS `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

DROP TABLE IF EXISTS `model_has_roles`;
CREATE TABLE IF NOT EXISTS `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `related_id` bigint(20) UNSIGNED DEFAULT NULL,
  `related_type` varchar(255) DEFAULT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_read_index` (`user_id`,`read`),
  KEY `notifications_type_index` (`type`),
  KEY `notifications_user_id_read_created_at_index` (`user_id`,`read`,`created_at`),
  KEY `notifications_type_created_at_index` (`type`,`created_at`),
  KEY `notifications_related_type_related_id_index` (`related_type`,`related_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `title`, `message`, `data`, `user_id`, `related_id`, `related_type`, `read`, `read_at`, `created_at`, `updated_at`) VALUES
(1, 'appointment_request', 'New Online Appointment Request', 'Patient Ronnel Basierto has requested an online appointment for cbc on Oct 20, 2025 at 2:00 PM. Please review and approve.', '{\"appointment_id\":1,\"patient_id\":1,\"patient_no\":\"P0001\",\"patient_name\":\"Ronnel Basierto\",\"appointment_type\":\"cbc\",\"appointment_date\":\"2025-10-20\",\"appointment_time\":\"14:00:00\",\"specialist_name\":\"Med Tech Ron\",\"status\":\"Pending Approval\",\"price\":\"500.00\",\"source\":null}', 1, 1, 'App\\Models\\Appointment', 1, '2025-10-18 01:39:48', '2025-10-18 01:39:22', '2025-10-18 01:39:48'),
(2, 'appointment', 'Appointment Approved', 'Your appointment for cbc on 2025-10-20 00:00:00 at 2025-10-18 14:00:00 has been approved and confirmed. Admin notes: Appointment Approved! See you soon.', '{\"appointment_id\":1,\"status\":\"Confirmed\",\"appointment_date\":\"2025-10-20T00:00:00.000000Z\",\"appointment_time\":\"2025-10-18T14:00:00.000000Z\",\"admin_notes\":\"Appointment Approved! See you soon.\"}', 88, 1, 'Appointment', 0, NULL, '2025-10-18 01:40:24', '2025-10-18 01:40:24'),
(3, 'appointment_request', 'New Online Appointment Request', 'Patient Jehus Cabalejo has requested an online appointment for general_consultation on Oct 20, 2025 at 2:30 PM. Please review and approve.', '{\"appointment_id\":2,\"patient_id\":2,\"patient_no\":\"P0002\",\"patient_name\":\"Jehus Cabalejo\",\"appointment_type\":\"general_consultation\",\"appointment_date\":\"2025-10-20\",\"appointment_time\":\"14:30:00\",\"specialist_name\":\"Dr. Juan Dela Cruz\",\"status\":\"Pending Approval\",\"price\":\"300.00\",\"source\":null}', 1, 2, 'App\\Models\\Appointment', 1, '2025-10-18 01:55:03', '2025-10-18 01:54:51', '2025-10-18 01:55:03'),
(4, 'appointment', 'Appointment Approved', 'Your appointment for general_consultation on 2025-10-20 00:00:00 at 2025-10-18 14:30:00 has been approved and confirmed. Admin notes: ORAYT!', '{\"appointment_id\":2,\"status\":\"Confirmed\",\"appointment_date\":\"2025-10-20T00:00:00.000000Z\",\"appointment_time\":\"2025-10-18T14:30:00.000000Z\",\"admin_notes\":\"ORAYT!\"}', 89, 2, 'Appointment', 0, NULL, '2025-10-18 01:55:23', '2025-10-18 01:55:23'),
(5, 'appointment_request', 'New Online Appointment Request', 'Patient loyd Loyd has requested an online appointment for fecalysis_test on Oct 29, 2025 at 2:00 PM. Please review and approve.', '{\"appointment_id\":3,\"patient_id\":3,\"patient_no\":\"P0003\",\"patient_name\":\"loyd Loyd\",\"appointment_type\":\"fecalysis_test\",\"appointment_date\":\"2025-10-29\",\"appointment_time\":\"14:00:00\",\"specialist_name\":\"MedTech Robert Wilson\",\"status\":\"Pending Approval\",\"price\":\"500.00\",\"source\":null}', 1, 3, 'App\\Models\\Appointment', 1, '2025-10-18 02:31:33', '2025-10-18 02:31:13', '2025-10-18 02:31:33'),
(6, 'appointment', 'Appointment Approved', 'Your appointment for fecalysis_test on 2025-10-29 00:00:00 at 2025-10-18 14:00:00 has been approved and confirmed.', '{\"appointment_id\":3,\"status\":\"Confirmed\",\"appointment_date\":\"2025-10-29T00:00:00.000000Z\",\"appointment_time\":\"2025-10-18T14:00:00.000000Z\",\"admin_notes\":null}', 90, 3, 'Appointment', 0, NULL, '2025-10-18 02:31:43', '2025-10-18 02:31:43');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
CREATE TABLE IF NOT EXISTS `patients` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `patient_code` varchar(10) DEFAULT NULL,
  `sequence_number` int(11) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `arrival_date` date NOT NULL,
  `arrival_time` time NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `birthdate` date NOT NULL,
  `age` int(11) NOT NULL,
  `sex` enum('male','female') NOT NULL,
  `patient_no` varchar(255) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `religion` varchar(255) DEFAULT NULL,
  `attending_physician` varchar(255) NOT NULL,
  `civil_status` enum('single','married','widowed','divorced','separated') NOT NULL,
  `present_address` text DEFAULT NULL,
  `nationality` varchar(255) NOT NULL DEFAULT 'Filipino',
  `address` text NOT NULL,
  `telephone_no` varchar(255) DEFAULT NULL,
  `mobile_no` varchar(255) NOT NULL,
  `emergency_name` varchar(100) DEFAULT NULL,
  `emergency_relation` varchar(50) DEFAULT NULL,
  `insurance_company` varchar(100) DEFAULT NULL,
  `hmo_name` varchar(255) DEFAULT NULL,
  `hmo_id_no` varchar(100) DEFAULT NULL,
  `approval_code` varchar(100) DEFAULT NULL,
  `validity` varchar(255) DEFAULT NULL,
  `mode_of_arrival` varchar(255) DEFAULT NULL,
  `drug_allergies` varchar(255) NOT NULL DEFAULT 'NONE',
  `food_allergies` varchar(255) NOT NULL DEFAULT 'NONE',
  `blood_pressure` varchar(255) DEFAULT NULL,
  `heart_rate` varchar(255) DEFAULT NULL,
  `respiratory_rate` varchar(255) DEFAULT NULL,
  `temperature` varchar(255) DEFAULT NULL,
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `height_cm` decimal(5,2) DEFAULT NULL,
  `pain_assessment_scale` varchar(255) DEFAULT NULL,
  `oxygen_saturation` varchar(255) DEFAULT NULL,
  `reason_for_consult` text DEFAULT NULL,
  `time_seen` time NOT NULL,
  `history_of_present_illness` text DEFAULT NULL,
  `pertinent_physical_findings` text DEFAULT NULL,
  `plan_management` text DEFAULT NULL,
  `past_medical_history` text DEFAULT NULL,
  `family_history` text DEFAULT NULL,
  `social_history` text DEFAULT NULL,
  `obgyn_history` text DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `lmp` varchar(255) DEFAULT NULL,
  `assessment_diagnosis` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patients_patient_no_unique` (`patient_no`),
  KEY `patients_created_at_index` (`created_at`),
  KEY `patients_sex_age_index` (`sex`,`age`),
  KEY `patients_patient_no_index` (`patient_no`),
  KEY `patients_created_at_sex_index` (`created_at`,`sex`),
  KEY `patients_first_name_last_name_index` (`first_name`,`last_name`),
  KEY `patients_user_id_index` (`user_id`),
  KEY `patients_sequence_number_index` (`sequence_number`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `patient_code`, `sequence_number`, `user_id`, `arrival_date`, `arrival_time`, `last_name`, `first_name`, `middle_name`, `birthdate`, `age`, `sex`, `patient_no`, `occupation`, `religion`, `attending_physician`, `civil_status`, `present_address`, `nationality`, `address`, `telephone_no`, `mobile_no`, `emergency_name`, `emergency_relation`, `insurance_company`, `hmo_name`, `hmo_id_no`, `approval_code`, `validity`, `mode_of_arrival`, `drug_allergies`, `food_allergies`, `blood_pressure`, `heart_rate`, `respiratory_rate`, `temperature`, `weight_kg`, `height_cm`, `pain_assessment_scale`, `oxygen_saturation`, `reason_for_consult`, `time_seen`, `history_of_present_illness`, `pertinent_physical_findings`, `plan_management`, `past_medical_history`, `family_history`, `social_history`, `obgyn_history`, `status`, `lmp`, `assessment_diagnosis`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, NULL, NULL, 88, '2025-10-18', '09:39:22', 'Basierto', 'Ronnel', 'Estinopo', '0003-12-19', 2021, 'male', 'P0001', NULL, NULL, 'To be assigned', 'single', 'OMV2 San Isirdro City of Cabuyao Laguna', 'Filipino', 'OMV2 San Isirdro City of Cabuyao Laguna', '6429762', '09494449144', 'Gil Basierto', 'Father', NULL, NULL, NULL, NULL, NULL, NULL, 'NONE', 'NONE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '09:39:22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, '2025-10-18 01:39:22', '2025-10-18 01:39:22', NULL),
(2, NULL, NULL, 89, '2025-10-18', '09:54:51', 'Cabalejo', 'Jehus', 'N.', '2004-01-12', 21, 'male', 'P0002', NULL, NULL, 'To be assigned', 'single', 'San Isidro', 'Filipino', 'San Isidro', '3123214', '0943255466', 'Jehus', 'Self', NULL, NULL, NULL, NULL, NULL, NULL, 'NONE', 'NONE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '09:54:51', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, '2025-10-18 01:54:51', '2025-10-18 01:54:51', NULL),
(3, NULL, NULL, 90, '2025-10-18', '10:31:13', 'Loyd', 'loyd', 'L', '2004-12-19', 20, 'male', 'P0003', NULL, NULL, 'To be assigned', 'single', 'Mamatid', 'Filipino', 'Mamatid', '0932132', '09123456789', 'Me', 'self', NULL, NULL, NULL, NULL, NULL, NULL, 'NONE', 'NONE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '10:31:13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, '2025-10-18 02:31:13', '2025-10-18 02:31:13', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `patient_referrals`
--

DROP TABLE IF EXISTS `patient_referrals`;
CREATE TABLE IF NOT EXISTS `patient_referrals` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `referral_reason` varchar(255) NOT NULL,
  `priority` enum('low','medium','high','urgent') NOT NULL,
  `specialist_type` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
  `referred_by` bigint(20) UNSIGNED NOT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_referrals_patient_id_foreign` (`patient_id`),
  KEY `patient_referrals_referred_by_foreign` (`referred_by`),
  KEY `patient_referrals_approved_by_foreign` (`approved_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patient_transfers`
--

DROP TABLE IF EXISTS `patient_transfers`;
CREATE TABLE IF NOT EXISTS `patient_transfers` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `from_hospital` tinyint(1) NOT NULL DEFAULT 0,
  `to_clinic` tinyint(1) NOT NULL DEFAULT 0,
  `transfer_reason` text NOT NULL,
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `notes` text DEFAULT NULL,
  `status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
  `transferred_by` bigint(20) UNSIGNED NOT NULL,
  `accepted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `transfer_date` datetime DEFAULT NULL,
  `completion_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_transfers_accepted_by_foreign` (`accepted_by`),
  KEY `patient_transfers_status_priority_index` (`status`,`priority`),
  KEY `patient_transfers_transfer_date_index` (`transfer_date`),
  KEY `patient_transfers_patient_id_status_index` (`patient_id`,`status`),
  KEY `patient_transfers_transferred_by_created_at_index` (`transferred_by`,`created_at`),
  KEY `patient_transfers_created_at_status_index` (`created_at`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pending_appointments`
--

DROP TABLE IF EXISTS `pending_appointments`;
CREATE TABLE IF NOT EXISTS `pending_appointments` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `patient_name` varchar(255) NOT NULL,
  `patient_id` varchar(255) NOT NULL,
  `contact_number` varchar(255) NOT NULL,
  `appointment_type` varchar(255) NOT NULL,
  `specialist_type` varchar(255) NOT NULL,
  `specialist_name` varchar(255) NOT NULL,
  `specialist_id` varchar(255) NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `duration` varchar(255) NOT NULL DEFAULT '30 min',
  `status` varchar(255) NOT NULL DEFAULT 'Pending Approval',
  `appointment_source` enum('online','walk_in') NOT NULL DEFAULT 'online',
  `billing_status` varchar(255) NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `special_requirements` text DEFAULT NULL,
  `booking_method` varchar(255) NOT NULL DEFAULT 'Online',
  `price` decimal(10,2) DEFAULT NULL,
  `status_approval` varchar(255) NOT NULL DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `source` varchar(255) NOT NULL DEFAULT 'Online',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pending_appointments`
--

INSERT INTO `pending_appointments` (`id`, `patient_name`, `patient_id`, `contact_number`, `appointment_type`, `specialist_type`, `specialist_name`, `specialist_id`, `appointment_date`, `appointment_time`, `duration`, `status`, `appointment_source`, `billing_status`, `notes`, `special_requirements`, `booking_method`, `price`, `status_approval`, `admin_notes`, `approved_by`, `approved_at`, `created_at`, `updated_at`, `source`) VALUES
(1, 'Ronnel Basierto', '1', '09494449144', 'cbc', 'medtech', 'Med Tech Ron', '8', '2025-10-20', '14:00:00', '30 min', 'Pending Approval', 'online', 'pending', NULL, NULL, 'Online', 500.00, 'approved', 'Appointment Approved! See you soon.', 1, '2025-10-18 01:40:24', '2025-10-18 01:39:22', '2025-10-18 01:40:24', 'Online'),
(2, 'Jehus Cabalejo', '2', '0943255466', 'general_consultation', 'doctor', 'Dr. Juan Dela Cruz', '2', '2025-10-20', '14:30:00', '30 min', 'Pending Approval', 'online', 'pending', NULL, NULL, 'Online', 300.00, 'approved', 'ORAYT!', 1, '2025-10-18 01:55:23', '2025-10-18 01:54:51', '2025-10-18 01:55:23', 'Online'),
(3, 'loyd Loyd', '3', '09123456789', 'fecalysis_test', 'medtech', 'MedTech Robert Wilson', '7', '2025-10-29', '14:00:00', '30 min', 'Pending Approval', 'online', 'pending', NULL, NULL, 'Online', 500.00, 'approved', NULL, 1, '2025-10-18 02:31:43', '2025-10-18 02:31:13', '2025-10-18 02:31:43', 'Online');

-- --------------------------------------------------------

--
-- Stand-in structure for view `pending_appointments_view`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `pending_appointments_view`;
CREATE TABLE IF NOT EXISTS `pending_appointments_view` (
`appointment_id` bigint(20) unsigned
,`patient_name` varchar(255)
,`patient_id` bigint(20) unsigned
,`contact_number` varchar(255)
,`appointment_type` varchar(255)
,`price` decimal(10,2)
,`specialist_type` varchar(255)
,`specialist_name` varchar(255)
,`specialist_id` bigint(20) unsigned
,`appointment_date` date
,`appointment_time` time
,`duration` varchar(255)
,`status` enum('Pending','Confirmed','Completed','Cancelled')
,`billing_status` enum('pending','in_transaction','paid','cancelled')
,`billing_reference` varchar(255)
,`confirmation_sent` tinyint(1)
,`notes` text
,`special_requirements` text
,`source` enum('Online','Walk-in')
,`created_at` timestamp
,`updated_at` timestamp
,`patient_no` varchar(255)
,`first_name` varchar(255)
,`last_name` varchar(255)
,`mobile_no` varchar(255)
,`full_patient_name` varchar(511)
);

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
CREATE TABLE IF NOT EXISTS `reports` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_type` varchar(255) NOT NULL,
  `report_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`filters`)),
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `period` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `exported_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reports_created_by_foreign` (`created_by`),
  KEY `reports_updated_by_foreign` (`updated_by`),
  KEY `reports_report_type_period_start_date_end_date_index` (`report_type`,`period`,`start_date`,`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

DROP TABLE IF EXISTS `role_has_permissions`;
CREATE TABLE IF NOT EXISTS `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `role_has_permissions_role_id_foreign` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('adoPwqqBnru6tbrezIdXwDlTzjv2WH2qxQ9BzMlY', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjY6Il90b2tlbiI7czo0MDoiUDA0WGxXV3lvOEVjaFRsZVZZVG1QV1Q0R0JpMkIxT0x4VkJuSDlpYSI7czo0OiJhdXRoIjthOjI6e3M6NDoidXNlciI7TzoxNToiQXBwXE1vZGVsc1xVc2VyIjozNTp7czoxMzoiACoAY29ubmVjdGlvbiI7czo1OiJteXNxbCI7czo4OiIAKgB0YWJsZSI7czo1OiJ1c2VycyI7czoxMzoiACoAcHJpbWFyeUtleSI7czoyOiJpZCI7czoxMDoiACoAa2V5VHlwZSI7czozOiJpbnQiO3M6MTI6ImluY3JlbWVudGluZyI7YjoxO3M6NzoiACoAd2l0aCI7YTowOnt9czoxMjoiACoAd2l0aENvdW50IjthOjA6e31zOjE5OiJwcmV2ZW50c0xhenlMb2FkaW5nIjtiOjA7czoxMDoiACoAcGVyUGFnZSI7aToxNTtzOjY6ImV4aXN0cyI7YjoxO3M6MTg6Indhc1JlY2VudGx5Q3JlYXRlZCI7YjowO3M6Mjg6IgAqAGVzY2FwZVdoZW5DYXN0aW5nVG9TdHJpbmciO2I6MDtzOjEzOiIAKgBhdHRyaWJ1dGVzIjthOjE3OntzOjI6ImlkIjtpOjE7czo0OiJuYW1lIjtzOjEwOiJBZG1pbiBVc2VyIjtzOjU6ImVtYWlsIjtzOjE2OiJhZG1pbkBjbGluaWMuY29tIjtzOjE3OiJlbWFpbF92ZXJpZmllZF9hdCI7TjtzOjg6InBhc3N3b3JkIjtzOjYwOiIkMnkkMTIkL245aEovTU05Nlg1bVdBL3VLLzBmdURtVHlTVWRKaXhVdldCTnFSd1p3VWFHNlhMQ2ExRzIiO3M6MTQ6InJlbWVtYmVyX3Rva2VuIjtOO3M6MTA6ImNyZWF0ZWRfYXQiO3M6MTk6IjIwMjUtMTAtMTcgMDk6MjQ6MDkiO3M6MTA6InVwZGF0ZWRfYXQiO3M6MTk6IjIwMjUtMTAtMTcgMDk6MjQ6MDkiO3M6NDoicm9sZSI7czo1OiJhZG1pbiI7czoxNDoic3BlY2lhbGl6YXRpb24iO047czoxNDoibGljZW5zZV9udW1iZXIiO047czo5OiJpc19hY3RpdmUiO2k6MTtzOjExOiJlbXBsb3llZV9pZCI7TjtzOjEyOiJhdmFpbGFiaWxpdHkiO047czo2OiJyYXRpbmciO3M6NDoiMC4wMCI7czoxMDoiZXhwZXJpZW5jZSI7TjtzOjEzOiJuZXh0QXZhaWxhYmxlIjtOO31zOjExOiIAKgBvcmlnaW5hbCI7YToxNzp7czoyOiJpZCI7aToxO3M6NDoibmFtZSI7czoxMDoiQWRtaW4gVXNlciI7czo1OiJlbWFpbCI7czoxNjoiYWRtaW5AY2xpbmljLmNvbSI7czoxNzoiZW1haWxfdmVyaWZpZWRfYXQiO047czo4OiJwYXNzd29yZCI7czo2MDoiJDJ5JDEyJC9uOWhKL01NOTZYNW1XQS91Sy8wZnVEbVR5U1VkSml4VXZXQk5xUndad1VhRzZYTENhMUcyIjtzOjE0OiJyZW1lbWJlcl90b2tlbiI7TjtzOjEwOiJjcmVhdGVkX2F0IjtzOjE5OiIyMDI1LTEwLTE3IDA5OjI0OjA5IjtzOjEwOiJ1cGRhdGVkX2F0IjtzOjE5OiIyMDI1LTEwLTE3IDA5OjI0OjA5IjtzOjQ6InJvbGUiO3M6NToiYWRtaW4iO3M6MTQ6InNwZWNpYWxpemF0aW9uIjtOO3M6MTQ6ImxpY2Vuc2VfbnVtYmVyIjtOO3M6OToiaXNfYWN0aXZlIjtpOjE7czoxMToiZW1wbG95ZWVfaWQiO047czoxMjoiYXZhaWxhYmlsaXR5IjtOO3M6NjoicmF0aW5nIjtzOjQ6IjAuMDAiO3M6MTA6ImV4cGVyaWVuY2UiO047czoxMzoibmV4dEF2YWlsYWJsZSI7Tjt9czoxMDoiACoAY2hhbmdlcyI7YTowOnt9czoxMToiACoAcHJldmlvdXMiO2E6MDp7fXM6ODoiACoAY2FzdHMiO2E6Mzp7czoxNzoiZW1haWxfdmVyaWZpZWRfYXQiO3M6ODoiZGF0ZXRpbWUiO3M6ODoicGFzc3dvcmQiO3M6NjoiaGFzaGVkIjtzOjk6ImlzX2FjdGl2ZSI7czo3OiJib29sZWFuIjt9czoxNzoiACoAY2xhc3NDYXN0Q2FjaGUiO2E6MDp7fXM6MjE6IgAqAGF0dHJpYnV0ZUNhc3RDYWNoZSI7YTowOnt9czoxMzoiACoAZGF0ZUZvcm1hdCI7TjtzOjEwOiIAKgBhcHBlbmRzIjthOjA6e31zOjE5OiIAKgBkaXNwYXRjaGVzRXZlbnRzIjthOjA6e31zOjE0OiIAKgBvYnNlcnZhYmxlcyI7YTowOnt9czoxMjoiACoAcmVsYXRpb25zIjthOjA6e31zOjEwOiIAKgB0b3VjaGVzIjthOjA6e31zOjI3OiIAKgByZWxhdGlvbkF1dG9sb2FkQ2FsbGJhY2siO047czoyNjoiACoAcmVsYXRpb25BdXRvbG9hZENvbnRleHQiO047czoxMDoidGltZXN0YW1wcyI7YjoxO3M6MTM6InVzZXNVbmlxdWVJZHMiO2I6MDtzOjk6IgAqAGhpZGRlbiI7YToyOntpOjA7czo4OiJwYXNzd29yZCI7aToxO3M6MTQ6InJlbWVtYmVyX3Rva2VuIjt9czoxMDoiACoAdmlzaWJsZSI7YTowOnt9czoxMToiACoAZmlsbGFibGUiO2E6ODp7aTowO3M6NDoibmFtZSI7aToxO3M6NToiZW1haWwiO2k6MjtzOjg6InBhc3N3b3JkIjtpOjM7czo0OiJyb2xlIjtpOjQ7czo5OiJpc19hY3RpdmUiO2k6NTtzOjExOiJlbXBsb3llZV9pZCI7aTo2O3M6MTQ6InNwZWNpYWxpemF0aW9uIjtpOjc7czoxNDoibGljZW5zZV9udW1iZXIiO31zOjEwOiIAKgBndWFyZGVkIjthOjE6e2k6MDtzOjE6IioiO31zOjE5OiIAKgBhdXRoUGFzc3dvcmROYW1lIjtzOjg6InBhc3N3b3JkIjtzOjIwOiIAKgByZW1lbWJlclRva2VuTmFtZSI7czoxNDoicmVtZW1iZXJfdG9rZW4iO31zOjU6ImxvZ2luIjtiOjE7fXM6OToiX3ByZXZpb3VzIjthOjE6e3M6MzoidXJsIjtzOjUwOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvYWRtaW4vcmVhbHRpbWUvbm90aWZpY2F0aW9ucyI7fX0=', 1760832008),
('IrrEV8eW9T375kPihAqe8OVhNOTpZ8sjmOhNys18', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'YToyOntzOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjY6Il90b2tlbiI7czo0MDoicEwySjVhSTBVVGdFczM3TkhFVTN5cjlqYVBFNjNvY3dQdmEyN2U4SSI7fQ==', 1760830785),
('MV4tqc9D3TKuCLGXvPPBQDiLu4G8B0HUJaoFoc0C', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoibnQ5aFlXdUNvUmVyMk05S2tFU2xBRXpzZDFHMzhVcElIVXQwYVlBNCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NTA6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hZG1pbi9yZWFsdGltZS9ub3RpZmljYXRpb25zIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo0OiJhdXRoIjthOjI6e3M6NDoidXNlciI7TzoxNToiQXBwXE1vZGVsc1xVc2VyIjozNTp7czoxMzoiACoAY29ubmVjdGlvbiI7czo1OiJteXNxbCI7czo4OiIAKgB0YWJsZSI7czo1OiJ1c2VycyI7czoxMzoiACoAcHJpbWFyeUtleSI7czoyOiJpZCI7czoxMDoiACoAa2V5VHlwZSI7czozOiJpbnQiO3M6MTI6ImluY3JlbWVudGluZyI7YjoxO3M6NzoiACoAd2l0aCI7YTowOnt9czoxMjoiACoAd2l0aENvdW50IjthOjA6e31zOjE5OiJwcmV2ZW50c0xhenlMb2FkaW5nIjtiOjA7czoxMDoiACoAcGVyUGFnZSI7aToxNTtzOjY6ImV4aXN0cyI7YjoxO3M6MTg6Indhc1JlY2VudGx5Q3JlYXRlZCI7YjowO3M6Mjg6IgAqAGVzY2FwZVdoZW5DYXN0aW5nVG9TdHJpbmciO2I6MDtzOjEzOiIAKgBhdHRyaWJ1dGVzIjthOjE3OntzOjI6ImlkIjtpOjE7czo0OiJuYW1lIjtzOjEwOiJBZG1pbiBVc2VyIjtzOjU6ImVtYWlsIjtzOjE2OiJhZG1pbkBjbGluaWMuY29tIjtzOjE3OiJlbWFpbF92ZXJpZmllZF9hdCI7TjtzOjg6InBhc3N3b3JkIjtzOjYwOiIkMnkkMTIkL245aEovTU05Nlg1bVdBL3VLLzBmdURtVHlTVWRKaXhVdldCTnFSd1p3VWFHNlhMQ2ExRzIiO3M6MTQ6InJlbWVtYmVyX3Rva2VuIjtOO3M6MTA6ImNyZWF0ZWRfYXQiO3M6MTk6IjIwMjUtMTAtMTcgMDk6MjQ6MDkiO3M6MTA6InVwZGF0ZWRfYXQiO3M6MTk6IjIwMjUtMTAtMTcgMDk6MjQ6MDkiO3M6NDoicm9sZSI7czo1OiJhZG1pbiI7czoxNDoic3BlY2lhbGl6YXRpb24iO047czoxNDoibGljZW5zZV9udW1iZXIiO047czo5OiJpc19hY3RpdmUiO2k6MTtzOjExOiJlbXBsb3llZV9pZCI7TjtzOjEyOiJhdmFpbGFiaWxpdHkiO047czo2OiJyYXRpbmciO3M6NDoiMC4wMCI7czoxMDoiZXhwZXJpZW5jZSI7TjtzOjEzOiJuZXh0QXZhaWxhYmxlIjtOO31zOjExOiIAKgBvcmlnaW5hbCI7YToxNzp7czoyOiJpZCI7aToxO3M6NDoibmFtZSI7czoxMDoiQWRtaW4gVXNlciI7czo1OiJlbWFpbCI7czoxNjoiYWRtaW5AY2xpbmljLmNvbSI7czoxNzoiZW1haWxfdmVyaWZpZWRfYXQiO047czo4OiJwYXNzd29yZCI7czo2MDoiJDJ5JDEyJC9uOWhKL01NOTZYNW1XQS91Sy8wZnVEbVR5U1VkSml4VXZXQk5xUndad1VhRzZYTENhMUcyIjtzOjE0OiJyZW1lbWJlcl90b2tlbiI7TjtzOjEwOiJjcmVhdGVkX2F0IjtzOjE5OiIyMDI1LTEwLTE3IDA5OjI0OjA5IjtzOjEwOiJ1cGRhdGVkX2F0IjtzOjE5OiIyMDI1LTEwLTE3IDA5OjI0OjA5IjtzOjQ6InJvbGUiO3M6NToiYWRtaW4iO3M6MTQ6InNwZWNpYWxpemF0aW9uIjtOO3M6MTQ6ImxpY2Vuc2VfbnVtYmVyIjtOO3M6OToiaXNfYWN0aXZlIjtpOjE7czoxMToiZW1wbG95ZWVfaWQiO047czoxMjoiYXZhaWxhYmlsaXR5IjtOO3M6NjoicmF0aW5nIjtzOjQ6IjAuMDAiO3M6MTA6ImV4cGVyaWVuY2UiO047czoxMzoibmV4dEF2YWlsYWJsZSI7Tjt9czoxMDoiACoAY2hhbmdlcyI7YTowOnt9czoxMToiACoAcHJldmlvdXMiO2E6MDp7fXM6ODoiACoAY2FzdHMiO2E6Mzp7czoxNzoiZW1haWxfdmVyaWZpZWRfYXQiO3M6ODoiZGF0ZXRpbWUiO3M6ODoicGFzc3dvcmQiO3M6NjoiaGFzaGVkIjtzOjk6ImlzX2FjdGl2ZSI7czo3OiJib29sZWFuIjt9czoxNzoiACoAY2xhc3NDYXN0Q2FjaGUiO2E6MDp7fXM6MjE6IgAqAGF0dHJpYnV0ZUNhc3RDYWNoZSI7YTowOnt9czoxMzoiACoAZGF0ZUZvcm1hdCI7TjtzOjEwOiIAKgBhcHBlbmRzIjthOjA6e31zOjE5OiIAKgBkaXNwYXRjaGVzRXZlbnRzIjthOjA6e31zOjE0OiIAKgBvYnNlcnZhYmxlcyI7YTowOnt9czoxMjoiACoAcmVsYXRpb25zIjthOjA6e31zOjEwOiIAKgB0b3VjaGVzIjthOjA6e31zOjI3OiIAKgByZWxhdGlvbkF1dG9sb2FkQ2FsbGJhY2siO047czoyNjoiACoAcmVsYXRpb25BdXRvbG9hZENvbnRleHQiO047czoxMDoidGltZXN0YW1wcyI7YjoxO3M6MTM6InVzZXNVbmlxdWVJZHMiO2I6MDtzOjk6IgAqAGhpZGRlbiI7YToyOntpOjA7czo4OiJwYXNzd29yZCI7aToxO3M6MTQ6InJlbWVtYmVyX3Rva2VuIjt9czoxMDoiACoAdmlzaWJsZSI7YTowOnt9czoxMToiACoAZmlsbGFibGUiO2E6ODp7aTowO3M6NDoibmFtZSI7aToxO3M6NToiZW1haWwiO2k6MjtzOjg6InBhc3N3b3JkIjtpOjM7czo0OiJyb2xlIjtpOjQ7czo5OiJpc19hY3RpdmUiO2k6NTtzOjExOiJlbXBsb3llZV9pZCI7aTo2O3M6MTQ6InNwZWNpYWxpemF0aW9uIjtpOjc7czoxNDoibGljZW5zZV9udW1iZXIiO31zOjEwOiIAKgBndWFyZGVkIjthOjE6e2k6MDtzOjE6IioiO31zOjE5OiIAKgBhdXRoUGFzc3dvcmROYW1lIjtzOjg6InBhc3N3b3JkIjtzOjIwOiIAKgByZW1lbWJlclRva2VuTmFtZSI7czoxNDoicmVtZW1iZXJfdG9rZW4iO31zOjU6ImxvZ2luIjtiOjE7fX0=', 1760827173);

-- --------------------------------------------------------

--
-- Table structure for table `specialists`
--

DROP TABLE IF EXISTS `specialists`;
CREATE TABLE IF NOT EXISTS `specialists` (
  `specialist_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `specialist_code` varchar(10) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('Doctor','Nurse','MedTech','Admin') NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `contact` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`specialist_id`),
  UNIQUE KEY `specialists_specialist_code_unique` (`specialist_code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `specialists`
--

INSERT INTO `specialists` (`specialist_id`, `specialist_code`, `name`, `role`, `specialization`, `contact`, `email`, `status`, `created_at`, `updated_at`) VALUES
(1, 'DOC001', 'Dr. Maria Santos', 'Doctor', 'General Medicine', '+63 912 345 6789', 'maria.santos@clinic.com', 'Active', '2025-10-17 01:03:05', '2025-10-17 01:03:05'),
(2, 'DOC002', 'Dr. Juan Dela Cruz', 'Doctor', 'Internal Medicine', '+63 912 345 6790', 'juan.delacruz@clinic.com', 'Active', '2025-10-17 01:03:05', '2025-10-17 01:03:05'),
(3, 'DOC003', 'Dr. Ana Rodriguez', 'Doctor', 'Pediatrics', '+63 912 345 6791', 'ana.rodriguez@clinic.com', 'Active', '2025-10-17 01:03:05', '2025-10-17 01:03:05'),
(4, 'NUR001', 'Nurse Sarah Johnson', 'Nurse', 'General Nursing', '+63 912 345 6792', 'sarah.johnson@clinic.com', 'Active', '2025-10-17 01:03:05', '2025-10-17 01:03:05'),
(5, 'NUR002', 'Nurse Michael Brown', 'Nurse', 'Emergency Nursing', '+63 912 345 6793', 'michael.brown@clinic.com', 'Active', '2025-10-17 01:03:05', '2025-10-17 01:03:05'),
(6, 'MT001', 'MedTech Lisa Garcia', 'MedTech', 'Laboratory Technology', '+63 912 345 6794', 'lisa.garcia@clinic.com', 'Active', '2025-10-17 01:03:05', '2025-10-17 01:03:05'),
(7, 'MT002', 'MedTech Robert Wilson', 'MedTech', 'Radiology Technology', '+63 912 345 6795', 'robert.wilson@clinic.com', 'Active', '2025-10-17 01:03:05', '2025-10-17 01:03:05'),
(8, 'MED003', 'Med Tech Ron', 'MedTech', NULL, NULL, 'Ron@medtech.com', 'Active', '2025-10-17 15:37:32', '2025-10-17 15:37:32'),
(9, 'TD001', 'Test Doctor', 'Doctor', 'General Medicine', NULL, NULL, 'Active', '2025-10-17 20:37:40', '2025-10-17 20:37:40');

-- --------------------------------------------------------

--
-- Stand-in structure for view `staff`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `staff`;
CREATE TABLE IF NOT EXISTS `staff` (
`staff_id` bigint(20) unsigned
,`id` bigint(20) unsigned
,`staff_code` varchar(10)
,`name` varchar(255)
,`role` enum('Doctor','Nurse','MedTech','Admin')
,`specialization` varchar(100)
,`contact` varchar(20)
,`email` varchar(150)
,`status` enum('Active','Inactive')
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Table structure for table `supplies`
--

DROP TABLE IF EXISTS `supplies`;
CREATE TABLE IF NOT EXISTS `supplies` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `unit_of_measure` varchar(255) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `minimum_stock_level` int(11) NOT NULL DEFAULT 0,
  `maximum_stock_level` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `requires_lot_tracking` tinyint(1) NOT NULL DEFAULT 0,
  `requires_expiry_tracking` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `supplies_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supply_stock_levels`
--

DROP TABLE IF EXISTS `supply_stock_levels`;
CREATE TABLE IF NOT EXISTS `supply_stock_levels` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `lot_number` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `current_stock` int(11) NOT NULL DEFAULT 0,
  `reserved_stock` int(11) NOT NULL DEFAULT 0,
  `available_stock` int(11) NOT NULL DEFAULT 0,
  `average_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_expired` tinyint(1) NOT NULL DEFAULT 0,
  `is_near_expiry` tinyint(1) NOT NULL DEFAULT 0,
  `last_updated` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `supply_stock_levels_product_id_foreign` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supply_suppliers`
--

DROP TABLE IF EXISTS `supply_suppliers`;
CREATE TABLE IF NOT EXISTS `supply_suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supply_transactions`
--

DROP TABLE IF EXISTS `supply_transactions`;
CREATE TABLE IF NOT EXISTS `supply_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `charged_to` bigint(20) UNSIGNED DEFAULT NULL,
  `type` enum('in','out') NOT NULL,
  `subtype` enum('purchase','return','adjustment','consumed','used','rejected','expired','damaged') NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `lot_number` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `date_opened` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `transaction_time` datetime NOT NULL,
  `remaining_quantity` int(11) NOT NULL DEFAULT 0,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `usage_location` varchar(255) DEFAULT NULL,
  `usage_purpose` text DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `supply_transactions_product_id_foreign` (`product_id`),
  KEY `supply_transactions_user_id_foreign` (`user_id`),
  KEY `supply_transactions_approved_by_foreign` (`approved_by`),
  KEY `supply_transactions_charged_to_foreign` (`charged_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `role` enum('patient','laboratory_technologist','medtech','cashier','doctor','admin','hospital_admin','nurse') DEFAULT 'patient',
  `specialization` varchar(255) DEFAULT NULL,
  `license_number` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `employee_id` varchar(255) DEFAULT NULL,
  `availability` varchar(255) DEFAULT NULL,
  `rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `experience` varchar(255) DEFAULT NULL,
  `nextAvailable` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_is_active_index` (`role`,`is_active`),
  KEY `users_is_active_role_index` (`is_active`,`role`),
  KEY `users_employee_id_index` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `role`, `specialization`, `license_number`, `is_active`, `employee_id`, `availability`, `rating`, `experience`, `nextAvailable`) VALUES
(1, 'Admin User', 'admin@clinic.com', NULL, '$2y$12$/n9hJ/MM96X5mWA/uK/0fuDmTySUdJixUvWBNqRwZwUaG6XLCa1G2', NULL, '2025-10-17 01:24:09', '2025-10-17 01:24:09', 'admin', NULL, NULL, 1, NULL, NULL, 0.00, NULL, NULL),
(63, 'Dr. Smith', 'doctor@clinic.com', NULL, '$2y$12$0Sie5gOmSY03.87AH0toC.LKcXuxK4JgAU97/uiAODoY/Hic.daQ.', NULL, '2025-10-17 15:02:38', '2025-10-17 15:02:38', 'doctor', 'General Medicine', NULL, 1, 'DOC001', NULL, 0.00, NULL, NULL),
(65, 'MedTech Specialist', 'medtech@clinic.com', NULL, '$2y$12$iewePPxxAN3xjoPcN/4TDuFis1cSCLzFlYg.tiuhix/xaDAeSqJ/S', NULL, NULL, NULL, 'medtech', 'Laboratory Technology', NULL, 1, NULL, NULL, 0.00, NULL, NULL),
(88, 'Ronnel Basierto', 'ronnel@gmail.com', NULL, '$2y$12$exOTjZU910Hk4ms9zjPCHuYpyFwaNDWNNsFO6.O77ytIXOhjZhqS6', NULL, '2025-10-18 01:38:01', '2025-10-18 01:38:01', 'patient', NULL, NULL, 1, NULL, NULL, 0.00, NULL, NULL),
(89, 'Jehus Cabalejo', 'jehus@patient', NULL, '$2y$12$6CGO0Im4ZI.EAWohGMhO5.EhiU5qBTRr1ul7Lc3RXDom/51SWtiCy', NULL, '2025-10-18 01:53:35', '2025-10-18 01:53:35', 'patient', NULL, NULL, 1, NULL, NULL, 0.00, NULL, NULL),
(90, 'Loyd', 'loyd@patient.com', NULL, '$2y$12$C.niGB4kx8Q5PbrQKDOcX.2qZOnvm4n2bEecCAeqEr0mbxCSbmorq', NULL, '2025-10-18 02:30:11', '2025-10-18 02:30:11', 'patient', NULL, NULL, 1, NULL, NULL, 0.00, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `visits`
--

DROP TABLE IF EXISTS `visits`;
CREATE TABLE IF NOT EXISTS `visits` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `visit_code` varchar(10) DEFAULT NULL,
  `appointment_id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `follow_up_visit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `purpose` varchar(255) NOT NULL,
  `visit_date` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `visit_type` enum('initial','follow_up','lab_result_review') NOT NULL DEFAULT 'initial',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `staff_id` bigint(20) UNSIGNED DEFAULT NULL,
  `attending_staff_id` bigint(20) UNSIGNED DEFAULT NULL,
  `doctor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `nurse_id` bigint(20) UNSIGNED DEFAULT NULL,
  `medtech_id` bigint(20) UNSIGNED DEFAULT NULL,
  `visit_date_time` datetime DEFAULT NULL,
  `visit_date_time_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_visit_per_appointment` (`appointment_id`),
  KEY `visits_follow_up_visit_id_foreign` (`follow_up_visit_id`),
  KEY `visits_status_index` (`status`),
  KEY `visits_visit_type_index` (`visit_type`),
  KEY `visits_patient_id_visit_date_time_index` (`patient_id`),
  KEY `visits_patient_id_visit_date_time_time_index` (`patient_id`,`visit_date_time_time`),
  KEY `visits_appointment_id_index` (`appointment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visits`
--

INSERT INTO `visits` (`id`, `visit_code`, `appointment_id`, `patient_id`, `follow_up_visit_id`, `purpose`, `visit_date`, `notes`, `status`, `visit_type`, `created_at`, `updated_at`, `deleted_at`, `staff_id`, `attending_staff_id`, `doctor_id`, `nurse_id`, `medtech_id`, `visit_date_time`, `visit_date_time_time`) VALUES
(1, 'V0001', 1, 1, NULL, 'cbc', NULL, NULL, 'scheduled', 'initial', '2025-10-18 01:40:24', '2025-10-18 01:40:24', NULL, NULL, 65, NULL, NULL, NULL, '2025-10-20 14:00:00', '2025-10-20 14:00:00'),
(2, 'V0002', 2, 2, NULL, 'general_consultation', NULL, NULL, 'scheduled', 'initial', '2025-10-18 01:55:23', '2025-10-18 01:55:23', NULL, NULL, 63, NULL, NULL, NULL, '2025-10-20 14:30:00', '2025-10-20 14:30:00'),
(3, 'V0003', 3, 3, NULL, 'fecalysis_test', NULL, NULL, 'scheduled', 'initial', '2025-10-18 02:31:43', '2025-10-18 02:31:43', NULL, NULL, 65, NULL, NULL, NULL, '2025-10-29 14:00:00', '2025-10-29 14:00:00');

-- --------------------------------------------------------

--
-- Structure for view `pending_appointments_view`
--
DROP TABLE IF EXISTS `pending_appointments_view`;

DROP VIEW IF EXISTS `pending_appointments_view`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `pending_appointments_view`  AS SELECT `a`.`id` AS `appointment_id`, `a`.`patient_name` AS `patient_name`, `a`.`patient_id` AS `patient_id`, `a`.`contact_number` AS `contact_number`, `a`.`appointment_type` AS `appointment_type`, `a`.`price` AS `price`, `a`.`specialist_type` AS `specialist_type`, `a`.`specialist_name` AS `specialist_name`, `a`.`specialist_id` AS `specialist_id`, `a`.`appointment_date` AS `appointment_date`, `a`.`appointment_time` AS `appointment_time`, `a`.`duration` AS `duration`, `a`.`status` AS `status`, `a`.`billing_status` AS `billing_status`, `a`.`billing_reference` AS `billing_reference`, `a`.`confirmation_sent` AS `confirmation_sent`, `a`.`notes` AS `notes`, `a`.`special_requirements` AS `special_requirements`, `a`.`source` AS `source`, `a`.`created_at` AS `created_at`, `a`.`updated_at` AS `updated_at`, `p`.`patient_no` AS `patient_no`, `p`.`first_name` AS `first_name`, `p`.`last_name` AS `last_name`, `p`.`mobile_no` AS `mobile_no`, concat(`p`.`first_name`,' ',`p`.`last_name`) AS `full_patient_name` FROM (`appointments` `a` left join `patients` `p` on(`a`.`patient_id` = `p`.`id`)) WHERE `a`.`status` = 'Pending' AND `a`.`deleted_at` is null ;

-- --------------------------------------------------------

--
-- Structure for view `staff`
--
DROP TABLE IF EXISTS `staff`;

DROP VIEW IF EXISTS `staff`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `staff`  AS SELECT `specialists`.`specialist_id` AS `staff_id`, `specialists`.`specialist_id` AS `id`, `specialists`.`specialist_code` AS `staff_code`, `specialists`.`name` AS `name`, `specialists`.`role` AS `role`, `specialists`.`specialization` AS `specialization`, `specialists`.`contact` AS `contact`, `specialists`.`email` AS `email`, `specialists`.`status` AS `status`, `specialists`.`created_at` AS `created_at`, `specialists`.`updated_at` AS `updated_at` FROM `specialists` ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_specialist_id_foreign` FOREIGN KEY (`specialist_id`) REFERENCES `specialists` (`specialist_id`) ON DELETE SET NULL;

--
-- Constraints for table `appointment_billing_links`
--
ALTER TABLE `appointment_billing_links`
  ADD CONSTRAINT `appointment_billing_links_appointment_id_foreign` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointment_billing_links_billing_transaction_id_foreign` FOREIGN KEY (`billing_transaction_id`) REFERENCES `billing_transactions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `billing_transactions`
--
ALTER TABLE `billing_transactions`
  ADD CONSTRAINT `billing_transactions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `billing_transactions_doctor_id_foreign` FOREIGN KEY (`doctor_id`) REFERENCES `specialists` (`specialist_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `billing_transactions_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `billing_transactions_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `billing_transaction_items`
--
ALTER TABLE `billing_transaction_items`
  ADD CONSTRAINT `billing_transaction_items_billing_transaction_id_foreign` FOREIGN KEY (`billing_transaction_id`) REFERENCES `billing_transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `billing_transaction_items_lab_test_id_foreign` FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `doctor_payments`
--
ALTER TABLE `doctor_payments`
  ADD CONSTRAINT `doctor_payments_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doctor_payments_doctor_id_foreign` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doctor_payments_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `doctor_payment_billing_links`
--
ALTER TABLE `doctor_payment_billing_links`
  ADD CONSTRAINT `doctor_payment_billing_links_billing_transaction_id_foreign` FOREIGN KEY (`billing_transaction_id`) REFERENCES `billing_transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doctor_payment_billing_links_doctor_payment_id_foreign` FOREIGN KEY (`doctor_payment_id`) REFERENCES `doctor_payments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `doctor_summary_reports`
--
ALTER TABLE `doctor_summary_reports`
  ADD CONSTRAINT `doctor_summary_reports_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doctor_summary_reports_doctor_id_foreign` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doctor_summary_reports_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `doctor_payments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `inventory_movements_inventory_id_foreign` FOREIGN KEY (`inventory_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory_reports`
--
ALTER TABLE `inventory_reports`
  ADD CONSTRAINT `inventory_reports_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lab_orders`
--
ALTER TABLE `lab_orders`
  ADD CONSTRAINT `lab_orders_ordered_by_foreign` FOREIGN KEY (`ordered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lab_orders_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lab_orders_patient_visit_id_foreign` FOREIGN KEY (`patient_visit_id`) REFERENCES `visits` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lab_results`
--
ALTER TABLE `lab_results`
  ADD CONSTRAINT `lab_results_lab_order_id_foreign` FOREIGN KEY (`lab_order_id`) REFERENCES `lab_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lab_results_lab_test_id_foreign` FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lab_results_verified_by_foreign` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lab_result_values`
--
ALTER TABLE `lab_result_values`
  ADD CONSTRAINT `lab_result_values_lab_result_id_foreign` FOREIGN KEY (`lab_result_id`) REFERENCES `lab_results` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `patient_referrals`
--
ALTER TABLE `patient_referrals`
  ADD CONSTRAINT `patient_referrals_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `patient_referrals_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `patient_referrals_referred_by_foreign` FOREIGN KEY (`referred_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `patient_transfers`
--
ALTER TABLE `patient_transfers`
  ADD CONSTRAINT `patient_transfers_accepted_by_foreign` FOREIGN KEY (`accepted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `patient_transfers_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `patient_transfers_transferred_by_foreign` FOREIGN KEY (`transferred_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `supply_stock_levels`
--
ALTER TABLE `supply_stock_levels`
  ADD CONSTRAINT `supply_stock_levels_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `supplies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `supply_transactions`
--
ALTER TABLE `supply_transactions`
  ADD CONSTRAINT `supply_transactions_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `supply_transactions_charged_to_foreign` FOREIGN KEY (`charged_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `supply_transactions_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `supplies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `supply_transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `visits`
--
ALTER TABLE `visits`
  ADD CONSTRAINT `visits_appointment_id_foreign` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `visits_follow_up_visit_id_foreign` FOREIGN KEY (`follow_up_visit_id`) REFERENCES `visits` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `visits_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
