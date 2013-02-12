var path = require('path');
var fs = require('fs');
var mime = require('mime');
var watch = require('watch');

function ArithmeticIndexer() {
    this.paths = [];
    this.wordMap = {};
}

function fileIsText(entry) {
    var mt = mime.lookup(entry);
    return (mt.indexOf('text/') == 0);
}

var r = /(\w{4,})/g;
function parseTextFile(wordMap, entry) {
    fs.readFile(entry, function (err, content) {
        var str = content.toString().match(r);
        if (str) {
            var map = [];
            for (var i = 0; i < str.length; i++) {
                var w = str[i].toLowerCase();
                switch (w.length) {
                    case 4:
                        if (!map[w]) map[w] = [];
                        break;
                    case 5:
                        var v = w.slice(0, -1);
                        if (!map[v]) map[v] = [];
                        var vv = w.slice(-1);
                        if (map[v].indexOf(vv) == -1) map[v].unshift(vv);
                        break;
                    case 6:
                        var v = w.slice(0, -2);
                        if (!map[v]) map[v] = [];
                        var vv = w.slice(-2);
                        if (map[v].indexOf(vv) == -1) map[v].unshift(vv);
                        break;
                    case 7:
                        var v = w.slice(0, -3);
                        if (!map[v]) map[v] = [];
                        var vv = w.slice(-3);
                        if (map[v].indexOf(vv) == -1) map[v].unshift(vv);
                        break;
                    default:
                        var v = w.slice(0, -4);
                        if (!map[v]) map[v] = [];
                        var vv = w.slice(-4);
                        if (map[v].indexOf(vv) == -1) map[v].unshift(vv);
                }
            }
            wordMap[fs.realpathSync(entry)] = map;
        }
    });
}

ArithmeticIndexer.prototype.addDir = function (path) {
    if (this.paths.indexOf(path) > -1) {
        return;
    }
    this.paths.unshift(path);
    var self = this;
    fs.readdir(path, function (err, entries) {
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            var f = path + '/' + entry;
            var stat = fs.statSync(f);
            if (stat.isDirectory()) {
                ArithmeticIndexer.prototype.addDir.call(self, f);
            } else {
                if (fileIsText(f)) {
                    parseTextFile(self.wordMap, f);
                }
            }
        }
    });
    watch.createMonitor(path, function (monitor) {
        monitor.on("created", function (f, stat) {
            if (stat.isDirectory()) {
                ArithmeticIndexer.prototype.addDir.call(self, f);
            } else {
                if (fileIsText(f)) {
                    parseTextFile(self.wordMap, f);
                }
            }
        });
        monitor.on("removed", function (f, stat) {
            if (stat.isDirectory()) {
                ArithmeticIndexer.prototype.removeDir.call(self, f);
            } else {
                if (fileIsText(f)) {
                    delete self.wordMap[f];
                }
            }
        });
    });
}

ArithmeticIndexer.prototype.removeDir = function (path) {
    for (var i = 0; i < this.paths.langth; i++) {
        if (this.paths[i] == path) {
            delete this.paths[i];
        }
    }
}

ArithmeticIndexer.prototype.searchFor = function (path, search) {
    var ret = [];
    for (var i = 0; i < this.paths.length; i++) {
        if (this.paths[i] == path) {
            for (var f in this.wordMap) {
                if (f.indexOf(path) == 0) {
                    var terms = search.toLowerCase().split(" ");
                    var map = this.wordMap[f];
                    for (var j = 0; j < terms.length; j++) {
                        var w = terms[j];
                        var found = false;
                        switch (w.length) {
                            case 4:
                                if (map[w]) found = true;
                                break;
                            case 5:
                                var v = w.slice(0, -1);
                                if (map[v]) {
                                    /*var vv = w.slice(-1);
                                    if (map[v].indexOf(vv) > -1)*/ found = true;
                                }
                                break;
                            case 6:
                                var v = w.slice(0, -2);
                                if (map[v]) {
                                    /*var vv = w.slice(-2);
                                    if (map[v].indexOf(vv) > -1)*/ found = true;
                                }
                                break;
                            case 7:
                                var v = w.slice(0, -3);
                                if (map[v]) {
                                    /*var vv = w.slice(-3);
                                    if (map[v].indexOf(vv) > -1)*/ found = true;
                                }
                                break;
                            default:
                                var v = w.slice(0, -4);
                                if (map[v]) {
                                    /*var vv = w.slice(-4);
                                    if (map[v].indexOf(vv) > -1)*/ found = true;
                                }
                        }
                        if (found) {
                            ret.unshift(f.slice(path.length - f.length));
                            break;
                        }
                    }
                }
            }
        }
    }
    return ret;
}

// Default instance
var indexer = new ArithmeticIndexer();

indexer.ArithmeticIndexer = ArithmeticIndexer;

module.exports = indexer;
