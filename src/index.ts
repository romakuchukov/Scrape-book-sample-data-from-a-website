import fs from "fs";
import { chromium } from "playwright";

const url = new URL(
  "https://odcom-69a2f5f05adbd3cd6ee6b80e9fbf1a2f.read.overdrive.com"
);
const FILE = `${url.hostname}.html`;

console.log("Starting the scraping process...");

// launch browser and create a new page
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
// fetch the page
await page.goto(url.origin);

// get html content
const html = await page.content();

await browser.close();
// write data to a file
fs.writeFile(FILE, html, (err) => {
  if (err) return console.log(err);
  console.log("The file was saved!");
});
