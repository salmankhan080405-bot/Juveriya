-- ========================================================
-- Juveriya & Abdul Hadi Wedding Invitations MySQL Database
-- Database & Table Creation Script
-- ========================================================

CREATE DATABASE IF NOT EXISTS juveriya_wedding 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE juveriya_wedding;

CREATE TABLE IF NOT EXISTS invitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  place VARCHAR(255) DEFAULT '',
  with_family BOOLEAN DEFAULT FALSE,
  greeting VARCHAR(255) NOT NULL,
  invite_url TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
