const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/?readPreference=primary&appname=vtools&ssl=false&useUnifiedTopology=true';

exports.MongoService = class{

    constructor(){
        this.client = new MongoClient(uri);
    }

    async connect(){
        try{
            await this.client.connect();
        }catch(err){
            console.error(err);
        }
    }

    getDb(){
        if(!this.client.isConnected())
            return undefined; //TODO: manejo de errores
        return this.client.db('vtools');
    }

}

if(require.main === module){
    new this.MongoService().connect();
}