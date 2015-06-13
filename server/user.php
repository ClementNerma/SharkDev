<?php

function deleteDir($dirPath) {
    if (! is_dir($dirPath)) {
        throw new InvalidArgumentException("$dirPath must be a directory");
    }
    if (substr($dirPath, strlen($dirPath) - 1, 1) != '/') {
        $dirPath .= '/';
    }
    $files = glob($dirPath . '*', GLOB_MARK);
    foreach ($files as $file) {
        if (is_dir($file)) {
            self::deleteDir($file);
        } else {
            unlink($file);
        }
    }
    rmdir($dirPath);
}

function recursive_read_dir($path) {

    $c = array();

    $o = scandir($path);

    foreach($o as $k => $v) {
        if($v !== '.' && $v !== '..') {
            if(is_dir($path . '/' . $v)) {
                $c[$v] = recursive_read_dir($path . '/' . $v);
            } else {
                $c[$v] = 1;
            }
        }
    }

    return $c;

}

chdir(__DIR__);

if(count($_POST) > 10)
    die($shark['msg']['too-large-request']);

if(isset($_SERVER['HTTP_ORIGIN']))
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN'] . "");

require_once('config.php');
require_once('session.php');
require_once('API.php');

if(!$_SESSION['shark-user']['username']) {
    die('Needs to be logged in !');
}

if(count($_POST) > 10)
    die($shark['msg']['too-large-request']);

extract($_POST);

if(!isset($do) || !isset($path) || !isset($content)) {
    die($shark['msg']['bad-request']);
}

if(!is_string($do) || !is_string($path) || !is_string($content)) {
    die($shark['msg']['bad-request']);
}

$path = normalizePath($path);

if($path === false) {
    die($shark['msg']['bad-path']);
}

try {
    $db = new PDO('mysql:host=' . $shark['db']['host'] . ';dbname=' . $shark['db']['db'] . ';charset=' . $shark['db']['encoding'], $shark['db']['user'], $shark['db']['pass']);
}

catch(Exception $e) {
    die($shark['msg']['database']);
}

$path = mysql_real_escape_string($path);
//$content = mysql_real_escape_string($content);

$up = 'users/' . $_SESSION['shark-user']['username'] . '/';
chdir($up);

switch($do) {
    case 'existsFile':
        die((is_file($path) ? 'true' : 'false'));

        break;

    case 'existsDirectory':
        die((is_dir($path) ? 'true' : 'false'));

        break;

    case 'readFile':
        if(is_file($path)) {
            die(readfile($path));
        } else {
            header("HTTP/1.0 404 Not Found");
            die();
        }

        break;

    case 'writeFile':
        try {
            file_put_contents($path, $content);
        }

        catch(Exception $e) {
            die('false');
        }

        die('true');

        break;

    case 'makeDirectory':
        try {
            mkdir($path);
        }

        catch(Exception $e) {
            die('false');
        }

        die('true');

        break;

    case 'removeDirectory':
        try {
            deleteDir($path);
        }

        catch(Exception $e) {
            die('false');
        }

        die('true');

        break;

    case 'removeFile':
        try {
            unlink($path);
        }

        catch(Exception $e) {
            die('false');
        }

        die('true');

        break;

    case 'get-preferences':
        die(json_encode(simplexml_load_file('preferences.xml')));
        break;

    case 'get-projects':
        $o = array('public' => array(), 'private' => array());

        $f = scandir('public');
        foreach($f as $k => $v)
            if($v !== '.' && $v !== '..')
                $o['public'][] = $v;

        $f = scandir('private');
        foreach($f as $k => $v)
            if($v !== '.' && $v !== '..')
                $o['private'][] = $v;

        die(json_encode($o));

        break;

    case 'get-project':
        if(!is_dir(($proj = "$path")))
            die('Project not found');

        die(json_encode(recursive_read_dir($proj)));

        break;

    case 'get-extension':
        if(!isset($_POST['app']))
            die('Missing application name');

        $app = $_POST['app'];

        if($app !== preg_replace('#^([^a-zA-Z0-9_\- ]+)$#', '', $app))
            die('Invalid application name');

        $file = 'apps/' . $app . '.app';

        if(!file_exists($file) || !is_file($file))
            die('Application not found');

        readfile($file);

        break;

    default:
        die($shark['msg']['bad-action']);
}

die($shark['msg']['no-output']);

?>
