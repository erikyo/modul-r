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
const wpPot = require('gulp-wp-pot');

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
    '/*!' ,
    'Theme Name: <%= wp.themeName %>\n' +
    'Description: <%= wp.description %>\n' +
    'Theme URI: <%= homepage %>\n' +
    'Author: <%= author.name %> \n' +
    'Author URI: <%= author.website %> \n' +
    'Requires at least: WordPress 4.9.6\n' +
    'Version: <%= version %>\n' +
    'License: GNU General Public License v3 or later\n' +
    'License: © <%= new Date().getFullYear() %> <%= author.name %>\n' +
    'License URI: <%= wp.licenseURI %>\n' +
    'Text Domain: <%= wp.textDomain %>\n' +
    'Tags: <%= wp.tags %>\n' +
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
    opts.rootPath + '*.css.map',
    opts.distPath + '**'
  ]).then( paths => {
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
    .on('error', notify.onError('Error: <%= error.message %>,title: "Imagemin Error"'))
  )
  .pipe(gulp.dest(opts.distPath + 'img/'));
}

// Wordpress pot translation file
function createPot() {
  return gulp
    .src(opts.rootPath + '**/*.php')
    .pipe( wpPot({
        domain: pkg.wp.textDomain,
        package: pkg.name + '-theme'
      }).on('error', notify.onError('Error: <%= error.message %>,title: "Translation Error"'))
    )
    .pipe(gulp.dest(opts.rootPath + 'languages/' + pkg.name + '.pot'));
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

// Vendor scripts concat
function vendorScript() {
  return gulp
    .src(opts.devPath + 'js/vendor/*.js')
    .pipe(newer(opts.distPath + 'js/vendor-scripts.js'))
    .pipe(uglify())
    .pipe(concat('vendor-scripts.js'))
    .pipe(gulp.dest(opts.distPath + 'js/'));
}


// CSS Style functions
function cssAtf() {
  return gulp
    .src(opts.devPath + 'scss/atf.scss')
    .pipe(sass(opts.sass.dev))
    .on('error', notify.onError('Error: <%= error.message %>,title: "SASS Error"'))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.build),
      cssnano(opts.cssnano)
    ]))
    .pipe(gulp.dest(opts.distPath + 'css/'));
}

// compile style.scss (the main wordpress style)
function mainCSS() {
  return gulp
    .src(opts.devPath + 'scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(opts.sass.dev))
    .on('error', notify.onError('Error: <%= error.message %>,title: "SASS Error"'))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.dev)
    ]))
    .pipe(header(opts.banner, pkg))
    .pipe(gulp.dest(opts.rootPath))
    .pipe(sourcemaps.write('.', { sourceRoot: '/' }))
    .pipe(gulp.dest(opts.rootPath));
}

function buildMainCSS() {
  return gulp
    .src(opts.devPath + 'scss/style.scss')
    .pipe(sass(opts.sass.build))
    .on('error', notify.onError('Error: <%= error.message %>,title: "SASS Error"'))
    .pipe(gulp.dest(opts.rootPath))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.build),
      cssnano(opts.cssnano)
    ]))
    .pipe(header(opts.banner, pkg))
    .pipe(gulp.dest(opts.rootPath));
}

// compile all other styles that's name is not style.scss or atf
function CSS() {
  return gulp
    .src(opts.devPath + 'scss/!(atf.scss|style.scss)*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(opts.sass.dev))
    .on('error', notify.onError('Error: <%= error.message %>,title: "SASS Error"'))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.dev)
    ]))
    .pipe(header(opts.banner, pkg))
    .pipe(gulp.dest(opts.distPath + 'css/'))
    .pipe(sourcemaps.write('.', { sourceRoot: '/' }))
    .pipe(gulp.dest(opts.distPath + 'css/'));
}

function buildCSS() {
  return gulp
    .src(opts.devPath + 'scss/!(atf.scss|style.scss)*.scss')
    .pipe(sass(opts.sass.build))
    .on('error', notify.onError('Error: <%= error.message %>,title: "SASS Error"'))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.build),
      cssnano(opts.cssnano)
    ]))
    .pipe(header(opts.banner, pkg))
    .pipe(gulp.dest(opts.distPath + 'css/'));
}

// Watch files
function watchStyle() {
  gulp.watch(opts.devPath + 'scss/**/*.scss', style );
}

function watchCode() {
  gulp.watch(opts.devPath + 'js/**/*.js', scripts );
}

function watchImages() {
  gulp.watch(opts.devPath + 'img/**/*', imageMinify );
}


const style = gulp.parallel(mainCSS, CSS, cssAtf);
const scripts = gulp.parallel(vendorScript, userScript, mainScript);
const BuildAll = gulp.series(clean, gulp.parallel( imageMinify, createPot, buildMainCSS, buildCSS, cssAtf, scripts ));
const watch = gulp.parallel(watchStyle, watchCode, watchImages);

exports.createPot = createPot;
exports.style = style;
exports.scripts = scripts;
exports.vendorScript = vendorScript;
exports.userScript = userScript;
exports.cssAtf = cssAtf;
exports.CSS = CSS;
exports.mainCSS = mainCSS;
exports.buildCSS = buildCSS;
exports.buildMainCSS = buildMainCSS;
exports.imageMinify = imageMinify;
exports.BuildAll = BuildAll;
exports.watch = watch;
exports.default = watch;