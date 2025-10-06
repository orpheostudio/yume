import React, { useState } from 'react'
import './AuthScreen.css'

const AuthScreen = ({ onLogin, onShowPremium, showToast }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (isLogin) {
      // Login
      if (!formData.email || !formData.password) {
        showToast('Por favor, preencha todos os campos', 'error')
        return
      }
      
      const user = {
        name: formData.email.split('@')[0],
        email: formData.email,
        id: Date.now().toString()
      }
      onLogin(user)
      
    } else {
      // Cadastro
      if (!formData.name || !formData.email || !formData.password) {
        showToast('Por favor, preencha todos os campos', 'error')
        return
      }
      
      if (formData.password.length < 8) {
        showToast('A senha deve ter pelo menos 8 caracteres', 'error')
        return
      }
      
      const user = {
        name: formData.name,
        email: formData.email,
        id: Date.now().toString()
      }
      onLogin(user)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <img 
            src="https://i.imgur.com/orvGJOL.png" 
            alt="Yume Logo" 
            className="auth-logo" 
          />
          <h1 className="auth-title">Bem-vindo à Yume</h1>
          <p className="auth-subtitle">Sua assistente virtual com IA Mistral</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2 className="form-title">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h2>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nome</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder={isLogin ? "********" : "Mínimo 8 caracteres"}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
          
          <div className="auth-switch">
            <p>
              {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setIsLogin(!isLogin)
                  setFormData({ name: '', email: '', password: '' })
                }}
              >
                {isLogin ? 'Cadastre-se' : 'Entrar'}
              </a>
            </p>
            
            <button 
              type="button" 
              className="btn btn-premium"
              onClick={onShowPremium}
              style={{marginTop: '15px', width: '100%'}}
            >
              <i className="fas fa-crown"></i> Conhecer Premium
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthScreen
