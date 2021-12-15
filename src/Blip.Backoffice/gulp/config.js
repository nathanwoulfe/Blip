const backofficePath = './src/Blip/Backoffice';

// two directories up to the test sites
// but build into /src

export const paths = {
    js: [`${backofficePath}/**/*.ts`],
    viewsDev: [`${backofficePath}/**/*.html`],
    viewsProd: [`${backofficePath}/**/*.html`, `!${backofficePath}/**/components/**/*.html`],
    scss: `${backofficePath}/**/*.scss`,
    lang: `./src/Blip/Lang/*.xml`,
    manifest: './src/Blip/package.manifest',
    dest: './App_Plugins/Blip/',
    site: '../../Blip.Umbraco8/App_Plugins/Blip/',
    siteNetCore: '../../Blip.Umbraco9/App_Plugins/Blip/',
};

export const config = {
    hash: new Date().toISOString().split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0).toString().substring(1)
};
