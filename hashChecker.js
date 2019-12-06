const { Utils } = require('./utils');
const fs = require('fs');
var virusTotalApi = require('node-virustotal');

if (!process.argv[2]) {
    console.log("[!] Debes de especificar la ruta de un archivo con extensión .txt que contiene la lista de hashes.!");
    process.exit(1);
}

let fileOutXls = 'out.xls';

if(!process.argv[3]){
    console.log("[*] El segundo argumento no fue especificado, el archivo de salida se llamara \"out.xls\"");
}else{
    fileOutXls = process.argv[3];
}

const FILE_URL = process.argv[2];

try {
    fs.existsSync(FILE_URL);
} catch (e) {
    console.log("[!] El archivo especificado no fue encontrado");
    process.exit(1);
}

let conf = Utils.getConf();

let vtApi = virusTotalApi.MakePublicConnection();
vtApi.setKey(conf.virusTotalKey);
vtApi.setDelay(15000);

main();

async function main() {
    console.log(`[*] Leyendo lista de hashes ${FILE_URL}`);

    let hashList = await Utils.readHashFile(FILE_URL);

    console.log(`[*] ${hashList.length} hashes cargados`);

    let reports = await checkHashes(hashList);

    console.log('[!] Exportando información en ' + fileOutXls);

    let json2xls = require('json2xls');

    let xls = json2xls(reports)

    fs.writeFileSync(fileOutXls, xls, 'binary');

    console.log('[!] Reporte exportado...');
    console.log('Baigon!');

}

async function checkHashes(hashList) {
    return new Promise((nice, bad) => {
        return new Promise((ok, err) => {
            Promise.all(generatePromises(hashList)).then((data) => {
                console.log('[!] Reportes descargados');
                nice(data);
            });
        })
    });
}

function generatePromises(hashList) {
    let promises = [];

    hashList.forEach((hash, index) => {
        promises.push(new Promise((ok, err) => {
            vtApi.getFileReport(hash, (report) => {
                console.log(`[*] Consultando reporte de VT... ${index}/${hashList.length - 1}`);
                let goldData = {
                    positivos: report.positives,
                    negativos: report.total - report.positives,
                    total: report.total,
                    mcAfeeDetected: false,
                    mcAfeGWEditionDetected: false,
                    result: undefined,
                    md5: report.md5,
                    sha256: report.sha256,
                    sha1: report.sha1,
                    vtLink: report.permalink
                }
        
                if(report.scans['McAfee-GW-Edition']){
                    goldData.mcAfeGWEditionDetected = report.scans['McAfee-GW-Edition'].detected;
                    goldData.result = report.scans['McAfee-GW-Edition'].result;
                }else{
                    goldData.mcAfeGWEditionDetected = '404'
                }
        
                if(report.scans['McAfee']){
                    goldData.mcAfeeDetected = report.scans.McAfee.detected;
                    goldData.result = report.scans.McAfee.result;
                }else{
                    goldData.mcAfeeDetected = '404';
                }
        
                //McAfee-GW-Edition || McAfee
        
                ok(goldData);
            }, errReq => {
                ok(undefined);
            });
        }))
    });

    return promises;
    
}