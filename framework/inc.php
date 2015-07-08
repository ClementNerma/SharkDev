<?php

set_error_handler(function($no, $msg, $file, $line, $context) {
    if($no == 8192)
        return;

    die($msg . ' at ' . $file . ' line ' . $line);
});

require __DIR__ . '/config.php';

if(!$config['BASE'] && !isset($install)) {
	header('Location: install/index.php');
	die();
}

require __DIR__ . '/page.php';

if(!isset($ignoreDataBase))
	require __DIR__ . '/database.php';

require __DIR__ . '/user.php';
require __DIR__ . '/mail.php';
require __DIR__ . '/date.php';
require __DIR__ . '/lib.php';

if(User::isLoggedIn() && isset($install)) {
	$_SESSION['skyer-user'] = array('guest' => true);
}

if(User::isGuest() && !isset($allowGuest)) {
	header('Location: login.php');
	die();
}