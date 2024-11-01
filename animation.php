<?php
class CSS3KFA_animation {
	
	const post_type = 'css3kfa_anim';
	const page_id = 'page_id';
	const css = 'css';
	const anim_type = 'anim_type';
	const element_chain = 'element_chain';
	const default_title = 'Untitled';
	const default_tooltip = 'Untitled';
	const serialized_data = 'data';
	const option_name = 'css3kfa_stylesheet_version';
	
	const upload_folder = "style-and-animate";
	const styles_folder = "css";
	const stylesheet = "generated-styles.css";
	private $properties = array();
	const menu_slug = "style-and-animate"; //don't use in __(), _e() etc. - must be a string literal here
	const submenu1_slug = "css3kfa_submenu1"; //don't use in __(), _e() etc. - must be a string literal here
	//use wp_parse_args() to combine arrays
	
	public static function register_post_type() {
		register_post_type( self::post_type, array(
			'labels' => array(
			'name' => __( 'CSS3 Keyframe Animation', 'css3kfa' ),
			'singular_name' => __( 'CSS3 Keyframe Animations', 'css3kfa' ) ),
			'rewrite' => false,
			'query_var' => false ) );
	}
	
	public static function delete_anim($post_id) {
		wp_delete_post($post_id, true);
		delete_post_meta($post_id, self::page_id);
		delete_post_meta($post_id, self::element_chain);
		delete_post_meta($post_id, self::anim_type);
		self::write_css();
	}
	public static function get_element_ids() {

		$elements=array();

		global $post;
		$args=array(
				'post_type' => self::post_type,
				'post_status' => 'publish',
				'posts_per_page' => -1
		);
		$my_query = new WP_Query($args);
		if( $my_query->have_posts() ) {
			while ($my_query->have_posts()) {
		
				$my_query->the_post();
				$content =  json_decode($post->post_content);
				if (empty($content)) continue;
				self::get_object_ids($content->rootLayer, $elements);
			}
		}

		wp_reset_query();  // Restore global post data stomped by the_post().
		return $elements;
	}
	public static function get_object_ids($layer, &$elements) 	{
		if ($layer->elementID !== '') $elements[] = $layer->elementID;
		foreach ($layer->children as $l) {
			self::get_object_ids($l, $elements);
		}
	}
	public static function get_animations($post_ids=NULL, $get_contents = FALSE) {
		
		$out = array();
		global $post;
		$args=array(
				'post_type' => self::post_type,
				'post_status' => 'publish',
				'posts_per_page' => -1
		);
		$my_query = new WP_Query($args);
		if( $my_query->have_posts() ) {
			while ($my_query->have_posts()) {
		
				$my_query->the_post();
				$content = $post->post_content;
				//a few tests, should not be needed but it will kill the entire plugin if something goes wrong here.
				if (empty($content)) continue;
				$obj = json_decode($content);
				if (is_null($obj)) continue; //json failed
				if (!isset($obj->rootLayer) && !isset($obj->rootLayer->children)) continue; //json OK but not complete
				$len = count($obj->rootLayer->children)-1;
				if ($len < 0) continue;
				
				$nonEditorElementChain = $obj->rootLayer->children[$len]->elementID;
				$originalElementChain = $obj->rootLayer->children[$len]->fullElementID;
				/*
				 * The shortest ID is stored in the JSON data for the first child of the root layer, and will not have a body tag or page ID if object is to be styled on all pages. 
				 * The long ID is stored in meta and always has the page ID and body tag, to identify the originating page
				 * The long ID is used to fix the object in the editor environment, so if something is added or removed it will still locate correctly
				 * It is not possible to use the shortest ID for editor purposes
				 * However, if the object is meant to be page-agnostic, it is necessary to remove the page ID and body tag, so by comparing the long and short ID's this can be done here
				 */
				//if this is page-agnostic, then strip the page ID out of the element chain meta, which contains the full object path.
				//This is needed to correctly locate the object in the editor
				$re = '/article#post|page-id-/i';

				$elementChain = get_post_meta($post->ID, self::element_chain, true);

				if (!preg_match($re, $nonEditorElementChain)) {

					//strip page id here
					$re = '/article#post-(\d+)>/i';
					$elementChain = preg_replace($re, '', $elementChain);
					$re = '/BODY\.page-id-(\d+)>/i';
					$elementChain = preg_replace($re, '', $elementChain);
				}

				$found = true;
				if ($post_ids != NULL) {
					//if this contains page-specific data, then check if it matches with post ids
					//if no page-specific data, then don't check
					$re = '/article#post|page-id-/';
					if (preg_match($re, $elementChain)) {
						$found = false;
						//don't want to send all the animations, just the ones on the page which sent the request
						$re = '/article#post-(\d+)/i';
						if (preg_match($re, $elementChain, $matches)) {
							if (in_array($matches[1], $post_ids)) {
								$found = true;
							}
						}
						if ($found==false) {
							$re = '/page-id-(\d+)/i';
							if (preg_match($re, $elementChain, $matches)) {
								if (in_array($matches[1], $post_ids)) {
									$found = true;
								}
							}
						}
					}
				}
				if ($found) {
					$pageId = get_post_meta($post->ID, self::page_id, true);
					$animType = get_post_meta($post->ID, self::anim_type, true);
					$pageLink = get_permalink($pageId);
					$pageName = get_the_title($pageId);
					$content = ($get_contents==TRUE) ? $post->post_content : '';
					$page="<a href=\"$pageLink\">$pageName</a>";
					$title = self::get_title($post);
					$tooltip = $title;
					$admin_url = (self::can_edit()) ? self::admin_url($post->ID) : null;
					array_push($out, array('id'=>$post->ID,'animType'=>$animType,'name'=>$title,'elementChain'=>$elementChain,'originalElementChain'=>$originalElementChain, 'data'=>$content,'created'=>$post->post_date,'page'=>$page,'tooltip'=>$tooltip,'admin_url'=>$admin_url));
					//array_push($out, array('id'=>$post->ID,'animType'=>$animType,'name'=>$title,'elementChain'=>$elementChain,'data'=>$content,'created'=>$post->post_date,'page'=>$page,'tooltip'=>$tooltip,'admin_url'=>$admin_url));
				}
			}
		}
		wp_reset_query();  // Restore global post data stomped by the_post().
		return $out;
	}
	public static function get_animation($post_id) {
	
		$out = array();

		$post = get_post($post_id);
		$pageId = get_post_meta($post_id, self::page_id, true);
		$elementChain = get_post_meta($post_id, self::element_chain, true);
		$animType = get_post_meta($post->ID, self::anim_type, true);
		$pageLink = get_permalink($pageId);
		$pageName = get_the_title($pageId);
		$content = $post->post_content;
		$page="<a href=\"$pageLink\">$pageName</a>";
		$title = self::get_title($post);
		$tooltip = $title;
		$admin_url = (self::can_edit()) ? self::admin_url($post->ID) : null;
		array_push($out, array('id'=>$post->ID,'name'=>$title,'animType'=>$animType,'elementChain'=>$elementChain,'data'=>$content,'created'=>$post->post_date,'page'=>$page,'tooltip'=>$tooltip,'admin_url'=>$admin_url));
		return $out;
	}
	public static function can_edit() {
		return (current_user_can('edit_pages') || current_user_can('edit-posts'));
	}
	public static function admin_url($post_id) {
		if (!self::can_edit()) return null;
		return sprintf('%s?page=%s&action=%s&id=%s',admin_url('admin.php'),self::menu_slug,'edit',$post_id);

	}
	public static function update_post($id, $content, $animType, $css, $title) { //, $page=NULL, $elementChain=NULL) {

		if (!isset($id)) return;
		if (!isset($content)) $content='';
		if (!isset($css)) $css='';
		if (!isset($title)) $title='Unnamed animation';
		$id = (int) $id;
		$content = sanitize_text_field($content);
		$title = sanitize_text_field($title);
		$animType = sanitize_text_field($animType);
		$css = sanitize_text_field($css);
		
		$post_id = wp_update_post( array(
				'ID' 			=> $id,
				'post_status' 	=> 'publish',
				'post_title'	=> $title,
				'post_content' 	=> $content 
					
		));

		update_post_meta($id, self::css, $css);
		update_post_meta($id, $animType, self::anim_type);
	
		self::write_css();
	}
	public static function write_css() {
		$out = '';
		global $post;
		$args=array(
				'post_type' => self::post_type,
				'post_status' => 'publish',
				'posts_per_page' => -1
		);
		$my_query = new WP_Query($args);
		if( $my_query->have_posts() ) {
			while ($my_query->have_posts()) {
				$my_query->the_post();
				$css = get_post_meta($post->ID, self::css,true);
				$out .= $css;
			}
		}
		
		wp_reset_query();  // Restore global post data stomped by the_post().
		
		//this will minify
		//$out = preg_replace('/[\s+\n]/', "", $out);
		
		$upload_dir = wp_upload_dir();
		$css_folder = $upload_dir['basedir'].'/'.self::upload_folder.'/'.self::css;
		wp_mkdir_p($css_folder);
		
		$version = 1;
		$opt = get_option( self::option_name );
		if ( $opt !== false ) {
			$version = $opt+1;
		
			// The option already exists, so we just update it.
			update_option( self::option_name, $version );
		
		} else {
		
			// The option hasn't been added yet. We'll add it with $autoload set to 'no'.
			$deprecated = null;
			$autoload = 'no';
			add_option( self::option_name, $version, $deprecated, $autoload );
		}

		if (file_put_contents($css_folder .'/'.self::stylesheet, $out)==false) error_log("failed to write css file");
	}
	public static function set_title($id, $title) {
	
		if (!isset($id)) return;
		if (!isset($title)) $content='';
	
		$id = (int) $id;
		$title = sanitize_text_field($title);
	
		$post_id = wp_update_post( array(
				'ID' 			=> (int) $id,
				'post_title'	=> $title,
		));
	}
	public static function get_title($post) { //post or ID
		$post = get_post($post);
		$title = $post->post_title;
		return $title;
	}
	public static function get_next_ID() {
		$args = array(
				'post_type'		=>	self::post_type,
				'post_status' 	=> 'draft'
		);
		$my_query = new WP_Query( $args );
		if( $my_query->have_posts() ) {
			while( $my_query->have_posts() ) {
				$my_query->the_post();
				$ret = get_the_ID();
				wp_reset_postdata();
				return $ret;
			}
		}
		//not found
		$post_id = wp_insert_post( array(
				'post_type' => self::post_type,
				'post_status' => 'draft',
				'post_title' => __(self::default_title, 'css3kfa')
		) );
		
		add_post_meta($post_id, self::element_chain, '');
		add_post_meta($post_id, self::anim_type, 0); //1 is animation, 2 is transition
		add_post_meta($post_id, self::page_id, 1); 
		return $post_id;

	}
	public static function get_edit_page($post) {
		return sprintf('<a href="?page=%s&action=%s&id=%s">Edit</a>',$_REQUEST['page'],'edit',$post);
	}
	
	//obj is either an id or a post object
	private function __construct($obj) {
		
		//unused
		if (obj && self::post_type == get_post_type($post)) {

			$post = get_post($obj);
			$properties['name'] = $post->post_title;
			$properties['page'] = get_post_meta($post->ID, 'page');
			$properties['created'] = $post->post_date;
			$properties['updated'] = $post->post_modified;
			$properties['content'] = $post->post_content;
			
		}

	}
}