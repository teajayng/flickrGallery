module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    express: {
      web: {
        options: {
          script: 'server.js'
        }
      },
    },

    watch: {
      frontend: {
        options: {
          livereload: true
        },
        files: [
          'styles/*.css',
          'scripts/*.js'
        ]
      },

      sass: {
        files: [
          'sass/*.scss'
        ],
        tasks: [
          'sasslint', 'sass'
        ]
      },

      scripts: {
        files: [
          'js/utils.js',
          'js/gallery.js',
          'js/main.js'
        ],
        tasks: [
          'jshint', 'concat'
        ]
      },

      web: {
        files: [
          'server.js',
        ],
        tasks: [
          'express:web', 'open'
        ],
        options: {
          nospawn: true,
          atBegin: true
        }
      }
    },

    parallel: {
      web: {
        options: {
          stream: true
        },
        tasks: [{
          grunt: true,
          args: ['watch:frontend']
        }, {
          grunt: true,
          args: ['watch:sass']
        }, {
          grunt: true,
          args: ['watch:scripts']
        }, {
          grunt: true,
          args: ['watch:web']
        }]
      }
    },

    open: {
      dev: {
        path: 'http://localhost:3000',
        app: 'Google Chrome'
      }
    },

    sass: {
      dist: {
        files: {
          'styles/style.css' : 'sass/style.scss'
        }
      }
    },

    concat: {
      options: {
        separator: ';'
      },

      js: {
        src: [
          'js/utils.js',
          'js/gallery.js',
          'js/main.js'
        ],
        dest: 'scripts/main.js'
      }
    },

    sasslint: {
      target: [ 'sass/*.scss' ]
    },

    jshint: {
      all: [ 'Gruntfile.js', 'js/*.js' ]
    }
  });

  grunt.registerTask('web', [ 'parallel:web' ]);
  grunt.registerTask('default', [ 'web' ]);
};
