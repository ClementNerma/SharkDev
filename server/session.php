<?php

session_start();

if(!isset($_SESSION['shark-user']))
	$_SESSION['shark-user'] = array('username' => false);

$IP = '';
if (getenv('HTTP_CLIENT_IP'))
    $IP = getenv('HTTP_CLIENT_IP');
else if(getenv('HTTP_X_FORWARDED_FOR'))
    $IP = getenv('HTTP_X_FORWARDED_FOR');
else if(getenv('HTTP_X_FORWARDED'))
    $IP = getenv('HTTP_X_FORWARDED');
else if(getenv('HTTP_FORWARDED_FOR'))
    $IP = getenv('HTTP_FORWARDED_FOR');
else if(getenv('HTTP_FORWARDED'))
   $IP = getenv('HTTP_FORWARDED');
else if(getenv('REMOTE_ADDR'))
    $IP = getenv('REMOTE_ADDR');
else
    $IP = 'UNKNOWN';

$IP = mysql_real_escape_string($IP);

?>