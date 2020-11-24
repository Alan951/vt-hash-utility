const { vtkey } = require('./conf.json');
const virusTotalApi = require('node-virustotal');
const { Utils } = require('./utils');

class HashChecker{

    constructor(mode = undefined){
        if(vtkey == undefined){
            throw new Error('vtkey undefined');
        }

        console.log("[*] VirusTotal Key loaded: " + vtkey)

        this.vtApi = virusTotalApi.MakePublicConnection();
        this.vtApi.setKey(vtkey);
        if(mode == undefined || mode == 'delayed')
            this.vtApi.setDelay(15000);
        else{
            this.vtApi.setDelay(0);
        }
    }

    async getReportByHash(hash){
        return new Promise((ok, err) => {
            this.vtApi.getFileReport(hash, (reportVT) => {

                let report = {
                    positivos: reportVT.positives,
                    negativos: reportVT.total - reportVT.positives,
                    total: reportVT.total,
                    mcAfeeDetected: false,
                    mcAfeGWEditionDetected: false,
                    registrado: false,
                    name: undefined,
                    hash: hash,
                    md5: reportVT.md5,
                    sha256: reportVT.sha256,
                    sha1: reportVT.sha1,
                    vtLink: reportVT.permalink
                }
        
                if(reportVT.scans['McAfee-GW-Edition']){
                    report.mcAfeGWEditionDetected = reportVT.scans['McAfee-GW-Edition'].detected;
                    report.name = reportVT.scans['McAfee-GW-Edition'].result;
                }else{
                    report.mcAfeGWEditionDetected = false;
                }
        
                if(reportVT.scans['McAfee']){
                    report.mcAfeeDetected = reportVT.scans.McAfee.detected;
                    if(report.mcAfeGWEditionDetected)
                        report.name = reportVT.scans.McAfee.result + " / " + report.name
                    else    
                        report.name = reportVT.scans.McAfee.result;
                }else{
                    report.mcAfeeDetected = false;
                }
        
                //McAfee-GW-Edition || McAfee
                let registrado = report.mcAfeeDetected && report.mcAfeGWEditionDetected;
                report.registrado = registrado;
        
                ok(report);
            }, errreportVT => {
                err(errreportVT);
            });
        });
    }

}

module.exports = { HashChecker }