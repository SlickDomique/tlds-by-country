import { writeFileSync } from 'fs'
import { logMessage, sleep } from './util.js'
import { chromium } from '@playwright/test'
import { parse } from 'csv-parse/sync'
import { enterpriseNumbers, ianaNumbers, ianaTlds, icannRegistrars } from './adresses.js'
import { getWhoisData } from './whois.js'

const getBrowser = async () => {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox', // May help in some environments
      '--disable-web-security', // Not recommended for production use
      '--disable-infobars', // Prevent infobars
      '--disable-extensions', // Disable extensions
      '--start-maximized', // Start maximized
      '--window-size=1280,720', // Set a specific window size
    ],
  })
  return browser
}

const saveData = (data) => {
  const domainsJson = JSON.stringify(data)
  writeFileSync(`./public/domains.json`, domainsJson)
}

// not used in this script, but could be useful in the future. Leftover from trying to scrape only webpages
const getIanaNumbers = async () => {
  logMessage('Attempting to get IANA registrar numbers')
  const result = await fetch(ianaNumbers)
  const data = await result.text()
  const parsedData = parse(data, { columns: true, relax_quotes: true, ltrim: true, rtrim: true })
  const dataById = {}
  for (const row of parsedData) {
    dataById[row['ID']] = row
  }
  logMessage('IANA registrar numbers downloaded and parsed')
  return dataById
}

// not used in this script, but could be useful in the future. Leftover from trying to scrape only webpages
const getRegistrarData = async (browser, ianaNumbers) => {
  logMessage('Attempting to get ICANN registrar data')
  const page = await browser.newPage()
  page.goto(icannRegistrars)
  page.waitForSelector('a[data-testid="csv-download"]')
  await sleep(4500)

  logMessage('ICANN Registrar table loaded')
  const downloadPromise = page.waitForEvent('download')
  await page.click('a[data-testid="csv-download"]')
  const download = await downloadPromise
  const dataStram = await download.createReadStream()
  let data = ''
  for await (const chunk of dataStram) {
    data += chunk
  }
  const outputData = {}
  const parsedData = parse(data, { columns: true, relax_quotes: true, ltrim: true, rtrim: true })
  for (const row of parsedData) {
    const ianaRegistrar = ianaNumbers[row['IANA Number']]
    outputData[ianaRegistrar['Registrar Name']] = {
      ianaRegistrar,
      ...row,
    }
  }
  logMessage('ICANN registrar data downloaded and parsed')
  return outputData
}

const scrapDomainList = async (browser) => {
  logMessage('Scraping IANA TLD list')
  const page = await browser.newPage()
  page.goto(ianaTlds)
  page.waitForSelector('[id="tld-table"]')
  await sleep(2000)

  const domainRows = await page.$$('[id="tld-table"] tbody tr')
  const domains = []
  for (const row of domainRows) {
    domains.push({
      domain: await row.$eval('td:first-child', (el) => el.textContent.trim()),
      link: await row.$eval('td:first-child a', (el) => el.href),
      type: await row.$eval('td:nth-child(2)', (el) => el.textContent.trim()),
      organisation: await row.$eval('td:nth-child(3)', (el) => el.textContent.trim()),
    })
  }
  logMessage('IANA TLD list scrapped')
  return domains
}

const addCountryData = (whoisData, tlds) => {
  return tlds.map((tld) => {
    const registrar = whoisData[tld.domain.replace('.', '').toUpperCase()]
    if (registrar) {
      tld.whoisOrg = registrar.organisation
      tld.country = registrar.country
    }
    return tld
  })
}

// not used in this script, but could be useful in the future. Leftover from trying to scrape only webpages
const getAndParseEnterpriseNumbers = async () => {
  logMessage('Attempting to get IANA enterprise registrar numbers')
  const result = await fetch(enterpriseNumbers)
  const data = await result.text()

  const dataById = {}
  let lastId = -1
  for (const row of data.split('\n')) {
    const spaces = row.length - row.trimStart().length
    if (spaces === 0) {
      const attemptedId = parseInt(row)
      if (isNaN(attemptedId)) {
        continue
      }
      lastId = attemptedId
    }
    if (spaces === 2) {
      dataById[lastId] = row.trimStart()
    }
  }
  logMessage('IANA registrar numbers downloaded and parsed')
  return dataById
}

const main = async () => {
  const browser = await getBrowser()

  const whoisData = await getWhoisData()

  // const enterpriseIds = await getAndParseEnterpriseNumbers()
  // const ianaNumbers = await getIanaNumbers()
  // const registrarData = await getRegistrarData(browser, enterpriseIds)
  const tlds = await scrapDomainList(browser)

  const domains = addCountryData(whoisData, tlds)
  saveData(domains)
  await browser.close()
  return
}

main()
