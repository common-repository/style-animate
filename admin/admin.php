<?php
if ( ! defined( 'CSS3KFA_VERSION' ) ) exit; // Exit if accessed directly

//ACTIONS
add_action('admin_menu', 'css3kfa_plugin_menu' );
add_action('admin_init', 'css3kfa_admin_init');

function css3kfa_admin_init(){
	register_setting( 'css3kfa_options_group', 'css3kfa_options', 'css3kfa_options_validate' );
	add_settings_section('css3kfa_main', 'Main Settings', 'css3kfa_section_text', 'css3kfa');
	add_settings_field('css3kfa_text_string', 'CSS3KFA Text Input', 'css3kfa_setting_string', 'css3kfa', 'css3kfa_main');
	//css3kfa_setupDB();

	//set up the first post
}

function css3kfa_plugin_menu() {
	$icon_svg = 'data:image/svg+xml;base64,' . base64_encode('<svg width="20" height="20" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M1325 1024h-109q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h109q-32-108-112.5-188.5t-188.5-112.5v109q0 26-19 45t-45 19h-128q-26 0-45-19t-19-45v-109q-108 32-188.5 112.5t-112.5 188.5h109q26 0 45 19t19 45v128q0 26-19 45t-45 19h-109q32 108 112.5 188.5t188.5 112.5v-109q0-26 19-45t45-19h128q26 0 45 19t19 45v109q108-32 188.5-112.5t112.5-188.5zm339-192v128q0 26-19 45t-45 19h-143q-37 161-154.5 278.5t-278.5 154.5v143q0 26-19 45t-45 19h-128q-26 0-45-19t-19-45v-143q-161-37-278.5-154.5t-154.5-278.5h-143q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h143q37-161 154.5-278.5t278.5-154.5v-143q0-26 19-45t45-19h128q26 0 45 19t19 45v143q161 37 278.5 154.5t154.5 278.5h143q26 0 45 19t19 45z"/></svg>');
	$my_admin_page = add_menu_page( "Style &amp; Animate1", "Style &amp; Animate", "manage_options", CSS3KFA_animation::menu_slug, "css3kfa_display_admin_page", $icon_svg, 90 );
	//add_submenu_page(CSS3KFA_animation::menu_slug, "All styled / animated", "All styled / animated", "manage_options", CSS3KFA_animation::menu_slug, "css3kfa_display_admin_page");
	//add_submenu_page(CSS3KFA_animation::menu_slug, "Style and Animate - help", "Help", "manage_options", CSS3KFA_animation::submenu1_slug, "css3kfa_display_help_page");
	
	add_action('load-'.$my_admin_page, 'css3kfa_admin_add_help_tab');
}
function css3kfa_admin_add_help_tab () {
	$screen = get_current_screen();

	// Add my_help_tab if current screen is My Admin Page
	$screen->add_help_tab( array(
			'id'	=> 'css3kfa_help_tab',
			'title'	=> __('Help'),
			'content'	=> '
						<div class="css3kfa-adminhelp-leftpanel">
						<h3>Quick start:</h3>
						<p>1) Go to any front (non-admin) page<br>
						2) Click the <span class="css3kfa-help1">+Style/Animate</span> button in the admin menu bar<br>
						3) Click anywhere on the page to select a page element (page will auto-scroll as needed)<br>
						4) Choose <span class="css3kfa-help2">Add / Edit Styles</span> from the pop-up menu<br>
						5) Expand the styles in the Styles Panel on the right, to start changing style values
						</p>
						</div>
						<div class="css3kfa-adminhelp">
						<div class="css3kfa-admininner">
						<h3 class="css3kfa-adminhead">Help and documentation</h3>
						</div>
						<div class="css3kfa-admininner">
						<p>Read the <a href="'. CSS3KFA_FAQURL .'" target="_blank">FAQ</a></p>
						<p>Browse the <a href="'. CSS3KFA_MANUALURL .'" target="_blank">manual</a></p>
						<p>Get help or ask questions on the <a href="'. CSS3KFA_FORUMURL .'" target="_blank">support forum</a></p>
						</div>
						</div>'	,
	) );
}
function css3kfa_helplink() {
	echo '<p><a href="" target="_blank">Help and documentation</a></p>';
	//<form method="post" action="<?php echo esc_url( add_query_arg( array('page' => 'css3kfa_menu', 'action' => 'help'), menu_page_url( 'css3kfa_submenu1', false ) ) );
	//submit_button('help',"submit");
	//</form>
}


