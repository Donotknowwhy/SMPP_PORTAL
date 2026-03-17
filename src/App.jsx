import { useState } from 'react'
import './App.css'
import TopNav from './components/TopNav'
import PageHeader from './components/PageHeader'
import HomeContent from './components/HomeContent'
import ProvidersContent from './components/ProvidersContent'
import ReportsContent from './components/ReportsContent'
import EditProviderModal from './components/modals/EditProviderModal'
import AddProviderModal from './components/modals/AddProviderModal'
import { initialProviders } from './data/initialProviders'
import { calculateDistribution } from './utils/providerUtils'

function App() {
  const [activeMenu, setActiveMenu] = useState('home')
  const [providers, setProviders] = useState(initialProviders)
  const [totalMessages, setTotalMessages] = useState(1000)
  const [showDistribution, setShowDistribution] = useState(false)

  const [editingProvider, setEditingProvider] = useState(null)
  const [editPercentage, setEditPercentage] = useState(0)
  const [editProviderName, setEditProviderName] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [newProviderModalName, setNewProviderModalName] = useState('')
  const [newProviderModalPercentage, setNewProviderModalPercentage] = useState(0)

  const totalPercentage = providers.reduce((sum, provider) => sum + provider.percentage, 0)

  const openAddModal = () => {
    setShowAddModal(true)
    setNewProviderModalName('')
    setNewProviderModalPercentage(0)
  }

  const closeAddModal = () => {
    setShowAddModal(false)
    setNewProviderModalName('')
    setNewProviderModalPercentage(0)
  }

  const saveNewProvider = () => {
    if (!newProviderModalName.trim()) {
      return
    }

    const newProvider = {
      id: Date.now(),
      name: newProviderModalName.trim(),
      percentage: newProviderModalPercentage,
      color: '#000',
      successRate: 0,
      errorRate: 0,
      totalSent: 0,
    }

    setProviders([...providers, newProvider])
    closeAddModal()
  }

  const handleAddKeyPress = (event) => {
    if (event.key === 'Enter' && newProviderModalName.trim()) {
      saveNewProvider()
    }
  }

  const deleteProvider = (id) => {
    setProviders(providers.filter((provider) => provider.id !== id))
  }

  const openEditModal = (provider) => {
    setEditingProvider(provider)
    setEditPercentage(provider.percentage)
    setEditProviderName(provider.name)
  }

  const closeEditModal = () => {
    setEditingProvider(null)
    setEditPercentage(0)
    setEditProviderName('')
  }

  const saveEdit = () => {
    setProviders(
      providers.map((provider) =>
        provider.id === editingProvider.id
          ? { ...provider, percentage: editPercentage, name: editProviderName }
          : provider,
      ),
    )
    closeEditModal()
  }

  const distributeEvenly = () => {
    const evenPercentage = Math.floor(100 / providers.length)
    const remainder = 100 - evenPercentage * providers.length
    setProviders(
      providers.map((provider, index) => ({
        ...provider,
        percentage: index === 0 ? evenPercentage + remainder : evenPercentage,
      })),
    )
  }
  const onGoHome = () => {
    setActiveMenu('home')
    setShowDistribution(false)
  }

  return (
    <div className="app">
      <TopNav activeMenu={activeMenu} onChangeMenu={setActiveMenu} onGoHome={onGoHome} />

      <div className="container">
        <PageHeader />

        {activeMenu === 'home' && (
          <HomeContent
            providers={providers}
            totalPercentage={totalPercentage}
            totalMessages={totalMessages}
            setTotalMessages={setTotalMessages}
            showDistribution={showDistribution}
            setShowDistribution={setShowDistribution}
            calculateDistribution={() => calculateDistribution(providers, totalMessages, totalPercentage)}
          />
        )}

        {activeMenu === 'providers' && (
          <ProvidersContent
            providers={providers}
            totalPercentage={totalPercentage}
            openAddModal={openAddModal}
            distributeEvenly={distributeEvenly}
            openEditModal={openEditModal}
            deleteProvider={deleteProvider}
          />
        )}

        {activeMenu === 'reports' && (
          <ReportsContent providers={providers} totalPercentage={totalPercentage} />
        )}

        <EditProviderModal
          editingProvider={editingProvider}
          editProviderName={editProviderName}
          setEditProviderName={setEditProviderName}
          editPercentage={editPercentage}
          setEditPercentage={setEditPercentage}
          closeEditModal={closeEditModal}
          saveEdit={saveEdit}
        />

        <AddProviderModal
          showAddModal={showAddModal}
          closeAddModal={closeAddModal}
          newProviderModalName={newProviderModalName}
          setNewProviderModalName={setNewProviderModalName}
          newProviderModalPercentage={newProviderModalPercentage}
          setNewProviderModalPercentage={setNewProviderModalPercentage}
          handleAddKeyPress={handleAddKeyPress}
          saveNewProvider={saveNewProvider}
        />
      </div>
    </div>
  )
}

export default App
