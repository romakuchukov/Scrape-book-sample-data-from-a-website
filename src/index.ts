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

// creating a button instance just so that we can pass it to the evaluate function along with the timeout, simply to avoid hardcoding the timeout
// a bit unfortunate (and not strictly necessary) that we have to do this, but it's the only way to pass the timeout as a variable
const chapterButton = (await page.evaluateHandle(() =>
  document.querySelector(".chapter-bar-next-button")
)) as unknown as HTMLButtonElement;

// get the content
const content = await page.evaluate(
  ({ chapterButton, timeout }) => {
    return new Promise((resolve) => {
      let counter = 1;
      const data = [];
      const len = document.querySelectorAll("#spool .sheet").length;
      const intervalId = setInterval(() => {
        chapterButton.click();
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
      }, timeout);
    });
  },
  { chapterButton, timeout: TIMEOUT }
);

console.log("Writing to file then exiting...");
// write the content to a file
fs.writeFile(FILE, JSON.stringify(content), async (err) => {
  await browser.close();
  if (err) return console.error(err);
});
