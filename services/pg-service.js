const { Client } = require('pg');
const { Pool } = require('pg/lib');
const { Utils } = require('../utils');

exports.PgService = class {
    client = undefined;


    constructor(){
        
    }

    async connect(){
        try{
            let db_conf = Utils.getConf().pg_db;
        
            //this.client = new Client(db_conf);
            this.pool = new Pool(db_conf);
            this.client = await this.pool.connect();
            await this.client.query("SET search_path TO 'IntelTools';");

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

