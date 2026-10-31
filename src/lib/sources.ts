export interface BulletinSource {
    fuente: string;
    municipio: string;
    url: string;
}

export function getBulletinSources(): BulletinSource[] {
    const envFeeds = process.env.BULLETIN_FEEDS;
    if (!envFeeds) {
        // Fuentes por defecto si no se configuran en el .env
        return [
            { fuente: 'BOE', municipio: 'Nacional', url: 'https://www.boe.es/rss/boe.php' },
            { fuente: 'BOCM', municipio: 'Madrid', url: 'https://www.bocm.es/rss' },
        ];
    }

    // Formato esperado en .env: FUENTE|Municipio|URL,FUENTE|Municipio|URL
    return envFeeds.split(',').map(item => {
        const [fuente, municipio, url] = item.split('|');
        return { fuente, municipio, url };
    });
}