
function WindowFixSize() {
    /*$('#page-wrapper,#panel,#editor,#terminal-container').css('height', (document.body.clientHeight - 150) + 'px');
    $('#terminal-container')*/
    $('#terminal-container').css({
        top: document.body.clientHeight * (2/3) + 'px',
        height: document.body.clientHeight / 3 + 'px'
    });
}

document.body.onresize = WindowFixSize;
WindowFixSize();

window.onbeforeunload = function() {
    for(var i in files) {
        if(files.hasOwnProperty(i)) {
            if(files[i].hasChanges)
                return 'Unsaved work will be lost and you will never be able to recover it !';
        }
    }
}

$('#status-loader').show();
$('#status-text').text('Loading SharkDev Studio...');

var SERVER_URL = 'server';
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

// definen all global variables
var projectDir, contextMenuPath, selectedNode, createNewFilePath, commitMessage, lastPanelDataTree;
var refreshPanelDurey, openingFile, selectedCommitID, _sayedCommitMode, _sayedSavedFile;
var userSettingsEditing, projectLoaded = false, compileCode, IO, openingTabFile
var forceOpeningTabFile, alwaysForceRun, willRunFile;
var projectConfig = {
    project: {},
    fileWatchers: {},
    params: {}
};
var projectInfos = {};

// define ace themes and modes list
var ace_themes = ['ambiance', 'chaos', 'chrome', 'clouds', 'clouds_midnight', 'cobalt', 'crimson_editor', 'dawn', 'dreamweaver', 'eclipse', 'github', 'idle_fingers', 'iplastic', 'katzenmilch', 'kr_theme', 'kuroir', 'merbivore', 'merbivore_soft', 'mono_industrial', 'monokai', 'pastel_on_dark', 'solarized_dark', 'solarized_light', 'sqlserver', 'terminal', 'textmate', 'tomorrow', 'tomorrow_night_blue', 'tomorrow_night_bright', 'tomorrow_night_eighties', 'tomorrow_night', 'twilight', 'vibrant_ink', 'xcode'];
var ace_modes = ['abap', 'abc', 'actionscript', 'ada', 'apache_conf', 'applescript', 'asciidoc', 'assembly_x86', 'autohotkey', 'batchfile', 'c9search', 'c_cpp', 'cirru', 'clojure', 'cobol', 'coffee', 'coldfusion', 'csharp', 'css', 'curly', 'dart', 'diff', 'django', 'd', 'dockerfile', 'dot', 'eiffel', 'ejs', 'elixir', 'elm', 'erlang', 'forth', 'ftl', 'gcode', 'gherkin', 'gitignore', 'glsl', 'golang', 'groovy', 'haml', 'handlebars', 'haskell', 'haxe', 'html', 'html_ruby', 'ini', 'io', 'jack', 'jade', 'java', 'javascript', 'jsoniq', 'json', 'jsp', 'jsx', 'julia', 'latex', 'lean', 'less', 'liquid', 'lisp', 'live_script', 'livescript', 'logiql', 'lsl', 'lua', 'luapage', 'lucene', 'makefile', 'markdown', 'mask', 'matlab', 'mel', 'mips_assembler', 'mipsassembler', 'mushcode', 'mysql', 'nix', 'objectivec', 'ocaml', 'pascal', 'perl', 'pgsql', 'php', 'plain_text', 'powershell', 'praat', 'prolog', 'properties', 'protobuf', 'python', 'rdoc', 'rhtml', 'r', 'ruby', 'rust', 'sass', 'scad', 'scala', 'scheme', 'scss', 'sh', 'sjs', 'smarty', 'snippets', 'soy_template', 'space', 'sql', 'sqlserver', 'stylus', 'svg', 'tcl', 'tex', 'textile', 'text', 'toml', 'twig', 'typescript', 'vala', 'vbscript', 'velocity', 'verilog', 'vhdl', 'xml', 'xquery', 'yaml'];

// display, hide and perform many actions on many DOM elements
$('#settings, #runner').hide();
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
$('#terminal-container').hide();
$('#commitViewer').hide();
$('.navbar-brand').click(function() {
    $('#menuitems .fa-user').parent().trigger('click');
});
$('#close-status').click(function() {
    $('#status').fadeOut(500);
});

