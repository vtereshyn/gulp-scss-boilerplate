const del = require("del");
const gulp = require("gulp");
const scss = require("gulp-sass");
const cache = require("gulp-cache");
const imagemin = require("gulp-imagemin");
const browserSync = require("browser-sync");
const pngquant = require("imagemin-pngquant");

const concat = require("gulp-concat");
const rename = require("gulp-rename");
const uglify = require("gulp-uglifyjs");
const cssnano = require("gulp-cssnano");
const autoprefixer = require("gulp-autoprefixer");

gulp.task("sass", () =>
  gulp
    .src("**/scss/**/*.scss")
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(
      autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7", "ie 6"], {
        cascade: true,
      })
    )
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.reload({ stream: true }))
);

gulp.task("browser-sync", () => {
  browserSync({
    server: {
      baseDir: "app",
    },
    notify: false,
  });
});

gulp.task("scripts", () =>
  gulp
    .src(["app/libs/jquery/dist/jquery.min.js"])
    .pipe(concat("libs.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("app/js"))
);

gulp.task(
  "css-libs",
  gulp.parallel("sass", () =>
    gulp
      .src("**/css/libs.css", { allowEmpty: true })
      .pipe(cssnano())
      .pipe(rename({ suffix: ".min" }))
      .pipe(gulp.dest("app/css"))
  )
);

gulp.task("html", () =>
  gulp.src("app/*.html").pipe(browserSync.reload({ stream: true }))
);

gulp.task("javascript", () =>
  gulp.src("app/js/**/*.js").pipe(browserSync.reload({ stream: true }))
);

gulp.task(
  "watch",
  gulp.parallel("browser-sync", "css-libs", "scripts", () => {
    gulp.watch("app/scss/**/*.scss", gulp.parallel("sass"));
    gulp.watch("app/*.html", gulp.parallel("html"));
    gulp.watch("app/js/**/*.js", gulp.parallel("javascript"));;
  })
);

gulp.task("clean", () => del.sync("dist"));

gulp.task("img", () => {
  gulp
    .src("app/img/**/*")
    .pipe(
      cache(
        imagemin({
          interlaced: true,
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          use: [pngquant()],
        })
      )
    )
    .pipe(gulp.dest("dist/img"));
});

gulp.task(
  "build",
  gulp.parallel("clean", "img", "sass", "scripts", () => {
    const buildCss = gulp
      .src(["app/css/main.css", "app/css/libs.min.css"])
      .pipe(gulp.dest("dist/css"));

    const buildFonts = gulp.src("app/fonts/**/*").pipe(gulp.dest("dist/fonts"));

    const buildJs = gulp.src("app/js/**/*").pipe(gulp.dest("dist/js"));

    const buildHtml = gulp.src("app/*.html").pipe(gulp.dest("dist"));
  })
);

gulp.task("clear", (callback) => cache.clearAll());
