import React from 'react'
import './LoadingOverlay.css'

const LoadingOverlay = ({ show, message = "Processando..." }) => {
  if (!show) return null

  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  )
}

export default LoadingOverlay
