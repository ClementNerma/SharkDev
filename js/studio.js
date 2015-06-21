
var SERVER_URL = 'http://localhost/SharkDev/server';
var serverPages = {
    API: 'HTTP_API.php',
    user: 'user.php'
};

function server(page, params) {
    params.timeout = 5000;
    params.method = 'POST';
    params.url = SERVER_URL + '/' + serverPages[page];

    params.data.content = params.data.content || '';
    params.data.path = params.data.path || '';

    return $.ajax(params);
}

/* Initialize studio */

var projectDir, contextMenuPath, selectedNode, createNewFilePath, commitMessage, lastPanelDataTree;
var refreshPanelDurey, openingFile, selectedCommitID, _sayedCommitMode, _sayedSavedFile;
var userSettingsEditing;

var ace_themes = ['ambiance', 'chaos', 'chrome', 'clouds', 'clouds_midnight', 'cobalt', 'crimson_editor', 'dawn', 'dreamweaver', 'eclipse', 'github', 'idle_fingers', 'iplastic', 'katzenmilch', 'kr_theme', 'kuroir', 'merbivore', 'merbivore_soft', 'mono_industrial', 'monokai', 'pastel_on_dark', 'solarized_dark', 'solarized_light', 'sqlserver', 'terminal', 'textmate', 'tomorrow', 'tomorrow_night_blue', 'tomorrow_night_bright', 'tomorrow_night_eighties', 'tomorrow_night', 'twilight', 'vibrant_ink', 'xcode'];
var ace_modes = ['abap', 'abc', 'actionscript', 'ada', 'apache_conf', 'applescript', 'asciidoc', 'assembly_x86', 'autohotkey', 'batchfile', 'c9search', 'c_cpp', 'cirru', 'clojure', 'cobol', 'coffee', 'coldfusion', 'csharp', 'css', 'curly', 'dart', 'diff', 'django', 'd', 'dockerfile', 'dot', 'eiffel', 'ejs', 'elixir', 'elm', 'erlang', 'forth', 'ftl', 'gcode', 'gherkin', 'gitignore', 'glsl', 'golang', 'groovy', 'haml', 'handlebars', 'haskell', 'haxe', 'html', 'html_ruby', 'ini', 'io', 'jack', 'jade', 'java', 'javascript', 'jsoniq', 'json', 'jsp', 'jsx', 'julia', 'latex', 'lean', 'less', 'liquid', 'lisp', 'live_script', 'livescript', 'logiql', 'lsl', 'lua', 'luapage', 'lucene', 'makefile', 'markdown', 'mask', 'matlab', 'mel', 'mips_assembler', 'mipsassembler', 'mushcode', 'mysql', 'nix', 'objectivec', 'ocaml', 'pascal', 'perl', 'pgsql', 'php', 'plain_text', 'powershell', 'praat', 'prolog', 'properties', 'protobuf', 'python', 'rdoc', 'rhtml', 'r', 'ruby', 'rust', 'sass', 'scad', 'scala', 'scheme', 'scss', 'sh', 'sjs', 'smarty', 'snippets', 'soy_template', 'space', 'sql', 'sqlserver', 'stylus', 'svg', 'tcl', 'tex', 'textile', 'text', 'toml', 'twig', 'typescript', 'vala', 'vbscript', 'velocity', 'verilog', 'vhdl', 'xml', 'xquery', 'yaml'];

$('#settings').hide();
$('noscript').remove();
$('#projects').modal({keyboard:false}).modal('hide');
$('#terminal').terminal(function(command, term) {
    Shark.run(command, term);
},{
    greetings: ' ____    __                       __      ____                        ______                                                ___      \n/\\  _`\\ /\\ \\                     /\\ \\    /\\  _`\\                     /\\__  _\\                          __                  /\\_ \\     \n\\ \\,\\L\\_\\ \\ \\___      __     _ __\\ \\ \\/\'\\\\ \\ \\/\\ \\     __   __  __   \\/_/\\ \\/    __   _ __    ___ ___ /\\_\\    ___      __  \\//\\ \\    \n \\/_\\__ \\\\ \\  _ `\\  /\'__`\\  /\\`\'__\\ \\ , < \\ \\ \\ \\ \\  /\'__`\\/\\ \\/\\ \\     \\ \\ \\  /\'__`\\/\\`\'__\\/\' __` __`\\/\\ \\ /\' _ `\\  /\'__`\\  \\ \\ \\   \n   /\\ \\L\\ \\ \\ \\ \\ \\/\\ \\L\\.\\_\\ \\ \\/ \\ \\ \\\\`\\\\ \\ \\_\\ \\/\\  __/\\ \\ \\_/ |     \\ \\ \\/\\  __/\\ \\ \\/ /\\ \\/\\ \\/\\ \\ \\ \\/\\ \\/\\ \\/\\ \\L\\.\\_ \\_\\ \\_ \n   \\ `\\____\\ \\_\\ \\_\\ \\__/.\\_\\\\ \\_\\  \\ \\_\\ \\_\\ \\____/\\ \\____\\\\ \\___/       \\ \\_\\ \\____\\\\ \\_\\ \\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\__/.\\_\\/\\____\\\n    \\/_____/\\/_/\\/_/\\/__/\\/_/ \\/_/   \\/_/\\/_/\\/___/  \\/____/ \\/__/         \\/_/\\/____/ \\/_/  \\/_/\\/_/\\/_/\\/_/\\/_/\\/_/\\/__/\\/_/\\/____/\n                                                                                                                                     \n                                                                                                                                     ',
    prompt: '$ ',
    name: 'terminal',
    tabcompletion: true,
    completion: function(terminal, command, callback) {
        callback(Shark.autocompleteCommand());
    }
});
$('#terminal-container').slideToggle(0);
$('#commitViewer').hide();

