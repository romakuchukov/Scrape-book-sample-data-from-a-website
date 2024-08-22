Run the following commands:

Clone the repo.

```
git clone git@github.com:romakuchukov/scrape-book-sample-data-from-a-website
```

Move into the directory:

```
cd scrape-book-sample-data-from-a-website
```

---

Install dependencies.

```
npm i
```

If you get a warning from playwright execute the following command.

```
npx playwright install
```

Compile ts.

```
npx tsc
```

Execute the code.

```
node dist/index.js
```

You can run last 2 steps as one `npx tsc && node dist/index.js`
