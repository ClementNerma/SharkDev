
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