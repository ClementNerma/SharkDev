<?php

session_start();

if(!isset($_SESSION['skyer-user']))
	$_SESSION['skyer-user'] = array('guest' => true);

abstract class User {

	public static function isGuest() {
		return $_SESSION['skyer-user']['guest'] === true;
	}

	public static function isLoggedIn() {
		return !self::isGuest();
	}

	public static function getID() {
		return self::isGuest() ? false : $_SESSION['skyer-user']['ID'];
	}

	public static function get($name) {
		return self::isGuest() ? false : $_SESSION['skyer-user'][$name];
	}

	public static function getFullName() {
		return self::isGuest() ? 'Guest' : self::get('fullname');
	}

	public static function getUserFromID($ID) {
		$user = DataBase::get('users', array(), array('ID' => $ID));

		if(count($user) && $user !== false)
			return $user[0];
		else
			return false;
	}

	public static function login($pseudo, $password) {
		$password = hash('sha384', $password);
		$user = DataBase::get('users', array(), array('pseudo' => $pseudo, 'password' => $password));

		if(!count($user) || $user === false)
			$user = DataBase::get('users', array(), array('email' => $pseudo, 'password' => $password));

		if(count($user) && $user !== false) {
			if(!$user[0]['activated']) return false;
			$_SESSION['skyer-user'] = $user[0];	
			$_SESSION['skyer-user']['guest'] = false;
			return true;
		} else
			return false;
	}

}