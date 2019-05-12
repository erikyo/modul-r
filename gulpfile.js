// Gulp
const gulp = require('gulp');

// Utilities
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const autoprefixer = require("autoprefixer");
const fs = require('fs');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

// Gulp plugins
const header = require('gulp-header');
const del = require("del");
const rename = require('gulp-rename');
const notify = require("gulp-notify");

// Misc/global vars
const pkg = JSON.parse(fs.readFileSync('package.json'));

// Task options
const opts = {
  rootPath: './',
  devPath: './assets/src/',
  distPath: './assets/dist/',

  autoprefixer: {
    dev: {
      browsers: ['last 1 versions'],
      cascade: false
    },
    build: {
      browsers: ['> 1%', 'last 2 versions'],
      cascade: false
    }
  },

  cssnano: {reduceIdents: {keyframes: false}},

  sass: {
    dev: {
      outputStyle: 'nested'
    },
    build: {
      outputStyle: 'compressed'
    }
  },

  imagemin: {
    settings : ([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ], {
      verbose: true
    })
  },

  banner: [
    '@charset "UTF-8";\n' +
    '/*' ,
    'Theme Name: <%= name %>\n' +
    'Theme URI: <%= homepage %>\n' +
    'Author: <%= author.name %> \n' +
    'Author URI: <%= author.website %> \n' +
    'Description: <%= description %>\n' +
    'Requires at least: WordPress 4.9.6\n' +
    'Version: <%= version %>\n' +
    'License: GNU General Public License v2 or later\n' +
    'License: Copyright (c) <%= new Date().getFullYear() %> <%= author.name %> \n' +
    'Text Domain: <%= textDomain %>\n' +
    '*/\n\n'
  ].join('\n')
};

// ----------------------------
// Gulp task definitions
// ----------------------------

// Clean assets
function clean() {
  return del([
    '**/Thumbs.db',
    '**/.DS_Store',
    opts.rootPath + 'style.css.map',
    opts.distPath + '**'
  ]).then(paths => {
    console.log('Successfully deleted files and folders:\n', paths.join('\n'));
  });
}

// Minify images
function imageMinify() {
  return gulp
  .src(opts.devPath + 'img/**')
  .pipe(newer(opts.distPath + 'img/'))
  .pipe(
    imagemin(opts.imagemin.settings)
    .on('error', notify.onError('Error: <%= error.message %>,title: "imagemin Error"'))
  )
  .pipe(gulp.dest(opts.distPath + 'img/'));
}

// Main Scripts
function mainScript() {
  return gulp
    .src(opts.devPath + 'js/*.js')
    .pipe(gulp.dest(opts.distPath + 'js/'));
}

// User Scripts
function userScript() {
  return gulp
    .src(opts.devPath + 'js/user/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write('.', { sourceRoot: '/' }))
    .pipe(gulp.dest(opts.distPath + 'js/'));
}

// vendor scripts concat
function vendorScript() {
  return gulp
    .src(opts.devPath + 'js/vendor/*.js')
    .pipe(newer(opts.distPath + 'js/vendor-scripts.js'))
    .pipe(concat('vendor-scripts.js'))
    .pipe(gulp.dest(opts.distPath + 'js/'))
    .pipe(rename({suffix: '.min'}));
}

function css() {
  return gulp
    .src(opts.devPath + 'scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(opts.sass.dev))
    .on('error', notify.onError('Error: <%= error.message %>,title: "sass Error"'))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.dev)
    ]))
    .pipe(header(opts.banner, pkg))
    .pipe(gulp.dest(opts.rootPath))
    .pipe(sourcemaps.write('.', { sourceRoot: '/' }))
    .pipe(gulp.dest(opts.rootPath));
}

function buildStyle() {
  return gulp
    .src(opts.devPath + 'scss/*.scss')
    .pipe(sass(opts.sass.build))
    .on('error', notify.onError('Error: <%= error.message %>,title: "sass Error"'))
    .pipe(gulp.dest(opts.rootPath))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.build),
      cssnano(opts.cssnano)
    ]))
    .pipe(header(opts.banner, pkg))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(opts.rootPath));
}

// Watch files
function watchStyle() {
  gulp.watch(opts.devPath + 'scss/**/*.scss', css );
}

function watchCode() {
  gulp.watch(opts.devPath + 'js/**/*.js', scripts );
}

function watchImages() {
  gulp.watch(opts.devPath + 'img/**/*', imageMinify );
}


const scripts = gulp.parallel(vendorScript, userScript, mainScript);
const build = gulp.series(clean, gulp.parallel(imageMinify, buildStyle, scripts) );
const watch = gulp.parallel(watchStyle, watchCode, watchImages);

exports.scripts = scripts;
exports.vendorScript = vendorScript;
exports.userScript = userScript;
exports.css = css;
exports.buildStyle = buildStyle;
exports.imageMinify = imageMinify;
exports.build = build;
exports.watch = watch;
exports.default = watch;