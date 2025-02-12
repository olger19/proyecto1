import { chromium } from 'playwright';


async function scrapeData() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto('https://www.alkhofarsac.com/'); // Cambia esto por la URL real

    const title = await page.title();
    
    await browser.close();

    return { title };
}

export default scrapeData;