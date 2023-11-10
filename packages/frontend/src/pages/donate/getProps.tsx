import { toDataURL } from 'qrcode'
import React from 'react'

import { Config } from '../../build/config'
import { getFooterProps, getNavbarProps } from '../../components'
import { Wrapped } from '../Page'
import { DonateFundingSourcesProps } from './DonateFundingSources'
import { DonatePageProps } from './DonatePage'

export async function getProps(
  config: Config,
): Promise<Wrapped<DonatePageProps>> {
  const address = '0x41626BA92c0C2a1aD38fC83920300434082B1870'
  return {
    props: {
      navbar: getNavbarProps(config, 'donate'),
      title: 'Donate',
      details: {
        ethereumAddress: address,
        qrLightURL: await toDataURL(address, {
          width: 240,
          color: {
            light: '#fafafa',
          },
          errorCorrectionLevel: 'H',
          margin: 0,
        }),
        qrDarkURL: await toDataURL(address, {
          width: 240,
          color: {
            light: '#1b1b1b',
            dark: '#ffffff',
          },
          errorCorrectionLevel: 'H',
          margin: 0,
        }),
        networks: [
          {
            name: 'Ethereum mainnet',
            linkURL: `https://etherscan.io/address/${address}`,
          },
          {
            name: 'Arbitrum',
            linkURL: `https://arbiscan.io/address/${address}`,
          },
          {
            name: 'Optimism',
            linkURL: `https://optimistic.etherscan.io/address/${address}`,
          },
          {
            name: 'zkSync 1.0',
            linkURL: `https://zkscan.io/explorer/accounts/${address}`,
          },
          {
            name: 'Gitcoin',
            linkURL:
              'https://explorer.gitcoin.co/#/round/424/0x222ea76664ed77d18d4416d2b2e77937b76f0a35/0x222ea76664ed77d18d4416d2b2e77937b76f0a35-27',
          },
        ],
      },
      fundingSources: getFundingSources(),
      footer: getFooterProps(config),
      showGitcoinButton: config.features.gitcoinOption,
    },
    wrapper: {
      metadata: {
        title: 'Donate – L2BEAT',
        description: '',
        image: 'https://l2beat.com/meta-images/overview-scaling.png',
        url: 'https://l2beat.com/donate/',
      },
      banner: config.features.banner,
    },
  }
}

function getFundingSources(): DonateFundingSourcesProps {
  return {
    items: [
      {
        source: 'Ethereum Foundation',
        tier: 'Significant',
        description: 'Different grants in years 2021-2023',
      },
      {
        source: 'Optimism RPGF2',
        tier: 'Medium',
        description: 'March 2023',
      },
      {
        source:
          'Rewards & compensation for participating in L2 governance frameworks',
        tier: 'Medium',
        description:
          'We are participating in the governance of Arbitrum, Optimism, Hop, Polygon, Uniswap and Connext',
      },
      {
        source: 'Gitcoin',
        tier: 'Medium',
        description: 'Gitcoin rounds in 2022-2023',
      },
      {
        source: 'Direct community donations',
        tier: 'Small',
        description: 'Via this page',
      },
      {
        source: 'L2 Amsterdam (2022) conference sponsorships',
        tier: 'Small',
        description: 'April 2022; covered the costs of the conference',
      },
      {
        source: 'L2 Warsaw (2023) conference sponsorships',
        tier: 'Small',
        description: 'August 2023; covered the costs of the conference',
      },
      {
        source: 'L2DAYS Istanbul (2023) conference sponsorships',
        tier: 'Medium',
        description: 'November 2023; covered the costs of the conference',
      },
      {
        source: 'Upgradeability of Ethereum L2s” report',
        tier: 'Small',
        description: 'Funded by Polygon Labs',
      },
      {
        source: 'Open-source explorer for StarkEx deployments',
        tier: 'Medium',
        description: (
          <span>
            Live at dydx.l2beat.com, view the code here. Funded by StarkWare and
            dYdX
          </span>
        ),
      },
      {
        source: 'LayerZero transparency dashboard',
        tier: 'Medium',
        description: 'Project in progress. Funded by LayerZero',
      },
      {
        source: 'DAC memberships',
        tier: 'Small',
        description: 'Discontinued',
      },
    ],
  }
}