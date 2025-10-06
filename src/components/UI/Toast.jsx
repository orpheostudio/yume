import React from 'react'
import './Toast.css'

const Toast = ({ show, message, type = 'info' }) => {
  if (!show) return null

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {type === 'success' && <i className="fas fa-check-circle"></i>}
        {type === 'error' && <i className="fas fa-exclamation-circle"></i>}
        {type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
        {type === 'info' && <i className="fas fa-info-circle"></i>}
        <span>{message}</span>
      </div>
    </div>
  )
}

export default Toast
