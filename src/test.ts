import fs from "fs";
import { chromium } from "playwright";
const URL =
  "https://odcom-69a2f5f05adbd3cd6ee6b80e9fbf1a2f.read.overdrive.com/";

console.log("Starting the scraping process...");
const browser = await chromium.launch({ headless: false, devtools: true });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto(URL);

const redirecturlData = await page
  .locator("#sample-holder")
  .getAttribute("data-redirecturl");
let response = await page.goto(redirecturlData);
const { src } = await response.json();

response = await page.goto(src);
// Alternative way with a predicate. Note no await.
// const responsePromise = page.waitForResponse(
//   (response) =>
//     response.url() ===
//       "/about_book.html?cmpt=eyJzcGluZSI6MX0%3D--68da03495264466b4d2caa0b00ecc0e190da233f" &&
//     response.status() === 200 &&
//     response.request().method() === "GET"
// );
// await page.getByText("trigger response").click();
// const responseD = await responsePromise;
//https://odcom-69a2f5f05adbd3cd6ee6b80e9fbf1a2f.read.overdrive.com/about_book.html?cmpt=eyJzcGluZSI6MX0%3D--68da03495264466b4d2caa0b00ecc0e190da233f
const responsePromise = page.waitForResponse(
  "https://odcom-69a2f5f05adbd3cd6ee6b80e9fbf1a2f.read.overdrive.com/about_book.html*"
);
// await page.getByText("trigger response").click();
const responseD = await responsePromise;
console.log(responseD.status());
// wait for page to load

await page.evaluate(async () => {
  // if this doesn't work, you can try to increase 0 to a higher number (i.e. 100)
  console.log("Hello from the browser!");
});
await page
  .locator(".chapter-bar-next-button", { has: page.locator("span") })
  .evaluate((element: HTMLElement) => {
    console.log(element);
    setTimeout(() => {
      element.click();
    }, 2000);

    console.log(element);
  });

// const writeToFile = (text) => {
//   fs.writeFile("test.html", text, (err) => {
//     if (err) return console.log(err);
//     console.log(text);
//     console.log("The file was saved!");
//   });
// };

const text = await page
  .frameLocator("iFrame")
  .locator("body")
  .evaluate((element: HTMLElement) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(element.textContent);
        console.log(element.textContent);
      }, 5000);
    });
  });
console.log(2, text);
// const orderSent = page.locator(".chapter-bar-next-button");
// await orderSent.waitFor();

// const aHandle = await page.evaluateHandle(() =>
//   document.querySelector("iframe")
// );
// const resultHandle = await page.evaluateHandle(
//   (body) => body.innerHTML,
//   aHandle
// );
// console.log(await resultHandle.jsonValue());

// await resultHandle.dispose();

// const aHandle = await page.evaluateHandle(() => document.body);
// const resultHandle = await page.evaluateHandle(
//   (body) => body.innerHTML,
//   aHandle
// );
// console.log(await resultHandle.jsonValue());
// await resultHandle.dispose();

// metaData.shift();
// // storing data in an object
// const text = {
//   meta: [titleData.shift(), ...metaData],
//   text: [
//     ...(await getText(page, `${BODY_SELECTOR} b`, {
//       has: page.locator("i"),
//     })),
//     ...(await getText(page, BODY_SELECTOR, { has: page.locator("b") })),
//   ],
// };
// // increase the timeout if there is an issue with server blocking you
// await page.waitForTimeout(TIMEOUT);

// write data to a file
// fs.writeFile(FILE, JSON.stringify(text), (err) => {
//   if (err) return console.log(err);
//   console.log("The file was saved!");
// });
fs.writeFileSync("test.txt", text as string);

await browser.close();
