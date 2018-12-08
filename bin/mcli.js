#!/usr/bin/env node

const cli = require('cac')()
const packageInfo = require('../package.json');
const init = require('../lib/init');

// []表示可选参数，<>表示必须参数

cli
  .version(packageInfo.version)
  .help()

cli
  .command('init <projectName>', 'init project')
  .option('-c, --clone', 'git clone the project rather than download it')
  .action((projectName, options) => {
    const { clone } = options
    
    wrapCommand(init)({
      projectName,
      clone
    })
  })

function wrapCommand(fn) {
  return (...args) => {
    return fn(...args)
  }
}

cli.parse()

