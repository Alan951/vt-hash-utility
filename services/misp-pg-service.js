const { MispWarnImporter } = require('../misp-warn-importer')
const { PgService } = require('./pg-service')

class MispPgService {
    constructor(){}

    async init(opts = {}){
        console.log('MispPgService init...')

        // comprobar que la estructura de la base de datos se encuentre lista


        this.service = new PgService();
        
        this.client = await this.service.connect();
    }

    async addMisp(mispwarn) {
        const query = {
            text: "INSERT INTO mispwarn VALUES ($1, $2, $3) RETURNING *",
            values: [mispwarn.name, mispwarn.description, mispwarn.type]
        }

        try{
            let result = await this.client.query(query);
            return result.rows[0];
        }catch(err){
            console.log("Error al registrar misp_info", err);
        }
    }

    async addMispEntry(mispwarn, mispwarn_entry) {
        const query = {
            text: "INSERT INTO mispwarn_list (id_mispwarn_fk, value, type) VALUES ($1, $2, $3) RETURNING *",
            values: [
                mispwarn.id, mispwarn_entry.value, mispwarn_entry.type
            ]
        }

        try{
            let result = await this.client.query(query);
            return result.rows[0];
        }catch(err){
            console.log('Error al registrar misp_entry', err);
        }
    }

    async findMisp() {

    }
}

module.exports = new MispPgService()

async function main(){
    let misp = new MispPgService();
    await misp.init({});
    r = await misp.addMisp({
        name: "test",
        description: "more test",
        type: "more more test"
    });

    console.log(r);

    r = await misp.addMispEntry(r, {
        value: "val",
        type: "val_type"
    });

    console.log(r)

    await misp.service.disconnect();

}

if(require.main === module){
    try{
        main();
    } catch(err) {
        console.error(err)
    }
}