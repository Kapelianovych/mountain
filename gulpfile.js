const { src, dest, watch } = require('gulp')
const flowRemoveTypes = require('gulp-flow-remove-types2')

function mjs() {
  return src('src/**/*.mjs')
    .pipe(flowRemoveTypes({
      pretty: true
    }))
    .pipe(dest('dist/'))
}

exports.default = function () {
  watch('src/**/*.mjs', mjs)
}
