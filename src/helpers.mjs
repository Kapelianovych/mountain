// @flow

import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

/**
 * Check if [fileOrDir] is directory.
 */
export function isDir(pathName: string): boolean {
  return fs.statSync(pathName).isDirectory()
}

/**
 * Find absolute path to directory.
 */
export function currentDirPath(url: string | URL): string {
  return dirname(currentFilePath(url))
}

/**
 * Find absolute path to file.
 * @param {String|URL} url of the file.
 * @returns {String} absolute path to file.
 */
export function currentFilePath(url: string | URL): string {
  // $FlowFixMe
  return fileURLToPath(url)
}
