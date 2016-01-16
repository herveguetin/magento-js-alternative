var entry = './src/app.js',
    output = {
        path: __dirname,
        filename: 'app.js'
    };

module.exports.development = {
    debug: true,
    devtool: 'eval',
    entry: entry,
    output: output,
    node: {
        fs: "empty" // This avoids handlebars error
    },
    resolve: {
        alias: {
            'handlebars': 'handlebars/dist/handlebars.min.js'
        }
    },
    module: {
        loaders: [
            {test: /\.js?$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    }
};

module.exports.production = {
    debug: false,
    entry: entry,
    output: output,
    node: {
        fs: "empty"
    },
    resolve: {
        alias: {
            'handlebars': 'handlebars/dist/handlebars.min.js'
        }
    },
    module: {
        loaders: [
            {test: /\.js?$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    }
};