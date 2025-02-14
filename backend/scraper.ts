import { chromium } from "playwright";

async function scrapeData() {
  const browser = await chromium.launch({ headless: true }); // True para ocultar la pagina
  const page = await browser.newPage();

  try {
    console.log("Abriendo la página principal...");
    await page.goto("https://www.alkhofarsac.com/shop/?count=36&paged=", {
      timeout: 90000,
    });

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

    const products = [];

    for (const link of links) {
      const productPage = await browser.newPage();
      try {
        console.log(`Accediendo a ${link}...`);
        await productPage.goto(link, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });

        const productData = await productPage.evaluate(() => {
          const titleElement = document.querySelector("h1") as HTMLElement;
          const descriptionElement = document.querySelector("#tab-description") as HTMLElement; // Descripcion no encontrada MEJORAR ESTO
    
          const title = titleElement?.innerText.trim() || "Título no encontrado";
          const description = descriptionElement?.textContent?.trim() || "Descripción no encontrada";
    
          return { title, description };
        });

        console.log(`Producto encontrado: ${productData.title}`);
        products.push({ title: productData.title, description: productData.description });

        await productPage.close(); // Cerrar la pestaña del producto

        // Aplicar 'Crawl-delay: 5'
        console.log("Esperando 5 segundos para respetar `robots.txt`...");
        await new Promise((resolve) => setTimeout(resolve, 5000));

      } catch (error) {
        console.error(`Error al extraer el producto ${link}:`, error);
        products.push({ title: "Error al extraer", link });
        await productPage.close();
      }
    }
    return { products };

  } catch (error) {
    console.error("Error en el scraper:", error);
    return { error: "No se pudo obtener la información" };
  } finally {
    await browser.close();
  }
}

export default scrapeData;
