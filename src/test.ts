import fs from "fs";
import { chromium, Frame } from "playwright";

const url = new URL(
  "https://odcom-69a2f5f05adbd3cd6ee6b80e9fbf1a2f.read.overdrive.com/"
);
const FILE = `${url.hostname}.json`;

console.log("Starting the scraping process...");
const browser = await chromium.launch({ headless: false, devtools: true });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(url.origin);

const redirecturlData = await page
  .locator("#sample-holder")
  .getAttribute("data-redirecturl");
let response = await page.goto(redirecturlData);
const { src } = await response.json();

response = await page.goto(src);

const responsePromise = page.waitForResponse(`${url.origin}/about_book.html*`);

response = await responsePromise;
console.log(response.status());
// wait for page to load

const frameContent = await page
  .locator(".chapter-bar-next-button", { has: page.locator("span") })
  .evaluate((element: HTMLElement) => {
    return new Promise((resolve) => {
      let counter = 0;
      const content = [];
      const intervalId = setInterval(async () => {
        element.click();
        content.push(
          document.querySelector("iframe").contentWindow.document.body
            .textContent
        );
        counter++;
        if (counter === 10) {
          clearInterval(intervalId);
          resolve(content);
        }
      }, 1000);
    });
  });

console.log(123, frameContent);

fs.writeFileSync(FILE, JSON.stringify(frameContent));

await browser.close();
