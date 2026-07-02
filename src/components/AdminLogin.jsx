import React, { useState } from 'react';

const AdminLogin = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <img src="/img/oyama-logo.png" alt="Logo Oyama" />
          </div>
          <h2>Área Administrativa</h2>
          <p>Digite a senha para acessar o painel de gerenciamento</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-input-group">
            <label htmlFor="adminPassword">Senha de Acesso</label>
            <input
              id="adminPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoFocus
              required
            />
          </div>

          <div className="admin-login-actions">
            <button type="submit" className="btn-admin-submit">
              Entrar no Painel
            </button>
            <button type="button" onClick={onCancel} className="btn-admin-cancel">
              Voltar ao Site
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .admin-login-wrapper {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 50%, #1e1e24 0%, #111115 100%);
          padding: 1.5rem;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .admin-login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          animation: adminFadeIn 0.5s ease-out;
        }

        @keyframes adminFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .admin-login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .admin-login-logo img {
          height: 64px;
          width: auto;
          border-radius: 12px;
          border: 1.5px solid rgba(220, 179, 96, 0.4);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          margin-bottom: 1rem;
        }

        .admin-login-header h2 {
          color: #ffffff;
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          letter-spacing: 0.5px;
        }

        .admin-login-header p {
          color: #9ca3af;
          font-size: 0.88rem;
          margin: 0;
          line-height: 1.4;
        }

        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .admin-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .admin-input-group label {
          color: #d1d5db;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .admin-input-group input {
          width: 100%;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 0.8rem 1rem;
          color: #ffffff;
          font-size: 1rem;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .admin-input-group input:focus {
          outline: none;
          border-color: #dcb360;
          background: rgba(0, 0, 0, 0.4);
          box-shadow: 0 0 0 3px rgba(220, 179, 96, 0.15);
        }

        .admin-login-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .btn-admin-submit {
          background: linear-gradient(135deg, #ff8c00 0%, #d32f2f 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 0.9rem 1rem;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
        }

        .btn-admin-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(211, 47, 47, 0.4);
          filter: brightness(1.1);
        }

        .btn-admin-submit:active {
          transform: translateY(0);
        }

        .btn-admin-cancel {
          background: transparent;
          color: #9ca3af;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.8rem 1rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-admin-cancel:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
