mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: taskmanager
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
mysqldump: Error: 'Access denied; you need (at least one of) the PROCESS privilege(s) for this operation' when trying to dump tablespaces

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2014_10_12_000000_create_users_table',1),(2,'2019_12_14_000001_create_personal_access_tokens_table',1),(3,'2024_01_01_000000_create_tasks_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'auth-token','5f4206786585db12e0b9111fb8e3dffee5bc9b873345bc2f3350a3bdcf63f332','[\"*\"]',NULL,NULL,'2025-07-13 22:59:18','2025-07-13 22:59:18'),(2,'App\\Models\\User',1,'auth-token','1375e87db116a873f5af3d2ecf8c1e629c561134baab8019f07a64ac1ef587e8','[\"*\"]',NULL,NULL,'2025-07-13 23:03:50','2025-07-13 23:03:50'),(3,'App\\Models\\User',2,'auth-token','129ad846c05e915e3602f00864d3e5948cf1bcd63726251beeb2714c4ca1e957','[\"*\"]',NULL,NULL,'2025-07-13 23:35:57','2025-07-13 23:35:57'),(4,'App\\Models\\User',1,'auth-token','b95c23c3dc1c1fb7f5444bb8578e99aea46d4ffd7c2f74ae092606ced3851baa','[\"*\"]',NULL,NULL,'2025-07-13 23:36:34','2025-07-13 23:36:34'),(5,'App\\Models\\User',2,'auth-token','75bf68f21fcd8c8f2be42d9c71b95d7be5ad5ae7fe21ab1b1ad398cfcea0f744','[\"*\"]',NULL,NULL,'2025-07-14 00:35:37','2025-07-14 00:35:37'),(6,'App\\Models\\User',1,'auth-token','000eb94448a207d36737ad41b196aaf32fed0dc0eabea694660aaf6425167535','[\"*\"]',NULL,NULL,'2025-07-14 00:40:09','2025-07-14 00:40:09'),(7,'App\\Models\\User',2,'auth-token','f3325df17ba91065ed23a32ac6c5924c762fab2ca67170e0bb84f2d7665fb7d3','[\"*\"]',NULL,NULL,'2025-07-14 00:41:54','2025-07-14 00:41:54'),(8,'App\\Models\\User',1,'auth-token','cc6b6140647218b091b8cbda6d1e798ff8d40a14a0a55450b23791310e389fa9','[\"*\"]',NULL,NULL,'2025-07-14 00:43:06','2025-07-14 00:43:06'),(9,'App\\Models\\User',1,'auth-token','b6ccf71545734e6e73f7d6a3ffd21cf03aefc0a393f889b167c4bb0b647a6f21','[\"*\"]',NULL,NULL,'2025-07-14 02:11:24','2025-07-14 02:11:24'),(10,'App\\Models\\User',1,'auth-token','244bbca0d24c33920c24b87979f566a37229d9949e8e0f0bfe6775a0a71624b2','[\"*\"]',NULL,NULL,'2025-07-14 02:11:38','2025-07-14 02:11:38'),(11,'App\\Models\\User',7,'auth-token','6f9c7c61fac540166c9171128f29e787476858e69fa19894b7b6493b35c35cec','[\"*\"]',NULL,NULL,'2025-07-14 02:12:17','2025-07-14 02:12:17'),(12,'App\\Models\\User',1,'auth-token','ad1d254f2aaa78575c42142709c2f5ecf6e783b0b651c2f6990c9d1f7b430866','[\"*\"]',NULL,NULL,'2025-07-14 14:51:25','2025-07-14 14:51:25'),(15,'App\\Models\\User',1,'auth-token','04b46a8914cdb634e7b61ef465a7222ba69dc452761fb8db0bc8e5ea9ed80b01','[\"*\"]',NULL,NULL,'2025-07-14 22:59:51','2025-07-14 22:59:51'),(16,'App\\Models\\User',1,'auth-token','af594b4396480acdfe3b370cb261aab4be7163d2f4a75b31d027cb584340597e','[\"*\"]',NULL,NULL,'2025-07-14 23:00:08','2025-07-14 23:00:08'),(17,'App\\Models\\User',9,'auth-token','662efcdc931a072acaa81bfafd13d672e206f9ac8513fff68e7cfe06496ee2ee','[\"*\"]',NULL,NULL,'2025-07-14 23:00:32','2025-07-14 23:00:32'),(18,'App\\Models\\User',1,'auth-token','584bd9bc91dbf9310e0c3ebd68fdd75aba2e148dd4d37c0b505da3589e82c1fb','[\"*\"]',NULL,NULL,'2025-07-14 23:07:43','2025-07-14 23:07:43'),(19,'App\\Models\\User',1,'auth-token','8e5f201632690ebde4034a5bf181088585943f5b5f66e8b3207f23712e1c5452','[\"*\"]','2025-07-14 23:25:31',NULL,'2025-07-14 23:25:30','2025-07-14 23:25:31');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','in_progress','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `deadline` date NOT NULL,
  `assigned_to` bigint unsigned NOT NULL,
  `created_by` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tasks_assigned_to_foreign` (`assigned_to`),
  KEY `tasks_created_by_foreign` (`created_by`),
  CONSTRAINT `tasks_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (2,'Database Optimization','Optimize database queries and improve performance','in_progress','2025-07-18',3,1,'2025-07-13 22:40:48','2025-07-13 22:40:48'),(4,'dadwffefe','feegeg','pending','2025-07-16',6,1,'2025-07-14 02:06:49','2025-07-14 02:06:49'),(5,'Design Homepage','Create a modern and responsive homepage design','in_progress','2025-07-23',6,1,'2025-07-14 02:08:21','2025-07-14 02:08:31'),(6,'API Documentation','Write Comprehensive API documentation','completed','2025-07-17',7,1,'2025-07-14 02:09:47','2025-07-14 02:09:55');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@taskmanager.com',NULL,'$2y$12$bKCGckZTQivVgkGouClvReZJ5umI0anlesiqn24KFCt3KGlXaO5mO','admin',NULL,'2025-07-13 22:40:46','2025-07-13 22:40:46'),(3,'Jane Smith','jane@taskmanager.com',NULL,'$2y$12$aeBsqdHDr4.39ZyPF.W0N.nA7VmBF42JpRUfZ/nsuJIc0biiVZy4C','user',NULL,'2025-07-13 22:40:47','2025-07-13 22:40:47'),(4,'Mike Johnson','mike@taskmanager.com',NULL,'$2y$12$TwCvdjvPVtx/wsiwnh18meH1oFjyPkS67VkIreK1MEeF2oz16zJUq','user',NULL,'2025-07-13 22:40:47','2025-07-13 22:40:47'),(6,'Juma','Cuzo@gmail.com',NULL,'$2y$12$IvjMY3UKFIOi7vpf32YH..3jDbcFZUeUDGvgNMc6gdD7KHgViy6gq','user',NULL,'2025-07-14 01:41:47','2025-07-14 01:41:47'),(7,'Naiboi','Naiboi@gmail.com',NULL,'$2y$12$SJlDL1wMQcqSTaUcjDiiLuhXVECAeDVrMBA8PBX1xmHHjGw.KfTSi','user',NULL,'2025-07-14 01:50:22','2025-07-14 01:50:22'),(9,'John Doe','john@taskmanager.com',NULL,'$2y$12$g1aSIvQ2IgvGry2m/BMFZOYdu4e/KeaEAQJdp6ou6PxTbELdfVh8m','user',NULL,'2025-07-14 14:50:58','2025-07-14 14:50:58'),(11,'Damian','damianbwire88@gmail.com',NULL,'$2y$12$uFzihatsfBVrOc3RVxttOeVKEUvIU1HrqY8LC7GxIuD7yglaonIOO','user',NULL,'2025-07-14 16:03:02','2025-07-14 16:03:02'),(12,'frgtbtb','damianbwire8@gmail.com',NULL,'$2y$12$Rtasg2t4UVk8H.3NaBLr/uHA7.e277RpbnzvpCt.i5VfVJMHpfvUK','user',NULL,'2025-07-14 23:08:29','2025-07-14 23:08:29');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-14 23:35:06
