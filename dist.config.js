module.exports = {
    entry: './src/index.jsx',
    output: {
        path         : __dirname + '/dist',
        libraryTarget: 'umd',
        library      : 'ReactSlider',
        filename     : 'react-slider.js'
    },
    module: {
        loaders: require('./loaders.config')
    },
    externals: {
        'react': 'React'
    },
    resolve: {
        // Allow to omit extensions when requiring these files
        extensions: ['', '.js', '.jsx']
    }
}