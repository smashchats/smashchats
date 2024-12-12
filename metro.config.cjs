const path = require("path");
const fs = require("fs");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (
        (moduleName.startsWith(".") || moduleName.startsWith("@/")) &&
        (moduleName.endsWith(".js") || moduleName.endsWith(".jsx"))
    ) {
        const moduleFilePath = path.resolve(
            context.originModulePath,
            "..",
            moduleName
        );

        // if the file exists, we won't remove extension, and we'll fall back to normal resolution.
        // this rule specifically exists for .tsx? files that are imported as .jsx? files.
        if (!fs.existsSync(moduleFilePath)) {
            // console.log(moduleName, moduleName.replace(/\.[^/.]+$/, ''));
            return context.resolveRequest(
                context,
                moduleName.replace(/\.[^/.]+$/, ""),
                platform
            );
        }
    }

    return context.resolveRequest(context, moduleName, platform);
};
config.resolver.extraNodeModules = {
    ...require("node-libs-react-native"),
};
config.resolver.sourceExts.push("sql");

module.exports = config;
