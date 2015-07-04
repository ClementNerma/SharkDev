<?php

/**
 * DataBase manager
 */

abstract class DataBase {

	private static $db;

	public static function _connect() {

		if(!self::$db)
			self::$db = new PDO('mysql:host=' . Config::get('DB_HOST') . ';dbname=' . Config::get('DB_DATABASE') . ';charset=' . Config::get('DB_CHARSET'), Config::get('DB_USER'), Config::get('DB_PASSWORD'));

	}

	public static function query($query) {
		return self::$db->query($query);
	}

	public static function get($table, $fields = array(), $where = array(), $displayRequest = false) {
		$where = self::_finalWhere($where);
		$answer = self::$db->query('SELECT ' . (is_array($fields) && count($fields) ? join(', ', $fields) : '*') . ' FROM ' . $table . ' WHERE ' . $where);
	
		if(!$answer)
			return $answer;

		$data = array();

		while($d = $answer->fetch()) {
			$data[] = $d;
		}

		return $data;
	}

	public static function insert($table, $fields) {
		$fields = self::_finalFields($fields);	
		return self::$db->query('INSERT INTO ' . $table . ' (' . join(', ' , array_keys($fields)) . ') VALUES (' . join(', ', array_values($fields)) . ')');
	}

	public static function update($table, $fields, $where) {
		$q = array();

		foreach($fields as $field => $value) {
			$q[] = $field . ' = ' . self::_secure($value);
		}

		return self::$db->query('UPDATE ' . $table . ' SET ' . join(', ', $q) . ' WHERE ' . self::_finalWhere($where));
	}

	public static function _finalFields(Array $fields) {
		foreach($fields as $field => $value) {
			if(!is_array($value)) {
				$fields[$field] = self::_secure($value);
			} else
				$fields[$field] = $value[0];
		}

		return $fields;
	}

	public static function _finalWhere(Array $where) {
		$q = array();
		foreach($where as $field => $value) {
			$q[] = $field . ' = ' . self::_secure($value);
		}
		return join(' AND ', $q);
	}

	public static function _secure($str) {
		$str = Config::get('DB_SECURE') ? self::$db->quote($str) : $str;
		return preg_replace("#(\r\n|\r|\n)#", '\\n', $str);
	}

}

DataBase::_connect();
