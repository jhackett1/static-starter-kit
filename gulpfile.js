const { src, dest, watch, series, parallel } = require("gulp")
const sass = require("gulp-sass")
const webpack = require("webpack-stream")
const fs = require("fs")
const nunjucks = require("gulp-nunjucks")
const yaml = require("yaml")
const cleanCss = require("gulp-clean-css")
const imagemin = require("gulp-imagemin")
const browserSync = require("browser-sync").create()
const eslint = require("gulp-eslint")
sass.compiler = require("node-sass")


// Run live reload server
const runServer = () => {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    })
}


////////////
// HTML
////////////

// Watch for HTML changes, then compile
const watchHtml = () => {
    watch("./src/*.html", compileHtml)
        .on("change", browserSync.reload)
}
// Compile HTML templates
const compileHtml = () => {
    return src("./src/*.html")
        .pipe(nunjucks.compile(yaml.parse(fs.readFileSync("./content.yml", "utf8"))))
        .pipe(dest("dist"))
}


////////////
// SASS
////////////

// Watch for sass changes, then compile
const watchSass = () => {
    watch(["src/sass/*"], compileSass)
}
// Compile sass
const compileSass = () => {
    return src("./src/sass/main.sass")
        .pipe(sass({
            includePaths: ["node_modules"]
        }).on("error", sass.logError))
        .pipe(dest("dist/css"))
        .pipe(browserSync.stream())
}
// Minify CSS
const minifyCss = () => {
    return src("./dist/*.css")
        .pipe(cleanCss({compatibility: "ie8"}))
        .pipe(dest("dist/css"))
}


////////////
// IMAGES
////////////

// Shrink images for production build
const compressImages = () => {
    return src("./src/img/*")
        .pipe(imagemin())
        .pipe(dest("dist/img"))
}
// Watch images folder
const watchImages = () => {
    watch(["./src/img/*"], compressImages)
        .on("change", browserSync.reload)
}


////////////
// JS
////////////

// Lint javascript
const lint = () => {
    return src("./src/js/*.js")
        .pipe(eslint())
        .pipe(eslint.format())
        // Make sure that lint errors break the build
        .pipe(eslint.failAfterError())
}
// Production webpack configuration object
let webpackConfig = {
    mode: "production",
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["css-loader"],
              },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ["env", 
                              {
                                targets: {
                                  browsers: ["last 2 Chrome versions"]
                                }
                              }
                            ]
                        ]
                    }
                }
            }
        ]
    },
    output: {
        filename: "bundle.js"
    }
}
// Transpile js
const transpileJs = () => {
    return src("./src/js/main.js")
        .pipe(webpack(webpackConfig))
        .pipe(dest("dist/js"))
}
// Watch js
const watchJs = (cb) => {
    webpackConfig.mode = "development"
    webpackConfig.watch = true
    src("./src/js/main.js")
        .pipe(webpack(webpackConfig))
        .pipe(dest("dist/js"))
        .pipe(browserSync.stream())
}


////////////
// OTHER FILES
////////////

// Watch for changes to static files, then copy them
const watchFiles = () => {
    watch(["src/static/**/*.*"], copyFiles)
        .on("change", browserSync.reload)
}
// Copy other files
const copyFiles = () => {
    return src([
        "./src/static/**/*.*"
    ])
        .pipe(dest("dist"))
}


// Lint only
exports.lint = lint
// Production build task
exports.build = series(compileHtml, compileSass, minifyCss, lint, transpileJs, compressImages, copyFiles)
// Default watch task
exports.default = parallel(runServer, watchHtml, watchSass, watchJs, watchImages, watchFiles)