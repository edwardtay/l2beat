import { Layer2Reference } from './Layer2Reference'

export interface Layer2Risk {
  /** Category of this risk */
  category: Layer2RiskCategory
  /** Description of te risk. Should form a sentence with the category */
  text: string
  /** List of references backing up the claim */
  references?: Layer2Reference[]
  /** If the risk is particularly bad */
  isCritical?: boolean
}

export type Layer2RiskCategory =
  | 'Funds can be stolen if'
  | 'Funds can be lost if'
  | 'Funds can be frozen if'
  | 'Users can be censored if'
  | 'MEV can be extracted if'