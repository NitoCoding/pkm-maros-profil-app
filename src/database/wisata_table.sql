-- wisata table definition
CREATE TABLE `wisata` (
  `id` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `deskripsi_singkat` text DEFAULT NULL,
  `deskripsi_lengkap` text DEFAULT NULL,
  `gambar` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gambar`)),
  `alt_text` varchar(500) DEFAULT NULL,
  `lokasi_link` varchar(500) DEFAULT NULL,
  `link_pendaftaran` varchar(500) DEFAULT NULL,
  `link_website` varchar(500) DEFAULT NULL,
  `social_media` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`social_media`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_wisata_created_at` (`created_at` DESC),
  KEY `created_by` (`created_by`),
  CONSTRAINT `wisata_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;