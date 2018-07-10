let exec = require('child_process').exec;
exec('tsc',(error,stdout,stderr)=>{
    console.log(`tsc====>stdout: ${stdout}`);
    console.log(`tsc====>stderr: ${stderr}`);
    if (error !== null) {
        console.log(`exec error: ${error}`);
    }
});

exec('node dev-env/http-server.js',(error,stdout,stderr)=>{
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    if (error !== null) {
        console.log(`exec error: ${error}`);
    }
});
