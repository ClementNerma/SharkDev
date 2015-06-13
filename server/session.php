<?php

session_start();

if(!isset($_SESSION['shark-user']))
	$_SESSION['shark-user'] = array('username' => false);

?>