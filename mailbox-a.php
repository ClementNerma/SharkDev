<?php

require 'framework/inc.php';

if(!isset($_GET['request'])) {
	die('<h3>Bad request</h3>');
}

$req = $_GET['request'];
$ans = DataBase::query('SELECT ID, fullname FROM users WHERE fullname LIKE ' . DataBase::_secure('%' . $req . '%'));
$f = array();

while($data = $ans->fetch()) {
	$f[] = $data;
}

die(json_encode($f));

?>