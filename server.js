const express=require('express');
const http=require('http');
const socketIo=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=socketIo(server);
const port=3000;
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
var fs = require('fs');

const PATH='C:/Users/admin/Desktop/Browserstack/logfile.log'

app.get('/', async(req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
function watchLogfile(socket){
    let files;
    let lastSize=0;

    getlastline=(n)=>{
        const data=fs.readFileSync(PATH,'utf8');
        return data.split('\n').slice(-n);
    };
    sendLastLine=()=>{
        const data=getlastline(10);
        socket.emit('logUpdate',data);
    }
    const startWatching=()=>{
        files=fs.openSync(PATH,'r');
        lastSize=fs.statSync(PATH).size;
        fs.watch(PATH,(event)=>{
           
            if(event=='change'){
                const currentSize=fs.statSync(PATH).size;
                if(currentSize>lastSize){
                    const bufferSize=currentSize-lastSize;
                    const buffer  =Buffer.alloc(bufferSize);
                    fs.readSync(files,buffer,0,bufferSize,lastSize);
                    socket.emit('logUpdate',buffer.toString());
                    lastSize=currentSize;
                }
            }

        })

    }
    sendLastLine();
    startWatching();
}
io.on('connection',(socket)=>{
    watchLogfile(socket)
})

server.listen(port,()=>{
    console.log('listening');
})
