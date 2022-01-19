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

    async findIoC(ioc) {

    }
}

module.exports = new MispPgService()

async function main(){
    let misp = new MispPgService();
    await misp.init({});

    let importer = new MispWarnImporter('C:\\Users\\Jorge Alan\\tools\\misp-warninglists');
    let lists = importer.import();
    try{
        await misp.client.query('BEGIN');

        for(let item in lists){
            item = lists[item]

            r = await misp.addMisp({
                name: item.name,
                type: item.type,
                description: item.description
            });

            console.log(r.name + ' added...')

            for(let entry in item.list){
                entry = item.list[entry];

                rEntry = await misp.addMispEntry(r, {
                    value: entry,
                    id_mispwarn_fk: r.id
                })
            }
        }
    }catch(err){
        console.log('Error: ' + err);
        await misp.client.query("ROLLBACK");
    }finally{
        try{
            await misp.client.query("COMMIT");
            await misp.client.release()
            console.log('Connection released...')
        }catch(err){
            console.log('Error: ' + err);
        }
    }

    /*    
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
    */

    await misp.service.disconnect();

}

if(require.main === module){
    try{
        main();
    } catch(err) {
        console.error(err)
    }
}