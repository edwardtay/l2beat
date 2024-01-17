import { CoingeckoClient, HttpClient } from '@l2beat/shared'
import { AssetId, CoingeckoId, EthereumAddress } from '@l2beat/shared-pure'
import { expect } from 'earl'
import { Contract, providers, utils } from 'ethers'

import { bridges } from '../bridges'
import { config } from '../test/config'
import { canonicalTokenList, tokenList } from './tokens'

describe('tokens', () => {
  it('every token has a unique address', () => {
    const addresses = tokenList.map((x) => x.address)
    const everyUnique = addresses.every((x, i) => addresses.indexOf(x) === i)
    expect(everyUnique).toEqual(true)
  })

  it('every token has a unique id', () => {
    const ids = tokenList.map((x) => x.id)
    const everyUnique = ids.every((x, i) => ids.indexOf(x) === i)
    expect(everyUnique).toEqual(true)
  })

  it('tokens are ordered alphabetically', () => {
    const names = tokenList.map((x) => x.name)
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })

  describe('canonical', () => {
    it('every token has a unique symbol', () => {
      const symbols = canonicalTokenList.map((x) => x.symbol)
      const everyUnique = symbols.every((x, i) => symbols.indexOf(x) === i)
      expect(everyUnique).toEqual(true)
    })

    describe('metadata is correct', function () {
      this.timeout(10_000)
      const MULTICALL_ADDRESS = '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441'
      const ABI = [
        'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)',
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
      ]
      const CODER = new utils.Interface(ABI)
      const NAME_CALL = CODER.encodeFunctionData('name')
      const SYMBOL_CALL = CODER.encodeFunctionData('symbol')
      const DECIMALS = CODER.encodeFunctionData('decimals')

      interface Metadata {
        name: string
        symbol: string
        decimals: number
      }
      const results: Record<string, Metadata> = {}
      const checkedTokens = canonicalTokenList.filter(
        (x) => x.id !== AssetId('op-optimism'),
      )

      before('fetch metadata', async () => {
        const provider = new providers.AlchemyProvider(
          'mainnet',
          config.alchemyApiKey,
        )
        const contract = new Contract(MULTICALL_ADDRESS, CODER, provider)

        const calls = checkedTokens.flatMap((x) =>
          !x.address
            ? []
            : [
                [x.address, NAME_CALL],
                [x.address, SYMBOL_CALL],
                [x.address, DECIMALS],
              ],
        )
        let data: string[] = []

        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          data = (await contract.functions.aggregate(calls))[1]
        } catch (error) {
          // @ts-expect-error Alchemy error is not typed
          const errorBody = error.error.body
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const message = JSON.parse(errorBody).error.message

          if (message) {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            throw new Error('Multicall failed. Alchemy error: ' + message)
          } else {
            throw error
          }
        }

        for (let i = 0; i < calls.length; i += 3) {
          const nameResult = data[i]
          const symbolResult = data[i + 1]
          const decimalsResult = data[i + 2]
          results[calls[i][0].toString()] = {
            name: decodeString(nameResult),
            symbol: decodeString(symbolResult),
            decimals: decodeNumber(decimalsResult),
          }
        }
      })

      function decodeString(hex: string) {
        try {
          return CODER.decodeFunctionResult('name', hex)[0] as string
        } catch {
          // This is a special case because MKR is broken and encodes name and
          // symbol as bytes32 null terminated strings
          let result = ''
          for (let i = 2; i < hex.length; i += 2) {
            const byte = hex[i] + hex[i + 1]
            if (byte === '00') {
              break
            }
            result += String.fromCharCode(parseInt(byte, 16))
          }
          return result
        }
      }

      function decodeNumber(hex: string) {
        return CODER.decodeFunctionResult('decimals', hex)[0] as number
      }

      for (const token of checkedTokens) {
        it(token.symbol, () => {
          if (!token.address) {
            return
          }
          expect(token.name).toEqual(results[token.address.toString()].name)
          expect(token.symbol).toEqual(results[token.address.toString()].symbol)
          expect(token.decimals).toEqual(
            results[token.address.toString()].decimals,
          )
        })
      }
    })

    it('every token has correct CoingeckoId', async function () {
      this.timeout(10000)

      const http = new HttpClient()
      const coingeckoClient = new CoingeckoClient(http, config.coingeckoApiKey)

      const coinsList = await coingeckoClient.getCoinList({
        includePlatform: true,
      })

      const result = new Map<EthereumAddress, CoingeckoId | undefined>()

      coinsList.map((coin) => {
        if (coin.platforms.ethereum)
          result.set(EthereumAddress(coin.platforms.ethereum), coin.id)
      })

      canonicalTokenList.map((token) => {
        if (token.symbol === 'ETH') {
          expect(token.coingeckoId).toEqual(CoingeckoId('ethereum'))
        } else if (
          token.id === AssetId('wusdm-wrapped-mountain-protocol-usd')
        ) {
          // TODO(radomski): This is a short term solution to the problem of
          // wrapped token prices. wUSDM is ~15% of Manta Pacific TVL but the
          // Coingecko price chart for the _WRAPPED_ version of this token is
          // broken. After an investigation we've decided to temporally
          // approximate the price of the wUSDM to be the same as the
          // non-wrapped source (USDM). In reality at the time of writing this
          // comment it's more like
          //
          // 1wUSDM = 1.0118 USDM
          //
          // A more generalized solution is required. But since we can't
          // stall forever until the perfect solution is ready we accept this
          // approximation. A generalized solution would determine the price
          // of a token based on the price of a different token times some
          // multiplier. Where the multiplier can be dynamic, that means it
          // requires calling a custom typescript function. Further work will
          // be cooperated by @antooni, refer to him for further questions
          //
          // - 3 January 2024
          //
          expect(token.coingeckoId).toEqual(
            CoingeckoId('mountain-protocol-usdm'),
          )
        } else {
          const expectedId = token.address && result.get(token.address)
          if (expectedId) {
            expect(token.coingeckoId).toEqual(expectedId)
          }
        }
      })
    })
  })
  describe('external', () => {
    it('every external token has a bridgedUsing property', () => {
      const externalTokens = tokenList
        .filter((token) => token.type === 'EBV' && !token.bridgedUsing)
        .map((token) => token.symbol)
      expect(externalTokens).toHaveLength(0)
    })
    it('every bridge slug in bridgedUsing property is valid', () => {
      const tokenSlugs = tokenList
        .filter((token) => token.type === 'EBV' && token.bridgedUsing?.slug)
        .map((token) => token.bridgedUsing?.slug)
      const bridgesSlugs = bridges.map((bridge) => bridge.display.slug)
      const invalidSlugs = tokenSlugs.filter(
        (slug) => !bridgesSlugs.includes(slug!),
      )

      expect(invalidSlugs).toHaveLength(0)
    })
  })
})
