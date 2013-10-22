var child_process = require('child_process');
var pid;
var server = 'server.js';

start(server);
function start(nodefile) {
    if (typeof nodefile !== 'string') {
        console.log('Has none file. like this: start("app.js")');
        return;
    }

    console.log('Master process is running.');

    var proc = child_process.spawn('node', [nodefile]);
    pid = proc.pid;
    proc.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    proc.stderr.on('data', function (data) {
        console.log(data.toString());
    });

    // 监测退出事件，删除原进程并重启新进程
    proc.on('exit', function (code) {
        console.log('child process exited with code ' + code);
        delete(proc);
        setTimeout(function(){start(server); }, 5000);
    });
}