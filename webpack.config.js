const fs = require('fs')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const autoprefixer = require('autoprefixer')
const TerserJSPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

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
    resolve: {
        alias: {
            src: path.resolve(__dirname, 'src/')
        },
        extensions: ['.js', '.json', 'sass', 'scss', 'pug'],
    },
    devServer: {
        port: 3000,
        open: true,
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
            {
				test: /\.(jpe?g|png|gif|svg)$/i,
				use: [{
					loader: 'file-loader',
					options: {
                        name: '[name].[ext]',
                        outputPath: './images'
					}
				}]
			},
            {
				test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
				use: [{
					loader: 'file-loader',
					options: {
                        name: '[name].[ext]',
                        outputPath: './fonts'
					}
				}]
			},
        ]
    },
    plugins,
    optimization,
})

module.exports = (env, argv) => {
    let styleLoader = 'style-loader'
    let plugins = [
        ...onHtmlPlugins('./src/templates/screens'),
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, 'src/assets'),
            to: path.resolve(__dirname, 'dist'),
        }]),
    ]
    let optimization = {}

    if (argv.mode === 'development') { }
    if (argv.mode === 'production') {
        styleLoader = MiniCssExtractPlugin.loader
        plugins = [
            ...plugins,
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin(),
        ]
        optimization = {
            minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
        }
    }

    return getConfig(styleLoader, plugins, optimization)
}
