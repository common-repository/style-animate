<?php
/**
 * Fired when the plugin is uninstalled.
 */

// If uninstall not called from WordPress, then exit
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}
require_once("defines.php");
require_once("includes.php");

/*
$css3kfa_out = array();
global $post;
$args=array(
	'post_type' => CSS3KFA_animation::post_type,
	'posts_per_page' => -1
);
$my_query = new WP_Query($args);
if( $my_query->have_posts() ) {
	while ($my_query->have_posts()) {
		$my_query->the_post();
		array_push($css3kfa_out, $post->ID);
	}
}
wp_reset_query();  // Restore global post data stomped by the_post().

foreach ($css3kfa_out as $id) {
	CSS3KFA_animation::delete_anim($id); //leave animations in case re-install needed later
}
*/