// get user's preferences
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
    studio: {},
    contextmenu: {}
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
    if(isArray(params)) {
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
config_set(config.contextmenu, dconf.contextmenu.param);

var editor = ace.edit('editor');
editor.$blockScrolling = Infinity;
editor.setOptions(config.editor.native);
editor.setOption('enableEmmet', true);

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

    this.setStatus = function(status, displayLoader) {

        $('#status-text').text(status);
        $('#status-loader')[displayLoader ? 'show' : 'hide']();

    };

    this.getFinalContent = function(content, format, path) {

        var formats = {
            html: {
                input: /<shark>@import\('(.*?)',( |)'(.*?)'\)<\/shark>/g,
                output: function(match, attr1, space, attr2) {
                    if(attr1 === 'stylesheet:css')
                        return '<style type="text/css" charset="utf-8">' + (Shark.fs.readFile(Shark.fs.normalizePath(attr2, parent)) || '/* Cannot get file : ' + attr2 + ' */') + '</style>';

                    if(attr1 === 'script:javascript')
                        return '<script type="text/javascript" charset="utf-8">' + (Shark.fs.readFile(Shark.fs.normalizePath(attr2, parent)) || '/* Cannot get file : ' + attr2 + ' */') + '</script>';
                }
            },
            css: {
                input: /\/\/shark:@import\('(.*?)'\)/g,
                output: function(match, attr1) {
                    return Shark.fs.readFile(Shark.fs.normalizePath(attr1, parent)) || '/* Cannot get file : ' + attr2 + ' */';
                }
            },
            js: {
                input: /SharkImport\('(.*?)'\)/g,
                output: function(match, attr1) {
                    return Shark.fs.readFile(Shark.fs.normalizePath(attr1, parent)) || '/* Cannot get file : ' + attr2 + ' */';
                }
            }
        };

        if(!formats[format]) {
            console.error('SharkDev imports are not supported for ' + format + ' format !');
            return content;
        }

        var parent = Shark.fs.getFileDirectory(path);

        return content.replace(formats[format].input, formats[format].output);

    }

    // refresh the file list in the left panel
    this.refreshPanel = function(dir) {

        refreshPanelDurey = 0;
        refreshPanelCounter = (new Date()).getTime();

        projectDir = Shark.fs.normalizePath('/' + dir) + '/';

        if(!projectLoaded) {
            // if the project is loading and if this function is called for the first time
            var err = false;

            var proj_config = Shark.fs.serveI('getProjectConfig', projectDir);
            var proj_infos  = Shark.fs.serveI('getProjectInformations', projectDir);

            try {
                proj_config = JSON.parse(proj_config);
                proj_infos = JSON.parse(proj_infos);
            }

            catch(e) {
                err = true;
                bootbox.dialog({
                    title: 'Server error',
                    message: '<h2>Cannot load project configuration</h2>File watchers and other configurations will not work during this session.<br />Please refresh the page to try again.',
                    buttons: {
                        Retry: {
                            label: 'Retry',
                            className: 'btn-success',
                            callback: function() {
                                window.location.reload();
                            }
                        },
                        Cancel: {
                            label: 'Cancel',
                            className: 'btn-danger'
                        }
                    }
                });
            }

            // if data are valid and were converted to JSON object by JSON.parse()
            if(!err) {
                // we convert the configuration of the project from JSON treated by PHP to another JSON presentation
                config_set(projectConfig.params, proj_config.param);
                config_set(projectConfig.project, proj_config.project.param);

                if(isArray(proj_config.filewatchers.watcher)) {
                    for(var i = 0; i < proj_config.filewatchers.watcher; i++) {
                        projectConfig.fileWatchers[proj_config.filewatchers.watcher[i]['@attributes'].type] = proj_config.filewatchers.watcher[i]['@attributes'];
                    }
                } else {
                    projectConfig.fileWatchers[proj_config.filewatchers.watcher['@attributes'].type] = proj_config.filewatchers.watcher['@attributes'];
                }

                config_set(projectInfos, proj_infos.attribute);

                projectLoaded = true;

                for(var i in projectConfig.fileWatchers) {
                    if(projectConfig.fileWatchers.hasOwnProperty(i)) {
                        var watcher = projectConfig.fileWatchers[i];
                        watcher.vars = {};
                        watcher['input-type'] = watcher['input-type'] || 'path';
                        watcher.output = watcher.output || '${input}.out';

                        try { watcher.parameters = JSON.parse(watcher.parameters); }
                        catch(e) { watcher.parameters = {}; }

                        $.ajax({
                            url: 'server/get-compiler.php?name=' + watcher.compiler,
                            async: false,
                            success: function(ans) {
                                try {
                                    var compilerPackage = JSON.parse(ans);
                                }

                                catch(e) {
                                    this.error({statusCode: 200});
                                }

                                watcher.package = compilerPackage;

                            },
                            error: function(xhr) {
                                bootbox.dialog({
                                    title: 'Server error',
                                    message: '<h2>Can\'t get file watcher : ' + watcher.type + '</h2>Maybe it has been removed from the server.<br /><br /><details><summary>Details</summary>Status code : ' + xhr.status + '</details>',
                                    buttons: {
                                        Retry: {
                                            label: 'Retry',
                                            className: 'btn-success',
                                            callback: function() {
                                                window.location.reload();
                                            }
                                        },
                                        Ignore: {
                                            label: 'Ignore',
                                            className: 'btn-danger'
                                        }
                                    }
                                });
                            }
                        })
                    }
                }
            }
        }

        var data = Shark.fs.readDirectory(projectDir + 'files', true);

        // if can't get the project files list
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
            // function to create a jsTree object from a server readDirectory() response
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

            // we define the plugins list
            var plugins = ['contextmenu'];

            // if the user want to use the 'wholerow' plugin for the panel
            if(config.studio.panelWholerow)
                plugins.push('wholerow');

            // define the function which permit to rename files and directories
            var genericCopyAction = function() {
                var dir = Shark.fs.existsDirectory(contextMenuPath);

                bootbox.prompt((dir?'Directory':'File') + ' copy name ?', function(name) {
                    if(!Shark.fs['copy' + (dir?'Directory':'File')](contextMenuPath, name)) {
                        bootbox.alert('Can\'t copy ' + (dir?'directory':'file') + ' !');
                    }
                });
            }

            var genericMoveAction = function() {
                var dir = Shark.fs.existsDirectory(contextMenuPath);

                bootbox.prompt('New ' + (dir?'directory':'file') + ' name ?', function(name) {
                    if(!Shark.fs.rename(contextMenuPath, name)) {
                        bootbox.alert('Can\'t rename ' + (dir?'directory':'file') + ' !');
                    } else {
                        var link = selectedNode.find('a')[0];
                        link.innerHTML = link.innerHTML.substr(0, link.innerHTML.length - $(link).text().length) + name;
                    }
                });
            };

            var genericPropertiesAction = function() {
                var dir = Shark.fs.existsDirectory(contextMenuPath);

                var content = $('<table><tr><td>Name</td><td>: ' + contextMenuPath.split('/')[contextMenuPath.split('/').length - 1] + '</td></tr><tr><td>Path</td><td>: ' + contextMenuPath + '</td></tr><tr><td>Size</td><td>: ' + Shark.fs.size2str((dir ? Shark.fs.getDirectorySize(contextMenuPath) : Shark.fs.getFileSize(contextMenuPath))) + '</td></tr></table>');
                content.find('td').css('padding', '5px');

                bootbox.dialog({
                    title: 'Properties',
                    message: content
                });
            };

            // if just received files list and previous files list are the same,
            // then there are no files added or removed between the last refresh and now
            if(JSON.stringify(data) === JSON.stringify(lastPanelDataTree))
                return false;

            // we save the just received files list
            lastPanelDataTree = data;

            // convert server readDirectory() response to a jsTree object
            data = recurse(data);

            // we create the files tree (in the panel) with the jsTree library
            $('#panel').replaceWith($.create('div', {id: 'panel', style: $('#panel').attr('style')}).jstree({
                core: {
                    data: data,
                    check_callback: true
                },
                plugins: plugins,
                contextmenu: {
                    items: function($node) {
                        selectedNode = $('#' + $node.id);
                        var path = projectDir + 'files/' + getFullPath($node.id);
                        contextMenuPath = path;

                        if(Shark.fs.existsDirectory(path)) {
                            // that's a directory

                            var newFile = {};

                            var n = config.contextmenu.new.split(',');

                            for(var i = 0; i < n.length; i++) {
                                for(var j in config.fileTypes) {
                                    if(config.fileTypes.hasOwnProperty(j)) {
                                        //console.log(config.fileTypes[j].name.toLocaleLowerCase(), n[i].toLocaleLowerCase());
                                        if(config.fileTypes[j].name.toLocaleLowerCase() === n[i].toLocaleLowerCase()) {
                                            //console.log('Studio.createNewFile(contextMenuPath, "' + n[i] + '", ["' + j + '"]);');
                                            newFile[n[i]] = {
                                                label: n[i],
                                                action: new Function('Studio.createNewFile(contextMenuPath, "' + n[i] + '", ["' + j + '"]);')
                                            }
                                        }

                                    }
                                }
                            }


                            return {
                                New: {
                                    label: 'New',
                                    submenu: newFile
                                },
                                Copy: {
                                    label: 'Copy',
                                    action: genericCopyAction
                                },
                                Move: {
                                    label: 'Move',
                                    action: genericMoveAction
                                },
                                Delete: {
                                    label: 'Delete',
                                    action: function() {
                                        bootbox.confirm('Do you really want to remove this directory ? This action cannot be undo !', function(bool) {
                                            if(bool)
                                                Shark.fs.removeDirectory(contextMenuPath);
                                        })
                                    }
                                },
                                Properties: {
                                    label: 'Properties',
                                    action: genericPropertiesAction
                                }
                            }
                        } else {
                            return {
                                Open: {
                                    label: 'Open',
                                    action: function() {
                                        Studio.openFile(contextMenuPath);
                                    }
                                },
                                Run: {
                                    label: 'Run',
                                    action: function() {
                                        Studio.run(contextMenuPath);
                                    }
                                },
                                Copy: {
                                    label: 'Copy',
                                    action: genericCopyAction
                                },
                                Move: {
                                    label: 'Move',
                                    action: genericMoveAction
                                },
                                Delete: {
                                    label: 'Delete',
                                    action: function() {
                                        bootbox.confirm('Do you really want to remove this file ? This action cannot be undo !', function(bool) {
                                            if(bool)
                                                Shark.fs.removeFile(contextMenuPath);
                                        })
                                    }
                                },
                                Properties: {
                                    label: 'Properties',
                                    action: genericPropertiesAction
                                }
                            }
                        }
                    }
                }
            }).on('changed.jstree', function(e, data) {
                // a file or directory has been selected

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
                // a directory has been opened or closed

                $('#' + data.node.a_attr.id).find('i')
                    .toggleClass('fa-folder-o fa-folder-open-o');
            }));

            // hide the projects list which appear at the beginning
            $('#projects').modal('hide');

            // calculate the durey of the refresh
            refreshPanelDurey = (new Date()).getTime() - refreshPanelCounter;
            console.info('Panel updated in ' + refreshPanelDurey + ' ms');
        }

        //console.info('Refreshing panel with directory : ' + projectDir.substr(0, projectDir.length - 1));

    }

    // set the studio ready to open a specific file
    this.setReadyFor = function(path) {
        var name = path.split('/')[path.split('/').length - 1];

        // we get the type object of the file (stored in config.filesType[<extension>])
        var type = config.fileTypes[name.split('.')[name.split('.').length - 1]] || config.fileTypes['@default'];

        editor.getSession().setMode('ace/mode/' + (type.mode || 'plain_text'));
        editor.setOptions(type.editor || {});

        if(!files[this.getActiveFile()])
            files[this.getActiveFile()] = {};

        Studio.refreshChanges(false);

    }

    // set if the current file has been edited
    this.refreshChanges = function(bool) {

        var f = this.getActiveFile();

        // if there is no file open
        if(!f) return false;

        // set the edit state of the file
        files[f].hasChanges = bool;

        // add or remove a star to the file name in the tabs bar
        var link = $('#tabs a[data="' + Studio.getActiveFile() + '"]');

        if(bool) {
            // if the file has been edited
            if(!link.find('.hasChanges').length)
                link.append('<span class="hasChanges">*</span>');
        } else {
            // if the file hasn't been edited
            link.find('.hasChanges').remove();
        }

    };

    // create a file in the editor from an existing file
    this.createFile = function(dir, name, content) {

        var activeFile = this.getActiveFile();

        if(activeFile)
            edits[activeFile] = editor.getSession();

        var path = Shark.fs.normalizePath('/' + dir + '/' + name);

        $('#tabs li.active').removeClass('active');

        // create the tab for the file if this file is not already opened in the editor
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
                        // the tab has been clicked

                        edits[Studio.getActiveFile()] = editor.getSession();

                        $(this).parent().addClass('active');
                        var data = $(this).attr('data');
                        var content = Shark.fs.readFile(data);

                        if(content && edits[data].getValue() !== content) {
                            openingTabFile = data;
                            return bootbox.dialog({
                                title: 'File has been edited',
                                message: '<code>' + data.substr(1) + '</code> has been externally edited.<br />Do you want to reload it ?',
                                buttons: {
                                    Reload: {
                                        label: 'Reload',
                                        className: 'btn-success',
                                        callback: function() {
                                            Studio.openFile(openingTabFile);
                                        }
                                    },
                                    Ignore: {
                                        label: 'Ignore',
                                        className: 'btn-danger',
                                        callback: function() {
                                            forceOpeningTabFile = true;
                                            $('#tabs a[data="' + openingTabFile + '"]').click();
                                        }
                                    }
                                }
                            });
                        }

                        $('#tabs li.active').removeClass('active');

                        editor.setSession(edits[data]);
                        $('#tabs a[data="' + data + '"]').parent().addClass('active');

                        forceOpeningTabFile = false;
                    })
                }
            ));
        }

        // the current file tab is set as active tab
        $('#tabs a[data="' + path + '"]').parent().addClass('active');

        editor.setSession(ace.createEditSession(content || ''));

        // set editor ready to open the file
        this.setReadyFor(path);

    };

    // create an empty file
    this.createNewFile = function(path, type, exts) {

        StudioCreateNewFileExtensions = exts;
        createNewFilePath = path || Shark.fs.chdir();

        // input to user the new file name
        bootbox.prompt('New ' + (type || '') + ' file name ?', function(fileName) {
            // if a file name has been input
            if(fileName) {
                if(StudioCreateNewFileExtensions && StudioCreateNewFileExtensions.indexOf(fileName.split('.')[fileName.split('.').length - 1]) === -1)
                    fileName += '.' + StudioCreateNewFileExtensions[0];

                Studio.createFile(createNewFilePath, fileName);
            } else if(fileName !== null) {
                // if the input has been canceled
                Studio.createFile(createNewFilePath, 'Untitled.' + (StudioCreateNewFileExtensions ? StudioCreateNewFileExtensions[0] : 'txt'));
            }
        })

    };

    // open an existing file
    this.openFile = function(path, allowSizeExceed) {

        // if the file doesn't exists
        if(!Shark.fs.existsFile(path)) {
            return false;
        }

        var size = Shark.fs.getFileSize(path);

        // if the size exceed the safe file size
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

        // if the size exceed the recommanded maximal file size
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

        // if can't read the file content
        if(!isDefined(content)) {
            return false;
        }

        var fileName = path.split('/')[path.split('/').length - 1];
        var dir = path.split('/');
        dir.splice(dir.length - 1, 1)

        // open the file in the editor
        this.createFile(dir.join('/'), fileName, content);

    };

    // get the current file path
    this.getActiveFile = function() {

        return $('#tabs li.active a').attr('data');

    };

    // close the current file
    this.closeActiveFile = function(force) {

        var file = this.getActiveFile();

        // if there is no file actually opened in the editor
        if(!file)
            return;

        // if the file has been edited
        if(files[file].hasChanges && !force) {
            // ask user if he want to save changes or no
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

        // remove file tab
        $('#tabs li.active').remove();

        // if there is no another file opened in the editor
        if(!$('#tabs li:first').length) {
            // set the editor empty
            this.emptyEditor();
        } else {
            // open the other file
            this.openFile($('#tabs li:first a').attr('data'));
        }

    };

    // save the current file
    this.saveFile = function() {

        // if there is no file actually opened in the editor
        if(!this.getActiveFile()) {
            return false;
        }

        // if the current file hasn't been edited
        if(!files[this.getActiveFile()].hasChanges) {
            return false;
        }

        // if the frame is in commit mode
        if(request.commit) {
            // if never said that the frame is in commit mode
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

        this.setStatus('Saving : ' + savingFile, true);

        if(Shark.fs.writeFile(savingFile, editor.getSession().getValue())) {
            console.log('saved : ' + savingFile);
            this.setStatus('Saved : ' + savingFile);
            Studio.refreshChanges(false);

            if(!_sayedSavedFile) {
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
            }

            Studio.autocompile(savingFile);    

        } else {
            console.error('cannot save : ' + savingFile + ' (server said : ' + err.responseText + ')');
            this.setStatus('Failed to save : ' + savingFile);
           
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

    };

    // set the editor empty
    this.emptyEditor = function() {

        editor.setSession(ace.createEditSession(''));

    };

    // get a private short link for this project
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

    // open the visual editor for project settings
    this.projectSettings = function() {
        // project settings
    };

    // open the visual editor for user settings
    this.userSettings = function() {
        // define function to convert server response for user settings to a jsTree object
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

        // if the user want to use the 'wholerow' plugin
        if(config.studio.panelWholerow)
            plugins.push('wholerow');

        // create the file tree using jsTree plugin
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
            // a setting name has been clicked

            var node = data.instance.get_node(data.selected[0]);

            // if the clicked item is not a folder but a single parameter
            if(!node.children.length) {
                var DOMNode = $('#' + node.id);
                var DOMPath = [DOMNode];
                var headName = 'legend', protect = [], nodeInConfig = dconf, textPath = [];

                // create the DOM elements path from the highest parent to the clicked item
                while(DOMNode.parent().parent().attr('role') == 'treeitem') {
                    DOMNode = DOMNode.parent().parent();
                    DOMPath.push(DOMNode);
                }

                DOMPath = DOMPath.reverse();

                var nodeText, nodeInConfig = dconf, foundConf, headName = 'legend', path = [];
                var types = '', alwaysShow = [];

                // for each parent (and the clicked item)
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

                // for each type defined in the 'type' attribute
                for(var i = 0; i < types.length; i++) {
                    t[types[i].substr(0, types[i].indexOf(':'))] = types[i].substr(types[i].indexOf(':') + 1);
                }

                // unlink reference between confAttr and dconf
                confAttr = cloneObject(confAttr);

                // for each item in the 'always-show' attribute
                for(var i = 0; i < alwaysShow.length; i++) {
                    if(!isDefined(confAttr[alwaysShow[i]]))
                        confAttr[alwaysShow[i]] = '';
                }

                // for each attribute
                for(var i in confAttr) {
                    // if the attribute is not the 'type' attribute
                    // and if it's not a read-only attribute
                    if(confAttr.hasOwnProperty(i) && i !== 'type' && protect.indexOf(i) === -1) {
                    
                        type = t[i] || 'text';
                        typeName = type;

                        if(typeName.indexOf(':') !== -1)
                            typeName = typeName.substr(0, typeName.indexOf(':'));

                        type = type.substr(typeName.length + 1);

                        // create the input
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

                        // add the input to the settings div
                        panelRows.push($.create('div', {
                            class: 'form-group',
                            content: prompt
                        }));
                    }
                }

                // set the right panel content with the settings div
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

                            // get the input value
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

                            // create the JSON path
                            var path = userSettingsEditing.path.concat(['@attributes', $(node).attr('for')]);

                            if(hadError)
                                return;

                            // try to save the preferences
                            var serve = Shark.fs.serve('changePreferences', path.join('/'), val);

                            // if there was an error
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

                        // if there isn't error
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
            // when a folder is opened or close

            $('#' + data.node.a_attr.id).find('i')
                .toggleClass('fa-folder-o fa-folder-open-o');
        });

        // create the global editor content
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
            }),
            $.create('i', {
                class: 'fa fa-times'
            }).css({
                position: 'absolute',
                top: 5,
                right: 5
            }).click(function() {
                $('#settings').html('').hide();
            })
        ];

        // show the visual editor
        $('#settings').html(content).show();

    };

    // logout the current user
    this.logout = function() {

        // if can't logout the current user
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
            // redirect to the login page
            window.location.href = 'login.php';
        }

    };

    // perform a commit
    this.commit = function() {

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

    };

    this.autocompile = function(input) {

        for(var i in projectConfig.fileWatchers) {
            if(projectConfig.fileWatchers.hasOwnProperty(i)) {
                var watcher = projectConfig.fileWatchers[i];
                var input = watcher.input;

                if(watcher['input-type'] === 'path') {
                    input = '^' + input.escapeRegex().replace(/\\\*/g, '(.*)') + '$';
                } else if(watcher['input-type'] === 'regex') {
                    input = input;
                } else {
                    // unknwon input-type : can't compile file
                }

                input = new RegExp(input);
                if(input.test(savingFile.substr(projectDir.length + 6))) {
                    // this file has to be compiled
                    var output = savingFile.substr(projectDir.length + 6).replace(input, watcher.output.replace(/\$\{input\}/g, savingFile));
                    Studio.compile(savingFile, projectDir + 'files/' + output, watcher.compiler);
                }
            }
        }

    };

    // run a compiler on a file or a directory
    this.compile = function(input, output, compiler) {

        if(!Shark.fs.existsFile(input) && !Shark.fs.existsDirectory(input)) {
            return false;
        }

        if(!projectConfig.fileWatchers[compiler]) {
            return false;
        }

        this.setStatus('Compiling [' + compiler + ']' + input, true);

        var compilerPackage = projectConfig.fileWatchers[compiler].package;

        if(!Shark.fs.existsFile(input) && !compilerPackage.package.acceptDirectories) {
            $('#terminal-container').slideDown();
            $('#terminal').terminal().error(compiler + ' compiler doesn\'t support directories !');
        }

        window[compiler + '_compile_IO'] = {
            echo: function(text) {
                $('#terminal-container').slideDown(0);
                $('#terminal').terminal().echo('[' + this.compiler + '] ' + text);
            },

            error: function(text) {
                $('#terminal-container').slideDown(0);
                $('#terminal').terminal().error('[' + this.compiler + '] ' + text);
                Studio.setStatus('Failed to compiled [' + this.compiler + '] ' + this.input);
            },

            success: function() {
                Studio.setStatus('Compiled [' + this.compiler + '] ' + this.input);
            },

            input: input,
            inputExt: Shark.fs.getFileExtension(input).toLocaleLowerCase(),
            output: output,
            compiler: compiler,
            parameters: projectConfig.fileWatchers[compiler].parameters,

            read: function(name) {
                return projectConfig.fileWatchers[this.compiler].package.files[name];
            },

            get: function(name) {
                return projectConfig.fileWatchers[this.compiler].vars[name];
            },

            set: function(name, value) {
                projectConfig.fileWatchers[this.compiler].vars[name] = value;
            }
        };

        compileCode = 'function compile_' + compiler + '(IO) { ' + compilerPackage.compiler + ' } compile_' + compiler + '(' + compiler + '_compile_IO);';
        setTimeout(function() {
            window.eval(compileCode);
        }, 1000);

    };

    this.run = function(file, force) {

        if(!file)
            return false;

        var content = Shark.fs.readFile(file);

        if(!isDefined(content))
            return false;

        var source;

        switch(Shark.fs.getFileExtension(file).toLocaleLowerCase()) {

            case 'html':
            case 'htm':
                source = 'data:text/html;charset=utf-8,' + encodeURI(this.getFinalContent(content, 'html', file));
                break;

            case 'js':
                source = 'data:text/html;charset=utf-8,' + encodeURI('<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body></body><script type="text/javascript" charset="utf-8">' + this.getFinalContent(content, 'js', file) + '</script></html>')
                break;

            case 'ssa':
                willRunFile = file;
                bootbox.dialog({
                    title: 'SharkDev Script Agent Security',
                    message: '<h1>SharkDev Script Agent Security</h1>You have tried to run a SSA script. Before running it, please note that a script is allowed to create, read, write and delete all files that are in your account, including private and team projects. It can also delete your account.<br />You run the SSA scripts at your own risk !<br />Do you really want to run it ?',
                    buttons: {
                        'Continue (risked)': {
                            label: 'Continue (risked)',
                            className: 'btn-danger',
                            callback: function() {
                                swal({
                                    html: true,
                                    title: null,
                                    text: '<i class="fa fa-cog fa-spin fa-3x fa-fw margin-bottom" id="ssa-progress-cog"></i><br /><br />Running script...<br /><br /><div class="progress"><div id="ssa-progress" class="progress-bar progress-bar-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width:0%"></div></div><div id="ssa-progress-cmd"></div>'
                                });
                    
                                Shark.run(content, $('#terminal').terminal(), function(progress, cmd, nextCmd) {
                                    $('#ssa-progress').css('width', progress + '%');
                                    $('#ssa-progress-cmd').text(nextCmd);

                                    if(progress === 100) {
                                        $('#ssa-progress-cog').remove();
                                        $('#ssa-progress').parent().remove();
                                        $('#ssa-progress-cmd').text('Finished !');
                                    }
                                });
                            }
                        },
                        'Cancel (recommanded)': {
                            label: 'Cancel (recommanded)',
                            className: 'btn-success'
                        }
                    }
                });
                return ;
                break;

        }

        if(!source)
            return false;

        if(('sandbox' in document.createElement('iframe')) && !force && !alwaysForceRun) {
            willRunFile = file;

            return bootbox.dialog({
                title: 'Sandbox security',
                message: '<h1>Sandbox security</h1><p style="text-align:justify;">It seems that your browser doesn\'t support <code>sandbox</code> attribute for <code>iframe</code>.<br />This can cause security breach, runnable files can take control of your account, read, write and delete your files (not only this project), or delete your account.<br />Please note that you run files at your own risks.<br />If you are using scripts which you are not author, click on <code>Cancel</code> button.<br /><br />Do you really want to run this file ?</p>',
                buttons: {
                    'Continue (risked)': {
                        label: 'Continue (risked)',
                        className: 'btn-danger',
                        callback: function() {
                            Studio.run(willRunFile, true);
                        }
                    },
                    'Always allow run (risked)': {
                        label: 'Always allow run (risked)',
                        className: 'btn-danger',
                        callback: function() {
                            alwaysForceRun = true;
                            Studio.run(willRunFile, true);
                        }
                    },
                    'Cancel (recommanded)': {
                        label: 'Cancel (recommanded)',
                        className: 'btn-success'
                    }
                }
            });
        }

        $('#runner').replaceWith($.create('iframe', {
            src: source,
            id: 'runner',
            sandbox: 'allow-scripts'
        }));  

    };

};

