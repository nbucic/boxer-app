const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// noinspection JSCheckFunctionSignatures
module.exports = withNativeWind(config, { input: './app/global.css' });
