import { useState, useEffect } from 'react'

const CONFIG = {
  FREE_TIER_LIMITS: {
    dailyMessages: 20,
    monthlyMessages: 300
  },
  PREMIUM_PLANS: {
    monthly: {
      price: 19.90,
      name: "Mensal",
      features: ["IA Mistral Ilimitada", "Suporte Prioritário", "Sem anúncios"]
    },
    yearly: {
      price: 199.90,
      name: "Anual", 
      features: ["2 meses grátis", "IA Mistral Ilimitada", "Suporte Prioritário", "Sem anúncios"]
    }
  }
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null)
  const [usage, setUsage] = useState({ daily: 0, monthly: 0 })

  useEffect(() => {
    // Carregar dados salvos
    const savedSubscription = localStorage.getItem('yumeSubscription')
    const savedUsage = localStorage.getItem('yumeUsage')
    
    if (savedSubscription) {
      setSubscription(JSON.parse(savedSubscription))
    }
    
    if (savedUsage) {
      setUsage(JSON.parse(savedUsage))
    } else {
      // Inicializar uso
      const initialUsage = { daily: 0, monthly: 0, lastReset: new Date().toDateString() }
      setUsage(initialUsage)
      localStorage.setItem('yumeUsage', JSON.stringify(initialUsage))
    }
  }, [])

  const isPremium = () => {
    return subscription && subscription.status === 'active'
  }

  const canSendMessage = () => {
    if (isPremium()) return true
    
    const today = new Date().toDateString()
    if (usage.lastReset !== today) {
      // Reset diário
      const resetUsage = { ...usage, daily: 0, lastReset: today }
      setUsage(resetUsage)
      localStorage.setItem('yumeUsage', JSON.stringify(resetUsage))
      return true
    }
    
    return usage.daily < CONFIG.FREE_TIER_LIMITS.dailyMessages && 
           usage.monthly < CONFIG.FREE_TIER_LIMITS.monthlyMessages
  }

  const incrementUsage = () => {
    if (isPremium()) return
    
    const newUsage = {
      ...usage,
      daily: usage.daily + 1,
      monthly: usage.monthly + 1,
      lastReset: new Date().toDateString()
    }
    
    setUsage(newUsage)
    localStorage.setItem('yumeUsage', JSON.stringify(newUsage))
  }

  const subscribe = (planType) => {
    const plan = CONFIG.PREMIUM_PLANS[planType]
    if (!plan) return false

    const newSubscription = {
      plan: planType,
      status: 'active',
      startDate: new Date().toISOString(),
      price: plan.price,
      features: plan.features
    }

    setSubscription(newSubscription)
    localStorage.setItem('yumeSubscription', JSON.stringify(newSubscription))
    
    // Track analytics
    if (typeof clarity !== 'undefined') {
      clarity('event', 'premium_subscription', { plan: planType, price: plan.price })
    }
    if (typeof ag !== 'undefined') {
      ag('track', 'premium_subscription', { plan: planType, price: plan.price })
    }

    return true
  }

  const getUsageStats = () => {
    const limits = CONFIG.FREE_TIER_LIMITS
    return {
      daily: {
        used: usage.daily,
        limit: limits.dailyMessages,
        remaining: Math.max(0, limits.dailyMessages - usage.daily)
      },
      monthly: {
        used: usage.monthly,
        limit: limits.monthlyMessages,
        remaining: Math.max(0, limits.monthlyMessages - usage.monthly)
      },
      isPremium: isPremium()
    }
  }

  return {
    subscription,
    usage: getUsageStats(),
    isPremium: isPremium(),
    canSendMessage,
    incrementUsage,
    subscribe,
    plans: CONFIG.PREMIUM_PLANS
  }
}
