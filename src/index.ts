import fs from "fs";
import playwright from "playwright";

const TIMEOUT = 200;
const FILE = "data.txt";
const SELECTOR = ".title-page__description p";

(async () => {
  // store text in a variable
  let elementText = "";
  // since i don't know which browser will be available, so let's loop through some of them, though it's not necessary
  // it needs only one browser to get the text from the page ["chromium", "firefox", "webkit"] -> ["chromium"] or the loop can be refactored away
  for (const browserType of ["chromium", "firefox", "webkit"]) {
    const browser = await playwright[browserType].launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(
      "https://odcom-69a2f5f05adbd3cd6ee6b80e9fbf1a2f.read.overdrive.com/"
    );

    elementText = await page.$eval(
      SELECTOR,
      (el: HTMLParagraphElement) => el.textContent
    );
    // increase the timeout if there is an issue with server blocking you
    await page.waitForTimeout(TIMEOUT);
    await browser.close();
  }
  // write data to a file
  fs.writeFile(FILE, elementText, (err) => {
    if (err) return console.log(err);
    console.log("The file was saved!");
  });
})();
