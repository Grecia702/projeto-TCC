module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'react-native-reanimated/plugin',
            ['module:react-native-dotenv', {
                moduleName: '@env',
                path: '.env',
                blacklist: null,
                whitelist: null,
                safe: false,
                allowUndefined: true,
            }],
            ['module-resolver', {
                root: ['./'],
                alias: {
                    '@context': './src/context',
                    '@components': './src/components',
                    '@utils': './src/utils',
                    '@hooks': './src/hooks',
                    '@screens': './src/screens',
                    '@assets': './assets',
                },
            }],
        ]
    };
};
