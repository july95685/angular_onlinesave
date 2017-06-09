// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-07-14 using
// generator-karma 1.0.0

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      "jasmine"
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/jquery-bridget/jquery.bridget.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-audio/app/angular.audio.js',
      'bower_components/get-style-property/get-style-property.js',
      'bower_components/get-size/get-size.js',
      'bower_components/eventie/eventie.js',
      'bower_components/doc-ready/doc-ready.js',
      'bower_components/eventEmitter/EventEmitter.js',
      'bower_components/matches-selector/matches-selector.js',
      'bower_components/outlayer/item.js',
      'bower_components/outlayer/outlayer.js',
      'bower_components/masonry/masonry.js',
      'bower_components/imagesloaded/imagesloaded.js',
      'bower_components/angular-masonry/angular-masonry.js',
      'bower_components/angular-messages/angular-messages.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
      'bower_components/angular-wysiwyg/dist/angular-wysiwyg.min.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/ng-file-upload/ng-file-upload.js',
      'bower_components/ngstorage/ngStorage.js',
      'bower_components/rangy/rangy-core.js',
      'bower_components/rangy/rangy-classapplier.js',
      'bower_components/rangy/rangy-highlighter.js',
      'bower_components/rangy/rangy-selectionsaverestore.js',
      'bower_components/rangy/rangy-serializer.js',
      'bower_components/rangy/rangy-textrange.js',
      'bower_components/textAngular/dist/textAngular.js',
      'bower_components/textAngular/dist/textAngular-sanitize.js',
      'bower_components/textAngular/dist/textAngularSetup.js',
      'bower_components/angular-websocket/angular-websocket.min.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/angular-material/angular-material.js',
      'bower_components/angular-timeago/src/timeAgo.js',
      'bower_components/moment/moment.js',
      'bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
      'bower_components/loadcss/src/loadCSS.js',
      'bower_components/angular-cookie/angular-cookie.js',
      'bower_components/videogular/videogular.js',
      'bower_components/videogular-controls/vg-controls.js',
      'bower_components/videogular-overlay-play/vg-overlay-play.js',
      'bower_components/videogular-poster/vg-poster.js',
      'bower_components/photoswipe/dist/photoswipe.js',
      'bower_components/photoswipe/dist/photoswipe-ui-default.js',
      'bower_components/mdPickers/dist/mdPickers.min.js',
      'bower_components/ui-cropper/compile/minified/ui-cropper.js',
      'bower_components/angular-mocks/angular-mocks.js',
      // endbower
      "app/scripts/**/*.js",
      "test/mock/**/*.js",
      "test/spec/**/*.js"
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      "PhantomJS"
    ],

    // Which plugins to enable
    plugins: [
      "karma-phantomjs-launcher",
      "karma-jasmine"
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
