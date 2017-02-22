var serverSrv = require('./Services/serverSrv');

export function WriteError(stackTrace, e){
    try{
        var isOk = false;
        serverSrv.socket.on('WriteErrorOk', function(){
            isOk = true;
        });

        console.log(e.message, stackTrace);
        serverSrv.socket.emit('WriteError',  e.message, stackTrace);
        setTimeout(() => {
            if(isOk == false){
                // try{
                // window.db.transaction(function (tx) {
                //     tx.executeSql('CREATE TABLE IF NOT EXISTS Errors (message, stackTrace, timeOfError)');
                //     tx.executeSql('INSERT INTO Errors VALUES (?,?,?)', [e.message, stackTrace, new Date()]);
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