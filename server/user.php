<?php

set_error_handler(function($no, $msg, $file, $line, $context) {
    if($no == 8192)
        return;

    die($msg);
});

function get_string_between($string, $start, $end){
    $string = " ".$string;
    $ini = strpos($string,$start);
    if ($ini == 0) return "";
    $ini += strlen($start);
    $len = strpos($string,$end,$ini) - $ini;
    return substr($string,$ini,$len);
}

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

function read_directory($path, $recursively, $linear = false, $root = null) {

    if(!$root)
        $root = $path;

    $c = array();

    $o = scandir($path);

    foreach($o as $k => $v) {
        if($v !== '.' && $v !== '..') {
            $p = $linear ? substr($path, strlen($root) + 1) . '/' . $v : $v;

            if(is_dir($path . '/' . $v)) {
                if(!$linear) {
                    if(!$recursively)
                        $c[$p ] = 2;
                    else
                        $c[$p] = read_directory($path . '/' . $v, true, false, $root);
                } else
                    $c = array_merge_recursive($c, read_directory($path . '/' . $v, true, true, $root));
            } else {
                $c[$p] = 1;
            }
        }
    }

    return $c;

}

abstract class User {

    private static $_files = false;

    public static function setCommitFiles($files) {
        self::$_files = $files;
    }

    public static function existsFile($path) {
        if(self::$_files) return isset(self::$_files[$path]) ? 'true' : 'false';
        return (is_file($path) ? 'true' : 'false');

    }

    public static function existsDirectory($path) {

        if(self::$_files) return count(preg_grep('/^' . str_replace('/', '\\/', preg_quote($path . '/')) . '/', array_keys(self::$_files))) ? 'true' : 'false';
        return (is_dir($path) ? 'true' : 'false');
    }

    public static function readFile($path) {
        if(self::$_files) {
            if(isset(self::$_files[$path])) {
                return self::$_files[$path];
            } else {
                header("HTTP/1.0 404 Not Found");
                return ;
            }
        }

        if(is_file($path)) {
            return readfile($path);
        } else {
            header("HTTP/1.0 404 Not Found");
            return ;
        }

    }

    public static function writeFile($path, $content) {

        if(is_dir($path)) {
            return 'That\'s a directory';
        }

        try {
            file_put_contents($path, $content);
        }

        catch(Exception $e) {
            return 'Internal server error';
        }

        return 'true';

    }

    public static function makeDirectory($path) {
        if(self::$_files) return 'Can\'t write storage in commit mode';

        if(is_dir($path)) {
            return 'This directory already exists';
        }

        if(is_file($path))
            return 'That\'s a file';

        try {
            mkdir($path);
        }

        catch(Exception $e) {
            return 'Internal server error';
        }

        return 'true';

    }

    public static function removeDirectory($path) {
        if(self::$_files) return 'Can\'t write storage in commit mode';

        if(is_file($path))
            return 'That\'s a file';

        if(!is_dir($path))
            return 'Directory not found';

        try {
            deleteDir($path);
        }

        catch(Exception $e) {
            return 'Internal server error';
        }

        return 'true';

    }

    public static function removeFile($path) {
        if(self::$_files) return 'Can\'t write storage in commit mode';

        if(is_dir($path))
            return 'That\'s a directory';

        if(!is_file($path))
            return 'File not found';

        try {
            unlink($path);
        }

        catch(Exception $e) {
            return 'Internal server error';
        }

        return 'true';

    }

    public static function rename($path, $newName) {
        if(self::$_files) return 'Can\'t write storage in commit mode';

        $newName = normalizePath($newName);

        if(!file_exists($path)) {
            return 'File/directory not found';
        }

        if(file_exists($newName)) {
            return 'File/directory already exists';
        }

        try {
            rename($path, $newName);
        }

        catch(Exception $e) {
            return 'Internal server error';
        }

        return 'true';
    }

    public static function copyFile($from, $to) {
        if(self::$_files) return 'Can\'t write storage in commit mode';

        $to = normalizePath($to);

        if(is_dir($from))
            return 'Origin path is a directory';

        if(!is_file($from)) {
            return 'File not found';
        }

        if(is_dir($to))
            return 'Destination path is a directory';

        if(is_file($to)) {
            return 'Destination file already exists';
        }

        try {
            copy($from, $to);
        }

        catch(Exception $e) {
            return 'Internal server error';
        }

        return 'true';
    }

    public static function copyDirectory($from, $to) {
        if(self::$_files) return 'Can\'t write storage in commit mode';

        $to = normalizePath($to);

        if(is_file($from))
            return 'Origin path is a file';

        if(!is_dir($from)) {
            return 'File not found';
        }

        if(is_file($to))
            return 'Destination path is a file';

        if(is_dir($to)) {
            return 'Destination path already exists';
        }

        try {
            recurse_copy($from, $to);
        }

        catch(Exception $e) {
            return 'Internal server error';
        }

        return 'true';
    }

    public static function readDirectory($dir, $recursively) {

        if(is_file($dir))
            return 'That\'s a file';

        if(!is_dir($dir)) {
            header("HTTP/1.0 404 Not Found");
            return;
        }

        return json_encode(read_directory($dir, !strlen($recursively), false));

    }

