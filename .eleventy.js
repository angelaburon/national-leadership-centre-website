const { DateTime } = require('luxon');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-es');
const htmlmin = require('html-minifier');
const pluginRss = require('@11ty/eleventy-plugin-rss');

module.exports = function (eleventyConfig) {
  // RSS Plugin
  eleventyConfig.addPlugin(pluginRss);

  // Return active path attributes
  eleventyConfig.addShortcode('activepath', function (itemUrl, currentUrl) {
    if (itemUrl == '/' && itemUrl !== currentUrl) {
      return '';
    }
    if (currentUrl && currentUrl.includes(itemUrl)) {
      return ' data-current="current item" class="current"';
    }
    return '';
  });

  // Check active path for urls
  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('dd LLL yyyy');
  });

  // Date formatting (machine readable)
  eleventyConfig.addFilter('machineDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('yyyy-MM-dd');
  });

  // Minify CSS
  eleventyConfig.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Minify JS
  eleventyConfig.addFilter('jsmin', function (code) {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log('UglifyJS error: ', minified.error);
      return code;
    }
    return minified.code;
  });

  // Get all pages with a URL
  eleventyConfig.addCollection('withUrl', (collection) => {
    return collection.getAll().filter(function (item) {
      return item.url;
    });

    return sortByOrder(team);
  });

  // Sort team members by 'order' field
  eleventyConfig.addCollection('teamMembers', (collection) => {
    var team = collection.getFilteredByTag('team');
    return sortByOrder(team);
  });

  // Sort footer menu items by 'order' field
  eleventyConfig.addCollection('footerNav', (collection) => {
    var nav = collection.getFilteredByTag('footer');
    return sortByOrder(nav);
  });

  // Sort main menu items by 'order' field
  eleventyConfig.addCollection('mainNav', (collection) => {
    var nav = collection.getFilteredByTag('nav');
    return sortByOrder(nav);
  });

  // Sort primary pages by 'order' field
  eleventyConfig.addCollection('primaryNav', (collection) => {
    var nav = collection.getFilteredByTag('primary');
    return sortByOrder(nav);
  });

  function sortByOrder(collection) {
    return collection.sort((a, b) => {
      if (a.data.order < b.data.order) return -1;
      else if (a.data.order > b.data.order) return 1;
      else return 0;
    });
  }

  // Minify HTML output
  eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
    if (outputPath && outputPath.indexOf('.html') > -1) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('static/img');
  eleventyConfig.addPassthroughCopy('static/nlc-programme-brochure.pdf');
  eleventyConfig.addPassthroughCopy('admin');
  eleventyConfig.addPassthroughCopy('_includes/assets/');

  /* Markdown Plugins */
  let markdownIt = require('markdown-it');
  let markdownItAnchor = require('markdown-it-anchor');
  let options = {
    html: true,
    breaks: true,
    linkify: false,
  };
  let opts = {
    permalink: false,
  };

  eleventyConfig.setLibrary(
    'md',
    markdownIt(options).use(markdownItAnchor, opts)
  );

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid'],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: '/',

    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  };
};