var dconf = Shark.fs.serve('getPreferences');

try {
    dconf = JSON.parse(dconf);
}

catch(e) {
    bootbox.dialog({
        message: 'Can\'t connect to server - Can\'t get preferences<br /><br /><details><summary>Details</summary>Server said :<br /><br />' + dconf + '</details>',
        title: 'Server error',
        buttons: {
            OK: {
                label: 'OK',
                className: 'btn btn-default'
            }
        }
    });
    throw new Error('Can\'t get preferences');
}

var c, config = {
    fileTypes: {},
    editor: {
        native: {}
    },
    studio: {}
};

for(var i in dconf.files.type) {
    if(dconf.files.type.hasOwnProperty(i)) {
        c = cloneObject(dconf.files.type[i]['@attributes']);

        if(c['extension'].indexOf(',') === -1)
            config.fileTypes[c['extension']] = c;
        else {
            var n = c['extension'].split(',');
            for(var j = 0; j < n.length; j++) {
                config.fileTypes[n[j]] = c;
            }
        }

        delete c['extension'];
    }
}

function config_set(configObject, params) {
    if(params.length > 1) {
        for(var i in params) {
            if(params.hasOwnProperty(i)) {
                c = params[i]['@attributes'];
                if(c['value'] === 'true') c['value'] = true;
                if(c['value'] === 'false') c['value'] = false;
                configObject[c['name']] = c['value'];
            }
        }
    } else {
        c = params['@attributes'];
        configObject[c['name']] = c['value'];
    }

}

config_set(config.editor, dconf.editor.param);
config_set(config.editor.native, dconf.editor.native.param);
config_set(config.studio, dconf.studio.param);

var editor = ace.edit('editor');
editor.$blockScrolling = Infinity;
editor.setOptions(config.editor.native);

editor.getSession().setMode('ace/mode/' + config.editor['init_mode']);

editor.setTheme('ace/theme/' + config.editor.theme);
editor.setFontSize(parseInt(config.editor['font-size']) || 18);

if(config.editor.autocomplete) {
    ace.require('ace/ext/language_tools');
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
    });
    editor.commands.on("afterExec", function(e){
        if (e.command.name == "insertstring"&&/^[\w.]$/.test(e.args)) {
            editor.execCommand("startAutocomplete")
        }
    });
}

function getFullPath(ID) {
    var node = $('#' + ID);
    var path = node.find('a:first').text();

    while(node.parent().parent().attr('role') == 'treeitem') {
        node = node.parent().parent();
        path += '/' + node.find('a:first').text();
    }

    return path.split('/').reverse().join('/');
}

if(request.commit) {
    $('#projects').remove();

    $('#commitViewer').remove();
    $('#menu').remove();
    $('#editor, #tabs').css('left', '30%');
    $('#panel').css('width', '30%');

    $('#panel, #tabs').css('top', 0);
    $('#editor').css('top', 40);
}

if(request.project)
    projectDir = '/' + request.project + '/';

Shark.fs.chdir('/');

projectCommitID = request.commit;
var loadProject = (request.project && Shark.fs.existsDirectory('/' + request.project)) ? '/' + request.project : false;

if(!request.project || !loadProject) {
    if(!loadProject && isString(loadProject)) {
        bootbox.dialog({
            title: 'Bad request',
            message: '<h2>Bad request</h2>A project is specified in the URL (project parameter), but the specified project was not found',
            buttons: {
                OK: {
                    label: 'OK'
                }
            }
        });
    }

    server('user', {
        data: {
            do: 'getProjects'
        },
        success: function(data) {
            try {
                var projects = JSON.parse(data);
            }

            catch(e) {
                return this.error(this);
            }

            for(var i in projects) {
                for(var j in projects[i]) {
                    $('#projects .modal-body div[data="' + i + '"]').append($.create('a', {content:projects[i][j],class:'list-group-item',href:'#'}));
                }
            }

            $('#projects .modal-body fieldset a').click(function() {
                // open the project
                var type = $(this).parent().attr('data'); // equals to 'public' or 'private'
                var name = $(this).html(); // project name

                Studio.refreshPanel(type + '/' + name);
                Shark.fs.chdir(projectDir + 'files');

            });

            $('#projects').modal('show');
        },
        error: function(err) {
            $('#projects .modal-body').text('Can\'t connect to server ' + (err.status ? 'status code : ' + err.status + ')' : '')).addClass('text-danger');
            $('#projects').modal('show');
        }
    });
}

/* Studio class */

var edits = {};
var files = {};
var StudioCreateNewFileExtensions;