//admin list table
//taken from Custom List Table Example, with gratitude!

/*  Copyright 2015  Matthew Van Andel  (email : matt@mattvanandel.com)

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
/*************************** LOAD THE BASE CLASS *******************************
 *******************************************************************************
 * The WP_List_Table class isn't automatically available to plugins, so we need
 * to check if it's available and load it if necessary. In this tutorial, we are
 * going to use the WP_List_Table class directly from WordPress core.
 *
 * IMPORTANT:
 * Please note that the WP_List_Table class technically isn't an official API,
 * and it could change at some point in the distant future. Should that happen,
 * I will update this plugin with the most current techniques for your reference
 * immediately.
 *
 * If you are really worried about future compatibility, you can make a copy of
 * the WP_List_Table class (file path is shown just below) to use and distribute
 * with your plugins. If you do that, just remember to change the name of the
 * class to avoid conflicts with core.
 *
 */





/************************** CREATE A PACKAGE CLASS *****************************
 *******************************************************************************
 * Create a new list table package that extends the core WP_List_Table class.
 * WP_List_Table contains most of the framework for generating the table, but we
 * need to define and override some methods so that our data can be displayed
 * exactly the way we need it to be.
 *
 * To display this example on a page, you will first need to instantiate the class,
 * then call $yourInstance->prepare_items() to handle any data manipulation, then
 * finally call $yourInstance->display() to render the table to the page.
 *
 * Our theme for this list table is going to be movies.
 */
class css3kfa_List_Table extends WP_List_Table_copy {


	/** ************************************************************************
	 * REQUIRED. Set up a constructor that references the parent constructor. We
	 * use the parent reference to set some default configs.
	 ***************************************************************************/
	function __construct(){
		global $status, $page;

		//Set parent defaults
		parent::__construct( array(
				'singular'  => 'CSS3 Keyframe Animation',     //singular name - if this is changed, change $_REQUEST index in process_bulk_actions()
				'plural'    => 'CSS3 Keyframe Animations',    //plural name
				'ajax'      => false        //does this table support ajax?
		) );

	}


	/** ************************************************************************
	 * Recommended. This method is called when the parent class can't find a method
	 * specifically build for a given column. Generally, it's recommended to include
	 * one method for each column you want to render, keeping your package class
	 * neat and organized. For example, if the class needs to process a column
	 * named 'title', it would first see if a method named $this->column_title()
	 * exists - if it does, that method will be used. If it doesn't, this one will
	 * be used. Generally, you should try to use custom column methods as much as
	 * possible.
	 *
	 * Since we have defined a column_title() method later on, this method doesn't
	 * need to concern itself with any column with a name of 'title'. Instead, it
	 * needs to handle everything else.
	 *
	 * For more detailed insight into how columns are handled, take a look at
	 * WP_List_Table::single_row_columns()
	 *
	 * @param array $item A singular item (one full row's worth of data)
	 * @param array $column_name The name/slug of the column to be processed
	 * @return string Text or HTML to be placed inside the column <td>
	 **************************************************************************/
	function column_default($item, $column_name){
		if ($column_name == 'animType') {
			switch ($item[$column_name]) {
				case 0: return 'Style';
				case 1: return 'Keyframe animation';
				case 2: return 'Transition';
			}
		}
		return $item[$column_name];
	}


