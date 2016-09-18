import gulp from 'gulp'
import babel from 'gulp-babel'
import mocha from 'gulp-mocha'
import istanbul from 'gulp-istanbul'
import coveralls from 'gulp-coveralls'

const babelConfig = {
  presets: ['node6', 'stage-0']
}

const paths = {
  src: 'src/**/*.js'
 ,build: 'build/**/*.js'
 ,buildDest: 'build'
 ,test: 'test/test.js'
 ,lcov: 'coverage/**/lcov.info'
}

gulp.task('build', () =>
  gulp.src(paths.src)
    .pipe(babel(babelConfig))
    .pipe(gulp.dest(paths.buildDest))
)

gulp.task('pre-test', () =>
  gulp.src(paths.build)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
)

gulp.task('local-test', ['pre-test'], () =>
  gulp.src(paths.test)
    .pipe(mocha({compilers: 'js:babel-register'}))
    .pipe(istanbul.writeReports())
)

gulp.task('test', ['local-test'], () =>
  gulp.src(paths.lcov)
    .pipe(coveralls())
)

gulp.task('watch', () =>
  gulp.watch(paths.src, ['build'])
)
