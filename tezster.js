#!/usr/bin/env node
'use strict';

const program = require('commander');

program
.version('0.1.12', '-v, --version')
.command('setup')
.action(function() {
    console.log('setting up tezos node, this could take a while....');
    const { exec } = require('child_process');
    const fs = require("fs");
    let workingDir = __dirname + '/script';
    let setup_successfile_dir = workingDir + '/setup.successful';
    const _cliProgress = require('cli-progress');
    let progress = 1;
    let progressInterval;
    const progressbar = new _cliProgress.Bar({
                            format: 'progress [{bar}] {percentage}% | ETA: {eta}s'
                            }, _cliProgress.Presets.shades_classic);
    progressbar.start(100, progress);

    exec('./setup.sh > setup.log',{cwd : workingDir}, (err, stdout, stderr) => {
        clearInterval(progressInterval);
        progressbar.update(100);
        progressbar.stop();
        if (err) {
            console.error(`tezster setup error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
        if (fs.existsSync(setup_successfile_dir)) {
            console.log('Setup has been completed successfully');
        } else {
            console.log('setup is not successful, please try running "tezster setup" again....');
        }
    });

    progressInterval = setInterval(() => {
        progress = progress + 0.055;
            if (progressInterval >= 100) {
                clearInterval(progressInterval);
                progressbar.update(100);
                progressbar.stop();

                return;
            }
            progressbar.update(progress);
        }, 1000);
});

program
.command('start-nodes')
.action(function() {
    console.log('starting the nodes.....');
    const { exec } = require('child_process');
    let workingDir = __dirname + '/script';
    const _cliProgress = require('cli-progress');
    let progress = 0;
    let progressInterval;
    const progressbar = new _cliProgress.Bar({
                            format: 'progress [{bar}] {percentage}% | ETA: {eta}s'
                            }, _cliProgress.Presets.shades_classic);
    progressbar.start(100, progress);
    exec('./start_nodes.sh',{cwd : workingDir}, (err, stdout, stderr) => {
        clearInterval(progressInterval);
        progressbar.update(100);
        progressbar.stop();
        if (err) {
            return;
        }

        console.log(`${stdout}`);
    });

    progressInterval = setInterval(() => {
        progress = progress + 1.8;
            if (progressInterval >= 100) {
                clearInterval(progressInterval);
                progressbar.update(100);
                return;
            }
            progressbar.update(progress);
        }, 1000);
});

program
.command('stop-nodes')
.action(function() {
    console.log('stopping the nodes....');
    const { exec } = require('child_process');
    let workingDir = __dirname + '/script';

    exec('./stop_nodes.sh ',{cwd : workingDir}, (err, stdout, stderr) => {
        if (err) {
            console.error(`tezster stopping nodes error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
    });
});

program
.command('install-liquidity')
.action(function() {
    console.log('installing liquidity.....');
    const { exec } = require('child_process');
    let workingDir = __dirname + '/script';
    exec('./install_liquidity.sh',{cwd : workingDir}, (err, stdout, stderr) => {
        if (err) {
            console.error(`tezster installing liquidity error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
    });
});

program
.command('fix-liquidity-package')
.action(function() {
    console.log('Fixing libsodium package for liquidity.....');
    const { exec } = require('child_process');
    let workingDir = __dirname + '/script';
    exec('./fix_libsodium.sh',{cwd : workingDir}, (err, stdout, stderr) => {
        if (err) {
            console.error(`tezster Fixing liquidity package error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
        console.log(`Check version for libsodium-dev, If it's >= 1.0.11, try installing liquidity by running
        "tezster install-liquidity" again`);
    });
});

//*******for check the balance check */
program
.command('get-balance')
.action(async function(){
    var args = process.argv.slice(3);
    const tezsterManager = require('./tezster-manager');
    if (args.length < 1) {
        console.log(tezsterManager.outputInfo("Incorrect usage of get-balance command \n Correct usage: - tezster get-balance account/contract"));
        return;
    }
    await tezsterManager.loadTezsterConfig();
    tezsterManager.getBalance(args[0]).then((result) => {
        console.log(result);
    });
});

//******* To get the list accounts */
program
.command('list-accounts')
.action(async function(){    
    const tezsterManager = require('./tezster-manager');    
    await tezsterManager.loadTezsterConfig();
    const config = tezsterManager.config;
    if(Object.keys(config.accounts).length > 0){
        for(var i in config.accounts){
            console.log(tezsterManager.output(config.accounts[i].label + " - " + config.accounts[i].pkh + " (" + config.accounts[i].identity + ")"));
        }
    }
    else{    
        console.log(tezsterManager.outputError("No Account is available !!"));        
    }
});

//******* TO get the list Contracts */
program
.command('list-contracts')
.action(async function(){     
    const tezsterManager = require('./tezster-manager');       
    await tezsterManager.loadTezsterConfig();    
    const config = tezsterManager.config;
    if(Object.keys(config.contracts).length > 0){        
        for(var i in config.contracts){
            console.log(tezsterManager.output(config.contracts[i].label + " - " + config.contracts[i].pkh + " (" + config.contracts[i].identity + ")"));        
        }
    }
    else{
        console.log(tezsterManager.outputError("No Contracts are Available !!"));        
    }
});

//******* To get the Provider */
program
.command('get-provider')
.action(async function(){        
    const tezsterManager = require('./tezster-manager');    
    await tezsterManager.loadTezsterConfig(); 
    console.log(tezsterManager.getProvider());
});


//******* To set the Provider */
program
.command('set-provider')
.action(async function(){  
    var args = process.argv.slice(3);  
    const tezsterManager = require('./tezster-manager');  
    if (args.length < 1){ 
        console.log(tezsterManager.outputError("Incorrect usage - tezster set-provider http://{ip}:{port}"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 
    console.log(tezsterManager.setProvider(args));
});

//******* To transfer the amount */
program
.command('transfer')
.action(async function(){  
    var args = process.argv.slice(3);  
    const tezsterManager = require('./tezster-manager');
    if (args.length < 2) {
        console.log(tezsterManager.outputError("Incorrect usage - tezster transfer <amount> <from> <to> <fees>"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 
    tezsterManager.transferAmount(args).then((result) => {        
        console.log(result);
    });
});

//******* To transfer the amount */
program
.command('bake-for')
.action(async function(){  
    var args = process.argv.slice(3);
    const tezsterManager = require('./tezster-manager');
    if (args.length < 1) {
        console.log(tezsterManager.outputError("Incorrect usage - tezster bake-for <identity-label>"));
        return;
    }
    console.log('baking the previous operation.....');
    const { exec } = require('child_process');
    let workingDir = __dirname + '/script';
    exec('./bake_tx.sh ' + args[0],{cwd : workingDir}, (err, stdout, stderr) => {
        if (err) {
            console.error(`tezster baking opertaion error: ${err}`);
            return;
        }

        console.log(`Baking successful ${stdout}`);
    });
});

//*******deploy contract written */
program
.command('deploy')
.action(async function(){
    const fs = require("fs");
    var args = process.argv.slice(3);
    const tezsterManager = require('./tezster-manager');
    if (args.length < 1) {
        console.log(tezsterManager.outputInfo("Incorrect usage of deploy command \n Correct usage: - tezster deploy contract-label contract-absolute-path init-string"));
        return;
    }
    await tezsterManager.loadTezsterConfig(); 
    let contractLabel = args[0],
        contract = fs.readFileSync(args[1], 'utf8'),
        initValue = args[2] || '""';
    const { exec } = require('child_process');
    let workingDir = __dirname + '/script';
    
    exec("./deploy_contract.sh" + " " + contractLabel +" '" + contract + "' " + " '" +initValue + "'",{cwd : workingDir}, (err, stdout, stderr) => {
        if (err) {
            console.error(`tezster deploy contract error: ${err}`);
            return;
        }

        const operationHashFull = /Operation hash is \'[a-zA-Z0-9]*\'/gm;
        const operationHash = /\'[a-zA-Z0-9]*\'/gm;
        let operationHashStr = stdout.match(operationHashFull);
        if (operationHashStr.length) {
            let opHashes = operationHashStr[0].match(operationHash);
            if (opHashes.length) {
                let opHash = opHashes[0];
                opHash = opHash.slice(1, opHash.length-1);
                // TODO : contract is being deployed with bootstrap1 always
                tezsterManager.addContract(contractLabel, opHash, 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx');
            }
        }
        console.log(`${stdout}`);
    });
});

program.parse(process.argv);