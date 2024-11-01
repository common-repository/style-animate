<?php
/*
Plugin Name: Style & Animate
Plugin URI: http://www.styleandanimate.com/
Description: Edit styles and create keyframed CSS3 animations on any page or post.
Version: 1.12
Author: Richard Mark Watton
Author URI: http://www.styleandanimate.com/
Text Domain: css3kfa
License: GPLv2 or later

*/

/*
 Copyright 2017  Richard Watton  (email : r.m.watton@gmail.com)

 This program is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License, version 2, as
 published by the Free Software Foundation.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
require_once("defines.php");
require_once("includes.php");

/*
if (is_admin() == true) {

	function css3kfa_activate() {
	}
	function css3kfa_deactivate() {
	}
	//HOOKS
	register_activation_hook(__FILE__, 'css3kfa_activate');
	register_deactivation_hook(__FILE__, 'css3kfa_deactivate');
}
*/

//ACTIONS


/**
 * Register our sidebars and widgetized areas.
*
*/

//widget sidebar
/*
function css3kfa_donate_widgets_init() {

	register_sidebar( array(
			'name'          => 'Donate sidebar',
			'id'            => 'donate_sidebar',
			'description' => __( 'Donate widget placeholder', 'css3kfa' ),
			'before_widget' => '<div>',
			'after_widget'  => '</div>',
			'before_title'  => '<div>',
			'after_title'   => '</div>'
	) );

}
add_action( 'widgets_init', 'css3kfa_donate_widgets_init' );

function css3kfa_before_post_widget( $content ) {
	if ( is_page( 'donate' ) && is_active_sidebar( 'donate_sidebar' ) && is_main_query() ) {
		dynamic_sidebar('donate_sidebar');
	}
	return $content;
}
//doesn't work in a custom widget with yeost
//add_filter( 'the_content', 'css3kfa_before_post_widget' );
 * */

//Add settings link to plugins page
function css3kfa_plugin_add_settings_link( $links ) {
	$settings_link = '<a href="options-general.php?page=' . CSS3KFA_animation::menu_slug .'">' . __( 'Settings' ) . '</a>';
	array_push( $links, $settings_link );
	return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'css3kfa_plugin_add_settings_link' );
add_action( 'wp_enqueue_scripts', 'css3kfa_loadscripts',PHP_INT_MAX); //low priority to ensure all other styles are loaded first
add_action( 'admin_enqueue_scripts', 'css3kfa_loadadminscripts' );
add_action( 'wp_head','css3kfa_ajaxurl');
add_action( 'init', 'css3kfa_create_posttype');

