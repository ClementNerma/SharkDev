<?php

require_once(__DIR__ . '/config.php');
require_once(__DIR__ . '/session.php');

if(count($_POST) > 10)
	die($shark['msg']['too-large-request']);

if(!isset($_POST['username']) || !isset($_POST['password'])) {
	die($shark['msg']['bad-request']);
}

if(!is_string($_POST['username']) || !is_string($_POST['password'])) {
	die($shark['msg']['bad-request']);
}

try {
    $db = new PDO('mysql:host=' . $shark['db']['host'] . ';dbname=' . $shark['db']['db'] . ';charset=' . $shark['db']['encoding'], $shark['db']['user'], $shark['db']['pass']);
}

catch(Exception $e) {
    die($shark['msg']['database']);
}

$user = mysql_real_escape_string($_POST['username']);
$pass = mysql_real_escape_string($_POST['password']);

if(!$db->query('SELECT * FROM users WHERE name = "' . $user . '" AND password = "' . $pass . '"')->fetch()) {
	die('Invalid credentials');
} else {
	$_SESSION['shark-user'] = array(
		'username' => $user
	);

	die('sess_ok');
}

?>