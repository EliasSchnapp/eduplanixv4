<?php

if (!defined('ABSPATH')) {
    exit;
}

class Eduplanix_DB {
    public static function activate() {
        global $wpdb;

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $charset_collate = $wpdb->get_charset_collate();
        $prefix = $wpdb->prefix . 'eduplanix_';

        $tables = [];

        $tables[] = "CREATE TABLE {$prefix}users (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            username VARCHAR(191) NOT NULL,
            email VARCHAR(191) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'user',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY username (username),
            UNIQUE KEY email (email)
        ) $charset_collate;";

        $tables[] = "CREATE TABLE {$prefix}grades (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NOT NULL,
            subject VARCHAR(191) NOT NULL,
            grade DECIMAL(4,2) NOT NULL,
            description TEXT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY user_id (user_id)
        ) $charset_collate;";

        $tables[] = "CREATE TABLE {$prefix}homework (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NOT NULL,
            subject VARCHAR(191) NOT NULL,
            title VARCHAR(191) NOT NULL,
            description TEXT NULL,
            due_date DATETIME NOT NULL,
            priority VARCHAR(20) NOT NULL DEFAULT 'medium',
            is_completed TINYINT(1) NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY due_date (due_date)
        ) $charset_collate;";

        $tables[] = "CREATE TABLE {$prefix}events (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NOT NULL,
            title VARCHAR(191) NOT NULL,
            description TEXT NULL,
            type VARCHAR(50) NOT NULL,
            color VARCHAR(20) NOT NULL DEFAULT '#67e8f9',
            start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY start_date (start_date)
        ) $charset_collate;";

        $tables[] = "CREATE TABLE {$prefix}sessions (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NOT NULL,
            session_token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY session_token (session_token),
            KEY user_id (user_id)
        ) $charset_collate;";

        foreach ($tables as $sql) {
            dbDelta($sql);
        }
    }
}
