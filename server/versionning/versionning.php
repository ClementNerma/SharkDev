<?php

class Versionning {
	public static function createCommit($before, $after, $deletedLineMarker = 0, $message = '', $dateFormat = false) {

		$before = explode("\n", $before);
		$after = explode("\n", $after);

		$diff = array_diff_assoc($after, $before);

		if(count($before) > count($after)) {
			for($i = count($after); $i < count($before); $i++) {
				$diff[$i] = $deletedLineMarker;
			}
		}

		$commit = array(
			'differences' => $diff
		);

		if($dateFormat) {
			$commit['date'] = date($dateFormat);
		}

		if(is_string($message) && strlen($message)) {
			die(is_string($message) . ' ' . strlen($message));
			$commit['message'] = $message;
		}

		return $commit;

	}

	public static function apply($before, $commit, $deletedLineMarker = false) {
		if(!is_string($before) || !is_array($commit)) return false;

		$before = explode("\n", $before);

		if(isset($commit['differences']))
			$commit = $commit['differences'];

		if($deletedLineMarker === false)
			$deletedLineMarker = $commit['deletedLineMarker'];

		foreach($commit as $index => $value) {
			if($value !== $deletedLineMarker)
				$before[$index] = $value;
			else
				unset($before[$index]);
		}

		return implode("\n", $before);
	}

}

?>