function css3kfa_plugin_get_version() {
	if ( ! function_exists( 'get_plugins' ) )
       require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
    $plugin_folder = get_plugins( '/' . plugin_basename( dirname( __FILE__ ) ) );
    $plugin_file = basename( ( __FILE__ ) );
    return $plugin_folder[$plugin_file]['Version'];
}
function css3kfa_loadadminscripts() {
	wp_enqueue_style( 'css3kfa-styles',  plugins_url('/styles/css/style_admin.css', __FILE__ ) );
}
function css3kfa_loadscripts()
{
	$minified = true;
	
	if( CSS3KFA_animation::can_edit()) { 
		//only editors can make style changes so nothing is loaded otherwise
		if (!is_admin()) add_action('admin_bar_menu', 'css3kfa_add_admin_button', 999);
		

		if (!$minified) {
			wp_register_script( 'css3kfa_jquery_contextmenu', 	plugins_url( '/jquery-simple-context-menu-master/jquery.contextmenu.js', 	__FILE__ ), array( 'jquery'));
			wp_register_script( 'css3kfa_jquery_menu', 	plugins_url( '/jquery-simple-context-menu-master/jquery.menu.js', 	__FILE__ ), array( 'jquery'));
			wp_register_script( 'css3kfa_anim', 		plugins_url( '/js/animation.js', 	__FILE__ ), array( 'jquery'), null, true );
			wp_register_script( 'css3kfa_editor', 		plugins_url( '/js/editor.js', 		__FILE__ ), array( 'css3kfa_anim'), null, true );
			wp_register_script( 'css3kfa_single', 		plugins_url( '/js/single.js', 		__FILE__ ), array( 'css3kfa_anim'), null, true );
			wp_register_script( 'css3kfa_timeline', 	plugins_url( '/js/timeline.js', 	__FILE__ ), array( 'css3kfa_anim'), null, true );
			wp_register_script( 'css3kfa_keyframe', 	plugins_url( '/js/keyframe.js',		__FILE__ ), array( 'css3kfa_anim'), null, true );
			wp_register_script( 'css3kfa_block', 		plugins_url( '/js/block.js', 		__FILE__ ), array( 'css3kfa_anim'), null, true );
			wp_register_script( 'css3kfa_style', 		plugins_url( '/js/style.js', 		__FILE__ ), array( 'css3kfa_anim'), null, true );
			wp_register_script( 'css3kfa_stylepane', 	plugins_url( '/js/stylepane.js', 	__FILE__ ), array( 'css3kfa_anim'), null, true );
			wp_register_script( 'css3kfa_dialog', 		plugins_url( '/js/dialog.js', 		__FILE__ ), array( 'css3kfa_anim'), null, true );
			wp_register_script( 'css3kfa_cssout', 		plugins_url( '/js/cssout.js', 		__FILE__ ), array( 'css3kfa_anim'), null, true );	
		}
		else {
			wp_register_script( 'css3kfa_jquery_contextmenu', 	plugins_url( '/jquery-simple-context-menu-master/jquery.contextmenu.min.js', 	__FILE__ ), array( 'jquery'));
			wp_register_script( 'css3kfa_jquery_menu', 	plugins_url( '/jquery-simple-context-menu-master/jquery.menu.min.js', 	__FILE__ ), array( 'jquery'));
			wp_register_script( 'css3kfa_editor', 		plugins_url( '/js/style-editor.min.js', 	__FILE__ ), array( 'jquery'), null, true );
		}
		wp_enqueue_script( 'css3kfa_jquery_contextmenu');
		wp_enqueue_script( 'css3kfa_jquery_menu');
		wp_enqueue_script('jquery-ui-core', false, array('jquery'));
		/*
		 jQuery dialog: enqueue script (already registered by WP) and get some nice styles
		 Themes: black-tie, blitzer, cupertino, dark-hive, dot-luv, eggplant, excite-bike, flick, hot-sneaks, humanity, le-frog, mint-choc, overcast,pepper-grinder, redmond, smoothness, south-street, start, sunny, swanky-purse, trontastic, ui-darkness, ui-lightness, and vader.
		 */
		wp_enqueue_script('jquery-ui-dialog', 		false, array('jquery'));
		wp_enqueue_script( 'iris', admin_url( 'js/iris.min.js' ), array( 'jquery-ui-draggable', 'jquery-ui-slider', 'jquery-touch-punch' ), false, 1 );
		
		if (!$minified) {
			
			wp_enqueue_script( 'css3kfa_anim' );
			wp_enqueue_script( 'css3kfa_timeline' );
			wp_enqueue_script( 'css3kfa_keyframe' );
			wp_enqueue_script( 'css3kfa_block' );
			wp_enqueue_script( 'css3kfa_style' );
			wp_enqueue_script( 'css3kfa_stylepane' );	
			wp_enqueue_script( 'css3kfa_menu' );
			wp_enqueue_script( 'css3kfa_editor' );
			wp_enqueue_script( 'css3kfa_single' );
			wp_enqueue_script( 'css3kfa_dialog' );
			wp_enqueue_script( 'css3kfa_cssout' );	
		}
		else {
			wp_enqueue_script( 'css3kfa_editor' );
		}
		
		wp_enqueue_script( 'wp-color-picker', admin_url( 'js/color-picker.js' ), array('jquery-ui-widget','iris'), false, 1);
		$colorpicker_l10n = array(
				'clear' => __( 'Clear' ),
				'defaultString' => __( 'Default' ),
				'pick' => __( 'Select Color' ),
				'current' => __( 'Current Color' ),
		);
		wp_localize_script( 'wp-color-picker', 'wpColorPickerL10n', $colorpicker_l10n );
		wp_enqueue_script(
				'alpha-color-picker',
				plugins_url( 'alpha-color-picker/alpha-color-picker.min.js', 		__FILE__ ), 
				array( 'jquery', 'iris'),
				null,
				true
				);
		
		wp_localize_script( 'css3kfa_editor', 'css3kfa_vars', array(
				//nonce will be available as MyAjax.[nonce name] in javascript
			'css3kfaNonce' => wp_create_nonce( 'myajax-css3kfa-nonce' ),
			'pageId' => get_the_ID(),
			'pluginPath' => plugin_dir_url ( __FILE__ ),
			'helpURL' => CSS3KFA_HELPURL
		)
		);
		
		// Get the WP built-in version
		$wp_jquery_ver = $GLOBALS['wp_scripts']->registered['jquery-ui-core']->ver;
		/*
		 //this is not allowed, so the file is included directly instead
		 		wp_enqueue_style('css3kfa-jquery-ui-styles',
				'http://ajax.googleapis.com/ajax/libs/jqueryui/' . $wp_jquery_ver . '/themes/black-tie/jquery-ui.min.css',
				false,
				css3kfa_plugin_get_version(), //so caching will not happen when version changes
				false);
		 */
		wp_enqueue_style( 'css3kfa-jquery-ui-styles', plugins_url('/styles/css/black-tie.jquery-ui.min.css', __FILE__ ) );
		wp_enqueue_style( 'css3kfa-contextMenu-styles', plugins_url( '/jquery-simple-context-menu-master/jquery.contextmenu.min.css', __FILE__ ) );
		wp_enqueue_style( 'alpha-color-picker', plugins_url('/alpha-color-picker/alpha-color-picker.min.css', __FILE__ ), array( 'wp-color-picker' ));
		wp_enqueue_style( 'css3kfa-styles', plugins_url('/styles/css/style.css', __FILE__ ) );
	}
	
	wp_enqueue_media();
	
	//load stuff if not logged in
	if (!is_admin() && !CSS3KFA_animation::can_edit()) {
		
		//wp_register_script( 'css3kfa_test', plugins_url( '/js/test.js', __FILE__ ), array( 'jquery'), null, false );
		//wp_enqueue_script( 'css3kfa_test' );
		
		
		//$upload_dir = wp_upload_dir();
		//$css_file = $upload_dir['baseurl'].'/'.CSS3KFA_animation::upload_folder.'/'.CSS3KFA_animation::css.'/'.CSS3KFA_animation::stylesheet;
		//wp_enqueue_style( 'css3kfa-generated-styles',  $css_file );
		wp_register_script( 'css3kfa_runonvisible', plugins_url( '/js/runonvisible.min.js', __FILE__ ), array( 'jquery'), null, false );
		wp_enqueue_script( 'css3kfa_runonvisible' );
		
		$out = CSS3KFA_animation::get_element_ids(); //no content and all pages / posts, as multiple posts may be displayed on this page
		wp_localize_script( 'css3kfa_runonvisible', 'css3kfa_vars', array(
			'elements' => $out
		)
		);
	}
}
function css3kfa_load_styles() {
	if (!is_admin() && !CSS3KFA_animation::can_edit()) {
		$upload_dir = wp_upload_dir();
		
		$version = 1;
		$opt = get_option( CSS3KFA_animation::option_name );
		if ( $opt !== false ) {
			$version = $opt;
		}
		
		$css_file = $upload_dir['baseurl'].'/'.CSS3KFA_animation::upload_folder.'/'.CSS3KFA_animation::css.'/'.CSS3KFA_animation::stylesheet;
		wp_enqueue_style( 'css3kfa-generated-styles',  $css_file, null, $version );
	}
}
//although this is deprecated, it will load the stylesheet last and if another theme uses the same function to load its stylesheet,
// then this will ensure the generated styles are loaded last (unless the theme sets the load priority to the same value, although why you'd want to do that
// in a theme anyway, and so far I haven't found a theme where doing even that loads the style sheet after the plugin-generated styles)
add_action('wp_print_styles', 'css3kfa_load_styles', PHP_INT_MAX);
//add_action( 'wp_enqueue_scripts', 'css3kfa_load_styles',PHP_INT_MAX); //low priority to ensure all other styles are loaded first

function css3kfa_ajaxurl() {
	if (!is_admin()) {
		//ajaxurl is only defined if logged in, by default
		echo '<script type="text/javascript">';
		echo "var ajaxurl = '" . admin_url('admin-ajax.php') ."'";
		echo '</script>';
	}
}

// add a link to the WP Toolbar
function css3kfa_add_admin_button($wp_admin_bar) {

	$iconspan = '<span class="css3kfa-custom-icon css3kfa-custom-icon-inactive"></span>';
	$iconspanActive = '<span class="css3kfa-custom-icon css3kfa-custom-icon-active"></span>';
	$args = array(

			'id' => 'addanimation',
			'title' => '<span class="css3kfa-button-text">'.$iconspan . __('+ Style/Animate', 'css3kfa').'</span><span class="css3kfa-button-text-active">'.$iconspanActive . __('Stop picking', 'css3kfa').'</span>',
			'href' => '#',
			'meta' => array(
					'title' => __('Add or edit Styles, or create Animation / Transition', 'css3kfa'),
					'onclick' => 'css3kfa_obj.addAnimation()'
			)
	);
	$wp_admin_bar->add_node($args);
}

function css3kfa_create_posttype() {
	CSS3KFA_animation::register_post_type();
}