<?php

$commitFiles = array(
	'lol.txt' => true,
	'xd.txt' => true,
	'a/p.txt' => true,
	'dico/words.xml' => true,
	'dico/ext.xml' => true
);

$path = 'dico';
die(json_encode(preg_grep('/^' . str_replace('/', '\\/', preg_quote($path . '/')) . '/', array_keys($commitFiles))));

?>