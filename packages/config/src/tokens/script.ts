import { getEnv } from '@l2beat/backend-tools'
import { CoingeckoClient, EtherscanClient, HttpClient } from '@l2beat/shared'
import {
  ChainId,
  EthereumAddress,
  stringAs,
  Token,
  UnixTime,
} from '@l2beat/shared-pure'
import chalk from 'chalk'
import { providers } from 'ethers'
import { readFileSync, writeFileSync } from 'fs'
import { parse, ParseError } from 'jsonc-parser'
import { z } from 'zod'

import { getTokenInfo } from './getTokenInfo'

const SOURCE_FILE_PATH = './src/tokens/source.jsonc'
const OUTPUT_FILE_PATH = './src/tokens/tokenList.json'

const SourceEntry = z.object({
  symbol: z.string(),
  address: stringAs(EthereumAddress).optional(),
  category: z.union([
    z.literal('ether'),
    z.literal('stablecoin'),
    z.literal('other'),
  ]),
})

const Source = z.record(z.array(SourceEntry))
const Output = z.object({
  comment: z.string().optional(),
  tokens: z.array(Token),
})

async function main() {
  console.log(chalk.yellow('Loading... ') + 'source file')
  const sourceFile = readFileSync(SOURCE_FILE_PATH, 'utf-8')
  const errors: ParseError[] = []
  const parsed = parse(sourceFile, errors, {
    allowTrailingComma: true,
  }) as Record<string, string>
  if (errors.length !== 0) {
    throw new Error('Cannot parse manuallyVerified.jsonc')
  }
  const source = Source.parse(parsed)
  console.log(chalk.green('Loaded ') + 'source file\n')

  console.log(chalk.yellow('Loading... ') + 'output file')
  const outputFile = readFileSync(OUTPUT_FILE_PATH, 'utf-8')
  const output = Output.parse(JSON.parse(outputFile))
  console.log(chalk.green('Loaded ') + 'output file\n')

  const result: Token[] = []

  console.log(chalk.yellow('Loading... ') + 'environment variables')
  const env = getEnv()
  const coingeckoApiKey = env.optionalString('COINGECKO_API_KEY')
  if (coingeckoApiKey) {
    console.log(chalk.green('Detected ') + 'COINGECKO_API_KEY')
  } else {
    console.log(chalk.red('Missing ') + 'COINGECKO_API_KEY')
  }
  const http = new HttpClient()
  const coingeckoClient = new CoingeckoClient(http, coingeckoApiKey)
  console.log(chalk.green('Loaded ') + 'environment variables\n')

  for (const [chainId, entries] of Object.entries(source)) {
    // TODO: check chainId is valid
    console.log(chalk.yellow('Processing... ') + `chain ${chainId}`)

    for (const entry of entries) {
      const present = output.tokens.find((e) => {
        if (ChainId.fromName(chainId) !== e.chainId) {
          return false
        }
        if (!e.address) {
          return e.symbol === entry.symbol
        }
        return e.address === entry.address
      })

      if (present) {
        console.log(
          chalk.gray('Skipping ') +
            `${chainId} ${entry.symbol} ${entry.address?.toString() ?? ''}`,
        )
        result.push(present)
        continue
      }

      console.log(
        chalk.yellow('Fetching... ') +
          `${chainId} ${entry.symbol} ${entry.address?.toString() ?? ''}`,
      )

      // TODO: this should be automatically loaded using new dynamic envs
      const alchemyApiKey = env.string('CONFIG_ALCHEMY_API_KEY')
      const etherscanApiKey = env.string('ETHERSCAN_API_KEY')
      const provider = new providers.AlchemyProvider('homestead', alchemyApiKey)
      const etherscanClient = new EtherscanClient(
        http,
        etherscanApiKey,
        new UnixTime(0), // TODO: this should come from chain config
      )

      const token: Token = await getTokenInfo(
        provider,
        etherscanClient,
        coingeckoClient,
        entry.address,
        ChainId.ETHEREUM,
        'CBV',
        'locked',
        entry.category,
      )

      console.log(
        chalk.green('Fetched ') +
          `${chainId} ${entry.symbol} ${entry.address?.toString() ?? ''}`,
      )

      result.push(token)
    }
    console.log(chalk.green('Processed ') + `chain ${chainId}\n`)
  }

  console.log(chalk.yellow('Sorting... ') + 'tokens by chain and address')
  result.sort((a, b) => {
    if (a.chainId !== b.chainId) {
      return Number(a.chainId) - Number(b.chainId)
    }
    if (a.address && b.address) {
      return a.address.localeCompare(b.address.toString())
    }
    return a.symbol.localeCompare(b.symbol)
  })
  console.log(chalk.green('Sorted ') + 'tokens\n')

  console.log(chalk.yellow('Saving... ') + 'output file')
  const outputJson = JSON.stringify(
    {
      comment: output.comment,
      tokens: result,
    },
    null,
    2,
  )
  writeFileSync(OUTPUT_FILE_PATH, outputJson)
  console.log(chalk.green('Saved ') + 'output file\n')
}

main().catch((e: unknown) => {
  console.error(e)
})
