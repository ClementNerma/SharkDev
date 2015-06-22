
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
