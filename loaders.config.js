module.exports = [
    {
        test: /\.jsx?$/,
        loader: 'babel?presets[]=react,presets[]=es2015',
        exclude: /(node_modules|bower_components)/
    },
    {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
    },
    {
        test: /\.styl$/,
        loader: 'style-loader!css-loader!stylus-loader'
    },
    {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
    }
]