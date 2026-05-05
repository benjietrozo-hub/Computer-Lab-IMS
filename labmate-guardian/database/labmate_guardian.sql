-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 05, 2026 at 04:58 AM
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
-- Database: `labmate_guardian`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `admin_email` varchar(255) NOT NULL,
  `admin_name` varchar(255) NOT NULL,
  `action` varchar(50) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `record_id` varchar(100) NOT NULL,
  `record_description` text DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_role` varchar(50) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `module` varchar(100) NOT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` varchar(100) DEFAULT NULL,
  `entity_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `real_ip` varchar(45) DEFAULT NULL COMMENT 'Real IP from X-Forwarded-For if behind proxy',
  `user_agent` text DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL COMMENT 'mobile, desktop, tablet, bot, unknown',
  `browser` varchar(100) DEFAULT NULL COMMENT 'Browser name and version',
  `os` varchar(100) DEFAULT NULL COMMENT 'Operating system',
  `is_bot` tinyint(1) DEFAULT 0 COMMENT 'Whether request is from a bot/crawler',
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `severity` enum('info','warning','error','critical') DEFAULT 'info',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `user_name`, `user_email`, `user_role`, `action`, `module`, `entity_type`, `entity_id`, `entity_name`, `description`, `ip_address`, `real_ip`, `user_agent`, `device_type`, `browser`, `os`, `is_bot`, `old_values`, `new_values`, `metadata`, `severity`, `created_at`) VALUES
(1, NULL, 'System', NULL, NULL, 'system_init', 'system', NULL, NULL, NULL, 'Activity logging system initialized', NULL, NULL, NULL, 'unknown', NULL, NULL, 0, NULL, NULL, NULL, 'info', '2026-01-30 20:01:33'),
(3, 9782, 'Liejay Jabines', 'jay@gmail.com', 'user', 'login', 'authentication', 'user', '9782', 'jay@gmail.com', 'User logged in', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'unknown', NULL, NULL, 0, NULL, NULL, NULL, 'info', '2026-01-30 20:17:30'),
(4, 9783, 'Robert Pahit', 'babals@gmail.com', 'admin', 'login', 'authentication', 'user', '9783', 'babals@gmail.com', 'User logged in', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'unknown', NULL, NULL, 0, NULL, NULL, NULL, 'info', '2026-01-30 20:23:34'),
(5, 9783, 'Robert Pahit', 'babals@gmail.com', 'admin', 'login', 'authentication', 'user', '9783', 'babals@gmail.com', 'User logged in', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'unknown', NULL, NULL, 0, NULL, NULL, NULL, 'info', '2026-01-30 20:33:07'),
(6, 9783, 'Robert Pahit', 'babals@gmail.com', 'admin', 'login', 'authentication', 'user', '9783', 'babals@gmail.com', 'User logged in', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'unknown', NULL, NULL, 0, NULL, NULL, NULL, 'info', '2026-01-30 20:36:41'),
(7, NULL, 'System', NULL, NULL, 'logout', 'authentication', 'user', '9783', 'Robert Pahit', 'User logged out: Robert Pahit', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'unknown', NULL, NULL, 0, NULL, NULL, NULL, 'info', '2026-01-30 20:36:48'),
(8, NULL, NULL, 'babals@gmail.com', NULL, 'login_failed', 'authentication', 'user', NULL, 'babals@gmail.com', 'Failed login attempt for: babals@gmail.com', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'unknown', NULL, NULL, 0, NULL, NULL, NULL, 'warning', '2026-02-02 03:10:50'),
(9, NULL, NULL, 'babals@gmail.com', NULL, 'login_failed', 'authentication', 'user', NULL, 'babals@gmail.com', 'Failed login attempt for: babals@gmail.com', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'unknown', NULL, NULL, 0, NULL, NULL, NULL, 'warning', '2026-02-02 03:10:51'),
(10, NULL, NULL, 'babals@gmail.com', NULL, 'login_failed', 'authentication', 'user', NULL, 'babals@gmail.com', 'Failed login attempt for: babals@gmail.com', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'unknown', NULL, NULL, 0, NULL, NULL, NULL, 'warning', '2026-02-02 03:11:06'),
(11, 6717, 'Test Admin', 'test@example.com', 'admin', 'test', 'testing', 'test', '999', 'Test Entity 1770008798', 'This is a test activity log created at 2026-02-02 06:06:38', 'unknown', NULL, 'Test Script/1.0', 'unknown', 'Unknown', 'Unknown', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:06:38'),
(12, 6717, 'Test Admin', 'test@example.com', 'admin', 'test', 'testing', 'test', '999', 'Test Entity 1770008903', 'This is a test activity log created at 2026-02-02 06:08:23', 'unknown', NULL, 'Test Script/1.0', 'unknown', 'Unknown', 'Unknown', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:08:23'),
(13, 6717, 'Test Admin', 'test@example.com', 'admin', 'test', 'testing', 'test', '999', 'Test Entity 1770008967', 'This is a test activity log created at 2026-02-02 06:09:27', 'unknown', NULL, 'Test Script/1.0', 'unknown', 'Unknown', 'Unknown', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:09:27'),
(14, 9782, 'Liejay Jabines', 'jay@gmail.com', 'user', 'login_failed', 'authentication', 'user', '9782', 'jay@gmail.com', 'Failed login attempt for: jay@gmail.com (incorrect password)', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'desktop', 'Chrome 141.0.0.0', 'Windows 10/11', 0, NULL, NULL, NULL, 'warning', '2026-02-02 05:11:32'),
(15, 9782, 'Liejay Jabines', 'jay@gmail.com', 'user', 'login', 'authentication', 'user', '9782', 'jay@gmail.com', 'User logged in', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'desktop', 'Chrome 141.0.0.0', 'Windows 10/11', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:11:48'),
(16, 6717, 'Test Admin', 'test@example.com', 'admin', 'test', 'testing', 'test', '999', 'Test Entity 1770009282', 'This is a test activity log created at 2026-02-02 06:14:42', 'unknown', NULL, 'Test Script/1.0', 'unknown', 'Unknown', 'Unknown', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:14:42'),
(18, NULL, 'John Doe', 'john@example.com', 'user', 'login', 'inventory', 'equipment', '123', 'Test Equipment', 'login from Public Internet - Philippines', '203.123.45.67', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', 'desktop', 'Chrome 120', 'Windows 10', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:18:25'),
(19, NULL, 'Jane Smith', 'jane@example.com', 'user', 'create', 'inventory', 'equipment', '123', 'Test Equipment', 'create from Local Network - Office', '192.168.1.105', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', 'desktop', 'Chrome 120', 'Windows 10', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:18:25'),
(20, NULL, 'Bob Johnson', 'bob@example.com', 'user', 'update', 'inventory', 'equipment', '123', 'Test Equipment', 'update from Public Internet - USA', '198.51.100.42', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', 'desktop', 'Chrome 120', 'Windows 10', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:18:25'),
(21, NULL, 'Alice Brown', 'alice@example.com', 'user', 'delete', 'inventory', 'equipment', '123', 'Test Equipment', 'delete from Private Network - Campus', '10.0.0.45', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', 'desktop', 'Chrome 120', 'Windows 10', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:18:25'),
(22, NULL, 'Charlie Wilson', 'charlie@example.com', 'user', 'login', 'inventory', 'equipment', '123', 'Test Equipment', 'login from IPv6 - Modern Network', '2001:db8:85a3::8a2e:370:7334', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', 'desktop', 'Chrome 120', 'Windows 10', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:18:25'),
(23, NULL, 'Diana Davis', 'diana@example.com', 'user', 'create', 'inventory', 'equipment', '123', 'Test Equipment', 'create from Private Network - Lab', '172.16.0.100', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', 'desktop', 'Chrome 120', 'Windows 10', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:18:25'),
(24, NULL, 'System', NULL, NULL, 'logout', 'authentication', 'user', '9782', 'Liejay Jabines', 'User logged out: Liejay Jabines', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'desktop', 'Chrome 141.0.0.0', 'Windows 10/11', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:20:52'),
(25, 9782, 'Liejay Jabines', 'jay@gmail.com', 'user', 'login_failed', 'authentication', 'user', '9782', 'jay@gmail.com', 'Failed login attempt for: jay@gmail.com (incorrect password)', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'desktop', 'Chrome 141.0.0.0', 'Windows 10/11', 0, NULL, NULL, NULL, 'warning', '2026-02-02 05:21:40'),
(26, 9782, 'Liejay Jabines', 'jay@gmail.com', 'user', 'login_failed', 'authentication', 'user', '9782', 'jay@gmail.com', 'Failed login attempt for: jay@gmail.com (incorrect password)', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'desktop', 'Chrome 141.0.0.0', 'Windows 10/11', 0, NULL, NULL, NULL, 'warning', '2026-02-02 05:21:48'),
(27, 9782, 'Liejay Jabines', 'jay@gmail.com', 'user', 'login', 'authentication', 'user', '9782', 'jay@gmail.com', 'User logged in', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'desktop', 'Chrome 141.0.0.0', 'Windows 10/11', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:22:09'),
(28, 6717, ' ', 'benjie.trozo@csucc.edu.ph', 'admin', 'login', 'authentication', 'user', '6717', 'benjie.trozo@csucc.edu.ph', 'User logged in', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'desktop', 'Chrome 141.0.0.0', 'Windows 10/11', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:28:33'),
(29, NULL, 'System', NULL, NULL, 'restore', 'trash', 'borrow_request', '69c0d2df-54bb-4648-bf2c-086ccf3788b6', '69c0d2df-54bb-4648-bf2c-086ccf3788b6', 'Restore borrow_request: 69c0d2df-54bb-4648-bf2c-086ccf3788b6', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'desktop', 'Chrome 141.0.0.0', 'Windows 10/11', 0, NULL, NULL, NULL, 'info', '2026-02-02 05:28:40');

-- --------------------------------------------------------

--
-- Table structure for table `borrow_items`
--

CREATE TABLE `borrow_items` (
  `id` char(36) NOT NULL,
  `request_id` char(36) DEFAULT NULL,
  `borrower_name` varchar(255) NOT NULL,
  `borrower_email` varchar(255) NOT NULL,
  `item` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `borrow_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('borrowed','returned') DEFAULT 'borrowed',
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` char(36) DEFAULT NULL,
  `return_condition` varchar(50) DEFAULT NULL,
  `return_comments` text DEFAULT NULL,
  `return_processed_by` char(36) DEFAULT NULL,
  `return_processed_at` datetime DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `original_module` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `borrow_items`
--

INSERT INTO `borrow_items` (`id`, `request_id`, `borrower_name`, `borrower_email`, `item`, `quantity`, `borrow_date`, `return_date`, `status`, `created_at`, `created_by`, `return_condition`, `return_comments`, `return_processed_by`, `return_processed_at`, `deleted_at`, `deleted_by`, `original_module`) VALUES
('02740a96-150d-4979-9384-3febd9ef878a', 'e9c87d6e-32c9-4434-bb81-118457fad1e6', 'Liejay Jabines', 'jay@gmail.com', 'Multimeter', 3, '2025-12-16', '2025-12-17', 'returned', '2025-12-16 16:18:18', '6717', 'good', '', '6717', '2025-12-16 17:19:28', NULL, NULL, NULL),
('055fff17-d1a0-4794-8f55-37aab1b56377', '792a47f9-77c8-4b4e-9d04-c64faf062276', 'benjie.trozo@csucc.edu.ph', 'benjie.trozo@csucc.edu.ph', 'Soldering Iron', 1, '2025-12-23', '2025-12-24', 'returned', '2025-12-23 10:14:20', '6717', 'good', 'asasas', '6717', '2026-01-27 22:45:35', NULL, NULL, NULL),
('072ad8d8-64ce-457a-862a-b12fe6df3b48', '774e53de-1e20-4f9c-819e-f6cb6c68756c', '', 'benjie.trozo@csucc.edu.ph', 'Screwdriver Set', 1, '2025-12-16', '2025-12-19', 'returned', '2025-12-16 18:29:50', '9786', 'needs_repair', '', '6717', '2025-12-22 23:29:36', NULL, NULL, NULL),
('2bba66d7-973e-43d9-8ceb-8d2027b5d41d', '290fc467-2c5f-4281-9157-7428b8b012ad', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-16', '2025-12-26', 'returned', '2025-12-16 12:10:01', '6717', 'good', '', '6717', '2025-12-16 17:23:43', NULL, NULL, NULL),
('353152c7-d5cb-45a6-a142-2d4cbda3556d', '28f9917a-82d0-46b1-be2a-caba36ec77c4', 'Cedric Ang', 'Cedric.Ang@csucc.edu.ph', 'Oscilloscope', 1, '2025-12-17', '2025-12-19', 'returned', '2025-12-17 13:29:52', '6717', 'good', 'asasas', '6717', '2026-01-27 22:45:15', NULL, NULL, NULL),
('42ec740f-9a20-4650-a479-ba2b0af13e98', '71855491-f85c-4fef-bf9f-852e8b1c19b3', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-16', '2025-12-17', 'returned', '2025-12-16 18:35:24', '6717', 'good', 'asas', '6717', '2026-01-27 22:45:24', NULL, NULL, NULL),
('485161c2-ab4e-4e99-ab14-0f046511d85e', '3894565a-2145-4be9-9a74-be88d5e11c99', 'Cedric Ang', 'Cedric.Ang@csucc.edu.ph', 'Multimeter', 1, '2025-12-17', '2025-12-17', 'returned', '2025-12-17 12:25:05', '9787', 'good', 'sasasa', '6717', '2026-01-27 22:45:18', NULL, NULL, NULL),
('4df9a1e8-2368-45d7-8688-6fa0e67c384d', '8f3ae513-04ec-40eb-a204-82a73f2fde93', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-16', '2025-12-17', 'returned', '2025-12-16 11:51:48', '6717', 'good', '', '6717', '2025-12-16 18:09:01', NULL, NULL, NULL),
('5923405c-8fad-4a61-a7ef-f0a7e584a5c9', '670574f0-8b0d-4813-8b48-6884f2738f7a', 'Liejay Jabines', 'jay@gmail.com', 'VR Headset', 1, '2026-01-25', '2026-01-26', 'returned', '2026-01-25 15:47:39', '6717', 'good', 'asas', '6717', '2026-01-27 22:44:43', NULL, NULL, NULL),
('5d67b7d0-9e7e-4814-bcb2-ef7efff303d1', '49b122fe-4ac2-41f6-add4-f4315481ad3c', 'Liejay Jabines', 'jay@gmail.com', 'VR Headset', 1, '2026-01-25', '0000-00-00', 'returned', '2026-01-25 14:01:27', '6717', 'good', 'asas', '6717', '2026-01-27 22:45:08', NULL, NULL, NULL),
('7278ddfa-5db0-4855-9df0-ba93f3e9aa5e', 'e0f5f90c-dd59-493d-a8c0-6ae4930b6e5e', 'Test Student', 'jay@gmail.com', '0', 1, '2025-12-10', '2025-12-13', 'returned', '2025-12-10 15:43:36', '6717', 'good', 'sasasas', '6717', '2026-01-27 22:45:28', NULL, NULL, NULL),
('738ecf7b-0590-4954-924a-04b4e417741a', '468902fe-9e4a-4a89-9553-2eb0a94d5e7f', 'Liejay Jabines', 'jay@gmail.com', 'VR Headset', 1, '2026-01-25', '0000-00-00', 'returned', '2026-01-25 15:48:00', '6717', 'good', 'asas', '6717', '2026-01-27 22:38:40', NULL, NULL, NULL),
('7d98423d-b384-48f8-bb77-0cbd35f389c2', '0621ebae-3fad-4c7a-94ae-1f572f56e4c2', 'Cedric Ang', 'Cedric.Ang@csucc.edu.ph', 'Multimeter', 1, '2025-12-17', '2025-12-19', 'returned', '2025-12-17 13:29:55', '6717', 'needs_repair', '', '6717', '2025-12-22 23:37:04', NULL, NULL, NULL),
('80bbbe0a-1eca-4218-95fa-471099c083f1', 'ac06e5c5-986b-4976-b12c-60d77347c35a', 'benjie.trozo', 'benjie.trozo@csucc.edu.ph', 'Multimeter', 1, '2025-12-18', '2025-12-19', 'returned', '2025-12-18 13:29:38', '6717', 'damaged', '', '6717', '2025-12-22 23:35:48', NULL, NULL, NULL),
('88361577-272b-4860-854d-0503f1640a11', 'd9fd21bd-776c-48ec-9ab2-b24f6c6f40b8', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-23', '2025-12-23', 'returned', '2025-12-23 16:38:12', '6717', 'good', 'sasas', '6717', '2026-01-27 22:45:10', NULL, NULL, NULL),
('90043f41-e409-4596-9662-873fae461de0', 'b517e8a3-e00c-406d-aea1-f12bcb870c94', 'benjie.trozo', 'benjie.trozo@csucc.edu.ph', '3D Printer', 1, '2025-12-18', '2025-12-19', 'returned', '2025-12-18 14:20:55', '6717', 'good', '', '6717', '2025-12-22 23:35:24', NULL, NULL, NULL),
('9320b3f3-3a8e-4f9e-b9b3-508bcb66eeb4', '3c7206ef-e4c6-43f6-9f20-12c6bd8d39e8', 'Melenio Caturan', 'lelen@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-24', 'returned', '2025-12-23 11:19:06', '6717', 'good', '', '6717', '2025-12-23 16:36:24', NULL, NULL, NULL),
('955a7738-8961-4f34-a49c-3ff8224d4566', '17d3580b-a528-4831-8daf-e1ba74f1e56e', 'Liejay Jabines', 'jay@gmail.com', '0', 1, '2025-12-10', '0000-00-00', 'returned', '2025-12-10 14:47:51', '6717', 'needs_repair', NULL, NULL, NULL, NULL, NULL, NULL),
('ae866d24-9b19-49c3-bd64-3baf9584dee7', '95720de3-cd7d-47fd-91d0-e52b6552b01b', 'Liejay Jabines', 'jay@gmail.com', 'VR Headset', 1, '2025-12-16', '2025-12-17', 'returned', '2025-12-16 16:16:52', '6717', 'good', '', '6717', '2025-12-16 17:19:52', NULL, NULL, NULL),
('b05f555b-cc9e-4ad6-8c0a-0fa6e648a2d6', 'db5e47a1-4af0-4c32-867c-955ba62dc7bd', 'Cedric Ang', 'Cedric.Ang@csucc.edu.ph', 'Screwdriver Set', 3, '2025-12-17', '2025-12-17', 'returned', '2025-12-17 12:14:12', '9787', 'good', 'asasas', '6717', '2026-01-27 22:45:21', NULL, NULL, NULL),
('b4f6cd65-6a44-4661-b690-e74b4f1b57f9', '7c43819d-c1e2-4f23-8d73-0a98dcdfc6c6', 'Melenio Caturan', 'lelen@gmail.com', 'Soldering Iron', 1, '2025-12-23', '2025-12-24', 'borrowed', '2026-01-28 00:02:55', '6717', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('f31bf03c-dfa1-4a07-912f-f46bf4b3d4f2', 'e606b851-6c57-4150-aa1b-2a77a5250509', 'benjie.trozo', 'benjie.trozo@csucc.edu.ph', 'Wire Stripper', 1, '2025-12-18', '2025-12-24', 'returned', '2025-12-18 14:32:19', '6717', 'good', 'aasas', '6717', '2025-12-22 23:14:19', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `borrow_requests`
--

CREATE TABLE `borrow_requests` (
  `id` char(36) NOT NULL,
  `borrower_name` varchar(255) NOT NULL,
  `borrower_email` varchar(255) NOT NULL,
  `item` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `request_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` char(36) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` char(36) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `original_module` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `borrow_requests`
--

