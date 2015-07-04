<?php

require_once '../framework/inc.php';

abstract class API {

	private static function allSecure($var) {
		return mysql_real_escape_string(htmlspecialchars($var));
	}

	public static function existsUser($name) {

		$name = self::allSecure($name);

		global $db;

		if($db->query('SELECT * FROM users WHERE name = "' . $name . '"')->fetch())
			return true;
		else
			return false;

	}

	public static function getProjects($name) {

		$name = self::allSecure($name);
		
		
		if(!self::existsUser($name))
			return 'User doesn\'t exists';

		chdir(__DIR__ . '/users/' . $name);

		$o = array('public' => array(), 'private' => array());

		foreach($o as $i => $n) {
			$l = scandir($n);
			foreach($l as $k => $d) {
				if(is_dir($d) && $d !== '.' && $d !== '..')
					$o[$n][] = $d;
			}
		}

		return json_encode($o);
	}

	public static function createUser($name, $pass, $mail) {

		chdir(__DIR__);

		global $shark;
		global $db;

		$name = self::allSecure($name);
		$pass = self::allSecure($pass);
		$mail = self::allSecure($mail);

		if(strlen($name) < 6)
			return 'Too short user name (min 6 characters)';

		if(strlen($name) > 30)
			return 'Too long user name (max 30 characters)';

		if(!preg_match('#^([a-zA-Z0-9_\-]+)$#', $name))
			return 'Bad user name (must be composed of letters, digits, underscore and dashes)';

		if($db->query('SELECT * FROM users WHERE name = "' . $name . '" OR email = "' . $mail . '"')->fetch())
			return 'User already exists or email is already used';

		try {
			mkdir('users/' . $name);
			Lib::recurseCopy('users/.model', 'users/' . $name);
		}

		catch(Exception $e) {
			return $shark['msg']['API-error'];
		}

		if($db->query('INSERT INTO users (name, password, email) VALUES ("' . $name . '", "' . $pass . '", "' . $mail . '")'))
			return $shark['msg']['API-done'];
		else
			return $shark['msg']['API-error'];
	}

	public static function deleteUser($name) {

		global $shark;
		global $db;

		$name = self::allSecure($name);

		if(!self::existsUser($name))
			return 'User doesn\'t exists';

		if(!$db->query('DELETE FROM users WHERE name = "' . $username . '"'))
			return $shark['msg']['API-error'];
		else
			return $shark['msg']['API-done'];
	}

	public static function createUserProject($user, $files, $confidentialityLevel = 'private') {

		chdir(__DIR__);

		global $shark;
		global $db;

		$user = self::allSecure($user);
		$confidentialityLevel = self::allSecure($confidentialityLevel);

		$user = Lib::normalizePath($user);

	}

	public static function createUserLinkedProject($toUser, $fromUser, $fromProject, $confidentialityLevel = 'private') {

		chdir(__DIR__);

		global $shark;
		global $db;

		$toUser = Lib::normalizePath($toUser);
		$fromUser = Lib::normalizePath($fromUser);

		if($confidentialityLevel !== 'public' && $confidentialityLevel !== 'private')
			return $shark['msg']['bad-request'];

		if(!self::existsUser($fromUser) && $fromUser !== '.model')
			return 'User doesn\'t exists';

		if(!is_dir('users/' . $fromUser . '/public/' . $fromProject))
			return 'Project not found';

		try {
			mkdir('users/' . $toUser . '/' . $confidentialityLevel . '/' . $fromProject);
			Lib::recurseCopy('users/' . $fromUser . '/public/' . $fromProject, 'users/' . $toUser . '/' . $confidentialityLevel . '/' . $fromProject);
		}

		catch(Exception $e) {
			return $shark['msg']['API-error'];
		}

		return $shark['msg']['API-done'];

	}

	public static function _request($request) {

		global $shark;
		global $db;

		if(count($request) > 10)
			return $shark['msg']['too-large-request'];

		foreach($request as $k => $v) {
			if(!is_string($v))
				return $shark['msg']['bad-request'];
		}

		extract($request);

		if(!isset($do) || !is_string($do)) {
			return $shark['msg']['bad-request'];
		}

		switch($do) {
			case 'get-projects':
				if(!isset($username))
					return $shark['msg']['bad-request'];

				return self::getProjects($username);

				break;

			case 'create-user':
				if(!isset($username) || !isset($userpass) || !isset($useremail))
					return $shark['msg']['bad-request'];

				return self::createUser($username, $userpass, $useremail);

				break;

			case 'delete-user':
				if(!isset($username))
					return $shark['msg']['bad-request'];

				return self::deleteUser($username);

			case 'create-user-linked-project':
				if(!isset($username) || !isset($fromUser) || !isset($fromProject))
					return $shark['msg']['bad-request'];

				if(!isset($confidentialityLevel))
					$confidentialityLevel = 'private';

				return self::createUserLinkedProject($username, $fromUser, $fromProject, $confidentialityLevel);

				break;

			default:
				return $shark['msg']['bad-action'];
		}

		return $shark['msg']['no-output'];
	}

}

?>