	/** ************************************************************************
	 * Recommended. This is a custom column method and is responsible for what
	 * is rendered in any column with a name/slug of 'title'. Every time the class
	 * needs to render a column, it first looks for a method named
	 * column_{$column_title} - if it exists, that method is run. If it doesn't
	 * exist, column_default() is called instead.
	 *
	 * This example also illustrates how to implement rollover actions. Actions
	 * should be an associative array formatted as 'slug'=>'link html' - and you
	 * will need to generate the URLs yourself. You could even ensure the links
	 *
	 *
	 * @see WP_List_Table::::single_row_columns()
	 * @param array $item A singular item (one full row's worth of data)
	 * @return string Text to be placed inside the column <td> (movie title only)
	 **************************************************************************/
	function column_name($item){

		//Build row actions
		$actions = array(
				//'edit'      => sprintf('<a href="?page=%s&action=%s&id=%s">Edit</a>',$_REQUEST['page'],'edit',$item['id']),
				'delete'    => sprintf("<a onclick='return confirm(\"".__('Delete this animation?','css3kfa')."\")' href=\"?page=%s&action=%s&id=%s\">Delete</a>", $_REQUEST['page'],'delete',$item['id'])
	//'rename'  => sprintf('<a onclick="return css3kfa_confirmdelete()" href="?page=%s&action=%s&id=%s">Rename</a>',$_REQUEST['page'],'delete',$item['id']),
		);

		//Return the title contents
		$name = $item['name'];
		//return sprintf('%1$s <span style="color:silver">(id:%2$s)</span>%3$s',
		//		/*$1%s*/ $name,
		//		/*$2%s*/ $item['id'],
		//		/*$3%s*/ $this->row_actions($actions)
		//		);
		return sprintf('%1$s %2$s',
				/*$1%s*/ $name,
				/*$3%s*/ $this->row_actions($actions)
				);
	}


	/** ************************************************************************
	 * REQUIRED if displaying checkboxes or using bulk actions! The 'cb' column
	 * is given special treatment when columns are processed. It ALWAYS needs to
	 * have it's own method.
	 *
	 * @see WP_List_Table::::single_row_columns()
	 * @param array $item A singular item (one full row's worth of data)
	 * @return string Text to be placed inside the column <td> (movie title only)
	 **************************************************************************/
	function column_cb($item){
		return sprintf(
				'<input type="checkbox" name="%1$s[]" value="%2$s" />',
				/*$1%s*/ $this->_args['singular'],  //Let's simply repurpose the table's singular label
				/*$2%s*/ $item['id']                //The value of the checkbox should be the record's id
				);
	}


	/** ************************************************************************
	 * REQUIRED! This method dictates the table's columns and titles. This should
	 * return an array where the key is the column slug (and class) and the value
	 * is the column's title text. If you need a checkbox for bulk actions, refer
	 * to the $columns array below.
	 *
	 * The 'cb' column is treated differently than the rest. If including a checkbox
	 * column in your table you must create a column_cb() method. If you don't need
	 * bulk actions or checkboxes, simply leave the 'cb' entry out of your array.
	 *
	 * @see WP_List_Table::::single_row_columns()
	 * @return array An associative array containing column information: 'slugs'=>'Visible Titles'
	 **************************************************************************/
	function get_columns(){
		$columns = array(
				'cb'        => '<input type="checkbox" />', //Render a checkbox instead of text
				'name'     	=> __('Name', 'css3kfa'),
				'page' 		=> __('Page', 'css3kfa'),
				'animType'	=> __('Type', 'css3kfa'),
				'created'   => __('Created', 'css3kfa')
		);
		return $columns;
	}


	/** ************************************************************************
	 * Optional. If you want one or more columns to be sortable (ASC/DESC toggle),
	 * you will need to register it here. This should return an array where the
	 * key is the column that needs to be sortable, and the value is db column to
	 * sort by. Often, the key and value will be the same, but this is not always
	 * the case (as the value is a column name from the database, not the list table).
	 *
	 * This method merely defines which columns should be sortable and makes them
	 * clickable - it does not handle the actual sorting. You still need to detect
	 * the ORDERBY and ORDER querystring variables within prepare_items() and sort
	 * your data accordingly (usually by modifying your query).
	 *
	 * @return array An associative array containing all the columns that should be sortable: 'slugs'=>array('data_values',bool)
	 **************************************************************************/
	function get_sortable_columns() {
		$sortable_columns = array(
				'name'     => array('name',false),     //true means it's already sorted
				'page'    => array('page',false),
				'animType'  => array('animType',false),
				'created'  => array('created',false)
		);
		return $sortable_columns;
	}


