const { vtkey } = require('./conf.json');
const virusTotalApi = require('node-virustotal');
const { Utils } = require('./utils');

class HashChecker{

    constructor(mode = undefined){
        if(vtkey == undefined){
            throw new Error('vtkey no se encuentra establecido');
        }

        console.log("[*] VirusTotal Key loaded")

        if(mode == undefined || mode == 'delayed')
            this.vtApi = virusTotalApi.makeAPI(15000);
        else
            this.vtApi = virusTotalApi.makeAPI(0);
        
        this.vtApi.setKey(vtkey);
    }

    static getReportKeys(){
        return [
            "positivos",
            "negativos",
            "total",
            "mcAfeeDetected",
            "mcAfeGWEditionDetected",
            "registradoMcAfee",
            "registradoCrowdstrike",
            "name",
            "fechaUltimoEscaneo",
            "hash",
            "md5",
            "sha1",
            "sha256",
            "vtLink"
        ]
    }

    async getReportByDomain(domain){

    }

    async getReportByHash(hash){
        return new Promise((ok, err) => {
            this.vtApi.fileLookup(hash, (errReport, reportVT) => {
                if(errReport){
                    err(errReport);
                    return;
                }

                reportVT = JSON.parse(reportVT).data;
                let attribs = reportVT.attributes;

                let report = {
                    //positivos: reportVT.positives,
                    //negativos: reportVT.total - reportVT.positives,
                    positivos: attribs['last_analysis_stats']['malicious'],
                    negativos: attribs['last_analysis_stats']['undetected'],
                    total: attribs['last_analysis_stats']['malicious'] + attribs['last_analysis_stats']['undetected'],
                    mcAfeeDetected: false,
                    mcAfeGWEditionDetected: false,
                    crowdstrikeDetected: false,
                    registradoMcAfee: false,
                    registradoCrowdstrike: false,
                    fechaUltimoEscaneo: Utils.timestampToDateStr(attribs['last_analysis_date']),
                    name: undefined,
                    hash: hash,
                    md5: attribs.md5,
                    sha256: attribs.sha256,
                    sha1: attribs.sha1,
                    vtLink: reportVT.links.self
                }

                if(attribs['last_analysis_results']['CrowdStrike']){
                    report.registradoCrowdstrike = attribs['last_analysis_results']['CrowdStrike']['category'] == 'malicious' ? true : false;
                    report.name = attribs['last_analysis_results']['CrowdStrike'].result;
                }else{
                    report.crowdstrikeDetected = false;
                }
        
                if(attribs['last_analysis_results']['McAfee-GW-Edition']){
                    report.mcAfeGWEditionDetected = attribs['last_analysis_results']['McAfee-GW-Edition']['category'] == 'malicious' ? true : false;
                    report.name = attribs['last_analysis_results']['McAfee-GW-Edition'].result;
                }else{
                    report.mcAfeGWEditionDetected = false;
                }
        
                if(attribs['last_analysis_results']['McAfee']){
                    report.mcAfeeDetected = attribs['last_analysis_results']['McAfee']['category'] == 'malicious' ? true : false;
                    if(report.mcAfeGWEditionDetected)
                        report.name = attribs['last_analysis_results']['McAfee'].result + " / " + report.name
                    else    
                        report.name = attribs['last_analysis_results']['McAfee'].result;
                }else{
                    report.mcAfeeDetected = false;
                }
        
                //McAfee-GW-Edition || McAfee
                report.registradoMcAfee = report.mcAfeeDetected || report.mcAfeGWEditionDetected;
        
                ok(report);
            });
            
        });
    }

}

module.exports = { HashChecker }