    public static function getCommit($project, $ID, $minimified = false) {

        if(!is_dir($project))
            return 'Project not found';

        $ID = (int)$ID;
        $fID = (string)$ID;

        if($ID < 10)  $fID = '0' . $fID;
        if($ID < 100) $fID = '0' . $fID;

        $commitFile = $project . '/versionning/' . $fID . '.scm';

        if(!is_file($commitFile)) {
            return 'Commit not found';
        } else {
            $data = json_decode(file_get_contents($commitFile), true);

            if($minimified)
                unset($data['files']);

            return json_encode($data);
        }

    }

    public static function getMinimifiedCommit($project, $ID) {

        return self::getCommit($project, $ID, true);

    }

    public static function getFileSize($file) {

        if(!is_file($file)) {
            header("HTTP/1.0 404 Not Found");
            return;
        }

        return (string)filesize($file);

    }

    public static function getDirectorySize($dir, $blockSize = false) {

        if(!is_dir($dir)) {
            header("HTTP/1.0 404 Not Found");
            return;
        }

        function folderSize($path, $blockSize) {
            $size = 0;
            $o = scandir($path);
            foreach($o as $i => $f) {
                if($f !== '.' && $f !== '..') {
                    if(is_dir($path . '/' . $f))
                        $size += folderSize($path . '/' . $f, $blockSize);
                    else {
                        $s = filesize($path . '/' . $f);
                        if($blockSize) {
                            $s = $s + $blockSize * (1 - ($s / $blockSize - floor($s / $blockSize)));
                            $size += $s;
                        } else {
                            $size += $s;
                        }
                    }
                }
            }

            return $size;
        }

        return (string)folderSize($dir, $blockSize);

    }

    public static function getPreferences() {
        return json_encode(simplexml_load_file('preferences.xml'));
    }

    public static function getProjects() {
        $o = array('public' => array(), 'private' => array());

        $f = scandir('public');
        foreach($f as $k => $v)
            if($v !== '.' && $v !== '..')
                $o['public'][] = $v;

        $f = scandir('private');
        foreach($f as $k => $v)
            if($v !== '.' && $v !== '..')
                $o['private'][] = $v;

        return json_encode($o);

    }

    public static function getExtension($app) {
        if($app !== preg_replace('#^([^a-zA-Z0-9_\- ]+)$#', '', $app))
            return 'Invalid application name';

        $file = 'apps/' . $app . '.app';

        if(!file_exists($file) || !is_file($file))
            return 'Application not found';

        readfile($file);

    }

    public static function commit($path, $content) {

        if(self::$_files) return 'Can\'t write storage in commit mode';

        try {
            require_once(__DIR__ . '/versionning/directory.php');

            if(!is_dir($path) || !is_dir($path . '/versionning'))
                return 'Project not found or missing versionning directory !';

            $o = scandir($path . '/versionning');
            $c = array();

            foreach($o as $i => $v) {
                if(is_file($path . '/versionning/' . $v)) {
                    $c[] = json_decode(file_get_contents($path . '/versionning/' . $v), true);
                }
            }

            $projectDir = __DIR__ . '/users/' . $_SESSION['shark-user']['username'] . '/' . $path;
            $v = new VersionningDirectory($projectDir, array('versionning'), $c);
            $v->commit($content);

            $commitName = count($c) + 1;
            if($commitName < 10) $commitName = '0' . $commitName;
            if($commitName < 100) $commitName = '0' . $commitName;
            file_put_contents($projectDir . '/versionning/' . $commitName . '.scm', json_encode($v->getLastCommit()));
            return 'true';
        }

        catch(Exception $e) {
            return 'Internal server error';
        }

    }

    public static function download($location, $url) {
        if(self::$_files) return 'Can\'t write storage in commit mode';

        if(is_dir($location))
            return 'Destination is a directory';

        if(is_file($location))
            return 'File already exists';

        if(substr($url, 0, 7) !== 'http://' && substr($url, 0, 8) !== 'https://')
            return 'The download URL must start by http:// or https:// for security reasons';

        try {
            file_put_contents($location, fopen($url, 'r'));
            return 'true';
        }

        catch(Exception $e) {
            return 'An internal error was occured : ' . $e;
        }

    }

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

$up = __DIR__ . '/users/' . $_SESSION['shark-user']['username'] . '/';
chdir($up);

//commit:private/HelloWorld@1|

if(substr($path, 0, 7) === 'commit:') {
    // commit mode

    require_once(__DIR__ . '/versionning/directory.php');

    $to = strval(get_string_between($path, '@', '|'));
    $commitDir = get_string_between($path, ':', '@') . '/versionning/';
    $commits = array();

    for($i = 1; $i <= $to; $i++) {
        $fID = (string)$i;
        if($i < 10) $fID = '0' . $fID;
        if($i < 100) $fID = '0' . $fID;

        try {
            $commits[] = json_decode(file_get_contents($commitDir . $fID . '.scm'), true);
        }

        catch(Exception $e) {
            header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
        }
    }

    $path = substr($path, strpos($path, '|') + 1);

    $v = new VersionningDirectory(null, array('versionning'), $commits);
    $commitFiles = $v->apply(array(), $to);

    User::setCommitFiles($commitFiles);
    unset($commitFiles);
} else {
    // not in commit mode
}

if(method_exists('User', $do)) {
    die(forward_static_call_array(array('User', $do), array($path, $content)));
} else {
    die($shark['msg']['bad-request'] . ' action ' . $do . ' not found');
}

?>
