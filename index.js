const puppeteer = require("puppeteer");
const process = require("process");


let phone = new RegExp(`/^\\?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}$/`, "g")

const crawl = async (url) => {
  if (!url) {
    throw Error("URL is not provided");
  }
  if (!url.includes("http")) {
    url = "http://" + url;
  }

  console.log("CRAWLING...")
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let arr = [];
  let worth_to_visit = [];
  let phone_numbers = []
  let visited = [];
  worth_to_visit.push(url);
  await visit();
  async function visit() {
    let url_worth = worth_to_visit[0];
    if (url_worth.startsWith("/")) {
      if (url.endsWith("/")) {
        url = url.substring(0, url.length - 1);
      }
      url_worth = url + url_worth;
    }
    worth_to_visit.shift();
    if (!visited.includes(url_worth)) {
      visited.push(url_worth);
      console.log(url_worth)
      await page.goto(url_worth);
      // Set screen size
      await page.setViewport({ width: 1080, height: 1024 });

      // Localte the full title with a unique string

      async function findInfo() {
        const elements = await page.$$("a");
        const content = (await page.content())
        const re = /(?:[-+() ]*\d){10,13}/gm; 
        const crawled_phone_numbers = content.match(re).map(function(s){return s.trim();});
        phone_numbers = [...new Set(phone_numbers.concat(crawled_phone_numbers))]

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const link = await element.evaluate((el) => el.getAttribute("href"));
          if (!arr.includes(link)) {
            if (
              link &&
              (link.includes("tel:") ||
                link.includes("mailto:") ||
                (link.includes("http") && (link.includes("youtube") ||
                link.includes("facebook") ||
                link.includes("twitter") ||
                link.includes("linkedin") ||
                link.includes("instagram"))))
            ) {
              arr.push(link);
            }
          }

          if (!worth_to_visit.includes(link)) {
            if (
              link &&
              (link.includes("iletisim") || link.includes("contact")) && link.includes("http")
            ) {
              worth_to_visit.push(link);
            }
          }
        }
      }

      await findInfo();

    }

    if (worth_to_visit.length > 0) {
      await visit();
    }
  }
  console.log("================")
  console.log("USEFUL LINKS")
  console.log("links:", arr);
  console.log("================")
  console.log("USEFUL PHONE NUMBERS")
  console.log("links:", phone_numbers);
  console.log("================")
  console.log("VISITED PAGES")
  console.log(visited)
  await browser.close();
};

crawl(process.argv[2]);
