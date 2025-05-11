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
-- Database: `chatapp`
--

-- --------------------------------------------------------

--
-- Table structure for table `creategroup_user_request`
--

CREATE TABLE `creategroup_user_request` (
  `requestId` int NOT NULL,
  `userId` int DEFAULT NULL,
  `requestSts` enum('Pending','Rejected','Approved') COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `addedOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `favourites`
--

CREATE TABLE `favourites` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `favourite_user_id` int DEFAULT NULL,
  `favourite_group_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favourites`
--

INSERT INTO `favourites` (`id`, `user_id`, `favourite_user_id`, `favourite_group_id`, `created_at`) VALUES
(2, 2, 1, NULL, '2025-04-28 05:27:47');

-- --------------------------------------------------------

--
-- Table structure for table `groupmemberrequest`
--

CREATE TABLE `groupmemberrequest` (
  `requestId` int NOT NULL,
  `groupId` int DEFAULT '0',
  `userId` int DEFAULT '0',
  `requestNumber` int DEFAULT NULL,
  `requestSts` enum('Pending','Rejected','Approved') COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `addedOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `groupId` int NOT NULL,
  `totalMember` int DEFAULT NULL,
  `allowedMember` int DEFAULT NULL,
  `groupName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `createdBy` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`groupId`, `totalMember`, `allowedMember`, `groupName`, `createdBy`, `createdAt`) VALUES
(1, 3, 10, 'group 1', 1, '2025-04-25 23:22:28'),
(2, 2, 10, 'group 2', 1, '2025-04-28 01:02:20');

-- --------------------------------------------------------

--
-- Table structure for table `group_adduser_request`
--

CREATE TABLE `group_adduser_request` (
  `requestId` int NOT NULL,
  `userId` int DEFAULT NULL,
  `groupId` int DEFAULT NULL,
  `requestForUser` int DEFAULT NULL,
  `requestSts` enum('Pending','Rejected','Approved') COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `addedOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group_members`
--

CREATE TABLE `group_members` (
  `id` int NOT NULL,
  `groupId` int NOT NULL,
  `userId` int NOT NULL,
  `joinedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `group_members`
--

INSERT INTO `group_members` (`id`, `groupId`, `userId`, `joinedAt`) VALUES
(1, 1, 1, '2025-04-25 23:22:28'),
(3, 1, 3, '2025-04-26 02:06:18'),
(4, 1, 2, '2025-04-28 00:05:08'),
(5, 2, 1, '2025-04-28 01:02:20'),
(6, 2, 7, '2025-04-28 01:02:20');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `messageId` int NOT NULL,
  `senderName` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `senderId` int DEFAULT NULL,
  `receiverId` int DEFAULT NULL,
  `groupId` int DEFAULT NULL,
  `replyTo` int DEFAULT NULL,
  `message` text COLLATE utf8mb4_general_ci,
  `messageType` enum('text','image','video','file') COLLATE utf8mb4_general_ci DEFAULT 'text',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `timestampUpdate` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `editSts` enum('Yes','No') COLLATE utf8mb4_general_ci DEFAULT 'No',
  `deleteSts` enum('Yes','No') COLLATE utf8mb4_general_ci DEFAULT 'No',
  `pinSts` enum('Yes','No') COLLATE utf8mb4_general_ci DEFAULT 'No',
  `pinnedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`messageId`, `senderName`, `senderId`, `receiverId`, `groupId`, `replyTo`, `message`, `messageType`, `timestamp`, `timestampUpdate`, `isRead`, `editSts`, `deleteSts`, `pinSts`, `pinnedBy`) VALUES
(1, 'Puneet', 1, 2, NULL, NULL, 'h', 'text', '2025-04-26 04:40:41', '1745642441', 0, 'No', 'No', 'No', NULL),
(2, 'Puneet', 1, 2, NULL, NULL, 'hie ', 'text', '2025-04-26 05:16:25', '1745644586', 0, 'No', 'No', 'No', NULL),
(3, 'Puneet', 1, 2, NULL, NULL, 'hello', 'text', '2025-04-26 05:16:25', '1745644586', 0, 'No', 'No', 'Yes', 1),
(4, 'Puneet', 1, 2, NULL, 3, 'hi', 'text', '2025-04-26 05:19:16', NULL, 0, 'No', 'No', 'No', NULL),
(5, 'Puneet', 1, 3, NULL, NULL, 'hi for test 12', 'text', '2025-04-26 05:23:32', '1745645013', 0, 'Yes', 'No', 'Yes', 1),
(6, 'Sumit Kumar', 3, 1, NULL, 5, 'hello sir ', 'text', '2025-04-26 05:52:31', NULL, 0, 'No', 'No', 'No', NULL),
(7, 'Puneet', 1, 3, NULL, 5, 'yes testing for replying msg  2', 'text', '2025-04-26 05:54:30', NULL, 0, 'Yes', 'No', 'No', NULL),
(8, 'Sumit Kumar', 3, 1, NULL, NULL, '<div class=\"quotedText\"><p><b>Puneet</b></p></br><p>hi for test</p></div>hello sir ', 'text', '2025-04-26 05:56:49', '1745647010', 0, 'No', 'No', 'Yes', 1),
(9, 'Puneet', 1, 3, NULL, 8, 'hello', 'text', '2025-04-26 06:03:36', NULL, 0, 'Yes', 'No', 'No', NULL),
(10, 'Puneet', 1, 3, NULL, NULL, 'hello pin msg testing ', 'text', '2025-04-26 06:05:01', '1745647501', 0, 'No', 'Yes', 'Yes', 1),
(11, 'Puneet', 1, 2, NULL, NULL, 'good morning', 'text', '2025-04-26 06:17:03', '1745648224', 0, 'No', 'No', 'Yes', 1),
(12, 'Puneet', 1, 2, NULL, NULL, 'hi', 'text', '2025-04-26 06:31:18', '1745649079', 0, 'No', 'No', 'Yes', 1),
(13, 'Puneet', 1, 2, NULL, NULL, 'hi', 'text', '2025-04-26 06:57:52', '1745650672', 0, 'No', 'No', 'No', NULL),
(14, 'Puneet', 1, 3, NULL, NULL, 'hie ', 'text', '2025-04-26 07:32:16', '1745652737', 0, 'No', 'No', 'No', NULL),
(15, 'Sumit Kumar', 3, 1, NULL, NULL, 'hie sir ', 'text', '2025-04-26 07:32:34', '1745652755', 0, 'No', 'No', 'Yes', 1),
(16, 'Puneet', 1, 3, NULL, 15, 'hey test', 'text', '2025-04-26 07:33:14', NULL, 0, 'No', 'No', 'No', NULL),
(17, 'Puneet', 1, NULL, 1, NULL, '&nbsp;<span class=\"tagg--text\" data-userid=\"3\">@Sumit Kumar</span>&nbsp;  ', 'text', '2025-04-26 07:36:47', '1745653006', 0, 'No', 'No', 'No', NULL),
(18, 'Sumit Kumar', 3, NULL, 1, NULL, 'yes sir ', 'text', '2025-04-26 07:37:03', '1745653024', 0, 'No', 'No', 'No', NULL),
(19, 'Puneet', 1, NULL, 1, NULL, 'what is progress', 'text', '2025-04-26 07:37:20', '1745653041', 0, 'No', 'No', 'No', NULL),
(20, 'Sumit Kumar', 3, NULL, 1, 19, '@puneet sir going on ', 'text', '2025-04-26 07:38:29', NULL, 0, 'No', 'No', 'No', NULL),
(21, 'Puneet', 1, 2, NULL, NULL, 'hello\'', 'text', '2025-04-28 04:28:31', '1745814511', 0, 'No', 'No', 'Yes', 1),
(22, 'Puneet', 1, 2, NULL, NULL, 'hie test 1 ', 'text', '2025-04-28 05:17:15', '1745817436', 0, 'No', 'No', 'Yes', 1),
(23, 'Puneet', 1, 2, NULL, 22, 'are you there ?', 'text', '2025-04-28 05:23:29', NULL, 0, 'No', 'No', 'No', NULL),
(24, 'Puneet', 1, 2, NULL, NULL, 'yes i\'m there', 'text', '2025-04-28 05:25:58', '1745817959', 0, 'No', 'No', 'No', NULL),
(25, 'Arjun ', 2, 1, NULL, NULL, 'noted ', 'text', '2025-04-28 05:26:29', '1745817990', 0, 'No', 'Yes', 'No', NULL),
(26, 'Puneet', 1, 2, NULL, 25, 'hieee ', 'text', '2025-04-28 05:29:17', NULL, 0, 'No', 'Yes', 'No', NULL),
(27, 'Puneet', 1, 2, NULL, NULL, 'hie ', 'text', '2025-04-28 05:34:02', '1745818442', 0, 'No', 'Yes', 'No', NULL),
(28, 'Arjun ', 2, NULL, 1, NULL, '&nbsp;<span class=\"tagg--text\" data-userid=\"1\">@Puneet</span>&nbsp;  sir good morning &nbsp;<span class=\"tagg--text\" data-userid=\"3\">@Sumit Kumar</span>&nbsp;  sir good morning ', 'text', '2025-04-28 05:38:28', '1745818709', 0, 'No', 'No', 'No', NULL),
(29, 'Arjun ', 2, 1, NULL, NULL, 'ji sir working on it ', 'text', '2025-04-28 05:39:00', '1745818741', 0, 'No', 'No', 'No', NULL),
(30, 'Puneet', 1, NULL, 1, NULL, 'good morning &nbsp;<span class=\"tagg--text\" data-userid=\"2\">@Arjun </span>&nbsp; ', 'text', '2025-04-28 05:39:17', '1745818757', 0, 'No', 'No', 'No', NULL),
(31, 'Puneet', 1, 2, NULL, NULL, 'hello', 'text', '2025-04-28 06:15:27', '1745820928', 0, 'No', 'No', 'Yes', 1),
(32, 'Puneet', 1, 2, NULL, NULL, 'hello', 'text', '2025-04-28 06:37:47', '1745822267', 0, 'No', 'No', 'Yes', 1),
(33, 'Puneet', 1, NULL, 2, NULL, 'hi', 'text', '2025-04-28 07:09:19', '1745824160', 0, 'No', 'No', 'Yes', 1),
(34, 'Puneet', 1, NULL, 2, NULL, 'hello', 'text', '2025-04-28 07:51:11', '1745826672', 0, 'No', 'No', 'Yes', 1),
(35, 'Puneet', 1, NULL, 2, NULL, 'hello', 'text', '2025-04-29 04:44:35', '1745901876', 0, 'No', 'No', 'Yes', 1),
(36, 'Sumit Kumar', 3, 2, NULL, NULL, 'Hello', 'text', '2025-04-29 13:06:30', '1745931990', 0, 'No', 'No', 'No', NULL),
(37, 'Sumit Kumar', 3, 2, NULL, NULL, 'Hi', 'text', '2025-04-30 04:27:04', '1745987224', 0, 'No', 'No', 'No', NULL),
(38, 'Puneet', 1, 2, NULL, NULL, 'hie ', 'text', '2025-04-30 04:27:54', '1745987274', 0, 'No', 'No', 'No', NULL),
(39, 'Puneet', 1, 3, NULL, NULL, 'hie ', 'text', '2025-04-30 04:28:21', '1745987302', 0, 'No', 'No', 'Yes', 1),
(40, 'Sumit Kumar', 3, 1, NULL, NULL, 'Hi', 'text', '2025-04-30 04:28:35', '1745987316', 0, 'No', 'No', 'No', NULL),
(41, 'Puneet', 1, NULL, 2, NULL, 'hi', 'text', '2025-04-30 06:33:59', '1745994840', 0, 'No', 'No', 'Yes', 1),
(42, 'Puneet', 1, NULL, 2, NULL, 'hi', 'text', '2025-04-30 06:34:01', '1745994842', 0, 'No', 'No', 'Yes', 1),
(43, 'Puneet', 1, NULL, 2, NULL, 'hi', 'text', '2025-04-30 06:34:03', '1745994843', 0, 'No', 'No', 'Yes', 1),
(44, 'Pragya Chauhan', 4, 2, NULL, NULL, 'Hi', 'text', '2025-04-30 13:40:09', '1746020409', 0, 'No', 'No', 'No', NULL),
(45, 'Puneet', 1, 3, NULL, NULL, '<div class=\"quotedText\"><p><b>Sumit Kumar</b></p></br><p>Hi</p></div>TESTING QUOTE', 'text', '2025-05-06 07:26:48', '1746516408', 0, 'No', 'No', 'No', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pinnedmessages`
--

CREATE TABLE `pinnedmessages` (
  `pinId` int NOT NULL,
  `userName` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `groupId` int DEFAULT NULL,
  `messageId` int DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pinSts` enum('Yes','No') COLLATE utf8mb4_general_ci DEFAULT 'No'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pinnedmessages`
--

INSERT INTO `pinnedmessages` (`pinId`, `userName`, `userId`, `groupId`, `messageId`, `timestamp`, `pinSts`) VALUES
(1, 'Puneet', 1, NULL, 3, '2025-04-26 05:19:27', 'Yes'),
(2, 'Puneet', 1, NULL, 5, '2025-04-26 06:01:29', 'Yes'),
(3, 'Puneet', 1, NULL, 10, '2025-04-26 06:05:06', 'Yes'),
(4, 'Puneet', 1, NULL, 11, '2025-04-26 06:17:10', 'Yes'),
(5, 'Puneet', 1, NULL, 12, '2025-04-26 06:31:41', 'Yes'),
(6, 'Puneet', 1, NULL, 8, '2025-04-26 06:36:10', 'Yes'),
(7, 'Puneet', 1, NULL, 15, '2025-04-26 07:34:45', 'Yes'),
(8, 'Puneet', 1, NULL, 21, '2025-04-28 04:28:36', 'Yes'),
(9, 'Arjun ', 2, NULL, 24, '2025-04-28 05:27:16', 'Yes'),
(10, 'Arjun ', 2, NULL, 24, '2025-04-28 05:28:46', 'Yes'),
(11, 'Puneet', 1, NULL, 22, '2025-04-28 06:15:13', 'Yes'),
(12, 'Puneet', 1, NULL, 31, '2025-04-28 06:15:56', 'Yes'),
(13, 'Puneet', 1, NULL, 32, '2025-04-28 06:37:51', 'Yes'),
(14, 'Puneet', 1, 2, 33, '2025-04-28 07:09:27', 'Yes'),
(15, 'Puneet', 1, 2, 34, '2025-04-28 07:51:37', 'Yes'),
(16, 'Puneet', 1, 2, 35, '2025-04-29 04:44:40', 'Yes'),
(17, 'Puneet', 1, 2, 41, '2025-04-30 06:34:10', 'Yes'),
(18, 'Puneet', 1, 2, 42, '2025-04-30 06:34:13', 'Yes'),
(19, 'Puneet', 1, 2, 43, '2025-04-30 06:34:15', 'Yes'),
(20, 'Pragya Chauhan', 4, NULL, 44, '2025-04-30 13:40:37', 'Yes'),
(21, 'Pragya Chauhan', 4, NULL, 44, '2025-04-30 13:40:53', 'No'),
(22, 'Puneet', 1, 2, 43, '2025-05-05 10:11:11', 'No'),
(23, 'Puneet', 1, 2, 43, '2025-05-05 10:11:38', 'Yes'),
(24, 'Puneet', 1, NULL, 39, '2025-05-05 10:11:59', 'Yes'),
(25, 'Puneet', 1, NULL, 24, '2025-05-06 06:49:31', 'No');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `employeeId` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `userType` enum('ADMIN','SUBADMIN','EMPLOYEE','SP') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `decryptPassword` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `chatDeleteInDays` enum('30','60','90','120') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `officeName` text COLLATE utf8mb4_general_ci,
  `cityName` text COLLATE utf8mb4_general_ci,
  `accessView` text COLLATE utf8mb4_general_ci,
  `chatStatus` enum('Busy','DND','ACTIVE') COLLATE utf8mb4_general_ci DEFAULT 'ACTIVE',
  `chatBusyDndTime` int DEFAULT NULL,
  `chatBusyDndExpiredon` datetime DEFAULT NULL,
  `userPanel` enum('SP','AP') COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '''SP'' =>Service Provider, ''AP'' => Attendance Panel',
  `fcmToken` text COLLATE utf8mb4_general_ci,
  `allowedInGroups` int DEFAULT NULL,
  `verify` int DEFAULT NULL,
  `addedon` datetime DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_general_ci DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `employeeId`, `userType`, `name`, `email`, `password`, `decryptPassword`, `chatDeleteInDays`, `officeName`, `cityName`, `accessView`, `chatStatus`, `chatBusyDndTime`, `chatBusyDndExpiredon`, `userPanel`, `fcmToken`, `allowedInGroups`, `verify`, `addedon`, `status`) VALUES
(1, 'TEST', 'ADMIN', 'Puneet', 'pnt.chd@gmail.com', 'c13b5180c7e6d9835e0d47a8cf788b05', 'hjksd798jhj3', NULL, NULL, NULL, NULL, 'ACTIVE', NULL, NULL, 'AP', 'cjzTYLBhhKK2Co7CjHnQZJ:APA91bHhUVbh9mgcxkP8qTqjYW6jisrOc_iH4-woFC87EeDrdZuPpI0RZUYcxsobELTUZGy-rLbC-HgMBEXvDYgWIGo27-7hvJT8bchft-by_ZXU-fWBtMY', 5, NULL, '2025-03-03 10:00:29', 'Active'),
(2, 'ELK00096', 'EMPLOYEE', 'Arjun ', 'web.analyst4@redmarkediting.com', 'e10adc3949ba59abbe56e057f20f883e', '123456', '90', 'Mumbai', 'Andeheri, Mumbai', NULL, 'ACTIVE', NULL, NULL, 'AP', 'c7MjGYjCooUeSw6sNkBy3x:APA91bFvNjBT6nurod1QP9MLetoBG5U_YUgzjNbtqqybHUvhgVkVoTHdmjDk5zA-sciQcE1nFA7F-QxuzdwQ-P_Ol9x8pgRKaXHhoIJFirdDrzwEDrOfq90', 5, 684034, '2025-03-06 14:55:27', 'Active'),
(3, 'ELK000945', 'EMPLOYEE', 'Sumit Kumar', 'sumit.kumar@360websitedesigning.com', 'e10adc3949ba59abbe56e057f20f883e', '123456', '120', 'Delhi', 'Paschim Vihar, New Delhi', NULL, 'ACTIVE', NULL, NULL, 'AP', 'cWW0ffeToNd_pPiOAgR8uS:APA91bHt4wQkLgf-fnSdXVjBEXdRS1nJnLiJMHr-xKnqs4iALjgq-1dKWPwO6t-IF93vwoStDkv6M7fz-TuXW66uRcGXNzMaHpIDOgWzgxElO-vWJCYle94', 5, 350042, '2025-03-06 14:55:54', 'Active'),
(4, 'ELK00099', 'SUBADMIN', 'Pragya Chauhan', 'pragya.chauhan@statworkz.com', 'e10adc3949ba59abbe56e057f20f883e', '123456', '60', 'Delhi', 'Faridabad, Haryana', '[{\"viewchatboard\":true},{\"viewlist\":true}]', 'ACTIVE', NULL, NULL, 'AP', NULL, 5, 355546, '2025-03-06 15:02:29', 'Active'),
(5, 'ELK000946', 'EMPLOYEE', 'Shivika', 'shivika.malik@statworkz.com', 'e10adc3949ba59abbe56e057f20f883e', '123456', '120', 'UP', 'Noida,UP', NULL, 'ACTIVE', NULL, NULL, 'AP', NULL, 5, 350042, '2025-03-06 14:55:54', 'Active'),
(6, 'ELK000923', 'EMPLOYEE', 'Girish', 'web.analyst7@360websitedesigning.com', 'e10adc3949ba59abbe56e057f20f883e', '123456', '90', 'Chennai', 'Perumbakkam', NULL, 'ACTIVE', NULL, NULL, 'AP', NULL, 5, 140095, '2025-04-07 10:34:47', 'Active'),
(7, 'ELK000100', 'EMPLOYEE', 'Saravanan', 'web.dev.6@redmarkediting.com', 'e10adc3949ba59abbe56e057f20f883e', '123456', '90', 'Chennai', 'Perumbakkam', NULL, 'ACTIVE', NULL, NULL, 'AP', NULL, 5, 823334, '2025-04-08 15:42:59', 'Active'),
(8, 'ELK000111111', 'EMPLOYEE', 'Purushothaman', 'web.dev9@360websitedesigning.com', 'e10adc3949ba59abbe56e057f20f883e', '123456', '90', 'Chennai', 'Perumbakkam', NULL, 'ACTIVE', NULL, NULL, 'AP', NULL, 5, 188919, '2025-04-08 19:07:15', 'Active'),
(9, 'ELK00096', 'EMPLOYEE', 'Deva', 'web-designer8@360websitedesigning.com', 'e10adc3949ba59abbe56e057f20f883e', '123456', '30', 'chennai', 'velacherry', NULL, 'ACTIVE', NULL, NULL, 'AP', NULL, 5, 314071, '2025-04-10 10:59:47', 'Active'),
(10, 'EMK123', 'EMPLOYEE', 'Aaron', 'web-designer7@360websitedesigning.com', 'e10adc3949ba59abbe56e057f20f883e', '123456', '30', 'chennai', 'velacherry', NULL, 'ACTIVE', NULL, NULL, 'AP', NULL, 5, 479559, '2025-04-10 11:13:14', 'Active');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `creategroup_user_request`
--
ALTER TABLE `creategroup_user_request`
  ADD PRIMARY KEY (`requestId`);

--
-- Indexes for table `favourites`
--
ALTER TABLE `favourites`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `groupmemberrequest`
--
ALTER TABLE `groupmemberrequest`
  ADD PRIMARY KEY (`requestId`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`groupId`);

--
-- Indexes for table `group_adduser_request`
--
ALTER TABLE `group_adduser_request`
  ADD PRIMARY KEY (`requestId`);

--
-- Indexes for table `group_members`
--
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`messageId`);

--
-- Indexes for table `pinnedmessages`
--
ALTER TABLE `pinnedmessages`
  ADD PRIMARY KEY (`pinId`);

--
-- Indexes for table `tbl_messages`
--
ALTER TABLE `tbl_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `creategroup_user_request`
--
ALTER TABLE `creategroup_user_request`
  MODIFY `requestId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favourites`
--
ALTER TABLE `favourites`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `groupmemberrequest`
--
ALTER TABLE `groupmemberrequest`
  MODIFY `requestId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
  MODIFY `groupId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `group_adduser_request`
--
ALTER TABLE `group_adduser_request`
  MODIFY `requestId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `group_members`
--
ALTER TABLE `group_members`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `messageId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `pinnedmessages`
--
ALTER TABLE `pinnedmessages`
  MODIFY `pinId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `tbl_messages`
--
ALTER TABLE `tbl_messages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
