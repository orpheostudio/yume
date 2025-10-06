import React, { useState, useEffect } from 'react'
import AuthScreen from './components/Auth/AuthScreen'
import ChatScreen from './components/Chat/ChatScreen'
import PremiumScreen from './components/Premium/PremiumScreen'
import Toast from './components/UI/Toast'
import LoadingOverlay from './components/UI/LoadingOverlay'
import { useAnalytics } from './hooks/useAnalytics'
import { useSubscription } from './hooks/useSubscription'
import { useAIMemory } from './hooks/useAIMemory'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('auth')
  const [currentUser, setCurrentUser] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
  const [loading, setLoading] = useState(false)

  // Inicializar hooks
  useAnalytics()
  const subscription = useSubscription()
  const aiMemory = useAIMemory()

  // Verificar autenticação salva
  useEffect(() => {
    const savedUser = localStorage.getItem('yumeUser')
    const savedDarkMode = localStorage.getItem('yumeDarkMode') === 'true'
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
      setCurrentScreen('chat')
    }
    
    if (savedDarkMode) {
      document.body.classList.add('dark-mode')
    }
  }, [])

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000)
  }

  const handleLogin = (userData) => {
    setCurrentUser(userData)
    setCurrentScreen('chat')
    localStorage.setItem('yumeUser', JSON.stringify(userData))
    showToast('Login realizado com sucesso!', 'success')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentScreen('auth')
    localStorage.removeItem('yumeUser')
    showToast('Logout realizado com sucesso', 'success')
  }

  const showPremium = () => setCurrentScreen('premium')
  const showChat = () => setCurrentScreen('chat')

  return (
    <div className="app">
      {currentScreen === 'auth' && (
        <AuthScreen 
          onLogin={handleLogin}
          onShowPremium={showPremium}
          showToast={showToast}
        />
      )}
      
      {currentScreen === 'chat' && currentUser && (
        <ChatScreen
          user={currentUser}
          onLogout={handleLogout}
          onShowPremium={showPremium}
          subscription={subscription}
          aiMemory={aiMemory}
          showToast={showToast}
          setLoading={setLoading}
        />
      )}
      
      {currentScreen === 'premium' && (
        <PremiumScreen
          onBack={currentUser ? showChat : () => setCurrentScreen('auth')}
          subscription={subscription}
          showToast={showToast}
        />
      )}

      <Toast {...toast} />
      <LoadingOverlay show={loading} />
    </div>
  )
}

export default App
