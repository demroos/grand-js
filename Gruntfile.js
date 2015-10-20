// Обязательная обёртка
module.exports = function (grunt) {

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
    grunt.registerTask('default', ['concat', 'uglify']);
};