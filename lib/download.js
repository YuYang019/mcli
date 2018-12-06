const path = require('path')
const config = require('../config')
const download = require('download-git-repo')
const ora = require('ora')

module.exports = function (target) {
  target = path.join('.', target)
  return new Promise((resolve, reject) => {
    const spinner = ora(`正在下载项目模板，源地址: ${ config.repo }`)
    spinner.start()
    // use download rather than clone
    download(config.repo, target, { clone: false }, (err) => {
      if (err) {
        spinner.fail()
        reject(err)
      } else {
        spinner.succeed()
        resolve(target)
      }
    })
  })
}