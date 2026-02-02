<?php

if (!defined('ABSPATH')) {
    exit;
}

class Eduplanix_Assets {
    public static function enqueue_assets() {
        if (!Eduplanix_Pages::is_eduplanix_request()) {
            return;
        }

        $manifest_path = EDUPLANIX_PLUGIN_DIR . 'assets/manifest.json';
        $assets_url = EDUPLANIX_PLUGIN_URL . 'assets/';

        if (file_exists($manifest_path)) {
            $manifest = json_decode(file_get_contents($manifest_path), true);
            if (is_array($manifest)) {
                foreach ($manifest as $entry) {
                    if (!empty($entry['file']) && str_ends_with($entry['file'], '.js')) {
                        wp_enqueue_script(
                            'eduplanix-app',
                            $assets_url . $entry['file'],
                            [],
                            EDUPLANIX_PLUGIN_VERSION,
                            true
                        );
                    }
                    if (!empty($entry['css'])) {
                        foreach ($entry['css'] as $css_file) {
                            wp_enqueue_style(
                                'eduplanix-style',
                                $assets_url . $css_file,
                                [],
                                EDUPLANIX_PLUGIN_VERSION
                            );
                        }
                    }
                }
            }
        } else {
            wp_enqueue_script(
                'eduplanix-app',
                $assets_url . 'eduplanix.js',
                [],
                EDUPLANIX_PLUGIN_VERSION,
                true
            );
            wp_enqueue_style(
                'eduplanix-style',
                $assets_url . 'eduplanix.css',
                [],
                EDUPLANIX_PLUGIN_VERSION
            );
        }
    }
}
