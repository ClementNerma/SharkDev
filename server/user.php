<?php

abstract class UserAction {

    private static $_files = false;

    public static function setCommitFiles($files) {
        self::$_files = $files;
    }

    public static function getUserName() {
        return User::get('pseudo');
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
            Lib::deleteDir($path);
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

        $newName = Lib::normalizePath($newName);

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

        $to = Lib::normalizePath($to);

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

        $to = Lib::normalizePath($to);

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
            Lib::recurseCopy($from, $to);
        }

        catch(Exception $e) {
            return 'Internal server error';
        }

        return 'true';
    }

    public static function readDirectory($dir, $recursively, $called = false) {

        if(self::$_files) {
            if($dir) {
                $files = preg_grep('/^' . str_replace('/', '\\/', preg_quote($dir . '/')) . '/', array_keys(self::$_files));
            } else {
                $files = array_keys(self::$_files);
            }

            if(!count($files)) {
                header("HTTP/1.0 404 Not Found");
                return;
            }

            $f = array();
            $d = array();

            foreach($files as $i => $name) {
                $fname = substr($name, ($dir ? strlen($dir) + 1 : 0));

                if(strpos($fname, '/') === false) {
                    // that's a file
                    $f[$fname] = 1;
                } else {
                    // that's a directory
                    $dirName = substr($fname, 0, strpos($fname, '/'));

                    if($recursively) {
                        $d[$dirName] = self::readDirectory((strlen($dir) ? $dir . '/' : '') . $dirName, true, true);
                    } else {
                        $d[$dirName] = 2;
                    }
                }

            }

            $final = array_merge_recursive($f, $d);

            return $called ? $final : json_encode($final);

        }

        if(is_file($dir))
            return 'That\'s a file';

        if(!is_dir($dir)) {
            header("HTTP/1.0 404 Not Found");
            return;
        }

        return json_encode(Lib::readDirectory($dir, !!strlen($recursively), false));

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

        if(self::$_files) {

            if(!isset(self::$_files[$file])) {
                header("HTTP/1.0 404 Not Found");
                return;
            } else {
                return strlen(self::$_files[$file]);
            }

        }

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

            $projectDir = __DIR__ . '/users/' . User::get('pseudo') . '/' . $path;
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

    public static function logout() {

        $_SESSION['skyer-user'] = array('guest' => true);

        return 'true';

    }

    public static function changePreferences($path, $value) {

        $path = str_replace(';', '', $path);
        $xml = simplexml_load_file('preferences.xml');

        eval('$xml->' . preg_replace('#\->@attributes\->(.*)#', '["$1"] = $value', preg_replace('#\->([0-9]+)#', '[$1]', str_replace('/', '->', $path))) . ';');

        file_put_contents('preferences.xml', $xml->asXML());
        return 'true';

    }

    public static function getProjectConfig($project) {

        if(!is_dir($project) || !is_file($project . '/config.xml')) {
            header("HTTP/1.0 404 Not Found");
        }

        return json_encode(simplexml_load_file($project . '/config.xml'));

    }

    public static function getProjectInformations($project) {

        if(!is_dir($project) || !is_file($project . '/informations.xml')) {
            header("HTTP/1.0 404 Not Found");
        }

        return json_encode(simplexml_load_file($project . '/informations.xml'));

    }

}

chdir(__DIR__);

if(count($_POST) > 10)
    die($shark['msg']['too-large-request']);

if(isset($_SERVER['HTTP_ORIGIN']))
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN'] . "");

require '../framework/inc.php';
require_once('config.php');
require_once('API.php');

if(User::isGuest()) {
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

$path = Lib::normalizePath($path);

if($path === false) {
    die($shark['msg']['bad-path']);
}

//$path = normalizePath($path);

$up = __DIR__ . '/users/' . User::get('pseudo') . '/';
chdir($up);

//commit:private/HelloWorld@1|

if(substr($path, 0, 7) === 'commit:') {
    // commit mode

    require_once(__DIR__ . '/versionning/directory.php');

    $to = strval(Lib::getStringBetween($path, '@', '|'));
    $commitDir = Lib::getStringBetween($path, ':', '@') . '/versionning/';
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

    UserAction::setCommitFiles($commitFiles);
    unset($commitFiles);
} else {
    // not in commit mode
}

if(method_exists('UserAction', $do)) {
    die(forward_static_call_array(array('UserAction', $do), array($path, $content)));
} else {
    die($shark['msg']['bad-request'] . ' action ' . $do . ' not found');
}

?>
