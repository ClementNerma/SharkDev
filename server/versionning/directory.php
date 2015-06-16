<?php

require_once(__DIR__ . '/versionning.php');

class VersionningDirectory {

	private $_dateFormat;
	private $_deletedLineMarker;
	private $_dir;
	private $_ignore;
	private $_filesAtLastCommit = array();
	private $_commits = array();

	public function __construct($dir, $ignore = array(), $commits = array(), $dateFormat = 'H:i:s d-m-Y', $deletedLineMarker = 0) {

		$this->_dir = $dir;

		$this->_dateFormat = $dateFormat;
		$this->_deletedLineMarker = $deletedLineMarker;
		$this->_ignore = $ignore;

		if($commits) {
			$this->_commits = $commits;
			$this->_filesAtLastCommit = $this-> apply(array(), count($commits));
		} else {
			$this->commit('Initial commit');
		}

	}

	public function getCommits() {
		return $this->_commits;
	}

	public function getLastCommit() {
		return $this->_commits[count($this->_commits) - 1];
	}

	private function _loadLevel($dir, $root = null) {
		
		$dir .= '/';

		if($root === null)
			$root = $dir;

		$p = scandir($dir);
		$o = array();

		foreach($p as $i => $d) {
			if($d != '.' && $d != '..') {
				$t = false;
				if(!count(preg_grep('/^' . str_replace('/', '\\/', preg_quote($d)) . '/', $this->_ignore))) {
					if(is_dir($dir . '/' . $d)) {
						$o = array_merge_recursive($o, $this->_loadLevel($dir . $d, $root));
					} else {
						$o[] = substr($dir, strlen($root)) . $d;
					}
				} else {
					// this directory is on 'ignore' list
				}
			}
		}

		return $o;

	}

	public function commit($message, $t = false) {

		$files = $this->_loadLevel($this->_dir);

		$commit = array();

		foreach($files as $index => $name) {
			$content = file_get_contents($this->_dir . '/' . $name);

			if(!isset($this->_filesAtLastCommit[$name]))
				$commit[$name] = Versionning::createCommit('', $content, $this->_deletedLineMarker)['differences'];
			else {
				$commit[$name] = Versionning::createCommit($this->_filesAtLastCommit[$name], $content, $this->_deletedLineMarker)['differences'];
				
				if(!count($commit[$name]))
					unset($commit[$name]);
			}
		}

		foreach($this->_filesAtLastCommit as $name => $content) {
			if(array_search($name, $files) === false) {
				$commit[$name] = array(
					'type' => 'deleted'
				);
			}
		}

		$this->_commits[] = array(
			'files' => $commit,
			'date' => date($this->_dateFormat),
			'message' => $message,
			'deletedLineMarker' => $this->_deletedLineMarker
		);

		$this->_filesAtLastCommit = array();

		foreach($files as $index => $name) {
			$this->_filesAtLastCommit[$name] = file_get_contents($this->_dir . '/' . $name);
		}

		return $this->_commits[count($this->_commits) - 1];

	}

	public function apply($files, $to) {

		for($i = 0; $i < $to; $i++) {

			foreach($this->_commits[$i]['files'] as $file => $diff) {
				if(isset($diff['type']) && $diff['type'] === 'deleted')
					unset($files[$file]);
				else {
					$files[$file] = Versionning::apply(isset($files[$file]) ? $files[$file] : '', $diff, $this->_commits[$i]['deletedLineMarker']);
					
					if(!count($files[$file]))
						unset($files[$file]);
				}
			}

		}

		return $files;

	}

}

?>