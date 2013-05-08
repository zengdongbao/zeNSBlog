/**
 * Created with JetBrains WebStorm.
 * User: Jacky
 * Date: 13-5-8
 * Time: 下午3:45
 * To change this template use File | Settings | File Templates.
 */
var cluster = require('cluster')
    , app = require('./app');

cluster(app)
    .use(cluster.logger('logs'))
    .use(cluster.stats())
    .use(cluster.pidfiles('pids'))
    .use(cluster.cli())
    .use(cluster.repl(8888))
    .listen(3000);