import fs from "fs";
import { chromium, Locator, Page } from "playwright";

const TIMEOUT = 200;
const FILE = "data.json";
const TITLE_SELECTOR = "div.title-page__info";
const BODY_SELECTOR = "div.title-page__description p";
const URL =
  "https://odcom-69a2f5f05adbd3cd6ee6b80e9fbf1a2f.read.overdrive.com/";

// helper function to get text from the page
async function getText(
  page: Page,
  selector: string,
  options: { has: Locator }
) {
  return await page
    .locator(selector, options)
    .evaluate((elements) =>
      [...elements.childNodes]
        .filter((element) => element.nodeType === Node.TEXT_NODE)
        .map((element) => element.textContent)
    );
}

(async () => {
  console.log("Starting the scraping process...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(URL);

  const titleData = await page
    .locator(TITLE_SELECTOR)
    .allInnerTexts()
    .then((text) => text.join("\n").split("\n"));

  const metaData = await page.locator(BODY_SELECTOR).allTextContents();
  metaData.shift();

  // storing data in an object
  const text = {
    meta: [titleData.shift(), ...metaData],
    text: [
      ...(await getText(page, `${BODY_SELECTOR} b`, {
        has: page.locator("i"),
      })),
      ...(await getText(page, BODY_SELECTOR, { has: page.locator("b") })),
    ],
  };

  // increase the timeout if there is an issue with server blocking you
  await page.waitForTimeout(TIMEOUT);
  await browser.close();
  // write data to a file
  fs.writeFile(FILE, JSON.stringify(text), (err) => {
    if (err) return console.log(err);
    console.log("The file was saved!");
  });
})();
