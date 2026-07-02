import { useEffect, useState, Fragment } from 'react';
import ChurrascoOptions from './components/ChurrascoOptions';
import BebidaOptions from './components/BebidaOptions';
import ExtrasOptions from './components/ExtrasOptions';
import Resumo from './components/Resumo';
import CarnesSelector from './components/CarnesSelector';
import AcompanhamentosSelector from './components/AcompanhamentosSelector';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  churrascoPackages as initialChurrascoPackages,
  beverages as initialBeverages,
  caipis,
  classicDrinks,
  outros,
  availableMeats,
  availableSideDishes,
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
  const ADMIN_PASSWORD = '801328';
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

  const [meatsList, setMeatsList] = useState(availableMeats);
  const [sidesList, setSidesList] = useState(availableSideDishes);

  // Sync state changes with local storage, and with Supabase database if in admin mode
  useEffect(() => {
    localStorage.setItem('churrascoCatalog', JSON.stringify(churrascoCatalog));
    if (isSupabaseConfigured && isAdminMode) {
      supabase.from('catalogos').upsert({ id: 'churrasco', dados: churrascoCatalog }).then(({ error }) => {
        if (error) console.error('Erro ao sincronizar churrasco no Supabase:', error);
      });
    }
  }, [churrascoCatalog, isAdminMode]);

  useEffect(() => {
    localStorage.setItem('beverageCatalog', JSON.stringify(beverageCatalog));
    if (isSupabaseConfigured && isAdminMode) {
      supabase.from('catalogos').upsert({ id: 'beverages', dados: beverageCatalog }).then(({ error }) => {
        if (error) console.error('Erro ao sincronizar bebidas no Supabase:', error);
      });
    }
  }, [beverageCatalog, isAdminMode]);

  useEffect(() => {
    localStorage.setItem('extrasCatalog', JSON.stringify(extrasCatalog));
    if (isSupabaseConfigured && isAdminMode) {
      supabase.from('catalogos').upsert({ id: 'extras', dados: extrasCatalog }).then(({ error }) => {
        if (error) console.error('Erro ao sincronizar extras no Supabase:', error);
      });
    }
  }, [extrasCatalog, isAdminMode]);

  useEffect(() => {
    if (isSupabaseConfigured && isAdminMode) {
      supabase.from('catalogos').upsert({ id: 'available_meats', dados: meatsList }).then(({ error }) => {
        if (error) console.error('Erro ao sincronizar carnes no Supabase:', error);
      });
    }
  }, [meatsList, isAdminMode]);

  useEffect(() => {
    if (isSupabaseConfigured && isAdminMode) {
      supabase.from('catalogos').upsert({ id: 'available_side_dishes', dados: sidesList }).then(({ error }) => {
        if (error) console.error('Erro ao sincronizar acompanhamentos no Supabase:', error);
      });
    }
  }, [sidesList, isAdminMode]);

  // Load catalogs from Supabase database on mount, and auto-seed if database is empty
  useEffect(() => {
    const fetchCatalogs = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase
          .from('catalogos')
          .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          const churrascoRow = data.find(r => r.id === 'churrasco');
          const beveragesRow = data.find(r => r.id === 'beverages');
          const extrasRow = data.find(r => r.id === 'extras');
          const meatsRow = data.find(r => r.id === 'available_meats');
          const sidesRow = data.find(r => r.id === 'available_side_dishes');

          if (churrascoRow) setChurrascoCatalog(churrascoRow.dados);
          if (beveragesRow) setBeverageCatalog(beveragesRow.dados);
          if (extrasRow) setExtrasCatalog(extrasRow.dados);
          if (meatsRow) setMeatsList(meatsRow.dados);
          if (sidesRow) setSidesList(sidesRow.dados);
        } else {
          // Table is empty, seed it with the default values
          console.log('🌱 Banco de dados Supabase vazio. Semeando catálogos padrão...');
          const initialChurrasco = initialChurrascoPackages.map((item, index) => ({
            ...item,
            id: `churrasco-${index + 1}`,
          }));
          const initialExtras = [
            ...caipis.map((item, index) => ({
              ...item,
              id: `extra-caipi-${index + 1}`,
              category: '🍸 Caipis Gourmet',
            })),
            ...classicDrinks.map((item, index) => ({
              ...item,
              id: `extra-drink-${index + 1}`,
              category: '🍹 Drinks Clássicos',
            })),
            ...outros.map((item, index) => ({
              ...item,
              id: `extra-servico-${index + 1}`,
              category: '🎉 Serviços Adicionais',
            })),
          ];

          const seedData = [
            { id: 'churrasco', dados: initialChurrasco },
            { id: 'beverages', dados: beverageCatalog },
            { id: 'extras', dados: initialExtras },
            { id: 'available_meats', dados: availableMeats },
            { id: 'available_side_dishes', dados: availableSideDishes }
          ];

          await supabase.from('catalogos').upsert(seedData);
        }
      } catch (err) {
        console.error('Erro ao buscar catálogos do Supabase:', err);
      }
    };

    fetchCatalogs();
  }, []);

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

  const isStepClickable = (stepId) => {
    if (stepId === currentStep) return true;
    if (stepId < currentStep) return true;
    for (let s = 1; s < stepId; s++) {
      if (!isStepValid(s)) return false;
    }
    return true;
  };

  // Show login panel if param is present but admin is not authenticated
  const hasAdminParam = new URLSearchParams(window.location.search).get('admin') === '1';
  if (hasAdminParam && !isAdminMode) {
    return (
      <AdminLogin
        onLogin={(pwd) => {
          if (pwd === ADMIN_PASSWORD) {
            sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
            setIsAdminMode(true);
          } else {
            alert('⚠️ Senha incorreta!');
          }
        }}
        onCancel={() => {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('admin');
          window.location.href = cleanUrl.pathname + cleanUrl.search + cleanUrl.hash;
        }}
      />
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
        meatsList={meatsList}
        setMeatsList={setMeatsList}
        sidesList={sidesList}
        setSidesList={setSidesList}
        onLogout={() => {
          setIsAdminMode(false);
          sessionStorage.removeItem(ADMIN_SESSION_KEY);
          window.location.href = window.location.pathname;
        }}
      />
    );
  }

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
            <span className="premium-dot">•</span>
            <span 
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('admin', '1');
                window.location.href = url.pathname + url.search + url.hash;
              }}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              title="Acesso Administrativo"
            >
              Admin ⚙️
            </span>
          </div>

        </div>
      </div>
    );
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "👥 Quantas Pessoas?";
      case 2: return "🍖 Escolha o Churrasco";
      case 3: return "🍻 Escolha as Bebidas";
      case 4: return "🎉 Serviços Extras (Opcional)";
      case 5: return "📋 Confirme seu Orçamento";
      default: return "";
    }
  };

  return (
    <div className="App">
      {/* HEADER WITH STEPPER */}
      <header className="app-nav-header">
        <div className="nav-container">
          <div 
            className="nav-branding" 
            onClick={() => setCurrentStep(0)} 
            style={{ cursor: 'pointer' }}
            title="Voltar à tela de Boas-vindas"
          >
            <img src="/img/oyama-logo.png" alt="Logo Oyama" className="nav-logo" />
            <span className="nav-kicker">Mestre das Chamas</span>
          </div>

          <nav className="stepper-nav">
            {[
              { id: 1, label: "Identificação", icon: "👥" },
              { id: 2, label: "Churrasco", icon: "🍖" },
              { id: 3, label: "Bebidas", icon: "🍻" },
              { id: 4, label: "Extras", icon: "🎉" },
              { id: 5, label: "Resumo", icon: "📋" }
            ].map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isClickable = isStepClickable(step.id);
              return (
                <Fragment key={step.id}>
                  {index > 0 && <div className={`stepper-line ${currentStep >= step.id ? 'active' : ''}`}></div>}
                  <div 
                    className={`stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isClickable ? 'clickable' : ''}`}
                    onClick={() => isClickable && setCurrentStep(step.id)}
                    title={isClickable ? `Ir para ${step.label}` : "Preencha as etapas anteriores para liberar"}
                  >
                    <span className="step-badge">
                      {isCompleted ? '✓' : step.icon}
                    </span>
                    <span className="step-text">
                      <span className="step-number-label">Passo {step.id}</span>
                      <span className="step-name">{step.label}</span>
                    </span>
                  </div>
                </Fragment>
              );
            })}
          </nav>
          <div className="nav-spacer">
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('admin', '1');
                window.location.href = url.pathname + url.search + url.hash;
              }}
              className="admin-nav-link"
              title="Painel Administrativo"
            >
              Admin ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="content">
        {currentStep > 0 && (
          <h2 className="step-title">{getStepTitle()}</h2>
        )}

        <div className="orcamento-layout">
          <section className="orcamento-main">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <section className="step-section">
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

                    <div className="cliente-input-group">
                      <label htmlFor="numPessoas">Quantidade de pessoas</label>
                      <input 
                        id="numPessoas"
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
                        className="input-large input-customer"
                        autoFocus
                      />
                    </div>
                  </div>
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
                        availableMeats={meatsList}
                      />
                      <AcompanhamentosSelector 
                        acompanhamentosCustomizados={acompanhamentosCustomizados}
                        setAcompanhamentosCustomizados={setAcompanhamentosCustomizados}
                        availableSideDishes={sidesList}
                      />
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <section className="step-section">
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
                <div className="step-body">
                  <ExtrasOptions extras={extras} setExtras={setExtras} extrasCatalog={extrasCatalog} />
                </div>
              </section>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && (
              <section className="step-section">
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
