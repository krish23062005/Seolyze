import { chromium } from "playwright-core";
import BrowserBase from "@browserbasehq/sdk";

const bb = new BrowserBase({
  apiKey: process.env.BROWSERBASE_API_KEY,
});

export async function rankTracker(keyword, targetDomain) {
  let browser;
  try {
    const session = await bb.sessions.create({
      browserSettings: { blockAds: true },
    });
    browser = await chromium.connectOverCDP(session.connectUrl);

    const page = browser.contexts()[0].pages()[0];
    page.setDefaultNavigationTimeout(45000);

    let found = null;
    let allResults = [];
    const cleanTarget = targetDomain.replace("www.", "").toLowerCase().trim();

    // DuckDuckGo HTML version is very reliable and doesn't aggressively block scrapers
    await page.goto(
      `https://html.duckduckgo.com/html/?q=${encodeURIComponent(keyword)}`,
      { waitUntil: "domcontentloaded" },
    );
    
    // We can try to click the "Next" button up to 2 times to get ~30-40 results (Top 3 pages)
    // This reduces the maximum wait time from ~60s down to ~25s for the user
    for (let gPage = 0; gPage < 3; gPage++) {
      let pageResults = [];
      try {
        await page.waitForSelector(".result", { timeout: 8000 });
        pageResults = await page.evaluate(() => {
          return Array.from(document.querySelectorAll(".result")).map((resultEl) => {
             const aTitle = resultEl.querySelector("h2.result__title a");
             const aUrl = resultEl.querySelector("a.result__snippet");
             
             let href = aUrl ? aUrl.href : (aTitle ? aTitle.href : "none");
             if (href.includes('/l/?uddg=')) {
                 try {
                     const urlParams = new URLSearchParams(href.split('?')[1]);
                     if (urlParams.get('uddg')) {
                       href = decodeURIComponent(urlParams.get('uddg'));
                     }
                 } catch(e) {}
             }
             
             return {
               url: href,
               domain: href !== "none" ? new URL(href).hostname.replace("www.", "") : "",
               title: aTitle ? aTitle.innerText.trim() : "",
               snippet: aUrl ? aUrl.innerText.trim() : ""
             };
          }).filter(r => r.url !== "none" && r.title && r.url.startsWith("http"));
        });
      } catch (err) {
        console.error("Error evaluating DDG results:", err.message);
      }

      if (!pageResults.length) break;

      for (const r of pageResults) {
        // Prevent duplicates across pages
        if (!allResults.find(existing => existing.url === r.url)) {
          r.position = allResults.length + 1;
          allResults.push(r);
          if (
            !found &&
            (r.domain.toLowerCase().includes(cleanTarget) ||
              cleanTarget.includes(r.domain.toLowerCase()))
          ) {
            found = { ...r, page: gPage + 1 };
          }
        }
      }

      if (found) break; // Exit early if we found it!
      
      // Try to go to next page
      try {
        const nextBtn = await page.$("input[value='Next']");
        if (nextBtn) {
           await Promise.all([
             page.waitForNavigation({ timeout: 15000 }),
             nextBtn.click()
           ]);
           // Small delay to ensure DOM is fully ready for next selector query
           await page.waitForTimeout(500);
        } else {
           break;
        }
      } catch (navErr) {
        break; // Stop if navigation fails
      }
    }

    await browser.close();
    const competitors = allResults
      .filter(
        (r) =>
          !r.domain.toLowerCase().includes(cleanTarget) &&
          !cleanTarget.includes(r.domain.toLowerCase()),
      )
      .slice(0, 10);

    return {
      success: true,
      data: {
        keyword,
        targetDomain,
        position: found?.position || null,
        page: found?.page || null,
        title: found?.title || "",
        snippet: found?.snippet || "",
        competitors,
        totalResultScanned: allResults.length,
      },
    };
  } catch (error) {
    console.error("Rank check error:", error.message);
    if (browser) await browser.close().catch(() => {});

    return { success: false, error: error.message };
  }
}
