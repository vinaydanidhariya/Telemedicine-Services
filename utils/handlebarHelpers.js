var Handlebars = require('handlebars');
// var util = require('handlebars-utils');
Handlebars.registerHelper('compare', function (lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    operator = options.hash.operator || "==";

    var operators = {
        '==': function (l, r) { return l == r; },
        '===': function (l, r) { return l === r; },
        '!=': function (l, r) { return l != r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        'typeof': function (l, r) { return typeof l == r; }
    }

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);

    var result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});
var helpers = require('handlebars-helpers')({
    handlebars: Handlebars
});

module.exports = {
    defaultLayout: 'default',
    extname: '.hbs',
    // Specify helpers which are only registered on this instance.
    helpers: {

        debug: function (data) {
            console.log(data);
        },

        calculation: function (x, y, operation) {
            console.log(x, y);
            switch (operation) {
                case "-":
                    return x - y;
                case "*":
                    return x * y;
                case "/":
                    return x / y;
                default:
                    return x + y;
            }
        },

        getScript: function (position) {
            var str = "";
            if (typeof blockScript[position] != 'undefined') {
                for (i = 0; i < blockScript[position].length; i++) {
                    str += '<script src="' + blockScript[position][i] + '"></script>'
                }
                blockScript[position] = [];
            }
            return new Handlebars.SafeString(str);
        },

        getCss: function (position) {
            var str = "";
            if (typeof blockCss[position] != 'undefined') {
                for (i = 0; i < blockCss[position].length; i++) {
                    str += '<link rel="stylesheet" href="' + blockCss[position][i] + '" />'
                }
                blockCss[position] = [];
            }
            return new Handlebars.SafeString(str);
        },

        setScript: function () {
            var args = [];
            for (i in arguments) {
                if (typeof arguments[i] == "string")
                    args.push(arguments[i]);
            };
            var position = args.shift();
            if (typeof blockScript[position] == 'undefined') {
                blockScript[position] = [];
            }
            blockScript[position] = blockScript[position].concat(args);
        },

        setCss: function () {
            var args = [];
            for (i in arguments) {
                if (typeof arguments[i] == "string")
                    args.push(arguments[i]);
            };
            var position = args.shift();
            if (typeof blockCss[position] == 'undefined') {
                blockCss[position] = [];
            }
            blockCss[position] = blockCss[position].concat(args);
        }
    }
};
