import type { NextApiRequest, NextApiResponse } from 'next'

// eslint-disable-next-line no-unused-vars
const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  let pricesResponse = await fetch('https://fd60qhijvtes7do71ou6moc14s.ingress.pcgameservers.com/api/prices')
  const guppyWhalePoolResponse = await fetch('https://ww-migaloo-rest.polkachu.com/cosmwasm/wasm/v1/contract/migaloo14p3r422qp04p345mnqe5umjy3vqx75hpxf54f8enf59wf27fksvqltavjp/smart/eyJwb29sIjp7fX0=')
  if (!pricesResponse.ok) {
    pricesResponse = await fetch('https://9c0pbpbijhepr6ijm4lk85uiuc.ingress.europlots.com/api/prices')
    if (!pricesResponse.ok) {
      throw new Error(`Failed to fetch prices: ${pricesResponse.status}`)
    }
  }
  if (!guppyWhalePoolResponse.ok) {
    throw new Error(`Failed to fetch guppy whale pool: ${guppyWhalePoolResponse.status}`)
  }
  const guppyWhalePool = await guppyWhalePoolResponse.json()
  const [guppy, whale] = guppyWhalePool?.data?.assets || []
  const prices = (await pricesResponse.json()).data
  const whalePrice = prices['white-whale']?.usd ?? 0
  prices.guppy = { usd: Number(((Number(whale?.amount ?? 0)) / (Number(guppy?.amount ?? 0))) * (Number(whalePrice) ?? 0)).toFixed(10) }
  res.status(200).json({ data: prices })
}

export default handler
