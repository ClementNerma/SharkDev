
var errors = [];

/*
 * Enable console backtrace
 * @type {boolean}
 */

var ENABLE_CONSOLE_BACKTRACE = false;

/**
 * [Automatic parameter] Has client console.log function
 * @type {boolean}
 */

var HAS_CLIENT_CONSOLE_LOG = isObject(console) && isFunction(console.log);

/**
 * Main board interface
 */

var Shark = function () {

    /**
     * Server URL - Change it in production mode - Must end by a slash (/)
     * @type {string}
     */

    this.SERVER_URL = 'server';

    /**
     * SharkDev console
     * @type {Shark.console}
     */

    this.console = new function () {

        /**
         * Define if client has a console which support the following functions : log, info, warn, error
         * @type {boolean}
         */

        var has_console = (typeof console !== 'undefined' && console.log && console.info && console.warn && console.error);

        /**
         * Get current backtrace
         * @param {number} n The omitted last entries. Use -1 to omit uniquely getStack function
         * @returns {string}
         */

        this.getStack = function (n) {

            var stack = (new Error())['stack'].replace(/^((.|\n)*?)at/, 'at').replace(new RegExp(escapeRegExp(window.location.href), 'g'), '').split("\n");

            stack.splice(0, -n + 1);

            return "\n" + stack.join("\n");

        };

        /**
         * Print an information in the console
         * @param {*} msg
         * @returns {boolean}
         */

        this.info = function (msg) {

            /*Shark.fs.publishStream('con_log_info', {
             message: msg,
             date: new Date().getTime()
             });*/

            if (has_console) {
                if (ENABLE_CONSOLE_BACKTRACE)
                    console.info(msg, this.getStack(-1));
                else
                    console.info(msg);
            }

            return true;

        };

        /**
         * Print a log message in the console
         * @param {*} msg
         */

        this.log = function (msg) {

            /*Shark.fs.publishStream('con_log_log', {
             message: msg,
             date: new Date().getTime()
             });*/

            if (has_console) {
                if (ENABLE_CONSOLE_BACKTRACE)
                    console.log(msg, this.getStack(-1));
                else
                    console.log(msg);
            }

        };

        /**
         * Print a warning message in the console
         * @param {*} msg
         */

        this.warn = function (msg) {

            /*Shark.fs.publishStream('con_log_warn', {
             message: msg,
             date: new Date().getTime()
             });*/

            if (has_console) {
                if (ENABLE_CONSOLE_BACKTRACE)
                    console.warn(msg, this.getStack(-1));
                else
                    console.warn(msg);
            }

        };

        /**
         * Print an error message in the console
         * @param {*} msg
         * @returns {boolean} Always returns false
         */

        this.error = function (msg) {

            /*Shark.fs.publishStream('con_log_error', {
             message: msg,
             date: new Date().getTime()
             });*/

            if (has_console) {
                if (ENABLE_CONSOLE_BACKTRACE)
                    console.error(msg, this.getStack(-1));
                else
                    console.error(msg);
            }

            return false;

        };

    };

    /**
     * Perform actions on storage
     * @type {Shark.fs}
     */

    this.fs = new function (USER, PASS) {

        var _USER = USER, _PASS = PASS;
        var _commitMode = isDefined(request.commit);

        this.serve = function(action, path, content, ignorePath) {

            if(_commitMode && !ignorePath) {
                path = 'commit:' + (projectDir || '/' + request.project + '/').substr(1, (projectDir || '/' + request.project + '/').length - 2) + '@' + (request.commit) + '|' + (path || '').substr((projectDir || '').length);
            }

            var req = server('user', {
                data: {
                    do: action,
                    path: path,
                    content: content
                },
                async: false
            });

            if(req.readyState === 4 && req.status === 200) {
                return req.responseText;
            } else {
                return undefined;
            }
        };

        this.serveI = function(action, path, content) {

            return this.serve(action, path, content, true);

        };

        this.existsDirectory = function (path) {

            var serve = this.serve('existsDirectory', this.normalizePath(path));
            if(serve !== 'true') { errors.push(serve); lastError = serve; }
            return serve === 'true';

        };

        this.makeDirectory = function (path) {

            if(_commitMode) { errors.push('You are in commit mode !'); lastError = 'You are in commit mode !'; return false; }
            var serve = this.serve('makeDirectory', this.normalizePath(path));
            if(serve !== 'true') { errors.push(serve); lastError = serve; }
            return serve === 'true';

        };

        this.readDirectory = function (path, recursively) {

            try {
                return JSON.parse(this.serve('readDirectory', this.normalizePath(path), (recursively ? 'recursively' : '')));
            }

            catch(e) {
                return false;
            }

        };

        this.size2str = function (size) {

            var gb = 0, mb = 0, kb = 0, b = 0;

            while(size > 1024) {
                while(size > 1024 * 1024) {
                    while(size > 1024 * 1024 * 1024) {
                        size -= 1024 * 1024 * 1024;
                        gb += 1;
                    }
                    size -= 1024 * 1024;
                    mb += 1;
                }
                size -= 1024;
                kb += 1;
            }

            b = size;

            if(gb)
                return (gb + mb / 1024).toString() + ' Gb';
            else if(mb)
                return (mb + kb / 1024).toString() + ' Mb';
            else if(kb)
                return (kb + b / 1024).toString() + ' Kb';
            else
                return b + ' bytes';

        }

        this.getDirectorySize = function (path) {

            var size = parseInt(this.serve('getDirectorySize', this.normalizePath(path)));
            return Number.isNaN(size) ? false : size;

        }

        this.removeDirectory = function (path) {

            if(_commitMode) { errors.push('You are in commit mode !'); lastError = 'You are in commit mode !'; return false; }
            var serve = this.serve('removeDirectory', this.normalizePath(path));
            if(serve !== 'true') { errors.push(serve); lastError = serve; }
            return serve === 'true';

        };

        this.move = this.rename = function (path, newPath) {

            if(_commitMode) { errors.push('You are in commit mode !'); lastError = 'You are in commit mode !'; return false; }

            var serve = this.serve('rename', this.normalizePath(path), this.normalizePath(newPath));
            if(serve !== 'true') { errors.push(serve); lastError = serve; }
            return serve === 'true';

        };

        this.copyFile = function (path, newPath) {

            if(_commitMode) { errors.push('You are in commit mode !'); lastError = 'You are in commit mode !'; return false; }

            var serve = this.serve('copyFile', this.normalizePath(path), this.normalizePath(newPath));
            if(serve !== 'true') { errors.push(serve); lastError = serve; }
            return serve === 'true';

        };

        this.copyDirectory = function (path, newPath) {

            if(_commitMode) { errors.push('You are in commit mode !'); lastError = 'You are in commit mode !'; return false; }

            var serve = this.serve('copyDirectory', this.normalizePath(path), this.normalizePath(newPath));
            if(serve !== 'true') { errors.push(serve); lastError = serve; }
            return serve === 'true';

        };

        this.existsFile = function (path) {

            var serve = this.serve('existsFile', this.normalizePath(path));
            if(serve !== 'true') { errors.push(serve); lastError = serve; }
            return serve === 'true';

        };

        this.writeFile = function (path, content) {

            if(_commitMode) { errors.push('You are in commit mode !'); lastError = 'You are in commit mode !'; return false; }
            var serve = this.serve('writeFile', this.normalizePath(path), content);
            return serve === 'true' ? true : false;

        };

        this.readFile = function (path) {

            var ans = this.serve('readFile', this.normalizePath(path));
            //console.log(ans);
            return ans;

        };

        this.removeFile = function (path) {

            if(_commitMode) { errors.push('You are in commit mode !'); lastError = 'You are in commit mode !'; return false; }
            var serve = this.serve('removeFile', this.normalizePath(path));
            if(serve !== 'true') { errors.push(serve); lastError = serve; }
            return serve === 'true';

        };

        this.getFileSize = function (path) {

            var size = parseInt(this.serve('getFileSize', this.normalizePath(path)));
            return Number.isNaN(size) ? false : size;

        }

        var _currentPath = '/';

        this.normalizePath = function (path, currentPath) {

            var startWithSlash = (path.substr(0, 1) === '/');

            if(!startWithSlash && path.indexOf(':') === -1)
                path = (currentPath || _currentPath) + ((currentPath || _currentPath).substr(-1) !== '/' ? '/' : '') + path;

            var parts = path.split('/');
            var safe = [];
            for(var i = 0; i < parts.length; i++) {
                if(parts[i] && parts[i] !== '.') {
                    if(parts[i] === '..')
                        safe.pop();
                    else
                        safe.push(parts[i]);
                }
            }

            path = safe.join('/');

            return (path.indexOf(':') === -1 ? '/' : '') + path;

        };

        this.chdir = function (path) {

            if(path) {
                path = this.normalizePath(path);

                if(!Shark.fs.existsDirectory(path))
                    return false;

                _currentPath = path;
                $('#terminal').terminal().set_prompt('[[b;#82CDB9;]' + _currentPath + '] [[b;white;]$] ');
            }

            return _currentPath;
        }

        this.existsDir = this.existsDirectory;
        this.mkdir = this.makeDirectory;
        this.readDir = this.readDirectory;
        this.rmdir = this.removeDirectory;

        this.write = this.writeFile;
        this.read = this.readFile;
        this.remove = this.removeFile;

        this.getFileExtension = function(fileName) {
            return fileName.indexOf('.') !== -1 ? fileName.substr(fileName.lastIndexOf('.') + 1) : false;
        };

        this.getFileDirectory = function(fileName) {
            var p = this.normalizePath(fileName).split('/');
            p.pop();
            return p.join('/');
        }

    };

    /**
     * Perform actions on extensions
     * @type {Shark.extensions}
     */

    this.extensions = new function (launchExtension) {

        var _launchExtension = (launchExtension || false);

        /**
         * Check if an application package is valid - It must be in JSON format !
         * @param {object} pkg
         * @param {boolean} [debug] Display errors in the console
         * @returns {boolean}
         */

        this.checkValidPackage = function (pkg, debug) {

            if (!isObject(pkg))
                return (!debug ? false : 'Must be an object');

            if (missingObjectProperty(pkg, ['name', 'author', 'version', 'icon', 'license', 'install', 'files']))
                return (!debug ? false : 'Missing field');

            if (!isString(pkg.name) || !isString(pkg.version) || !isString(pkg['license']) || !isObject(pkg.files) || !isObject(pkg['install']))
                return (!debug ? false : 'Invalid field type');

            if (!pkg.name.match(/^([a-zA-Z0-9_\- ]+)$/))
                return (!debug ? false : 'Invalid name');

            if (!pkg.version.match(/^([0-9\.]+)$/))
                return (!debug ? false : 'Invalid version');

            if (!pkg['license'].match(/^([a-zA-Z0-9 \-]+)$/))
                return (!debug ? false : 'Invalid license');

            var i, j;

            if(pkg.files['package'])
                return (!debug ? false : '"package" is a system-reserved file name');

            if(!pkg.files['app.js'])
                return (!debug ? false : 'Missing application launch file : app.js');

            for (i in pkg.files)
                if (pkg.files.hasOwnProperty(i))
                    if (!isString(pkg.files[i]))
                        return (!debug ? false : 'Invalid file "' + i + '" : must be a string');

            for (i in pkg['install'])
                if (pkg.files.hasOwnProperty(i))
                    if (i === 'associate') {
                        if (!isArray(pkg['install']['associate']))
                            return (!debug ? false : 'Invalid association : file types must be an array');
                        else
                            for (j = 0; j < pkg['install']['associate'].length; j++)
                                if (!isString(pkg['install']['associate'][j]))
                                    return (!debug ? false : 'Invalid association : file type must be a string');
                    }

            return !debug;

        };

        /**
         * Install an extension from it package
         * @param {object} pkg
         * @returns {boolean}
         */

        this.installPackage = function (pkg, createDesktopShortcut) {

            var checkError;
            if (checkError = this.checkValidPackage(pkg, true))
                return Shark.modals.error('Can\'t install application : ' + checkError);

            if (this.isInstalled(pkg.name))
                return Shark.modals.error('Extension "' + pkg.name + '" is already installed, cannot install it !');

            Shark.fs.makeDirectory('extensions/' + pkg.name);

            var i;

            for (i in pkg.files)
                if (pkg.files.hasOwnProperty(i))
                    Shark.fs.writeFile('extensions/' + pkg.name + '/' + i, pkg.files[i]);

            delete pkg.files;

            Shark.fs.writeFile('extensions/' + pkg.name + '/package', JSON.stringify(pkg));

            return Shark.modals.info('Successfully installed extension : "' + pkg.name + '"');

        };

        /**
         * Remove an extension
         * @param {string} name
         * @returns {boolean}
         */

        this.remove = function (name) {

            if (!this.isInstalled(name))
                return Shark.console.error('Cannot remove a non-installed extension : "' + name + '"');

            Shark.fs.removeDirectory('/extensions/' + name);

            return Shark.console.info('Extension successfully removed : "' + name + '"')

        };

        /**
         * Check if an extensions is installed
         * @param {string} name
         * @returns {boolean}
         */

        this.isInstalled = function (name) {
            return Shark.fs.existsDirectory('/extensions/' + name);
        };

        /**
         * Launch an extension
         * @param {string} name
         * @param {object} [args]
         * @returns {boolean}
         */

        this.launch = function (name, args) {

            if (!isString(name))
                return Shark.console.error('[extensions:launch] Invalid extension name : must be a string');

            if (!this.isInstalled(name))
                return Shark.console.error('[extensions:launch] Extension not found : ' + name);

            if (!isObject(args)) args = {};

            var f = Shark.fs.readFile('/extensions/' + name + '/app.js');

            if(!f)
                return Shark.modals.error('Extension launcher', 'Extension not found : ' + name);

            return new Function(['args'], f)(args);

        };

        /**
         * Get an extension package
         * @param {string} name
         * @returns {boolean|object}
         */

        this.getPackage = function (name) {

            if (!this.isInstalled(name))
                return Shark.console.error('Cannot get extension package : Extension is not installed [' + name + ']');

            try {
                return JSON.parse(Shark.fs.readFile('/extensions/' + name + '/package'));
            }
            catch (e) {
                return false;
            }

        };

    };
    
    this.speedTest = function(callback) {

        var d = (new Date()).getTime();
        
        callback();
        
        var f = (new Date()).getTime() - d;

        console.info('Speed test performed : durey of ' + f + ' ms');

        return f;

    };

    this.autocompleteCommand = function(command) {

        var cmds = [];

        for(var i in _commands) {
            if(_commands.hasOwnProperty(i))
                cmds.push(i);
        }

        for(var i in _alias) {
            if(_alias.hasOwnProperty(i))
                cmds.push(i);
        }

        return cmds;

    };

    var _vcsCommit;
    var _alias = {};
    var _commandsCache = {};
    var _commands = {

        cache: function() {

            if(!this.all[0]) {
                return this.echo('Commands cache is ' + (config.studio['cache-commands'] ? 'enabled' : 'disabled'));
            }

            switch(this.all[0]) {

                case 'enable':
                    if(!config.studio['cache-commands']) {
                        config.studio['cache-commands'] = true;
                        this.echo('Commands cache has been enabled');
                    } else {
                        this.error('Commands cache is already enabled');
                    }

                    break;

                case 'disable':
                    if(config.studio['cache-commands']) {
                        config.studio['cache-commands'] = false;
                        this.echo('Commands cache has been disabled');
                    } else {
                        this.error('Commands cache is already disabled');
                    }

                    break;

                case 'content':

                    this.echo('Commands cache :');

                    if(!objSize(_commandsCache)) {
                        return this.echo('    Commands cache is empty\nTotal : 0 items, 0 bytes');
                    }
                    
                    var m = 0, c = [], s = [], t = 0;;

                    for(var i in _commandsCache) {
                        if(_commandsCache.hasOwnProperty(i)) {
                            if(i.length > m) m = i.length;
                            c.push(i);
                            s.push(_commandsCache[i].length);
                            t += s[s.length - 1];
                        }
                    }

                    for(var i = 0; i < c.length; i++) {
                        this.echo('    ' + c[i] + ' '.repeat(m - c[i].length) + ' ' + s[i] + '');
                    }

                    this.echo('Total : ' + c.length + ' items, ' + t + ' bytes');

                    break;

                case 'size':
                    var l = 0, s = 0;

                    for(var i in _commandsCache) {
                        if(_commandsCache.hasOwnProperty(i)) {
                            l += 1;
                            s += _commandsCache[i].length;
                        }
                    }

                    this.echo('Commands cache :\n    ' + l + ' items\n    ' + s + ' bytes');

                    break;

                case 'clear':
                    _commandsCache = {};
                    this.echo('Commands cache cleared');
                    break;

                default:
                    this.error('Unknown action : ' + this.all[0]);
                    break;

            }

        },

        echo: function() {
            this.echo(this.all.join(' ').replace(/\[\[(.*?)\](.*?)\]/g, '$2'));
        },

        clear: function() {
            this.clear();

            if(this.argument('t', 'text'))
                this.echo(this.argument('t', 'text').replace(/\[\[(.*?)\](.*?)\]/g, '$2'));

            if(this.argument('n', 'new-line'))
                this.echo('');
        },

        chdir: function() {
            if(this.all[0]) {
                if(!Shark.fs.chdir(this.all[0]))
                    this.error('Can\'t change directory : Directory not found');
            } else {
                this.echo(Shark.fs.chdir().replace(/\[\[(.*?)\](.*?)\]/g, '$2'));
            }
        },

        mkdir: function() {

            for(var i = 0; i < this.all.length; i++) {
                if(!Shark.fs.mkdir(this.all[i])) {
                    this.error('Can\'t make "' + this.all[i] + '" : ' + lastError);
                }
            }
        },

        mv: function() {
            if(Shark.fs.existsFile(this.all[0]) || Shark.fs.existsDirectory(this.all[0])) {
                if(!Shark.fs.move(this.all[0], this.all[1]))
                    this.error(lastError);
            } else {
                this.error('File not found : ' + this.all[0]);
            }
        },

        cp: function() {
            this.echo('Copying...');
            if(Shark.fs['copy' + (this.argument('d', 'directory') ? 'Directory' : 'File')](this.all[0], this.all[1]))
                this.error('Copy failed : ' + lastError);
            else
                this.echo('Copy done !');
        },

        rm: function() {
            if(Shark.fs.existsDirectory(this.all[0])) {
                if(!this.argument('d', 'directory'))
                    return this.error('You must use -d option to delete directories');
                else {
                    if(!Shark.fs.removeDirectory(this.all[0]))
                        return this.error(lastError);
                }
            } else {
                if(!Shark.fs.existsFile(this.all[0])) {
                    return this.error('Cannot remove file or directory : path not found');
                } else {
                    if(!Shark.fs.removeFile(this.all[0])) {
                        return this.error(lastError);
                    }
                }
            }
        },

        touch: function() {
            if(Shark.fs.existsDirectory(this.all[0])) {
                return this.error('Cannot make a file because it\'s a directory');
            }

            if(Shark.fs.existsFile(this.all[0])) {
                if(this.argument('e', 'erase')) {
                    if(!Shark.fs.writeFile(this.all[0], ''))
                        this.error(lastError);
                } else {
                    this.error('File already exists : Please use -e to erase file');
                }
            } else {
                if(!Shark.fs.writeFile(this.all[0], ''))
                    this.error(lastError);
            }
        },

        write: function() {
            if(!Shark.fs[this.argument('a', 'append') ? 'appendFile' : 'writeFile'](this.all[0], this.all[1]))
                this.error(lastError);
        },

        read: function() {

            if(this.argument('d', 'directory')) {

                if(!this.all[0]) this.all[0] = '.';

                if(!Shark.fs.existsDirectory(this.all[0])) {
                    return this.error('Directory not found');
                }

                var d = Shark.fs.readDirectory(this.all[0], isDefined(this.argument('r', 'recursively')));

                if(!d) {
                    this.error(lastError);
                } else {
                    function recurse(obj, prefix, recursively) {
                        if(!prefix) prefix = '';

                        var r = [];
                        for(var i in obj) {
                            if(obj.hasOwnProperty(i))
                                if(isObject(obj[i])) {
                                    if(recursively) {
                                        r = r.concat(recurse(obj[i], prefix + i + '/', true));
                                    } else {
                                        r.push(prefix + i);
                                    }
                                } else
                                    r.push(prefix + i);
                        }

                        return r;
                    }

                    var r = recurse(d, '', this.argument('r', 'recursively'));

                    if(r.length)
                        this.echo(r.join('\n'));
                }
            } else {
                if(!Shark.fs.existsFile(this.all[0])) {
                    return this.error('File not found');
                }

                var r = Shark.fs.readFile(this.all[0]);

                if(!isDefined(r)) {
                    this.error(lastError);
                } else {
                    this.echo(r);
                }
            }
        },

        alias: function() {
            if(!this.all[0]) {
                for(var i in _alias)
                    if(_alias.hasOwnProperty(i))
                        this.echo('[[b;green;]' + i.replace(/\[\[(.*?)\](.*?)\]/g, '$2') + '] = [[;cyan;]' + _alias[i].replace(/\[\[(.*?)\](.*?)\]/g, '$2') + ']');

                return;
            }

            var pos = this.all[0].indexOf('=');

            if(pos === -1)
                return this.error('Missing alias value');

            var aliasName  = this.all[0].substr(0, pos);
            var aliasValue = this.all[0].substr(pos + 1);

            if(!aliasName)
                return this.error('Missing alias name');

            if(!aliasValue)
                return this.error('Missing alias value');

            _alias[aliasName] = aliasValue;

        },

        help: function() {
            for(var i in _commands) {
                if(_commands.hasOwnProperty(i)) {
                    this.echo(i.replace(/\[\[(.*?)\](.*?)\]/g, '$2'));
                }
            }

            if(this.argument('a', 'alias')) {
                this.echo('-- alias --');
                _commands.alias.call(this);

                return;
            }
        },

        user: function() {
            var r = Shark.fs.serve('getUserName');

            if(!r)
                this.error('Can\'t get user name (can\'t connect to server)');
            else
                this.echo(r.replace(/\[\[(.*?)\](.*?)\]/g, '$2'));
        },

        set_panel_refresh_freq: function() {
            var freq = parseInt(this.all[0]);

            if(Number.isNaN(freq))
                this.error('Frequency must be a number')
            else if(freq < 50)
                this.error('Frequency too lower (min 50 miliseconds)');
            else {
                clearInterval(window.panelRefresh);
                window.panelRefresh = setInterval(window.panelRefreshCallback, freq);
            }

        }

    };

    Object.freeze(_commands);

    this.run = function(command, term, onProgress) {

        onProgress = onProgress || function(){};

        command = command.trimLeft().replace(/( *)(&&|\|\|)( *)/g, '\n');
        command = command.replace(/\/\*(.*?)\*\//gm, '');

        if(!command)
            return;

        if(command.substr(0, 2) === '//')
            return;

        if(command.indexOf('\n') !== -1) {
            var cmds = command.split('\n');
            onProgress(0);

            for(var i = 0; i < cmds.length; i++) {
                this.run(cmds[i], term);
                onProgress(100 / cmds.length * (i + 1), cmds[i], cmds[i + 1]);
            }

            return;
        }

        var n, i = command.indexOf(' ');
        
        if(i === -1) {
            if(_alias[command])
                command = _alias[command];
        } else {
            n = command.substr(0, i);

            if(_alias[n]) {
                command = _alias[n] + command.substr(i);
            }
        }

        command = command.match(/(?:[^\s"]+|"[^"]*")+/g);
        var cmd = command[0];
        command.shift(0, 1);

        var i, c, short = {}, long = {}, all = [];

        for(i = 0; i < command.length; i++) {

            command[i] = command[i]
                .replace(/`(.*?)`/g, function(match, $1) {
                    var emulTerm = {
                        _text: '',
                        _error: '',
                        echo: function(text) { this._text += '\n' + text; if(this._text.substr(0, 1) == '\n') this._text = this._text.substr(1); },
                        error: function(error) { this._error += '\n' + error; if(this._error.substr(0, 1) == '\n') this._error = this._error.substr(1); },
                        clear: function() { this.text = ''; this.error = ''; }
                    };

                    Shark.run($1, emulTerm);

                    if(emulTerm._error) {
                        return '';
                    } else {
                        return emulTerm._text;
                    }
                });

            if(command[i].substr(0,1)==='"'&&command[i].substr(-1)==='"')
                command[i] = command[i].substr(1, command[i].length - 2);

            if (command[i].substr(0, 2) === '--') {
                c = command[i].substr(2);

                if(c.indexOf('=') !== -1)
                    long[c.substr(0, c.indexOf('='))] = c.substr(c.indexOf('=') + 1);
                else
                    long[c] = true;
            } else if (command[i].substr(0, 1) === '-') {
                c = command[i].substr(1);

                if(c.indexOf('=') !== -1)
                    short[c.substr(0, c.indexOf('='))] = c.substr(c.indexOf('=') + 1);
                else
                    short[c] = true;
            } else {
                all.push(command[i]);
            }
        }

        var match = /a-z_\-0-9/g;
        var w = cmd.match(/^([a-z_\-0-9]+)$/g);

        if(!w) {
            if(cmd.match(match)[0] !== cmd) {
                cmd = cmd.match(match)[0];

                term.error('You encountered a SharkDev bug ;( : ', {finalize: function($div) {
                    $div.children().last().append(
                        $.create('a', {href: '#', content: 'Wrong string length'}).click(wrongStringLength)
                    )
                }});
            } else {
                return term.error('Invalid command name : ' + cmd + ' (must be lowercase letters !)');
            }
        }

        term.long = long;
        term.short = short;
        term.all = all;
        term.argument = function(short, long) {
            return isDefined(this.short[short]) ? this.short[short] : this.long[long];
        };

        if(!_commands[cmd] && !_commandsCache[cmd]) {
            var c = Shark.fs.readFile('/env/' + cmd + '.js');

            if(!isDefined(c)) {
                c = Shark.fs.readFile(cmd + '.js');

                if(!isDefined(c)) {
                    term.error('Command not found : ' + cmd);
                } else {
                    return new Function(['out'], c).call(term, [term]);
                }
            } else {
                if(config.studio['cache-commands'])
                    _commandsCache[cmd] = c;
    
                return new Function(['out'], c).call(term, [term]);
            }
        } else {
            return _commands[cmd] ? _commands[cmd].call(term, []) : new Function(['out'], _commandsCache[cmd]).call(term, [term])
        }

    };

};

Shark = new Shark();

Object.freeze(Shark);

for (var i in Shark)
    if (Shark.hasOwnProperty(i) && typeof Shark[i] === 'object')
        Object.freeze(Shark[i]);

function wrongStringLength() {
    bootbox.dialog({
        title: 'Wrong string length - SharkDev bug',
        message: 'The <b>Wrong string length</b> bug make the length of a string invalid.<br />For example, "read".length is equals to 9 in this bug !<br />So it makes comparisons impossible...',
        buttons: {
            OK: {
                label: 'OK'
            }
        }
    });
}
