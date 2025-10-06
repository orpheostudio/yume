import { useState, useEffect } from 'react'

const MISTRAL_CONFIG = {
  API_KEY: "SUA_CHAVE_API_MISTRAL_AQUI",
  ENDPOINT: "https://api.mistral.ai/v1/chat/completions"
}

export const useAIMemory = () => {
  const [conversationHistory, setConversationHistory] = useState([])
  const [responseCache, setResponseCache] = useState(new Map())

  useEffect(() => {
    // Carregar histórico salvo
    const savedHistory = localStorage.getItem('yumeConversationHistory')
    const savedCache = localStorage.getItem('yumeResponseCache')
    
    if (savedHistory) {
      setConversationHistory(JSON.parse(savedHistory))
    }
    
    if (savedCache) {
      const cacheArray = JSON.parse(savedCache)
      const cacheMap = new Map(cacheArray)
      setResponseCache(cacheMap)
    }
  }, [])

  const saveHistory = (history) => {
    setConversationHistory(history)
    localStorage.setItem('yumeConversationHistory', JSON.stringify(history))
  }

  const saveToCache = (message, response, source = 'mistral') => {
    const normalizedMessage = normalizeMessage(message)
    const newCache = new Map(responseCache)
    newCache.set(normalizedMessage, { response, source })
    setResponseCache(newCache)
    
    // Salvar cache no localStorage
    const cacheArray = Array.from(newCache.entries())
    localStorage.setItem('yumeResponseCache', JSON.stringify(cacheArray))
  }

  const normalizeMessage = (message) => {
    return message.toLowerCase()
      .trim()
      .replace(/[.,!?;]/g, '')
      .replace(/\s+/g, ' ')
  }

  const getCachedResponse = (message) => {
    const normalizedMessage = normalizeMessage(message)
    return responseCache.get(normalizedMessage)
  }

  const findSimilarResponses = (message, threshold = 0.6) => {
    const normalizedMessage = normalizeMessage(message)
    const similar = []
    
    conversationHistory.forEach(entry => {
      if (entry.sender === 'user') {
        const similarity = calculateSimilarity(normalizedMessage, normalizeMessage(entry.message))
        if (similarity > threshold) {
          similar.push({
            originalMessage: entry.message,
            response: entry.response,
            similarity: similarity,
            source: entry.source
          })
        }
      }
    })
    
    return similar.sort((a, b) => b.similarity - a.similarity)
  }

  const calculateSimilarity = (str1, str2) => {
    const words1 = str1.split(' ')
    const words2 = str2.split(' ')
    
    const set1 = new Set(words1)
    const set2 = new Set(words2)
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }

  const callMistralAI = async (message, context = []) => {
    if (!MISTRAL_CONFIG.API_KEY || MISTRAL_CONFIG.API_KEY === "SUA_CHAVE_API_MISTRAL_AQUI") {
      throw new Error('Mistral AI não configurada')
    }

    const messages = [
      {
        role: "system",
        content: `Você é a Yume, uma assistente virtual brasileira amigável e prestativa. 
        Seja concisa mas útil. Responda em português brasileiro natural.
        Use emojis ocasionalmente para ser mais amigável.
        Mantenha as respostas entre 1-3 frases.
        Seja direta e evite rodeios.`
      },
      ...context.slice(-6).map(entry => ({
        role: entry.sender === 'user' ? 'user' : 'assistant',
        content: entry.sender === 'user' ? entry.message : entry.response
      })),
      {
        role: "user",
        content: message
      }
    ]

    try {
      const response = await fetch(MISTRAL_CONFIG.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_CONFIG.API_KEY}`
        },
        body: JSON.stringify({
          model: "mistral-tiny",
          messages: messages,
          max_tokens: 150,
          temperature: 0.7,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content.trim()
    } catch (error) {
      console.error('Erro na Mistral AI:', error)
      throw error
    }
  }

  const generateResponse = async (message, useMistral = true) => {
    let response, source

    // 1. Buscar em cache
    const cached = getCachedResponse(message)
    if (cached) {
      response = cached.response
      source = cached.source
    }

    // 2. Buscar respostas similares
    if (!response) {
      const similarResponses = findSimilarResponses(message)
      if (similarResponses.length > 0 && similarResponses[0].similarity > 0.75) {
        response = similarResponses[0].response
        source = similarResponses[0].source
      }
    }

    // 3. Tentar Mistral AI
    if (!response && useMistral) {
      try {
        response = await callMistralAI(message, conversationHistory)
        source = 'mistral'
        saveToCache(message, response, 'mistral')
        
        // Track analytics
        if (typeof clarity !== 'undefined') clarity('event', 'mistral_ai_used')
        if (typeof ag !== 'undefined') ag('track', 'mistral_ai_used')
      } catch (error) {
        console.warn('Mistral AI falhou:', error)
        if (typeof clarity !== 'undefined') clarity('event', 'mistral_ai_error')
        if (typeof ag !== 'undefined') ag('track', 'mistral_ai_error')
      }
    }

    // 4. Fallback
    if (!response) {
      response = getFallbackResponse(message)
      source = 'fallback'
    }

    // Adicionar ao histórico
    if (response) {
      const newHistory = [...conversationHistory, 
        { message, response, sender: 'user', timestamp: Date.now() },
        { message, response, sender: 'assistant', source, timestamp: Date.now() }
      ].slice(-15) // Manter apenas últimas 15 mensagens
      
      saveHistory(newHistory)
    }

    return { response, source }
  }

  const getFallbackResponse = (message) => {
    const lowerMessage = message.toLowerCase()
    
    const responses = {
      greetings: [
        "Olá! Como posso ajudar você hoje? 😊",
        "Oi! Em que posso ser útil?",
        "Olá! Fico feliz em conversar com você."
      ],
      help: [
        "Posso ajudar com informações, responder perguntas ou apenas conversar!",
        "Estou aqui para ajudar no que precisar. Pode me fazer perguntas ou pedir assistência.",
        "Como assistente virtual, posso ajudar com diversas tarefas. O que você gostaria de fazer?"
      ],
      thanks: [
        "De nada! Fico feliz em ajudar! 😊",
        "Por nada! Estou aqui para o que precisar.",
        "Disponha! Se tiver mais alguma dúvida, é só perguntar."
      ],
      unknown: [
        "Hmm, não tenho certeza sobre isso. Pode reformular a pergunta?",
        "Interessante! Pode me dar mais detalhes?",
        "Vou pesquisar mais sobre isso. Tem alguma outra pergunta enquanto isso?"
      ]
    }

    if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('ola')) {
      return responses.greetings[Math.floor(Math.random() * responses.greetings.length)]
    }
    
    if (lowerMessage.includes('ajuda') || lowerMessage.includes('ajude')) {
      return responses.help[Math.floor(Math.random() * responses.help.length)]
    }
    
    if (lowerMessage.includes('obrigado') || lowerMessage.includes('obrigada')) {
      return responses.thanks[Math.floor(Math.random() * responses.thanks.length)]
    }
    
    return responses.unknown[Math.floor(Math.random() * responses.unknown.length)]
  }

  const clearMemory = () => {
    setConversationHistory([])
    setResponseCache(new Map())
    localStorage.removeItem('yumeConversationHistory')
    localStorage.removeItem('yumeResponseCache')
  }

  return {
    conversationHistory,
    generateResponse,
    clearMemory,
    getCachedResponse
  }
}
