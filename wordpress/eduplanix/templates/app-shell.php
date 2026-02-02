<?php
if (!defined('ABSPATH')) {
    exit;
}
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php bloginfo('name'); ?> – Eduplanix</title>
    <?php do_action('wp_head'); ?>
</head>
<body class="eduplanix-body">
    <div id="eduplanix-root"></div>
    <?php do_action('wp_footer'); ?>
</body>
</html>
