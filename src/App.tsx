import MapView from './components/Map'
import InstallPrompt from './components/UI/InstallPrompt'

export default function App() {
  return (
    <div className="h-full w-full">
      <MapView />
      <InstallPrompt />
    </div>
  )
}
