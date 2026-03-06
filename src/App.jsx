import { GameProvider, useGame } from './context/GameContext'
import HomeScreen from './screens/HomeScreen'
import MapScreen from './screens/MapScreen'
import QuizScreen from './screens/QuizScreen'
import CollectionScreen from './screens/CollectionScreen'
import RuhArenasiScreen from './screens/RuhArenasiScreen'
import IsimCarkiScreen from './screens/IsimCarkiScreen'
import SozlukScreen from './screens/SozlukScreen'
import ProfilScreen from './screens/ProfilScreen'
import CeviriScreen from './screens/CeviriScreen'

function Router() {
  const { state } = useGame()

  const ekran = state.ekran

  if (ekran === 'home') return <HomeScreen />
  if (ekran === 'map') return <MapScreen />
  if (ekran === 'quiz' || ekran === 'kart_kazan') return <QuizScreen />
  if (ekran === 'koleksiyon') return <CollectionScreen />
  if (ekran === 'ruh_arenasi') return <RuhArenasiScreen />
  if (ekran === 'isim_carki') return <IsimCarkiScreen />
  if (ekran === 'sozluk') return <SozlukScreen />
  if (ekran === 'profil') return <ProfilScreen />
  if (ekran === 'ceviri') return <CeviriScreen />

  return <HomeScreen />
}

export default function App() {
  return (
    <GameProvider>
      <div className="oyun-sarici">
        <Router />
      </div>
    </GameProvider>
  )
}