	/** ************************************************************************
	 * Optional. If you need to include bulk actions in your list table, this is
	 * the place to define them. Bulk actions are an associative array in the format
	 * 'slug'=>'Visible Title'
	 *
	 * If this method returns an empty value, no bulk action will be rendered. If
	 * you specify any bulk actions, the bulk actions box will be rendered with
	 * the table automatically on display().
	 *
	 * Also note that list tables are not automatically wrapped in <form> elements,
	 * so you will need to create those manually in order for bulk actions to function.
	 *
	 * @return array An associative array containing all the bulk actions: 'slugs'=>'Visible Titles'
	 **************************************************************************/
	//this is unused, the actions are defined in column_name(), where the ID is availale
	function get_bulk_actions() {
		$actions = array(
				'delete'    => 'Delete'
		);
		return $actions;
	}


	/** ************************************************************************
	 * Optional. You can handle your bulk actions anywhere or anyhow you prefer.
	 * For this example package, we will handle it in the class to keep things
	 * clean and organized.
	 *
	 * @see $this->prepare_items()
	 **************************************************************************/
	function process_bulk_action() {

		if (isset($_REQUEST['css3keyframeanimation'])) {
			$anims = $_REQUEST['css3keyframeanimation'];

			if( 'delete'===$this->current_action() ) {

				foreach ($anims as $anim ) {
					CSS3KFA_animation::delete_anim((int)$anim);
				}
			}
		}
		if (isset($_REQUEST['id'])) {
			$id = $_REQUEST['id'];
			if( 'delete'===$this->current_action() ) {

				CSS3KFA_animation::delete_anim((int)$id);
			}
			
		}
	}


	/** ************************************************************************
	 * REQUIRED! This is where you prepare your data for display. This method will
	 * usually be used to query the database, sort and filter the data, and generally
	 * get it ready to be displayed. At a minimum, we should set $this->items and
	 * $this->set_pagination_args(), although the following properties and methods
	 * are frequently interacted with here...
	 *
	 * @global WPDB $wpdb
	 * @uses $this->_column_headers
	 * @uses $this->items
	 * @uses $this->get_columns()
	 * @uses $this->get_sortable_columns()
	 * @uses $this->get_pagenum()
	 * @uses $this->set_pagination_args()
	 **************************************************************************/
	function prepare_items() {
		global $wpdb; //This is used only if making any database queries

		/**
		 * First, lets decide how many records per page to show
		 */
		$per_page = 10;


		/**
		 * REQUIRED. Now we need to define our column headers. This includes a complete
		 * array of columns to be displayed (slugs & titles), a list of columns
		 * to keep hidden, and a list of columns that are sortable. Each of these
		 * can be defined in another method (as we've done here) before being
		 * used to build the value for our _column_headers property.
		 */
		$columns = $this->get_columns();
		$hidden = array();
		$sortable = $this->get_sortable_columns();


		/**
		 * REQUIRED. Finally, we build an array to be used by the class for column
		 * headers. The $this->_column_headers property takes an array which contains
		 * 3 other arrays. One for all columns, one for hidden columns, and one
		 * for sortable columns.
		 */
		$this->_column_headers = array($columns, $hidden, $sortable);


		/**
		 * Optional. You can handle your bulk actions however you see fit. In this
		 * case, we'll handle them within our package just to keep things clean.
		 */
		$this->process_bulk_action();


		/**
		 * Instead of querying a database, we're going to fetch the example data
		 * property we created for use in this plugin. This makes this example
		 * package slightly different than one you might build on your own. In
		 * this example, we'll be using array manipulation to sort and paginate
		 * our data. In a real-world implementation, you will probably want to
		 * use sort and pagination data to build a custom query instead, as you'll
		 * be able to use your precisely-queried data immediately.
		 */
		
		$data = CSS3KFA_animation::get_animations(NULL, false);
		/**
		 * This checks for sorting input and sorts the data in our array accordingly.
		 *
		 * In a real-world situation involving a database, you would probably want
		 * to handle sorting by passing the 'orderby' and 'order' values directly
		 * to a custom query. The returned data will be pre-sorted, and this array
		 * sorting technique would be unnecessary.
		 */
		function usort_reorder($a,$b){
			$orderby = (!empty($_REQUEST['orderby'])) ? $_REQUEST['orderby'] : 'name'; //If no sort, default to title
			$order = (!empty($_REQUEST['order'])) ? $_REQUEST['order'] : 'asc'; //If no order, default to asc
			$result = strcmp($a[$orderby], $b[$orderby]); //Determine sort order
			return ($order==='asc') ? $result : -$result; //Send final sort direction to usort
		}
		usort($data, 'usort_reorder');
			




		/**
		 * REQUIRED for pagination. Let's figure out what page the user is currently
		 * looking at. We'll need this later, so you should always include it in
		 * your own package classes.
		 */
		$current_page = $this->get_pagenum();

		/**
		 * REQUIRED for pagination. Let's check how many items are in our data array.
		 * In real-world use, this would be the total number of items in your database,
		 * without filtering. We'll need this later, so you should always include it
		 * in your own package classes.
		 */
		$total_items = count($data);


		/**
		 * The WP_List_Table class does not handle pagination for us, so we need
		 * to ensure that the data is trimmed to only the current page. We can use
		 * array_slice() to
		 */

		$data = array_slice($data,(($current_page-1)*$per_page),$per_page);



		/**
		 * REQUIRED. Now we can add our *sorted* data to the items property, where
		 * it can be used by the rest of the class.
		 */
		$this->items = $data;


		/**
		 * REQUIRED. We also have to register our pagination options & calculations.
		 */
		$this->set_pagination_args( array(
				'total_items' => $total_items,                  //WE have to calculate the total number of items
				'per_page'    => $per_page,                     //WE have to determine how many items to show on a page
				'total_pages' => ceil($total_items/$per_page)   //WE have to calculate the total number of pages
		) );
	}
}

