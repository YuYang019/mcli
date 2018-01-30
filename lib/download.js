const path = require('path')
const config = require('../config')
const clone = require('git-clone')
const rm = require('rimraf').sync
const ora = require('ora')

module.exports = function (target) {
  target = path.join('.', target)
  return new Promise((resolve, reject) => {
    const spinner = ora(`正在下载项目模板，源地址: ${ config.url }`)
    spinner.start()
    clone(config.url, target, { clone: true }, (err) => {
      if (err) {
        spinner.fail()
        reject(err)
      } else {
        // 删除git信息
        rm(path.resolve(target, '.git'))
        spinner.succeed()
        resolve(target)
      }
    })
  })
}