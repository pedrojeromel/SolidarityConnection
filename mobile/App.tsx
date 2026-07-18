import { ActivityIndicator, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { DarkTheme, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { AuthProvider, useAuth } from './src/contexts/AuthContext'
import { HomeScreen } from './src/screens/HomeScreen'
import { CampaignsScreen } from './src/screens/CampaignsScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { RegisterScreen } from './src/screens/RegisterScreen'
import { CheckoutScreen } from './src/screens/CheckoutScreen'
import { ManagerScreen } from './src/screens/ManagerScreen'
import { colors } from './src/theme'
import type { RootStackParamList, TabParamList } from './src/navigation'

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.panel,
    text: colors.fg,
    border: colors.line,
    primary: colors.brand2,
  },
}

const TAB_ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Campaigns: 'heart-outline',
  Manager: 'briefcase-outline',
  Profile: 'person-circle-outline',
}

function Tabs() {
  const { isManager } = useAuth()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.panel },
        headerTintColor: colors.fg,
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.panel,
          borderTopColor: colors.line,
        },
        tabBarActiveTintColor: colors.brand2,
        tabBarInactiveTintColor: colors.dim,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Início', headerShown: false }}
      />
      <Tab.Screen
        name="Campaigns"
        component={CampaignsScreen}
        options={{ title: 'Campanhas', headerShown: false }}
      />
      {/* Guarda de rota no cliente: a autorizacao real continua no backend. */}
      {isManager && (
        <Tab.Screen
          name="Manager"
          component={ManagerScreen}
          options={{ title: 'Gestão' }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  )
}

function Routes() {
  const { restoring } = useAuth()

  // Aguarda a sessao persistida ser restaurada antes de montar as rotas,
  // para nao tratar um usuario logado como visitante no primeiro render.
  if (restoring) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.brand2} />
      </View>
    )
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.panel },
        headerTintColor: colors.fg,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={Tabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Criar conta' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Pagamento seguro' }}
      />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={theme}>
          <StatusBar style="light" />
          <Routes />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