Studio = new Studio();

var saveChanges;

editor.on('input', function() {

    // when a text is typed in the editor, then the current file has been edited
    Studio.refreshChanges(true);
    clearTimeout(saveChanges);
    saveChanges = setTimeout(function() {
        Studio.saveFile();
    }, 1000);

});

/* Keyboard events */

var savingFile;

// save current file
editor.commands.addCommand({
    name: 'save',
    bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
    exec: function(editor) {
        Studio.saveFile();
        return false;
    }
});

// close current file
editor.commands.addCommand({
    name: 'close',
    bindKey: {win: 'Ctrl-Q', mac: 'Command-Q'},
    exec: function(editor) {
        console.log('close keyboard shortcut');
        Studio.closeActiveFile();
        return false;
    }
});

// distraction free mode
var dfmEnabled = false;
editor.commands.addCommand({
    name: 'distractionFreeMode',
    bindKey: {win: 'Ctrl-I', mac: 'Command-I'},
    exec: function(editor) {
        $('#menu, #panel')[dfmEnabled ? 'fadeIn' : 'fadeOut'](1000);
        dfmEnabled = !dfmEnabled;
        return false;
    }
});

// open/close the terminal
var consoleOpened = false;
editor.commands.addCommand({
    name: 'terminal',
    bindKey: {win: 'F2', mac: 'F2'},
    exec: function(editor) {
        $('#terminal-container').toggle();
        return false;
    }
});

