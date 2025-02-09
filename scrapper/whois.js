import net from 'net'
import { allTlds } from './adresses.js'
import { readFileSync, writeFileSync } from 'fs'
import { logMessage, sleep } from './util.js'

const whoisQuery = ({
  host = null,
  port = 43,
  timeout = 15000,
  query = '',
  querySuffix = '\r\n',
} = {}) => {
  return new Promise((resolve, reject) => {
    let data = ''
    const socket = net.connect({ host, port }, () => socket.write(query + querySuffix))
    socket.setTimeout(timeout)
    socket.on('data', (chunk) => (data += chunk))
    socket.on('close', () => resolve(data))
    socket.on('timeout', () => socket.destroy(new Error('Timeout')))
    socket.on('error', reject)
  })
}

const getAllTlds = async () => {
  const result = await fetch(allTlds)
  const data = await result.text()
  return data
    .split('\n')
    .filter((line) => !line.startsWith('#'))
    .map((line) => line.trim())
}

const saveCache = (data) => {
  writeFileSync('./public/whois_cache', JSON.stringify(data))
}

const loadCache = () => {
  try {
    return JSON.parse(readFileSync('./public/whois_cache'))
  } catch (e) {
    console.error(e)
    return {}
  }
}

const parseWhoisData = (record) => {
  const data = {}
  let lastValueBeforeEmptyLine = null

  for (const line of record.split('\n')) {
    const [key, value] = line.split(':')

    if (!value && lastValueBeforeEmptyLine !== null) {
      data['country'] = lastValueBeforeEmptyLine.trim()
      return data
    }
    if (key && value) {
      if (['organisation'].includes(key)) {
        data['organisation'] = value.trim()
        lastValueBeforeEmptyLine = value
      }
      if (lastValueBeforeEmptyLine !== null) {
        lastValueBeforeEmptyLine = value
      }
    }
  }
  return data
}

export const getWhoisData = async () => {
  const whoisResults = loadCache()
  const tlds = await getAllTlds()
  const parsedData = {}

  for (const tld of tlds) {
    if (!whoisResults[tld]) {
      await sleep(25)
      const data = await whoisQuery({ host: 'whois.iana.org', query: `${tld}` })
      whoisResults[tld] = data
      saveCache(whoisResults)
    }
    parsedData[tld] = parseWhoisData(whoisResults[tld])
    logMessage(`Whois data for ${tld} parsed. Parsed ${tlds.indexOf(tld) + 1}/${tlds.length}`)
  }

  return parsedData
}
