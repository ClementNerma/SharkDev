<?php

chdir(__DIR__);

require_once('config.php');
require_once('session.php');
require_once('API.php');
require_once('database.php');

if(count($_POST) > 10)
	die($shark['msg']['too-large-request']);

foreach($_POST as $k => $v) {
	$_POST[$k] = mysql_real_escape_string($v);
}

extract($_POST);

if(!isset($key))
	die($shark['msg']['bad-request']);

if(!is_string($key))
	die($shark['msg']['bad-request']);

if(!$db->query('SELECT * FROM API where API_key = "' . $key . '"')->fetch())
	die($shark['msg']['bad-API-key']);

die(API::_request($_POST));

?>