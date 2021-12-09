import del from 'del';
import { paths, config } from './config';

export function clean() {
    const sitePaths = [`${paths.site}**/*`, `!${paths.site}*.manifest`, `!${paths.site}*.lic`, `!${paths.site}*.key`];
    const siteNetCorePaths = [`${paths.siteNetCore}**/*`, `!${paths.siteNetCore}*.manifest`, `!${paths.siteNetCore}*.lic`, `!${paths.siteNetCore}*.key`];

    return del(config.prod
        ? [paths.dest]
        : [...sitePaths, ...siteNetCorePaths], { force: true });
}