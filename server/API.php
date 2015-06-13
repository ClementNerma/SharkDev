<?php

function debug() {
	$d = debug_backtrace();

	foreach($d as $i => $v) {
		echo $v['function'] . ' called at line ' . $v['line'] . ' in ' . $v['file'] . '<br />';
	}

	exit(0);
}

function recurse_copy($src,$dst) { 
    $dir = opendir($src); 
    @mkdir($dst); 
    while(false !== ( $file = readdir($dir)) ) { 
        if (( $file != '.' ) && ( $file != '..' )) { 
            if ( is_dir($src . '/' . $file) ) { 
                recurse_copy($src . '/' . $file,$dst . '/' . $file); 
            } 
            else { 
                copy($src . '/' . $file,$dst . '/' . $file); 
            } 
        } 
    } 
    closedir($dir); 
}

function normalizePath($path, $encoding="UTF-8") {
  
  // Attempt to avoid path encoding problems.
  $path = iconv($encoding, "$encoding//IGNORE//TRANSLIT", $path);

  // Process the components
  $parts = explode('/', $path);
  $safe = array();  
  foreach ($parts as $idx => $part) {
    if (empty($part) || ('.' == $part)) {
      continue;
    } elseif ('..' == $part) {
      array_pop($safe);
      continue;
    } else {
      $safe[] = $part;
    }
  }
  
  // Return the "clean" path
  $path = implode(DIRECTORY_SEPARATOR, $safe);
  return $path;
}

abstract class API {

	private static function allSecure($var) {
		return mysql_real_escape_string(htmlspecialchars($var));
	}

	public static function existsUser($name) {

		$name = API::allSecure($name);

		global $db;

		if($db->query('SELECT * FROM users WHERE name = "' . $name . '"')->fetch())
			return true;
		else
			return false;

	}

	public static function getProjects($name) {

		$name = API::allSecure($name);
		
		
		if(!API::existsUser($name))
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

		global $shark;
		global $db;

		$name = API::allSecure($name);
		$pass = API::allSecure($pass);
		$mail = API::allSecure($mail);

		if(!preg_match('#^([a-zA-Z0-9_\-]+)$#', $name))
			return 'Bad user name';

		if($db->query('SELECT * FROM users WHERE name = "' . $name . '" OR email = "' . $mail . '"')->fetch())
			return 'User already exists or email is already used';

		try {
			mkdir('users/' . $name);
			recurse_copy('users/.model', 'users/' . $name);
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

		$name = API::allSecure($name);

		if(!API::existsUser($name))
			return 'User doesn\'t exists';

		if(!$db->query('DELETE FROM users WHERE name = "' . $username . '"'))
			return $shark['msg']['API-error'];
		else
			return $shark['msg']['API-done'];
	}

	public static function createUserProject($user, $files, $confidentialityLevel = 'private') {

		global $shark;
		global $db;

		$user = API::allSecure($user);
		$confidentialityLevel = API::allSecure($confidentialityLevel);

		$user = normalizePath($user);

	}

	public static function createUserLinkedProject($toUser, $fromUser, $fromProject, $confidentialityLevel = 'private') {

		global $shark;
		global $db;

		$toUser = normalizePath($toUser);
		$fromUser = normalizePath($fromUser);

		if($confidentialityLevel !== 'public' && $confidentialityLevel !== 'private')
			return $shark['msg']['bad-request'];

		if(!API::existsUser($fromUser) && $fromUser !== '.model')
			return 'User doesn\'t exists';

		if(!is_dir('users/' . $fromUser . '/public/' . $fromProject))
			return 'Project not found';

		try {
			mkdir('users/' . $toUser . '/' . $confidentialityLevel . '/' . $fromProject);
			recurse_copy('users/' . $fromUser . '/public/' . $fromProject, 'users/' . $toUser . '/' . $confidentialityLevel . '/' . $fromProject);
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

				return API::getProjects($username);

				break;

			case 'create-user':
				if(!isset($username) || !isset($userpass) || !isset($useremail))
					return $shark['msg']['bad-request'];

				return API::createUser($username, $userpass, $useremail);

				break;

			case 'delete-user':
				if(!isset($username))
					return $shark['msg']['bad-request'];

				return API::deleteUser($username);

			case 'create-user-linked-project':
				if(!isset($username) || !isset($fromUser) || !isset($fromProject))
					return $shark['msg']['bad-request'];

				if(!isset($confidentialityLevel))
					$confidentialityLevel = 'private';

				return API::createUserLinkedProject($username, $fromUser, $fromProject, $confidentialityLevel);

				break;

			default:
				return $shark['msg']['bad-action'];
		}

		return $shark['msg']['no-output'];
	}

}

?>