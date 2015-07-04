<?php

abstract class Lib {

	public static function debug() {
		$d = debug_backtrace();

		foreach($d as $i => $v) {
			echo $v['function'] . ' called at line ' . $v['line'] . ' in ' . $v['file'] . '<br />';
		}

		exit(0);
	}

	public static function recurseCopy($src,$dst) { 
	    $dir = opendir($src); 
	    @mkdir($dst);
	    while(false !== ( $file = readdir($dir)) ) { 
	        if (( $file != '.' ) && ( $file != '..' )) { 
	            if ( is_dir($src . '/' . $file) ) { 
	                self::recurseCopy($src . '/' . $file,$dst . '/' . $file); 
	            } 
	            else { 
	                copy($src . '/' . $file,$dst . '/' . $file); 
	            } 
	        } 
	    } 
	    closedir($dir); 
	}

	public static function normalizePath($path, $encoding="UTF-8") {
  
	  // Attempt to avoid path encoding problems.
	  $path = iconv($encoding, "$encoding//IGNORE//TRANSLIT", $path);

	  // Process the components
	  $parts = explode('/', $path);
	  $safe = array();  
	  foreach ($parts as $idx => $part) {
	    if (empty($part) || ('.' == $part)) {
	      continue;
	    } elseif ('..' == $part) {
	      array_pop($safe);
	      continue;
	    } else {
	      $safe[] = $part;
	    }
	  }
	  
	  // Return the "clean" path
	  $path = implode(DIRECTORY_SEPARATOR, $safe);
	  return $path;
	}

	public static function getStringBetween($string, $start, $end){
	    $string = " ".$string;
	    $ini = strpos($string,$start);
	    if ($ini == 0) return "";
	    $ini += strlen($start);
	    $len = strpos($string,$end,$ini) - $ini;
	    return substr($string,$ini,$len);
	}

	public static function deleteDir($dirPath) {
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

	public static function readDirectory($path, $recursively, $linear = false, $root = null) {

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
	                        $c[$p] = 2;
	                    else
	                        $c[$p] = self::readDirectory($path . '/' . $v, true, false, $root);
	                } else
	                    $c = array_merge_recursive($c, self::readDirectory($path . '/' . $v, true, true, $root));
	            } else {
	                $c[$p] = 1;
	            }
	        }
	    }

	    return $c;

	}

}