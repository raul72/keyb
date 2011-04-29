/**
 * KeyB - Keyboard event handler
 *
 * Copyright (c) 2011 Raul Raat
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function(){

	var keyb = {},
		aliases = {},
		globalEvents = [],
		keyUpEvents = [],
		keyDownEvents = [],
		lists = [];

	keyb.down = [];

	function keyevent(keycode, up) {
		var key, events, i;

		if (!aliases[keycode]) {
			return;
		}
		key = aliases[keycode];

		// mark key as down
		keyb.down[key] = !up;

		// if action(s) attached to event, trigger them
		events = up ? keyUpEvents : keyDownEvents;
		if (!events[key]) {
			events[key] = [];
		}
		events = events[key];
		if (events.length) {
			for (i = 0; i < events.length; i++) {
				if (typeof events[i] === 'function') {
					events[i](key, !up);
				}
			}
		}
		// global events
		if (globalEvents.length) {
			for (i = 0; i < globalEvents.length; i++) {
				if (typeof globalEvents[i] === 'function') {
					globalEvents[i](key, !up);
				}
			}
		}
		// update lists lastkey
		if (!up && lists.length) {
			for (i = 0; i < lists.length; i++) {
				if (lists[i].keys.indexOf(key) !== -1) {
					lists[i].lastkey = key;
				}
			}
		}
	}

	function attachEvent(keys, event, fn) {
		if (typeof fn !== 'function') {
			return;
		}
		keys = keys.split(' ');
		var i = 0, key;
		while (key = keys[i++]) {
			if (!event[key]) {
				event[key] = [];
			}
			event[key][event[key].length] = fn;
		}
	}

	keyb.attachKeyDownEvent = function (keys, fn) {
		attachEvent(keys, keyDownEvents, fn);
	};
	keyb.attachKeyUpEvent = function (keys, fn) {
		attachEvent(keys, keyUpEvents, fn);
	};

	function deattachEvent(keys, event, fn) {
		keys = keys.split(' ');
		var i = 0, key;
		while (key = keys[i++]) {
			if (!event[key] || !event[key].length || typeof fn !== 'function') {
				return;
			}
			var found = false,
				new_list = [];
			for (i = 0; i < event[key].length; i++) {
				if (!found && fn === event[key][i]) {
					found = true;
					continue;
				}
				new_list[new_list.length] = event[key][i];
			}
			event[key] = new_list;
		}
	}

	keyb.deattachKeyDownEvent = function (keys, fn) {
		deattachEvent(keys, keyDownEvents, fn);
	};
	keyb.deattachKeyUpEvent = function (keys, fn) {
		deattachEvent(keys, keyUpEvents, fn);
	};

	// global events
	keyb.attachEvent = function (fn) {
		if (typeof fn !== 'function') {
			return;
		}
		globalEvents[globalEvents.length] = fn;
	};
	keyb.deattachEvent = function (fn) {
		if (!globalEvents.length || typeof fn !== 'function') {
			return;
		}
		var found = false,
			new_list = [],
			i;
		for (i = 0; i < globalEvents.length; i++) {
			if (!found && fn === globalEvents[i]) {
				found = true;
				continue;
			}
			new_list[new_list.length] = globalEvents[i];
		}
		globalEvents = new_list;
	};

	/**
	 * Create a new keys list
	 *
	 * @param name string List name
	 * @param keys array List of key aliases
	 * @return boolean
	 */
	keyb.createList = function(name, keys) {
		if (!name || typeof keys !== 'object' || !keys.length) {
			return false;
		}
		lists[lists.length] = {
			name: name,
			keys: keys,
			lastkey: false
		};
		return true;
	};

	/**
	 * Get a key that is down in the list
	 * preferred is the last key that was pressed, if that key is no longer down,
	 * first key alias from the list is returned that is currently down
	 *
	 * @param name string List name
	 * @return string|boolean key alias name if one of they keys from list is down, false if not
	 */
	keyb.getListKey = function(name) {
		var list = false,
			i;
		for (i = 0; i < lists.length; i++) {
			if (lists[i].name === name) {
				list = lists[i];
			}
		}
		if (!list) {
			return false;
		}
		if (list.lastkey && keyb.down[list.lastkey]) {
			return list.lastkey;
		}
		for (i = 0; i < list.keys.length; i++) {
			if (keyb.down[list.keys[i]]) {
				return list.keys[i];
			}
		}
		return false;
	};

	/**
	 * Remove a keys list
	 *
	 * @param name string List name
	 * @return boolean
	 */
	keyb.removeList = function(name) {
		if (!lists.length) {
			return false;
		}
		var i,
			new_lists = [];
		for (i = 0; i < lists.length; i++) {
			if (lists[i].name !== name) {
				new_lists[new_lists.length] = lists[i];
			}
		}
		lists = new_lists;
		return true;
	};

	function keyDownListener(event) {
		keyevent(event.which, false);
	}
	function keyUpListener(event) {
		keyevent(event.which, true);
	}

	// TODO: check if we have jQuery
	keyb.startListening = function () {
		jQuery(document).keydown(keyDownListener).keyup(keyUpListener);
	};
	keyb.stopListening = function () {
		// TODO: mark all keys as up?
		jQuery(document).unbind('keydown', keyDownListener).unbind('keyup', keyUpListener);
	};

	keyb.setAliases = function (input) {
		if (!input) {
			return;
		}
		aliases = input;
	};

	window.keyb = keyb;

})();