function css3kfa_section_text() {
	echo '<p>Main description of this section here.</p>';
}
function css3kfa_setting_string() {
	$options = get_option('css3kfa_options');
	echo "<input id='css3kfa_text_string' name='css3kfa_options[text_string]' size='40' type='text' value='{$options['text_string']}' />";
}
function css3kfa_options_validate($plugin_options) {
	echo "validated!";
	wp_die();
	return $plugin_options;
}

function css3kfa_display_admin_page() {
	global $wpdb;
	//Create an instance of our package class...
	$listTable = new css3kfa_List_Table();
	//Fetch, prepare, sort, and filter our data...

	$action = null;
	if (isset($_REQUEST['action'])) {
		$action = $_REQUEST['action'];
	}
	if ($action == 'help') {
		css3kfa_display_help_page();
		return;
	}
/*	if ($action == 'update') {
		if (isset($_REQUEST['name']) && isset($_REQUEST['content'])) { //form resubmission issue
			$name = trim(sanitize_text_field($_REQUEST['name']));
			$id = (int) ($_REQUEST['id']);
			$content = $_REQUEST['content'];
			$animType = $_REQUEST['animType'];
			//cannot change content without changing css as well
			CSS3KFA_animation::update_post($id, $content, $animType, null, $name);
		}
	}
	*/

	$listTable->prepare_items();
		?>
    <div class="wrap">

        <div id="icon-users" class="icon32"><br/></div>
        <h2>Style &amp; Animate</h2>
        <h3>All styled or animated elements</h3>
     

        <!-- Forms are NOT created automatically, so you need to wrap the table in one to use features like bulk actions -->
        <form id="css3kfa-list-table" method="get">
            <!-- For plugins, we also need to ensure that the form posts back to our current page -->
            <input type="hidden" name="page" value="<?php echo $_REQUEST['page'] ?>" />

            <!-- Now we can render the completed list table -->
            <?php $listTable->display() ?>
        </form>

        
    </div>
    <p>&nbsp;</p>

<?php css3kfa_helplink()?>

    <?php 

}