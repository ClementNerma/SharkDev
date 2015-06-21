<?php

require_once('config.php');

try {
    $db = new PDO('mysql:host=' . $shark['db']['host'] . ';dbname=' . $shark['db']['db'] . ';charset=' . $shark['db']['encoding'], $shark['db']['user'], $shark['db']['pass']);
}

catch(Exception $e) {
    die($shark['msg']['database']);
}

?>