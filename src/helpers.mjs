import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

/**
 * Check if [fileOrDir] is directory.
 * @param {String} pathName
 * @returns {Boolean}
 */
export function isDir(pathName) {
  return fs.statSync(pathName).isDirectory()
}

/**
 * Find absolute path to directory.
 * @param {String|URL} url to the file.
 * @returns {String} absolute path to directory.
 */
export function currentDirPath(url) {
  return dirname(currentFilePath(url))
}

/**
 * Find absolute path to file.
 * @param {String|URL} url of the file.
 * @returns {String} absolute path to file.
 */
export function currentFilePath(url) {
  return fileURLToPath(url)
}