const path = require('path')
const config = require('../../config')
const download = require('download-git-repo')
const ora = require('ora')

module.exports = function (target, clone) {
  target = path.join('.', target)
  return new Promise((resolve, reject) => {
    const spinner = ora(`正在下载项目模板，源地址: ${ config.repo }`)
    spinner.start()
    // download or clone the template
    download(config.repo, target, { clone }, (err) => {
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