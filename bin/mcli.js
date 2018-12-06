#!/usr/bin/env node

const commander = require('commander')
const packageInfo = require('../package.json');

commander
  .version(packageInfo.version)
  .usage('<command> [项目名称]')
  .command('init', '创建新项目')
  .parse(process.argv)