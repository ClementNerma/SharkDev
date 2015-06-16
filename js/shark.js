
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

    this.SERVER_URL = 'http://localhost/SharkDev/serve/';

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

        this.serve = function(action, path, content) {

            if(_commitMode) {
                path = 'commit:' + projectDir.substr(1, projectDir.length - 2) + '@' + projectCommitID + '|' + path.substr(projectDir.length);
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
                if(request.commit) console.warn(req.responseText);
                window.top.a = req;
                return req.responseText;
            } else {
                return undefined;
            }
        }

        this.existsDirectory = function (path) {

            var serve = this.serve('existsDirectory', this.normalizePath(path));
            if(serve !== 'true') { errors.push(serve); lastError = serve; }
            return serve === 'true';

        };

        this.makeDirectory = function (path) {

            if(_commitMode) return console.error('You are in commit mode !');
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

        this.getDirectorySize = function (path) {

            var size = parseInt(this.serve('getDirectorySize', this.normalizePath(path)));
            return Number.isNaN(size) ? false : size;

        }

        this.removeDirectory = function (path) {

            if(_commitMode) return console.error('You are in commit mode !');
            var serve = this.serve('removeDirectory', this.normalizePath(path));
            if(serve !== 'true') { errors.push(serve); lastError = serve; }
            return serve === 'true';

        };

        this.move = this.rename = function (path, newPath) {

            if(_commitMode) return console.error('You are in commit mode !');

            var serve = this.serve('rename', this.normalizePath(path), this.normalizePath(newPath));
            if(serve !== 'true') { errors.push(serve); lastError = serve; }
            return serve === 'true';

        };

        this.existsFile = function (path) {

            var serve = this.serve('existsFile', this.normalizePath(path));
            if(serve !== 'true') { errors.push(serve); lastError = serve; }
            return serve === 'true';

        };

        this.writeFile = function (path, content) {

            if(_commitMode) return console.error('You are in commit mode !');
            var serve = this.serve('writeFile', this.normalizePath(path), content);
            return serve === 'true' ? true : false;

        };

        this.readFile = function (path) {

            var ans = this.serve('readFile', this.normalizePath(path));
            //console.log(ans);
            return ans;

        };

        this.removeFile = function (path) {

            if(_commitMode) return console.error('You are in commit mode !');
            var serve = this.serve('removeFile', this.normalizePath(path));
            if(serve !== 'true') { errors.push(serve); lastError = serve; }
            return serve === 'true';

        };

        this.getFileSize = function (path) {

            var size = parseInt(this.serve('getFileSize', this.normalizePath(path)));
            return Number.isNaN(size) ? false : size;

        }

        var _currentPath = '/';

        this.normalizePath = function (path) {

            var startWithSlash = (path.substr(0, 1) === '/');

            if(!startWithSlash)
                path = _currentPath + (_currentPath.substr(-1) !== '/' ? '/' : '') + path;

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

            return '/' + path;

        };

        this.chdir = function (path) {

            if(path) {
                path = this.normalizePath('/' + path);

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

    /**
     * Get the extension (after last dot) of a file
     * @param {string} fileName
     * @returns {string|boolean} Returns false if no 'dot' is found in the file name
     */

    this.fs.getFileExtension = function (fileName) {
        return fileName.indexOf('.') !== -1 ? fileName.substr(fileName.lastIndexOf('.') + 1) : false;
    };

    /**
     * Get the type of a file/directory
     * @param {string} path
     * @returns
     */

    this.fs.getType = function (path) {

        var rp = 'unknown';

        if (this.existsFile(path)) {
            // file
            var t;
            rp = (t = this.getFileExtension(path)) ? '.' + t : 'unknown';

            if (rp === '.lnk') {
                try {
                    rp = JSON.parse(this.readFile(path));
                }
                catch (e) {
                    return rp;
                }

                if (rp.type === 'extension') {
                    // shortcut to extension
                    return 'app:' + rp.path;
                } else {
                    // shortcut to a file/directory
                    return this.getType(rp.path);
                }
            }

        } else if (this.existsDirectory(path)) {
            // directory
            rp = 'directory';
        } else {
            // doesn't exists
            rp = 'unknown';
        }

        return rp;

    };

    /**
     * Get the icon of a file/directory type
     * @param {string} type
     * @returns {string} PNG-Base64 icon
     */

    this.fs.getTypeIcon = function (type) {
        if (!isString(type) && !isNumber(type)) type = 'unknown';
        return (Shark.registry.read('sys/fs/' + (type || 'unknown') + '/icon') || Shark.registry.read('sys/fs/unknown/icon'));
    };

    /**
     * Create an HTML shortcut for a file or a directory
     * @param {string} path
     * @returns {HTMLElement}
     */

    this.fs.createHTMLShortcut = function (path) {

        var type = this.getType(path);

        return $.create('div', {class: 'explorer-shortcut', 'explorer-shortcut': path}).append([
            $.create('img', {
                class: 'explorer-shortcut-thumb',
                src: 'data:image/png;base64,' + (type.substr(0, 4) !== 'app:' ? this.getTypeIcon(type) : (Shark.extensions.getPackage(type.substr(4)) || {}).icon)
            }),
            $.create('span', {
                class: 'explorer-shortcut-name',
                content: path.substr(path.lastIndexOf('/') + 1).replace(/\.lnk$/, '')
            })
        ]).click(function () {
            $(this).toggleClass('explorer-shortcut-selected');
        })['dblclick'](function () {
            Shark.console.info('shortcut clicked : ' + this.getAttribute('explorer-shortcut'));
            Shark.fs.open(this.getAttribute('explorer-shortcut'));
        })['contextmenu'](function (event) {
            $(this).toggleClass('explorer-shortcut-selected');
            Shark.fs.displayShortcutContextMenu(this, event);
            return false;
        });
    };

    /**
     * Display the context menu of an element shortcut
     * @param {HTMLElement} shortcut
     * @param {Event} event
     */

    this.fs.displayShortcutContextMenu = function (shortcut, event) {

        if (!shortcut || shortcut.nodeType !== Node.ELEMENT_NODE)
            return Shark.console.error('Cannot display context menu for shortcut : Invalid shortcut HTML elment');

        if (!event || !isDefined(event.clientX) || !isDefined(event.clientY))
            return Shark.console.error('Cannot display context menu for shortcut : Invalid event');

        // Clear the context menu to add new entries
        var context = $('#desktop .board-context-menu').html('');
        // Get file/directory type
        var type = this.getType(shortcut.lastChild.innerHTML);
        // Get context menu for this type
        var entries = (Shark.registry.read('sys/fs/' + type + '/context_menu') || '');

        var _entries, entry;

        for (entry in entries)
            if (entries.hasOwnProperty(entry))
                context.append(
                    $.create('div', {
                        class: 'board-context-entry'
                    })
                        .text(entry)
                        .click(new Function('$(this).parent().hide(); Shark.extensions.launch(' + JSON.stringify(entries[entry]) + ');'))
                );

        if (type !== 'directory') {
            // PATH is a file (because it's not a directory :-))
            _entries = Shark.registry.read('sys/fs/file/context_menu');
            for (entry in _entries)
                if (_entries.hasOwnProperty(entry))
                    context.append(
                        $.create('div', {
                            class: 'board-context-entry'
                        })
                            .text(entry)
                            .click(new Function('$(this).parent().hide(); Shark.extensions.launcher(' + JSON.stringify(_entries[entry]) + ');'))
                    );
        }

        context
            .css({
                top: event.clientY,
                left: event.clientX
            })
            .show();

        return true;

    };

    /**
     * Open a file or directory with the corresponding extension or function
     * @param {string} path
     * @returns {boolean}
     */

    this.fs.open = function (path) {

        if (!isString(path)) return Shark.console.error('Can\'t open file : Path must be a string');

        if (this.existsDirectory(path)) {
            /* Directory */
            var v = Shark.registry.read('sys/fs/directory/open');
            if (!isObject(v.args)) v.args = {};
            v.args.open = path;
            Shark.console.info('[fs:open] ' + path, v);
            return Shark.extensions.launcher(v);
        }

        if (!this.existsFile(path)) {
            /* Path doesn't exists */
            return Shark.console.error('Tried to open inexistant file : ' + path);
        }

        var ext = this.getFileExtension(path);

        if (!ext)
            return Shark.console.error('Can\'t open file without extension : ' + path);

        if (ext === 'lnk') {
            /* Shortcut */

            try {
                var link = JSON.parse(this.readFile(path));
            }

            catch (e) {
                return Shark.console.error('Can\'t open link file : ' + path + ' [' + new String(e) + ']');
            }

            if (missingObjectProperty(link, ['type', 'path']))
                return Shark.console.error('Can\'t open invalid link : ' + path + ' [Missing field]');

            if (link.type === 'extension') {
                if (!Shark.extensions.isInstalled((link.path.app || link.path)))
                    return Shark.console.error('Link point to a non-installed extension : ' + path + ' [' + link.path + ']');

                if (isObject(link.path)) {
                    var l = link.path;
                    if (!isObject(l.args)) l.args = {};
                    l.args.from = path;
                    return Shark.extensions.launcher(l);
                } else
                    return Shark.extensions.launch(link.path, {
                        from: path
                    });
            } else {
                return this.open(link.path);
            }

        } else {
            /* Non-shortcut file */

            var e = this.getFileExtension(path);
            var app = Shark.registry.read('sys/fs/' + (e ? '.' + e : 'unknwon') + '/open');
            app.open = path;
            return Shark.extensions.launcher(app);
        }

    };

    /**
     * SharkDev PATH normalizer and checker tool
     * @type {path}
     */

    this.path = new function () {

        /**
         * Normalize a path
         * @param {string} path
         * @returns {string|boolean}
         */

        this.normalize = function (path) {

            if (!isString(path)) return false;

            path = path.replace(/^(\/+)/g, '').replace(/(\/+)$/g, '').replace(/(\/+)/g, '/');
            path = path.replace(/(\r|\n|\r\n|"|')/g, '');
            path = '/' + path + '/';

            /* Normalize path */
            while (path.match(/(\/|^)\.(\/|$)/)) path = path.replace(/(\/|^)\.(\/|$)/g, '$1$2');

            path = path.replace(/(\/|^)(.+)\/(.+)\/..(\/|$)/g, '$2$4');

            while (path.match(/^\.\.\//))
                path = path.replace(/^\.\.\//g, '');

            return path.replace(/^\//g, '').replace(/\/$/g, '');

        };

        /**
         * Check if the parent path include the child path
         * @param {string} child Child path
         * @param {string} main Parent path
         * @returns {boolean}
         */

        this.include = function (child, main) {

            if (!isString(child) || !isString(main)) return false;
            child = this.normalize(child);
            main = this.normalize(main);

            return main === child.substr(0, main.length);

        };

    };

    this.speedTest = function(callback) {

        var d = (new Date()).getTime();
        
        callback();
        
        var f = (new Date()).getTime() - d;

        console.info('Speed test performed : durey of ' + f + ' ms');

        return f;

    };

    var _alias = {};

    var _commands = {

        echo: function() {
            this.echo(this.all.join(' '));
        },

        clear: function() {
            this.clear();

            if(this.argument('t', 'text'))
                this.echo(this.argument('t', 'text'));

            if(this.argument('n', 'new-line'))
                this.echo('');
        },

        editor: function() {

            if(!this.all[0])
                return this.error('Missing action');

            switch(this.all[0]) {

                case 'create':
                    if(this.argument('q', 'quiet')) {
                        Studio.createFile(Shark.fs.chdir(), this.all[1] || 'Untitled.txt', '');
                    } else {
                        Studio.createNewFile();
                    }
                    break;

                case 'open':
                    if(!this.all[1])
                        this.error('Missing file name');
                    else
                        Studio.openFile(this.all[1]);
                    break;

                case 'closeActive':
                    Studio.closeActiveFile(this.argument('f', 'force'));
                    break;

                case 'closeAll':
                    for(var i in files)
                        if(files.hasOwnProperty(i))
                            Studio.closeActiveFile(this.argument('f', 'force'));
                    break;

                default:
                    this.error('Unknown action : ' + this.all[0]);

            }

        },

        chdir: function() {
            if(this.all[0]) {
                if(Shark.fs.chdir(this.all[0]))
                    this.error('Can\'t change directory : Directory not found');
            } else {
                this.echo(Shark.fs.chdir());
            }
        },

        mkdir: function() {
            if(!Shark.fs.mkdir(this.all[0])) {
                this.error(lastError);
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
                if(Shark.fs.existsDirectory(this.all[0])) {
                    return this.error('Directory not found');
                }

                var d = Shark.fs.readDirectory(this.all[0], this.argument('r', 'recursively'));

                if(!d) {
                    this.error(lastError);
                } else {
                    var r = [];

                    for(var i in d)
                        if(d.hasOwnProperty(i))
                            r.push(i);

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

        download: function() {

            if(!this.all[0])
                return this.error('Missing argument 1 : file location');

            if(!this.all[1])
                return this.error('Missing argument 2 : download URL');

            var ans = server('user', {
                data: {
                    do: 'download',
                    path: Shark.fs.normalizePath(this.all[0]),
                    content: this.all[1]
                },
                async: false
            });

            if(ans.status === 200) {
                if(ans.responseText === 'true')
                    this.echo('Download success');
                else
                    this.error('Download failed : ' + ans.responseText);
            } else {
                this.error('Failed to contact server (status code : ' + ans.status + ')');
            }

        },

        alias: function() {
            if(!this.all[0]) {
                for(var i in _alias)
                    if(_alias.hasOwnProperty(i))
                        this.echo('[[b;green;]' + i + '] = [[b;cyan;]' + _alias[i] + ']');

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
                    this.echo(i);
                }
            }
        }

    };

    this.run = function(command, term) {

        command = command.trimLeft().replace(/( *)(&&|\|\|)( *)/g, '\n');
        command = command.replace(/\/\*(.*?)\*\//gm, '');

        if(!command)
            return;

        if(command.substr(0, 2) === '//')
            return;

        if(command.indexOf('\n') !== -1) {
            var cmds = command.split('\n');

            for(var i = 0; i < cmds.length; i++) {
                this.run(cmds[i], term);
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

        var w = cmd.match(/^([a-z]+)$/g);

        if(!w) {
            if(cmd.match(/([a-z]+)/g)[0] !== cmd) {
                cmd = cmd.match(/([a-z]+)/g)[0];

                term.error('You encountered a SharkDev bug ;( : ', {finalize: function($div) {
                    $div.children().last().append(
                        $.create('a', {href: '#', content: 'Wrong string length'}).click(wrongStringLength)
                    )
                }});
            } else {
                return term.error('Invalid command name : ' + cmd + ' (must be lowercase letters !)');
            }
        }

        if(!_commands[cmd]) {
            term.error('Command not found : ' + cmd);
        } else {
            term.long = long;
            term.short = short;
            term.all = all;
            term.argument = function(short, long) {
                return isDefined(this.short[short]) ? this.short[short] : this.long[long];
            };

            _commands[cmd].call(term, []);
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
    })
}
