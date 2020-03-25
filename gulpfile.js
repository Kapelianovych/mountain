const { src, dest, watch } = require('gulp')
const flowRemoveTypes = require('gulp-flow-remove-types2')
const uglify = require('gulp-uglify-es').default

function mjs() {
  return src('src/**/*.mjs')
    .pipe(flowRemoveTypes())
    .pipe(uglify({
      ecma: 2018,
      module: true,
      keep_classnames: true,
      keep_fnames: true
    }))
    .on('error', console.error)
    .pipe(dest('dist/'))
}

exports.default = function () {
  watch('src/**/*.mjs', mjs)
}
exports.minimize = mjs
