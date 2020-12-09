const { MongoService } = require('./mongo-service');
const { MispWarnImporter } = require('../misp-warn-importer');

class MispService {

    constructor(){}

    async init(){
        try{
            this.mongoService = new MongoService();
            await this.mongoService.connect();
            
            if(await this.collectionMispExists()){
                console.log('Misp collection encontrado!');
                this.mongoService.getDb().collection('misp').drop();
            }
            console.log('Misp collection no existe...');
            let mispImporter = new MispWarnImporter('E:\\tools\\misp-warninglists');
            console.log('data importing...');
            let data = mispImporter.import();
            console.log('data imported!\nsaving data');
            console.log(data.length);
            for(let item in data){
                await this.mongoService.getDb().collection('misp').insertOne(data[item]);
            }
            console.log('data saved!');
                
            
        }catch(err){
            console.log(err);
        }
    }

    async collectionMispExists(){
        let collections = await this.mongoService.getDb().listCollections().toArray()
        if(collections.length == 0){
            return false;
        }else{
            for(let idx in collections){
                if(collections[idx].name == 'misp')
                    return true;
            }
        }

        return false;
    }

    async getMongoService(){
        return this.mongoService;
    }

}

module.exports = new MispService();

async function main(){
    let misp = new MispService();
    await misp.init();
    (await misp.getMongoService()).client.close();
}

if(require.main === module){
    try{
        main();
    }catch(err){
        console.error(err);
    }
}