INSERT INTO `borrow_requests` (`id`, `borrower_name`, `borrower_email`, `item`, `quantity`, `request_date`, `return_date`, `status`, `approved_by`, `approved_at`, `rejection_reason`, `created_at`, `created_by`, `message`, `deleted_at`, `deleted_by`, `original_module`) VALUES
('14e79ff9-dd72-42bf-b733-77cdee550112', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-24', 'pending', NULL, NULL, NULL, '2025-12-23 03:53:45', '9782', '', NULL, NULL, NULL),
('40aace21-704f-4843-af38-8d92ccf0ab99', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-24', 'pending', NULL, NULL, NULL, '2025-12-23 03:53:44', '9782', '', NULL, NULL, NULL),
('52b4c80a-cc2f-488c-b14b-4b22fbdf763d', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-24', 'pending', NULL, NULL, NULL, '2025-12-23 03:53:42', '9782', '', NULL, NULL, NULL),
('69c0d2df-54bb-4648-bf2c-086ccf3788b6', 'benjie.trozo@csucc.edu.ph', 'benjie.trozo@csucc.edu.ph', '3D Printer', 1, '2025-12-23', '2025-12-23', 'rejected', '6717', '2026-01-27 14:51:56', 'sasasas', '2025-12-23 16:36:43', '6717', 'Printing', NULL, NULL, NULL),
('7b85ca66-2f38-42b2-adde-c4350eff5982', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-24', 'pending', NULL, NULL, NULL, '2025-12-23 03:53:42', '9782', '', NULL, NULL, NULL),
('7c3b416b-2346-40ed-a271-4d79c01f5fbc', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-22', '0000-00-00', 'pending', NULL, NULL, NULL, '2025-12-23 03:53:53', '9782', '', NULL, NULL, NULL),
('a145a9a6-4ca7-4069-b184-954bfc263aa8', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-24', 'pending', NULL, NULL, NULL, '2025-12-23 03:52:11', '9782', '', NULL, NULL, NULL),
('b647ddfb-53e3-49f7-8ed3-15ad5096a1dd', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-24', 'pending', NULL, NULL, NULL, '2025-12-23 03:53:44', '9782', '', NULL, NULL, NULL),
('b82371d9-ed9d-4aba-b7fd-b556e42d1653', 'Melenio Caturan', 'lelen@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-24', 'pending', NULL, NULL, NULL, '2025-12-23 03:49:28', '9784', '', NULL, NULL, NULL),
('c0d2c4c8-cda4-4e89-8251-0b6a603edad3', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-24', 'pending', NULL, NULL, NULL, '2025-12-23 03:53:42', '9782', '', NULL, NULL, NULL),
('c3f1a48a-166d-469a-a353-5faabd601d43', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-25', 'pending', NULL, NULL, NULL, '2025-12-23 03:43:07', '9782', '', NULL, NULL, NULL),
('d23c1d70-16fd-43af-a021-4905390facec', 'Melenio Caturan', 'lelen@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-24', 'pending', NULL, NULL, NULL, '2025-12-23 03:42:38', '9784', '', NULL, NULL, NULL),
('dc971832-a647-455d-8f14-7e21635de338', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-24', 'pending', NULL, NULL, NULL, '2025-12-23 03:53:42', '9782', '', NULL, NULL, NULL),
('e5d98291-42d0-449b-acdd-bfe8c604d8a0', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-25', 'pending', NULL, NULL, NULL, '2025-12-23 03:43:08', '9782', '', NULL, NULL, NULL),
('f1e8abe7-62aa-4260-8e0d-677e6ec196e0', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-24', 'pending', NULL, NULL, NULL, '2025-12-23 03:53:45', '9782', '', NULL, NULL, NULL),
('fed3d71a-dad8-4e9e-8057-6b373b6db955', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-22', '2025-12-24', 'pending', NULL, NULL, NULL, '2025-12-23 03:53:41', '9782', '', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `equipment_reservations`
--

CREATE TABLE `equipment_reservations` (
  `id` char(36) NOT NULL,
  `reservation_number` varchar(20) DEFAULT NULL,
  `equipment_id` char(36) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reservation_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `quantity_reserved` int(11) NOT NULL DEFAULT 1,
  `user_type` enum('student','staff','faculty','visitor') DEFAULT 'student',
  `contact_info` text DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled','completed') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `penalty_amount` decimal(10,2) DEFAULT 0.00,
  `penalty_paid` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `original_module` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `incident_reports`
--

CREATE TABLE `incident_reports` (
  `id` char(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `incident_type` varchar(50) NOT NULL,
  `severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `location` varchar(255) DEFAULT NULL,
  `hardware_type` varchar(100) DEFAULT NULL,
  `hardware_damage` text DEFAULT NULL,
  `software_type` varchar(100) DEFAULT NULL COMMENT 'Type of software (OS, application, browser, etc.)',
  `software_issue` varchar(100) DEFAULT NULL COMMENT 'Type of software issue (crash, freeze, error, etc.)',
  `network_type` varchar(100) DEFAULT NULL COMMENT 'Type of network (wifi, ethernet, internet, etc.)',
  `network_issue` varchar(100) DEFAULT NULL COMMENT 'Type of network issue (no connection, slow speed, etc.)',
  `security_type` varchar(100) DEFAULT NULL COMMENT 'Type of security incident (malware, phishing, breach, etc.)',
  `security_details` text DEFAULT NULL COMMENT 'Security incident details',
  `facility_type` varchar(100) DEFAULT NULL COMMENT 'Type of facility issue (electrical, lighting, HVAC, etc.)',
  `facility_issue` text DEFAULT NULL COMMENT 'Facility issue description',
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `reported_by` varchar(255) NOT NULL,
  `date_occurred` date NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `original_module` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `incident_reports`
--

INSERT INTO `incident_reports` (`id`, `name`, `title`, `description`, `incident_type`, `severity`, `location`, `hardware_type`, `hardware_damage`, `software_type`, `software_issue`, `network_type`, `network_issue`, `security_type`, `security_details`, `facility_type`, `facility_issue`, `timestamp`, `reported_by`, `date_occurred`, `created_at`, `deleted_at`, `deleted_by`, `original_module`) VALUES
('0d73c32c-5c31-4c90-af1b-8323b0c6f014', 'colb102_pc10', 'colb102_pc10', 'kerby corrupted the ssd', 'hardware', 'critical', 'COLB_102', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 04:45:56', 'Cedric Ang', '2025-12-17', '2025-12-17 10:46:43', NULL, NULL, NULL),
('0e8652e1-b07b-4683-99f9-b2054b0eac06', 'n', 'n', 'hh', 'network', 'medium', 'h', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 04:45:56', 'Cedric Ang', '2025-12-17', '2025-12-17 11:01:29', NULL, NULL, NULL),
('12345678-1234-1234-1234-123456789abc', 'Sample Incident Report', 'Sample Incident Report', 'This is a sample incident report to test the system functionality. The system allows users to report incidents and admins to add updates.', 'hardware', 'medium', 'Lab A - Workstation 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 04:45:56', 'Test User', '2025-12-16', '2025-12-16 16:47:35', NULL, NULL, NULL),
('3b65c964-e9a8-48dd-984c-930de93f9ebd', 'Final Test Incident', 'Final Test Incident', 'Testing notifications after fix', 'hardware', 'high', 'Computer Lab', 'Laptop', 'Screen cracked', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 05:00:00', 'Test User', '2025-12-23', '2025-12-23 13:25:06', NULL, NULL, NULL),
('85fbd95a-e690-47cc-89f7-aa0204b591f7', 'Broken monitor', 'Broken monitor', 'none', 'hardware', 'medium', 'col5', 'monitor', 'not powering on', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-22 20:46:34', 'Melenio Caturan (instructor)', '2025-12-23', '2025-12-23 12:47:42', NULL, NULL, NULL),
('928b81c8-1f37-416e-9ee3-a557840a5e56', 'naay buang sa comlab sir', 'naay buang sa comlab sir', 'basta', 'other', 'critical', 'cl 5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 04:45:56', 'Liejay Jabines', '2025-12-22', '2025-12-22 22:52:59', NULL, NULL, NULL),
('c5ab3026-157c-4827-8712-daaa31a83679', 'hi', 'hi', 'nope', 'other', 'critical', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 04:45:56', 'Liejay Jabines', '2025-12-16', '2025-12-16 16:55:51', NULL, NULL, NULL),
('edc1afb1-dcee-47e4-a0ad-a49e6691e975', 'Test Incident', 'Test Incident', 'This is a test incident report', 'software', 'low', 'Test Lab', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 04:00:00', 'Benjie Trozo', '2025-12-23', '2025-12-23 13:24:45', NULL, NULL, NULL),
('fa2a76da-9dde-49f8-bada-aef765aa66b7', 'asasas', 'asasas', 'asasas', 'hardware', 'critical', '', 'computer', 'gi inom ni kerby ang ink', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-22 21:42:42', '(admin)', '2025-12-23', '2025-12-23 13:43:05', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `incident_reports_backup`
--

CREATE TABLE `incident_reports_backup` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `incident_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reported_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_occurred` date NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `incident_updates`
--

CREATE TABLE `incident_updates` (
  `id` char(36) NOT NULL,
  `incident_id` char(36) NOT NULL,
  `updated_by` int(11) NOT NULL,
  `update_type` enum('comment','status_change','action_taken') NOT NULL DEFAULT 'comment',
  `message` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `incident_updates`
--

INSERT INTO `incident_updates` (`id`, `incident_id`, `updated_by`, `update_type`, `message`, `created_at`) VALUES
('584341d6-1a84-48cb-b3fe-0a43451b3126', '85fbd95a-e690-47cc-89f7-aa0204b591f7', 6717, 'comment', 'ok anha ra ko', '2025-12-23 12:48:15'),
('d4e33777-725c-43a8-a8f0-8d4a1450ae65', 'c5ab3026-157c-4827-8712-daaa31a83679', 6717, 'comment', 'sumbaga akoy sugo', '2025-12-16 16:56:12'),
('d9623c26-3d99-41f2-bbb8-2a96febbb7a0', '12345678-1234-1234-1234-123456789abc', 6717, 'comment', 'loslos', '2025-12-16 16:51:26'),
('da8ce1ab-81a9-4487-bc56-cb4204313827', '0a0c0606-66d9-4b5d-970a-5cad52c17c4d', 6717, 'comment', 'okay', '2025-12-16 16:57:45');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_audit`
--

CREATE TABLE `inventory_audit` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `equipment_id` char(36) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `change_type` varchar(50) NOT NULL,
  `quantity_change` int(11) NOT NULL,
  `performed_by` char(36) DEFAULT NULL,
  `related_request_id` char(36) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_audit`
--

INSERT INTO `inventory_audit` (`id`, `equipment_id`, `item_name`, `change_type`, `quantity_change`, `performed_by`, `related_request_id`, `created_at`) VALUES
(1, NULL, '0', 'return_lost', 0, '6717', '0cde7cd5-34b1-4eca-9be7-cd7c422a2bf0', '2025-12-12 12:33:36'),
(2, '6938fd60ed14c', 'Screwdriver Set', 'borrow_deduction', -1, '6717', '7b452ec8-f543-4677-8598-51bcaca6e4fd', '2025-12-12 14:05:06'),
(3, '6938fd6100c8b', '3D Printer', 'borrow_deduction', -1, '6717', '8f3ae513-04ec-40eb-a204-82a73f2fde93', '2025-12-16 11:51:48'),
(4, '6938fd6100c8b', '3D Printer', 'borrow_deduction', -1, '6717', '290fc467-2c5f-4281-9157-7428b8b012ad', '2025-12-16 12:10:01'),
(5, '6938fd6101db1', 'VR Headset', 'borrow_deduction', -1, '6717', '95720de3-cd7d-47fd-91d0-e52b6552b01b', '2025-12-16 16:16:52'),
(6, '6938fd60ef1bd', 'Multimeter', 'borrow_deduction', -3, '6717', 'e9c87d6e-32c9-4434-bb81-118457fad1e6', '2025-12-16 16:18:18'),
(7, '6938fd60ed14c', 'Screwdriver Set', 'borrow_deduction', -1, '9786', '774e53de-1e20-4f9c-819e-f6cb6c68756c', '2025-12-16 18:29:51'),
(8, '6938fd6100c8b', '3D Printer', 'borrow_deduction', -1, '6717', '71855491-f85c-4fef-bf9f-852e8b1c19b3', '2025-12-16 18:35:24'),
(9, '6938fd60ed14c', 'Screwdriver Set', 'borrow_deduction', -3, '9787', 'db5e47a1-4af0-4c32-867c-955ba62dc7bd', '2025-12-17 12:14:12'),
(10, '6938fd60ef1bd', 'Multimeter', 'borrow_deduction', -1, '9787', '3894565a-2145-4be9-9a74-be88d5e11c99', '2025-12-17 12:25:05'),
(11, '6938fd60f16f1', 'Oscilloscope', 'borrow_deduction', -1, '6717', '28f9917a-82d0-46b1-be2a-caba36ec77c4', '2025-12-17 13:29:52'),
(12, '6938fd60ef1bd', 'Multimeter', 'borrow_deduction', -1, '6717', '0621ebae-3fad-4c7a-94ae-1f572f56e4c2', '2025-12-17 13:29:55'),
(13, '6938fd60ef1bd', 'Multimeter', 'borrow_deduction', -1, '6717', 'ac06e5c5-986b-4976-b12c-60d77347c35a', '2025-12-18 13:29:38'),
(14, '6938fd6100c8b', '3D Printer', 'borrow_deduction', -1, '6717', 'b517e8a3-e00c-406d-aea1-f12bcb870c94', '2025-12-18 14:20:55'),
(15, '6938fd60f1051', 'Wire Stripper', 'borrow_deduction', -1, '6717', 'e606b851-6c57-4150-aa1b-2a77a5250509', '2025-12-18 14:32:19'),
(16, '6938fd60efb4f', 'Soldering Iron', 'borrow_deduction', -1, '6717', '792a47f9-77c8-4b4e-9d04-c64faf062276', '2025-12-23 10:14:20'),
(17, '6938fd6100c8b', '3D Printer', 'borrow_deduction', -1, '6717', '3c7206ef-e4c6-43f6-9f20-12c6bd8d39e8', '2025-12-23 11:19:06'),
(18, '6938fd6100c8b', '3D Printer', 'borrow_deduction', -1, '6717', 'd9fd21bd-776c-48ec-9ab2-b24f6c6f40b8', '2025-12-23 16:38:12'),
(19, '6938fd6101db1', 'VR Headset', 'borrow_deduction', -1, '6717', '49b122fe-4ac2-41f6-add4-f4315481ad3c', '2026-01-25 14:01:27'),
(20, '6938fd6101db1', 'VR Headset', 'borrow_deduction', -1, '6717', '670574f0-8b0d-4813-8b48-6884f2738f7a', '2026-01-25 15:47:39'),
(21, '6938fd6101db1', 'VR Headset', 'borrow_deduction', -1, '6717', '468902fe-9e4a-4a89-9553-2eb0a94d5e7f', '2026-01-25 15:48:00'),
(22, '6938fd60efb4f', 'Soldering Iron', 'borrow_deduction', -1, '6717', '7c43819d-c1e2-4f23-8d73-0a98dcdfc6c6', '2026-01-28 00:02:55'),
(23, '6938fd6100c8b', '3D Printer', 'borrow_deduction', -1, '6717', '9a6a02c3-3ead-4770-989b-5e5558f0b4a1', '2026-01-28 00:32:33');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_equipment`
--

CREATE TABLE `inventory_equipment` (
  `id` char(36) NOT NULL,
  `date` date NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `item_type` enum('tool','equipment') NOT NULL DEFAULT 'equipment',
  `item_description` text NOT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `purpose` text DEFAULT NULL,
  `signature` varchar(255) DEFAULT NULL,
  `date_returned` date DEFAULT NULL,
  `condition` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `assigned_to` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` char(36) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `original_module` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_equipment`
--

INSERT INTO `inventory_equipment` (`id`, `date`, `name`, `category`, `item_type`, `item_description`, `serial_number`, `quantity`, `purpose`, `signature`, `date_returned`, `condition`, `price`, `assigned_to`, `created_at`, `updated_at`, `created_by`, `deleted_at`, `deleted_by`, `original_module`) VALUES
('0d4a42440675472c37ee6ee5b46e0a5c', '2025-12-05', 'Admin', 'Computer', 'equipment', 'New', '12345', 25, '', NULL, '0000-00-00', 'Excellent', 0.00, NULL, '2025-12-05 17:17:57', '2025-12-18 05:45:38', '6717', NULL, NULL, NULL),
('6938fd60ed14c', '2025-12-10', 'Screwdriver Set', 'Tools', 'tool', 'Complete set of Phillips and flathead screwdrivers', 'TL-001', 3, 'General lab work', NULL, NULL, NULL, 0.00, NULL, '2025-12-10 12:56:00', '2026-01-27 14:45:21', NULL, NULL, NULL, NULL),
('6938fd60ef1bd', '2025-12-10', 'Multimeter', 'Tools', 'tool', 'Digital multimeter for electrical measurements', 'TL-002', 1, 'Electrical testing', NULL, NULL, NULL, 0.00, NULL, '2025-12-10 12:56:00', '2026-01-27 14:45:18', NULL, NULL, NULL, NULL),
('6938fd60efb4f', '2025-12-10', 'Soldering Iron', 'Tools', 'tool', 'Temperature-controlled soldering station', 'TL-003', 1, 'Electronics work', NULL, NULL, NULL, 0.00, NULL, '2025-12-10 12:56:00', '2026-01-27 16:02:55', NULL, NULL, NULL, NULL),
('6938fd60f1051', '2025-12-10', 'Wire Stripper', 'Tools', 'tool', 'Automatic wire stripper tool', 'TL-004', 8, 'Cable preparation', NULL, NULL, NULL, 0.00, NULL, '2025-12-10 12:56:00', '2025-12-22 15:14:19', NULL, NULL, NULL, NULL),
('6938fd60f16f1', '2025-12-10', 'Oscilloscope', 'Tools', 'tool', 'Digital oscilloscope 100MHz', 'TL-005', 1, 'Signal analysis', NULL, NULL, NULL, 0.00, NULL, '2025-12-10 12:56:00', '2026-01-27 14:45:15', NULL, NULL, NULL, NULL),
('6938fd60f1ec9', '2025-12-10', 'Laptop Computer', 'Computers', 'equipment', 'Dell Latitude laptop with Windows 11', 'EQ-001', 10, 'Student use', NULL, NULL, NULL, 0.00, NULL, '2025-12-10 12:56:00', '2025-12-18 05:45:38', NULL, NULL, NULL, NULL),
('6938fd60f331c', '2025-12-10', 'Projector', 'AV Equipment', 'equipment', 'Epson HD projector', 'EQ-002', 4, 'Presentations', NULL, NULL, NULL, 0.00, NULL, '2025-12-10 12:56:00', '2025-12-18 05:45:38', NULL, NULL, NULL, NULL),
('6938fd60f3987', '2025-12-10', 'Microscope', 'Lab Equipment', 'equipment', 'Compound microscope 1000x', 'EQ-003', 6, 'Biology labs', NULL, NULL, NULL, 0.00, NULL, '2025-12-10 12:56:00', '2025-12-18 05:45:38', NULL, NULL, NULL, NULL),
('6938fd6100c8b', '2025-12-10', '3D Printer', 'Manufacturing', 'equipment', 'Creality Ender 3 3D printer', 'EQ-004', 1, 'Prototyping', NULL, NULL, NULL, 0.00, NULL, '2025-12-10 12:56:01', '2026-01-27 16:32:33', NULL, NULL, NULL, NULL),
('6938fd6101db1', '2025-12-10', 'VR Headset', 'VR Equipment', 'equipment', 'Oculus Quest 2 VR headset', 'EQ-005', 3, 'Virtual reality training', NULL, NULL, NULL, 0.00, NULL, '2025-12-10 12:56:01', '2026-01-27 14:45:08', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lost_found`
--

CREATE TABLE `lost_found` (
  `id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `item_type` varchar(100) NOT NULL,
  `status` enum('lost','found','claimed') DEFAULT 'lost',
  `location` varchar(255) DEFAULT NULL,
  `reported_by` varchar(255) NOT NULL,
  `contact_info` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_occurred` date NOT NULL,
  `date_claimed` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `original_module` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lost_found`
--

INSERT INTO `lost_found` (`id`, `title`, `description`, `item_type`, `status`, `location`, `reported_by`, `contact_info`, `timestamp`, `date_occurred`, `date_claimed`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `original_module`) VALUES
('01d81b85-326c-4162-be05-fb56de727107', 'lost cp', 'jjjj', 'other', 'found', 'colb 102 ', 'Cedric Ang', '', '2025-12-23 04:55:16', '2025-12-17', '2025-12-17', '2025-12-17 11:08:11', '2025-12-17 11:15:22', NULL, NULL, NULL),
('0272ea1e-b145-4057-8269-f51d3404551b', 'quasy', 'asasas', 'jewelry', 'found', 'cl 2 station 5', '(admin)', 'test@example.com', '2025-12-21 18:29:00', '2025-12-22', NULL, '2025-12-23 14:27:05', '2025-12-23 14:27:05', NULL, NULL, NULL),
('215cb6fc-170a-4864-a31e-3c8f20e2165e', 'Test Lost Item 2', 'This is another test lost item', 'gadgets', 'found', 'Library', 'Benjie Trozo', 'benjie@example.com', '2025-12-23 03:00:00', '2025-12-23', NULL, '2025-12-23 13:21:46', '2025-12-23 13:21:46', NULL, NULL, NULL),
('4bbbe736-8890-487a-b453-4d93adaf9f8e', 'Test Lost Item', 'This is a test lost item for notification testing', 'other', 'lost', 'Test Location', 'Test User', 'test@example.com', '2025-12-23 02:00:00', '2025-12-23', NULL, '2025-12-23 13:20:41', '2025-12-23 13:20:41', NULL, NULL, NULL),
('6e9241b1-7c1f-4486-bad0-7afac79fb803', 'found a phone', 'lost iphone 17 pro max fully paid have found', 'gadgets', 'found', 'cl 2 station 5', '(admin)', 'test@example.com', '2025-12-21 17:07:00', '2025-12-22', NULL, '2025-12-23 13:07:00', '2025-12-23 13:07:00', NULL, NULL, NULL),
('7ac8954e-aac6-4da1-bf91-e42fcdcce936', 'iphne 17 pro max found', 'nakit-an nako sa ilalom sa pc', 'electronics', 'found', 'cl 5', 'Liejay Jabines', '0992302492', '2025-12-23 04:55:16', '2025-12-16', NULL, '2025-12-16 17:32:43', '2025-12-16 17:32:43', NULL, NULL, NULL),
('7b521a09-2c53-4b6c-9505-56810a6cb0ff', 'iPhone 13', 'Black iPhone 13 with blue case, screen has small crack', 'electronics', 'found', 'Lab A - Desk 5', 'Test User', 'test@example.com', '2025-12-23 04:55:16', '2025-12-16', NULL, '2025-12-16 13:06:40', '2025-12-16 13:06:40', NULL, NULL, NULL),
('7d15e01b-fb72-4c80-bb55-07aab5ffdd99', 'Test Notification', 'Testing WebSocket notifications', 'other', 'lost', 'Test Lab', 'Test Admin', 'test@test.com', '2025-12-23 04:00:00', '2025-12-23', NULL, '2025-12-23 13:22:59', '2025-12-23 13:22:59', NULL, NULL, NULL),
('97d6fd69-6a1e-4274-91a0-41718d361ab4', 'cell phone', 'infinix hot 10i', 'gadgets', 'lost', '', '(admin)', 'test@example.com', '2025-12-21 20:00:00', '2025-12-22', NULL, '2025-12-23 16:23:18', '2026-01-31 03:32:50', NULL, NULL, NULL),
('be588b7c-eb24-4f76-95e3-155d080435e5', 'lost item', 'lost iphone 17 pro max ', 'gadgets', 'lost', '', '(admin)', 'test@example.com', '2025-12-21 20:00:00', '2025-12-22', NULL, '2025-12-23 13:17:10', '2025-12-23 13:17:10', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_settings`
--

CREATE TABLE `maintenance_settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `is_maintenance` tinyint(1) DEFAULT 0,
  `message` text DEFAULT 'System is under maintenance. Please try again later.',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `maintenance_settings`
--

INSERT INTO `maintenance_settings` (`id`, `is_maintenance`, `message`, `updated_at`) VALUES
(1, 1, 'System is under maintenance. Users will be logged out.', '2025-12-16 05:49:22');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `read_status` tinyint(1) DEFAULT 0,
  `action_url` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `data`, `read_status`, `action_url`, `created_at`, `updated_at`) VALUES
('009fa6ee-62da-4065-8a3e-aaad407f6cd2', '9787', 'New Borrow Request', 'Liejay Jabines has requested to borrow 1 x VR Headset', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"468902fe-9e4a-4a89-9553-2eb0a94d5e7f\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"VR Headset\",\"quantity\":1,\"user_id\":9782,\"status\":\"pending\",\"timestamp\":\"2026-01-25 06:51:40\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 1 x VR Headset\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-25 13:51:40', '2026-01-25 13:51:40'),
('0205eedd-a9d4-4c7b-b492-96d74d444fa1', '9784', 'Role Changed', 'Your role has been changed from instructor to admin', 'role_change', '{\"old_role\":\"instructor\",\"new_role\":\"admin\",\"user_name\":\"Melenio\",\"timestamp\":\"2025-12-23T08:59:04.679Z\"}', 0, '/profile', '2025-12-23 16:59:04', '2025-12-23 16:59:04'),
('025f71e4-f60a-4c36-a44f-84bf25ce4ad9', '9787', 'New Borrow Request', 'Liejay Jabines has requested to borrow 1 x VR Headset', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"49b122fe-4ac2-41f6-add4-f4315481ad3c\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"VR Headset\",\"quantity\":1,\"user_id\":9782,\"status\":\"pending\",\"timestamp\":\"2026-01-25 07:00:32\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 1 x VR Headset\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-25 14:00:32', '2026-01-25 14:00:32'),
('0319c7bc-906b-4fdc-ba2e-24501a409275', 'admin_broadcast', 'New Borrow Request', 'benjie.trozo has requested to borrow 1 x Wire Stripper', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"e606b851-6c57-4150-aa1b-2a77a5250509\",\"borrower_name\":\"benjie.trozo\",\"item\":\"Wire Stripper\",\"quantity\":1,\"user_id\":6717,\"status\":\"pending\",\"timestamp\":\"2025-12-18 07:32:13\",\"title\":\"New Borrow Request\",\"message\":\"benjie.trozo has requested to borrow 1 x Wire Stripper\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-18 14:32:13', '2025-12-18 14:32:13'),
('0653c9dc-7c76-4806-9599-013111a8edf8', '9786', 'Borrow Request Updated', 'Borrow request for 1 x 3D Printer has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"3c7206ef-e4c6-43f6-9f20-12c6bd8d39e8\",\"item\":\"3D Printer\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2025-12-23 04:19:06\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x 3D Printer has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 11:19:06', '2025-12-23 11:19:06'),
('067bc671-e5a2-48e0-a6a4-c19c9b5aadbc', '9782', 'Incident Report Submitted', 'Your incident report \'naay buang sa comlab sir\' (other) has been submitted successfully', 'incident_report_submitted', '{\"type\":\"incident_report_submitted\",\"incident_id\":\"928b81c8-1f37-416e-9ee3-a557840a5e56\",\"title\":\"Incident Report Submitted\",\"message\":\"Your incident report \'naay buang sa comlab sir\' (other) has been submitted successfully\",\"incident_title\":\"naay buang sa comlab sir\",\"incident_type\":\"other\",\"timestamp\":\"2025-12-22 15:53:00\",\"actionUrl\":\"\\/incidents\"}', 1, '/incidents', '2025-12-22 22:53:00', '2025-12-23 04:13:43'),
('06e24872-4ada-48bc-8879-4a04aef4694c', '9782', 'Role Changed', 'Your role has been changed from instructor to student', 'role_change', '{\"old_role\":\"instructor\",\"new_role\":\"student\",\"user_name\":\"Liejay\",\"timestamp\":\"2025-12-23T08:15:12.406Z\"}', 1, '/profile', '2025-12-23 16:15:12', '2026-01-25 13:30:11'),
('071ae708-b809-431f-8e49-c9ba68473caf', '9786', 'New Lost & Found Item', 'New lost item reported: lost cp (electronics) at colb 102  by Cedric Ang', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"01d81b85-326c-4162-be05-fb56de727107\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: lost cp (electronics) at colb 102  by Cedric Ang\",\"item_title\":\"lost cp\",\"item_type\":\"electronics\",\"status\":\"lost\",\"location\":\"colb 102 \",\"reported_by\":\"Cedric Ang\",\"timestamp\":\"2025-12-17 04:08:11\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-17 11:08:11', '2025-12-17 11:08:11'),
('075c82aa-cc45-4681-8bf8-20dd528be203', '9787', 'New Borrow Request', 'benjie.trozo@csucc.edu.ph has requested to borrow 1 x Soldering Iron', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"792a47f9-77c8-4b4e-9d04-c64faf062276\",\"borrower_name\":\"benjie.trozo@csucc.edu.ph\",\"item\":\"Soldering Iron\",\"quantity\":1,\"user_id\":6717,\"status\":\"pending\",\"timestamp\":\"2025-12-23 03:13:13\",\"title\":\"New Borrow Request\",\"message\":\"benjie.trozo@csucc.edu.ph has requested to borrow 1 x Soldering Iron\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 10:13:13', '2025-12-23 10:13:13'),
('0b7abd48-5743-4445-9367-afe7fe0e1287', '9787', 'New Borrow Request', 'benjie.trozo@csucc.edu.ph has requested to borrow 1 x 3D Printer', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"69c0d2df-54bb-4648-bf2c-086ccf3788b6\",\"borrower_name\":\"benjie.trozo@csucc.edu.ph\",\"item\":\"3D Printer\",\"quantity\":1,\"user_id\":6717,\"status\":\"pending\",\"timestamp\":\"2025-12-23 09:36:43\",\"title\":\"New Borrow Request\",\"message\":\"benjie.trozo@csucc.edu.ph has requested to borrow 1 x 3D Printer\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 16:36:43', '2025-12-23 16:36:43'),
('0c03fe41-4e9e-4a65-8bcf-6e626ba1e36c', '9786', 'Borrow Request Updated', 'Borrow request for 1 x Soldering Iron has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"7c43819d-c1e2-4f23-8d73-0a98dcdfc6c6\",\"item\":\"Soldering Iron\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2026-01-27 17:02:55\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x Soldering Iron has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-28 00:02:55', '2026-01-28 00:02:55'),
('0c6c6182-9d7f-45fa-bac0-bb0f427c2543', '9787', 'New Incident Report', 'New incident reported: Test Incident (software - low) at Test Lab by Benjie Trozo', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"edc1afb1-dcee-47e4-a0ad-a49e6691e975\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: Test Incident (software - low) at Test Lab by Benjie Trozo\",\"incident_title\":\"Test Incident\",\"incident_type\":\"software\",\"severity\":\"low\",\"location\":\"Test Lab\",\"reported_by\":\"Benjie Trozo\",\"hardware_type\":\"\",\"hardware_damage\":\"\",\"timestamp\":\"2025-12-23 06:24:45\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 13:24:45', '2025-12-23 13:24:45'),
('1036c0fb-88c5-4b03-8fc8-9577d3df7cee', '9784', 'Role Changed', 'Your role has been changed from admin to instructor', 'role_change', '{\"old_role\":\"admin\",\"new_role\":\"instructor\",\"user_name\":\"Melenio\",\"timestamp\":\"2025-12-23T04:32:21.696Z\"}', 1, '/profile', '2025-12-23 12:32:21', '2025-12-23 15:37:24'),
('111bf374-d65e-47b1-983d-125299fe724f', '9787', 'Item Return Processed', 'Your return of 1 x Oscilloscope has been processed. Condition: good', 'borrow_return_processed', '{\"type\":\"borrow_return_processed\",\"borrow_record_id\":\"353152c7-d5cb-45a6-a142-2d4cbda3556d\",\"item\":\"Oscilloscope\",\"quantity\":1,\"return_condition\":\"good\",\"return_comments\":\"asasas\",\"user_id\":9787,\"timestamp\":\"2026-01-27 15:45:15\",\"title\":\"Item Return Processed\",\"message\":\"Your return of 1 x Oscilloscope has been processed. Condition: good\",\"actionUrl\":\"\\/my-borrows\"}', 0, '/my-borrows', '2026-01-27 22:45:15', '2026-01-27 22:45:15'),
('11e7312e-c417-4f22-8df1-166258eb4fcb', '9787', 'New Incident Report', 'New incident reported: broken system unit (hardware - medium) - computer: not working by (admin)', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"2b86b527-eea8-4dd5-bc54-403421e7510c\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: broken system unit (hardware - medium) - computer: not working by (admin)\",\"incident_title\":\"broken system unit\",\"incident_type\":\"hardware\",\"severity\":\"medium\",\"location\":\"\",\"reported_by\":\"(admin)\",\"hardware_type\":\"computer\",\"hardware_damage\":\"not working\",\"timestamp\":\"2025-12-23 09:13:02\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 16:13:02', '2025-12-23 16:13:02'),
('122a958e-f6e4-4f5b-8281-e47ccb25f008', '9787', 'Borrow Request Updated', 'Borrow request for 1 x 3D Printer has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"3c7206ef-e4c6-43f6-9f20-12c6bd8d39e8\",\"item\":\"3D Printer\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2025-12-23 04:19:06\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x 3D Printer has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 11:19:06', '2025-12-23 11:19:06'),
('1386351f-3ca6-483f-8a4a-accc0967b7cd', '9786', 'New Borrow Request', 'Liejay Jabines has requested to borrow 1 x VR Headset', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"4e8525de-61b7-46f3-98e1-57b2f8cd2d09\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"VR Headset\",\"quantity\":1,\"user_id\":9782,\"status\":\"pending\",\"timestamp\":\"2025-12-23 09:51:11\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 1 x VR Headset\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 16:51:11', '2025-12-23 16:51:11'),
('152da2f6-567f-4f96-9cf9-15652e82c599', '9786', 'New Lost & Found Item', 'New lost item reported: Test Lost Item (other) at Test Location by Test User - Dec 23, 2025 10:00 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"4bbbe736-8890-487a-b453-4d93adaf9f8e\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: Test Lost Item (other) at Test Location by Test User - Dec 23, 2025 10:00 AM\",\"item_title\":\"Test Lost Item\",\"item_type\":\"other\",\"status\":\"lost\",\"location\":\"Test Location\",\"reported_by\":\"Test User\",\"timestamp\":\"2025-12-23T10:00:00\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:20:41', '2025-12-23 13:20:41'),
('158e6bc6-1fd9-436b-ac0c-20b2350f5c0c', '9786', 'New Borrow Request', 'Liejay Jabines has requested to borrow 1 x VR Headset', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"49b122fe-4ac2-41f6-add4-f4315481ad3c\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"VR Headset\",\"quantity\":1,\"user_id\":9782,\"status\":\"pending\",\"timestamp\":\"2026-01-25 07:00:32\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 1 x VR Headset\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-25 14:00:32', '2026-01-25 14:00:32'),
('1719e964-f545-45ad-9261-c1c760ea1e97', '9786', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin) - Dec 22, 2025 2:07 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"6e9241b1-7c1f-4486-bad0-7afac79fb803\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin) - Dec 22, 2025 2:07 AM\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T01:07:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:07:02', '2025-12-23 13:07:02'),
('19fe902b-322f-42d6-ae69-a7168c74f67d', '9783', 'New Incident Report', 'New incident reported: n (network - medium) at h by Cedric Ang', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"0e8652e1-b07b-4683-99f9-b2054b0eac06\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: n (network - medium) at h by Cedric Ang\",\"incident_title\":\"n\",\"incident_type\":\"network\",\"severity\":\"medium\",\"location\":\"h\",\"reported_by\":\"Cedric Ang\",\"timestamp\":\"2025-12-17 04:01:29\",\"actionUrl\":\"\\/incidents\"}', 1, '/incidents', '2025-12-17 11:01:29', '2026-01-31 04:30:13'),
('1c1b50b4-d6e2-4cf1-8237-227eb28951d6', '9787', 'Item Return Processed', 'Your return of 1 x Multimeter has been processed. Condition: good', 'borrow_return_processed', '{\"type\":\"borrow_return_processed\",\"borrow_record_id\":\"485161c2-ab4e-4e99-ab14-0f046511d85e\",\"item\":\"Multimeter\",\"quantity\":1,\"return_condition\":\"good\",\"return_comments\":\"sasasa\",\"user_id\":9787,\"timestamp\":\"2026-01-27 15:45:18\",\"title\":\"Item Return Processed\",\"message\":\"Your return of 1 x Multimeter has been processed. Condition: good\",\"actionUrl\":\"\\/my-borrows\"}', 0, '/my-borrows', '2026-01-27 22:45:18', '2026-01-27 22:45:18'),
('1cbab297-4ba0-469c-b929-1e3630f58b1e', '9787', 'Item Needs Repair', 'Multimeter returned with condition: needs_repair by Cedric Ang (ID: 2022-0464). Comments: ', 'repair_needed', '{\"type\":\"repair_needed\",\"borrow_record_id\":\"7d98423d-b384-48f8-bb77-0cbd35f389c2\",\"item\":\"Multimeter\",\"quantity\":1,\"condition\":\"needs_repair\",\"comments\":\"\",\"borrower_name\":\"Cedric Ang (ID: 2022-0464)\",\"borrower_id_number\":\"2022-0464\",\"user_id\":9787,\"timestamp\":\"2025-12-22 16:37:04\",\"title\":\"Item Needs Repair\",\"message\":\"Multimeter returned with condition: needs_repair by Cedric Ang (ID: 2022-0464). Comments: \",\"actionUrl\":\"\\/maintenance\"}', 0, '/maintenance', '2025-12-22 23:37:04', '2025-12-22 23:37:04'),
('1e4705cc-6cca-4463-8fa1-35cefea332f3', 'admin_broadcast', 'Borrow Request Updated', 'Borrow request for 1 x Multimeter has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"ac06e5c5-986b-4976-b12c-60d77347c35a\",\"item\":\"Multimeter\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2025-12-18 06:29:38\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x Multimeter has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-18 13:29:38', '2025-12-18 13:29:38'),
('1ee7d51c-1627-4a68-a024-494a93ad0f32', '9787', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin) - Dec 22, 2025 2:07 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"6e9241b1-7c1f-4486-bad0-7afac79fb803\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin) - Dec 22, 2025 2:07 AM\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T01:07:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:07:02', '2025-12-23 13:07:02'),
('1fb9451b-1fe7-4470-a132-96c672674510', '9787', 'New Borrow Request', 'Liejay Jabines has requested to borrow 1 x 3D Printer', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"d9fd21bd-776c-48ec-9ab2-b24f6c6f40b8\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"3D Printer\",\"quantity\":1,\"user_id\":9782,\"status\":\"pending\",\"timestamp\":\"2025-12-23 09:37:24\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 1 x 3D Printer\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 16:37:24', '2025-12-23 16:37:24'),
('2036e608-db14-49e8-8dd1-32e311666ce8', '9786', 'New Lost & Found Item', 'New found item reported: cell phone (gadgets) at col 5 by (admin) - Dec 23, 2025 12:25 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"2f81c45c-e2a5-4ea6-b794-9a01092f386d\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: cell phone (gadgets) at col 5 by (admin) - Dec 23, 2025 12:25 AM\",\"item_title\":\"cell phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"col 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T23:25:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 16:26:52', '2025-12-23 16:26:52'),
('210d4031-a7e3-4be9-9dec-9ecc4cf9eb7c', 'admin_broadcast', 'Borrow Request Updated', 'Borrow request for 1 x Wire Stripper has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"e606b851-6c57-4150-aa1b-2a77a5250509\",\"item\":\"Wire Stripper\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2025-12-18 07:32:19\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x Wire Stripper has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-18 14:32:19', '2025-12-18 14:32:19'),
('2119de15-57fa-4db2-92e2-b0a5190592eb', '9786', 'New Lost & Found Item', 'New lost item reported: cell phone (gadgets) by (admin) - Dec 22, 2025 5:00 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"97d6fd69-6a1e-4274-91a0-41718d361ab4\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: cell phone (gadgets) by (admin) - Dec 22, 2025 5:00 AM\",\"item_title\":\"cell phone\",\"item_type\":\"gadgets\",\"status\":\"lost\",\"location\":\"\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T04:00:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 16:23:18', '2025-12-23 16:23:18'),
('2392d945-4bef-4b8e-9960-c8808d129628', '9782', 'Borrow Request Approved', 'Your borrow request for 1 x VR Headset has been approved', 'borrow_status_update', '{\"type\":\"borrow_status_update\",\"request_id\":\"670574f0-8b0d-4813-8b48-6884f2738f7a\",\"item\":\"VR Headset\",\"quantity\":1,\"return_date\":null,\"old_status\":\"pending\",\"new_status\":\"approved\",\"rejection_reason\":\"\",\"user_id\":9782,\"timestamp\":\"2026-01-25 08:47:39\",\"title\":\"Borrow Request Approved\",\"message\":\"Your borrow request for 1 x VR Headset has been approved\",\"actionUrl\":\"\\/my-requests\"}', 1, '/my-requests', '2026-01-25 15:47:39', '2026-01-28 02:34:37'),
('240618f9-952d-4b8a-b79d-2d6e1c7f9233', 'admin_broadcast', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"9903b296-db16-4d98-8867-6a733d0ea114\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-23 06:03:27\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:03:27', '2025-12-23 13:03:27'),
('265f815b-ba62-4582-b823-6632116167d6', '9787', 'Item Return Processed', 'Your return of 1 x Multimeter has been processed. Condition: needs_repair', 'borrow_return_processed', '{\"type\":\"borrow_return_processed\",\"borrow_record_id\":\"7d98423d-b384-48f8-bb77-0cbd35f389c2\",\"item\":\"Multimeter\",\"quantity\":1,\"return_condition\":\"needs_repair\",\"return_comments\":\"\",\"user_id\":9787,\"timestamp\":\"2025-12-22 16:37:04\",\"title\":\"Item Return Processed\",\"message\":\"Your return of 1 x Multimeter has been processed. Condition: needs_repair\",\"actionUrl\":\"\\/my-borrows\"}', 0, '/my-borrows', '2025-12-22 23:37:04', '2025-12-22 23:37:04'),
('2688b76e-3b82-4d22-bbc8-7017b9f51af9', 'admin_broadcast', 'New Lost & Found Item', 'New found item reported: cell phone (gadgets) at col 5 by (admin) - Dec 23, 2025 12:25 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"2f81c45c-e2a5-4ea6-b794-9a01092f386d\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: cell phone (gadgets) at col 5 by (admin) - Dec 23, 2025 12:25 AM\",\"item_title\":\"cell phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"col 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T23:25:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 16:26:52', '2025-12-23 16:26:52'),
('286492c0-b578-4b30-9c2e-090db1045f09', '9782', 'Borrow Request Rejected', 'Your borrow request for 1 x VR Headset has been rejected', 'borrow_status_update', '{\"type\":\"borrow_status_update\",\"request_id\":\"4e8525de-61b7-46f3-98e1-57b2f8cd2d09\",\"item\":\"VR Headset\",\"quantity\":1,\"return_date\":\"2025-12-24\",\"old_status\":\"pending\",\"new_status\":\"rejected\",\"rejection_reason\":\"\",\"user_id\":9782,\"timestamp\":\"2026-01-25 14:08:12\",\"title\":\"Borrow Request Rejected\",\"message\":\"Your borrow request for 1 x VR Headset has been rejected\",\"actionUrl\":\"\\/my-requests\"}', 1, '/my-requests', '2026-01-25 21:08:12', '2026-01-28 02:34:37'),
('2a0adb2f-ad23-46a8-bf2d-7869e0ad4749', '9787', 'Borrow Request Updated', 'Borrow request for 1 x VR Headset has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"49b122fe-4ac2-41f6-add4-f4315481ad3c\",\"item\":\"VR Headset\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2026-01-25 07:01:27\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x VR Headset has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-25 14:01:27', '2026-01-25 14:01:27'),
('2b986b23-0861-4a99-9c68-44f6a6d9bbe7', '9787', 'New Borrow Request', 'Melenio Caturan has requested to borrow 1 x Soldering Iron', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"7c43819d-c1e2-4f23-8d73-0a98dcdfc6c6\",\"borrower_name\":\"Melenio Caturan\",\"item\":\"Soldering Iron\",\"quantity\":1,\"user_id\":9784,\"status\":\"pending\",\"timestamp\":\"2025-12-23 08:37:52\",\"title\":\"New Borrow Request\",\"message\":\"Melenio Caturan has requested to borrow 1 x Soldering Iron\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 15:37:52', '2025-12-23 15:37:52'),
('2ccdf522-8bb0-415f-9113-91f6b659ffd0', 'admin_broadcast', 'New Lost & Found Item', 'New lost item reported: Test Notification (other) at Test Lab by Test Admin - Dec 23, 2025 12:00 PM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"7d15e01b-fb72-4c80-bb55-07aab5ffdd99\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: Test Notification (other) at Test Lab by Test Admin - Dec 23, 2025 12:00 PM\",\"item_title\":\"Test Notification\",\"item_type\":\"other\",\"status\":\"lost\",\"location\":\"Test Lab\",\"reported_by\":\"Test Admin\",\"timestamp\":\"2025-12-23T12:00:00\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:22:59', '2025-12-23 13:22:59'),
('2d0c2d6b-0e74-4145-a89d-03f8d7d17d47', '9787', 'Borrow Request Approved', 'Your borrow request for 1 x Oscilloscope has been approved', 'borrow_status_update', '{\"type\":\"borrow_status_update\",\"request_id\":\"28f9917a-82d0-46b1-be2a-caba36ec77c4\",\"item\":\"Oscilloscope\",\"quantity\":1,\"return_date\":null,\"old_status\":\"pending\",\"new_status\":\"approved\",\"rejection_reason\":\"\",\"user_id\":9787,\"timestamp\":\"2025-12-17 06:29:52\",\"title\":\"Borrow Request Approved\",\"message\":\"Your borrow request for 1 x Oscilloscope has been approved\",\"actionUrl\":\"\\/my-requests\"}', 1, '/my-requests', '2025-12-17 13:29:52', '2025-12-17 13:30:42'),
('2f161f86-a9b7-4ea9-8507-81e87d7fb86c', 'admin_broadcast', 'New Incident Report', 'New incident reported: Broken monitor (hardware - medium) at col5 by Melenio Caturan (instructor)', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"85fbd95a-e690-47cc-89f7-aa0204b591f7\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: Broken monitor (hardware - medium) at col5 by Melenio Caturan (instructor)\",\"incident_title\":\"Broken monitor\",\"incident_type\":\"hardware\",\"severity\":\"medium\",\"location\":\"col5\",\"reported_by\":\"Melenio Caturan (instructor)\",\"timestamp\":\"2025-12-23 05:47:42\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 12:47:42', '2025-12-23 12:47:42'),
('312e7d1f-c7db-4819-a6e2-edf10800125a', 'admin_broadcast', 'Borrow Request Updated', 'Borrow request for 3 x Screwdriver Set has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"db5e47a1-4af0-4c32-867c-955ba62dc7bd\",\"item\":\"Screwdriver Set\",\"quantity\":3,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2025-12-17 05:14:12\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 3 x Screwdriver Set has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-17 12:14:12', '2025-12-17 12:14:12'),
('35decc78-0693-4708-a6d1-2243d9c4ddb1', '9784', 'Role Changed', 'Your role has been changed from instructor to admin', 'role_change', '{\"old_role\":\"instructor\",\"new_role\":\"admin\",\"user_name\":\"Melenio\",\"timestamp\":\"2025-12-23T04:33:06.848Z\"}', 1, '/profile', '2025-12-23 12:33:06', '2025-12-23 15:37:24'),
('38d63e39-ca46-44f8-8751-8e0010aa1ec5', '9787', 'New Incident Report', 'New incident reported: jashausg (hardware - high) - monitor: asas at comlab 1 by Melenio Caturan (instructor)', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"8596a0a4-698a-4ad0-b9ee-5a9b83eea98e\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: jashausg (hardware - high) - monitor: asas at comlab 1 by Melenio Caturan (instructor)\",\"incident_title\":\"jashausg\",\"incident_type\":\"hardware\",\"severity\":\"high\",\"location\":\"comlab 1\",\"reported_by\":\"Melenio Caturan (instructor)\",\"hardware_type\":\"monitor\",\"hardware_damage\":\"asas\",\"timestamp\":\"2025-12-23 07:25:48\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 14:25:49', '2025-12-23 14:25:49'),
('39bb9250-be25-4b6f-a926-0b1238f714ca', '9786', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"7bfc48c9-037d-4d33-84fd-95bcef945cf5\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-23 06:03:26\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:03:28', '2025-12-23 13:03:28'),
('3b8c8528-3127-43eb-aecb-020a363a3ed7', '9786', 'Item Needs Repair', 'Multimeter returned with condition: damaged by benjie.trozo (ID: 2022-1010). Comments: ', 'repair_needed', '{\"type\":\"repair_needed\",\"borrow_record_id\":\"80bbbe0a-1eca-4218-95fa-471099c083f1\",\"item\":\"Multimeter\",\"quantity\":1,\"condition\":\"damaged\",\"comments\":\"\",\"borrower_name\":\"benjie.trozo (ID: 2022-1010)\",\"borrower_id_number\":\"2022-1010\",\"user_id\":9786,\"timestamp\":\"2025-12-22 16:35:48\",\"title\":\"Item Needs Repair\",\"message\":\"Multimeter returned with condition: damaged by benjie.trozo (ID: 2022-1010). Comments: \",\"actionUrl\":\"\\/maintenance\"}', 0, '/maintenance', '2025-12-22 23:35:48', '2025-12-22 23:35:48'),
('3c633a9b-fc7f-40b4-8885-f7847315331f', 'admin_broadcast', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"cd1c77b9-60d1-41c4-94b1-8da9e8d20b2b\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-23 06:03:27\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:03:27', '2025-12-23 13:03:27'),
('40c515ee-894b-4c33-ab2e-8aed8e27daa6', 'admin_broadcast', 'New Borrow Request', 'benjie.trozo has requested to borrow 1 x 3D Printer', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"b517e8a3-e00c-406d-aea1-f12bcb870c94\",\"borrower_name\":\"benjie.trozo\",\"item\":\"3D Printer\",\"quantity\":1,\"user_id\":6717,\"status\":\"pending\",\"timestamp\":\"2025-12-18 07:20:48\",\"title\":\"New Borrow Request\",\"message\":\"benjie.trozo has requested to borrow 1 x 3D Printer\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-18 14:20:48', '2025-12-18 14:20:48'),
('43f3e1d2-022e-4925-8340-a0187602c3ca', '9787', 'Item Needs Repair', 'Screwdriver Set returned with condition: needs_repair. Comments: ', 'repair_needed', '{\"type\":\"repair_needed\",\"borrow_record_id\":\"072ad8d8-64ce-457a-862a-b12fe6df3b48\",\"item\":\"Screwdriver Set\",\"quantity\":1,\"condition\":\"needs_repair\",\"comments\":\"\",\"borrower_name\":\"\",\"user_id\":9787,\"timestamp\":\"2025-12-22 16:29:36\",\"title\":\"Item Needs Repair\",\"message\":\"Screwdriver Set returned with condition: needs_repair. Comments: \",\"actionUrl\":\"\\/maintenance\"}', 0, '/maintenance', '2025-12-22 23:29:36', '2025-12-22 23:29:36'),
('440ea09f-b675-4387-802a-d6c1ba51bc97', '9782', 'Borrow Request Approved', 'Your borrow request for 1 x VR Headset has been approved', 'borrow_status_update', '{\"type\":\"borrow_status_update\",\"request_id\":\"468902fe-9e4a-4a89-9553-2eb0a94d5e7f\",\"item\":\"VR Headset\",\"quantity\":1,\"return_date\":null,\"old_status\":\"pending\",\"new_status\":\"approved\",\"rejection_reason\":\"\",\"user_id\":9782,\"timestamp\":\"2026-01-25 08:48:00\",\"title\":\"Borrow Request Approved\",\"message\":\"Your borrow request for 1 x VR Headset has been approved\",\"actionUrl\":\"\\/my-requests\"}', 1, '/my-requests', '2026-01-25 15:48:00', '2026-01-25 16:11:07'),
('4452a4aa-aac7-4e5c-a672-fd495dc1ce1a', '9786', 'Borrow Request Updated', 'Borrow request for 1 x Soldering Iron has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"792a47f9-77c8-4b4e-9d04-c64faf062276\",\"item\":\"Soldering Iron\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2025-12-23 03:14:20\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x Soldering Iron has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 10:14:20', '2025-12-23 10:14:20'),
('449f63a7-2b33-48e6-aab8-c892c23caaec', '9787', 'New Incident Report', 'New incident reported: Broken monitor (hardware - medium) at col5 by Melenio Caturan (instructor)', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"85fbd95a-e690-47cc-89f7-aa0204b591f7\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: Broken monitor (hardware - medium) at col5 by Melenio Caturan (instructor)\",\"incident_title\":\"Broken monitor\",\"incident_type\":\"hardware\",\"severity\":\"medium\",\"location\":\"col5\",\"reported_by\":\"Melenio Caturan (instructor)\",\"timestamp\":\"2025-12-23 05:47:42\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 12:47:44', '2025-12-23 12:47:44'),
('465f63d1-ee97-4d9f-9f0a-78d297748192', '9786', 'New Incident Report', 'New incident reported: Broken monitor (hardware - medium) at col5 by Melenio Caturan (instructor)', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"85fbd95a-e690-47cc-89f7-aa0204b591f7\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: Broken monitor (hardware - medium) at col5 by Melenio Caturan (instructor)\",\"incident_title\":\"Broken monitor\",\"incident_type\":\"hardware\",\"severity\":\"medium\",\"location\":\"col5\",\"reported_by\":\"Melenio Caturan (instructor)\",\"timestamp\":\"2025-12-23 05:47:42\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 12:47:44', '2025-12-23 12:47:44'),
('46e2991f-6f68-48a6-83e4-d9131d248d98', '9786', 'New Incident Report', 'New incident reported: jashausg (hardware - high) - monitor: asas at comlab 1 by Melenio Caturan (instructor)', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"8596a0a4-698a-4ad0-b9ee-5a9b83eea98e\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: jashausg (hardware - high) - monitor: asas at comlab 1 by Melenio Caturan (instructor)\",\"incident_title\":\"jashausg\",\"incident_type\":\"hardware\",\"severity\":\"high\",\"location\":\"comlab 1\",\"reported_by\":\"Melenio Caturan (instructor)\",\"hardware_type\":\"monitor\",\"hardware_damage\":\"asas\",\"timestamp\":\"2025-12-23 07:25:48\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 14:25:49', '2025-12-23 14:25:49'),
('47509bdf-975b-42eb-a64d-3c30fa6aeafb', 'admin_broadcast', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"d99c88f5-0702-4984-bd8e-58474fe983a6\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-23 06:03:26\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:03:26', '2025-12-23 13:03:26'),
('49062b2e-6e62-442a-862d-39178ce016f4', '9787', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"7bfc48c9-037d-4d33-84fd-95bcef945cf5\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-23 06:03:26\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:03:28', '2025-12-23 13:03:28'),
('490fc536-3fd9-4427-8005-fc99048cd1c7', '9786', 'Item Needs Repair', 'Multimeter returned with condition: needs_repair by Cedric Ang (ID: 2022-0464). Comments: ', 'repair_needed', '{\"type\":\"repair_needed\",\"borrow_record_id\":\"7d98423d-b384-48f8-bb77-0cbd35f389c2\",\"item\":\"Multimeter\",\"quantity\":1,\"condition\":\"needs_repair\",\"comments\":\"\",\"borrower_name\":\"Cedric Ang (ID: 2022-0464)\",\"borrower_id_number\":\"2022-0464\",\"user_id\":9786,\"timestamp\":\"2025-12-22 16:37:04\",\"title\":\"Item Needs Repair\",\"message\":\"Multimeter returned with condition: needs_repair by Cedric Ang (ID: 2022-0464). Comments: \",\"actionUrl\":\"\\/maintenance\"}', 0, '/maintenance', '2025-12-22 23:37:04', '2025-12-22 23:37:04'),
('4987f715-7e44-49ce-a683-74fe028fe747', '9787', 'Borrow Request Updated', 'Borrow request for 1 x Soldering Iron has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"7c43819d-c1e2-4f23-8d73-0a98dcdfc6c6\",\"item\":\"Soldering Iron\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2026-01-27 17:02:55\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x Soldering Iron has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-28 00:02:55', '2026-01-28 00:02:55'),
('4a945b4b-7c8c-45c9-b525-6b221910fa67', '9787', 'New Borrow Request', 'Liejay Jabines has requested to borrow 1 x 3D Printer', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"9a6a02c3-3ead-4770-989b-5e5558f0b4a1\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"3D Printer\",\"quantity\":1,\"user_id\":9782,\"status\":\"pending\",\"timestamp\":\"2025-12-22 20:59:51\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 1 x 3D Printer\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 03:59:51', '2025-12-23 03:59:51'),
('4bf47533-a704-45c4-bcec-182cb85841c7', '9786', 'New Borrow Request', 'benjie.trozo@csucc.edu.ph has requested to borrow 1 x 3D Printer', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"69c0d2df-54bb-4648-bf2c-086ccf3788b6\",\"borrower_name\":\"benjie.trozo@csucc.edu.ph\",\"item\":\"3D Printer\",\"quantity\":1,\"user_id\":6717,\"status\":\"pending\",\"timestamp\":\"2025-12-23 09:36:43\",\"title\":\"New Borrow Request\",\"message\":\"benjie.trozo@csucc.edu.ph has requested to borrow 1 x 3D Printer\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 16:36:43', '2025-12-23 16:36:43'),
('4da5b9fa-f7ea-449e-a675-bc002efef2de', '9786', 'Borrow Request Updated', 'Borrow request for 1 x 3D Printer has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"d9fd21bd-776c-48ec-9ab2-b24f6c6f40b8\",\"item\":\"3D Printer\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2025-12-23 09:38:12\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x 3D Printer has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 16:38:12', '2025-12-23 16:38:12'),
('51c28268-dc99-4794-9a65-61883ea42bb3', '9787', 'Borrow Request Updated', 'Borrow request for 1 x VR Headset has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"670574f0-8b0d-4813-8b48-6884f2738f7a\",\"item\":\"VR Headset\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2026-01-25 08:47:39\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x VR Headset has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-25 15:47:39', '2026-01-25 15:47:39'),
('521a6959-ee71-4b21-b5f4-13bece865338', 'admin_broadcast', 'New Incident Report', 'New incident reported: asasas (hardware - critical) - computer: gi inom ni kerby ang ink by (admin)', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"fa2a76da-9dde-49f8-bada-aef765aa66b7\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: asasas (hardware - critical) - computer: gi inom ni kerby ang ink by (admin)\",\"incident_title\":\"asasas\",\"incident_type\":\"hardware\",\"severity\":\"critical\",\"location\":\"\",\"reported_by\":\"(admin)\",\"hardware_type\":\"computer\",\"hardware_damage\":\"gi inom ni kerby ang ink\",\"timestamp\":\"2025-12-23 06:43:05\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 13:43:05', '2025-12-23 13:43:05'),
('549d42e9-5352-4d49-8837-8b9fedea4721', '9787', 'New Incident Report', 'New incident reported: naay buang sa comlab sir (other - critical) at cl 5 by Liejay Jabines', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"928b81c8-1f37-416e-9ee3-a557840a5e56\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: naay buang sa comlab sir (other - critical) at cl 5 by Liejay Jabines\",\"incident_title\":\"naay buang sa comlab sir\",\"incident_type\":\"other\",\"severity\":\"critical\",\"location\":\"cl 5\",\"reported_by\":\"Liejay Jabines\",\"timestamp\":\"2025-12-22 15:52:59\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-22 22:53:00', '2025-12-22 22:53:00'),
('55a0a09d-96c5-4256-abde-883d632cc3a1', '9787', 'Borrow Request Updated', 'Borrow request for 1 x 3D Printer has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"d9fd21bd-776c-48ec-9ab2-b24f6c6f40b8\",\"item\":\"3D Printer\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2025-12-23 09:38:12\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x 3D Printer has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 16:38:12', '2025-12-23 16:38:12'),
('55ace562-098f-42ed-afef-e9786accbb28', '9787', 'New Lost & Found Item', 'New lost item reported: cell phone (gadgets) by (admin) - Dec 22, 2025 5:00 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"97d6fd69-6a1e-4274-91a0-41718d361ab4\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: cell phone (gadgets) by (admin) - Dec 22, 2025 5:00 AM\",\"item_title\":\"cell phone\",\"item_type\":\"gadgets\",\"status\":\"lost\",\"location\":\"\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T04:00:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 16:23:18', '2025-12-23 16:23:18'),
('577ed8c7-9e49-4196-aff1-7583d33089d1', '9782', 'Item Return Processed', 'Your return of 1 x VR Headset has been processed. Condition: good', 'borrow_return_processed', '{\"type\":\"borrow_return_processed\",\"borrow_record_id\":\"738ecf7b-0590-4954-924a-04b4e417741a\",\"item\":\"VR Headset\",\"quantity\":1,\"return_condition\":\"good\",\"return_comments\":\"asas\",\"user_id\":9782,\"timestamp\":\"2026-01-27 15:38:40\",\"title\":\"Item Return Processed\",\"message\":\"Your return of 1 x VR Headset has been processed. Condition: good\",\"actionUrl\":\"\\/my-borrows\"}', 1, '/my-borrows', '2026-01-27 22:38:40', '2026-01-28 02:34:37'),
('57db0662-c6d8-4928-a4d1-b06c409922e7', '9787', 'Borrow Request Updated', 'Borrow request for 1 x VR Headset has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"468902fe-9e4a-4a89-9553-2eb0a94d5e7f\",\"item\":\"VR Headset\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2026-01-25 08:48:00\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x VR Headset has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-25 15:48:00', '2026-01-25 15:48:00'),
('58a7eced-2b8a-4b31-bea4-707bbfc72be3', '9782', 'Item Return Processed', 'Your return of 1 x VR Headset has been processed. Condition: good', 'borrow_return_processed', '{\"type\":\"borrow_return_processed\",\"borrow_record_id\":\"5d67b7d0-9e7e-4814-bcb2-ef7efff303d1\",\"item\":\"VR Headset\",\"quantity\":1,\"return_condition\":\"good\",\"return_comments\":\"asas\",\"user_id\":9782,\"timestamp\":\"2026-01-27 15:45:08\",\"title\":\"Item Return Processed\",\"message\":\"Your return of 1 x VR Headset has been processed. Condition: good\",\"actionUrl\":\"\\/my-borrows\"}', 1, '/my-borrows', '2026-01-27 22:45:08', '2026-01-28 02:34:37'),
('59d65f60-3b1a-4457-8c66-59ea521740c0', '9783', 'New Incident Report', 'New incident reported: colb102_pc10 (hardware - critical) at COLB_102 by Cedric Ang', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"0d73c32c-5c31-4c90-af1b-8323b0c6f014\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: colb102_pc10 (hardware - critical) at COLB_102 by Cedric Ang\",\"incident_title\":\"colb102_pc10\",\"incident_type\":\"hardware\",\"severity\":\"critical\",\"location\":\"COLB_102\",\"reported_by\":\"Cedric Ang\",\"timestamp\":\"2025-12-17 03:46:43\",\"actionUrl\":\"\\/incidents\"}', 1, '/incidents', '2025-12-17 10:46:43', '2026-01-31 04:30:13'),
('59f4ad64-252e-4937-8ae8-15bc8d2f01cc', '9784', 'Borrow Request Approved', 'Your borrow request for 1 x 3D Printer has been approved', 'borrow_status_update', '{\"type\":\"borrow_status_update\",\"request_id\":\"3c7206ef-e4c6-43f6-9f20-12c6bd8d39e8\",\"item\":\"3D Printer\",\"quantity\":1,\"return_date\":null,\"old_status\":\"pending\",\"new_status\":\"approved\",\"rejection_reason\":\"\",\"user_id\":9784,\"timestamp\":\"2025-12-23 04:19:06\",\"title\":\"Borrow Request Approved\",\"message\":\"Your borrow request for 1 x 3D Printer has been approved\",\"actionUrl\":\"\\/my-requests\"}', 1, '/my-requests', '2025-12-23 11:19:06', '2025-12-23 11:23:26'),
('5a01f284-2afe-4d60-a0f0-a7aeaf001081', '9787', 'New Borrow Request', 'Liejay Jabines has requested to borrow 1 x VR Headset', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"4e8525de-61b7-46f3-98e1-57b2f8cd2d09\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"VR Headset\",\"quantity\":1,\"user_id\":9782,\"status\":\"pending\",\"timestamp\":\"2025-12-23 09:51:11\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 1 x VR Headset\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 16:51:11', '2025-12-23 16:51:11'),
('5ae23f5b-9635-4a3f-bb0a-57355cf2064b', 'admin_broadcast', 'New Borrow Request', 'Cedric Ang has requested to borrow 1 x Multimeter', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"0621ebae-3fad-4c7a-94ae-1f572f56e4c2\",\"borrower_name\":\"Cedric Ang\",\"item\":\"Multimeter\",\"quantity\":1,\"user_id\":9787,\"timestamp\":\"2025-12-17 06:12:48\",\"title\":\"New Borrow Request\",\"message\":\"Cedric Ang has requested to borrow 1 x Multimeter\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-17 13:12:48', '2025-12-17 13:12:48'),
('5c9e43ee-f1ab-4a5d-bc54-f9cb7d53044a', '9786', 'New Incident Report', 'New incident reported: Test Incident (software - low) at Test Lab by Benjie Trozo', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"edc1afb1-dcee-47e4-a0ad-a49e6691e975\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: Test Incident (software - low) at Test Lab by Benjie Trozo\",\"incident_title\":\"Test Incident\",\"incident_type\":\"software\",\"severity\":\"low\",\"location\":\"Test Lab\",\"reported_by\":\"Benjie Trozo\",\"hardware_type\":\"\",\"hardware_damage\":\"\",\"timestamp\":\"2025-12-23 06:24:45\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 13:24:45', '2025-12-23 13:24:45'),
('5d3364ba-52c0-4bd8-b236-33326bb7cd25', '9782', 'Item Return Processed', 'Your return of 1 x 3D Printer has been processed. Condition: good', 'borrow_return_processed', '{\"type\":\"borrow_return_processed\",\"borrow_record_id\":\"42ec740f-9a20-4650-a479-ba2b0af13e98\",\"item\":\"3D Printer\",\"quantity\":1,\"return_condition\":\"good\",\"return_comments\":\"asas\",\"user_id\":9782,\"timestamp\":\"2026-01-27 15:45:24\",\"title\":\"Item Return Processed\",\"message\":\"Your return of 1 x 3D Printer has been processed. Condition: good\",\"actionUrl\":\"\\/my-borrows\"}', 1, '/my-borrows', '2026-01-27 22:45:24', '2026-01-28 02:34:37'),
('5d75f5b8-3250-4884-85d4-da6d217554e8', '9782', 'Item Return Processed', 'Your return of 1 x 3D Printer has been processed. Condition: good', 'borrow_return_processed', '{\"type\":\"borrow_return_processed\",\"borrow_record_id\":\"88361577-272b-4860-854d-0503f1640a11\",\"item\":\"3D Printer\",\"quantity\":1,\"return_condition\":\"good\",\"return_comments\":\"sasas\",\"user_id\":9782,\"timestamp\":\"2026-01-27 15:45:10\",\"title\":\"Item Return Processed\",\"message\":\"Your return of 1 x 3D Printer has been processed. Condition: good\",\"actionUrl\":\"\\/my-borrows\"}', 1, '/my-borrows', '2026-01-27 22:45:10', '2026-01-28 02:34:37'),
('6106fc86-c7c9-42f8-ab07-83215fa266e7', '9786', 'New Borrow Request', 'Liejay Jabines has requested to borrow 1 x 3D Printer', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"9a6a02c3-3ead-4770-989b-5e5558f0b4a1\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"3D Printer\",\"quantity\":1,\"user_id\":9782,\"status\":\"pending\",\"timestamp\":\"2025-12-22 20:59:51\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 1 x 3D Printer\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 03:59:51', '2025-12-23 03:59:51'),
('62571424-8816-4637-8ead-bc8ea378d61d', '9786', 'New Incident Report', 'New incident reported: n (network - medium) at h by Cedric Ang', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"0e8652e1-b07b-4683-99f9-b2054b0eac06\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: n (network - medium) at h by Cedric Ang\",\"incident_title\":\"n\",\"incident_type\":\"network\",\"severity\":\"medium\",\"location\":\"h\",\"reported_by\":\"Cedric Ang\",\"timestamp\":\"2025-12-17 04:01:29\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-17 11:01:29', '2025-12-17 11:01:29'),
('62a76200-6cc9-4a2b-8ebd-b4eb3aa0aefb', '9786', 'New Lost & Found Item', 'New found item reported: Test Lost Item 2 (gadgets) at Library by Benjie Trozo - Dec 23, 2025 11:00 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"215cb6fc-170a-4864-a31e-3c8f20e2165e\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: Test Lost Item 2 (gadgets) at Library by Benjie Trozo - Dec 23, 2025 11:00 AM\",\"item_title\":\"Test Lost Item 2\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"Library\",\"reported_by\":\"Benjie Trozo\",\"timestamp\":\"2025-12-23T11:00:00\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:21:46', '2025-12-23 13:21:46');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `data`, `read_status`, `action_url`, `created_at`, `updated_at`) VALUES
('63ba4b1b-3c1e-44c2-a00b-86f9621efa79', '9787', 'New Lost & Found Item', 'New found item reported: cell phone (gadgets) at col 5 by (admin) - Dec 23, 2025 12:25 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"2f81c45c-e2a5-4ea6-b794-9a01092f386d\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: cell phone (gadgets) at col 5 by (admin) - Dec 23, 2025 12:25 AM\",\"item_title\":\"cell phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"col 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T23:25:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 16:26:52', '2025-12-23 16:26:52'),
('63fac864-1a15-4e24-9090-74d097069eab', '9787', 'New Lost & Found Item', 'New lost item reported: Test Lost Item (other) at Test Location by Test User - Dec 23, 2025 10:00 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"4bbbe736-8890-487a-b453-4d93adaf9f8e\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: Test Lost Item (other) at Test Location by Test User - Dec 23, 2025 10:00 AM\",\"item_title\":\"Test Lost Item\",\"item_type\":\"other\",\"status\":\"lost\",\"location\":\"Test Location\",\"reported_by\":\"Test User\",\"timestamp\":\"2025-12-23T10:00:00\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:20:41', '2025-12-23 13:20:41'),
('65cd461d-7748-436d-859b-1112b5cdb233', '9786', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"9903b296-db16-4d98-8867-6a733d0ea114\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-23 06:03:27\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:03:29', '2025-12-23 13:03:29'),
('65fda705-30e8-48e6-8594-7e1785b617d6', 'admin_broadcast', 'New Lost & Found Item', 'New lost item reported: lost item (gadgets) by (admin) - Dec 22, 2025 5:00 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"be588b7c-eb24-4f76-95e3-155d080435e5\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: lost item (gadgets) by (admin) - Dec 22, 2025 5:00 AM\",\"item_title\":\"lost item\",\"item_type\":\"gadgets\",\"status\":\"lost\",\"location\":\"\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T04:00:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:17:10', '2025-12-23 13:17:10'),
('6798faaa-e383-49c5-af34-a84d436f04b1', '9784', 'Role Changed', 'Your role has been changed from admin to instructor', 'role_change', '{\"old_role\":\"admin\",\"new_role\":\"instructor\",\"user_name\":\"Melenio\",\"timestamp\":\"2025-12-23T04:33:55.628Z\"}', 1, '/profile', '2025-12-23 12:33:55', '2025-12-23 15:37:24'),
('68816312-df6c-4018-91b2-06e39d8252c9', 'admin_broadcast', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin) - Dec 22, 2025 2:07 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"6e9241b1-7c1f-4486-bad0-7afac79fb803\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin) - Dec 22, 2025 2:07 AM\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T01:07:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:07:00', '2025-12-23 13:07:00'),
('69266123-484e-4f94-be2d-70497d694155', '9787', 'New Lost & Found Item', 'New lost item reported: lost item (gadgets) by (admin) - Dec 22, 2025 5:00 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"be588b7c-eb24-4f76-95e3-155d080435e5\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: lost item (gadgets) by (admin) - Dec 22, 2025 5:00 AM\",\"item_title\":\"lost item\",\"item_type\":\"gadgets\",\"status\":\"lost\",\"location\":\"\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T04:00:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:17:12', '2025-12-23 13:17:12'),
('6a1d05ab-cb19-4adc-84c4-a3e9e68f3a96', '9787', 'Borrow Request Approved', 'Your borrow request for 3 x Screwdriver Set has been approved', 'borrow_status_update', '{\"type\":\"borrow_status_update\",\"request_id\":\"db5e47a1-4af0-4c32-867c-955ba62dc7bd\",\"item\":\"Screwdriver Set\",\"quantity\":3,\"return_date\":null,\"old_status\":\"pending\",\"new_status\":\"approved\",\"rejection_reason\":\"\",\"user_id\":9787,\"timestamp\":\"2025-12-17 05:14:12\",\"title\":\"Borrow Request Approved\",\"message\":\"Your borrow request for 3 x Screwdriver Set has been approved\",\"actionUrl\":\"\\/my-requests\"}', 1, '/my-requests', '2025-12-17 12:14:12', '2025-12-17 13:30:42'),
('6a3b4cfd-b486-470d-aaca-869f189ca168', '9786', 'New Borrow Request', 'benjie.trozo@csucc.edu.ph has requested to borrow 1 x Soldering Iron', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"792a47f9-77c8-4b4e-9d04-c64faf062276\",\"borrower_name\":\"benjie.trozo@csucc.edu.ph\",\"item\":\"Soldering Iron\",\"quantity\":1,\"user_id\":6717,\"status\":\"pending\",\"timestamp\":\"2025-12-23 03:13:13\",\"title\":\"New Borrow Request\",\"message\":\"benjie.trozo@csucc.edu.ph has requested to borrow 1 x Soldering Iron\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 10:13:13', '2025-12-23 10:13:13'),
('6b128bf5-96f4-4f35-82ac-c32985993cb2', 'admin_broadcast', 'New Borrow Request', 'Cedric Ang has requested to borrow 3 x Screwdriver Set', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"db5e47a1-4af0-4c32-867c-955ba62dc7bd\",\"borrower_name\":\"Cedric Ang\",\"item\":\"Screwdriver Set\",\"quantity\":3,\"user_id\":9787,\"timestamp\":\"2025-12-17 05:11:53\",\"title\":\"New Borrow Request\",\"message\":\"Cedric Ang has requested to borrow 3 x Screwdriver Set\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-17 12:11:53', '2025-12-17 12:11:53'),
('6e387ea8-a278-4824-a7f3-beb7b4260dc2', 'admin_broadcast', 'Borrow Request Updated', 'Borrow request for 1 x Oscilloscope has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"28f9917a-82d0-46b1-be2a-caba36ec77c4\",\"item\":\"Oscilloscope\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2025-12-17 06:29:52\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x Oscilloscope has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-17 13:29:52', '2025-12-17 13:29:52'),
('706b4357-e78c-4804-a384-010c2bf88ce8', 'admin_broadcast', 'New Lost & Found Item', 'New lost item reported: Test Lost Item (other) at Test Location by Test User - Dec 23, 2025 10:00 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"4bbbe736-8890-487a-b453-4d93adaf9f8e\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: Test Lost Item (other) at Test Location by Test User - Dec 23, 2025 10:00 AM\",\"item_title\":\"Test Lost Item\",\"item_type\":\"other\",\"status\":\"lost\",\"location\":\"Test Location\",\"reported_by\":\"Test User\",\"timestamp\":\"2025-12-23T10:00:00\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:20:41', '2025-12-23 13:20:41'),
('70f9ea4a-c2ca-48a7-98cb-ab20c2d837f5', '9787', 'Item Needs Repair', 'Multimeter returned with condition: damaged by benjie.trozo (ID: 2022-1010). Comments: ', 'repair_needed', '{\"type\":\"repair_needed\",\"borrow_record_id\":\"80bbbe0a-1eca-4218-95fa-471099c083f1\",\"item\":\"Multimeter\",\"quantity\":1,\"condition\":\"damaged\",\"comments\":\"\",\"borrower_name\":\"benjie.trozo (ID: 2022-1010)\",\"borrower_id_number\":\"2022-1010\",\"user_id\":9787,\"timestamp\":\"2025-12-22 16:35:48\",\"title\":\"Item Needs Repair\",\"message\":\"Multimeter returned with condition: damaged by benjie.trozo (ID: 2022-1010). Comments: \",\"actionUrl\":\"\\/maintenance\"}', 0, '/maintenance', '2025-12-22 23:35:48', '2025-12-22 23:35:48'),
('712e6a41-d8f6-492a-a519-8082b240ac27', '9786', 'New Incident Report', 'New incident reported: broken system unit (hardware - medium) - computer: not working by (admin)', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"2b86b527-eea8-4dd5-bc54-403421e7510c\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: broken system unit (hardware - medium) - computer: not working by (admin)\",\"incident_title\":\"broken system unit\",\"incident_type\":\"hardware\",\"severity\":\"medium\",\"location\":\"\",\"reported_by\":\"(admin)\",\"hardware_type\":\"computer\",\"hardware_damage\":\"not working\",\"timestamp\":\"2025-12-23 09:13:02\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 16:13:02', '2025-12-23 16:13:02'),
('7181133b-8a14-43fe-82a6-c4f602ad78a3', '9784', 'Borrow Request Approved', 'Your borrow request for 1 x Soldering Iron has been approved', 'borrow_status_update', '{\"type\":\"borrow_status_update\",\"request_id\":\"7c43819d-c1e2-4f23-8d73-0a98dcdfc6c6\",\"item\":\"Soldering Iron\",\"quantity\":1,\"return_date\":null,\"old_status\":\"pending\",\"new_status\":\"approved\",\"rejection_reason\":\"\",\"user_id\":9784,\"timestamp\":\"2026-01-27 17:02:55\",\"title\":\"Borrow Request Approved\",\"message\":\"Your borrow request for 1 x Soldering Iron has been approved\",\"actionUrl\":\"\\/my-requests\"}', 0, '/my-requests', '2026-01-28 00:02:55', '2026-01-28 00:02:55'),
('758c2f2d-7110-488a-934f-bc1e182bf0dd', '9784', 'Role Changed', 'Your role has been changed from admin to instructor', 'role_change', '{\"old_role\":\"admin\",\"new_role\":\"instructor\",\"user_name\":\"Melenio\",\"timestamp\":\"2025-12-23T04:29:34.678Z\"}', 1, '/profile', '2025-12-23 12:29:34', '2025-12-23 15:37:24'),
('7680eced-ede5-4a0c-8edf-2c202e6e57b1', '9784', 'Item Return Processed', 'Your return of 1 x 3D Printer has been processed. Condition: good', 'borrow_return_processed', '{\"type\":\"borrow_return_processed\",\"borrow_record_id\":\"9320b3f3-3a8e-4f9e-b9b3-508bcb66eeb4\",\"item\":\"3D Printer\",\"quantity\":1,\"return_condition\":\"good\",\"return_comments\":\"\",\"user_id\":9784,\"timestamp\":\"2025-12-23 09:36:24\",\"title\":\"Item Return Processed\",\"message\":\"Your return of 1 x 3D Printer has been processed. Condition: good\",\"actionUrl\":\"\\/my-borrows\"}', 0, '/my-borrows', '2025-12-23 16:36:24', '2025-12-23 16:36:24'),
('76e7d3f5-cca5-4d06-b167-273b8b1057de', 'admin_broadcast', 'New Incident Report', 'New incident reported: naay buang sa comlab sir (other - critical) at cl 5 by Liejay Jabines', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"928b81c8-1f37-416e-9ee3-a557840a5e56\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: naay buang sa comlab sir (other - critical) at cl 5 by Liejay Jabines\",\"incident_title\":\"naay buang sa comlab sir\",\"incident_type\":\"other\",\"severity\":\"critical\",\"location\":\"cl 5\",\"reported_by\":\"Liejay Jabines\",\"timestamp\":\"2025-12-22 15:52:59\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-22 22:52:59', '2025-12-22 22:52:59'),
('77c99814-0654-49c5-bc17-36bd4580003c', 'admin_broadcast', 'New Lost & Found Item', 'New found item reported: Test Lost Item 2 (gadgets) at Library by Benjie Trozo - Dec 23, 2025 11:00 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"215cb6fc-170a-4864-a31e-3c8f20e2165e\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: Test Lost Item 2 (gadgets) at Library by Benjie Trozo - Dec 23, 2025 11:00 AM\",\"item_title\":\"Test Lost Item 2\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"Library\",\"reported_by\":\"Benjie Trozo\",\"timestamp\":\"2025-12-23T11:00:00\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:21:46', '2025-12-23 13:21:46'),
('77dc7918-30f8-4184-b442-42d0c5fcf179', 'admin_broadcast', 'Borrow Request Updated', 'Borrow request for 1 x 3D Printer has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"b517e8a3-e00c-406d-aea1-f12bcb870c94\",\"item\":\"3D Printer\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2025-12-18 07:20:55\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x 3D Printer has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-18 14:20:55', '2025-12-18 14:20:55'),
('79193717-b4da-4591-bfda-7ae7c371c81c', '9786', 'Item Needs Repair', 'Screwdriver Set returned with condition: needs_repair. Comments: ', 'repair_needed', '{\"type\":\"repair_needed\",\"borrow_record_id\":\"072ad8d8-64ce-457a-862a-b12fe6df3b48\",\"item\":\"Screwdriver Set\",\"quantity\":1,\"condition\":\"needs_repair\",\"comments\":\"\",\"borrower_name\":\"\",\"user_id\":9786,\"timestamp\":\"2025-12-22 16:29:36\",\"title\":\"Item Needs Repair\",\"message\":\"Screwdriver Set returned with condition: needs_repair. Comments: \",\"actionUrl\":\"\\/maintenance\"}', 0, '/maintenance', '2025-12-22 23:29:36', '2025-12-22 23:29:36'),
('7d1a4d2d-35a0-42bd-90f9-c52b51893ce8', '9786', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"cd1c77b9-60d1-41c4-94b1-8da9e8d20b2b\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-23 06:03:27\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:03:29', '2025-12-23 13:03:29'),
('80527613-b20a-4107-9559-4aa7317ad6ee', '9786', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"d99c88f5-0702-4984-bd8e-58474fe983a6\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-23 06:03:26\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:03:28', '2025-12-23 13:03:28'),
('861b2063-331e-4b38-979e-6764d5424fa8', '9786', 'New Borrow Request', 'Liejay Jabines has requested to borrow 1 x VR Headset', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"468902fe-9e4a-4a89-9553-2eb0a94d5e7f\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"VR Headset\",\"quantity\":1,\"user_id\":9782,\"status\":\"pending\",\"timestamp\":\"2026-01-25 06:51:40\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 1 x VR Headset\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-25 13:51:40', '2026-01-25 13:51:40'),
('868be201-a218-4d4a-a5b2-71fbdba77d09', '9787', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"9903b296-db16-4d98-8867-6a733d0ea114\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-23 06:03:27\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:03:29', '2025-12-23 13:03:29'),
('87fcce71-a4a6-4d43-8c57-4911657ab004', '9786', 'Borrow Request Updated', 'Borrow request for 1 x VR Headset has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"670574f0-8b0d-4813-8b48-6884f2738f7a\",\"item\":\"VR Headset\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2026-01-25 08:47:39\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x VR Headset has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-25 15:47:39', '2026-01-25 15:47:39'),
('894f9dfa-9e07-4731-b4ff-dac05cf9cf9e', 'admin_broadcast', 'New Incident Report', 'New incident reported: n (network - medium) at h by Cedric Ang', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"0e8652e1-b07b-4683-99f9-b2054b0eac06\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: n (network - medium) at h by Cedric Ang\",\"incident_title\":\"n\",\"incident_type\":\"network\",\"severity\":\"medium\",\"location\":\"h\",\"reported_by\":\"Cedric Ang\",\"timestamp\":\"2025-12-17 04:01:29\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-17 11:01:29', '2025-12-17 11:01:29'),
('8b22ae72-b28b-4f80-b271-e5dea83cd97f', 'admin_broadcast', 'New Incident Report', 'New incident reported: Test Incident (software - low) at Test Lab by Benjie Trozo', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"edc1afb1-dcee-47e4-a0ad-a49e6691e975\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: Test Incident (software - low) at Test Lab by Benjie Trozo\",\"incident_title\":\"Test Incident\",\"incident_type\":\"software\",\"severity\":\"low\",\"location\":\"Test Lab\",\"reported_by\":\"Benjie Trozo\",\"hardware_type\":\"\",\"hardware_damage\":\"\",\"timestamp\":\"2025-12-23 06:24:45\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 13:24:45', '2025-12-23 13:24:45'),
('8bc9af6b-3faa-43b1-930f-6d302fb780bc', '9784', 'Role Changed', 'Your role has been changed from instructor to admin', 'role_change', '{\"old_role\":\"instructor\",\"new_role\":\"admin\",\"user_name\":\"Melenio\",\"timestamp\":\"2025-12-23T04:29:58.247Z\"}', 1, '/profile', '2025-12-23 12:29:58', '2025-12-23 15:37:24'),
('8be86077-9730-4420-a697-985bb0c96fb3', '9787', 'New Lost & Found Item', 'New lost item reported: Test Notification (other) at Test Lab by Test Admin - Dec 23, 2025 12:00 PM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"7d15e01b-fb72-4c80-bb55-07aab5ffdd99\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: Test Notification (other) at Test Lab by Test Admin - Dec 23, 2025 12:00 PM\",\"item_title\":\"Test Notification\",\"item_type\":\"other\",\"status\":\"lost\",\"location\":\"Test Lab\",\"reported_by\":\"Test Admin\",\"timestamp\":\"2025-12-23T12:00:00\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:22:59', '2025-12-23 13:22:59'),
('8e90ec30-7fd5-4d08-b896-d201a3cdef97', '9782', 'Item Return Processed', 'Your return of 1 x 0 has been processed. Condition: good', 'borrow_return_processed', '{\"type\":\"borrow_return_processed\",\"borrow_record_id\":\"7278ddfa-5db0-4855-9df0-ba93f3e9aa5e\",\"item\":\"0\",\"quantity\":1,\"return_condition\":\"good\",\"return_comments\":\"sasasas\",\"user_id\":9782,\"timestamp\":\"2026-01-27 15:45:28\",\"title\":\"Item Return Processed\",\"message\":\"Your return of 1 x 0 has been processed. Condition: good\",\"actionUrl\":\"\\/my-borrows\"}', 1, '/my-borrows', '2026-01-27 22:45:28', '2026-01-28 02:34:37'),
('8e939318-3bbc-43ee-9c67-8e555a6f058c', '9786', 'New Borrow Request', 'Liejay Jabines has requested to borrow 1 x 3D Printer', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"d9fd21bd-776c-48ec-9ab2-b24f6c6f40b8\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"3D Printer\",\"quantity\":1,\"user_id\":9782,\"status\":\"pending\",\"timestamp\":\"2025-12-23 09:37:24\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 1 x 3D Printer\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 16:37:24', '2025-12-23 16:37:24'),
('8f428a0e-86cc-4043-8f62-f06ddad3fca0', '9786', 'New Lost & Found Item', 'New found item reported: quasy (jewelry) at cl 2 station 5 by (admin) - Dec 22, 2025 3:29 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"0272ea1e-b145-4057-8269-f51d3404551b\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: quasy (jewelry) at cl 2 station 5 by (admin) - Dec 22, 2025 3:29 AM\",\"item_title\":\"quasy\",\"item_type\":\"jewelry\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T02:29:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 14:27:05', '2025-12-23 14:27:05'),
('95201dde-9739-43f3-99e6-6300b74577dd', '9782', 'Item Return Processed', 'Your return of 1 x VR Headset has been processed. Condition: good', 'borrow_return_processed', '{\"type\":\"borrow_return_processed\",\"borrow_record_id\":\"5923405c-8fad-4a61-a7ef-f0a7e584a5c9\",\"item\":\"VR Headset\",\"quantity\":1,\"return_condition\":\"good\",\"return_comments\":\"asas\",\"user_id\":9782,\"timestamp\":\"2026-01-27 15:44:43\",\"title\":\"Item Return Processed\",\"message\":\"Your return of 1 x VR Headset has been processed. Condition: good\",\"actionUrl\":\"\\/my-borrows\"}', 1, '/my-borrows', '2026-01-27 22:44:43', '2026-01-28 02:34:37'),
('99c82e6c-b427-4a8f-a934-9f810a540e36', '9786', 'New Lost & Found Item', 'New lost item reported: Test Notification (other) at Test Lab by Test Admin - Dec 23, 2025 12:00 PM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"7d15e01b-fb72-4c80-bb55-07aab5ffdd99\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: Test Notification (other) at Test Lab by Test Admin - Dec 23, 2025 12:00 PM\",\"item_title\":\"Test Notification\",\"item_type\":\"other\",\"status\":\"lost\",\"location\":\"Test Lab\",\"reported_by\":\"Test Admin\",\"timestamp\":\"2025-12-23T12:00:00\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:22:59', '2025-12-23 13:22:59'),
('9c39aaa9-94f8-4ecc-9d2a-166d9d393c56', '9787', 'New Incident Report', 'New incident reported: Final Test Incident (hardware - high) - Laptop: Screen cracked at Computer Lab by Test User', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"3b65c964-e9a8-48dd-984c-930de93f9ebd\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: Final Test Incident (hardware - high) - Laptop: Screen cracked at Computer Lab by Test User\",\"incident_title\":\"Final Test Incident\",\"incident_type\":\"hardware\",\"severity\":\"high\",\"location\":\"Computer Lab\",\"reported_by\":\"Test User\",\"hardware_type\":\"Laptop\",\"hardware_damage\":\"Screen cracked\",\"timestamp\":\"2025-12-23 06:25:06\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 13:25:06', '2025-12-23 13:25:06'),
('9c8de1dc-5273-466d-8ec3-735843e27fb1', '9787', 'Borrow Request Approved', 'Your borrow request for 1 x Multimeter has been approved', 'borrow_status_update', '{\"type\":\"borrow_status_update\",\"request_id\":\"3894565a-2145-4be9-9a74-be88d5e11c99\",\"item\":\"Multimeter\",\"quantity\":1,\"return_date\":null,\"old_status\":\"pending\",\"new_status\":\"approved\",\"rejection_reason\":\"\",\"user_id\":9787,\"timestamp\":\"2025-12-17 05:25:05\",\"title\":\"Borrow Request Approved\",\"message\":\"Your borrow request for 1 x Multimeter has been approved\",\"actionUrl\":\"\\/my-requests\"}', 1, '/my-requests', '2025-12-17 12:25:05', '2025-12-17 13:30:42'),
('9e5601db-0bad-4237-9a2d-573264cbcc14', '9784', 'Role Changed', 'Your role has been changed from instructor to admin', 'role_change', '{\"old_role\":\"instructor\",\"new_role\":\"admin\",\"user_name\":\"Melenio\",\"timestamp\":\"2025-12-23T04:33:41.502Z\"}', 1, '/profile', '2025-12-23 12:33:41', '2025-12-23 15:37:24'),
('9ef46035-65c2-4531-95ea-7891749e37df', '9786', 'New Incident Report', 'New incident reported: colb102_pc10 (hardware - critical) at COLB_102 by Cedric Ang', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"0d73c32c-5c31-4c90-af1b-8323b0c6f014\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: colb102_pc10 (hardware - critical) at COLB_102 by Cedric Ang\",\"incident_title\":\"colb102_pc10\",\"incident_type\":\"hardware\",\"severity\":\"critical\",\"location\":\"COLB_102\",\"reported_by\":\"Cedric Ang\",\"timestamp\":\"2025-12-17 03:46:43\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-17 10:46:43', '2025-12-17 10:46:43'),
('a44491f0-5079-42f5-bf18-03e7f7cf5679', 'admin_broadcast', 'New Lost & Found Item', 'New found item reported: quasy (jewelry) at cl 2 station 5 by (admin) - Dec 22, 2025 3:29 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"0272ea1e-b145-4057-8269-f51d3404551b\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: quasy (jewelry) at cl 2 station 5 by (admin) - Dec 22, 2025 3:29 AM\",\"item_title\":\"quasy\",\"item_type\":\"jewelry\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T02:29:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 14:27:05', '2025-12-23 14:27:05'),
('a465cebd-592b-4eca-9091-77ff73961175', '9787', 'New Borrow Request', 'Liejay Jabines has requested to borrow 1 x VR Headset', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"670574f0-8b0d-4813-8b48-6884f2738f7a\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"VR Headset\",\"quantity\":1,\"user_id\":9782,\"status\":\"pending\",\"timestamp\":\"2026-01-25 07:32:43\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 1 x VR Headset\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-25 14:32:43', '2026-01-25 14:32:43'),
('a46d099e-258c-456b-9109-a717d5eb3dc4', '9783', 'New Lost & Found Item', 'New lost item reported: lost cp (electronics) at colb 102  by Cedric Ang', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"01d81b85-326c-4162-be05-fb56de727107\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: lost cp (electronics) at colb 102  by Cedric Ang\",\"item_title\":\"lost cp\",\"item_type\":\"electronics\",\"status\":\"lost\",\"location\":\"colb 102 \",\"reported_by\":\"Cedric Ang\",\"timestamp\":\"2025-12-17 04:08:11\",\"actionUrl\":\"\\/lost-found\"}', 1, '/lost-found', '2025-12-17 11:08:11', '2026-01-31 04:30:13'),
('a58cdc64-4f5a-4ffa-88da-12ce50826328', '9787', 'Borrow Request Approved', 'Your borrow request for 1 x Multimeter has been approved', 'borrow_status_update', '{\"type\":\"borrow_status_update\",\"request_id\":\"0621ebae-3fad-4c7a-94ae-1f572f56e4c2\",\"item\":\"Multimeter\",\"quantity\":1,\"return_date\":null,\"old_status\":\"pending\",\"new_status\":\"approved\",\"rejection_reason\":\"\",\"user_id\":9787,\"timestamp\":\"2025-12-17 06:29:55\",\"title\":\"Borrow Request Approved\",\"message\":\"Your borrow request for 1 x Multimeter has been approved\",\"actionUrl\":\"\\/my-requests\"}', 1, '/my-requests', '2025-12-17 13:29:55', '2025-12-17 13:30:42'),
('a685ccf9-f81b-4812-a60a-4a34f09702b6', '9787', 'Item Return Processed', 'Your return of 3 x Screwdriver Set has been processed. Condition: good', 'borrow_return_processed', '{\"type\":\"borrow_return_processed\",\"borrow_record_id\":\"b05f555b-cc9e-4ad6-8c0a-0fa6e648a2d6\",\"item\":\"Screwdriver Set\",\"quantity\":3,\"return_condition\":\"good\",\"return_comments\":\"asasas\",\"user_id\":9787,\"timestamp\":\"2026-01-27 15:45:21\",\"title\":\"Item Return Processed\",\"message\":\"Your return of 3 x Screwdriver Set has been processed. Condition: good\",\"actionUrl\":\"\\/my-borrows\"}', 0, '/my-borrows', '2026-01-27 22:45:21', '2026-01-27 22:45:21'),
('a889b68a-81ba-41d7-9d51-5e3eb99e9526', '9786', 'New Incident Report', 'New incident reported: naay buang sa comlab sir (other - critical) at cl 5 by Liejay Jabines', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"928b81c8-1f37-416e-9ee3-a557840a5e56\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: naay buang sa comlab sir (other - critical) at cl 5 by Liejay Jabines\",\"incident_title\":\"naay buang sa comlab sir\",\"incident_type\":\"other\",\"severity\":\"critical\",\"location\":\"cl 5\",\"reported_by\":\"Liejay Jabines\",\"timestamp\":\"2025-12-22 15:52:59\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-22 22:53:00', '2025-12-22 22:53:00'),
('a98f9e0b-fe43-4fcf-bacd-01fc4519e646', '9787', 'New Lost & Found Item', 'New found item reported: quasy (jewelry) at cl 2 station 5 by (admin) - Dec 22, 2025 3:29 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"0272ea1e-b145-4057-8269-f51d3404551b\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: quasy (jewelry) at cl 2 station 5 by (admin) - Dec 22, 2025 3:29 AM\",\"item_title\":\"quasy\",\"item_type\":\"jewelry\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T02:29:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 14:27:05', '2025-12-23 14:27:05'),
('ae21e789-60b2-4dce-9adf-5b1ead10b0a5', '9786', 'Borrow Request Updated', 'Borrow request for 1 x VR Headset has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"468902fe-9e4a-4a89-9553-2eb0a94d5e7f\",\"item\":\"VR Headset\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2026-01-25 08:48:00\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x VR Headset has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-25 15:48:00', '2026-01-25 15:48:00'),
('b76bbdb4-aebc-409b-8914-33d51fa838c3', 'admin_broadcast', 'New Borrow Request', 'Cedric Ang has requested to borrow 1 x Oscilloscope', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"28f9917a-82d0-46b1-be2a-caba36ec77c4\",\"borrower_name\":\"Cedric Ang\",\"item\":\"Oscilloscope\",\"quantity\":1,\"user_id\":9787,\"timestamp\":\"2025-12-17 06:27:49\",\"title\":\"New Borrow Request\",\"message\":\"Cedric Ang has requested to borrow 1 x Oscilloscope\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-17 13:27:49', '2025-12-17 13:27:49'),
('bb0bbeaf-4322-4b17-b660-21b51a83e7e6', '9782', 'Borrow Request Approved', 'Your borrow request for 1 x 3D Printer has been approved', 'borrow_status_update', '{\"type\":\"borrow_status_update\",\"request_id\":\"9a6a02c3-3ead-4770-989b-5e5558f0b4a1\",\"item\":\"3D Printer\",\"quantity\":1,\"return_date\":null,\"old_status\":\"pending\",\"new_status\":\"approved\",\"rejection_reason\":\"\",\"user_id\":9782,\"timestamp\":\"2026-01-27 17:32:33\",\"title\":\"Borrow Request Approved\",\"message\":\"Your borrow request for 1 x 3D Printer has been approved\",\"actionUrl\":\"\\/my-requests\"}', 1, '/my-requests', '2026-01-28 00:32:33', '2026-01-28 02:34:37'),
('bc7653c0-5375-43a4-b2df-7a2ebb8f3f1d', 'admin_broadcast', 'Borrow Request Updated', 'Borrow request for 1 x Multimeter has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"3894565a-2145-4be9-9a74-be88d5e11c99\",\"item\":\"Multimeter\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2025-12-17 05:25:05\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x Multimeter has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-17 12:25:05', '2025-12-17 12:25:05'),
('be98b83c-8937-450b-ab85-e9657f8961fb', '9782', 'Borrow Request Approved', 'Your borrow request for 1 x VR Headset has been approved', 'borrow_status_update', '{\"type\":\"borrow_status_update\",\"request_id\":\"49b122fe-4ac2-41f6-add4-f4315481ad3c\",\"item\":\"VR Headset\",\"quantity\":1,\"return_date\":null,\"old_status\":\"pending\",\"new_status\":\"approved\",\"rejection_reason\":\"\",\"user_id\":9782,\"timestamp\":\"2026-01-25 07:01:27\",\"title\":\"Borrow Request Approved\",\"message\":\"Your borrow request for 1 x VR Headset has been approved\",\"actionUrl\":\"\\/my-requests\"}', 1, '/my-requests', '2026-01-25 14:01:27', '2026-01-25 14:40:00'),
('bf5a9601-56b8-4476-b2b9-52f3e1460332', 'admin_broadcast', 'Borrow Request Updated', 'Borrow request for 1 x Multimeter has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"0621ebae-3fad-4c7a-94ae-1f572f56e4c2\",\"item\":\"Multimeter\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2025-12-17 06:29:55\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x Multimeter has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-17 13:29:55', '2025-12-17 13:29:55'),
('bfa8d655-2084-4cdf-95b6-0b5805f0a00f', 'admin_broadcast', 'New Lost & Found Item', 'New lost item reported: cell phone (gadgets) by (admin) - Dec 22, 2025 5:00 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"97d6fd69-6a1e-4274-91a0-41718d361ab4\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: cell phone (gadgets) by (admin) - Dec 22, 2025 5:00 AM\",\"item_title\":\"cell phone\",\"item_type\":\"gadgets\",\"status\":\"lost\",\"location\":\"\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T04:00:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 16:23:18', '2025-12-23 16:23:18'),
('c129af4e-2db7-414e-b77b-fef02bc00869', 'admin_broadcast', 'New Lost & Found Item', 'New lost item reported: lost cp (electronics) at colb 102  by Cedric Ang', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"01d81b85-326c-4162-be05-fb56de727107\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: lost cp (electronics) at colb 102  by Cedric Ang\",\"item_title\":\"lost cp\",\"item_type\":\"electronics\",\"status\":\"lost\",\"location\":\"colb 102 \",\"reported_by\":\"Cedric Ang\",\"timestamp\":\"2025-12-17 04:08:11\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-17 11:08:11', '2025-12-17 11:08:11'),
('c3bb2e99-2ebb-49a0-bd5d-8c0d7714680c', '9786', 'Incident Report Submitted', 'Your incident report \'Test Incident\' (software) has been submitted successfully', 'incident_report_submitted', '{\"type\":\"incident_report_submitted\",\"incident_id\":\"edc1afb1-dcee-47e4-a0ad-a49e6691e975\",\"title\":\"Incident Report Submitted\",\"message\":\"Your incident report \'Test Incident\' (software) has been submitted successfully\",\"incident_title\":\"Test Incident\",\"incident_type\":\"software\",\"hardware_type\":\"\",\"hardware_damage\":\"\",\"timestamp\":\"2025-12-23 06:24:45\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 13:24:45', '2025-12-23 13:24:45'),
('c491dae7-b28d-4eb9-80b2-bdcf813fb36d', 'admin_broadcast', 'New Incident Report', 'New incident reported: Final Test Incident (hardware - high) - Laptop: Screen cracked at Computer Lab by Test User', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"3b65c964-e9a8-48dd-984c-930de93f9ebd\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: Final Test Incident (hardware - high) - Laptop: Screen cracked at Computer Lab by Test User\",\"incident_title\":\"Final Test Incident\",\"incident_type\":\"hardware\",\"severity\":\"high\",\"location\":\"Computer Lab\",\"reported_by\":\"Test User\",\"hardware_type\":\"Laptop\",\"hardware_damage\":\"Screen cracked\",\"timestamp\":\"2025-12-23 06:25:06\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 13:25:06', '2025-12-23 13:25:06'),
('c4ba29d7-cfeb-470e-8287-98c5399c23af', '9784', 'Role Changed', 'Your role has been changed from admin to instructor', 'role_change', '{\"old_role\":\"admin\",\"new_role\":\"instructor\",\"user_name\":\"Melenio\",\"timestamp\":\"2025-12-23T09:13:24.396Z\"}', 0, '/profile', '2025-12-23 17:13:24', '2025-12-23 17:13:24'),
('c7cafbf9-65ad-445d-9ff5-e4194ecc7d4b', '9782', 'Borrow Request Approved', 'Your borrow request for 1 x 3D Printer has been approved', 'borrow_status_update', '{\"type\":\"borrow_status_update\",\"request_id\":\"d9fd21bd-776c-48ec-9ab2-b24f6c6f40b8\",\"item\":\"3D Printer\",\"quantity\":1,\"return_date\":null,\"old_status\":\"pending\",\"new_status\":\"approved\",\"rejection_reason\":\"\",\"user_id\":9782,\"timestamp\":\"2025-12-23 09:38:12\",\"title\":\"Borrow Request Approved\",\"message\":\"Your borrow request for 1 x 3D Printer has been approved\",\"actionUrl\":\"\\/my-requests\"}', 1, '/my-requests', '2025-12-23 16:38:12', '2026-01-25 13:30:11'),
('c959991f-2bf3-4256-82a5-1ae5f10a379b', '9786', 'New Incident Report', 'New incident reported: Final Test Incident (hardware - high) - Laptop: Screen cracked at Computer Lab by Test User', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"3b65c964-e9a8-48dd-984c-930de93f9ebd\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: Final Test Incident (hardware - high) - Laptop: Screen cracked at Computer Lab by Test User\",\"incident_title\":\"Final Test Incident\",\"incident_type\":\"hardware\",\"severity\":\"high\",\"location\":\"Computer Lab\",\"reported_by\":\"Test User\",\"hardware_type\":\"Laptop\",\"hardware_damage\":\"Screen cracked\",\"timestamp\":\"2025-12-23 06:25:06\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 13:25:06', '2025-12-23 13:25:06'),
('cafe4b8d-6889-45c3-87a4-3c4d9afb5cce', 'admin_broadcast', 'New Incident Report', 'New incident reported: jashausg (hardware - high) - monitor: asas at comlab 1 by Melenio Caturan (instructor)', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"8596a0a4-698a-4ad0-b9ee-5a9b83eea98e\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: jashausg (hardware - high) - monitor: asas at comlab 1 by Melenio Caturan (instructor)\",\"incident_title\":\"jashausg\",\"incident_type\":\"hardware\",\"severity\":\"high\",\"location\":\"comlab 1\",\"reported_by\":\"Melenio Caturan (instructor)\",\"hardware_type\":\"monitor\",\"hardware_damage\":\"asas\",\"timestamp\":\"2025-12-23 07:25:48\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 14:25:48', '2025-12-23 14:25:48'),
('cb826086-c9d5-4a86-83d9-7872e60dc6f9', '9786', 'New Borrow Request', 'Liejay Jabines has requested to borrow 1 x VR Headset', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"670574f0-8b0d-4813-8b48-6884f2738f7a\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"VR Headset\",\"quantity\":1,\"user_id\":9782,\"status\":\"pending\",\"timestamp\":\"2026-01-25 07:32:43\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 1 x VR Headset\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-25 14:32:43', '2026-01-25 14:32:43'),
('cc747d05-53dc-4a16-bd5b-613c9b6738ef', 'admin_broadcast', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"7bfc48c9-037d-4d33-84fd-95bcef945cf5\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-23 06:03:26\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:03:26', '2025-12-23 13:03:26'),
('cce6ae88-4eea-4530-a480-7261e1246f5d', '9787', 'New Incident Report', 'New incident reported: asasas (hardware - critical) - computer: gi inom ni kerby ang ink by (admin)', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"fa2a76da-9dde-49f8-bada-aef765aa66b7\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: asasas (hardware - critical) - computer: gi inom ni kerby ang ink by (admin)\",\"incident_title\":\"asasas\",\"incident_type\":\"hardware\",\"severity\":\"critical\",\"location\":\"\",\"reported_by\":\"(admin)\",\"hardware_type\":\"computer\",\"hardware_damage\":\"gi inom ni kerby ang ink\",\"timestamp\":\"2025-12-23 06:43:05\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 13:43:07', '2025-12-23 13:43:07'),
('d012efc5-bee5-4bbb-9928-448896502ccb', '9786', 'New Lost & Found Item', 'New lost item reported: lost item (gadgets) by (admin) - Dec 22, 2025 5:00 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"be588b7c-eb24-4f76-95e3-155d080435e5\",\"title\":\"New Lost & Found Item\",\"message\":\"New lost item reported: lost item (gadgets) by (admin) - Dec 22, 2025 5:00 AM\",\"item_title\":\"lost item\",\"item_type\":\"gadgets\",\"status\":\"lost\",\"location\":\"\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-22T04:00:00.000Z\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:17:12', '2025-12-23 13:17:12'),
('d1378b56-55e0-4904-ab81-e3870b062538', 'admin_broadcast', 'New Borrow Request', 'benjie.trozo has requested to borrow 1 x Multimeter', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"ac06e5c5-986b-4976-b12c-60d77347c35a\",\"borrower_name\":\"benjie.trozo\",\"item\":\"Multimeter\",\"quantity\":1,\"user_id\":6717,\"status\":\"pending\",\"timestamp\":\"2025-12-18 06:29:23\",\"title\":\"New Borrow Request\",\"message\":\"benjie.trozo has requested to borrow 1 x Multimeter\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-18 13:29:23', '2025-12-18 13:29:23'),
('d37447bf-35af-42ae-b0fd-38d09dea027d', '9786', 'Borrow Request Updated', 'Borrow request for 1 x 3D Printer has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"9a6a02c3-3ead-4770-989b-5e5558f0b4a1\",\"item\":\"3D Printer\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2026-01-27 17:32:33\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x 3D Printer has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-28 00:32:33', '2026-01-28 00:32:33'),
('d8cb82d4-f27c-4ce7-9e29-e88ce5310f1e', 'admin_broadcast', 'New Incident Report', 'New incident reported: broken system unit (hardware - medium) - computer: not working by (admin)', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"2b86b527-eea8-4dd5-bc54-403421e7510c\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: broken system unit (hardware - medium) - computer: not working by (admin)\",\"incident_title\":\"broken system unit\",\"incident_type\":\"hardware\",\"severity\":\"medium\",\"location\":\"\",\"reported_by\":\"(admin)\",\"hardware_type\":\"computer\",\"hardware_damage\":\"not working\",\"timestamp\":\"2025-12-23 09:13:02\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 16:13:02', '2025-12-23 16:13:02'),
('da7a28a3-1792-490d-946c-95cebd99adce', '9786', 'Borrow Request Updated', 'Borrow request for 1 x VR Headset has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"49b122fe-4ac2-41f6-add4-f4315481ad3c\",\"item\":\"VR Headset\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2026-01-25 07:01:27\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x VR Headset has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-25 14:01:27', '2026-01-25 14:01:27'),
('db9def35-6dd6-482e-8cc3-e78e272ee97e', 'admin_broadcast', 'New Incident Report', 'New incident reported: colb102_pc10 (hardware - critical) at COLB_102 by Cedric Ang', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"0d73c32c-5c31-4c90-af1b-8323b0c6f014\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: colb102_pc10 (hardware - critical) at COLB_102 by Cedric Ang\",\"incident_title\":\"colb102_pc10\",\"incident_type\":\"hardware\",\"severity\":\"critical\",\"location\":\"COLB_102\",\"reported_by\":\"Cedric Ang\",\"timestamp\":\"2025-12-17 03:46:43\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-17 10:46:43', '2025-12-17 10:46:43'),
('dd89a1d5-2e9f-4b98-af7e-4d235b501439', '9787', 'Borrow Request Updated', 'Borrow request for 1 x Soldering Iron has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"792a47f9-77c8-4b4e-9d04-c64faf062276\",\"item\":\"Soldering Iron\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2025-12-23 03:14:20\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x Soldering Iron has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 10:14:20', '2025-12-23 10:14:20'),
('ddeabf74-c656-4068-80cd-13666c3da2a4', '9786', 'Lost & Found Item Submitted', 'Your found item \'Test Lost Item 2\' (gadgets) has been submitted successfully - Reported: Dec 23, 2025 11:00 AM', 'lostfound_item_submitted', '{\"type\":\"lostfound_item_submitted\",\"item_id\":\"215cb6fc-170a-4864-a31e-3c8f20e2165e\",\"title\":\"Lost & Found Item Submitted\",\"message\":\"Your found item \'Test Lost Item 2\' (gadgets) has been submitted successfully - Reported: Dec 23, 2025 11:00 AM\",\"item_title\":\"Test Lost Item 2\",\"item_type\":\"gadgets\",\"status\":\"found\",\"timestamp\":\"2025-12-23T11:00:00\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:21:46', '2025-12-23 13:21:46'),
('e52062cb-1935-4608-8d5b-e7793ec14617', '9783', 'New Incident Report', 'New incident reported: Network Connection Issue (network - high) at Lab B - Workstations 10-15 by Test User', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"f80cc781-786f-4915-a891-48d3df4b609e\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: Network Connection Issue (network - high) at Lab B - Workstations 10-15 by Test User\",\"incident_title\":\"Network Connection Issue\",\"incident_type\":\"network\",\"severity\":\"high\",\"location\":\"Lab B - Workstations 10-15\",\"reported_by\":\"Test User\",\"timestamp\":\"2025-12-16 05:18:43\",\"actionUrl\":\"\\/incident-reports\"}', 1, '/incident-reports', '2025-12-16 12:18:43', '2026-01-31 04:30:13'),
('e532c206-99b8-448d-9185-91b5f5da9c17', '9783', 'New Incident Report', 'New incident reported: naay buang diri sir (other - critical) at  by Liejay Jabines', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"c5ab3026-157c-4827-8712-daaa31a83679\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: naay buang diri sir (other - critical) at  by Liejay Jabines\",\"incident_title\":\"naay buang diri sir\",\"incident_type\":\"other\",\"severity\":\"critical\",\"location\":\"\",\"reported_by\":\"Liejay Jabines\",\"timestamp\":\"2025-12-16 09:55:51\",\"actionUrl\":\"\\/incidents\"}', 1, '/incidents', '2025-12-16 16:55:51', '2026-01-31 04:30:13'),
('e614bbf4-d528-4443-9a3a-5d5ab283122d', '9783', 'New Lost & Found Item', 'New found item reported: found Iphone 17 pro max found (electronics) at comlab 1 by Liejay Jabines', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"cc97fefe-6b36-4d4f-a779-89c642a07ba7\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found Iphone 17 pro max found (electronics) at comlab 1 by Liejay Jabines\",\"item_title\":\"found Iphone 17 pro max found\",\"item_type\":\"electronics\",\"status\":\"found\",\"location\":\"comlab 1\",\"reported_by\":\"Liejay Jabines\",\"timestamp\":\"2025-12-16 06:21:56\",\"actionUrl\":\"\\/lost-found\"}', 1, '/lost-found', '2025-12-16 13:21:56', '2026-01-31 04:30:13'),
('e88de34f-277e-4bc1-a983-fed5dfd0f479', '9787', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"d99c88f5-0702-4984-bd8e-58474fe983a6\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-23 06:03:26\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:03:28', '2025-12-23 13:03:28'),
('e88f3448-3e39-47d3-86f7-079b0f3b6d64', '9787', 'New Lost & Found Item', 'New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"cd1c77b9-60d1-41c4-94b1-8da9e8d20b2b\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found a phone (gadgets) at cl 2 station 5 by (admin)\",\"item_title\":\"found a phone\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"cl 2 station 5\",\"reported_by\":\"(admin)\",\"timestamp\":\"2025-12-23 06:03:27\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:03:29', '2025-12-23 13:03:29');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `data`, `read_status`, `action_url`, `created_at`, `updated_at`) VALUES
('ec328725-bdb8-46cb-ace1-3d50e7cb2621', 'admin_broadcast', 'New Borrow Request', 'Cedric Ang has requested to borrow 1 x Multimeter', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"3894565a-2145-4be9-9a74-be88d5e11c99\",\"borrower_name\":\"Cedric Ang\",\"item\":\"Multimeter\",\"quantity\":1,\"user_id\":9787,\"timestamp\":\"2025-12-17 05:16:02\",\"title\":\"New Borrow Request\",\"message\":\"Cedric Ang has requested to borrow 1 x Multimeter\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-17 12:16:02', '2025-12-17 12:16:02'),
('ec362c3c-544a-4e76-b5f2-09c829a06edf', '9787', 'Borrow Request Updated', 'Borrow request for 1 x 3D Printer has been approved', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"9a6a02c3-3ead-4770-989b-5e5558f0b4a1\",\"item\":\"3D Printer\",\"quantity\":1,\"old_status\":\"pending\",\"new_status\":\"approved\",\"timestamp\":\"2026-01-27 17:32:33\",\"title\":\"Borrow Request Updated\",\"message\":\"Borrow request for 1 x 3D Printer has been approved\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2026-01-28 00:32:33', '2026-01-28 00:32:33'),
('ecce40fe-013c-403d-8447-e7b2d05d66cf', '9786', 'New Incident Report', 'New incident reported: naay buang diri sir (other - critical) at  by Liejay Jabines', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"c5ab3026-157c-4827-8712-daaa31a83679\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: naay buang diri sir (other - critical) at  by Liejay Jabines\",\"incident_title\":\"naay buang diri sir\",\"incident_type\":\"other\",\"severity\":\"critical\",\"location\":\"\",\"reported_by\":\"Liejay Jabines\",\"timestamp\":\"2025-12-16 09:55:51\",\"actionUrl\":\"\\/incidents\"}', 1, '/incidents', '2025-12-16 16:55:51', '2025-12-16 18:20:44'),
('ef60873a-596a-4cf8-a3d3-b18b58f0433e', 'admin_broadcast', 'New Incident Report', 'New incident reported: naay buang diri sir (other - critical) at  by Liejay Jabines', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"c5ab3026-157c-4827-8712-daaa31a83679\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: naay buang diri sir (other - critical) at  by Liejay Jabines\",\"incident_title\":\"naay buang diri sir\",\"incident_type\":\"other\",\"severity\":\"critical\",\"location\":\"\",\"reported_by\":\"Liejay Jabines\",\"timestamp\":\"2025-12-16 09:55:51\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-16 16:55:51', '2025-12-16 16:55:51'),
('f18953af-9771-45a4-b78f-da448bcd5623', '9787', 'New Lost & Found Item', 'New found item reported: Test Lost Item 2 (gadgets) at Library by Benjie Trozo - Dec 23, 2025 11:00 AM', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"215cb6fc-170a-4864-a31e-3c8f20e2165e\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: Test Lost Item 2 (gadgets) at Library by Benjie Trozo - Dec 23, 2025 11:00 AM\",\"item_title\":\"Test Lost Item 2\",\"item_type\":\"gadgets\",\"status\":\"found\",\"location\":\"Library\",\"reported_by\":\"Benjie Trozo\",\"timestamp\":\"2025-12-23T11:00:00\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-23 13:21:46', '2025-12-23 13:21:46'),
('f30faa02-1396-452e-8866-05ea434364a5', '9786', 'New Borrow Request', 'Melenio Caturan has requested to borrow 1 x Soldering Iron', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"7c43819d-c1e2-4f23-8d73-0a98dcdfc6c6\",\"borrower_name\":\"Melenio Caturan\",\"item\":\"Soldering Iron\",\"quantity\":1,\"user_id\":9784,\"status\":\"pending\",\"timestamp\":\"2025-12-23 08:37:52\",\"title\":\"New Borrow Request\",\"message\":\"Melenio Caturan has requested to borrow 1 x Soldering Iron\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-23 15:37:52', '2025-12-23 15:37:52'),
('f4ce9f13-6696-44d2-b922-033debf91f2f', '9783', 'Role Changed', 'Your role has been changed from instructor to admin', 'role_change', '{\"old_role\":\"instructor\",\"new_role\":\"admin\",\"user_name\":\"Robert\",\"timestamp\":\"2026-01-30T20:03:05.168Z\"}', 1, '/profile', '2026-01-31 04:03:05', '2026-01-31 04:30:13'),
('f4ff4dda-ec19-416e-a111-9c6c499c08f0', '9786', 'New Incident Report', 'New incident reported: asasas (hardware - critical) - computer: gi inom ni kerby ang ink by (admin)', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"fa2a76da-9dde-49f8-bada-aef765aa66b7\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: asasas (hardware - critical) - computer: gi inom ni kerby ang ink by (admin)\",\"incident_title\":\"asasas\",\"incident_type\":\"hardware\",\"severity\":\"critical\",\"location\":\"\",\"reported_by\":\"(admin)\",\"hardware_type\":\"computer\",\"hardware_damage\":\"gi inom ni kerby ang ink\",\"timestamp\":\"2025-12-23 06:43:05\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-23 13:43:07', '2025-12-23 13:43:07'),
('f92e92b9-c46e-4906-8be7-b063c98bd849', 'admin_broadcast', 'New Borrow Request', 'Liejay Jabines has requested to borrow 3 x Multimeter', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"e9c87d6e-32c9-4434-bb81-118457fad1e6\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"Multimeter\",\"quantity\":3,\"user_id\":9782,\"timestamp\":\"2025-12-16 08:53:10\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 3 x Multimeter\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-16 15:53:10', '2025-12-16 15:53:10'),
('fb202b7c-cb17-4599-849b-1c895d9fd168', '9784', 'Role Changed', 'Your role has been changed from admin to instructor', 'role_change', '{\"old_role\":\"admin\",\"new_role\":\"instructor\",\"user_name\":\"Melenio\",\"timestamp\":\"2025-12-23T04:33:23.759Z\"}', 1, '/profile', '2025-12-23 12:33:23', '2025-12-23 15:37:24');

-- --------------------------------------------------------

--
-- Table structure for table `repair_maintenance`
--

CREATE TABLE `repair_maintenance` (
  `id` char(36) NOT NULL,
  `date` date NOT NULL,
  `equipment_name` varchar(255) NOT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `issue_description` text NOT NULL,
  `action_taken` text DEFAULT NULL,
  `technician_name` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` char(36) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `original_module` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `repair_maintenance`
--

INSERT INTO `repair_maintenance` (`id`, `date`, `equipment_name`, `serial_number`, `issue_description`, `action_taken`, `technician_name`, `status`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `original_module`) VALUES
('1ecefed9-dbd7-11f0-96dc-e4e7494af02c', '2025-12-13', '1123', '13dasdA$', 'ad', 'adw', 'kerby', 'Pending', '2025-12-18 14:02:22', '6717', NULL, NULL, NULL),
('491da24a-dfda-11f0-af7d-e4e7494af02c', '2025-12-23', '3d Printer', '12345678', '3D printer', 'under repair', 'Robert', 'Pending', '2025-12-23 16:35:07', '6717', NULL, NULL, NULL),
('625aa24b-6270-4e93-8437-50fe40096ac1', '2025-12-22', 'Screwdriver Set', NULL, 'Item returned from borrow record ID: 072ad8d8-64ce-457a-862a-b12fe6df3b48. Comments: ', NULL, NULL, 'Pending', '2025-12-22 23:29:36', '6717', NULL, NULL, NULL),
('766e0a33-e839-49ab-bccf-a4e47331ae9a', '2025-12-22', 'Multimeter', NULL, 'Item returned from borrow record ID: 80bbbe0a-1eca-4218-95fa-471099c083f1 by benjie.trozo (ID: 2022-1010). Comments: ', NULL, NULL, 'Pending', '2025-12-22 23:35:48', '6717', NULL, NULL, NULL),
('d83da0de-2b71-419f-b827-62e2e3d6b468', '2025-12-22', 'Multimeter', NULL, 'Item returned from borrow record ID: 7d98423d-b384-48f8-bb77-0cbd35f389c2 by Cedric Ang (ID: 2022-0464). Comments: ', NULL, NULL, 'Pending', '2025-12-22 23:37:04', '6717', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `reservation_waiting_list`
--

CREATE TABLE `reservation_waiting_list` (
  `id` char(36) NOT NULL,
  `equipment_id` char(36) NOT NULL,
  `user_id` int(11) NOT NULL,
  `quantity_needed` int(11) NOT NULL DEFAULT 1,
  `preferred_date` date DEFAULT NULL,
  `preferred_start_time` time DEFAULT NULL,
  `preferred_end_time` time DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('waiting','notified','fulfilled','cancelled') DEFAULT 'waiting',
  `notified_at` datetime DEFAULT NULL,
  `fulfilled_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reservation_waiting_list`
--

INSERT INTO `reservation_waiting_list` (`id`, `equipment_id`, `user_id`, `quantity_needed`, `preferred_date`, `preferred_start_time`, `preferred_end_time`, `purpose`, `priority`, `status`, `notified_at`, `fulfilled_at`, `notes`, `created_at`) VALUES
('660e8400-e29b-41d4-a716-446655440000', '6938fd60f16f1', 9782, 1, '2025-12-11', '10:00:00', '12:00:00', 'Urgent signal analysis', 'high', 'cancelled', NULL, '2025-12-16 07:42:04', NULL, '2025-12-10 17:00:00'),
('660e8400-e29b-41d4-a716-446655440001', '6938fd6100c8b', 9782, 1, '2025-12-12', '09:00:00', '11:00:00', 'Student project work', 'medium', 'cancelled', '2025-12-16 08:59:30', NULL, NULL, '2025-12-10 16:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `updated_at`, `updated_by`) VALUES
(1, 'maintenance_mode', 'false', 'System maintenance mode - when enabled, users cannot login', '2025-12-23 17:07:53', NULL),
(2, 'maintenance_message', 'System is currently under maintenance. Please try again later.', 'Message displayed during maintenance mode', '2025-12-23 17:07:53', NULL),
(43, 'reservation_advance_days', '7', 'Maximum days in advance users can make reservations', '2025-12-23 17:07:53', NULL),
(44, 'reservation_max_duration_hours', '4', 'Maximum reservation duration in hours', '2025-12-23 17:07:53', NULL),
(45, 'reservation_auto_approve', 'false', 'Automatically approve reservations if no conflicts', '2025-12-23 17:07:53', NULL),
(46, 'reservation_require_approval', 'true', 'Require admin approval for all reservations', '2025-12-23 17:07:53', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `trash_audit_log`
--

CREATE TABLE `trash_audit_log` (
  `id` bigint(20) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(255) NOT NULL,
  `action` enum('soft_delete','restore','permanent_delete','auto_cleanup') NOT NULL,
  `user_id` int(11) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trash_audit_log`
--

INSERT INTO `trash_audit_log` (`id`, `entity_type`, `entity_id`, `action`, `user_id`, `timestamp`, `metadata`) VALUES
(1, 'incident_report', 'fa2a76da-9dde-49f8-bada-aef765aa66b7', 'soft_delete', 6717, '2026-01-30 17:15:51', '{\"module\":\"Incident Reports\"}'),
(2, 'lost_found', '97d6fd69-6a1e-4274-91a0-41718d361ab4', 'soft_delete', 6717, '2026-01-30 17:28:43', '{\"module\":\"Lost & Found\"}'),
(3, 'reservation', '7c2bb05a-4bcc-4596-9bf9-8a674820fbb1', 'soft_delete', 6717, '2026-01-30 17:43:57', '{\"module\":\"Reservations\"}'),
(4, 'reservation', 'c95e02a3-43a1-4be9-ad7e-358ed92b0075', 'soft_delete', 6717, '2026-01-30 17:43:58', '{\"module\":\"Reservations\"}'),
(5, 'borrow_request', '14e79ff9-dd72-42bf-b733-77cdee550112', 'soft_delete', 88, '2026-01-30 17:59:43', '{\"module\":\"Borrow Requests\"}'),
(6, 'borrow_request', '14e79ff9-dd72-42bf-b733-77cdee550112', 'restore', 88, '2026-01-30 17:59:43', NULL),
(7, 'borrow_request', '69c0d2df-54bb-4648-bf2c-086ccf3788b6', 'soft_delete', 6717, '2026-01-30 18:03:31', '{\"module\":\"Borrow Requests\"}'),
(8, 'repair_maintenance', '1ecefed9-dbd7-11f0-96dc-e4e7494af02c', 'soft_delete', 88, '2026-01-30 18:25:52', '{\"module\":\"Repair & Maintenance\"}'),
(9, 'repair_maintenance', '1ecefed9-dbd7-11f0-96dc-e4e7494af02c', 'restore', 88, '2026-01-30 18:25:52', NULL),
(10, 'borrow_item', '02740a96-150d-4979-9384-3febd9ef878a', 'soft_delete', 88, '2026-01-30 18:27:00', '{\"module\":\"Borrow Items\"}'),
(11, 'borrow_item', '02740a96-150d-4979-9384-3febd9ef878a', 'restore', 88, '2026-01-30 18:27:00', NULL),
(12, 'borrow_request', '14e79ff9-dd72-42bf-b733-77cdee550112', 'soft_delete', 88, '2026-01-30 19:09:58', '{\"module\":\"Borrow Requests\"}'),
(13, 'borrow_request', '14e79ff9-dd72-42bf-b733-77cdee550112', 'restore', 6717, '2026-01-30 19:09:58', NULL),
(14, 'borrow_request', '14e79ff9-dd72-42bf-b733-77cdee550112', 'soft_delete', 88, '2026-01-30 19:09:58', '{\"module\":\"Borrow Requests\"}'),
(15, 'borrow_request', '14e79ff9-dd72-42bf-b733-77cdee550112', 'restore', 6717, '2026-01-30 19:09:58', NULL),
(16, 'borrow_request', '69c0d2df-54bb-4648-bf2c-086ccf3788b6', 'restore', 6717, '2026-01-30 19:11:07', NULL),
(17, 'incident_report', '3b65c964-e9a8-48dd-984c-930de93f9ebd', 'soft_delete', 6717, '2026-01-30 19:32:06', '{\"module\":\"Incident Reports\"}'),
(18, 'incident_report', '3b65c964-e9a8-48dd-984c-930de93f9ebd', 'restore', 6717, '2026-01-30 19:32:47', NULL),
(19, 'lost_found', '97d6fd69-6a1e-4274-91a0-41718d361ab4', 'restore', 6717, '2026-01-30 19:32:50', NULL),
(20, 'incident_report', 'fa2a76da-9dde-49f8-bada-aef765aa66b7', 'restore', 6717, '2026-01-30 19:32:51', NULL),
(21, 'borrow_request', '69c0d2df-54bb-4648-bf2c-086ccf3788b6', 'soft_delete', 6717, '2026-02-02 05:28:33', '{\"module\":\"Borrow Requests\"}'),
(22, 'borrow_request', '69c0d2df-54bb-4648-bf2c-086ccf3788b6', 'restore', 6717, '2026-02-02 05:28:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `trash_config`
--

CREATE TABLE `trash_config` (
  `id` int(11) NOT NULL,
  `retention_days` int(11) NOT NULL DEFAULT 30,
  `auto_cleanup_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','user','instructor') NOT NULL DEFAULT 'user',
  `avatar_url` varchar(255) DEFAULT NULL,
  `id_number` varchar(9) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `original_module` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `first_name`, `middle_name`, `last_name`, `password_hash`, `role`, `avatar_url`, `id_number`, `created_at`, `deleted_at`, `deleted_by`, `original_module`) VALUES
(88, 'neil@gmail.com', 'Neil Bryant', '', 'Galindez', '$2y$10$KckNIZs1Gt8rl5PIP1MIG.n.X9i/XTqzNJyfnWeiX/B0YLHKz9w3e', 'instructor', 'api/uploads/avatars/88.jpg', '2022-1235', '2025-12-11 10:25:38', NULL, NULL, NULL),
(6717, 'benjie.trozo@csucc.edu.ph', NULL, NULL, NULL, '$2y$10$CMMaW/gtubTZ9O3lLYZDo.dvBkLFXYW01A7lCfKro.SoTq6SB8IQq', 'admin', 'api/uploads/avatars/6717.jpg', '2022-1010', '2025-12-04 16:11:16', NULL, NULL, NULL),
(9782, 'jay@gmail.com', 'Liejay', '', 'Jabines', '$2y$10$PBpIPDLui4fKwgIcd99e5egXAvHfVpvP6sL1Qf55JB/dnFCuoEoQG', 'user', 'api/uploads/avatars/9782.jpg', '2022-1012', '2025-12-09 21:40:15', NULL, NULL, NULL),
(9783, 'babals@gmail.com', 'Robert', '', 'Pahit', '$2y$10$KckNIZs1Gt8rl5PIP1MIG.n.X9i/XTqzNJyfnWeiX/B0YLHKz9w3e', 'admin', NULL, '2022-1234', '2025-12-11 11:09:17', NULL, NULL, NULL),
(9784, 'lelen@gmail.com', 'Melenio', '', 'Caturan', '$2y$10$KckNIZs1Gt8rl5PIP1MIG.n.X9i/XTqzNJyfnWeiX/B0YLHKz9w3e', 'instructor', NULL, '2022-1237', '2025-12-11 11:11:11', NULL, NULL, NULL),
(9785, 'ting@gmail.com', 'Ako Si', 'Ting', 'Inamo', '$2y$10$KckNIZs1Gt8rl5PIP1MIG.n.X9i/XTqzNJyfnWeiX/B0YLHKz9w3e', 'instructor', 'api/uploads/avatars/9785.png', '2022-1238', '2025-12-11 11:12:26', NULL, NULL, NULL),
(9786, 'trozo@gmail.com', 'Benjie', '', 'Trozo', '$2y$10$lvIUNQGJHcjErAZyVEo0mOsQLgZs9U43kfamC/cxC5yQD05N2nm9G', 'admin', NULL, '2022-1010', '2025-12-11 11:18:04', NULL, NULL, NULL),
(9787, 'Cedric.Ang@csucc.edu.ph', 'Cedric', '', 'Ang', '$2y$10$V.i2Sgd8juCLWxOohwgJ8uxO5iz4eqSrfWFCts6Ouy902iVqFlN3W', 'admin', NULL, '2022-0464', '2025-12-17 10:19:25', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `visitor_logs`
--

CREATE TABLE `visitor_logs` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `purpose` text NOT NULL,
  `date` date NOT NULL,
  `time_in` time NOT NULL,
  `time_out` time DEFAULT NULL,
  `signature` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` char(36) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `original_module` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visitor_logs`
--

INSERT INTO `visitor_logs` (`id`, `name`, `purpose`, `date`, `time_in`, `time_out`, `signature`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `original_module`) VALUES
('24efbce3-dfc9-11f0-8684-e4e7494af02c', 'BENJIE', 'naay gi kuha', '2025-12-23', '14:32:00', '17:32:00', '', '2025-12-23 14:32:24', '', NULL, NULL, NULL),
('2e38d287-dfde-11f0-af7d-e4e7494af02c', 'Robert Pahit', 'Visit', '2025-12-23', '04:05:00', '16:02:00', '', '2025-12-23 17:02:59', '', NULL, NULL, NULL),
('4d85e6da-db04-11f0-a77d-e4e7494af02c', 'jay', 'REPAIR AIRCON', '2025-12-17', '12:52:00', '00:00:00', '', '2025-12-17 12:53:17', '', NULL, NULL, NULL),
('51e801ef-da5e-11f0-8514-e4e7494af02c', 'BENJIE', 'repair', '2025-12-17', '06:05:00', '09:09:00', '', '2025-12-16 17:05:08', '', NULL, NULL, NULL),
('67c7b134-db04-11f0-a77d-e4e7494af02c', 'jay', 'REPAIR AIRCON', '2025-12-17', '12:52:00', '00:05:00', '', '2025-12-17 12:54:01', '', NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_id` (`admin_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_table_name` (`table_name`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_module` (`module`),
  ADD KEY `idx_entity_type` (`entity_type`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_severity` (`severity`),
  ADD KEY `idx_device_type` (`device_type`),
  ADD KEY `idx_browser` (`browser`),
  ADD KEY `idx_is_bot` (`is_bot`);

--
-- Indexes for table `borrow_items`
--
ALTER TABLE `borrow_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_borrow_items_deleted_at` (`deleted_at`),
  ADD KEY `fk_borrow_items_deleted_by` (`deleted_by`);

--
-- Indexes for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_borrower_email` (`borrower_email`),
  ADD KEY `idx_borrow_requests_deleted_at` (`deleted_at`),
  ADD KEY `fk_borrow_requests_deleted_by` (`deleted_by`);

--
-- Indexes for table `equipment_reservations`
--
ALTER TABLE `equipment_reservations`
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_reservation_schedule` (`equipment_id`,`reservation_date`,`start_time`,`end_time`,`status`),
  ADD KEY `idx_user_reservations` (`user_id`,`status`),
  ADD KEY `idx_reservations_deleted_at` (`deleted_at`),
  ADD KEY `fk_reservations_deleted_by` (`deleted_by`);

--
-- Indexes for table `incident_reports`
--
ALTER TABLE `incident_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_incident_reports_deleted_at` (`deleted_at`),
  ADD KEY `fk_incident_reports_deleted_by` (`deleted_by`),
  ADD KEY `idx_software_type` (`software_type`),
  ADD KEY `idx_network_type` (`network_type`),
  ADD KEY `idx_security_type` (`security_type`),
  ADD KEY `idx_facility_type` (`facility_type`);

--
-- Indexes for table `incident_updates`
--
ALTER TABLE `incident_updates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_incident_id` (`incident_id`),
  ADD KEY `idx_updated_by` (`updated_by`);

--
-- Indexes for table `inventory_audit`
--
ALTER TABLE `inventory_audit`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventory_equipment`
--
ALTER TABLE `inventory_equipment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inventory_deleted_at` (`deleted_at`),
  ADD KEY `fk_inventory_deleted_by` (`deleted_by`);

--
-- Indexes for table `lost_found`
--
ALTER TABLE `lost_found`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lost_found_deleted_at` (`deleted_at`),
  ADD KEY `fk_lost_found_deleted_by` (`deleted_by`);

--
-- Indexes for table `maintenance_settings`
--
ALTER TABLE `maintenance_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_read_status` (`read_status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `repair_maintenance`
--
ALTER TABLE `repair_maintenance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_repair_maintenance_deleted_at` (`deleted_at`),
  ADD KEY `fk_repair_maintenance_deleted_by` (`deleted_by`);

--
-- Indexes for table `reservation_waiting_list`
--
ALTER TABLE `reservation_waiting_list`
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_waiting_list_equipment` (`equipment_id`,`status`,`priority`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `trash_audit_log`
--
ALTER TABLE `trash_audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_action` (`action`);

--
-- Indexes for table `trash_config`
--
ALTER TABLE `trash_config`
  ADD PRIMARY KEY (`id`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_deleted_at` (`deleted_at`),
  ADD KEY `fk_users_deleted_by` (`deleted_by`);

--
-- Indexes for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_visitor_logs_deleted_at` (`deleted_at`),
  ADD KEY `fk_visitor_logs_deleted_by` (`deleted_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `inventory_audit`
--
ALTER TABLE `inventory_audit`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=179;

--
-- AUTO_INCREMENT for table `trash_audit_log`
--
ALTER TABLE `trash_audit_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `trash_config`
--
ALTER TABLE `trash_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9788;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `borrow_items`
--
ALTER TABLE `borrow_items`
  ADD CONSTRAINT `fk_borrow_items_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  ADD CONSTRAINT `fk_borrow_requests_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `equipment_reservations`
--
ALTER TABLE `equipment_reservations`
  ADD CONSTRAINT `equipment_reservations_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `inventory_equipment` (`id`),
  ADD CONSTRAINT `equipment_reservations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `equipment_reservations_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_reservations_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `incident_reports`
--
ALTER TABLE `incident_reports`
  ADD CONSTRAINT `fk_incident_reports_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `incident_updates`
--
ALTER TABLE `incident_updates`
  ADD CONSTRAINT `incident_updates_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `inventory_equipment`
--
ALTER TABLE `inventory_equipment`
  ADD CONSTRAINT `fk_inventory_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lost_found`
--
ALTER TABLE `lost_found`
  ADD CONSTRAINT `fk_lost_found_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `repair_maintenance`
--
ALTER TABLE `repair_maintenance`
  ADD CONSTRAINT `fk_repair_maintenance_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reservation_waiting_list`
--
ALTER TABLE `reservation_waiting_list`
  ADD CONSTRAINT `reservation_waiting_list_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `inventory_equipment` (`id`),
  ADD CONSTRAINT `reservation_waiting_list_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `trash_audit_log`
--
ALTER TABLE `trash_audit_log`
  ADD CONSTRAINT `trash_audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trash_config`
--
ALTER TABLE `trash_config`
  ADD CONSTRAINT `trash_config_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  ADD CONSTRAINT `fk_visitor_logs_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
