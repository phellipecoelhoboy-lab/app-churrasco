import { useEffect, useState } from 'react';
import ChurrascoOptions from './components/ChurrascoOptions';
import BebidaOptions from './components/BebidaOptions';
import ExtrasOptions from './components/ExtrasOptions';
import Resumo from './components/Resumo';
import CarnesSelector from './components/CarnesSelector';
import AcompanhamentosSelector from './components/AcompanhamentosSelector';
import {
  churrascoPackages as initialChurrascoPackages,
  beverages as initialBeverages,
  caipis,
  classicDrinks,
  outros,
} from './constants';
import './AppClean.css';

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
  const [showManager, setShowManager] = useState(false);

  const [churrascoCatalog, setChurrascoCatalog] = useState(
    initialChurrascoPackages.map((item, index) => ({
      ...item,
      id: `churrasco-${index + 1}`,
    }))
  );

  const [beverageCatalog, setBeverageCatalog] = useState(
    initialBeverageCatalog
  );

  const [extrasCatalog, setExtrasCatalog] = useState([
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
  ]);

  const [newProduct, setNewProduct] = useState({
    type: 'churrasco',
    name: '',
    price: '',
    category: extraCategories[0],
    ingredients: '',
    beverageCategoryId: getDefaultBeverageCategoryId(initialBeverageCatalog),
  });
  const [editingProduct, setEditingProduct] = useState(null);

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
  const totalBebidas = bebidas.reduce((sum, bebidaSelecionada) => {
    const bebidaPreco = Number(bebidaSelecionada.price ?? 0);
    return sum + (bebidaPreco * numPessoas);
  }, 0);
  const totalExtras = extras.reduce((sum, extra) => sum + extra.price, 0);
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

  const handleNewProductChange = (event) => {
    const { name, value } = event.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'type'
        ? {
            category: value === 'extra' ? prev.category : extraCategories[0],
            ingredients: value === 'extra' ? prev.ingredients : '',
            beverageCategoryId: value === 'bebida-opcao' ? prev.beverageCategoryId || getDefaultBeverageCategoryId(beverageCatalog) : prev.beverageCategoryId,
          }
        : {}),
    }));
  };

  const handleAddProduct = (event) => {
    event.preventDefault();

    const price = Number(newProduct.price);
    if (!newProduct.name.trim() || Number.isNaN(price) || price <= 0) {
      return;
    }

    const baseId = `${newProduct.type}-${Date.now()}`;

    if (newProduct.type === 'churrasco') {
      const newItem = {
        id: baseId,
        name: newProduct.name.trim(),
        price,
        meats: [],
        sideDishes: [],
        drinks: [],
      };
      setChurrascoCatalog((prev) => [...prev, newItem]);
    }

    if (newProduct.type === 'bebida-categoria') {
      const newItem = {
        id: baseId,
        name: newProduct.name.trim(),
        price,
        icon: '🍹',
        options: [],
      };
      setBeverageCatalog((prev) => [...prev, newItem]);
    }

    if (newProduct.type === 'bebida-opcao') {
      setBeverageCatalog((prev) => {
        const categoryId = newProduct.beverageCategoryId || prev[0]?.id;
        if (!categoryId) return prev;

        const optionId = `${baseId}-opcao`;

        return prev.map((item) => {
          if (item.id !== categoryId) return item;

          return {
            ...item,
            options: [
              ...(item.options ?? []),
              {
                id: optionId,
                name: newProduct.name.trim(),
                price,
              },
            ],
          };
        });
      });
    }

    if (newProduct.type === 'extra') {
      const newItem = {
        id: baseId,
        name: newProduct.name.trim(),
        price,
        category: newProduct.category,
        ingredients: newProduct.ingredients.trim(),
      };
      setExtrasCatalog((prev) => [...prev, newItem]);
    }

    setNewProduct((prev) => ({
      ...prev,
      name: '',
      price: '',
      ingredients: '',
      beverageCategoryId: getDefaultBeverageCategoryId(beverageCatalog),
    }));
  };

  const handleDeleteProduct = (type, itemId) => {
    if (type === 'churrasco') {
      setChurrascoCatalog((prev) => {
        const deleted = prev.find((item) => item.id === itemId);
        if (deleted && churrasco?.id === deleted.id) {
          setChurrasco(null);
        }
        return prev.filter((item) => item.id !== itemId);
      });
    }

    if (type === 'bebida-categoria') {
      setBeverageCatalog((prev) => {
        const deleted = prev.find((item) => item.id === itemId);
        if (deleted) {
          setBebidas((current) => current.filter((item) => item.categoryId !== deleted.id));
        }
        return prev.filter((item) => item.id !== itemId);
      });
    }

    if (type === 'bebida-opcao') {
      setBebidas((current) => current.filter((selected) => selected.optionId !== itemId));

      setBeverageCatalog((prev) =>
        prev.map((item) => ({
          ...item,
          options: (item.options ?? []).filter((option) => option.id !== itemId),
        }))
      );
    }

    if (type === 'extra') {
      setExtrasCatalog((prev) => {
        const deleted = prev.find((item) => item.id === itemId);
        if (deleted) {
          setExtras((current) => current.filter((item) => item.id !== deleted.id));
        }
        return prev.filter((item) => item.id !== itemId);
      });
    }
  };

  const startEditProduct = (type, item) => {
    if (type === 'bebida-opcao') {
      const parentCategory = beverageCatalog.find((category) =>
        (category.options ?? []).some((option) => option.id === item.id)
      );

      setEditingProduct({
        type,
        id: item.id,
        parentCategoryId: parentCategory?.id ?? '',
        originalName: item.name,
        name: item.name,
        price: item.price,
      });
      return;
    }

    setEditingProduct({
      type,
      id: item.id,
      originalName: item.name,
      name: item.name,
      price: item.price,
      category: item.category ?? extraCategories[0],
      ingredients: item.ingredients ?? '',
    });
  };

  const saveEditProduct = () => {
    if (!editingProduct) return;

    const price = Number(editingProduct.price);
    if (!editingProduct.name.trim() || Number.isNaN(price) || price <= 0) {
      return;
    }

    if (editingProduct.type === 'churrasco') {
      setChurrascoCatalog((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? { ...item, name: editingProduct.name.trim(), price }
            : item
        )
      );
      setChurrasco((current) =>
        current?.id === editingProduct.id
          ? { ...current, name: editingProduct.name.trim(), price }
          : current
      );
    }

    if (editingProduct.type === 'bebida-categoria') {
      setBeverageCatalog((prev) =>
        prev.map((item) => {
          if (item.id !== editingProduct.id) return item;

          return {
            ...item,
            name: editingProduct.name.trim(),
            price,
          };
        })
      );

      setBebidas((current) =>
        current.map((item) =>
          item.categoryId === editingProduct.id
            ? {
                ...item,
                categoryName: editingProduct.name.trim(),
              }
            : item
        )
      );
    }

    if (editingProduct.type === 'bebida-opcao') {
      const updatedName = editingProduct.name.trim();
      const targetCategoryId = editingProduct.parentCategoryId || '';

      setBeverageCatalog((prev) => {
        const previousCategoryId = prev.find((category) =>
          (category.options ?? []).some((option) => option.id === editingProduct.id)
        )?.id;

        return prev.map((category) => {
          const isPreviousCategory = category.id === previousCategoryId;
          const isTargetCategory = category.id === targetCategoryId;
          const existingOption = (category.options ?? []).find((option) => option.id === editingProduct.id);

          if (isTargetCategory) {
            const updatedOptions = existingOption
              ? (category.options ?? []).map((option) =>
                  option.id === editingProduct.id
                    ? { ...option, name: updatedName, price }
                    : option
                )
              : [
                  ...(category.options ?? []),
                  {
                    id: editingProduct.id,
                    name: updatedName,
                    price,
                  },
                ];

            return {
              ...category,
              options: updatedOptions,
            };
          }

          if (isPreviousCategory && previousCategoryId !== targetCategoryId) {
            return {
              ...category,
              options: (category.options ?? []).filter((option) => option.id !== editingProduct.id),
            };
          }

          return category;
        });
      });

      setBebidas((current) =>
        current.map((item) =>
          item.optionId === editingProduct.id
            ? {
                ...item,
                id: `${targetCategoryId}|${editingProduct.id}`,
                categoryId: targetCategoryId,
                categoryName:
                  beverageCatalog.find((category) => category.id === targetCategoryId)?.name ||
                  item.categoryName,
                name:
                  beverageCatalog.find((category) => category.id === targetCategoryId)?.name ||
                  item.name,
                option: updatedName,
                price,
              }
            : item
        )
      );
    }

    if (editingProduct.type === 'extra') {
      setExtrasCatalog((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                name: editingProduct.name.trim(),
                price,
                category: editingProduct.category,
                ingredients: editingProduct.ingredients.trim(),
              }
            : item
        )
      );

      setExtras((current) =>
        current.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                name: editingProduct.name.trim(),
                price,
                category: editingProduct.category,
                ingredients: editingProduct.ingredients.trim(),
              }
            : item
        )
      );
    }

    setEditingProduct(null);
  };

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
        {isAdminMode && (
          <section className="manager-card">
            <div className="manager-header">
              <h2>🛠️ Gerenciar Produtos</h2>
              <button
                className="manager-toggle"
                onClick={() => setShowManager((prev) => !prev)}
                type="button"
              >
                {showManager ? 'Fechar' : 'Abrir'}
              </button>
            </div>

            {showManager && (
              <>
                <form className="manager-form" onSubmit={handleAddProduct}>
                  <select name="type" value={newProduct.type} onChange={handleNewProductChange}>
                    <option value="churrasco">Pacote de churrasco</option>
                    <option value="bebida-categoria">Categoria de bebida</option>
                    <option value="bebida-opcao">Opção de bebida</option>
                    <option value="extra">Extra</option>
                  </select>

                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleNewProductChange}
                    placeholder="Nome do produto"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={newProduct.price}
                    onChange={handleNewProductChange}
                    placeholder="Preço"
                  />

                  {newProduct.type === 'bebida-opcao' && (
                    <select
                      name="beverageCategoryId"
                      value={newProduct.beverageCategoryId}
                      onChange={handleNewProductChange}
                    >
                      {beverageCatalog.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {newProduct.type === 'extra' && (
                    <>
                      <select name="category" value={newProduct.category} onChange={handleNewProductChange}>
                        {extraCategories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        name="ingredients"
                        value={newProduct.ingredients}
                        onChange={handleNewProductChange}
                        placeholder="Ingredientes (opcional)"
                      />
                    </>
                  )}

                  <button type="submit" className="manager-submit">+ Incluir produto</button>
                </form>

                {editingProduct && (
                  <div className="manager-edit-row">
                    <strong>Editando:</strong>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(event) => setEditingProduct((prev) => ({ ...prev, name: event.target.value }))}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(event) => setEditingProduct((prev) => ({ ...prev, price: event.target.value }))}
                    />
                    {editingProduct.type === 'bebida-opcao' && (
                      <select
                        value={editingProduct.parentCategoryId}
                        onChange={(event) => setEditingProduct((prev) => ({ ...prev, parentCategoryId: event.target.value }))}
                      >
                        {beverageCatalog.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {editingProduct.type === 'extra' && (
                      <>
                        <select
                          value={editingProduct.category}
                          onChange={(event) => setEditingProduct((prev) => ({ ...prev, category: event.target.value }))}
                        >
                          {extraCategories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editingProduct.ingredients}
                          onChange={(event) => setEditingProduct((prev) => ({ ...prev, ingredients: event.target.value }))}
                          placeholder="Ingredientes"
                        />
                      </>
                    )}
                    <button type="button" className="manager-save" onClick={saveEditProduct}>Salvar</button>
                    <button type="button" className="manager-cancel" onClick={() => setEditingProduct(null)}>Cancelar</button>
                  </div>
                )}

                <div className="manager-lists">
                  <div className="manager-list-block">
                    <h3>Pacotes de Churrasco</h3>
                    {churrascoCatalog.map((item) => (
                      <div key={item.id} className="manager-item-row">
                        <span>{item.name} — R$ {item.price.toFixed(2)}</span>
                        <div className="manager-item-actions">
                          <button type="button" onClick={() => startEditProduct('churrasco', item)}>Editar</button>
                          <button type="button" onClick={() => handleDeleteProduct('churrasco', item.id)}>Excluir</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="manager-list-block">
                    <h3>Bebidas</h3>
                    {beverageCatalog.map((category) => (
                      <div key={category.id} className="manager-beverage-group">
                        <div className="manager-item-row manager-beverage-category-row">
                          <span>{category.icon} {category.name} — R$ {category.price.toFixed(2)} (base)</span>
                          <div className="manager-item-actions">
                            <button type="button" onClick={() => startEditProduct('bebida-categoria', category)}>Editar</button>
                            <button type="button" onClick={() => handleDeleteProduct('bebida-categoria', category.id)}>Excluir</button>
                          </div>
                        </div>

                        <div className="manager-beverage-options">
                          {(category.options ?? []).map((option) => (
                            <div key={option.id} className="manager-item-row manager-beverage-option-row">
                              <span>{option.name} — R$ {option.price.toFixed(2)}</span>
                              <div className="manager-item-actions">
                                <button type="button" onClick={() => startEditProduct('bebida-opcao', option)}>Editar</button>
                                <button type="button" onClick={() => handleDeleteProduct('bebida-opcao', option.id)}>Excluir</button>
                              </div>
                            </div>
                          ))}

                          <p className="manager-beverage-empty">
                            {(!category.options || category.options.length === 0) && 'Nenhuma opção cadastrada'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="manager-list-block">
                    <h3>Extras</h3>
                    {extrasCatalog.map((item) => (
                      <div key={item.id} className="manager-item-row">
                        <span>{item.name} — R$ {item.price.toFixed(2)}</span>
                        <div className="manager-item-actions">
                          <button type="button" onClick={() => startEditProduct('extra', item)}>Editar</button>
                          <button type="button" onClick={() => handleDeleteProduct('extra', item.id)}>Excluir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        )}

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
              <p className="summary-line"><span>Itens de bebidas</span><strong>{bebidas.length}</strong></p>
              <p className="summary-line"><span>Extras</span><strong>{extras.length}</strong></p>
              <hr className="summary-divider" />
              <p className="summary-line"><span>Churrasco</span><strong>R$ {totalChurrasco.toFixed(2)}</strong></p>
              <p className="summary-line"><span>Bebidas</span><strong>R$ {totalBebidas.toFixed(2)}</strong></p>
              <p className="summary-line"><span>Extras</span><strong>R$ {totalExtras.toFixed(2)}</strong></p>
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
