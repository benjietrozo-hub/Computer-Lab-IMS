-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 16, 2025 at 11:40 AM
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
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `action_description` text NOT NULL,
  `related_item_type` varchar(50) DEFAULT NULL,
  `related_item_id` varchar(255) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action_type`, `action_description`, `related_item_type`, `related_item_id`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
('12d51283-ae9c-4f96-9483-3c86bb3b5e21', '6717', 'item_return', 'Admin processed return of \'3D Printer\' (Qty: 1) from Liejay Jabines. Condition: good', 'borrow_item', '4df9a1e8-2368-45d7-8688-6fa0e67c384d', '{\"borrow_record_id\":\"4df9a1e8-2368-45d7-8688-6fa0e67c384d\",\"item\":\"3D Printer\",\"quantity\":1,\"borrower_name\":\"Liejay Jabines\",\"borrower_email\":\"jay@gmail.com\",\"return_condition\":\"good\",\"return_comments\":\"\",\"admin_id\":6717}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-12-16 18:09:01'),
('41ff9777-c3b6-44b7-852f-a102bec1233a', '6717', 'item_return', 'Admin processed return of \'3D Printer\' (Qty: 1) from Liejay Jabines. Condition: good', 'borrow_item', '2bba66d7-973e-43d9-8ceb-8d2027b5d41d', '{\"borrow_record_id\":\"2bba66d7-973e-43d9-8ceb-8d2027b5d41d\",\"item\":\"3D Printer\",\"quantity\":1,\"borrower_name\":\"Liejay Jabines\",\"borrower_email\":\"jay@gmail.com\",\"return_condition\":\"good\",\"return_comments\":\"\",\"admin_id\":6717}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-12-16 17:23:43'),
('5ffd5609-e537-47d3-b530-1e38e47dd97b', '6717', 'item_return', 'Admin processed return of \'Multimeter\' (Qty: 3) from Liejay Jabines. Condition: good', 'borrow_item', '02740a96-150d-4979-9384-3febd9ef878a', '{\"borrow_record_id\":\"02740a96-150d-4979-9384-3febd9ef878a\",\"item\":\"Multimeter\",\"quantity\":3,\"borrower_name\":\"Liejay Jabines\",\"borrower_email\":\"jay@gmail.com\",\"return_condition\":\"good\",\"return_comments\":\"\",\"admin_id\":6717}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-12-16 17:19:28'),
('f731ce8e-86ec-4908-8b89-fc29b36802ad', '6717', 'item_return', 'Admin processed return of \'VR Headset\' (Qty: 1) from Liejay Jabines. Condition: good', 'borrow_item', 'ae866d24-9b19-49c3-bd64-3baf9584dee7', '{\"borrow_record_id\":\"ae866d24-9b19-49c3-bd64-3baf9584dee7\",\"item\":\"VR Headset\",\"quantity\":1,\"borrower_name\":\"Liejay Jabines\",\"borrower_email\":\"jay@gmail.com\",\"return_condition\":\"good\",\"return_comments\":\"\",\"admin_id\":6717}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-12-16 17:19:52');

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
  `return_processed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `borrow_items`
--

