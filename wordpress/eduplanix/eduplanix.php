<?php
/**
 * Plugin Name: Eduplanix
 * Description: Eduplanix dashboard as a WordPress plugin with isolated UI and dedicated database tables.
 * Version: 0.1.0
 * Author: Eduplanix
 */

if (!defined('ABSPATH')) {
    exit;
}

define('EDUPLANIX_PLUGIN_VERSION', '0.1.0');
define('EDUPLANIX_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('EDUPLANIX_PLUGIN_URL', plugin_dir_url(__FILE__));
define('EDUPLANIX_PAGE_SLUG', 'eduplanix');

require_once EDUPLANIX_PLUGIN_DIR . 'includes/class-eduplanix-db.php';
require_once EDUPLANIX_PLUGIN_DIR . 'includes/class-eduplanix-pages.php';
require_once EDUPLANIX_PLUGIN_DIR . 'includes/class-eduplanix-assets.php';

register_activation_hook(__FILE__, ['Eduplanix_Pages', 'activate']);
register_activation_hook(__FILE__, ['Eduplanix_DB', 'activate']);
register_deactivation_hook(__FILE__, ['Eduplanix_Pages', 'deactivate']);

add_action('init', ['Eduplanix_Pages', 'register_shortcode']);
add_action('init', ['Eduplanix_Pages', 'register_rewrite']);
add_action('template_redirect', ['Eduplanix_Pages', 'maybe_render_app_shell']);
add_action('wp_enqueue_scripts', ['Eduplanix_Assets', 'enqueue_assets']);
add_filter('query_vars', ['Eduplanix_Pages', 'register_query_vars']);
add_action('init', ['Eduplanix_Pages', 'add_rewrite_rules']);

register_activation_hook(__FILE__, function () {
    flush_rewrite_rules();
});
register_deactivation_hook(__FILE__, function () {
    flush_rewrite_rules();
});
