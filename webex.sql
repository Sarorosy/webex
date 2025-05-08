-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 08, 2025 at 03:01 PM
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
  `created_by` bigint UNSIGNED NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tbl_groups`
--

INSERT INTO `tbl_groups` (`id`, `name`, `description`, `member_limit`, `created_by`, `created_at`, `updated_at`) VALUES
(5, 'Web Ninjas', 'Web related Members', 10, 1, '2025-05-08 14:35:13', '2025-05-08 14:35:13');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_group_members`
--

CREATE TABLE `tbl_group_members` (
  `id` bigint UNSIGNED NOT NULL,
  `group_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `joined_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tbl_messages`
--

INSERT INTO `tbl_messages` (`id`, `sender_id`, `receiver_id`, `group_id`, `message`, `is_edited`, `created_at`) VALUES
(1, 1, 20, NULL, 'Hello', 0, '2025-05-08 15:09:55'),
(2, 1, NULL, 5, 'Hello Guyss!', 0, '2025-05-08 15:12:58'),
(3, 2, 1, NULL, 'Hii Bro!', 0, '2025-05-08 15:13:50'),
(9, 1, 20, NULL, 'Hii', 0, '2025-05-08 17:47:27'),
(16, 1, 20, NULL, 'test', 0, '2025-05-08 17:55:50'),
(17, 1, 2, NULL, 'hii', 0, '2025-05-08 17:56:29'),
(18, 1, 2, NULL, 'test', 0, '2025-05-08 17:57:17'),
(19, 1, 2, NULL, 'Hello', 0, '2025-05-08 17:59:22'),
(20, 1, 2, NULL, 'test', 0, '2025-05-08 17:59:29'),
(21, 1, 2, NULL, 'Nice', 0, '2025-05-08 18:00:06'),
(22, 1, 20, NULL, 'test', 0, '2025-05-08 18:02:26'),
(23, 1, 20, NULL, 'Bing', 0, '2025-05-08 18:02:40'),
(24, 1, 20, NULL, 'Bingoo', 0, '2025-05-08 18:05:10'),
(25, 1, 2, NULL, 'Hello', 0, '2025-05-08 18:06:58'),
(26, 1, 20, NULL, 'New', 0, '2025-05-08 18:07:27'),
(27, 20, 1, NULL, 'Hello', 0, '2025-05-08 18:11:47'),
(28, 20, 1, NULL, 'hello bro', 0, '2025-05-08 18:12:40'),
(29, 20, 1, NULL, 'broo', 0, '2025-05-08 18:13:18'),
(30, 20, 1, NULL, 'Top', 0, '2025-05-08 18:13:37'),
(31, 20, 1, NULL, 'Bro', 0, '2025-05-08 18:14:04'),
(32, 20, 1, NULL, 'Newww', 0, '2025-05-08 18:14:43'),
(33, 20, 1, NULL, '....', 0, '2025-05-08 18:17:10'),
(34, 20, 1, NULL, '..', 0, '2025-05-08 18:17:26'),
(35, 20, 1, NULL, '...', 0, '2025-05-08 18:17:34'),
(36, 20, 1, NULL, '..', 0, '2025-05-08 18:19:35'),
(37, 20, 1, NULL, 'ttt', 0, '2025-05-08 18:19:41'),
(38, 20, 1, NULL, ',..', 0, '2025-05-08 18:19:55'),
(39, 20, 1, NULL, '...', 0, '2025-05-08 18:20:49'),
(40, 20, 1, NULL, 'Hi test', 0, '2025-05-08 18:21:06'),
(41, 20, 1, NULL, 'Test', 0, '2025-05-08 18:23:07'),
(42, 20, 1, NULL, 'hhhh', 0, '2025-05-08 18:23:24'),
(43, 20, 1, NULL, 'hhh', 0, '2025-05-08 18:23:35'),
(44, 20, 1, NULL, 'gfgfg', 0, '2025-05-08 18:23:50'),
(45, 20, 1, NULL, 'ggg', 0, '2025-05-08 18:24:37'),
(46, 20, 1, NULL, 'ggg', 0, '2025-05-08 18:24:49'),
(47, 20, 1, NULL, 'fff', 0, '2025-05-08 18:25:16'),
(48, 20, 1, NULL, 'kk', 0, '2025-05-08 18:25:28'),
(49, 20, 1, NULL, 'fgfg', 0, '2025-05-08 18:25:52'),
(50, 20, 1, NULL, 'bro', 0, '2025-05-08 18:26:58'),
(51, 20, 1, NULL, 'broooo', 0, '2025-05-08 18:27:07'),
(52, 20, 1, NULL, 'hhh', 0, '2025-05-08 18:27:26'),
(53, 20, 1, NULL, 'broo', 0, '2025-05-08 18:27:40'),
(54, 1, 20, NULL, 'Hmm sollunga', 0, '2025-05-08 18:27:52'),
(55, 1, 20, NULL, 'Ennachu', 0, '2025-05-08 18:29:02');

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
  `trashed` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_type` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`id`, `name`, `email`, `password`, `token`, `profile_pic`, `pronouns`, `bio`, `trashed`, `created_at`, `user_type`) VALUES
(1, 'Saravanan', 'web.dev.6@redmarkediting.com', 'sarorosy', '7aeb4cdb050aa8c79cb41818b09cf889', '/uploads/users/user_1742988065125.PNG', 'He/Him', 'Workaholic ❤', 0, '2025-01-02 05:05:18', 'admin'),
(2, 'Purushoth', 'purushoth@gmail.com', 'sarorosy', '8d770d287c2fac12f9ec73bef4b37d3a', NULL, '', 'Passionate About Work', 0, '2025-01-02 05:05:18', 'user'),
(20, 'Deva', 'deva@gmail.com', 'sarorosy', '06bceecfe41dd34da847211c7bd559fb', '/uploads/users/user_1742813994538.png', '', 'Passionate About Work', 0, '2025-01-02 05:05:18', 'user'),
(21, 'Kavin Priya', 'kavinpriyagmail.com', 'sarorosy', '8be209f681dba9f3e6dcf222dc6a46f3', NULL, '', 'Passionate About Work', 0, '2025-01-02 05:05:18', 'user');

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
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_messages`
--
ALTER TABLE `tbl_messages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
