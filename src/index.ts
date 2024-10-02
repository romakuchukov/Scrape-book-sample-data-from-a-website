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
const browser = await chromium.launch();
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

// get the content
const content = await page
  .locator(".chapter-bar-next-button", { has: page.locator("span") })
  .evaluate((element: HTMLElement) => {
    return new Promise((resolve) => {
      let counter = 1;
      const data = [];
      const len = document.querySelectorAll("#spool .sheet").length;
      const intervalId = setInterval(async () => {
        element.click();
        // get the data
        data.push(
          document.querySelector("iframe").contentWindow.document.body
            .textContent
        );
        // exit when done
        if (counter > len) {
          clearInterval(intervalId);
          resolve(data);
        }
        counter++;
      }, TIMEOUT);
    });
  });

console.log("Writing to file then exiting...");
// write the content to a file
fs.writeFile(FILE, JSON.stringify(content), async (err) => {
  await browser.close();
  if (err) return console.error(err);
});
