<?php

if (function_exists('plugin_dir_url')) {//Prevent directly browsing to the file
	define ('CSS3KFA_VERSION',        '1.0.0');
	define( 'CSS3KFA_PLUGIN_DIR', 	untrailingslashit( dirname( __FILE__ ) ) );
	define('CSS3KFA_HELPURL', 'http://styleandanimate.com/');
	define('CSS3KFA_FAQURL', 'http://styleandanimate.com/faq');
	define('CSS3KFA_MANUALURL', 'http://styleandanimate.com/manual');
	define('CSS3KFA_FORUMURL', 'https://wordpress.org/support/plugin/style-animate');
}

else {
	error_reporting(0);
	$port = (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] != "off") ? "https://" : "http://";
	$url = $port . $_SERVER["HTTP_HOST"];
	header("HTTP/1.1 404 Not Found", true, 404);
	header("Status: 404 Not Found");
	exit();
}