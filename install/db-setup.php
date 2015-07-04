<?php

try {
	$allowGuest = $hideDefaultView = true;
	require '../framework/inc.php';
}

catch(Exception $e) {
	die('Invalid DataBase informations <a href="javascript:window.history.back();">Launch installation wizard</a>');
}

try {
	DataBase::query(file_get_contents('db-setup.sql'));
	echo 'Please remove the <strong>install</strong> folder.<br /><a href="..">Done !</a>';
	Page::setTitle('Installation Wizard');
	Page::send();
}

catch(Exception $e) {
	echo '<h1>DataBase Error</h1>' . $e->message;
}

?>