// perform a commit
editor.commands.addCommand({
    name: 'commit',
    bindKey: {win: 'Ctrl-K', mac: 'Command-K'},
    exec: Studio.commit
})

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
        /*Settings: ['fa fa-wrench', function() {
            Studio.projectSettings();
        }],

        A: 'sep',*/

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

    Run: ['fa fa-play', {
        Run: ['fa fa-play-circle', function() {

            Studio.run(Studio.getActiveFile());

        }],

        Stop: ['fa fa-stop', function() {

            $('#runner').replaceWith($.create('div',{id:'runner'},{display:'none'}));

        }]

    }],

    Terminal: ['fa fa-terminal', {
        Show: ['fa fa-eye', function() {
            $('#terminal-container').show();
        }],
        Hide: ['fa fa-eye-slash', function() {
            $('#terminal-container').hide();
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
        Commit: ['fa fa-check', Studio.commit],

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

    Account: ['fa fa-user', {
        Preferences: ['fa fa-wrench', function() {
            Studio.userSettings();
        }],
        
        A: 'sep',

        Logout: ['fa fa-sign-out', function() {
            Studio.logout();
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
            if(!isArray(menu[i][1][j])) {
                if(menu[i][1][j] === 'sep') {
                    items.push($.create('li', {
                        role: 'separator',
                        class: 'divider'
                    }))
                } else {
                    items.push($.create('li', {
                        class: 'dropdown-header',
                        content: menu[i][1][j]
                    }));
                }
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
    $('#terminal-container').toggle();
});

$('#terminal-tools button[action="clear"]').click(function() {
    $('#terminal').terminal().clear();
});

var panelRefresh;
var panelRefreshCallback = function() {
    if(projectDir)
        Studio.refreshPanel(projectDir.substr(0, projectDir.length - 1));
}

$(window).on('load', function() {
    
    if(loadProject) {
        Studio.refreshPanel(request.project);
        Shark.fs.chdir(projectDir + 'files');
    } else {    
        window.panelRefreshCallback();
    }

    window.panelRefresh = setInterval(window.panelRefreshCallback, 1000);

});

if(!request.commit) {
    var script = Shark.fs.readFile('/startup.ssa');

    if(script)
        Shark.run(script, $('#terminal').terminal());
}

console.info('SharkDev ' + (request.commit ? 'Commit Viewer' : 'Studio') + ' is ready to work !');

Studio.setStatus('SharkDev ' + (request.commit ? 'Commit Viewer' : 'Studio') + ' is ready to work !');
