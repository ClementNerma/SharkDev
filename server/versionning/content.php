<?php

require_once(__DIR__ . '/versionning.php');

class VersionningContent {

	private $_deletedLineMarker;
	private $_content;
	private $_contentAtLastCommit = '';
	private $_dateFormat;
	private $_commits = array();

	public function __construct($initialContent = '', $dateFormat = 'H:i:s d-m-Y', $deletedLineMarker = 0) {
		$this->_dateFomat = $dateFormat;
		$this->_deletedLineMarker = $deletedLineMarker;

		$this->setContent($initialContent);
		$this->commit('Initial commit');

	}

	public function getCommits() {
		return $this->_commits;
	}

	public function setContent($content) {
		if(!is_string($content)) return false;
		$this->_content = $content;
		return true;
	}

	public function commit($message) {
		if(!is_string($message)) return false;

		$this->_commits[] = Versionning::createCommit($this->_contentAtLastCommit, $this->_content, $this->_deletedLineMarker, $message, $this->_dateFormat);
		$this->_contentAtLastCommit = $this->_content;

	}

	public function place($ID) {
		if(!isset($this->_commits[$ID])) return false;
		$content = '';

		for($v = 0; $v <= $ID; $v++) {
			$content = Versionning::apply($content, $this->_commits[$v]);
		}

		return $content;
	}

}

?>