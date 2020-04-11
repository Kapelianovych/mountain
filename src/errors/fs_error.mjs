// @flow

export class FsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FsError'
  }
}
