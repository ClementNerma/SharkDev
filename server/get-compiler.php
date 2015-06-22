<?php

chdir(__DIR__);

require_once('config.php');
require_once('API.php');

if(!isset($_GET['name']) || empty($_GET['name'])) {
	die($shark['msg']['bad-request']);
}

$path = 'compilers/' . normalizePath($_GET['name']);

if(!is_dir($path)) {
	die($shark['msg']['not-found']);
}

$json = json_decode(file_get_contents($path . '/package.json'), true);

$json['compiler'] = file_get_contents($path . '/' . $json['package']['compiler']);

if(isset($json['runner']))
	$json['runner'] = file_get_contents($path . '/' . $json['package']['runner']);

$json['files'] = array();

foreach($json['package']['require'] as $i => $file) {
	$json['files'][$file] = file_get_contents($path . '/' . $file);
}

die(json_encode($json));

?>