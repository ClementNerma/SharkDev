<?php

require_once(__DIR__ . '/config.php');
require_once(__DIR__ . '/session.php');
require_once(__DIR__ . '/database.php');

if(count($_POST) > 10)
	die($shark['msg']['too-large-request']);

if(!isset($_POST['username']) || !isset($_POST['password'])) {
	die($shark['msg']['bad-request']);
}

if(!is_string($_POST['username']) || !is_string($_POST['password'])) {
	die($shark['msg']['bad-request']);
}

$user = mysql_real_escape_string($_POST['username']);
$pass = mysql_real_escape_string($_POST['password']);

$q = $db->query('SELECT * FROM security WHERE IP = "' . $IP . '"')->fetch();

if($q) {
	$started = $q['login_attempts_started'];
	$attempts = (int)$q['login_attempts'];

	if(strtotime('now') - strtotime($started) > $shark['security']['login-attempts']['delay']) {
		// reset delay
		$db->query('DELETE FROM security WHERE IP = "' . $IP . '"');
		$q = false;
	} else if($attempts >= $shark['security']['login-attempts']['allow']) {
		die('Too many wrong credentials. Please wait (' . ($shark['security']['login-attempts']['delay'] - (strtotime('now') - strtotime($started))) . ' seconds remaining)');
	}
}

if(!$db->query('SELECT * FROM users WHERE name = "' . $user . '" AND password = "' . $pass . '"')->fetch()) {
	
	if($shark['security']['login-attempts']['enabled']) {
		if(!$q) {
			$db->query('INSERT INTO security (IP, login_attempts, login_attempts_started) VALUES ("' . $IP . '", 1, NOW())');
			$attempts = 1;
		} else {
			$db->query('UPDATE security SET login_attempts = ' . $attempts . ' + 1 WHERE IP = "' . $IP . '"');
			$attempts += 1;
		}
	}

	die('Invalid credentials (' . (string)$attempts . ' wrong, ' . ($shark['security']['login-attempts']['allow'] - $attempts) . ' attempts remaining)');
} else {
	if($q)
		$db->query('DELETE FROM security WHERE IP = "' . $IP . '"');

	$_SESSION['shark-user'] = array(
		'username' => $user
	);

	die('sess_ok');
}

?>