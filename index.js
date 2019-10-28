var fs = require("fs");
var virusTotalApi = require('node-virustotal');

function getConf() {
    var confData = fs.readFileSync('./conf.json');

    return JSON.parse(confData);
}

//Return hashList
function readHashFile(url) {
    var type = undefined;

    if (url.endsWith('txt')) {
        type = 'txt';
    } else if (url.endsWith('json')) {
        type = 'json';
    } else {
        return null;
    }

    var contentFile = fs.readFileSync(url);

    if (type == 'txt') {

    } else {
        return JSON.parse(contentFile);
    }
}

//Remove dupilcate
function removeDuplicates(hashList) {
    return hashList.filter((item, index, self) => {
        return index === self.indexOf(item);
    });
}

function getVTData(vtapi, hashList, outputDataFileName = 'vtdata.json') {
    var jsonData = [];

    return new Promise((ok, err) => {
        var promises = []
        hashList.forEach(hash => {
            promises.push(
                new Promise((nice, oh) => {
                    vtapi.getFileReport(hash, (data) => {
                        console.log('datos guardados de ' + data.md5);
                        jsonData.push(data);

                        fs.writeFile(outputDataFileName, JSON.stringify(jsonData), 'utf8',
                            onError => {
                                oh(onError);
                                if (onError) console.log(onError);
                            });

                        nice(data);
                    }, (vterr) => oh(vterr));
                })
            );
        });

        Promise.all(promises).then((okay) => ok(okay), (error) => err(error));
    });
}

function main() {
    var fileUrl = process.argv[2];

    console.log('loading hashes from [' + fileUrl + ']');

    var hashList = readHashFile(fileUrl);
    hashList = removeDuplicates(hashList);

    console.log('checking for ' + hashList.length + ' hashes.');

    var conf = getConf();

    var vtapi = virusTotalApi.MakePublicConnection();
    vtapi.setKey(conf.virusTotalKey);
    vtapi.setDelay(15000);

    getVTData(vtapi, hashList, 'vtdata.json').then(() => {
        console.log('ready!');
    }).catch((err) => console.log(err));
}

main();