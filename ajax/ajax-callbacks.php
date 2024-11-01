<?php
if ( ! defined( 'CSS3KFA_VERSION' ) ) exit; // Exit if accessed directly

//ACTIONS
add_action( 'wp_ajax_css3kfa_new', 					'css3kfa_new_callback' );
add_action( 'wp_ajax_css3kfa_update', 				'css3kfa_update_callback' );
add_action( 'wp_ajax_css3kfa_update_elementchain', 	'css3kfa_update_elementchain_callback' );
add_action( 'wp_ajax_css3kfa_getanim', 				'css3kfa_fetchanim_callback' );
add_action( 'wp_ajax_nopriv_css3kfa_getanim', 		'css3kfa_fetchanim_callback' );
add_action( 'wp_ajax_css3kfa_fetchall', 			'css3kfa_fetchall_callback' );
add_action( 'wp_ajax_nopriv_css3kfa_fetchall', 		'css3kfa_fetchall_callback' );
add_action( 'wp_ajax_css3kfa_delete', 				'css3kfa_delete_callback' );
add_action( 'wp_ajax_css3kfa_translate', 			'css3kfa_translate_callback' );

function css3kfa_new_callback() {

	check_ajax_referer( 'myajax-css3kfa-nonce', 'security' );

	if (!CSS3KFA_animation::can_edit()) wp_die();

	$post_id = wp_insert_post( array(
			'post_type' => CSS3KFA_animation::post_type,
			'post_status' => 'publish',
			'post_title' => __(CSS3KFA_animation::default_title, 'css3kfa')
	) );
	
	$page_id = (int) $_POST['page'];
	$elementChain = sanitize_text_field($_POST['element_chain']);
	$animType = sanitize_text_field($_POST['anim_type']);
	update_post_meta($post_id, CSS3KFA_animation::element_chain, $elementChain);
	update_post_meta($post_id, CSS3KFA_animation::page_id, $page_id);
	update_post_meta($post_id, CSS3KFA_animation::anim_type, $animType);
	$newpost = get_post($post_id);
	$title = $newpost->post_title;
	$admin_url = CSS3KFA_animation::admin_url($post_id);
	$out = array('tooltip' => $title, 'postId' => $post_id, 'admin_url'=>$admin_url);
	echo json_encode($out);
	wp_die();
}

function css3kfa_update_callback() {
	if (!CSS3KFA_animation::can_edit()) wp_die();
	if (!isset($_POST['id'])) wp_die();
	check_ajax_referer( 'myajax-css3kfa-nonce', 'security' );
	CSS3KFA_animation::update_post($_POST['id'], $_POST['content'], $_POST['anim_type'], $_POST['css'], $_POST['title']);
	wp_die();
}

function css3kfa_update_elementchain_callback() {

	if (!CSS3KFA_animation::can_edit()) wp_die();
	check_ajax_referer( 'myajax-css3kfa-nonce', 'security' );
	$id = (int)$_POST['id'];
	$elementChain = sanitize_text_field($_POST['elementchain']);
	update_post_meta($id, CSS3KFA_animation::element_chain, $elementChain);
	wp_die();
}

function css3kfa_fetchanim_callback() {

	check_ajax_referer( 'myajax-css3kfa-nonce', 'security' );
	$id=(int) $_POST['id'];
	$out = CSS3KFA_animation::get_animation($id);
	echo(json_encode($out));
	wp_die();
}

function css3kfa_fetchall_callback() {

	check_ajax_referer( 'myajax-css3kfa-nonce', 'security' );
	$ids = array(); 
	foreach ($_POST["ids"] as $id) {
		$ids[] = (int) $id;
	}
	$out = CSS3KFA_animation::get_animations($ids,true);
	echo(json_encode($out));
	wp_die();
}

function css3kfa_delete_callback() {

	if (!CSS3KFA_animation::can_edit()) wp_die();
	check_ajax_referer( 'myajax-css3kfa-nonce', 'security' );
	$id=(int) $_POST['id'];
	CSS3KFA_animation::delete_anim($id);
	wp_die();
}

function css3kfa_translate_callback() {
	check_ajax_referer( 'myajax-css3kfa-nonce', 'security' );
	$text = __(sanitize_text_field($_POST['text']));
	$title = __(sanitize_text_field($_POST['title']));
	$out = array('title' => $title, 'text' => $text);
	echo(json_encode($out));
	wp_die();
}

