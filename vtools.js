const { ArgumentParser, SUPPRESS, Action } = require('argparse');
const { version } = require('./package.json')
const { HashChecker } = require('./hash-checker');
const { Utils } = require('./utils');
const cliff = require('cliff');


process.removeAllListeners('warning');

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


parser.add_argument('-v', '--version', { action: 'version', version: '%(prog)s v' + version, help: 'Muestra la versión del script.' })

const subparsers = parser.add_subparsers({ help: "help" });

const checkparser = subparsers.add_parser('check', { help: 'Verificar el/los hash(es) si lo tiene registrado mcfee' });
const checkparserInputGroup = checkparser.add_argument_group({ title: 'Metodo de entrada', });
checkparserInputGroup.add_argument('-f', '--file', { help: 'Archivo que contiene hashes IoC', metavar: 'hash' });
checkparserInputGroup.add_argument('--hash', { help: 'Unico hash', metavar: 'hash'});
checkparserInputGroup.add_argument('--hashList', { action: ListArgAction, help: 'Hashes separados por coma', nargs: '+', type: 'str', metavar: 'hash' });
const checkparserOutputGroup = checkparser.add_argument_group({ title: 'Metodo de salida' });
checkparserOutputGroup.add_argument('-c', '--csv', { help: 'Exportar resultado en un CSV', action: 'store_true' });
checkparserOutputGroup.add_argument('-s', '--stdout', { help: 'Mostrar en terminal', action: 'store_true' });
checkparser.set_defaults({ action: 'check' })

console.log(banner);

const args = parser.parse_args();

async function main() {
    if (args.action == undefined) {
        console.log(parser.format_help());
        console.error('[!] Introduce una acción');
    } else {
        if (args.action == 'check') {
            check();
        }
    }
}

function reportToCiff(report){
    let mapFn = (report) => {

        return [
            Utils.truncHash(report.hash),
            Utils.trunc(report.name),
            report.positivos > 5 ? report.positivos > 15 ? String(report.positivos).red : String(report.positivos).yellow : report.positivos,
            //report.positivos,
            report.negativos,
            report.mcAfeeDetected,
            report.mcAfeGWEditionDetected,
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
            })(report)
        ]
    }

    let rows = [
        ["hash", "name", "positivos", "negativos", "mcAfee", "mcAfeeGW", "acción"]
    ];

    if(report instanceof Array){
        for(r of report){
            rows.push(mapFn(r));
        }
    }else{
        rows.push(mapFn(report));
    }

    return cliff.stringifyRows(rows);
}

async function check() {
    console.log(args);
    if (args.hash) {
        let hc = new HashChecker('oneshot');

        result = new Array(await hc.getReportByHash(args.hash));
        let hr = reportToCiff(result[0]);

        console.log(hr);        
    }else if(args.hashList){
        let hc = args.hashList.length <= 1 ? new HashChecker('oneshot') : new HashChecker('delayed');
        let results = [];

        for(const [i, hash] of args.hashList.entries()){
            try{
                console.log(`[*] Getting report for hash [${i+1}/${args.hashList.length}]`);
                let result = await hc.getReportByHash(hash);
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
}

main();

