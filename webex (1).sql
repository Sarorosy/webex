-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 10, 2025 at 11:30 AM
-- Server version: 8.0.40
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webex`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_groups`
--

CREATE TABLE `tbl_groups` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `member_limit` int UNSIGNED DEFAULT '10',
  `favourites` text,
  `created_by` bigint UNSIGNED NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_groups`
--

INSERT INTO `tbl_groups` (`id`, `name`, `description`, `member_limit`, `favourites`, `created_by`, `created_at`, `updated_at`) VALUES
(5, 'Web Ninjas', 'Web related Members', 10, '[1]', 1, '2025-05-08 14:35:13', '2025-05-09 14:49:19');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_group_members`
--

CREATE TABLE `tbl_group_members` (
  `id` bigint UNSIGNED NOT NULL,
  `group_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `joined_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_group_members`
--

INSERT INTO `tbl_group_members` (`id`, `group_id`, `user_id`, `joined_at`) VALUES
(1, 5, 1, '2025-05-08 14:35:13'),
(2, 5, 2, '2025-05-08 14:35:13');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_messages`
--

CREATE TABLE `tbl_messages` (
  `id` bigint UNSIGNED NOT NULL,
  `sender_id` bigint UNSIGNED NOT NULL,
  `receiver_id` bigint UNSIGNED DEFAULT NULL,
  `group_id` bigint UNSIGNED DEFAULT NULL,
  `message` text NOT NULL,
  `is_edited` tinyint(1) DEFAULT '0',
  `is_forwarded` int NOT NULL DEFAULT '0',
  `pinned_users` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_messages`
--

INSERT INTO `tbl_messages` (`id`, `sender_id`, `receiver_id`, `group_id`, `message`, `is_edited`, `is_forwarded`, `pinned_users`, `created_at`) VALUES
(1, 1, 20, NULL, 'Hello', 0, 0, NULL, '2025-05-08 15:09:55'),
(2, 1, NULL, 5, 'Hello Guyss!', 0, 0, NULL, '2025-05-08 15:12:58'),
(3, 2, 1, NULL, 'Hii Bro!', 0, 0, NULL, '2025-05-08 15:13:50'),
(9, 1, 20, NULL, 'Hii', 0, 0, NULL, '2025-05-08 17:47:27'),
(16, 1, 20, NULL, 'test', 0, 0, '[1]', '2025-05-08 17:55:50'),
(17, 1, 2, NULL, 'hii', 0, 0, NULL, '2025-05-08 17:56:29'),
(18, 1, 2, NULL, 'test', 0, 0, NULL, '2025-05-08 17:57:17'),
(19, 1, 2, NULL, 'Hello', 0, 0, NULL, '2025-05-08 17:59:22'),
(20, 1, 2, NULL, 'test', 0, 0, NULL, '2025-05-08 17:59:29'),
(21, 1, 2, NULL, 'Nice', 0, 0, NULL, '2025-05-08 18:00:06'),
(22, 1, 20, NULL, 'test', 0, 0, NULL, '2025-05-08 18:02:26'),
(23, 1, 20, NULL, 'Bing', 0, 0, '[]', '2025-05-08 18:02:40'),
(24, 1, 20, NULL, 'Bingoo', 0, 0, NULL, '2025-05-08 18:05:10'),
(25, 1, 2, NULL, 'Hello', 0, 0, NULL, '2025-05-08 18:06:58'),
(26, 1, 20, NULL, 'New', 0, 0, NULL, '2025-05-08 18:07:27'),
(27, 20, 1, NULL, 'Hello', 0, 0, '[1]', '2025-05-08 18:11:47'),
(28, 20, 1, NULL, 'hello bro', 0, 0, NULL, '2025-05-08 18:12:40'),
(29, 20, 1, NULL, 'broo', 0, 0, '[1]', '2025-05-08 18:13:18'),
(30, 20, 1, NULL, 'Top', 0, 0, NULL, '2025-05-08 18:13:37'),
(31, 20, 1, NULL, 'Bro', 0, 0, NULL, '2025-05-08 18:14:04'),
(32, 20, 1, NULL, 'Newww', 0, 0, NULL, '2025-05-08 18:14:43'),
(33, 20, 1, NULL, '....', 0, 0, NULL, '2025-05-08 18:17:10'),
(34, 20, 1, NULL, '..', 0, 0, NULL, '2025-05-08 18:17:26'),
(35, 20, 1, NULL, '...', 0, 0, NULL, '2025-05-08 18:17:34'),
(36, 20, 1, NULL, '..', 0, 0, NULL, '2025-05-08 18:19:35'),
(37, 20, 1, NULL, 'ttt', 0, 0, NULL, '2025-05-08 18:19:41'),
(38, 20, 1, NULL, ',..', 0, 0, NULL, '2025-05-08 18:19:55'),
(39, 20, 1, NULL, '...', 0, 0, NULL, '2025-05-08 18:20:49'),
(40, 20, 1, NULL, 'Hi test', 0, 0, NULL, '2025-05-08 18:21:06'),
(41, 20, 1, NULL, 'Test', 0, 0, NULL, '2025-05-08 18:23:07'),
(42, 20, 1, NULL, 'hhhh', 0, 0, NULL, '2025-05-08 18:23:24'),
(43, 20, 1, NULL, 'hhh', 0, 0, NULL, '2025-05-08 18:23:35'),
(44, 20, 1, NULL, 'gfgfg', 0, 0, NULL, '2025-05-08 18:23:50'),
(45, 20, 1, NULL, 'ggg', 0, 0, NULL, '2025-05-08 18:24:37'),
(46, 20, 1, NULL, 'ggg', 0, 0, NULL, '2025-05-08 18:24:49'),
(47, 20, 1, NULL, 'fff', 0, 0, NULL, '2025-05-08 18:25:16'),
(48, 20, 1, NULL, 'kk', 0, 0, NULL, '2025-05-08 18:25:28'),
(49, 20, 1, NULL, 'fgfg', 0, 0, NULL, '2025-05-08 18:25:52'),
(50, 20, 1, NULL, 'bro', 0, 0, NULL, '2025-05-08 18:26:58'),
(51, 20, 1, NULL, 'broooo', 0, 0, NULL, '2025-05-08 18:27:07'),
(52, 20, 1, NULL, 'hhh', 0, 0, '[1]', '2025-05-08 18:27:26'),
(53, 20, 1, NULL, 'broo', 0, 0, '[1]', '2025-05-08 18:27:40'),
(54, 1, 20, NULL, 'Hmm sollunga', 0, 0, '[1]', '2025-05-08 18:27:52'),
(55, 1, 20, NULL, 'Ennachu', 0, 0, '[]', '2025-05-08 18:29:02'),
(56, 1, 20, NULL, 'Hii', 0, 0, '[1]', '2025-05-09 12:16:06'),
(57, 20, 1, NULL, 'Which task you are working?', 0, 0, NULL, '2025-05-09 14:53:48'),
(58, 20, 1, NULL, '?', 0, 0, '[1]', '2025-05-09 14:55:34'),
(59, 20, 1, NULL, '?', 0, 0, '[1]', '2025-05-09 14:56:03'),
(60, 20, 1, NULL, '?', 0, 0, NULL, '2025-05-09 14:56:34'),
(61, 1, 20, NULL, 'Tell', 0, 0, '[]', '2025-05-09 14:56:46'),
(62, 20, 1, NULL, 'Hmm', 0, 0, '[]', '2025-05-09 14:56:55'),
(63, 1, 20, NULL, 'Tell me', 0, 0, '[]', '2025-05-09 17:49:35'),
(64, 1, 20, NULL, 'Tell me', 0, 0, NULL, '2025-05-09 17:50:04'),
(65, 1, 20, NULL, 'Setup was done on monish panel Setup was done on monish panel\nBut his system facing Cache issue\nchanges were not affecting', 0, 0, NULL, '2025-05-09 17:55:58'),
(67, 2, 1, NULL, 'test', 0, 0, NULL, '2025-05-09 18:27:30'),
(68, 20, 1, NULL, 'Hmm Okay', 0, 0, '[]', '2025-05-09 18:28:05'),
(69, 1, 5, NULL, 'Sarah Johnson​ hello', 0, 0, NULL, '2025-05-10 12:34:48'),
(70, 1, 5, NULL, 'Michael Chen​ 👍', 0, 0, NULL, '2025-05-10 12:35:39'),
(71, 1, 5, NULL, 'David Kim​ hi', 0, 0, NULL, '2025-05-10 12:37:05'),
(72, 1, 5, NULL, '<span contenteditable=\"false\" class=\"e-mention-chip\">Aisha Patel</span>​ hii', 0, 0, NULL, '2025-05-10 12:37:32'),
(73, 1, 5, NULL, '<span contenteditable=\"false\" class=\"e-mention-chip\">David Kim</span>​ whats the progress ??<div><br></div>', 0, 0, NULL, '2025-05-10 12:43:51'),
(74, 20, 1, NULL, 'test message', 0, 0, NULL, '2025-05-10 12:58:48');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_replies`
--

CREATE TABLE `tbl_replies` (
  `id` int NOT NULL,
  `msg_id` int NOT NULL,
  `reply_message` text NOT NULL,
  `sender_id` int NOT NULL,
  `reply_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_replies`
--

INSERT INTO `tbl_replies` (`id`, `msg_id`, `reply_message`, `sender_id`, `reply_at`) VALUES
(1, 62, 'Tell me', 1, '2025-05-09 17:50:04'),
(2, 62, 'Setup was done on monish panel Setup was done on monish panel\nBut his system facing Cache issue\nchanges were not affecting', 1, '2025-05-09 17:55:58'),
(3, 65, 'Setup was done on monish panel Setup was done on monish panel But his system facing Cache issue changes were not affecting', 1, '2025-05-09 17:56:24'),
(4, 65, 'Ok Noted 👍', 20, '2025-05-09 18:00:37'),
(5, 65, 'Kindly Share this', 20, '2025-05-09 18:02:29'),
(6, 65, 'Sharing...', 1, '2025-05-09 18:03:55'),
(7, 51, 'Yeah', 1, '2025-05-10 13:00:18');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tasks`
--

CREATE TABLE `tbl_tasks` (
  `id` int NOT NULL,
  `unique_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `assigned_to` int DEFAULT NULL,
  `followers` text,
  `status` varchar(50) DEFAULT 'pending',
  `priority` varchar(50) DEFAULT 'medium',
  `due_date` date DEFAULT NULL,
  `due_time` time DEFAULT NULL,
  `image_url` text,
  `tags` varchar(255) DEFAULT NULL,
  `milestones` text,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_tasks`
--

INSERT INTO `tbl_tasks` (`id`, `unique_id`, `title`, `description`, `assigned_to`, `followers`, `status`, `priority`, `due_date`, `due_time`, `image_url`, `tags`, `milestones`, `created_by`, `created_at`, `updated_at`) VALUES
(5, 'MLOE8D85AH', 'LoopPanel Updates - NEW test', '<p>Need to implement Communication Hub in Loop Panel - <strong>DONE Modified </strong></p>', 1, '', 'pending', 'medium', '2025-03-24', '00:00:00', NULL, NULL, NULL, 1, '2025-03-24 10:44:54', '2025-03-26 12:41:03'),
(6, 'OXG1AF26FD', 'Salary Slip Management', '<p>Need to implement Salary Slip module, payroll calculation etc in attedance panel</p>', 2, '', 'pending', 'medium', '2025-03-30', '00:00:00', NULL, '[\"Important\"]', NULL, 1, '2025-03-25 05:30:34', '2025-03-26 10:59:45'),
(7, '7WOLDZELVC', 'TAGS', '<p>Test Tags</p>', NULL, '', 'pending', 'medium', '2025-03-23', '00:00:00', NULL, '[\"Important\",\"Urgent\"]', NULL, 1, '2025-03-25 09:08:13', '2025-04-01 06:50:59'),
(8, 'PEJCYYCZTB', 'Test Task test ', '<p>Test test </p>', 1, '1,2', 'pending', 'medium', '2025-03-25', '00:00:00', NULL, '[\"Important\",\"On Hold\"]', NULL, 1, '2025-03-26 12:35:01', '2025-03-27 09:49:36'),
(9, 'Z34IB9FCJW', 'Updated Followers', '<p>Updated Followers</p>', 1, '2,20,1', 'pending', 'medium', '2025-03-27', NULL, NULL, NULL, '[{\"id\":1,\"milestone_id\":\"6\",\"status\":\"Pending\",\"due_datetime\":\"2025-04-02 11:00:03\",\"completed_at\":null}]', 1, '2025-03-27 07:51:12', '2025-04-02 11:00:08'),
(10, '7MWDE0WGDZ', 'Test Task', '<p>Test task</p><p><br></p>', 2, '1', 'pending', 'medium', '2025-04-22', NULL, NULL, NULL, NULL, 1, '2025-04-01 07:21:44', '2025-04-01 09:54:43'),
(11, 'NKHAQ2ODHF', 'Test task 2', '<p>Test -- <strong>DONE</strong></p><p><br></p><p><strong>﻿</strong><img src=\"data:image/png;base64,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\"></p><p><br></p><p>all points Completed</p>', 2, '1,20', 'pending', 'medium', '2025-04-09', NULL, NULL, NULL, '[{\"status\":\"Completed\",\"due_datetime\":\"2025-04-01 19:30:00\",\"completed_at\":null},{\"status\":\"Completed\",\"due_datetime\":\"2025-04-02 00:01:37\",\"completed_at\":null},{\"status\":\"Pending\",\"due_datetime\":\"2025-04-03 00:01:00\",\"completed_at\":null}]', 1, '2025-04-01 07:24:07', '2025-05-09 07:00:45');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `token` text NOT NULL,
  `profile_pic` varchar(255) DEFAULT NULL,
  `pronouns` varchar(255) NOT NULL,
  `bio` varchar(255) NOT NULL DEFAULT 'Passionate About Work',
  `favourites` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `trashed` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_type` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`id`, `name`, `email`, `password`, `token`, `profile_pic`, `pronouns`, `bio`, `favourites`, `trashed`, `created_at`, `user_type`) VALUES
(1, 'Saravanan', 'web.dev.6@redmarkediting.com', 'sarorosy', 'fa57b3a1afcf758027cb3491a5db99b9', '/uploads/users/user_1742988065125.PNG', 'He/Him', 'Workaholic ❤', '', 0, '2025-01-02 05:05:18', 'admin'),
(2, 'Purushoth', 'purushoth@gmail.com', 'sarorosy', '931f3f2c6052a5592b3618a86bb2c250', NULL, '', 'Passionate About Work', '', 0, '2025-01-02 05:05:18', 'user'),
(20, 'Deva', 'deva@gmail.com', 'sarorosy', 'bfdf311c5758e9edefd78df00511a2d9', '/uploads/users/user_1742813994538.png', '', 'Passionate About Work', '[]', 0, '2025-01-02 05:05:18', 'user'),
(21, 'Kavin Priya', 'kavinpriyagmail.com', 'sarorosy', '8be209f681dba9f3e6dcf222dc6a46f3', NULL, '', 'Passionate About Work', '', 0, '2025-01-02 05:05:18', 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_groups`
--
ALTER TABLE `tbl_groups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_group_members`
--
ALTER TABLE `tbl_group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_group_user` (`group_id`,`user_id`);

--
-- Indexes for table `tbl_messages`
--
ALTER TABLE `tbl_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_replies`
--
ALTER TABLE `tbl_replies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_tasks`
--
ALTER TABLE `tbl_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_groups`
--
ALTER TABLE `tbl_groups`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_group_members`
--
ALTER TABLE `tbl_group_members`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_messages`
--
ALTER TABLE `tbl_messages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `tbl_replies`
--
ALTER TABLE `tbl_replies`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_tasks`
--
ALTER TABLE `tbl_tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_tasks`
--
ALTER TABLE `tbl_tasks`
  ADD CONSTRAINT `tbl_tasks_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `tbl_users` (`id`),
  ADD CONSTRAINT `tbl_tasks_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `tbl_users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