INSERT INTO `borrow_items` (`id`, `request_id`, `borrower_name`, `borrower_email`, `item`, `quantity`, `borrow_date`, `return_date`, `status`, `created_at`, `created_by`, `return_condition`, `return_comments`, `return_processed_by`, `return_processed_at`) VALUES
('02740a96-150d-4979-9384-3febd9ef878a', 'e9c87d6e-32c9-4434-bb81-118457fad1e6', 'Liejay Jabines', 'jay@gmail.com', 'Multimeter', 3, '2025-12-16', '2025-12-17', 'returned', '2025-12-16 16:18:18', '6717', 'good', '', '6717', '2025-12-16 17:19:28'),
('072ad8d8-64ce-457a-862a-b12fe6df3b48', '774e53de-1e20-4f9c-819e-f6cb6c68756c', '', 'benjie.trozo@csucc.edu.ph', 'Screwdriver Set', 1, '2025-12-16', '2025-12-19', 'borrowed', '2025-12-16 18:29:50', '9786', NULL, NULL, NULL, NULL),
('2bba66d7-973e-43d9-8ceb-8d2027b5d41d', '290fc467-2c5f-4281-9157-7428b8b012ad', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-16', '2025-12-26', 'returned', '2025-12-16 12:10:01', '6717', 'good', '', '6717', '2025-12-16 17:23:43'),
('42ec740f-9a20-4650-a479-ba2b0af13e98', '71855491-f85c-4fef-bf9f-852e8b1c19b3', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-16', '2025-12-17', 'borrowed', '2025-12-16 18:35:24', '6717', NULL, NULL, NULL, NULL),
('4df9a1e8-2368-45d7-8688-6fa0e67c384d', '8f3ae513-04ec-40eb-a204-82a73f2fde93', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-16', '2025-12-17', 'returned', '2025-12-16 11:51:48', '6717', 'good', '', '6717', '2025-12-16 18:09:01'),
('7278ddfa-5db0-4855-9df0-ba93f3e9aa5e', 'e0f5f90c-dd59-493d-a8c0-6ae4930b6e5e', 'Test Student', 'jay@gmail.com', '0', 1, '2025-12-10', '2025-12-13', 'borrowed', '2025-12-10 15:43:36', '6717', NULL, NULL, NULL, NULL),
('955a7738-8961-4f34-a49c-3ff8224d4566', '17d3580b-a528-4831-8daf-e1ba74f1e56e', 'Liejay Jabines', 'jay@gmail.com', '0', 1, '2025-12-10', '0000-00-00', 'returned', '2025-12-10 14:47:51', '6717', 'needs_repair', NULL, NULL, NULL),
('ae866d24-9b19-49c3-bd64-3baf9584dee7', '95720de3-cd7d-47fd-91d0-e52b6552b01b', 'Liejay Jabines', 'jay@gmail.com', 'VR Headset', 1, '2025-12-16', '2025-12-17', 'returned', '2025-12-16 16:16:52', '6717', 'good', '', '6717', '2025-12-16 17:19:52');

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
  `message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `borrow_requests`
--

INSERT INTO `borrow_requests` (`id`, `borrower_name`, `borrower_email`, `item`, `quantity`, `request_date`, `return_date`, `status`, `approved_by`, `approved_at`, `rejection_reason`, `created_at`, `created_by`, `message`) VALUES
('00659a20-9c02-40b2-90f9-0080eaeeeb6a', 'Liejay Jabines', 'jay@gmail.com', '0', 1, '2025-12-10', '2025-12-11', 'approved', '6717', '2025-12-10 02:17:04', '', '2025-12-10 10:16:42', '9782', NULL),
('02f7aa2f-73a1-4d85-b2c1-688138961ca7', 'Test User', 'test@example.com', '0', 2, '2025-12-10', '2025-12-17', 'approved', '6717', '2025-12-10 07:44:17', '', '2025-12-10 14:44:17', 'test-user', NULL),
('09856875-4582-4aaf-af31-f1de5ea49980', 'Liejay Jabines', 'jay@gmail.com', '0', 1, '2025-12-10', '2025-12-11', 'approved', '6717', '2025-12-10 02:15:26', '', '2025-12-10 10:15:07', '9782', NULL),
('0cde7cd5-34b1-4eca-9be7-cd7c422a2bf0', 'Neil Bryant Galindez', 'neil@gmail.com', '0', 1, '2025-12-11', '2025-12-12', 'approved', '6717', '2025-12-11 07:17:39', '', '2025-12-11 15:16:32', '88', NULL),
('10a8b52b-8e78-49aa-86fa-91102a303313', 'Test User (test@example.com)', 'test@example.com', '0', 1, '2025-12-10', NULL, 'approved', '6717', '2025-12-10 07:24:53', NULL, '2025-12-10 14:24:48', 'test-user', NULL),
('14e2c4da-26b1-47c0-9c67-34156d83e316', 'Test User (test@example.com)', 'test@example.com', '0', 1, '2025-12-10', NULL, 'approved', '6717', '2025-12-10 07:42:05', NULL, '2025-12-10 14:41:55', 'test-user', NULL),
('17d3580b-a528-4831-8daf-e1ba74f1e56e', 'Liejay Jabines', 'jay@gmail.com', '0', 1, '2025-12-10', '0000-00-00', 'approved', '6717', '2025-12-10 06:47:51', '', '2025-12-10 14:45:02', '9782', NULL),
('290fc467-2c5f-4281-9157-7428b8b012ad', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-16', '2025-12-26', 'approved', '6717', '2025-12-16 04:10:01', '', '2025-12-16 12:09:43', '9782', 'return'),
('30ead581-5e9a-49c2-a81f-5daf06dc00f4', 'Test User', 'jay@gmail.com', '0', 1, '2025-12-10', '2025-12-17', 'approved', '6717', '2025-12-10 08:45:11', '', '2025-12-10 15:45:11', '9782', NULL),
('3a5e56c0-d810-4cec-aa21-8d2a319d0644', 'Test User', 'test@example.com', '0', 2, '2025-12-10', '2025-12-17', 'approved', '6717', '2025-12-10 07:43:14', '', '2025-12-10 14:43:14', 'test-user', NULL),
('40f082b2-5546-497e-9c96-413357c3a23c', 'Jane Student', 'jay@gmail.com', '0', 2, '2025-12-10', '2025-12-15', 'approved', '6717', '2025-12-10 07:45:31', '', '2025-12-10 15:41:43', '9782', NULL),
('42f5637d-d3b2-4097-a58b-5cbe3c8852f9', 'Test User 2', 'jay@gmail.com', '0', 2, '2025-12-10', '2025-12-15', 'approved', '6717', '2025-12-10 07:48:24', '', '2025-12-10 15:30:11', '9782', NULL),
('4870be06-9a95-464d-9e32-a50511cc60b2', 'Liejay Jabines', 'jay@gmail.com', '0', 1, '2025-12-10', '2025-12-11', 'approved', '6717', '2025-12-10 06:15:21', '', '2025-12-10 14:03:04', '9782', NULL),
('5337172e-1a21-4cde-8734-b8e6d3b8f7fb', 'Liejay Jabines', 'jay@gmail.com', '3', 1, '2025-12-10', '2025-12-11', 'approved', '6717', '2025-12-10 06:39:39', '', '2025-12-10 14:29:47', '9782', NULL),
('54c1d7fc-166a-458e-97e1-540fab119c0c', 'Test User', 'test@example.com', '0', 2, '2025-12-10', '2025-12-17', 'approved', '6717', '2025-12-10 07:42:50', '', '2025-12-10 14:42:50', 'test-user', NULL),
('5fe760f3-9a02-4227-813c-a310d7041d48', 'Liejay Jabines', 'jay@gmail.com', '0', 1, '2025-12-10', '2025-12-11', 'approved', '6717', '2025-12-10 06:39:47', '', '2025-12-10 14:27:41', '9782', NULL),
('71855491-f85c-4fef-bf9f-852e8b1c19b3', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-16', '2025-12-17', 'approved', '6717', '2025-12-16 10:35:24', '', '2025-12-16 11:40:20', '9782', 'basta'),
('774e53de-1e20-4f9c-819e-f6cb6c68756c', '', 'benjie.trozo@csucc.edu.ph', 'Screwdriver Set', 1, '2025-12-16', '2025-12-19', 'approved', '9786', '2025-12-16 10:29:50', '', '2025-12-16 18:29:31', '6717', 'secret'),
('7b452ec8-f543-4677-8598-51bcaca6e4fd', 'Liejay Jabines', 'jay@gmail.com', 'Screwdriver Set', 1, '2025-12-12', '2025-12-13', 'approved', '6717', '2025-12-12 06:05:06', '', '2025-12-12 14:04:38', '9782', 'basta'),
('8b468ebe-3c33-438b-93d4-2c69412540f0', 'Liejay Jabines', 'jay@gmail.com', '0', 1, '2025-12-10', '2025-12-11', 'approved', '6717', '2025-12-10 07:37:41', '', '2025-12-10 15:32:45', '9782', NULL),
('8ed7b10a-93e5-4a0d-85e9-dd7ab99fd85a', 'Liejay Jabines', 'jay@gmail.com', '0', 1, '2025-12-10', '2025-12-11', 'approved', '6717', '2025-12-10 02:11:26', '', '2025-12-10 10:08:57', '9782', NULL),
('8f3ae513-04ec-40eb-a204-82a73f2fde93', 'Liejay Jabines', 'jay@gmail.com', '3D Printer', 1, '2025-12-16', '2025-12-17', 'approved', '6717', '2025-12-16 03:51:48', '', '2025-12-16 11:51:32', '9782', 'secret'),
('91a150e9-b1e1-4726-82e4-f9c54624b1f3', 'Test Student User', 'jay@gmail.com', '0', 1, '2025-12-10', '2025-12-15', 'approved', '6717', '2025-12-10 08:50:18', '', '2025-12-10 15:50:18', '9782', NULL),
('95720de3-cd7d-47fd-91d0-e52b6552b01b', 'Liejay Jabines', 'jay@gmail.com', 'VR Headset', 1, '2025-12-16', '2025-12-17', 'approved', '6717', '2025-12-16 08:16:52', '', '2025-12-16 16:14:19', '9782', 'aw'),
('a1aed99e-e1c6-4007-a631-25242a94a239', 'Test User', 'test@example.com', '0', 2, '2025-12-10', '2025-12-17', 'approved', '6717', '2025-12-10 07:47:45', '', '2025-12-10 14:47:45', 'test-user', NULL),
('b2c5c8b6-82bf-4462-aea8-4b7a62f7b4a8', 'Liejay Jabines', 'jay@gmail.com', '0', 1, '2025-12-10', '2025-12-11', 'approved', '6717', '2025-12-10 01:54:59', '', '2025-12-10 09:52:16', '9782', NULL),
('bb0e7214-5b1e-4188-94f6-f16c73cb7110', 'Test Student', 'student@test.com', '0', 1, '2025-12-10', '2025-12-17', 'approved', '6717', '2025-12-10 01:54:47', '', '2025-12-10 09:53:59', NULL, NULL),
('cb58a715-b05a-4f7a-9105-20773ed20443', 'Test User (test@example.com)', 'test@example.com', '0', 1, '2025-12-10', NULL, 'approved', '6717', '2025-12-10 07:25:29', NULL, '2025-12-10 14:25:13', 'test-user', NULL),
('e0f5f90c-dd59-493d-a8c0-6ae4930b6e5e', 'Test Student', 'jay@gmail.com', '0', 1, '2025-12-10', '2025-12-13', 'approved', '6717', '2025-12-10 08:43:36', '', '2025-12-10 15:43:36', '9782', NULL),
('e9c87d6e-32c9-4434-bb81-118457fad1e6', 'Liejay Jabines', 'jay@gmail.com', 'Multimeter', 3, '2025-12-16', '2025-12-17', 'approved', '6717', '2025-12-16 08:18:18', '', '2025-12-16 15:53:10', '9782', 'wa');

-- --------------------------------------------------------

--
-- Table structure for table `equipment_reservations`
--

CREATE TABLE `equipment_reservations` (
  `id` char(36) NOT NULL,
  `equipment_id` char(36) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reservation_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `quantity_reserved` int(11) NOT NULL DEFAULT 1,
  `purpose` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled','completed') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `equipment_reservations`
--

INSERT INTO `equipment_reservations` (`id`, `equipment_id`, `user_id`, `reservation_date`, `start_time`, `end_time`, `quantity_reserved`, `purpose`, `status`, `approved_by`, `approved_at`, `rejection_reason`, `notes`, `created_at`, `updated_at`) VALUES
('550e8400-e29b-41d4-a716-446655440000', '6938fd60ed14c', 9782, '2025-12-11', '09:00:00', '11:00:00', 1, 'Electronics project work', 'approved', NULL, NULL, NULL, NULL, '2025-12-10 16:00:00', '2025-12-10 16:50:51'),
('550e8400-e29b-41d4-a716-446655440001', '6938fd60ef1bd', 9782, '2025-12-11', '14:00:00', '16:00:00', 1, 'Circuit testing', 'approved', 6717, '2025-12-16 17:01:32', NULL, 'nope', '2025-12-10 16:30:00', '2025-12-16 17:01:32'),
('550e8400-e29b-41d4-a716-446655440003', '6938fd60f1051', 9782, '2025-12-13', '13:00:00', '15:00:00', 3, 'Network cable preparation', 'approved', NULL, NULL, NULL, NULL, '2025-12-10 14:00:00', '2025-12-10 16:50:51');

-- --------------------------------------------------------

--
-- Table structure for table `incident_reports`
--

CREATE TABLE `incident_reports` (
  `id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `incident_type` varchar(50) NOT NULL,
  `severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `location` varchar(255) DEFAULT NULL,
  `reported_by` varchar(255) NOT NULL,
  `date_occurred` date NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `incident_reports`
--

INSERT INTO `incident_reports` (`id`, `title`, `description`, `incident_type`, `severity`, `location`, `reported_by`, `date_occurred`, `created_at`) VALUES
('0a0c0606-66d9-4b5d-970a-5cad52c17c4d', 'hello', 'nope', 'other', 'critical', 'cl 5', 'Liejay Jabines', '2025-12-16', '2025-12-16 16:57:34'),
('12345678-1234-1234-1234-123456789abc', 'Sample Incident Report', 'This is a sample incident report to test the system functionality. The system allows users to report incidents and admins to add updates.', 'hardware', 'medium', 'Lab A - Workstation 1', 'Test User', '2025-12-16', '2025-12-16 16:47:35'),
('c5ab3026-157c-4827-8712-daaa31a83679', 'hi', 'nope', 'other', 'critical', '', 'Liejay Jabines', '2025-12-16', '2025-12-16 16:55:51');

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
(8, '6938fd6100c8b', '3D Printer', 'borrow_deduction', -1, '6717', '71855491-f85c-4fef-bf9f-852e8b1c19b3', '2025-12-16 18:35:24');

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
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_equipment`
--

INSERT INTO `inventory_equipment` (`id`, `date`, `name`, `category`, `item_type`, `item_description`, `serial_number`, `quantity`, `purpose`, `signature`, `date_returned`, `condition`, `created_at`, `created_by`) VALUES
('0d4a42440675472c37ee6ee5b46e0a5c', '2025-12-05', 'Admin', 'Computer', 'equipment', 'New', '12345', 25, '', NULL, '0000-00-00', 'Excellent', '2025-12-05 17:17:57', '6717'),
('6938fd60ed14c', '2025-12-10', 'Screwdriver Set', 'Tools', 'tool', 'Complete set of Phillips and flathead screwdrivers', 'TL-001', 3, 'General lab work', NULL, NULL, NULL, '2025-12-10 12:56:00', NULL),
('6938fd60ef1bd', '2025-12-10', 'Multimeter', 'Tools', 'tool', 'Digital multimeter for electrical measurements', 'TL-002', 3, 'Electrical testing', NULL, NULL, NULL, '2025-12-10 12:56:00', NULL),
('6938fd60efb4f', '2025-12-10', 'Soldering Iron', 'Tools', 'tool', 'Temperature-controlled soldering station', 'TL-003', 2, 'Electronics work', NULL, NULL, NULL, '2025-12-10 12:56:00', NULL),
('6938fd60f1051', '2025-12-10', 'Wire Stripper', 'Tools', 'tool', 'Automatic wire stripper tool', 'TL-004', 8, 'Cable preparation', NULL, NULL, NULL, '2025-12-10 12:56:00', NULL),
('6938fd60f16f1', '2025-12-10', 'Oscilloscope', 'Tools', 'tool', 'Digital oscilloscope 100MHz', 'TL-005', 1, 'Signal analysis', NULL, NULL, NULL, '2025-12-10 12:56:00', NULL),
('6938fd60f1ec9', '2025-12-10', 'Laptop Computer', 'Computers', 'equipment', 'Dell Latitude laptop with Windows 11', 'EQ-001', 10, 'Student use', NULL, NULL, NULL, '2025-12-10 12:56:00', NULL),
('6938fd60f331c', '2025-12-10', 'Projector', 'AV Equipment', 'equipment', 'Epson HD projector', 'EQ-002', 4, 'Presentations', NULL, NULL, NULL, '2025-12-10 12:56:00', NULL),
('6938fd60f3987', '2025-12-10', 'Microscope', 'Lab Equipment', 'equipment', 'Compound microscope 1000x', 'EQ-003', 6, 'Biology labs', NULL, NULL, NULL, '2025-12-10 12:56:00', NULL),
('6938fd6100c8b', '2025-12-10', '3D Printer', 'Manufacturing', 'equipment', 'Creality Ender 3 3D printer', 'EQ-004', 1, 'Prototyping', NULL, NULL, NULL, '2025-12-10 12:56:01', NULL),
('6938fd6101db1', '2025-12-10', 'VR Headset', 'VR Equipment', 'equipment', 'Oculus Quest 2 VR headset', 'EQ-005', 3, 'Virtual reality training', NULL, NULL, NULL, '2025-12-10 12:56:01', NULL);

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
  `date_occurred` date NOT NULL,
  `date_claimed` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lost_found`
--

INSERT INTO `lost_found` (`id`, `title`, `description`, `item_type`, `status`, `location`, `reported_by`, `contact_info`, `date_occurred`, `date_claimed`, `created_at`, `updated_at`) VALUES
('7ac8954e-aac6-4da1-bf91-e42fcdcce936', 'iphne 17 pro max found', 'nakit-an nako sa ilalom sa pc', 'electronics', 'found', 'cl 5', 'Liejay Jabines', '0992302492', '2025-12-16', NULL, '2025-12-16 17:32:43', '2025-12-16 17:32:43'),
('7b521a09-2c53-4b6c-9505-56810a6cb0ff', 'iPhone 13', 'Black iPhone 13 with blue case, screen has small crack', 'electronics', 'found', 'Lab A - Desk 5', 'Test User', 'test@example.com', '2025-12-16', NULL, '2025-12-16 13:06:40', '2025-12-16 13:06:40');

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
('e52062cb-1935-4608-8d5b-e7793ec14617', '9783', 'New Incident Report', 'New incident reported: Network Connection Issue (network - high) at Lab B - Workstations 10-15 by Test User', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"f80cc781-786f-4915-a891-48d3df4b609e\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: Network Connection Issue (network - high) at Lab B - Workstations 10-15 by Test User\",\"incident_title\":\"Network Connection Issue\",\"incident_type\":\"network\",\"severity\":\"high\",\"location\":\"Lab B - Workstations 10-15\",\"reported_by\":\"Test User\",\"timestamp\":\"2025-12-16 05:18:43\",\"actionUrl\":\"\\/incident-reports\"}', 0, '/incident-reports', '2025-12-16 12:18:43', '2025-12-16 12:18:43'),
('e532c206-99b8-448d-9185-91b5f5da9c17', '9783', 'New Incident Report', 'New incident reported: naay buang diri sir (other - critical) at  by Liejay Jabines', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"c5ab3026-157c-4827-8712-daaa31a83679\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: naay buang diri sir (other - critical) at  by Liejay Jabines\",\"incident_title\":\"naay buang diri sir\",\"incident_type\":\"other\",\"severity\":\"critical\",\"location\":\"\",\"reported_by\":\"Liejay Jabines\",\"timestamp\":\"2025-12-16 09:55:51\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-16 16:55:51', '2025-12-16 16:55:51'),
('e5730071-7deb-43ed-8b43-cc0a1167cbeb', '9787', 'New Incident Report', 'New incident reported: guba ang pc (hardware - medium) at cl 2 station 5 by Liejay Jabines', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"d2a23f69-1915-40a1-ab40-95a808014979\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: guba ang pc (hardware - medium) at cl 2 station 5 by Liejay Jabines\",\"incident_title\":\"guba ang pc\",\"incident_type\":\"hardware\",\"severity\":\"medium\",\"location\":\"cl 2 station 5\",\"reported_by\":\"Liejay Jabines\",\"timestamp\":\"2025-12-16 09:31:12\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-16 16:31:12', '2025-12-16 16:31:12'),
('e614bbf4-d528-4443-9a3a-5d5ab283122d', '9783', 'New Lost & Found Item', 'New found item reported: found Iphone 17 pro max found (electronics) at comlab 1 by Liejay Jabines', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"cc97fefe-6b36-4d4f-a779-89c642a07ba7\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found Iphone 17 pro max found (electronics) at comlab 1 by Liejay Jabines\",\"item_title\":\"found Iphone 17 pro max found\",\"item_type\":\"electronics\",\"status\":\"found\",\"location\":\"comlab 1\",\"reported_by\":\"Liejay Jabines\",\"timestamp\":\"2025-12-16 06:21:56\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-16 13:21:56', '2025-12-16 13:21:56'),
('ecce40fe-013c-403d-8447-e7b2d05d66cf', '9786', 'New Incident Report', 'New incident reported: naay buang diri sir (other - critical) at  by Liejay Jabines', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"c5ab3026-157c-4827-8712-daaa31a83679\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: naay buang diri sir (other - critical) at  by Liejay Jabines\",\"incident_title\":\"naay buang diri sir\",\"incident_type\":\"other\",\"severity\":\"critical\",\"location\":\"\",\"reported_by\":\"Liejay Jabines\",\"timestamp\":\"2025-12-16 09:55:51\",\"actionUrl\":\"\\/incidents\"}', 1, '/incidents', '2025-12-16 16:55:51', '2025-12-16 18:20:44'),
('ef60873a-596a-4cf8-a3d3-b18b58f0433e', 'admin_broadcast', 'New Incident Report', 'New incident reported: naay buang diri sir (other - critical) at  by Liejay Jabines', 'new_incident_report', '{\"type\":\"new_incident_report\",\"incident_id\":\"c5ab3026-157c-4827-8712-daaa31a83679\",\"title\":\"New Incident Report\",\"message\":\"New incident reported: naay buang diri sir (other - critical) at  by Liejay Jabines\",\"incident_title\":\"naay buang diri sir\",\"incident_type\":\"other\",\"severity\":\"critical\",\"location\":\"\",\"reported_by\":\"Liejay Jabines\",\"timestamp\":\"2025-12-16 09:55:51\",\"actionUrl\":\"\\/incidents\"}', 0, '/incidents', '2025-12-16 16:55:51', '2025-12-16 16:55:51'),
('f92e92b9-c46e-4906-8be7-b063c98bd849', 'admin_broadcast', 'New Borrow Request', 'Liejay Jabines has requested to borrow 3 x Multimeter', 'admin_borrow_update', '{\"type\":\"admin_borrow_update\",\"request_id\":\"e9c87d6e-32c9-4434-bb81-118457fad1e6\",\"borrower_name\":\"Liejay Jabines\",\"item\":\"Multimeter\",\"quantity\":3,\"user_id\":9782,\"timestamp\":\"2025-12-16 08:53:10\",\"title\":\"New Borrow Request\",\"message\":\"Liejay Jabines has requested to borrow 3 x Multimeter\",\"actionUrl\":\"\\/borrow-requests\"}', 0, '/borrow-requests', '2025-12-16 15:53:10', '2025-12-16 15:53:10'),
('fa76866a-a945-4a4b-99ae-ab1b2210edd8', '9787', 'New Lost & Found Item', 'New found item reported: found Iphone 17 pro max found (electronics) at comlab 1 by Liejay Jabines', 'new_lostfound_item', '{\"type\":\"new_lostfound_item\",\"item_id\":\"cc97fefe-6b36-4d4f-a779-89c642a07ba7\",\"title\":\"New Lost & Found Item\",\"message\":\"New found item reported: found Iphone 17 pro max found (electronics) at comlab 1 by Liejay Jabines\",\"item_title\":\"found Iphone 17 pro max found\",\"item_type\":\"electronics\",\"status\":\"found\",\"location\":\"comlab 1\",\"reported_by\":\"Liejay Jabines\",\"timestamp\":\"2025-12-16 06:21:56\",\"actionUrl\":\"\\/lost-found\"}', 0, '/lost-found', '2025-12-16 13:21:56', '2025-12-16 13:21:56'),
('test-notification-6940d5944374b', '9787', 'Test Notification', 'This is a test notification for WebSocket testing', 'test', '{\"test\":true}', 1, NULL, '2025-12-16 11:44:20', '2025-12-16 11:57:21'),
('test-notification-6940d8dc7b27a', '9787', 'Another Test Notification', 'This is another test notification for testing mark all as read', 'test', '{\"test\":true}', 1, NULL, '2025-12-16 11:58:20', '2025-12-16 11:58:39');

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
  `created_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `repair_maintenance`
--

INSERT INTO `repair_maintenance` (`id`, `date`, `equipment_name`, `serial_number`, `issue_description`, `action_taken`, `technician_name`, `status`, `created_at`, `created_by`) VALUES
('2c507334-da63-11f0-8514-e4e7494af02c', '2025-12-16', 'printer', '12345', 'di mu print', 'gi repaire pa', 'sir babals', 'Pending', '2025-12-16 17:39:52', '6717');

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
('660e8400-e29b-41d4-a716-446655440000', '6938fd60f16f1', 9782, 1, '2025-12-11', '10:00:00', '12:00:00', 'Urgent signal analysis', 'high', 'fulfilled', NULL, '2025-12-16 07:42:04', NULL, '2025-12-10 17:00:00'),
('660e8400-e29b-41d4-a716-446655440001', '6938fd6100c8b', 9782, 1, '2025-12-12', '09:00:00', '11:00:00', 'Student project work', 'medium', 'notified', '2025-12-16 08:59:30', NULL, NULL, '2025-12-10 16:45:00');

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
(1, 'maintenance_mode', 'false', 'System maintenance mode - when enabled, users cannot login', '2025-12-16 14:02:57', NULL),
(2, 'maintenance_message', 'System is currently under maintenance. Please try again later.', 'Message displayed during maintenance mode', '2025-12-16 14:02:57', NULL),
(43, 'reservation_advance_days', '7', 'Maximum days in advance users can make reservations', '2025-12-16 14:02:57', NULL),
(44, 'reservation_max_duration_hours', '4', 'Maximum reservation duration in hours', '2025-12-16 14:02:57', NULL),
(45, 'reservation_auto_approve', 'false', 'Automatically approve reservations if no conflicts', '2025-12-16 14:02:57', NULL),
(46, 'reservation_require_approval', 'true', 'Require admin approval for all reservations', '2025-12-16 14:02:57', NULL);

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
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `first_name`, `middle_name`, `last_name`, `password_hash`, `role`, `avatar_url`, `id_number`, `created_at`) VALUES
(88, 'neil@gmail.com', 'Neil Bryant', '', 'Galindez', '$2y$10$eY2vwqM5JB8KPVWzCi65WOsR1NOcQzm9Q8j4AG9Xces6zoFpV23au', 'instructor', 'api/uploads/avatars/88.jpg', '2022-1235', '2025-12-11 10:25:38'),
(6717, 'benjie.trozo@csucc.edu.ph', NULL, NULL, NULL, '$2y$10$CMMaW/gtubTZ9O3lLYZDo.dvBkLFXYW01A7lCfKro.SoTq6SB8IQq', 'admin', 'api/uploads/avatars/6717.jpg', '2022-1010', '2025-12-04 16:11:16'),
(9782, 'jay@gmail.com', 'Liejay', '', 'Jabines', '$2y$10$PBpIPDLui4fKwgIcd99e5egXAvHfVpvP6sL1Qf55JB/dnFCuoEoQG', 'user', 'api/uploads/avatars/9782.jpg', '2022-1012', '2025-12-09 21:40:15'),
(9783, 'babals@gmail.com', 'Robert', '', 'Pahit', '$2y$10$deF9Ez3ld/cW4LHpKB0COumiHh7c854X15jnb1VGdn05OWEnPGAL.', 'admin', NULL, '2022-1234', '2025-12-11 11:09:17'),
(9784, 'lelen@gmail.com', 'Melenio', '', 'Caturan', '$2y$10$omPw1tbMfF0uC68zE2TJpuDE5nWYEYtD4hNGdYOMehCEMt4t1dgdS', 'instructor', NULL, '2022-1237', '2025-12-11 11:11:11'),
(9785, 'ting@gmail.com', 'Ako Si', 'Ting', 'Inamo', '$2y$10$6ZU8pdy84nJa.NyktAgb2.8.38xsRWNoiY/j0boNxOnSPVfrVMFS.', 'instructor', NULL, '2022-1238', '2025-12-11 11:12:26'),
(9786, 'trozo@gmail.com', 'Benjie', '', 'Trozo', '$2y$10$lvIUNQGJHcjErAZyVEo0mOsQLgZs9U43kfamC/cxC5yQD05N2nm9G', 'admin', NULL, '2022-1010', '2025-12-11 11:18:04');

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
  `created_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visitor_logs`
--

INSERT INTO `visitor_logs` (`id`, `name`, `purpose`, `date`, `time_in`, `time_out`, `signature`, `created_at`, `created_by`) VALUES
('51e801ef-da5e-11f0-8514-e4e7494af02c', 'BENJIE', 'repair', '2025-12-17', '06:05:00', '09:09:00', '', '2025-12-16 17:05:08', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action_type` (`action_type`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_related_item` (`related_item_type`,`related_item_id`);

--
-- Indexes for table `borrow_items`
--
ALTER TABLE `borrow_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_borrower_email` (`borrower_email`);

--
-- Indexes for table `equipment_reservations`
--
ALTER TABLE `equipment_reservations`
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_reservation_schedule` (`equipment_id`,`reservation_date`,`start_time`,`end_time`,`status`),
  ADD KEY `idx_user_reservations` (`user_id`,`status`);

--
-- Indexes for table `incident_reports`
--
ALTER TABLE `incident_reports`
  ADD PRIMARY KEY (`id`);

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
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lost_found`
--
ALTER TABLE `lost_found`
  ADD PRIMARY KEY (`id`);

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
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `inventory_audit`
--
ALTER TABLE `inventory_audit`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9788;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `equipment_reservations`
--
ALTER TABLE `equipment_reservations`
  ADD CONSTRAINT `equipment_reservations_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `inventory_equipment` (`id`),
  ADD CONSTRAINT `equipment_reservations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `equipment_reservations_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `incident_updates`
--
ALTER TABLE `incident_updates`
  ADD CONSTRAINT `incident_updates_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `reservation_waiting_list`
--
ALTER TABLE `reservation_waiting_list`
  ADD CONSTRAINT `reservation_waiting_list_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `inventory_equipment` (`id`),
  ADD CONSTRAINT `reservation_waiting_list_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
