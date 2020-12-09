const { MongoService } = require('./mongo-service');
const { MispWarnImporter } = require('../misp-warn-importer');

class MispService {

    constructor(){}

    async init(opts = {}){
        try{
            this.mongoService = new MongoService();
            await this.mongoService.connect();

            if(opts.drop && await this.collectionMispExists()){
                console.log('Misp collection dropped');
                await this.mongoService.getDb().collection('misp').drop();
            }
            
            if(await this.collectionMispExists() || opts.forceUpdate){
                console.log('Misp collection encontrado!');
            }else{
                console.log('Misp collection no existe...');
                let mispImporter = new MispWarnImporter('E:\\tools\\misp-warninglists');
                console.log('data importing...');
                let data = mispImporter.import();
                console.log('data imported!\nsaving data');
                for(let item in data){
                    await this.mongoService.getDb().collection('misp').insertOne(data[item]);
                }
                console.log('data saved!');
            }
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

    async findIPAddr(ip){
        let found = await this.mongoService.getDb().collection('misp').find({'list': `${ip}`}).toArray();
        found.forEach((_) => console.log(_.name));
        console.log(`found in ${found.length} records`)
    }

    async findDomain(domain){
        let found = await this.mongoService.getDb().collection('misp').find({'list': {$regex: `.*${domain}.*`}}).toArray();
        found.forEach((_) => console.log(_.name));
        console.log(`found in ${found.length} records`)
    }

    getMongoService(){
        return this.mongoService;
    }
}

module.exports = new MispService();

async function main(){
    let misp = new MispService();
    await misp.init({drop: true});
    await misp.findIPAddr('8.8.8.8');
    await misp.findDomain('facebook.com');
    await misp.getMongoService().client.close();
    
}

if(require.main === module){
    try{
        main();
    }catch(err){
        console.error(err);
    }
}