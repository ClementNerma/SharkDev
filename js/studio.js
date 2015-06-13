
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

var projectDir, contextMenuPath;

$('noscript').remove();
$('#projects').modal({keyboard:false}).modal('hide');

var dconf = server('user', {
    data: {
        do: 'get-preferences'
    },
    async: false
}).responseText;

try {
    dconf = JSON.parse(dconf);
}

catch(e) {
    bootbox.dialog({
        message: 'Can\'t connect to server - Can\'t get preferences',
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
        c = dconf.files.type[i]['@attributes'];
        config.fileTypes[c['extension']] = c;
        delete c['extension'];
    }
}

for(var i in dconf.editor.native.param) {
    if(dconf.editor.native.param.hasOwnProperty(i)) {
        c = dconf.editor.native.param[i]['@attributes'];
        if(c['value'] === 'true') c['value'] = true;
        if(c['value'] === 'false') c['value'] = false;
        config.editor.native[c['name']] = c['value'];
    }
}

for(var i in dconf.editor.param) {
    if(dconf.editor.param.hasOwnProperty(i)) {
        c = dconf.editor.param[i]['@attributes'];
        if(c['value'] === 'true') c['value'] = true;
        if(c['value'] === 'false') c['value'] = false;
        config.editor[c['name']] = c['value'];
    }
}

for(var i in dconf.studio.param) {
    if(dconf.studio.param.hasOwnProperty(i)) {
        c = dconf.studio.param[i]['@attributes'];
        if(c['value'] === 'true') c['value'] = true;
        if(c['value'] === 'false') c['value'] = false;
        config.studio[c['name']] = c['value'];
    }
}

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

server('user', {
    data: {
        do: 'get-projects'
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

            projectDir = type + '/' + name + '/';

            server('user', {
                data: {
                    do: 'get-project',
                    path: projectDir
                },
                success: function(data) {
                    try {
                        data = JSON.parse(data);
                    }

                    catch(e) {
                        this.error(this);
                    }

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
                                    //final.push(i);
                                    final.push({
                                        text: i,
                                        icon: 'fa fa-file-o'
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
                    if(config.studio['panelWholerow'])
                        plugins.push('wholerow');

                    $('#panel').jstree({
                        core: {
                            data: recurse(data),
                            check_callback: true
                        },
                        plugins: plugins,
                        contextmenu: {
                            items: function($node) {
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
                                                        bootbox.prompt('New HTML file name ?', function(fileName) {
                                                            if(fileName) {
                                                                Studio.createFile(contextMenuPath, ((fileName.substr(-5) === '.html' || fileName.substr(-4) === '.htm') ? fileName : fileName + '.html'));
                                                            } else {
                                                                Studio.createFile(contextMenuPath, 'Untitled.html');
                                                            }
                                                        })
                                                    }
                                                },
                                                CSS: {
                                                    label: 'CSS',
                                                    action: function() {
                                                        bootbox.prompt('New CSS file name ?', function(fileName) {
                                                            if(fileName) {
                                                                Studio.createFile(contextMenuPath, (fileName.substr(-4) === '.css' ? fileName : fileName + '.css'));
                                                            } else {
                                                                Studio.createFile(contextMenuPath, 'Untitled.css');
                                                            }
                                                        })
                                                    }
                                                },
                                                JavaScript: {
                                                    label: 'JavaScript',
                                                    action: function() {
                                                        bootbox.prompt('New JavaScript file name ?', function(fileName) {
                                                            if(fileName) {
                                                                Studio.createFile(contextMenuPath, (fileName.substr(-3) === '.js' ? fileName : fileName + '.js'));
                                                            } else {
                                                                Studio.createFile(contextMenuPath, 'Untitled.js');
                                                            }
                                                        })
                                                    }
                                                },
                                                JSON: {
                                                    label: 'JSON',
                                                    action: function() {
                                                        bootbox.prompt('New JSON file name ?', function(fileName) {
                                                            if(fileName) {
                                                                Studio.createFile(contextMenuPath, (fileName.substr(-5) === '.json' ? fileName : fileName + '.json'));
                                                            } else {
                                                                Studio.createFile(contextMenuPath, 'Untitled.json');
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                        },
                                        Rename: {
                                            label: 'Rename'
                                        },
                                        Delete: {
                                            label: 'Delete'
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
                            Studio.openFile(projectDir + p[i]);
                        }

                    }).on('before_open.jstree close_node.jstree', function(e, data) {
                        $('#' + data.node.a_attr.id).find('i')
                            .toggleClass('fa-folder-o fa-folder-open-o');
                    });

                    $('#projects').modal('hide');
                },
                error: function(err) {
                    bootbox.dialog({
                        message: 'Can\'t connect to server',
                        title: 'Server error',
                        buttons: {
                            OK: {
                                label: 'OK',
                                className: 'btn btn-default'
                            }
                        }
                    });
                }
            });
        });

        $('#projects').modal('show');
    },
    error: function(err) {
        $('#projects .modal-body').text('Can\'t connect to server ' + (err.statusCode ? 'status code : ' + err.statusCode + ')' : '')).addClass('text-danger');
        $('#projects').modal('show');
    }
});

/* Studio class */

var edits = {};

var Studio = function() {

    this.setReadyFor = function(path) {
        var name = path.split('/')[path.split('/').length - 1];

        var type = config.fileTypes[name.split('.')[name.split('.').length - 1]] || config.fileTypes['@default'];

        editor.getSession().setMode('ace/mode/' + type.mode);
        editor.setOptions(type.editor || {});
    }

    this.createFile = function(dir, name, content) {

        var activeFile = this.getActiveFile();

        if(activeFile)
            edits[activeFile] = editor.getSession();

        var path = dir + '/' + name;

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
                            data: path,
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

    this.openFile = function(path) {

        if(!Shark.fs.existsFile(path)) {
            return false;
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

};

Studio = new Studio();

/* Keyboard events */

var savingFile;

editor.commands.addCommand({
    name: 'save',
    bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
    exec: function(editor) {
        savingFile = Studio.getActiveFile();
        server('user', {
            data: {
                do: 'writeFile',
                path: savingFile,
                content: editor.getSession().getValue()
            },
            success: function(ans) {
                if(ans === 'true')
                    console.log('saved : ' + savingFile);
                else
                    this.error({responseText:ans});
            },
            error: function(err) {
                console.error('cannot save : ' + savingFile + ' (server said : ' + err.responseText + ')');
            }
        })
    }
});

editor.commands.addCommand({
    name: 'close',
    bindKey: {win: 'CtrlQ', mac: 'Command-Q'},
    exec: function(editor) {
        console.log('close');
    }
});
