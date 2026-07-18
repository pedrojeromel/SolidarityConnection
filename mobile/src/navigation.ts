import type {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { ActiveCampaign } from './types'

export type TabParamList = {
  Home: undefined
  Campaigns: undefined
  Manager: undefined
  Profile: undefined
}

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>
  Register: undefined
  Checkout: { campaign: ActiveCampaign }
}

/** Navegação a partir de telas dentro das abas: alcança abas e o stack raiz. */
export type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>
