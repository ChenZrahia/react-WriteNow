var serverSrv = require('./Services/serverSrv');

export function WriteError(stackTrace, e){
    try{
        var isOk = false;
        serverSrv.socket.on('WriteErrorOk', function(){
            isOk = true;
        });
        if(!e){
            console.log("error handlre - e is undefined", stackTrace);
            return;
        }


        var msg = e.message || e;
        console.log(msg, stackTrace);
        serverSrv.socket.emit('WriteError',  msg, stackTrace);
        setTimeout(() => {
            if(isOk == false){
                // try{
                // window.db.transaction(function (tx) {
                //     tx.executeSql('CREATE TABLE IF NOT EXISTS Errors (message, stackTrace, timeOfError)');
                //     tx.executeSql('INSERT INTO Errors VALUES (?,?,?)', [msg, stackTrace, new Date()]);
                // }, function (error) {
                // }, function () {
                // });
                // }catch(e){}
            }
        }, 3000);
    }
    catch(e){
        console.log(e);
    }
}