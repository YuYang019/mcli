#!/usr/bin/env node

const commander = require('commander')

commander
  .version('1.0.0')
  .usage('<command> [项目名称]')
  .command('init', '创建新项目')
  .parse(process.argv)