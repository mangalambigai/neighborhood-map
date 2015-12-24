
module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
        css: {
           src: [
                 'css/*'
                ],
            dest: 'dist/combined.css'
        },
        js : {
            src : [
                'js/*'
            ],
            dest : 'combined.js'
        }
    },
    cssmin: {
        css: {
            src: 'dist/combined.css',
            dest: 'dist/combined.min.css'
        }
    },
    uglify: {
        js: {
            files: {
                'dist/combined.min.js': ['combined.js']
            }
        }
    },
    processhtml: {
      dist: {
        files: {
          'dist/index.html': ['index.html']
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/index.html': 'dist/index.html'
        }
      }
    },
    copy: {
      main: {
        files: [{
          src: 'js/lib/**',
          dest: 'dist/',
          expand: true,
        }, {
          src: 'icons/*.png',
          dest: 'dist/'
        }]
      }
    },
    jshint: {
      options: {
        globals: {
          jQuery: true,
          CITYNAME: true,
          LATITUDE: true,
          LONGITUDE: true,
          google: false,
          map: true,
          viewModel: true,
          window: true,
          document: true,
          activateMarker: false,
          ko: false,
          createNewMarker: false,
          console: false,
          initializeMap: false,
          localStorage: false,
          setTimeout: false,
          $: true,
          infoWindow: true,
          createMarker: false
        }
      },
      all: ['js/map.js', 'js/app.js', 'js/infowindow.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', [ 'concat:css', 'cssmin:css', 'jshint', 'concat:js', 'uglify:js', 'processhtml','htmlmin:dist','copy' ]);
};
