const { MispWarnImporter } = require("../misp-warn-importer");


class LocalService {

    constructor(){
        this.mispLists = undefined;
    }

    init(opts = {}){
        if(!('mispPath' in opts))
            opts['mispPath'] = 'E:\\tools\\misp-warninglists';

        let mispImporter = new MispWarnImporter(opts['mispPath']);
        this.mispLists = mispImporter.import(false);
    }

    _searchInMispList(item){
        let result = {
            found : false,
            why: []
        }

        for(let mispIdx in this.mispLists){
            let list = this.mispLists[mispIdx];

            for(idxList in list){
                let element = list[idxList];

                if(element.includes(item)){
                    result.found = true;
                    result.why
                }
            }
        }
    }

    _getListByName(){}
}

module.exports = new LocalService();

async function main(){

}

if(require.main === module){
    try{
        main();
    }catch(err){
        console.error(err);
    }
}