const { ArgumentParser, SUPPRESS, Action } = require('argparse');
const { version } = require('./package.json')

const banner = `
██╗░░░██╗████████╗░░░░░░████████╗░█████╗░░█████╗░██╗░░░░░░██████╗
██║░░░██║╚══██╔══╝░░░░░░╚══██╔══╝██╔══██╗██╔══██╗██║░░░░░██╔════╝
╚██╗░██╔╝░░░██║░░░█████╗░░░██║░░░██║░░██║██║░░██║██║░░░░░╚█████╗░
░╚████╔╝░░░░██║░░░╚════╝░░░██║░░░██║░░██║██║░░██║██║░░░░░░╚═══██╗
░░╚██╔╝░░░░░██║░░░░░░░░░░░░██║░░░╚█████╔╝╚█████╔╝███████╗██████╔╝
░░░╚═╝░░░░░░╚═╝░░░░░░░░░░░░╚═╝░░░░╚════╝░░╚════╝░╚══════╝╚═════╝░
                                                By @Alan951 v1.0
`;

const parser = new ArgumentParser({
    description: 'VT - Tools!'
});

class ListArgAction extends Action {
    constructor(opts){
        super(opts);
    }

    call(arg, namespace, values, optionString){
        namespace[this.dest] = values.join(',').split(',').filter(val => { return val != null && val != undefined && val != ''});
    }
}


parser.add_argument('-v', '--version', {action: 'version', version: '%(prog)s v' + version, help: 'Muestra la versión del script.'})
//parser.add_argument('-h', '--help', {action: 'help', version, help: 'Muestra esta ayuda. %s', default: SUPPRESS})
//parser.add_argument('--check', {action: 'store_true', help: "Verificar el/los hash(es) si lo tiene registrado mcfee"});

const subparsers = parser.add_subparsers({help: "help"});

const checkparser = subparsers.add_parser('check', {help: 'Verificar el/los hash(es) si lo tiene registrado mcfee'});
const checkparserInputGroup = checkparser.add_argument_group({title: 'Metodo de entrada', });
checkparserInputGroup.add_argument('-f', '--file', {help: 'Archivo que contiene hashes IoC', metavar: 'hash'});
checkparserInputGroup.add_argument('--hash', {help: 'Unico hash', metavar: 'hash', default: true});
checkparserInputGroup.add_argument('--hashList', {action: ListArgAction, help: 'Hashes separados por coma', nargs: '+', type: 'str', metavar: 'hash'});
const checkparserOutputGroup = checkparser.add_argument_group({title: 'Metodo de salida'});
checkparserOutputGroup.add_argument('-c', '--csv', {help: 'Exportar resultado en un CSV', action: 'store_true'});
checkparserOutputGroup.add_argument('-s', '--stdout', {help: 'Mostrar en terminal', action: 'store_true'});
checkparser.set_defaults({action: 'check'})

console.log(banner);

const args = parser.parse_args();

if(args.action == undefined){
    console.log(parser.format_help());
    console.error('[!] Introduce una acción');
}else{
    if(args.action == 'check'){
        check();    
    }
}

function check(){

    if(args.hash){
        
    }
}