

function checkForFalsePositives(VTData){
    console.log('Verificando falso positivo de ' +VTData.length + ' elementos') 
    var VTDataFiltered = VTData.filter((item) => item.positives > 15)
    
    console.log('Filtrado: ' + VTDataFiltered.length + ' elementos');

    return VTDataFiltered;
}

var fs = require("fs");

var VTData = fs.readFileSync('data.json');
VTData = JSON.parse(VTData);

var VTDataFiltered = null;
VTDataFiltered = checkForFalsePositives(VTData);
var jsonToXls = [];

jsonToXls = VTDataFiltered.map((item) => {
    return {
        "virusTotalLink": item.permalink,
        "positivos": item.positives,
        "md5": item.md5,
        "sha1": item.sha1,
        "sha256": item.sha256
    }
})

var json2xls = require('json2xls');

var xls = json2xls(jsonToXls);
fs.writeFileSync('hashesXls.xlsx', xls, 'binary');