const path = require("path");
const { GITHUB_DOCS, DEFAULT_LOCALE } = require("./consts");
const { REDIRECTS } = require("./routes");

const DOCUSAURUS_PLUGIN_OG = [
    path.resolve(__dirname, "./plugins/docusaurus-plugin-og"),
    {
        templatesDir: path.resolve(__dirname, "config/og"),
    },
];

/**
 * Hide category index pages from sidebar ()
 * TODO: Remove custom generator after issue fix
 * https://github.com/facebook/docusaurus/issues/5689
 * @see https://docusaurus.io/docs/sidebar/autogenerated#customize-the-sidebar-items-generator
 */
async function sidebarItemsGenerator({
    defaultSidebarItemsGenerator,
    ...args
}) {
    const sidebarItems = await defaultSidebarItemsGenerator(args);
    const isCategoryIndex = (it) =>
        it.type === "doc" && (it.id === "index" || it.id?.includes("/index"));
    return sidebarItems.filter((it) => !isCategoryIndex(it));
}

/** @type {import('@docusaurus/types').DocusaurusConfig["presets"]} */
const presets = [
    [
        "@docusaurus/preset-classic",
        {
            docs: {
                path: `i18n/${DEFAULT_LOCALE}/docusaurus-plugin-content-docs/current`,
                breadcrumbs: true,
                editLocalizedFiles: true,
                sidebarPath: require.resolve("./sidebars.docs.js"),
                editUrl: `${GITHUB_DOCS}/edit/master/`,
                // // Equivalent to `enableUpdateBy`.
                // showLastUpdateAuthor: true,
                // Equivalent to `enableUpdateTime`.
                // FIXME: convert DD/MM/YYYY format
                showLastUpdateTime: true,
                versions: {
                    current: {
                        label: `v2.0.0 🍰`,
                    },
                },
                sidebarItemsGenerator,
            },
            blog: {
                showReadingTime: true,
                editUrl: `${GITHUB_DOCS}/edit/master/blog/`,
                onInlineAuthors: "ignore",
            },
            theme: {
                customCss: require.resolve("../../src/app/index.scss"),
            },
            // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-sitemap
            sitemap: {
                changefreq: "weekly",
                priority: 0.5,
            },
        },
    ],
];

/** @type {import('@docusaurus/types').DocusaurusConfig["plugins"]} */
const plugins = [
    // https://docusaurus.io/docs/docs-multi-instance
    [
        "@docusaurus/plugin-content-docs",
        {
            id: "community",
            breadcrumbs: true,
            // !!! FIXME: Adapt for i18n
            path: `i18n/en/docusaurus-plugin-content-docs/community`,
            editLocalizedFiles: true,
            routeBasePath: "community",
            editUrl: `${GITHUB_DOCS}/edit/master/`,
            sidebarPath: require.resolve("./sidebars.community.js"),
            showLastUpdateAuthor: true,
            showLastUpdateTime: true,
            sidebarItemsGenerator,
        },
    ],
    // https://www.npmjs.com/package/docusaurus-plugin-sass
    "docusaurus-plugin-sass",
    // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-client-redirects
    [
        "@docusaurus/plugin-client-redirects",
        {
            // NOTE: Редиректы работают при прямом переходе по ссылке в адресной строке
            // Если же переходить чисто по ссылкам, то редиректа не будет (только при обновлении страницы)
            // TODO: Сделать позже, чтоб редирект работал и при переходе с внутренних ссылок
            // И убрать хардкод с доки и конфига
            redirects: REDIRECTS,
        },
    ],
    // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-ideal-image
    [
        "@docusaurus/plugin-ideal-image",
        {
            quality: 70,
            max: 1030, // max resized image's size.
            min: 640, // min resized image's size. if original is lower, use that size.
            steps: 2, // the max number of images generated between min and max (inclusive)
        },
    ],
    "plugin-image-zoom",
    // FIXME: Docusaurus Open Graph Plugin Experimental.
    process.env.OG_EXP && DOCUSAURUS_PLUGIN_OG,
].filter(Boolean);

/** @type {import('@docusaurus/types').DocusaurusConfig["themeConfig"]["algolia"]} */
const algolia = {
    appId: process.env.ALGOLIA_ID,
    apiKey: process.env.ALGOLIA_KEY,
    indexName: "feature-sliced",
    contextualSearch: true,
};

module.exports = { presets, plugins, algolia };
