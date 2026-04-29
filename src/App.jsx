import { useEffect, useState } from 'react';
import ChurrascoOptions from './components/ChurrascoOptions';
import BebidaOptions from './components/BebidaOptions';
import ExtrasOptions from './components/ExtrasOptions';
import Resumo from './components/Resumo';
import CarnesSelector from './components/CarnesSelector';
import AcompanhamentosSelector from './components/AcompanhamentosSelector';
import AdminPanel from './components/AdminPanel';
import {
  churrascoPackages as initialChurrascoPackages,
  beverages as initialBeverages,
  caipis,
  classicDrinks,
  outros,
} from './constants';
import './AppClean.css';
import './responsive.css';

const normalizeBeverageCatalog = (items) => items.map((item, index) => ({
  ...item,
  id: `bebida-${index + 1}`,
  options: (item.options ?? []).map((option, optionIndex) => ({
    id: `bebida-${index + 1}-opcao-${optionIndex + 1}`,
    name: typeof option === 'string' ? option : option.name,
    price: typeof option === 'string' ? item.price : option.price,
  })),
}));

const getDefaultBeverageCategoryId = (catalog) => catalog[0]?.id ?? '';

function App() {
  const ADMIN_PASSWORD = 'Oyama@2026!';
  const ADMIN_SESSION_KEY = 'app_churrasco_admin_auth';
  const extraCategories = ['🍸 Caipis Gourmet', '🍹 Drinks Clássicos', '🎉 Serviços Adicionais'];
  const initialBeverageCatalog = normalizeBeverageCatalog(initialBeverages);

  const [currentStep, setCurrentStep] = useState(0);
  const [numPessoas, setNumPessoas] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [clienteWhatsapp, setClienteWhatsapp] = useState('');
  const [churrasco, setChurrasco] = useState(null);
  const [carnesCustomizadas, setCarnesCustomizadas] = useState([]);
  const [acompanhamentosCustomizados, setAcompanhamentosCustomizados] = useState([]);
  const [bebidas, setBebidas] = useState([]); // Array de bebidas selecionadas
  const [extras, setExtras] = useState([]);
  const [isAdminMode, setIsAdminMode] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'
  );

  const [churrascoCatalog, setChurrascoCatalog] = useState(() => {
    const saved = localStorage.getItem('churrascoCatalog');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error('Erro ao ler localStorage', e); }
    }
    return initialChurrascoPackages.map((item, index) => ({
      ...item,
      id: `churrasco-${index + 1}`,
    }));
  });

  const [beverageCatalog, setBeverageCatalog] = useState(() => {
    const saved = localStorage.getItem('beverageCatalog');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        // Force cleanup of old cached beverages with prices
        const hasPrices = parsed.some(c => Number(c.price) > 0 || (c.options && c.options.some(o => Number(o.price) > 0)));
        if (hasPrices) {
          console.log('🔄 Limpando cache de Bebidas (removendo preços velhos)');
          return initialBeverageCatalog;
        }
        return parsed; 
      } catch (e) { console.error('Erro ao ler localStorage', e); }
    }
    return initialBeverageCatalog;
  });

  const [extrasCatalog, setExtrasCatalog] = useState(() => {
    const saved = localStorage.getItem('extrasCatalog');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error('Erro ao ler localStorage', e); }
    }
    return [
      ...caipis.map((item, index) => ({
        ...item,
        id: `extra-caipi-${index + 1}`,
        category: extraCategories[0],
      })),
      ...classicDrinks.map((item, index) => ({
        ...item,
        id: `extra-drink-${index + 1}`,
        category: extraCategories[1],
      })),
      ...outros.map((item, index) => ({
        ...item,
        id: `extra-servico-${index + 1}`,
        category: extraCategories[2],
      })),
    ];
  });

  useEffect(() => {
    localStorage.setItem('churrascoCatalog', JSON.stringify(churrascoCatalog));
  }, [churrascoCatalog]);

  useEffect(() => {
    localStorage.setItem('beverageCatalog', JSON.stringify(beverageCatalog));
  }, [beverageCatalog]);

  useEffect(() => {
    localStorage.setItem('extrasCatalog', JSON.stringify(extrasCatalog));
  }, [extrasCatalog]);

  useEffect(() => {
    const hasAdminParam = new URLSearchParams(window.location.search).get('admin') === '1';

    if (!hasAdminParam) {
      setIsAdminMode(false);
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return;
    }

    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === '1') {
      setIsAdminMode(true);
      return;
    }

    const password = window.prompt('Digite a senha de administrador:');

    if ((password ?? '').trim() === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
      setIsAdminMode(true);
      return;
    }

    setIsAdminMode(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    window.alert('Senha inválida.');

    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('admin');
    window.history.replaceState({}, '', `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
  }, []);

  // Limpar carnes e acompanhamentos customizados quando o pacote mudar
  useEffect(() => {
    if (churrasco && !churrasco.isCustom) {
      setCarnesCustomizadas([]);
      setAcompanhamentosCustomizados([]);
    }
  }, [churrasco]);

  const totalSteps = 5;

  const totalChurrasco = churrasco ? churrasco.price * numPessoas : 0;
  const totalBebidas = 0; // Bebidas não possuem custo associado no evento
  const totalExtras = 0; // Extras não possuem custo associado
  const totalGeral = totalChurrasco + totalBebidas + totalExtras;

  const getWhatsappDigits = (value) => (value || '').replace(/\D/g, '');

  const formatWhatsapp = (value) => {
    const digits = getWhatsappDigits(value).slice(0, 11);

    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const isClienteInfoValid =
    clienteNome.trim().length >= 2 && getWhatsappDigits(clienteWhatsapp).length >= 10;

  const isStepValid = (step) => {
    switch(step) {
      case 1:
        return numPessoas > 0 && isClienteInfoValid;
      case 2:
        // Se selecionou pacote customizado, deve ter pelo menos 1 carne
        if (churrasco?.isCustom) {
          return carnesCustomizadas.length > 0;
        }
        return churrasco !== null;
      case 3:
        return bebidas.length > 0;
      case 4:
        return true;
      case 5:
        return numPessoas > 0 && churrasco && bebidas.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 2 && churrasco?.isCustom) {
      if (carnesCustomizadas.length === 0) {
        alert('⚠️ Por favor, selecione pelo menos uma carne para o pacote customizado!');
        return;
      }
      if (acompanhamentosCustomizados.length === 0) {
        alert('⚠️ Por favor, selecione pelo menos um acompanhamento para o pacote customizado!');
        return;
      }
    }
    if (isStepValid(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (currentStep === 0) {
    return (
      <div className="premium-welcome-wrapper">
        <div className="premium-welcome-overlay">
          
          <div className="premium-nav">
            <img src="/img/oyama-logo.png" alt="Logo Oyama" className="premium-logo" />
          </div>

          <div className="premium-hero-content">
            <h1 className="premium-title">
              <span className="premium-title-highlight">A Arte</span> do Verdadeiro Churrasco
            </h1>
            <p className="premium-subtitle">
              Excelência em cortes nobres e serviço impecável.<br/> 
              Transforme o seu evento em uma experiência inesquecível.
            </p>
            
            <button 
              className="premium-cta-btn" 
              onClick={() => setCurrentStep(1)}
              type="button"
            >
              <span className="premium-cta-text">Solicitar Orçamento</span>
              <div className="premium-cta-glow"></div>
            </button>
          </div>

          <div className="premium-footer-strip">
            <span>Premium Cuts 🥩</span>
            <span className="premium-dot">•</span>
            <span>Master Parrillero 👨‍🍳</span>
            <span className="premium-dot">•</span>
            <span>Signature Drinks 🍹</span>
          </div>

        </div>
      </div>
    );
  }

  // Show admin panel if in admin mode
  if (isAdminMode) {
    return (
      <AdminPanel
        churrascoCatalog={churrascoCatalog}
        setChurrascoCatalog={setChurrascoCatalog}
        beverageCatalog={beverageCatalog}
        setBeverageCatalog={setBeverageCatalog}
        extrasCatalog={extrasCatalog}
        setExtrasCatalog={setExtrasCatalog}
        onLogout={() => {
          setIsAdminMode(false);
          sessionStorage.removeItem(ADMIN_SESSION_KEY);
          window.location.href = window.location.pathname;
        }}
      />
    );
  }

  return (
    <div className="App">
      {/* HEADER */}
      <header className="app-header">
        <div className="app-header-content">
          <div 
            className="header-branding" 
            onClick={() => setCurrentStep(0)} 
            style={{ cursor: 'pointer' }}
            title="Voltar à tela de Boas-vindas"
          >
            <img src="/img/oyama-logo.png" alt="Logo Oyama" className="header-logo" />
            <span className="header-kicker">Mestre das Chamas</span>
          </div>
          <h1>🔥 Churrasco 🍖</h1>
          <p>Parrilla, acompanhamentos e bebidas no ponto certo para o seu evento</p>
          <div className="header-tags" aria-hidden="true">
            <span>🥩 Carnes Nobres</span>
            <span>🍻 Bebidas</span>
            <span>👨‍🍳 Equipe Completa</span>
          </div>
          <div className="header-gallery">
            <img
              src="https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80"
              alt="Churrasco na brasa"
              loading="eager"
            />
            <img
              src="/img/mini hambu.png"
              alt="Mini hambúrguer"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80"
              alt="Mesa de churrasco completa"
              loading="lazy"
            />
          </div>
        </div>
      </header>

      {/* PROGRESS */}
      {currentStep > 0 && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
          <div className="progress-text">Passo {currentStep} de {totalSteps}</div>
        </div>
      )}

      {/* CONTENT */}
      <main className="content">
        <div className="orcamento-layout">
          <section className="orcamento-main">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <section className="step-section">
                <h2>👥 Quantas Pessoas?</h2>
                <div className="step-body">
                  <div className="cliente-info-grid">
                    <div className="cliente-input-group">
                      <label htmlFor="clienteNome">Nome do cliente</label>
                      <input
                        id="clienteNome"
                        type="text"
                        value={clienteNome}
                        onChange={(e) => setClienteNome(e.target.value)}
                        placeholder="Ex.: Felipe Santos"
                        className="input-large input-customer"
                      />
                    </div>

                    <div className="cliente-input-group">
                      <label htmlFor="clienteWhatsapp">WhatsApp</label>
                      <input
                        id="clienteWhatsapp"
                        type="tel"
                        inputMode="numeric"
                        value={clienteWhatsapp}
                        onChange={(e) => setClienteWhatsapp(formatWhatsapp(e.target.value))}
                        placeholder="Ex.: (62) 99999-9999"
                        className="input-large input-customer"
                      />
                    </div>
                  </div>

                  <input 
                    type="number" 
                    min="1"
                    max="1000"
                    value={numPessoas}
                    onChange={(e) => {
                      const rawValue = e.target.value;

                      if (rawValue === '') {
                        setNumPessoas('');
                        return;
                      }

                      const value = parseInt(rawValue, 10);
                      if (!isNaN(value) && value > 0) {
                        setNumPessoas(value);
                      }
                    }}
                    placeholder="Digite a quantidade"
                    className="input-large"
                    autoFocus
                  />
                  {!isClienteInfoValid && (
                    <p className="warning-msg">Preencha nome e WhatsApp para continuar.</p>
                  )}
                  {numPessoas > 0 && (
                    <p className="success-msg">✓ {numPessoas} pessoas selecionadas</p>
                  )}
                </div>
              </section>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <section className="step-section">
                <h2>🍖 Escolha o Churrasco</h2>
                <div className="step-body">
                  <ChurrascoOptions
                    setChurrasco={setChurrasco}
                    churrasco={churrasco}
                    churrascoPackages={churrascoCatalog}
                  />
                  
                  {/* Mostrar seletores de carnes e acompanhamentos customizados se o pacote customizado foi selecionado */}
                  {churrasco?.isCustom && (
                    <div className="customizacao-container">
                      <CarnesSelector 
                        carnesCustomizadas={carnesCustomizadas}
                        setCarnesCustomizadas={setCarnesCustomizadas}
                      />
                      <AcompanhamentosSelector 
                        acompanhamentosCustomizados={acompanhamentosCustomizados}
                        setAcompanhamentosCustomizados={setAcompanhamentosCustomizados}
                      />
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <section className="step-section">
                <h2>🍻 Escolha as Bebidas</h2>
                <div className="step-body">
                  <BebidaOptions
                    setBebidas={setBebidas}
                    bebidas={bebidas}
                    beverages={beverageCatalog}
                  />
                </div>
              </section>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <section className="step-section">
                <h2>🎉 Serviços Extras (Opcional)</h2>
                <div className="step-body">
                  <ExtrasOptions extras={extras} setExtras={setExtras} extrasCatalog={extrasCatalog} />
                </div>
              </section>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && (
              <section className="step-section">
                <h2>📋 Confirme seu Orçamento</h2>
                <div className="step-body">
                  <Resumo 
                    numPessoas={numPessoas}
                    clienteNome={clienteNome}
                    clienteWhatsapp={clienteWhatsapp}
                    churrasco={churrasco}
                    carnesCustomizadas={carnesCustomizadas}
                    acompanhamentosCustomizados={acompanhamentosCustomizados}
                    bebidas={bebidas}
                    extras={extras}
                    beverageCatalog={beverageCatalog}
                  />
                </div>
              </section>
            )}
          </section>

          <aside className="orcamento-summary">
            <div className="summary-card">
              <h3>📋 Resumo do Orçamento</h3>
              <p className="summary-line"><span>Cliente</span><strong>{clienteNome || 'Não informado'}</strong></p>
              <p className="summary-line"><span>WhatsApp</span><strong>{clienteWhatsapp || 'Não informado'}</strong></p>
              <p className="summary-line"><span>Pessoas</span><strong>{numPessoas || 0}</strong></p>
              <p className="summary-line"><span>Pacote</span><strong>{churrasco ? churrasco.name : 'Não selecionado'}</strong></p>
              <hr className="summary-divider" />
              <p className="summary-line"><span>Churrasco</span><strong>R$ {totalChurrasco.toFixed(2)}</strong></p>
              <p className="summary-total"><span>Total</span><strong>R$ {totalGeral.toFixed(2)}</strong></p>
            </div>
          </aside>
        </div>
      </main>

      {/* FOOTER NAVIGATION */}
      <footer className="footer-nav">
        <button 
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          ← Voltar
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!isStepValid(currentStep) || currentStep === totalSteps}
        >
          Próximo →
        </button>
      </footer>
    </div>
  );
}

export default App;
