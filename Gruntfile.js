// Обязательная обёртка
module.exports = function (grunt) {
    var fs = require("fs");
    var lic = fs.readFileSync('LICENSE').toString();

    // Задачи
    grunt.initConfig({
        // Склеиваем
        concat: {
            core: {
                src: [
                    'src/**/*.js'
                ],
                dest: 'grand.js'
            }
        },
        // Сжимаем
        uglify: {
            core: {
                files: {
                    // Результат задачи concat
                    'grand.min.js': '<%= concat.core.dest %>'
                }
            }
        },
        usebanner: {
            build: {
                options: {
                    position: "top",
                    banner: "/*" + lic + "*/",
                    linebreak: true
                },
                files: {
                    src: ['grand.js', 'grand.min.js']
                }
            }
        },
        watch: {
            core: {
                files: ['src/**/*.js'],
                tasks: ['concat:core', 'uglify:core']
            }
        }
    });

    // Загрузка плагинов, установленных с помощью npm install
    require('load-grunt-tasks')(grunt);

    // Задача по умолчанию
    grunt.registerTask('default', ['concat', 'uglify', 'usebanner']);
};