var Studio = function() {

    this.refreshPanel = function(dir) {

        refreshPanelDurey = 0;
        refreshPanelCounter = (new Date()).getTime();

        projectDir = Shark.fs.normalizePath('/' + dir) + '/';

        var data = Shark.fs.readDirectory(projectDir + 'files', true);

        if(!files) {
            bootbox.dialog({
                title: 'Server error',
                message: 'Can\'t connect to server',
                buttons: {
                    OK: {
                        label: 'OK',
                        className: 'btn btn-default'
                    }
                }
            });
        } else {
            function recurse(obj) {
                var r = {};

                for(var i in obj) {
                    if(obj.hasOwnProperty(i))
                        if (obj[i] != 1)
                            r[i] = obj[i];
                }

                for(var i in obj) {
                    if(obj.hasOwnProperty(i))
                        if (obj[i] == 1)
                            r[i] = obj[i];
                }

                var final = [];

                for(var i in r)
                    if(obj.hasOwnProperty(i)) {
                        if (obj[i] == 1) {
                            var ext = i.substr(i.lastIndexOf('.') + 1);
                            var icon = ((config.fileTypes[ext] || {}).icon || config.fileTypes['@default'].icon)

                            if(icon.substr(0, 3) === 'fa:')
                                icon = 'fa fa-' + icon.substr(3);

                            final.push({
                                text: i,
                                icon: icon
                            });
                        } else {
                            final.push({
                                text: i,
                                icon: 'fa fa-folder-o',
                                state: {
                                    opened: false,
                                    selected: false
                                },
                                children: recurse(obj[i])
                            });
                        }
                    }

                return final;
            }

            var plugins = ['contextmenu'];
            if(config.studio.panelWholerow)
                plugins.push('wholerow');

            var genericRenameAction = function() {
                bootbox.prompt('New directory name ?', function(name) {
                    if(!Shark.fs.rename(contextMenuPath, name)) {
                        bootbox.alert('Can\'t rename directory !');
                    } else {
                        var link = selectedNode.find('a')[0];
                        link.innerHTML = link.innerHTML.substr(0, link.innerHTML.length - $(link).text().length) + name;
                    }
                });
            };

            data = recurse(data);

            function r(o, c) {
                if(!isDefined(c))
                    return false;

                for(var i in o) {
                    if(o.hasOwnProperty(i)) {
                        if(!isDefined(c[i]) && isDefined(o[i]))
                            return false;
                        else if((isString(o[i]) || isNumber(o[i])) && o[i] != c[i])
                            return false;
                        else if(isObject(o[i]))
                            if(!r(o[i], c[i]))
                                return false;
                    }
                }

                for(var i in c) {
                    if(c.hasOwnProperty(i)) {
                        if(!isDefined(o[i]))
                            return false;
                    }
                }

                return true;
            }

            if(r(data, lastPanelDataTree))
                return;

            lastPanelDataTree = data;

            $('#panel').replaceWith($.create('div', {id: 'panel', style: $('#panel').attr('style')}).jstree({
                core: {
                    data: data,
                    check_callback: true
                },
                plugins: plugins,
                contextmenu: {
                    items: function($node) {
                        selectedNode = $('#' + $node.id);
                        var path = projectDir + getFullPath($node.id);
                        contextMenuPath = path;

                        if(Shark.fs.existsDirectory(path)) {
                            // that's a directory

                            return {
                                New: {
                                    label: 'New',
                                    submenu: {
                                        HTML: {
                                            label: 'HTML',
                                            action: function() {
                                               Studio.createNewFile(contextMenuPath, 'HTML', ['htm', 'html']);
                                            }
                                        },
                                        CSS: {
                                            label: 'CSS',
                                            action: function() {
                                                Studio.createNewFile(contextMenuPath, 'CSS', ['css']);
                                            }
                                        },
                                        JavaScript: {
                                            label: 'JavaScript',
                                            action: function() {
                                               Studio.createNewFile(contextMenuPath, 'JavaScript', ['js']);
                                            }
                                        },
                                        JSON: {
                                            label: 'JSON',
                                            action: function() {
                                                Studio.createNewFile(contextMenuPath, 'JSON', ['json']);
                                            }
                                        }
                                    }
                                },
                                Rename: {
                                    label: 'Rename',
                                    action: genericRenameAction
                                },
                                Delete: {
                                    label: 'Delete',
                                    action: function() {

                                    }
                                },
                                Properties: {
                                    label: 'Properties'
                                }
                            }
                        } else {
                            // that's a file
                        }
                    }
                }
            }).on('changed.jstree', function(e, data) {
                var i, j, r = [], p = [];
                for(i = 0, j = data.selected.length; i < j; i++) {
                    r.push(data.instance.get_node(data.selected[i]).text);
                    p.push(getFullPath(data.selected[i]));
                }

                // open file (file name is in r, full path is in p)

                for(var i = 0; i < p.length; i++) {
                    Studio.openFile(projectDir + '/files/' + p[i]);
                }

            }).on('before_open.jstree close_node.jstree', function(e, data) {
                $('#' + data.node.a_attr.id).find('i')
                    .toggleClass('fa-folder-o fa-folder-open-o');
            }));

            $('#projects').modal('hide');

            refreshPanelDurey = (new Date()).getTime() - refreshPanelCounter;
            console.info('Panel updated in ' + refreshPanelDurey + ' ms');
        }

        //console.info('Refreshing panel with directory : ' + projectDir.substr(0, projectDir.length - 1));

    }

    this.setReadyFor = function(path) {
        var name = path.split('/')[path.split('/').length - 1];

        var type = config.fileTypes[name.split('.')[name.split('.').length - 1]] || config.fileTypes['@default'];

        editor.getSession().setMode('ace/mode/' + type.mode);
        editor.setOptions(type.editor || {});

        if(!files[this.getActiveFile()])
            files[this.getActiveFile()] = {};

        Studio.refreshChanges(false);

    }

    this.refreshChanges = function(bool) {

        var f = this.getActiveFile();

        if(!f) return false;

        files[f].hasChanges = bool;

        var link = $('#tabs a[data="' + Studio.getActiveFile() + '"]');

        if(bool) {
            if(!link.find('.hasChanges').length)
                link.append('<span class="hasChanges">*</span>');
        } else {
            link.find('.hasChanges').remove();
        }

    };

    this.createFile = function(dir, name, content) {

        var activeFile = this.getActiveFile();

        if(activeFile)
            edits[activeFile] = editor.getSession();

        var path = Shark.fs.normalizePath('/' + dir + '/' + name);

        $('#tabs li.active').removeClass('active');

        if(!$('#tabs').find('a[data="' + path + '"]').length) {
            $('#tabs').append($.create(
                'li',
                {
                    role: 'presentation',
                    content: $.create(
                        'a',
                        {
                            href: '#',
                            data: Shark.fs.normalizePath(path),
                            content: name
                        }
                    ).click(function () {
                        //Studio.openFile($(this).attr('data'));
                        edits[Studio.getActiveFile()] = editor.getSession();
                        $('#tabs li.active').removeClass('active');
                        $(this).parent().addClass('active');
                        var data = $(this).attr('data');
                        editor.setSession(edits[data]);
                    })
                }
            ));
        }

        $('#tabs a[data="' + path + '"]').parent().addClass('active');

        editor.setSession(ace.createEditSession(content || ''));
        this.setReadyFor(path);

    };

    this.createNewFile = function(path, type, exts) {

        StudioCreateNewFileExtensions = exts;
        createNewFilePath = path || Shark.fs.chdir();

        bootbox.prompt('New ' + (type || '') + ' file name ?', function(fileName) {
            if(fileName) {
                if(StudioCreateNewFileExtensions && StudioCreateNewFileExtensions.indexOf(fileName.split('.')[fileName.split('.').length - 1]) === -1)
                    fileName += '.' + StudioCreateNewFileExtensions[0];

                Studio.createFile(createNewFilePath, fileName);
            } else if(fileName !== null) {
                Studio.createFile(createNewFilePath, 'Untitled.' + (StudioCreateNewFileExtensions ? StudioCreateNewFileExtensions[0] : 'txt'));
            }
        })

    };

    this.openFile = function(path, allowSizeExceed) {

        if(!Shark.fs.existsFile(path)) {
            return false;
        }

        var size = Shark.fs.getFileSize(path);

        if(size > config.editor['cancel-file-open-size']) {
            return bootbox.dialog({
                title: 'File size exceed maximal limit',
                message: 'This file is too large to be opened in the editor because.<br />It exceed the maximal size you have writed in your preferences (' + config.editor['cancel-file-open-size'] + ' bytes)<br />If you open this file, the editor risk to crash.<br />Please use with a smaller file or edit the <code>cancel-file-open-size</code> property in your preferences.',
                buttons: {
                    Cancel: {
                        label: 'Cancel',
                        className: 'btn-success'
                    }
                }
            });
        }

        if(!allowSizeExceed) {
            if(size > config.editor['max-file-open-size']) {
                openingFile = path;
                return bootbox.dialog({
                    title: 'File size exceed limit',
                    message: 'The file size exceed the limit writed in your preferences (' + config.editor['max-file-open-size'] + ' bytes).<br />If you open it, the editor can crash or become very slowely.<br />Do you REALLY want to open this file ?',
                    buttons: {
                        Cancel: {
                            label: 'Cancel',
                            className: 'btn-success'
                        },
                        Continue: {
                            label: 'Continue',
                            className: 'btn-danger',
                            callback: function() {
                                Studio.openFile(openingFile, true);
                            }
                        }
                    }
                })
            }
        }

        var content = Shark.fs.readFile(path);

        if(!isDefined(content)) {
            return false;
        }

        var fileName = path.split('/')[path.split('/').length - 1];
        var dir = path.split('/');
        dir.splice(dir.length - 1, 1)

        this.createFile(dir.join('/'), fileName, content);

    };

    this.getActiveFile = function() {

        return $('#tabs li.active a').attr('data');

    };

    this.closeActiveFile = function(force) {

        var file = this.getActiveFile();

        if(!file)
            return;

        if(files[file].hasChanges && !force) {
            return bootbox.dialog({
                title: 'File has been edited',
                message: '<h2>This file has been edited</h2>All modifications will be lost.\nDo you really want to close this file ?<br /><br />File : <code>' + this.getActiveFile() + '</code>',
                buttons: {
                    Save: {
                        label: 'Save',
                        className: 'btn-success',
                        callback: function() {
                            Studio.saveFile();
                            Studio.closeActiveFile();
                        }
                    },

                    'Do not save': {
                        label: 'Do not save',
                        className: 'btn-danger',
                        callback: function() {
                            Studio.closeActiveFile(true);
                        }
                    },

                    Cancel: {
                        label: 'Cancel',
                        className: 'btn-primary'
                    }
                }
            });
        }

        delete files[file];
        delete edits[file];

        $('#tabs li.active').remove();

        if(!$('#tabs li:first').length) {
            this.emptyEditor();
        }
         else {
            this.openFile($('#tabs li:first a').attr('data'));
        }

    };

    this.saveFile = function() {

        if(!this.getActiveFile()) {
            // no file opened
            return false;
        }

        if(!files[this.getActiveFile()].hasChanges) {
            // no changes
            return false;
        }

        if(request.commit) {
            if(!_sayedCommitMode) {
                bootbox.dialog({
                    title: 'Commit mode',
                    message: '<h2>You can\'t edit or save files in commit mode !</h2>',
                    buttons: {
                        'Do not show again': {
                            label: 'Do not show again',
                            className: 'btn-danger',
                            callback: function() {
                                _sayedCommitMode = true;
                            }
                        },
                        Close: {
                            label: 'Close',
                            className: 'btn-success'
                        }
                    }
                });

                return false;
            } else {
                return false;
            }
        }

        savingFile = Studio.getActiveFile();

        server('user', {
            data: {
                do: 'writeFile',
                path: savingFile,
                content: editor.getSession().getValue()
            },
            async: false,
            success: function(ans) {
                if(ans === 'true') {
                    console.log('saved : ' + savingFile);
                    Studio.refreshChanges(false);

                    if(!_sayedSavedFile)
                        bootbox.dialog({
                            title: 'File saved',
                            message: '<h2>Successfully saved <small><code>' + savingFile + '</code></small></h2>',
                            buttons: {
                                'Do not show again': {
                                    label: 'Do not show again',
                                    className: 'btn-danger',
                                    callback: function() {
                                        _sayedSavedFile = true;
                                    }
                                },
                                OK: {
                                    label: 'OK',
                                    className: 'btn-success'
                                }
                            }
                        });

                } else {
                    this.error({responseText:ans});
                }
            },
            error: function(err) {
                console.error('cannot save : ' + savingFile + ' (server said : ' + err.responseText + ')');
               
                bootbox.dialog({
                    title: 'Can\'t save file',
                    message: '<h2>Can\'t save <small><code>' + savingFile + '</code></small></h2>Server said :<br /><br />' + err.responseText,
                    buttons: {
                        Retry: {
                            label: 'Retry',
                            className: 'btn-success',
                            callback: function() {
                                Studio.saveFile();
                            }
                        },
                        Cancel: {
                            label: 'Cancel',
                            className: 'btn-danger'
                        }
                    }
                });
            }
        });

    };

    this.emptyEditor = function() {

        editor.setSession(ace.createEditSession(''));

    };

    this.getPrivateProjectShortLink = function() {

        var link = window.location.origin + window.location.pathname + '?surl=';

        if(projectDir.substr(0, 9) === '/private/') {
            link += 'pr';
        } else {
            link += 'pu';
        }

        var a = projectDir.substr(1);
        a = a.substr(a.indexOf('/') + 1);
        link += a.substr(0, a.length - 1);

        return link;

    };

    this.projectSettings = function() {
        // project settings
    };

    this.userSettings = function() {
        function recurse(obj, headName) {
            var i = [];
            var p = {
                text: obj['@attributes'][headName || 'legend']
            };

            if(objSize(obj) > 1) {
                p.children = [];
                p.icon = 'fa fa-folder-o';
            } else {
                p.icon = 'fa fa-file-o';
            }

            for(var i in obj) {
                if(obj.hasOwnProperty(i)) {

                    // donf[i] is an XML tag
                    // we know that donf[i] is an object or an array because of XML has been treated by PHP

                    if(i !== '@attributes') {
                        if(isArray(obj[i])) {
                            for(var j = 0; j < obj[i].length; j++) {
                                p.children.push(recurse(obj[i][j], obj['@attributes']['head-name'] || headName));
                            }
                        } else {
                            p.children.push(recurse(obj[i], obj['@attributes']['head-name'] || headName));
                        }
                    }

                }
            }

            return p;
        }

        var plugins = [];

        // doesn't work !!!!

        if(config.studio.panelWholerow)
            plugins.push('wholerow');

        var settings = $.create(
            'div',
            {
                id: 'userSettings',
                type: 'settings'
            }
        ).jstree({
            core: {
                data: recurse(dconf)
            },
            plugins: plugins
        }).on('changed.jstree', function(e, data) {
            var node = data.instance.get_node(data.selected[0]);

            if(node.children.length) {
                // that's a folder !
            } else {
                var DOMNode = $('#' + node.id);
                var DOMPath = [DOMNode];
                var headName = 'legend', protect = [], nodeInConfig = dconf, textPath = [];

                while(DOMNode.parent().parent().attr('role') == 'treeitem') {
                    DOMNode = DOMNode.parent().parent();
                    DOMPath.push(DOMNode);
                }

                DOMPath = DOMPath.reverse();

                var nodeText, nodeInConfig = dconf, foundConf, headName = 'legend', path = [];
                var types = '', alwaysShow = [];

                for(var i = 1; i < DOMPath.length; i++) {
                    nodeText = DOMPath[i].find('a:first').text();
                    element = DOMPath[i];

                    found = null;

                    for(var j in nodeInConfig) {
                        if(nodeInConfig.hasOwnProperty(j)) {

                            if(j !== '@attributes') {
                                conf = nodeInConfig[j];

                                if(isArray(conf)) {
                                    for(var k = 0; k < conf.length; k++) {
                                        enfant = conf[k];
                                        if(enfant['@attributes'][headName] === nodeText) {
                                            found = enfant;
                                            path.push(j, k);
                                        }
                                    }
                                } else if(conf['@attributes'][headName] === nodeText) {
                                    found = conf;
                                    path.push(j);
                                }
                            }

                        }
                    }

                    if(found) {
                        nodeInConfig = found;
                        confAttr = found['@attributes'];
                        textPath.push(confAttr[headName]);

                        if(confAttr['head-name'])
                            headName = confAttr['head-name'];

                        if(confAttr['read-only'])
                            protect = protect.concat(confAttr['read-only'].split(','));

                        if(confAttr['always-show'])
                            alwaysShow = alwaysShow.concat(confAttr['always-show'].split(','));

                        if(confAttr['type'])
                            types = confAttr.type;
                    }

                }

                userSettingsEditing = {
                    obj: confAttr,
                    path: path,
                    legend: nodeText
                };

                var panelRows = [], prompt, typeName, t = {}, type;
                types = types.split('|');

                for(var i = 0; i < types.length; i++) {
                    t[types[i].substr(0, types[i].indexOf(':'))] = types[i].substr(types[i].indexOf(':') + 1);
                }

                confAttr = cloneObject(confAttr);

                for(var i = 0; i < alwaysShow.length; i++) {
                    if(!isDefined(confAttr[alwaysShow[i]]))
                        confAttr[alwaysShow[i]] = '';
                }

                for(var i in confAttr) {
                    if(confAttr.hasOwnProperty(i) && i !== 'type' && protect.indexOf(i) === -1) {
                    
                        type = t[i] || 'text';
                        typeName = type;

                        if(typeName.indexOf(':') !== -1)
                            typeName = typeName.substr(0, typeName.indexOf(':'));

                        type = type.substr(typeName.length + 1);

                        switch(typeName) {
                            case 'select':
                                var opt = [];

                                if(type.substr(0, 1) === '{' && type.substr(-1) === '}') {
                                    type = window[type.substr(1, type.length - 2)];

                                    if(!type.join)
                                        type = '';
                                    else
                                        type = type.join(',');

                                }

                                type.split(',').forEach(function(val) {
                                    var o = $.create('option').text(val);

                                    if(val === confAttr[i])
                                        o.attr('selected', 'selected');

                                    opt.push(o);
                                });

                                prompt = $.create('select', {
                                    class: 'form-control',
                                    content: opt,
                                    for: i
                                });
                                break;

                            case 'boolean':
                                prompt = $.create('select', {
                                    content: [
                                        $.create('option').text('true'),
                                        $.create('option').text('false')
                                    ],
                                    class: 'form-control',
                                    for: i
                                });
                                prompt.find('option:eq(' + confAttr[i] === 'true' + ')').attr('selected', 'selected');
                                break;

                            case 'date':
                            case 'email':
                            case 'text':
                            case 'number':
                            default:
                                prompt = $.create('input', {
                                    class: 'form-control',
                                    for: i,
                                    placeholder: i,
                                    type: typeName
                                }).val(confAttr[i]);
                                break;
                        }

                        panelRows.push($.create('div', {
                            class: 'form-group',
                            content: prompt
                        }));
                    }
                }

                $(this).parent().parent().parent().find('div[type="panel"]').html('').append([
                    $.create('h1',{content:$.create('small',{content:$.create('small').text(textPath.join(' / '))})})
                    ].concat(panelRows).concat([
                        $.create('button', {
                        class: 'btn btn-success',
                        content: 'Save changes'
                    }).click(function() {

                        var hadError = false;

                        $('button:eq(3)').parent().find('[for]').each(function(el, node) {

                            var val;

                            switch(node.nodeName.toLocaleLowerCase()) {

                                case 'select':
                                    val = $(node).find(':selected').text();
                                    break;

                                case 'text':
                                case 'number':
                                case 'date':
                                case 'email':
                                default:
                                    val = $(node).val();
                                    break;

                            }

                            var path = userSettingsEditing.path.concat(['@attributes', $(node).attr('for')]);

                            if(hadError)
                                return;

                            var serve = Shark.fs.serve('changePreferences', path.join('/'), val);

                            if(serve !== 'true') {
                                hadError = true;
                                bootbox.dialog({
                                    title: 'Server error',
                                    message: '<h2>Can\'t save changes</h2>Server said :<br /><br />' + $('<div></div>').text(serve).html(),
                                    buttons: {
                                        Close: {
                                            label: 'Close',
                                            className: 'btn btn-danger'
                                        }
                                    }
                                })
                            }

                        });

                        if(!hadError) {
                            bootbox.dialog({
                                title: 'Saved preferences',
                                message: '<h2>Successfully saved preferences</h2>',
                                buttons: {
                                    Close: {
                                        label: 'Close',
                                        className: 'btn btn-success'
                                    }
                                }
                            });
                        }

                    })])
                );

            }

        }).on('before_open.jstree close_node.jstree', function(e, data) {
            $('#' + data.node.a_attr.id).find('i')
                .toggleClass('fa-folder-o fa-folder-open-o');
        });

        /*var content = $.create('table', {
            content: [
                $.create('tr', {
                    content: [
                        $.create('td', {
                            content: settings
                        }).css('border-right', '1px solid gray').css('padding-right', 5),
                        $.create('td', {
                            content: $.create('div', {
                                content: 
                                    $.create('div', {
                                        type: 'panel',
                                        content: 'Nothing to display'
                                    }).css('width', '100%').css('height', '100%')
                            })
                        }).css('padding-left', 5)
                    ]
                })
            ]
        }).css('width', '100%');*/

        var content = [
            settings.css({
                borderRight: '1px solid gray',
                paddingright: 5,
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: '50%'
            }),
            $.create('div', {
                type: 'panel',
                content: 'Nothing to display'
            }).css({
                paddingLeft: 5,
                paddingRight: 5,
                display: 'inline-block',
                position: 'absolute',
                top: 0,
                left: '50%',
                right: 0,
                bottom: 0
            })
        ];

        $('#settings').html(content).show();

    };

    this.logout = function() {

        if(Shark.fs.serve('logout') !== 'true') {
            return bootbox.dialog({
                title: 'Disconnect error',
                message: '<h2>Can\'t disconnect from account<h2>Server said :<br /><br />' + lastError,
                buttons: {
                    Retry: {
                        label: 'Retry',
                        className: 'btn-success',
                        callback: function() {
                            Studio.logout();
                        }
                    },
                    Cancel: {
                        label: 'Cancel',
                        className: 'btn-danger'
                    }
                }
            })
        } else {
            window.location.href = 'login.php';
        }

    };

};

