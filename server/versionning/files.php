<?php

require_once(__DIR__ . '/versionning.php');

class VersionningFiles {

	private $_dateFormat;
	private $_deletedLineMarker;
	private $_files;
	private $_filesAtLastCommit = array();
	private $_commits = array();

	public function __construct($files = array(), $dateFormat = 'H:i:s d-m-Y', $deletedLineMarker = 0) {

		if(is_array($files))
			$this->_files = $files;

		$this->_dateFormat = $dateFormat;
		$this->_deletedLineMarker = $deletedLineMarker;
		$this->commit('Initial commit');

	}

	public function getCommits() {
		return $this->_commits;
	}

	public function setFiles($files) {

		if(!is_array($files)) return false;
		$this->_files = $files;
		return true;

	}

	public function getFiles() {

		return $this->_files;

	}

	public function writeFile($file, $value) {

		$this->_files[$file] = $value;

	}

	public function readFile($file) {

		return isset($this->_files[$file]) ? $this->_files[$file] : false;

	}

	public function removeFile($file) {

		unset($this->_files[$file]);

	}

	public function commit($message) {

		$commit = array();

		foreach($this->_files as $name => $content) {
			if(!isset($this->_filesAtLastCommit[$name]))
				$commit[$name] = Versionning::createCommit('', $content, $this->_deletedLineMarker)['differences'];
			else if($this->_filesAtLastCommit[$name] !== $content) {
				$commit[$name] = Versionning::createCommit($this->_filesAtLastCommit[$name], $content, $this->_deletedLineMarker)['differences'];
			}
		}

		foreach($this->_filesAtLastCommit as $name => $content) {
			if(!isset($this->_files[$name]))
				$commit[$name] = array(
					'type' => 'deleted'
				);
		}

		$this->_commits[] = array(
			'files' => $commit,
			'date' => date($this->_dateFormat),
			'message' => $message,
			'deletedLineMarker' => $this->_deletedLineMarker
		);

		$this->_filesAtLastCommit = $this->_files;

	}

	public function place($ID) {

		if(!isset($this->_commits[$ID]))
			return false;

		$files = array();

		for($v = 0; $v <= $ID; $v++) {
			foreach($this->_commits[$v]['files'] as $file => $commit) {
				if(isset($commit['type']) && $commit['type'] == 'deleted')
					unset($files[$file]);
				else
					$files[$file] = Versionning::apply((isset($files[$file]) ? $files[$file] : ''), $commit, $this->_commits[$v]['deletedLineMarker']);
			}
		}

		return $files;
	}

}

$f = new VersionningFiles();

$f->writeFile('welcome.txt', 'Hello world !');
$f->writeFile('lol.txt', 'LOL');
$f->commit('2 files : create welcome.txt and lol.txt');

$f->writeFile('lol.txt', 'xd');
$f->commit('Changed lol.txt');

$f->writeFile('welcome.txt', 'salut');
$f->removeFile('lol.txt');
$f->commit('writed welcome.txt and removed lol.txt');

?>