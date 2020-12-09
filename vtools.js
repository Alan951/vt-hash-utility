const { ArgumentParser, SUPPRESS, Action } = require('argparse');
const { version } = require('./package.json')
const { HashChecker } = require('./hash-checker');
const { Utils } = require('./utils');
const cliff = require('cliff');
const fs = require('fs');
const { Parser } = require('json2csv');

//process.removeAllListeners('warning');

const banner = `
██╗░░░██╗████████╗░░░░░░████████╗░█████╗░░█████╗░██╗░░░░░░██████╗
██║░░░██║╚══██╔══╝░░░░░░╚══██╔══╝██╔══██╗██╔══██╗██║░░░░░██╔════╝
╚██╗░██╔╝░░░██║░░░█████╗░░░██║░░░██║░░██║██║░░██║██║░░░░░╚█████╗░
░╚████╔╝░░░░██║░░░╚════╝░░░██║░░░██║░░██║██║░░██║██║░░░░░░╚═══██╗
░░╚██╔╝░░░░░██║░░░░░░░░░░░░██║░░░╚█████╔╝╚█████╔╝███████╗██████╔╝
░░░╚═╝░░░░░░╚═╝░░░░░░░░░░░░╚═╝░░░░╚════╝░░╚════╝░╚══════╝╚═════╝░
                                                By @Alan951 ${version}
`;

const parser = new ArgumentParser();

class ListArgAction extends Action {
    constructor(opts) {
        super(opts);
    }

    call(arg, namespace, values, optionString) {
        namespace[this.dest] = values.join(',').split(',').filter(val => { return val != null && val != undefined && val != '' });
    }
}

class OutputAction extends Action {
    constructor(opts) {
        super(opts);
    }

    call(arg, namespace, val, optionString) {
        if(val == undefined){
            namespace[this.dest] = true;
        }else if(val instanceof Array){
            //throw warning?
            namespace[this.dest] = true;
        }else{
            namespace[this.dest] = val;
        }
    }
}


parser.add_argument('-v', '--version', { action: 'version', version: '%(prog)s v' + version, help: 'Muestra la versión del script.' })

const subparsers = parser.add_subparsers({ help: "help" });

const checkparser = subparsers.add_parser('check', { help: 'Verificar el/los hash(es) si lo tiene registrado mcfee' });
//const secretparser = subparsers.add_parser('secret');
//secretparser.set_defaults({action: 'secret'});

const checkparserInputGroup = checkparser.add_argument_group({ title: 'Metodo de entrada', });
checkparserInputGroup.add_argument('-f', '--file', { help: 'Archivo que contiene hashes IoC', metavar: 'hash' });
checkparserInputGroup.add_argument('--hash', { help: 'Unico hash', metavar: 'hash'});
checkparserInputGroup.add_argument('--hashList', { action: ListArgAction, help: 'Hashes separados por coma', nargs: '+', type: 'str', metavar: 'hash' });

const checkparserOutputGroup = checkparser.add_argument_group({ title: 'Metodo de salida' });
checkparserOutputGroup.add_argument('-c', '--csv', { help: 'Exportar resultado en formato CSV', action: 'store_true' });
//checkparserOutputGroup.add_argument('-x', '--xlsx', { help: 'Exportar resultado en formato XLSX', action: 'store_true' });
checkparserOutputGroup.add_argument('-o', '--output', { help: 'Nombre del archivo resultante', nargs: '?', action: OutputAction});
checkparser.set_defaults({ action: 'check' });

const misparser = subparsers.add_parser('misp')
misparser = misparser.add_argument('-i', '--import', {help: 'Importar registros de posibles IoC falsos positivos.'});


console.log(banner);

const args = parser.parse_args();
args.output = !args.output ? ((args.csv || args.xlsx) && !args.output) ? true : false : args.output; //auto output true if csv or xlsx is true
args.csv = !args.csv ? ((!args.csv && !args.xlsx) && !!args.output) ? true : false : true; //auto csv true if output is true

async function main() {
    if (args.action == undefined) {
        console.log(parser.format_help());
        console.error('[!] Introduce una acción');
    } else {
        if (args.action == 'check') {
            if(args.hashList || args.file || args.hash)
                check();
            else{
                console.log(parser.format_help());
                console.error('[!] Especifica un metodo de entrada');
            }
                
        }else if(args.action == 'secret'){
            new Secret().start();
        }
    }
}

function reportToCiff(report){
    let mapFn = (r) => {
        return [
            Utils.truncHash(r.hash),
            Utils.trunc(r.name),
            r.positivos > 5 ? r.positivos > 15 ? String(r.positivos).red : String(r.positivos).yellow : r.positivos,
            r.negativos,
            r.mcAfeeDetected,
            r.mcAfeGWEditionDetected,
            ((x) => {
                if(x.registrado == undefined && x.error){
                    return 'no encontrado'.red;
                }else if(!x.registrado){
                    if(x.positivos <= 10){
                        return 'registrar(?)'.yellow;
                    }else{
                        return x.positivos <= 15 ? 'registrar'.yellow : 'registrar'.red;
                    }
                }
                    
                return 'ningúna'.green;
            })(r)
        ]
    }

    let rows = [
        ["hash", "name", "positivos", "negativos", "mcAfee", "mcAfeeGW", "acción"]
    ];

    if(report.length >= 1){
        for(let r of report){
            rows.push(mapFn(r));
        }
    }

    return cliff.stringifyRows(rows);
}

async function check() {
    let results = [];
    
    if(args.output){
        if(args.output !== true){
            args.output = args.output.endsWith('.csv') ? args.output : args.output + '.csv';
            if(fs.existsSync(args.output)){
                console.error('[!] El archivo del destino ya existe');
                process.exit(1);
            }
        }else{
            args.output = 'report ' + Utils.getDateTimeStr() + '.csv';
        }
    }

    if (args.hash) {
        let hc = new HashChecker('oneshot');
        try{
            let result = await hc.getReportByHash(args.hash);
            results.push(result);
        }catch(err){
            result = {
                hash: args.hash,
                error: true
            }
            results.push(result);
        }
        
        let hr = reportToCiff(results);
        console.log(hr);
    }else if(args.hashList || args.file){
        let hashes = undefined;
        if(args.file){
            try{
                hashes = await Utils.readHashFile(args.file);
            }catch(err){
                console.error(err);
                process.exit(1);
            }
        }else if(args.hashList){
            hashes = args.hashList;
        }

        let hc = hashes.length <= 1 ? new HashChecker('oneshot') : new HashChecker('delayed');

        for(const [i, hash] of hashes.entries()){
            try{
                console.log(`[*] Getting report for hash [${i+1}/${hashes.length}]`);
                result = await hc.getReportByHash(hash);
                result.error = false;
                results.push(result);
            }catch(err){
                results.push({hash: hash, error: true});
                console.error('[!] Error with hash: ' + Utils.truncHash(hash), err);
            }
        }

        let hr = reportToCiff(results);
        console.log(hr);
    }

    if(args.output){
        if(args.csv){ //export in csv format
            try{
                const parser = new Parser({
                    fields: HashChecker.getReportKeys()  
                });
                const csv = parser.parse(results);
                fs.writeFileSync(args.output, csv);
                console.log('[*] Data exported to csv: ' + args.output + "!");
            }catch(err){
                throw err;
            }
        }
    }
}

try{
    main();
}catch(err){
    console.error(err);
}
    

