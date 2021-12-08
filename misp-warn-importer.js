const fs = require('fs');
const path = require('path');
const sizeof = require('object-sizeof');
const { Utils } = require('./utils');

exports.MispWarnImporter = class {

    constructor(mispPathFolder){
        if(mispPathFolder == undefined)
            throw new Error('MispPathFolder missing');
        //misp-warninglists\lists
        this.mispPathFolder = mispPathFolder;
        this.listPathFolder = mispPathFolder + path.sep + 'lists';
    }

    import(){
        let lists = this._dump(this.searchFiles());

        return lists;
    }

    _searchFiles(file, founds = undefined){
        if(founds == undefined)
            founds = [];

        let type = fs.lstatSync(file);

        if(type.isDirectory()){
            let dirname = file;
            let files = fs.readdirSync(file, {withFileTypes: true});

            for(let x = 0 ; x < files.length ; x++){
                this._searchFiles(dirname + path.sep + files[x].name, founds)
            }
        }else{
            if(file.endsWith('.json')){
                founds.push(file);
            }   
        }

        return founds;
    }

    searchFiles(){
        return this._searchFiles(this.listPathFolder);
    }

    _dump(files){
        if(files.length == 0){
            console.error('No se encontraron listas');
            return;
        }

        let read = (path) => {
            let data = fs.readFileSync(path);
            data = JSON.parse(data);
            return data;
        }

        let lists = [];

        for(let idx in files){
            let json = read(files[idx])
            lists.push(json);
        }

        console.log('lists loaded: ' + lists.length);
        return lists;
    }
}

if(require.main === module){
    let importer = new this.MispWarnImporter('E:\\tools\\misp-warninglists')
    let lists = importer.import();
    lists.forEach(list => console.log(list['name'] + ' - ' + list['list'].length))
}