// Gulp
const gulp = require('gulp');

// Utilities
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('cssnano');
const autoprefixer = require("autoprefixer");
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const fs = require('fs');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const wpPot = require('gulp-wp-pot');

// Gulp plugins
const header = require('gulp-header');
const del = require("del");
const notify = require("gulp-notify");
const zip = require('gulp-zip');

// Misc/global vars
const pkg = JSON.parse(fs.readFileSync('./package.json'));

// Task options
const opts = {
  rootPath: './',
  devPath: './assets/src/',
  distPath: './assets/dist/',

  autoprefixer: {
    dev: {
      cascade: false
    },
    build: {
      cascade: false
    }
  },

  cssnano: {
    compressed: {
      preset: ['default', {
        reduceIdents: {
          keyframes: false
        }
      }]
    },
    extended: {
      preset: ['default', {
        reduceIdents: {
          keyframes: false
        },
        normalizeWhitespace: false
      }]
    }
  },

  sass: {
    dev: {outputStyle: 'expanded'},
    build: {outputStyle: 'compressed'}
  },

  imagemin: {
    settings : ([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({progressive: true}),
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
    '@charset "UTF-8";',
    '/*!' ,
    'Theme Name: <%= wp.themeName %> ' ,
    'Description: <%= wp.description %> ' ,
    'Theme URI: <%= homepage %> ' ,
    'Author: <%= author.name %> ' ,
    'Author URI: <%= author.website %> ' ,
    'Requires at least: 4.9.6 ' ,
    'Tested up to: 5.2 ' ,
    'Requires PHP: 5.6 ' ,
    'Version: <%= version %> ' ,
    'License: GPLv2 or later ' ,
    'License: © <%= new Date().getFullYear() %> <%= author.name %> ' ,
    'License URI: <%= wp.licenseURI %> ' ,
    'Text Domain: <%= wp.textDomain %> ' ,
    'Tags: <%= wp.tags %> ' ,
    '*/',
    ''
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
    opts.rootPath + 'assets/**/*.map'
  ]).then( paths => {
    console.log('Successfully deleted files and folders:\n', paths.join('\n'));
  });
}

function cleanAssets() {
  return del([
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

// WordPress pot translation file
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
    .pipe(sass(opts.sass.build))
    .on('error', notify.onError('Error: <%= error.message %>,title: "SASS Error"'))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.build),
      cssnano(opts.cssnano.compressed)
    ]))
    .pipe(gulp.dest(opts.distPath + 'css/'));
}

// compile style.scss (the main WordPress style)
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
      cssnano(opts.cssnano.extended)
    ]))
    .pipe(header(opts.banner, pkg))
    .pipe(gulp.dest(opts.rootPath));
}

// compile all other styles that's name is not style.scss or atf
function CSS() {
  return gulp
    .src([
      opts.devPath + 'scss/editor.scss',
      opts.devPath + 'scss/admin.scss'
    ])
    .pipe(sourcemaps.init())
    .pipe(sass(opts.sass.dev))
    .on('error', notify.onError('Error: <%= error.message %>,title: "SASS Error"'))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.dev)
    ]))
    .pipe(gulp.dest(opts.distPath + 'css/'))
    .pipe(sourcemaps.write('.', { sourceRoot: '/' }))
    .pipe(gulp.dest(opts.distPath + 'css/'));
}

function buildCSS() {
  return gulp
    .src([
      opts.devPath + 'scss/editor.scss',
      opts.devPath + 'scss/admin.scss'
      ])
    .pipe(sass(opts.sass.build))
    .on('error', notify.onError('Error: <%= error.message %>,title: "SASS Error"'))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.build),
      cssnano(opts.cssnano.compressed)
    ]))
    .pipe(gulp.dest(opts.distPath + 'css/'));
}

// Zip all theme files into /release/version/textDomain.zip
function zipRelease() {
  return gulp
    .src([
      opts.rootPath + 'assets/**/*.*',
      opts.rootPath + 'inc/**/*.*',
      opts.rootPath + 'languages/**/*.*',
      opts.rootPath + 'template-parts/**/*.*',
      opts.rootPath + '*.*',
      '!.gitignore',
      '!./node_modules',
      '!./releases'
    ], {base: '.'})
    .pipe(zip( pkg.wp.textDomain + '.zip'))
    .pipe(gulp.dest(opts.rootPath + '/releases/' + pkg.version + '/' ))
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
const build = gulp.series(cleanAssets, gulp.parallel( imageMinify, createPot, buildMainCSS, buildCSS, cssAtf, scripts ));
const buildRelease = gulp.series(build, clean, zipRelease);
const watch = gulp.parallel(watchStyle, watchCode, watchImages);


// exports
exports.default = build;
exports.watch = watch;
exports.build = build;
exports.buildRelease = buildRelease;

exports.style = style;
exports.scripts = scripts;

exports.createPot = createPot;
exports.imageMinify = imageMinify;
exports.zipRelease = zipRelease;