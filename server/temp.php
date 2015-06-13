<?php

$xml = new DOMDocument();
$config = $xml->createElement('config');
$paramsModel = array(
	'versionning-keep-durey' => "",
	'versionning-maximal-size' => "",
	'versionning-maximal-commits' => "",
	'versionning-erase-olders' => "",
	'files-max-size' => "",
	'project-max-size' => "",
	'link' => "@sharkdev@:HelloWorld",
	'link-update' => "ask-user"
);

foreach($paramsModel as $param => $value) {
	$node = $xml->createElement('param');
	$node->setAttribute('name', $param);
	$node->setAttribute('value', $value);
	$config->appendChild($node);
}

$xml->appendChild($config);
$str = $xml->saveXML();

?>