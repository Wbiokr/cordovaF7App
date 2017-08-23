var scanner = require('i18next-scanner')
  , vfs = require('vinyl-fs')
  , fs = require('fs')
  , path = require('path')
  , _ = require('lodash');


// npm install --save-dev i18next-scanner
// npm install --save-dev lodash
// npm install --save-dev sha1

// zip -R tommy_app_i18n.zip '*en-US.json' '*zh-CN.json'

// class="center sliding">([a-zA-Z\s]*)</
// class="center sliding">{{i18n "replace_$1" defaultValue="$1"}}</


var unquote = function(str, quoteChar) {
    quoteChar = quoteChar || '"';
    if (str[0] === quoteChar && str[str.length - 1] === quoteChar) {
        return str.slice(1, str.length - 1);
    }
    return str;
};

// Parses hash arguments for Handlebars block helper
// @see [Hash Arguments]{@http://code.demunskin.com/other/Handlebars/block_helpers.html#hash-arguments}
// @see [Regular expression for parsing name value pairs]{@link http://stackoverflow.com/questions/168171/regular-expression-for-parsing-name-value-pairs}
// @example <caption>Example usage:</caption>
// it will output ["id=nav-bar", "class = "top"", "foo = "bar\"baz""]
// var str = ' id=nav-bar class = "top" foo = "bar\\"baz" ';
// str.match(/([^=,\s]*)\s*=\s*((?:"(?:\\.|[^"\\]+)*"|'(?:\\.|[^'\\]+)*')|[^'"\s]*)/igm) || [];
// @param [string] str A string representation of hash arguments
// @return {object}
var parseHashArguments = function(str) {
    var hash = {};

    const results = str.match(/([^=,\s]*)\s*=\s*((?:"(?:\\.|[^"\\]+)*"|'(?:\\.|[^'\\]+)*')|[^'"\s]*)/igm) || [];
    results.forEach(function(result) {
        result = _.trim(result);
        const r = result.match(/([^=,\s]*)\s*=\s*((?:"(?:\\.|[^"\\]+)*"|'(?:\\.|[^'\\]+)*')|[^'"\s]*)/) || [];
        if (r.length < 3 || _.isUndefined(r[1]) || _.isUndefined(r[2])) {
            return;
        }

        var key = _.trim(r[1]);
        var value = _.trim(r[2]);

        { // value is enclosed with either single quote (') or double quote (") characters
            const quoteChars = '\'"';
            const quoteChar = _.find(quoteChars, (quoteChar) => {
                return value.charAt(0) === quoteChar;
            });
            if (quoteChar) { // single quote (') or double quote (")
                value = unquote(value, quoteChar);
            }
        }

        hash[key] = value;
    });

    return hash;
};


// Custom transformer for Handlebars helper syntax
var customTransform = function(file, enc, done) {
    var parser = this.parser;
    var extname = path.extname(file.path);
    var content = fs.readFileSync(file.path, enc);

    // function helper
    (function() {
        var results = content.match(/{{t\s+("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')?([^}]*)}}/gm) || [];
        _.each(results, function(result) {
            var key, value;
            var r = result.match(/{{t\s+("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')?([^}]*)}}/m) || [];

            if (! _.isUndefined(r[1])) {
                key = _.trim(r[1], '\'"');

                // Replace double backslash with single backslash
                key = key.replace(/\\\\/g, '\\');
                key = key.replace(/\\\'/, '\'');                              
            }

            var params = parseHashArguments(r[2]);
            if (_.has(params, 'defaultValue')) {
                value = params['defaultValue'];
            }
                
            if (_.isUndefined(key)) { // && _.isUndefined(value)
                return;
            }

            console.log('Setting', key, '=', value)
            parser.set(key, value);
        });
    }());

    // block helper
    // (function() {
    //     var results = content.match(/{{#i18n\s*([^}]*)}}((?:(?!{{\/i18n}})(?:.|\n))*){{\/i18n}}/gm) || [];
    //     _.each(results, function(result) {
    //         var key, value;
    //         var r = result.match(/{{#i18n\s*([^}]*)}}((?:(?!{{\/i18n}})(?:.|\n))*){{\/i18n}}/m) || [];

    //         if ( ! _.isUndefined(r[2])) {
    //             value = _.trim(r[2], '\'"');
    //         }

    //         if (_.isUndefined(value)) {
    //             return;
    //         }

    //         key = hash(value); // returns a hash value as its default key
    //         parser.parseKey(key, value);
    //     });
    // }());

    done();
};

// See options at https://github.com/i18next/i18next-scanner#options 
var options = {
    lngs: ['en-US', 'zh-CN'],
    resource: {
        loadPath: 'www/locales/{{lng}}.json',
        savePath: 'locales/{{lng}}.json',
    }
};

vfs.src(['www/**/*.html'])
  .pipe(scanner(options, customTransform))
  .pipe(vfs.dest('www'));