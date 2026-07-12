-- Database Initialization Script for TiDB (MySQL Compatible)
-- Project: Wave Projects Center.ID
-- Version: 1.0

CREATE DATABASE IF NOT EXISTS wave_projects_center;
USE wave_projects_center;

-- 1. MASTER TABLES
CREATE TABLE `packages` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) UNIQUE NOT NULL,
    `description` LONGTEXT,
    `price` DECIMAL(15,2) NOT NULL,
    `estimated_days` INT NOT NULL,
    `features` JSON,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    INDEX `idx_status` (`status`),
    INDEX `idx_price` (`price`)
);

CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `uuid` CHAR(36) UNIQUE NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20),
    `avatar_url` TEXT,
    `github_username` VARCHAR(100) NULL,
    `bank_name` VARCHAR(100) NULL,
    `bank_account_number` VARCHAR(50) NULL,
    `bank_account_name` VARCHAR(150) NULL,
    `notification_email` VARCHAR(150) NULL,
    `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    `last_login_at` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    INDEX `idx_status` (`status`),
    INDEX `idx_last_login` (`last_login_at`)
);

CREATE TABLE `roles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) UNIQUE NOT NULL,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `permissions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(100) UNIQUE NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT
);

CREATE TABLE `user_roles` (
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,
    PRIMARY KEY (`user_id`, `role_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
);

CREATE TABLE `role_permissions` (
    `role_id` BIGINT NOT NULL,
    `permission_id` BIGINT NOT NULL,
    PRIMARY KEY (`role_id`, `permission_id`),
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
);

CREATE TABLE `system_settings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) UNIQUE NOT NULL,
    `setting_value` JSON NOT NULL,
    `description` TEXT,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- 2. TRANSACTION TABLES

CREATE TABLE `orders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_number` VARCHAR(50) UNIQUE NOT NULL,
    `user_id` BIGINT NOT NULL,
    `package_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` LONGTEXT,
    `project_type` VARCHAR(100),
    `estimated_cost` DECIMAL(15,2),
    `final_cost` DECIMAL(15,2),
    `status` ENUM('draft', 'pending_payment', 'paid', 'in_progress', 'review', 'delivered', 'completed', 'cancelled') DEFAULT 'pending_payment',
    `payment_type` ENUM('dp', 'full') DEFAULT 'full',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_package` (`package_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created` (`created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`)
);

CREATE TABLE `payments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `transaction_id` VARCHAR(100) UNIQUE NOT NULL,
    `payment_method` VARCHAR(50),
    `amount` DECIMAL(15,2) NOT NULL,
    `status` ENUM('pending', 'success', 'failed', 'expired', 'refund') DEFAULT 'pending',
    `paid_at` DATETIME NULL,
    INDEX `idx_order` (`order_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_paid` (`paid_at`),
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
);

CREATE TABLE `attachments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `cloudinary_public_id` VARCHAR(255) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_size` BIGINT,
    `file_type` VARCHAR(50),
    `secure_url` TEXT NOT NULL,
    INDEX `idx_order` (`order_id`),
    INDEX `idx_file_type` (`file_type`),
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
);

CREATE TABLE `generated_prds` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT UNIQUE NOT NULL,
    `version` VARCHAR(20) DEFAULT '1.0',
    `content` LONGTEXT NOT NULL,
    `generated_by_ai` BOOLEAN DEFAULT TRUE,
    `generated_at` DATETIME NOT NULL,
    INDEX `idx_generated_at` (`generated_at`),
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
);

CREATE TABLE `notifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `is_read` BOOLEAN DEFAULT FALSE,
    `sent_at` DATETIME NOT NULL,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_is_read` (`is_read`),
    INDEX `idx_sent_at` (`sent_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `deliveries` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `delivery_url` TEXT NOT NULL,
    `delivery_notes` LONGTEXT,
    `delivered_at` DATETIME NOT NULL,
    `verified_at` DATETIME NULL,
    INDEX `idx_order` (`order_id`),
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
);


-- 3. AUDIT TABLES
CREATE TABLE `audit_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT,
    `action` VARCHAR(255) NOT NULL,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id` BIGINT NOT NULL,
    `old_value` JSON,
    `new_value` JSON,
    `ip_address` VARCHAR(50),
    `created_at` DATETIME NOT NULL,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_entity` (`entity_type`),
    INDEX `idx_created` (`created_at`)
);

CREATE TABLE `activity_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `activity` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_created` (`created_at`)
);


-- 4. SEED DATA: Simplified 3+1 Role Structure
-- Super Admin = full access (replaces Owner)
-- Admin = Keuangan + CS + Marketing (unified operations)
-- Developer = technical team (project execution)
-- Customer = client/customer (auto-assigned on checkout)
INSERT INTO `roles` (`name`, `description`) VALUES 
('Super Admin', 'Full Access — Owner & Master Control'),
('Admin', 'Operations — Keuangan, Customer Service, Marketing'),
('Developer', 'Technical — Development & Project Execution'),
('Customer', 'Client — External Customer/Pemesan');

INSERT INTO `packages` (`name`, `slug`, `description`, `price`, `estimated_days`, `features`) VALUES
('Landing Page', 'landing-page', 'Single page website untuk company profile', 1500000, 7, '[\"Desain Custom\", \"Responsive\", \"Form Kontak\"]'),
('E-Commerce MVP', 'ecommerce-mvp', 'Aplikasi toko online dasar', 5000000, 30, '[\"Katalog Produk\", \"Keranjang Belanja\", \"Payment Gateway\"]'),
('Custom Web App', 'custom-web-app', 'Aplikasi web khusus sesuai kebutuhan', 15000000, 60, '[\"Analisis AI\", \"Modul Khusus\", \"API Integration\"]');
