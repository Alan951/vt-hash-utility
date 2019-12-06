const linereader = require('readline');
const fs = require('fs');


exports.Utils = class {
    static getConf() {
        var confData = fs.readFileSync('./conf.json');
    
        return JSON.parse(confData);
    }

    //Remove dupilcate
    static removeDuplicates(hashList) {
        return hashList.filter((item, index, self) => {
            return index === self.indexOf(item);
        });
    }

    static readHashFile(url) {
        return new Promise((ok, err) => {
            var type = undefined;
    
            if (url.endsWith('txt')) {
                type = 'txt';
            } else if (url.endsWith('json')) {
                type = 'json';
            } else {
                return null;
            }
    
            if (type == 'txt') {
                let hashes = [];
    
                var lineReader = linereader.createInterface({
                    input: fs.createReadStream(url)
                });
    
                lineReader.on('line', (line) => {
                    hashes.push(line);
                });
    
                lineReader.on('close', () => {
                    ok(hashes);
                });
    
            } else {
                var contentFile = fs.readFileSync(url);
                ok(JSON.parse(contentFile));
            }
        });
        
    }
}