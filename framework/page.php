<?php

abstract class Page {

	private static $_css = array();
	private static $_js = array();
	private static $_pageTitle;
	private static $_body;

	public static function css($css, $head = false) {
		$path = Config::get('CSS_DIR') . '/' . $css . '.css';
		
		if(!$head)
			self::$_css[] = $path;
		else
			array_unshift(self::$_css, $path);
	}

	public static function js($js, $head = false) {
		$path = Config::get('JS_DIR') . '/' . $js . '.js';
		
		if(!$head)
			self::$_js[] = $path;
		else
			array_unshift(self::$_js, $path);
	}

	public static function setTitle($title) {
		self::$_pageTitle = $title;
	}

	public static function send($template = null) {
		$base = substr($_SERVER['PHP_SELF'], strlen(Config::get('BASE')));
		$base = str_repeat('../', count(split('/', $base)) - 1);
		if($base && substr($base, -1) !== '/') $base .= '/';

		self::$_body = ob_get_clean();
		if(!$template)
			$template = Config::get('SITE_TEMPLATE');
		require __DIR__ . '/templates/' . $template . '.php';
		exit();
	}

}

ob_start();

Page::setTitle(Config::get('DEFAULT_PAGE_TITLE'));
