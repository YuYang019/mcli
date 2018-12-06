#!/usr/bin/env node

const commander = require('commander')
const path = require('path')
const fs = require('fs')
const inquirer = require('inquirer')
const chalk = require('chalk')
const logSymbols = require('log-symbols')

const downlad = require('../lib/download')
const generator = require('../lib/generator')

commander
  .usage('<project-name>')
  .parse(process.argv)

let projectName = commander.args[0]

if (!projectName) {
  commander.help()
  return
}

// cwd拿到当前目录路径
// basename拿到当前目录名称
const rootPath = process.cwd()
let rootName = path.basename(rootPath)
let isRepeat = false
let next

function updateRootName () {
  const files = fs.readdirSync(rootPath)
  const length = files.length
  
  if (length) {  
    // 如果目录下有文件
    for (let i = 0; i < length; i++) {
      const filePath = path.resolve(rootPath, files[i])
      if (fs.statSync(filePath).isDirectory()) {
        const dirName = files[i]
        if (dirName.indexOf(projectName) !== -1) {
          // 如果该目录下有一个相同名称的文件夹
          console.log(logSymbols.error, `项目${projectName}已存在`)
          isRepeat = true;
          return 
        }
      }
    }
    next = Promise.resolve(projectName)
  } else if (rootName === projectName) {
    // 如果目录为空，且父文件夹和项目名称相同
    next = inquirer.prompt([
      {
        name: 'buildInCurrent',
        message: '当前目录为空，且目录和项目文件名相同，是否直接在当前目录下创建项目？',
        type: 'confirm',
        default: true
      }
    ]).then(answer => {
      return Promise.resolve(answer.buildInCurrent ? '.' : projectName)
    })
  } else {
    next = Promise.resolve(projectName)
  }

}

function run () {
  updateRootName()
  
  if (isRepeat) return

  next
    .then(projecRoot => {
      return downlad(projecRoot).then(target => {
        return {
          name: projecRoot,
          root: projecRoot,
          downladTemp: target
        }
      })
      .catch(err => console.log(err))
    })
    .then(context => {
      return inquirer.prompt([
        {
          name: 'projectName',
          message: '项目的名称',
          default: context.name
        },
        {
          name: 'projectVersion',
          message: '项目版本号',
          default: '1.0.0'
        },
        {
          name: 'projectDescription',
          message: '项目简介',
          default: `A project named ${context.name}`
        }
      ]).then(answers => {
        return {
          ...context,
          metadata: {
            ...answers
          }
        } 
      })
    })
    .then(context => {
      return generator(context.metadata, context.root, context.downladTemp)
    })
    .then(context => {
      console.log(' ')
      console.log(logSymbols.success, chalk.green('创建成功 :)'))
      console.log(' ')
      console.log(chalk.green(`cd ${ context.root }\nnpm install\nnpm run dev`))
      console.log(' ')
    })
    .catch(err => {
      console.log(logSymbols.error, chalk.red(`创建失败: ${err}`))
    })
}

run()