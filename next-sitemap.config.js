/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://www.careeroadmap.com', // 🔁 Replace with your actual domain
    generateRobotsTxt: true, // ✅ Automatically generate robots.txt
    sitemapSize: 5000,
    changefreq: 'weekly',
    priority: 0.7,
    exclude: ['/api/*'], // optional, paths you want to exclude from sitemap
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api'],
            },
        ],
        additionalSitemaps: [
            'https://www.careeroadmap.com/sitemap.xml',
        ],
    },
};
