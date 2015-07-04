<?php

chdir(__DIR__ . '/../framework');
require 'user/config.php';

$base = $_SERVER['PHP_SELF'];
$base = substr($base, 0, strlen($base) - strlen('/install/form-submit.php')) . '/';

$config['BASE'] = $base;
$config['SITE_TITLE'] = $_POST['site-title'];
$config['DEFAULT_PAGE_TITLE'] = $_POST['site-page-title'];

$config['DB_HOST'] = $_POST['db-host'];
$config['DB_DATABASE'] = $_POST['db-database'];
$config['DB_USER'] = $_POST['db-user'];
$config['DB_PASSWORD'] = $_POST['db-password'];
$config['DB_CHARSET'] = $_POST['db-charset'];

$f = '<?php' . "\n\n" . '$config = array(';

foreach($config as $name => $value) {
	$f .= "\n    \"" . $name . '" => ' . (is_string($value) ? '"' . $value . '"' : $value) . ',';
}

$f = substr($f, 0, strlen($f) - 1) . "\n);";

try {
	file_put_contents('user/config.php', $f);
	header('Location: db-setup.php');
}

catch(Exception $e) {}

?>
