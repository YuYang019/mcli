const path = require('path')
const fs = require('fs')
const logSymbols = require('log-symbols')
const inquirer = require('inquirer')
const chalk = require('chalk')

const downlad = require('./utils/download')
const generator = require('./utils/generator')

const PROJECT_NAME_OK = 0
const PROJECT_NAME_EXIST = 1
const PROJECT_NAME_SAME = 2

function init(cmdOptions) {

  let { clone, projectName } = cmdOptions
  let next

  const status = checkCurrentDirectoryStatus(projectName)

  switch (status) {
    case PROJECT_NAME_OK: {
      next = Promise.resolve(projectName)
      break;
    }
    case PROJECT_NAME_EXIST: {
      console.log(logSymbols.error, `项目${projectName}已存在`)
      return
    }
    case PROJECT_NAME_SAME: {
      next = inquirer.prompt([{
        name: 'buildInCurrent',
        message: '当前目录为空，且目录和项目文件名相同，是否直接在当前目录下创建项目？',
        type: 'confirm',
        default: true
      }]).then(answer => {
        return Promise.resolve(answer.buildInCurrent ? '.' : projectName)
      })
      break;
    }
  }

  next
    .then(projecRoot => {
      return downlad(projecRoot, clone).then(target => {
          return {
            name: projecRoot,
            root: projecRoot,
            downladTemp: target
          }
        })
        .catch(err => console.log(err))
    })
    .then(context => {
      return inquirer.prompt([{
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

// 检查当前目录状态
function checkCurrentDirectoryStatus (projectName) {
  // 当前目录路径
  const rootPath = process.cwd()
  // 当前目录名称
  const rootName = path.basename(rootPath)
  const files = fs.readdirSync(rootPath)
  const length = files.length

  if (length) {
    // 如果目录下有文件，遍历文件夹
    for (let i = 0; i < length; i++) {
      const filePath = path.resolve(rootPath, files[i])
      if (fs.statSync(filePath).isDirectory()) {
        const dirName = files[i]
        if (dirName.indexOf(projectName) !== -1) {
          // 如果该目录下有一个相同名称的文件夹
          console.log(logSymbols.error, `项目${projectName}已存在`)
          return PROJECT_NAME_EXIST
        }
      }
    }
    return PROJECT_NAME_OK
  } else if (rootName === projectName) {
    // 如果目录为空，且父文件夹和项目名称相同
    return PROJECT_NAME_SAME
  } else {
    return PROJECT_NAME_OK
  }
}

module.exports = init