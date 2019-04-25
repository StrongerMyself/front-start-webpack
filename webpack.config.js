const fs = require('fs')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const autoprefixer = require('autoprefixer')
const TerserJSPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const onHtmlPlugins = (dir) => {
    const files = fs.readdirSync(path.resolve(__dirname, dir))
    return files.map(file => {
        const parts = file.split('.')
        return new HtmlWebpackPlugin({
            template: `${dir}/${file}`,
            filename: `${parts[0]}.html`,
        })
    })
}

const getConfig = (styleLoader, plugins, optimization) => ({
    entry: [
        './src/scripts/index.js',
        './src/styles/styles.sass',
    ], 
    devServer: {
        port: 3000,
        open: true
    },
    module: {
        rules: [
            {
                test: /\.pug$/,
                loader: 'pug-loader',
                options: { pretty: true },
            },
            {
                test: /\.(scss|sass)$/,
                use: [
                    styleLoader,
                    { loader: 'css-loader', options: { sourceMap: true } },
                    { 
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                autoprefixer({
                                    browsers:['ie >= 8', 'last 4 version']
                                })
                            ],
                            sourceMap: true
                        }
                    },
                    { loader: 'sass-loader', options: { sourceMap: true } },
                ],
            },
        ]
    },
    plugins,
    optimization,
})

module.exports = (env, argv) => {
    const HtmlPlugins = onHtmlPlugins('./src/templates/screens')

    let styleLoader = 'style-loader'
    let plugins = [
         ...HtmlPlugins,
    ]
    let optimization = {}

    if (argv.mode === 'development') { }
    if (argv.mode === 'production') {
        styleLoader = MiniCssExtractPlugin.loader
        plugins = [
            ...plugins,
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin()
        ]
        optimization = {
            minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
        }
    }

    return getConfig(styleLoader, plugins, optimization)
}
