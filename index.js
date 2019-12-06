var fs = require("fs");
var virusTotalApi = require('node-virustotal');
const { Utils } = require('./utils');


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

async function main() {
    var fileUrl = process.argv[2];

    console.log('loading hashes from [' + fileUrl + ']');

    var hashList = await Utils.readHashFile(fileUrl);
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