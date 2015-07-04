<?php

abstract class Config {

	private static $_config = array();

	public static function get($name) {
		return self::$_config[$name];
	}

	public static function write($name, $value) {
		self::$_config[$name] = $value;
	}

}

require __DIR__ . '/user/config.php';

foreach($config as $name => $value) {
	Config::write($name, $value);
}