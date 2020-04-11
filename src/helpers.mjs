// @flow

import fs from 'fs'
import { dirname, resolve, normalize } from 'path'

/** Requires [path] to be absolute. */
export function fileOrDirExists(path: string): boolean %checks {
  return fs.existsSync(path)
}

/**
 * Check if [pathName] is directory.
 * If such path does not exist it is assumed that path is not directory.
 * Requires [pathName] to be absolute.
 */
export function isDir(pathName: string): boolean {
  if (fileOrDirExists(pathName)) {
    return fs.statSync(pathName).isDirectory()
  } else {
    return false
  }
}

/**
 * Find absolute path to directory.
 */
export function absoluteDirPath(url: string | URL): string {
  return dirname(absoluteFilePath(url))
}

/**
 * Find absolute path to file.
 */
export function absoluteFilePath(url: string | URL): string {
  const stringifiedUrl = typeof url === 'string' ? url : url.pathname

  return normalize(
    `${getRootProjectPath()}${stringifiedUrl.startsWith('/') ? stringifiedUrl.slice(1) : stringifiedUrl}`
  )
}

/**
 * This is maybe hack, but it works ;)
 */
function getRootProjectPath(): string {
  const path = resolve(import.meta.url)
  const stripPathRegExp = /file:.*mountain\/dist\/helpers\.mjs$/
  return path.slice(0, path.search(stripPathRegExp))
}
