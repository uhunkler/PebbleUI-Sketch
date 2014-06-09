gulp = require "gulp"
gutil = require "gulp-util"
debug = require "gulp-debug"
frontmatter = require "gulp-front-matter"
grep = require "gulp-grep-stream"
highlight = require "gulp-highlight"
less = require "gulp-less"
livereload = require "gulp-livereload"
markdown = require "gulp-markdown"
path = require "path"
plumber = require "gulp-plumber"
rename = require "gulp-rename"
replace = require "gulp-replace"
tap = require "gulp-tap"
watch = require "gulp-watch"
wrap = require "gulp-wrap"

_level = ''
_date = new Date().toISOString().split('T')[0]

###
 * Add the date to the file object. The date will be used in the template
 * for the article date stamp.
###
setDateOnFile = (file, t) ->
  unless file.unodo
    file.unodo = {}
  file.unodo.date = _date
  return

###
 * Get the frontMatter "level" variable and set _level
 * to the value to be able to use it for replace in
 * the addLevel function.
###
getFrontMatterLevel = (file, t) ->
  @_level = file.frontMatter.level
  return

###
 * Add the _level from frontMatter in front of img urls.
###
addLevel = (found) ->
  if found.indexOf('http') is -1
    s = found.replace(/src="/, "src=\"#{@_level}")
  # gutil.log(s)
  return s

###
 * Set up the Markdown to HTML converter task
 *
 * The task steps:
 * Take the Markdown files from "./src/documents/"
 * Watch the ".md" files and trigger the task for the changed files only
 * Read the frontmatter and store the variables on the file object
 * Convert the Markdown text
 * Replace fake end tags like '<section data-type="end"/>' with the HTML end
 *   tag </section>
 * Remove the "/" from fake start tags like <header/> or <header id="main"/>
 * Wrap the converted Markdown text with the page HTML template (html, head, body)
 *   and replace the variables in the template with the values from the frontmatter
 * Rename the file extension from ".md" to ".html"
 * Save the file to the destination
 * Trigger livereload to reload the page in the browser
###
gulp.task "md2html", ->
  gulp.src(["./src/documents/**/*.md"])
    .pipe(watch())
    .pipe(plumber()) # This will keeps pipes working after error event
    .pipe(frontmatter())
    .pipe(markdown())
    .pipe(replace(/<(\w*) data-type=.end.\/>/g, "</$1>"))
    .pipe(replace(/<(.*?)\/>/g, "<$1>"))
    .pipe(replace(/<h(\d) (.*?)>/g, '<h$1 class="content-subhead" $2>'))
    .pipe(replace(/<(img\s)([^>]*)>/g, '<$1 class="pure-img-responsive" $2>'))
    .pipe(tap(setDateOnFile))
    .pipe(wrap({src: "./src/wrappers/page-wrapper.html"},
      {claim: "Sketch template and plugin for the Pebble UI"}, {variable: "data"}))
    .pipe(tap(getFrontMatterLevel))
    .pipe(replace(/<img.*src="([^"]*)"/g, addLevel))
    .pipe(replace(/class="(\w+)-\1/, 'class="menu-item-divided pure-menu-selected'))
    .pipe(highlight())
    .pipe(rename({extname: ".html"}))
    .pipe(gulp.dest("./pages/"))
    .pipe(livereload())
  return

gulp.task "index", ->
  gulp.src(["./src/index/*.md"])
    .pipe(watch())
    .pipe(plumber()) # This will keeps pipes working after error event
    .pipe(frontmatter())
    .pipe(markdown())
    .pipe(replace(/<(\w*) data-type=.end.\/>/g, "</$1>"))
    .pipe(replace(/<(.*?)\/>/g, "<$1>"))
    .pipe(replace(/<h(\d) (.*?)>/g, '<h$1 class="content-subhead" $2>'))
    .pipe(replace(/<(img\s)([^>]*)>/g, '<$1 class="pure-img-responsive" $2>'))
    .pipe(tap(setDateOnFile))
    .pipe(wrap({src: "./src/wrappers/page-wrapper.html"},
      {claim: "Sketch template and plugin for the Pebble UI", date: "#{@_date}"},
      {variable: "data"}))
    .pipe(replace(/class="(\w+)-\1/, 'class="menu-item-divided pure-menu-selected'))
    .pipe(rename({extname: ".html"}))
    .pipe(gulp.dest("./"))
    .pipe(livereload())
  return

###
 *
 *
###
gulp.task "less", ->
  gulp.src(["./src/less/**/*.less"], {read: false})
    .pipe(watch({emit: 'all'}, (files) ->
      files
        .pipe(grep('**/less/styles.less'))
        # .pipe(debug({title: 'grepped files:', verbose: false}))
        .pipe(less({
          # compress: true
        }))
        .pipe(gulp.dest('./css'))
        .pipe(livereload())
      ))
    .pipe(plumber()) # This will keeps pipes working after error event
  return

gulp.task "less-production", ->
  gulp.src(["./src/less/**/*.less"], {read: false})
    .pipe(watch({emit: 'all'}, (files) ->
      files
        .pipe(grep('**/less/styles.less'))
        .pipe(less({
          compress: true
        }))
        .pipe(gulp.dest('./css'))
        .pipe(livereload())
      ))
    .pipe(plumber()) # This will keeps pipes working after error event
  return

###
 * Define the default gulp task which is called
 * when gulp is started without a specific task
 *
 * Add "md2html" as a dependency to trigger it when "default" is called
###
gulp.task "default", ["less", "index", "md2html"], ->
  return

gulp.task "production", ["less-production", "index", "md2html"], ->
  return
