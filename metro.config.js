const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.resolver.blockList = [/node_modules\/.*\/Example\/.*/];

module.exports = withNativeWind(config, { input: './app/global.css' });
