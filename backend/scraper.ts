import { chromium } from "playwright";
import pool from "./db";

async function scrapeData() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext(); //  eVitar abrir muchas ventanas
    const page = await context.newPage();
    const client = await pool.connect(); // Conectar a Postgres
    
    try {
        console.log("Abriendo la página principal...");
        await page.goto("https://www.alkhofarsac.com/shop/?count=36&paged=", { timeout: 90000 });

        // Esperar que cargue completamente
        await page.waitForLoadState("networkidle");
        await page.waitForSelector(".products li", { timeout: 60000 });

        console.log("Extrayendo enlaces de productos...");
        const links: string[] = await page.evaluate(() => {
            return Array.from(
                document.querySelectorAll(".products li a.product-loop-title")
            ).map((item) => (item as HTMLAnchorElement).href);
        });

        console.log(`Se encontraron ${links.length} productos.`);

        // Procesar productos en paralelo para mejorar velocidad
        await Promise.all(
            links.map(async (link) => {
                const productPage = await context.newPage();
                try {
                    console.log(`Accediendo a ${link}...`);
                    await productPage.goto(link, { waitUntil: "domcontentloaded", timeout: 60000 });

                    const productData = await productPage.evaluate(() => {
                        const titleElement = document.querySelector("h1") as HTMLElement;
                        const descriptionElement = document.querySelector("#tab-description") as HTMLElement;
                        const imageElement = document.querySelector(".ms-slide-bgcont img") as HTMLImageElement;

                        return { 
                            title: titleElement?.innerText.trim() || "Título no encontrado",
                            description: descriptionElement?.textContent?.trim() || "Descripción no encontrada",
                            imageSrc: imageElement?.src || "Imagen no encontrada"
                        };
                    });

                    console.log(`Guardando producto en la base de datos: ${productData.title}`);
                    
                    try {
                        await client.query(
                            "INSERT INTO productos (title, description, imgsrc) VALUES ($1, $2, $3)", 
                            [productData.title, productData.description, productData.imageSrc]
                        );
                    } catch (dbError) {
                        console.error("Error al guardar en la base de datos:", dbError);
                    }

                    await productPage.close();

                    //Respetar el craw-delay de la pagina Alkhofar
                    console.log("Esperando 5 segundos para respetar ´robots.txt´...")
                    await new Promise(resolve => setTimeout(resolve, 5000));

                } catch (error) {
                    console.error(`Error en ${link}:`, error);
                    await productPage.close();
                }
            })
        );

        return { message: "Scraping completo y datos guardados en PostgreSQL" };

    } catch (error) {
        console.error("Error en el scraper:", error);
        return { error: "No se pudo obtener la información" };
    } finally {
        client.release(); // Liberar conexión de PostgreSQL
        await browser.close(); // Cerrar navegador
    }
}

export default scrapeData;