Studio = new Studio();

editor.on('input', function() {

    Studio.refreshChanges(true);

});

/* Keyboard events */

var savingFile;

editor.commands.addCommand({
    name: 'save',
    bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
    exec: function(editor) {
        Studio.saveFile();
    }
});

editor.commands.addCommand({
    name: 'close',
    bindKey: {win: 'Ctrl-Q', mac: 'Command-Q'},
    exec: function(editor) {
        console.log('close keyboard shortcut');
        Studio.closeActiveFile();
    }
});

var dfmEnabled = false;
editor.commands.addCommand({
    name: 'distractionFreeMode',
    bindKey: {win: 'Ctrl-I', mac: 'Command-I'},
    exec: function(editor) {
        $('#menu, #panel')[dfmEnabled ? 'fadeIn' : 'fadeOut'](1000);
        dfmEnabled = !dfmEnabled;
    }
});

var consoleOpened = false;
editor.commands.addCommand({
    name: 'terminal',
    bindKey: {win: 'F2', mac: 'F2'},
    exec: function(editor) {
        $('#terminal-container').slideToggle(400);
    }
});

/* Display menu bar */

var menu = {
    File: ['fa fa-file-o', {
        New: ['fa fa-file-o', function() {
            Studio.createNewFile();
        }],
        Save: ['fa fa-floppy-o', function() {
            Studio.saveFile();
        }],
        Close: ['fa fa-times', function() {
            Studio.closeActiveFile();
        }]
    }],

    Project: ['fa fa-folder-o', {
        Settings: ['fa fa-wrench', function() {
            Studio.projectSettings();
        }],

        A: 'sep',

        'Private short link': ['fa fa-share', function() {
            bootbox.dialog({
                title: 'Private short link',
                message: '<h4>Private project short link</h4>This is a short link to access easily to this project.<br />Please note that you must be logged in with your account to access this project !<br /><br /><input type="text" class="form-control" value="' + Studio.getPrivateProjectShortLink() + '" />',
                buttons: {
                    Close: {
                        label: 'Close',
                        className: 'btn-primary'
                    }
                }
            });
        }]
    }],

    Account: ['fa fa-user', {
        Preferences: ['fa fa-wrench', function() {
            Studio.userSettings();
        }],
        
        A: 'sep',

        Logout: ['fa fa-sign-out', function() {
            Studio.logout();
        }]
    }],

    Terminal: ['fa fa-terminal', {
        Show: ['fa fa-eye', function() {
            $('#terminal-container').slideDown(400);
        }],
        Hide: ['fa fa-eye-slash', function() {
            $('#terminal-container').slideUp(400);
        }],
        Clear: ['fa fa-trash-o', function() {
            $('#terminal').terminal().clear();
        }],
        'Save output': ['fa fa-file-text-o', function() {
            bootbox.dialog({
                title: 'Save terminal output',
                message: '<h2>Save terminal output</h2>You will save the terminal content in a file.<br />Please specify the output file path :<br /><br /><input type="text" class="form-control" value="" />',
                buttons: {
                    'Save without colors': {
                        label: 'Save without colors',
                        className: 'btn-default',
                        callback: function() {
                            var outputFile = $(this).find('input.form-control').val();
                            var output = $('<div></div>').html($('#terminal').terminal().get_output()).text().replace(/\[\[(.*?)\](.*?)\]/g, '$2');

                            if(Shark.fs.writeFile(outputFile, output))
                                bootbox.alert('Successfully saved output');
                            else
                                bootbox.alert('Save failed ! Please try again');
                        }
                    },

                    Save: {
                        label: 'Save',
                        className: 'btn-primary',
                        callback: function() {
                            var outputFile = $(this).find('input.form-control').val();
                            var output = $('<div></div>').html($('#terminal').terminal().get_output()).text();

                            if(Shark.fs.writeFile(outputFile, output))
                                bootbox.alert('Successfully saved output');
                            else
                                bootbox.alert('Save failed ! Please try again');
                        }
                    },

                    Cancel: {
                        label: 'Cancel',
                        className: 'btn-success'
                    }
                }
            });
        }]
    }],

    Versionning: ['fa fa-history', {
        Commit: ['fa fa-check', function() {
            bootbox.prompt('Please input the commit name :', function(name) {

                if(name === null) {
                    return console.log('Commit canceled');
                }

                commitMessage = name;

                bootbox.dialog({
                    title: 'SharkDev commit',
                    message: '<h3><i class="fa fa-spinner fa-pulse"></i> Performing commit...</h3>',
                    buttons: {
                        Close: {
                            label: 'Close'
                        }
                    }
                });

                $('.bootbox .modal-footer button').prop('disabled', true);

                server('user', {
                    data: {
                        do: 'commit',
                        path: projectDir,
                        content: name
                    },
                    success: function(text) {
                        if(text == 'true') {
                            $('.bootbox .modal-body h3').replaceWith('<br /><p class="bg-success" style="padding: 5px;">Commit performed !</p>');
                        } else {
                            $('.bootbox .modal-body h3').replaceWith('<br /><p class="bg-danger" style="padding: 5px;">Commit failed</p>');
                        }

                        console.info('A commit was performed : ' + commitMessage);
                        $('.bootbox button').prop('disabled', false);
                    },
                    error: function(err) {
                        console.error('[Commit] Connect error for "' + commitMessage + '" :', err);
                        $('.bootbox .modal-body').append('<br /><p class="bg-danger" style="padding: 5px;">Commit failed : Cannot contact server (connexion failed)</p>');
                        $('.bootbox button').prop('disabled', false);
                    }
                });
            });
        }],

        'View history': ['fa fa-history', function() {
            var commits = Shark.fs.readDirectory(projectDir + '/versionning');
            var table = $.create('table', {id:'commitHistory', class: 'table table-striped table-hover'});
            table.append(
                $.create('tr', {
                    content: [
                        $.create('th', {content: '#'}),
                        $.create('th', {content: 'date'}),
                        $.create('th', {content: 'message'})
                    ]
                })
            );

            for(var i in commits) {
                if(commits.hasOwnProperty(i)) {

                    var c = Shark.fs.serve('getCommit', projectDir, i);

                    try {
                        c = JSON.parse(c);
                    }

                    catch(e) {
                        table = $.create('div', {class: 'bg-danger', style: 'padding: 5px;', content: 'Can\'t parse commits (error at commit ' + i + ')'});
                        break;
                    }

                    table.append($.create('tr', {
                        content: [
                            $.create('td', {
                                content: parseInt(i)
                            }),
                            $.create('td', {
                                content: c.date
                            }),
                            $.create('td', {
                                content: c.message.replace(/\n/g, '<br />')
                            })
                        ],
                        selected: false
                    }).click(function() {
                        $(this).attr('selected', !$(this).attr('selected'));

                        if(this.getAttribute('selected')) {
                            $(this).parent().parent().find('tr.active').removeClass('active');
                            $(this).addClass('active');
                            $('.bootbox button.btn-success').prop('disabled', false);
                            selectedCommitID = $(this).find('td:first').text();
                        } else {
                            $(this).removeClass('active');
                            $('.bootbox button.btn-success').prop('disabled', true);
                            selectedCommitID = false;
                        }
                    }));
                }
            }

            bootbox.dialog({
                title: 'Versionning history',
                message: [$.create('h2', {content: 'Versionning history'}), table],
                buttons: {
                    View: {
                        label: 'View',
                        className: 'btn-success',
                        callback: function() {
                            bootbox.dialog({
                                title: 'Commit viewer',
                                message:
                                    $.create('iframe', {
                                        src: 'studio.php?project=' + projectDir.substr(1, projectDir.length - 2) + '&commit=' + selectedCommitID,
                                        id: 'commitViewer'
                                    })
                            });

                            $('.bootbox').draggable({handle: '.modal-header'});

                        }
                    },
                    Cancel: {
                        label: 'Cancel',
                        className: 'btn-default'
                    }
                }
            });

            $('.bootbox button.btn-success').prop('disabled', true);
        }]
    }],

    Help: ['fa fa-question', {

        About: ['fa fa-info', function() {
            bootbox.dialog({
                title: 'SharkDev - About',
                message: '<h2>Shark Dev Credits</h2>This project has been created by Clement Nerma.<br />This product is under the <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode">Creative Commons CC BY-NC-ND 4.0 license</a><br /><br />Thanks to many persons without whom this project would not exist ! Thanks to the developpers of :<br /><br /><ul><li><a href="https://jquery.com/">jQuery</a></li><li><a href="http://getbootstrap.com/">Twitter Bootstrap</a></li><li><a href="http://www.jstree.com/">jsTree</a></li><li><a href="http://terminal.jcubic.pl/">jQuery Terminal</a></li><li><a href="https://code.google.com/p/crypto-js/">CryptoJS</a></li><li><a href="http://designmodo.github.io/Flat-UI/">FlatUI</a></li><li><a href="http://bootboxjs.com/">Bootbox</a></li></ul>And thanks too to :<br /><br /><ul><li><a href="http://openclassrooms.com/">OpenClassRooms</a>, for courses on PHP, HTML, CSS, jQuery, JavaScript, etc. which helped me to learn programming,</li><li><a href="http://www.grafikart.fr/">Grafikart</a>, for all of his tutorials</li></ul>',
                buttons: {
                    OK: {
                        label: 'OK',
                        className: 'btn-success'
                    }
                }
            })
        }]

    }]
}

