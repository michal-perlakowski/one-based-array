import gulp from 'gulp'
import babel from 'gulp-babel'
import mocha from 'gulp-mocha'

const babelConfig = {
  presets: ['node6', 'stage-0']
}

const paths = {
  src: 'src/**/*.js'
 ,build: 'build'
 ,test: 'test/test.js'
}

gulp.task('build', () =>
  gulp.src(paths.src)
    .pipe(babel(babelConfig))
    .pipe(gulp.dest(paths.build))
)

gulp.task('test', () =>
  gulp.src(paths.test)
    .pipe(mocha({compilers: 'js:babel-register'}))
)

gulp.task('watch', () =>
  gulp.watch(paths.src, ['build'])
)
