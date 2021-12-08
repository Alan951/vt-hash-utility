const linereader = require('readline');
const fs = require('fs');
const { RSA_NO_PADDING } = require('constants');


exports.Utils = class {
    static getConf() {
        var confData = fs.readFileSync('./conf.json');
    
        return JSON.parse(confData);
    }

    static divideArray(list){
        let templist = list;
        let h = Math.round(templist.length / 2);
        let part1 = templist.slice(0, h);
        let part2 = templist.slice(h);

        return [part1, part2];
    }

    //Remove dupilcate
    static removeDuplicates(hashList) {
        return hashList.filter((item, index, self) => {
            return index === self.indexOf(item);
        });
    }

    static truncHash(hash){
        if(hash.length > 7){
            return hash.substring(0,3) + "..." + hash.substring(hash.length - 3, hash.length);
        }else{
            return hash;
        }
    }

    static trunc(str, max = 14){
        if(max != undefined && str != undefined && str.length > max){
            return str.substring(0, max) + "...";
        }else{
            return undefined;
        }
    }

    static async readHashFile(file) {
        return new Promise((ok, err) => {
            var type = undefined;

            try{
                fs.existsSync(file);    
            }catch(noExists){
                err(noExists);
            }
            

            type = file.endsWith('json') ? 'json' : 'txt';
    
            if (type == 'txt') {
                let hashes = [];
    
                var lineReader = linereader.createInterface({
                    input: fs.createReadStream(file)
                });
    
                lineReader.on('line', (line) => {
                    hashes.push(line.trim());
                });
    
                lineReader.on('close', () => {
                    ok(hashes);
                });
    
            } else {
                var contentFile = fs.readFileSync(file);
                ok(JSON.parse(contentFile));
            }
        });
        
    }

    static dateToStr(date){
        

        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "T" +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    }

    static getDateTimeStr(){
        let date = new Date();
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "T" +  date.getHours() + " " + date.getMinutes() + " " + date.getSeconds();
    }

    static timestampToDateStr(timestamp){
        const dtFormat = new Intl.DateTimeFormat('es-MX', {
            timeZone: 'UTC',
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false,
        })

        return dtFormat.format(new Date(timestamp * 1e3));

        
    }
}