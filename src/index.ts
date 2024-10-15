import fs from "fs";
import { chromium } from "playwright";

// if some content is missing, increase the TIMEOUT
const TIMEOUT = 500;
const url = new URL(
  "https://odcom-69a2f5f05adbd3cd6ee6b80e9fbf1a2f.read.overdrive.com/"
);
const FILE = `${url.hostname}.json`;

console.log("Starting the scraping process...");
// launch the browser
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
// go to the main page
await page.goto(url.origin);
// grab the redirect url
const redirecturl = await page
  .locator("#sample-holder")
  .getAttribute("data-redirecturl");

// redirect to json
let response = await page.goto(redirecturl);
const { src } = await response.json();
// go to the sample book
await page.goto(src);

// wait for the inline frame to finish loading so we can quickly go through the content
// also helps to avoid error handling
const iframe = page.locator("#LENS_CMPT_0 iframe");
await iframe.waitFor({ state: "visible" });

const intervalId = setInterval(async () => {
  await page.keyboard.press("ArrowRight");
}, TIMEOUT);

// get the content
let content: string[] = await page.evaluate(() => {
  return new Promise<string[]>((resolve) => {
    const data: string[] = [];
    document.addEventListener(
      "keydown",
      () => {
        document.querySelectorAll("iframe").forEach((iframe) => {
          const cleanTextContent =
            iframe.contentWindow.document.body?.textContent
              .replaceAll("\r", " ")
              .replaceAll("\n", " ")
              .replaceAll("\t", " ")
              .replaceAll(/\s+/g, " ")
              .replaceAll(/^\s+|\s+$/g, "");
          data.push(cleanTextContent || "");
        });
        // exit when the last page is reached
        if (document.querySelector(".shibui-shade-blind")) {
          resolve(data);
        }
      },
      true
    );
  });
});

// remove duplicates
content = [...new Set(content)];
console.log("Writing to file then exiting...");
// write the content to a file
fs.writeFile(FILE, JSON.stringify(content), async (err) => {
  clearInterval(intervalId);
  await browser.close();
  if (err) return console.error(err);
});
