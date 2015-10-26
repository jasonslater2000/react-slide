module.exports = {
    entry: './index.jsx',
    output: {
        publicPath: '/assets/'
    },
    module: {
        loaders: require('./loaders.config')
    },
    externals: {
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    devServer: {
        publicPath: '/assets/',
        port: 8081,
        host: '0.0.0.0',
        hot: true,
        historyApiFallback: true
    }
}