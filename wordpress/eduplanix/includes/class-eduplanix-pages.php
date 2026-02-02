<?php

if (!defined('ABSPATH')) {
    exit;
}

class Eduplanix_Pages {
    public static function activate() {
        self::ensure_page();
    }

    public static function deactivate() {
        $page_id = get_option('eduplanix_page_id');
        if ($page_id) {
            wp_delete_post($page_id, true);
            delete_option('eduplanix_page_id');
        }
    }

    public static function ensure_page() {
        $page_id = get_option('eduplanix_page_id');
        if ($page_id && get_post($page_id)) {
            return $page_id;
        }

        $page = get_page_by_path(EDUPLANIX_PAGE_SLUG);
        if ($page) {
            update_option('eduplanix_page_id', $page->ID);
            return $page->ID;
        }

        $page_id = wp_insert_post([
            'post_title' => 'Eduplanix',
            'post_name' => EDUPLANIX_PAGE_SLUG,
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_content' => '[eduplanix_app]'
        ]);

        if (!is_wp_error($page_id)) {
            update_option('eduplanix_page_id', $page_id);
        }

        return $page_id;
    }

    public static function register_shortcode() {
        add_shortcode('eduplanix_app', [__CLASS__, 'render_shortcode']);
    }

    public static function render_shortcode() {
        return '<div id="eduplanix-root"></div>';
    }

    public static function register_rewrite() {
        add_rewrite_tag('%eduplanix%', '1');
    }

    public static function add_rewrite_rules() {
        add_rewrite_rule('^' . EDUPLANIX_PAGE_SLUG . '/?$', 'index.php?eduplanix=1', 'top');
    }

    public static function register_query_vars($vars) {
        $vars[] = 'eduplanix';
        return $vars;
    }

    public static function is_eduplanix_request() {
        return (bool) get_query_var('eduplanix') || is_page(self::get_page_id());
    }

    public static function get_page_id() {
        return (int) get_option('eduplanix_page_id');
    }

    public static function maybe_render_app_shell() {
        if (!self::is_eduplanix_request()) {
            return;
        }

        status_header(200);
        nocache_headers();

        $template = EDUPLANIX_PLUGIN_DIR . 'templates/app-shell.php';
        if (file_exists($template)) {
            include $template;
            exit;
        }
    }
}
