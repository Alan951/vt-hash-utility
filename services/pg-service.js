const { Client } = require('pg')
const { Utils } = require('../utils');

exports.PgService = class {
    client = undefined;


    constructor(){
        
    }

    async connect(){
        try{
            let db_conf = Utils.getConf().pg_db;
        
            this.client = new Client(db_conf);
            await this.client.connect();

            //await this.client.query('SET SCHEMA IntelTools');

            return this.client;
        }catch(err) {
            console.error("Error al conectarse a la base de datos", err);
        }
    }

    async disconnect(){
        await this.client.end()
    }

    getDb() {
        return this.client;
    }
}

