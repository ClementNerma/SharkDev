
if(this.all[0] === 'use') {
    if(!this.all[1]) {
        _vcsCommit = false;
        this.echo('Deleted commit switch');
    } else {
        _vcsCommit = this.all[1];
        this.echo('Switched to commit : ' + _vcsCommit);
        return;
    }
}

if(!_vcsCommit && !isString(this.argument('c', 'commit')))
    return this.error('Missing commit ID');

if(!this.all[0])
    return this.error('Missing action');

var dir = 'commit:' + projectDir.substr(1, projectDir.length - 2) + '@' + (this.argument('c', 'commit') || _vcsCommit) + '|';

switch(this.all[0]) {

    case 'read':
        if(!this.all[1]) {
            return this.error('Missing file name');
        }

        if(!this.argument('f', 'from-root')) {
            this.all[1] = 'files/' + this.all[1];
        }

        var content = Shark.fs.readFile(dir + this.all[1]);

        if(!isDefined(content))
            this.error(lastError);
        else
            this.echo(content.replace(/\[\[(.*?)\](.*?)\]/g, '$2'));

        break;

    case 'ls':
        if(!this.all[1]) {
            this.all[1] = '';
        }

        if(!this.argument('f', 'from-root')) {
            this.all[1] = 'files/' + this.all[1];
        }

        var d = Shark.fs.readDirectory(dir + this.all[1], isDefined(this.argument('r', 'recursively')));

        if(!d) {
            this.error(lastError);
        } else {
            if(d.length)
                this.echo(d.join('\n').replace(/\[\[(.*?)\](.*?)\]/g, '$2'));
        }

        break;

    default:
        this.error('Unknown action : ' + this.all[0]);
        break;
}