var items;
for(var i in menu) {
    if(menu.hasOwnProperty(i)) {
        items = [];

        for(var j in menu[i][1]) {
            if(menu[i][1][j] === 'sep') {
                items.push($.create('li', {
                    role: 'separator',
                    class: 'divider'
                }))
            } else {
                items.push($.create('li', {
                    content: $.create('a', {
                        href: '#',
                        content: [$.create('i', {class: menu[i][1][j][0]}), ' ' + j]
                    }).click(menu[i][1][j][1])
                }))
            }
        }

        $('#menuitems').append($.create('li', {
            class: 'dropdown',
            content: [$.create('a', {
                class: 'dropdown-toggle',
                'data-toggle': 'dropdown',
                content: [$.create('i', {class: menu[i][0]}), ' ' + i, $.create('span', {class: 'caret'})],
                role: 'button'
            }), $.create('ul', {
                class: 'dropdown-menu',
                role: 'menu',
                content: items
            })]
        }))
    }
}

$('#terminal-tools button[action="close"]').click(function() {
    $('#terminal-container').slideToggle(400);
});

$('#terminal-tools button[action="clear"]').click(function() {
    $('#terminal').terminal().clear();
});

var panelRefresh;
var panelRefreshCallback = function() {
    if(projectDir && Studio && Studio.refreshPanel)
        Studio.refreshPanel(projectDir.substr(0, projectDir.length - 1));
}

$(window).on('load', function() {
    
    if(loadProject) {
        Studio.refreshPanel(request.project);
        Shark.fs.chdir(projectDir + 'files');
    }
    
    window.panelRefresh = setInterval(window.panelRefreshCallback, 1000);
    window.panelRefreshCallback();

});

if(!request.commit) {
    var script = Shark.fs.readFile('/startup.ssa');

    if(script)
        Shark.run(script, $('#terminal').terminal());
}

console.info('SharkDev ' + (request.commit ? 'Commit Viewer' : 'Studio') + ' is ready to work !');
