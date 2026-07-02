import React, { useState } from 'react';

const extraCategories = ['🍸 Caipis Gourmet', '🍹 Drinks Clássicos', '🎉 Serviços Adicionais'];

const beverageEmojis = [
  { emoji: '🍺', label: 'Cerveja/Chopp 🍺' },
  { emoji: '🍻', label: 'Cervejas 🍻' },
  { emoji: '🥤', label: 'Refrigerante/Lata 🥤' },
  { emoji: '🍹', label: 'Coquetel/Drinks 🍹' },
  { emoji: '🍷', label: 'Vinho 🍷' },
  { emoji: '🥃', label: 'Dose/Whisky 🥃' },
  { emoji: '🧃', label: 'Suco/Caixinha 🧃' },
  { emoji: '🍼', label: 'Água/Infantil 🍼' },
  { emoji: '🥂', label: 'Champanhe 🥂' },
  { emoji: '🥥', label: 'Água de Coco 🥥' },
  { emoji: '🍋', label: 'Limão/Caipirinha 🍋' },
  { emoji: '🧊', label: 'Gelo 🧊' }
];

function AdminPanel({
  churrascoCatalog,
  setChurrascoCatalog,
  beverageCatalog,
  setBeverageCatalog,
  extrasCatalog,
  setExtrasCatalog,
  meatsList,
  setMeatsList,
  sidesList,
  setSidesList,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('combos');
  const [editingProduct, setEditingProduct] = useState(null);

  // States for adding new items
  const [newCombo, setNewCombo] = useState({ name: '' });
  const [newBeverageCategory, setNewBeverageCategory] = useState({ name: '', icon: beverageEmojis[0].emoji });
  const [newBeverageOption, setNewBeverageOption] = useState({ categoryId: beverageCatalog[0]?.id ?? '', name: '' });
  const [newExtra, setNewExtra] = useState({ name: '', category: extraCategories[0], ingredients: '' });
  const [newMeatName, setNewMeatName] = useState('');
  const [newSideName, setNewSideName] = useState('');

  // ----------------------------------------------------
  // DELETE HANDLERS
  // ----------------------------------------------------
  const handleDeleteCombo = (id) => {
    if (window.confirm('🚨 Excluir este combo de churrasco permanentemente?')) {
      setChurrascoCatalog((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleDeleteBeverageCategory = (id) => {
    if (window.confirm('🚨 Excluir esta categoria de bebida? Todas as opções dentro dela serão apagadas.')) {
      setBeverageCatalog((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleDeleteBeverageOption = (categoryId, optionId) => {
    if (window.confirm('Excluir esta opção de bebida?')) {
      setBeverageCatalog((prev) =>
        prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            options: (cat.options ?? []).filter((opt) => opt.id !== optionId),
          };
        })
      );
    }
  };

  const handleDeleteExtra = (id) => {
    if (window.confirm('Excluir este item extra?')) {
      setExtrasCatalog((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleDeleteMeat = (meatName) => {
    if (window.confirm(`Excluir "${meatName}" da lista de carnes disponíveis?`)) {
      setMeatsList((prev) => prev.filter((item) => item !== meatName));
    }
  };

  const handleDeleteSide = (sideName) => {
    if (window.confirm(`Excluir "${sideName}" da lista de acompanhamentos disponíveis?`)) {
      setSidesList((prev) => prev.filter((item) => item !== sideName));
    }
  };

  // ----------------------------------------------------
  // ADD HANDLERS
  // ----------------------------------------------------
  const handleAddCombo = (e) => {
    e.preventDefault();
    if (!newCombo.name.trim()) return alert('Digite o nome do combo.');
    const newItem = {
      id: `churrasco-${Date.now()}`,
      name: newCombo.name.trim(),
      price: 0,
      meats: [],
      sideDishes: [],
      drinks: [],
    };
    setChurrascoCatalog((prev) => [...prev, newItem]);
    setNewCombo({ name: '' });
  };

  const handleAddBeverageCategory = (e) => {
    e.preventDefault();
    if (!newBeverageCategory.name.trim()) return alert('Digite o nome da categoria.');
    const newItem = {
      id: `bebida-${Date.now()}`,
      name: newBeverageCategory.name.trim(),
      icon: newBeverageCategory.icon,
      options: [],
    };
    setBeverageCatalog((prev) => [...prev, newItem]);
    setNewBeverageCategory({ name: '', icon: beverageEmojis[0].emoji });
  };

  const handleAddBeverageOption = (e) => {
    e.preventDefault();
    const catId = newBeverageOption.categoryId || beverageCatalog[0]?.id;
    if (!catId) return alert('Cadastre uma categoria de bebida primeiro.');
    if (!newBeverageOption.name.trim()) return alert('Digite o nome da bebida.');

    setBeverageCatalog((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          options: [
            ...(cat.options ?? []),
            {
              id: `bebida-opcao-${Date.now()}`,
              name: newBeverageOption.name.trim(),
              price: 0,
            },
          ],
        };
      })
    );
    setNewBeverageOption((prev) => ({ ...prev, name: '' }));
  };

  const handleAddExtra = (e) => {
    e.preventDefault();
    if (!newExtra.name.trim()) return alert('Digite o nome do extra.');
    const newItem = {
      id: `extra-${Date.now()}`,
      name: newExtra.name.trim(),
      category: newExtra.category,
      price: 0,
      ingredients: newExtra.ingredients.trim(),
    };
    setExtrasCatalog((prev) => [...prev, newItem]);
    setNewExtra({ name: '', category: extraCategories[0], ingredients: '' });
  };

  const handleAddMeat = (e) => {
    e.preventDefault();
    const name = newMeatName.trim();
    if (!name) return alert('Digite o nome da carne.');
    if (meatsList.includes(name)) return alert('Esta carne já está na lista.');
    setMeatsList((prev) => [...prev, name]);
    setNewMeatName('');
  };

  const handleAddSide = (e) => {
    e.preventDefault();
    const name = newSideName.trim();
    if (!name) return alert('Digite o nome do acompanhamento.');
    if (sidesList.includes(name)) return alert('Este acompanhamento já está na lista.');
    setSidesList((prev) => [...prev, name]);
    setNewSideName('');
  };

  // ----------------------------------------------------
  // EDIT HANDLERS
  // ----------------------------------------------------
  const startEditProduct = (type, item, parentCatId = null) => {
    if (type === 'churrasco') {
      setEditingProduct({
        type,
        id: item.id,
        name: item.name,
        meats: item.meats ?? [],
        sideDishes: item.sideDishes ?? [],
        drinks: item.drinks ?? [],
      });
    } else if (type === 'bebida-categoria') {
      setEditingProduct({
        type,
        id: item.id,
        name: item.name,
        icon: item.icon ?? beverageEmojis[0].emoji,
      });
    } else if (type === 'bebida-opcao') {
      setEditingProduct({
        type,
        id: item.id,
        parentCategoryId: parentCatId,
        name: item.name,
      });
    } else if (type === 'extra') {
      setEditingProduct({
        type,
        id: item.id,
        name: item.name,
        category: item.category ?? extraCategories[0],
        ingredients: item.ingredients ?? '',
      });
    }
  };

  const saveEditProduct = () => {
    if (!editingProduct) return;
    if (!editingProduct.name.trim()) return alert('O nome do produto não pode ser vazio.');

    if (editingProduct.type === 'churrasco') {
      setChurrascoCatalog((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                name: editingProduct.name.trim(),
                price: item.price,
                meats: editingProduct.meats,
                sideDishes: editingProduct.sideDishes,
                drinks: editingProduct.drinks,
              }
            : item
        )
      );
    } else if (editingProduct.type === 'bebida-categoria') {
      setBeverageCatalog((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? { ...item, name: editingProduct.name.trim(), icon: editingProduct.icon }
            : item
        )
      );
    } else if (editingProduct.type === 'bebida-opcao') {
      const updatedName = editingProduct.name.trim();
      setBeverageCatalog((prev) =>
        prev.map((cat) => {
          if (cat.id !== editingProduct.parentCategoryId) return cat;
          return {
            ...cat,
            options: (cat.options ?? []).map((opt) =>
              opt.id === editingProduct.id
                ? { ...opt, name: updatedName, price: 0 }
                : opt
            ),
          };
        })
      );
    } else if (editingProduct.type === 'extra') {
      setExtrasCatalog((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                name: editingProduct.name.trim(),
                category: editingProduct.category,
                price: item.price,
                ingredients: editingProduct.ingredients.trim(),
              }
            : item
        )
      );
    }

    setEditingProduct(null);
  };

  // Checkbox helpers for editing combos
  const handleToggleIngredient = (field, itemValue) => {
    setEditingProduct((prev) => {
      const currentList = prev[field] ?? [];
      const updatedList = currentList.includes(itemValue)
        ? currentList.filter((v) => v !== itemValue)
        : [...currentList, itemValue];
      return { ...prev, [field]: updatedList };
    });
  };

  // Helper to get all options across the beverages catalog for combo inclusion
  const getAllBeverageOptions = () => {
    const list = [];
    beverageCatalog.forEach((cat) => {
      (cat.options ?? []).forEach((opt) => {
        list.push(opt.name);
      });
    });
    return Array.from(new Set(list)); // remove duplicates just in case
  };

  return (
    <div className="admin-container">
      {/* HEADER BAR */}
      <header className="admin-header">
        <div className="admin-header-left">
          <img src="/img/oyama-logo.png" alt="Logo Oyama" className="admin-logo" />
          <div>
            <h1>Painel Administrativo</h1>
            <p>Gerenciamento de Combos e Cardápios</p>
          </div>
        </div>
        <button onClick={onLogout} className="btn-logout">
          🚪 Sair do Admin
        </button>
      </header>

      {/* ADMIN CONTENT WRAPPER */}
      <div className="admin-layout">
        {/* TABS SELECTOR */}
        <aside className="admin-sidebar">
          <button
            className={`tab-btn ${activeTab === 'combos' ? 'active' : ''}`}
            onClick={() => { setActiveTab('combos'); setEditingProduct(null); }}
          >
            🍖 Combos de Churrasco
          </button>
          <button
            className={`tab-btn ${activeTab === 'bebidas' ? 'active' : ''}`}
            onClick={() => { setActiveTab('bebidas'); setEditingProduct(null); }}
          >
            🍻 Cardápio de Bebidas
          </button>
          <button
            className={`tab-btn ${activeTab === 'extras' ? 'active' : ''}`}
            onClick={() => { setActiveTab('extras'); setEditingProduct(null); }}
          >
            🍸 Caipis & Serviços Extras
          </button>
          <button
            className={`tab-btn ${activeTab === 'listas' ? 'active' : ''}`}
            onClick={() => { setActiveTab('listas'); setEditingProduct(null); }}
          >
            ⚙️ Carnes & Acompanhamentos
          </button>
        </aside>

        {/* WORKSPACE */}
        <main className="admin-workspace">
          {/* ----------------------------------------------------
              TAB: COMBOS
             ---------------------------------------------------- */}
          {activeTab === 'combos' && (
            <div className="admin-section">
              <div className="section-title-bar">
                <h2>🍖 Gerenciar Combos de Churrasco</h2>
                <p>Crie combos (como N1, N2) e defina quais carnes, acompanhamentos e bebidas pertencem a cada um.</p>
              </div>

              {/* Form: Add Combo */}
              <form onSubmit={handleAddCombo} className="admin-form-inline">
                <input
                  type="text"
                  placeholder="Nome do Combo (ex: Churrasco N4)"
                  value={newCombo.name}
                  onChange={(e) => setNewCombo({ ...newCombo, name: e.target.value })}
                  required
                />
                <button type="submit" className="btn-primary">+ Criar Combo</button>
              </form>

              {/* Table / List */}
              <div className="admin-grid-cards">
                {churrascoCatalog.map((item) => (
                  <div key={item.id} className="catalog-card">
                    <div className="card-header">
                      <h3>{item.name}</h3>
                    </div>
                    <div className="card-body">
                      <p><strong>🥩 Carnes:</strong> {item.isCustom ? 'Escolha livre no site' : (item.meats?.join(', ') || 'Nenhuma selecionada')}</p>
                      <p><strong>🥗 Acompanhamentos:</strong> {item.sideDishes?.join(', ') || 'Nenhum selecionado'}</p>
                      <p><strong>🥤 Bebidas inclusas:</strong> {item.drinks?.join(', ') || 'Nenhuma selecionada'}</p>
                    </div>
                    <div className="card-actions">
                      <button onClick={() => startEditProduct('churrasco', item)} className="btn-edit">✏️ Editar Combo</button>
                      {!item.isCustom && (
                        <button onClick={() => handleDeleteCombo(item.id)} className="btn-delete">🗑️ Excluir</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              TAB: BEBIDAS
             ---------------------------------------------------- */}
          {activeTab === 'bebidas' && (
            <div className="admin-section">
              <div className="section-title-bar">
                <h2>🍻 Gerenciar Cardápio de Bebidas</h2>
                <p>Crie categorias de bebidas (Cerveja, Refrigerante) e cadastre as marcas e opções disponíveis.</p>
              </div>

              <div className="grid-split">
                {/* Categorias */}
                <div className="split-column">
                  <div className="card-inner">
                    <h3>📂 Criar Categoria de Bebida</h3>
                    <form onSubmit={handleAddBeverageCategory} className="admin-form-stacked">
                      <input
                        type="text"
                        placeholder="Nome da Categoria (ex: Cervejas)"
                        value={newBeverageCategory.name}
                        onChange={(e) => setNewBeverageCategory({ ...newBeverageCategory, name: e.target.value })}
                        required
                      />
                      <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem', fontWeight: 600 }}>Ícone da Categoria (Emoji)</label>
                      <select
                        value={newBeverageCategory.icon}
                        onChange={(e) => setNewBeverageCategory({ ...newBeverageCategory, icon: e.target.value })}
                        required
                        style={{ background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem 1rem', borderRadius: '6px' }}
                      >
                        {beverageEmojis.map((item) => (
                          <option key={item.emoji} value={item.emoji}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>+ Criar Categoria</button>
                    </form>
                  </div>

                  {/* List Beverage Categories */}
                  <div className="list-group">
                    <h3>Categorias Cadastradas</h3>
                    {beverageCatalog.map((cat) => (
                      <div key={cat.id} className="list-item">
                        <span>{cat.icon} {cat.name}</span>
                        <div className="item-actions">
                          <button onClick={() => startEditProduct('bebida-categoria', cat)} className="btn-icon">✏️</button>
                          <button onClick={() => handleDeleteBeverageCategory(cat.id)} className="btn-icon-danger">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opções de Bebidas */}
                <div className="split-column">
                  <div className="card-inner">
                    <h3>🥤 Cadastrar Opção/Marca</h3>
                    <form onSubmit={handleAddBeverageOption} className="admin-form-stacked">
                      <select
                        value={newBeverageOption.categoryId}
                        onChange={(e) => setNewBeverageOption({ ...newBeverageOption, categoryId: e.target.value })}
                      >
                        <option value="">Selecione a Categoria</option>
                        {beverageCatalog.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Nome da Bebida (ex: Heineken, Coca-Cola)"
                        value={newBeverageOption.name}
                        onChange={(e) => setNewBeverageOption({ ...newBeverageOption, name: e.target.value })}
                        required
                      />
                      <button type="submit" className="btn-primary">+ Cadastrar Bebida</button>
                    </form>
                  </div>

                  {/* Options List nested inside categories */}
                  <div className="list-group">
                    <h3>Bebidas e Marcas por Categoria</h3>
                    {beverageCatalog.map((cat) => (
                      <div key={cat.id} className="nested-category-block">
                        <h4>{cat.icon} {cat.name}</h4>
                        {(cat.options ?? []).map((opt) => (
                          <div key={opt.id} className="list-item nested-item">
                            <span>{opt.name}</span>
                            <div className="item-actions">
                              <button onClick={() => startEditProduct('bebida-opcao', opt, cat.id)} className="btn-icon">✏️</button>
                              <button onClick={() => handleDeleteBeverageOption(cat.id, opt.id)} className="btn-icon-danger">🗑️</button>
                            </div>
                          </div>
                        ))}
                        {(!cat.options || cat.options.length === 0) && (
                          <p className="empty-nested">Nenhuma bebida cadastrada.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              TAB: EXTRAS
             ---------------------------------------------------- */}
          {activeTab === 'extras' && (
            <div className="admin-section">
              <div className="section-title-bar">
                <h2>🍸 Gerenciar Caipis & Serviços Extras</h2>
                <p>Adicione opções de caipirinhas, coquetéis ou serviços (como garçons) que o cliente pode adicionar no orçamento.</p>
              </div>

              <div className="card-inner" style={{ marginBottom: '2rem' }}>
                <h3>➕ Adicionar Novo Item Extra</h3>
                <form onSubmit={handleAddExtra} className="admin-form-inline-wrap">
                  <select
                    value={newExtra.category}
                    onChange={(e) => setNewExtra({ ...newExtra, category: e.target.value })}
                  >
                    {extraCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Nome do Item (ex: Caipirinha de Morango)"
                    value={newExtra.name}
                    onChange={(e) => setNewExtra({ ...newExtra, name: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Ingredientes / Detalhes (opcional)"
                    value={newExtra.ingredients}
                    onChange={(e) => setNewExtra({ ...newExtra, ingredients: e.target.value })}
                  />
                  <button type="submit" className="btn-primary">+ Adicionar Extra</button>
                </form>
              </div>

              {/* List extras grouped by category */}
              <div className="extras-category-layout">
                {extraCategories.map((category) => {
                  const filtered = extrasCatalog.filter(e => e.category === category);
                  return (
                    <div key={category} className="list-group">
                      <h3>{category}</h3>
                      {filtered.map((item) => (
                        <div key={item.id} className="list-item block-item">
                          <div className="item-details">
                            <strong>{item.name}</strong>
                            {item.ingredients && <span className="item-sub">{item.ingredients}</span>}
                          </div>
                          <div className="item-actions">
                            <button onClick={() => startEditProduct('extra', item)} className="btn-icon">✏️</button>
                            <button onClick={() => handleDeleteExtra(item.id)} className="btn-icon-danger">🗑️</button>
                          </div>
                        </div>
                      ))}
                      {filtered.length === 0 && <p className="empty-nested">Nenhum item nesta categoria.</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              TAB: DISPONÍVEIS LISTAS (CARNES & SIDES)
             ---------------------------------------------------- */}
          {activeTab === 'listas' && (
            <div className="admin-section">
              <div className="section-title-bar">
                <h2>⚙️ Gerenciar Carnes & Acompanhamentos Globais</h2>
                <p>Edite a lista principal de carnes e acompanhamentos que ficam disponíveis para seleção nos combos e na customização do cliente.</p>
              </div>

              <div className="grid-split">
                {/* Carnes Disponíveis */}
                <div className="split-column">
                  <div className="card-inner">
                    <h3>🥩 Adicionar Carne na Lista Global</h3>
                    <form onSubmit={handleAddMeat} className="admin-form-inline">
                      <input
                        type="text"
                        placeholder="Ex: Picanha Black Angus, Picanha Nobre"
                        value={newMeatName}
                        onChange={(e) => setNewMeatName(e.target.value)}
                        required
                      />
                      <button type="submit" className="btn-primary">+ Add</button>
                    </form>
                  </div>

                  <div className="list-group">
                    <h3>Carnes Cadastradas ({meatsList.length})</h3>
                    <div className="scrollable-list">
                      {meatsList.map((meat) => (
                        <div key={meat} className="list-item">
                          <span>🥩 {meat}</span>
                          <button onClick={() => handleDeleteMeat(meat)} className="btn-icon-danger">🗑️</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Acompanhamentos Disponíveis */}
                <div className="split-column">
                  <div className="card-inner">
                    <h3>🥗 Adicionar Acompanhamento na Lista Global</h3>
                    <form onSubmit={handleAddSide} className="admin-form-inline">
                      <input
                        type="text"
                        placeholder="Ex: Vinagrete, Farofa de Ovo"
                        value={newSideName}
                        onChange={(e) => setNewSideName(e.target.value)}
                        required
                      />
                      <button type="submit" className="btn-primary">+ Add</button>
                    </form>
                  </div>

                  <div className="list-group">
                    <h3>Acompanhamentos Cadastrados ({sidesList.length})</h3>
                    <div className="scrollable-list">
                      {sidesList.map((side) => (
                        <div key={side} className="list-item">
                          <span>🥗 {side}</span>
                          <button onClick={() => handleDeleteSide(side)} className="btn-icon-danger">🗑️</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ----------------------------------------------------
          MODAL: EDIT PRODUCT (MODAL DIALOG)
         ---------------------------------------------------- */}
      {editingProduct && (
        <div className="admin-modal-overlay">
          <div className={`admin-modal-card ${editingProduct.type === 'churrasco' ? 'large' : ''}`}>
            <div className="modal-header">
              <h2>✏️ Editar {editingProduct.type === 'churrasco' ? 'Combo' : 'Produto'}</h2>
              <button onClick={() => setEditingProduct(null)} className="btn-close">×</button>
            </div>
            <div className="modal-body">
              {/* Common Fields */}
              <div className="input-field">
                <label>Nome do Produto</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>

              {/* Combo Specific Fields */}
              {editingProduct.type === 'churrasco' && (
                <>
                  {!editingProduct.isCustom && (
                    <div className="combo-checklists">
                      {/* Checkbox: Meats */}
                      <div className="checklist-column">
                        <h4>🥩 Carnes Inclusas</h4>
                        <div className="checklist-scroll">
                          {meatsList.map((meat) => (
                            <label key={meat} className="check-row">
                              <input
                                type="checkbox"
                                checked={(editingProduct.meats ?? []).includes(meat)}
                                onChange={() => handleToggleIngredient('meats', meat)}
                              />
                              <span>{meat}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Checkbox: Side Dishes */}
                      <div className="checklist-column">
                        <h4>🥗 Acompanhamentos Inclusos</h4>
                        <div className="checklist-scroll">
                          {sidesList.map((side) => (
                            <label key={side} className="check-row">
                              <input
                                type="checkbox"
                                checked={(editingProduct.sideDishes ?? []).includes(side)}
                                onChange={() => handleToggleIngredient('sideDishes', side)}
                              />
                              <span>{side}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Checkbox: Drinks */}
                      <div className="checklist-column">
                        <h4>🥤 Bebidas Inclusas</h4>
                        <div className="checklist-scroll">
                          {getAllBeverageOptions().map((drink) => (
                            <label key={drink} className="check-row">
                              <input
                                type="checkbox"
                                checked={(editingProduct.drinks ?? []).includes(drink)}
                                onChange={() => handleToggleIngredient('drinks', drink)}
                              />
                              <span>{drink}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Beverage Category Specific Fields */}
              {editingProduct.type === 'bebida-categoria' && (
                <div className="input-field">
                  <label>Ícone da Categoria (Emoji)</label>
                  <select
                    value={editingProduct.icon}
                    onChange={(e) => setEditingProduct({ ...editingProduct, icon: e.target.value })}
                    style={{ background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem 1rem', borderRadius: '6px' }}
                  >
                    {beverageEmojis.map((item) => (
                      <option key={item.emoji} value={item.emoji}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Extra Specific Fields */}
              {editingProduct.type === 'extra' && (
                <>
                  <div className="input-field">
                    <label>Categoria</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    >
                      {extraCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-field">
                    <label>Ingredientes / Descrição</label>
                    <input
                      type="text"
                      value={editingProduct.ingredients}
                      onChange={(e) => setEditingProduct({ ...editingProduct, ingredients: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={saveEditProduct} className="btn-save">Salvar Alterações</button>
              <button onClick={() => setEditingProduct(null)} className="btn-cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          STYLES (LOCAL SCOPE CARRIED DIRECTLY)
         ---------------------------------------------------- */}
      <style>{`
        .admin-container {
          min-height: 100vh;
          background: #0b0f19;
          color: #f1f5f9;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .admin-header {
          background: #111827;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-logo {
          height: 48px;
          border-radius: 8px;
          border: 1px solid rgba(220, 179, 96, 0.3);
        }

        .admin-header h1 {
          font-size: 1.3rem;
          margin: 0;
          font-weight: 700;
          color: #ffffff;
        }

        .admin-header p {
          font-size: 0.8rem;
          color: #9ca3af;
          margin: 0;
        }

        .btn-logout {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-logout:hover {
          background: #ef4444;
          color: #ffffff;
        }

        .admin-layout {
          flex: 1;
          display: flex;
        }

        .admin-sidebar {
          width: 260px;
          background: #111827;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .tab-btn {
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          color: #9ca3af;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #ffffff;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, rgba(255, 140, 0, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%);
          color: #ff8c00;
          border-left: 3px solid #ff8c00;
        }

        .admin-workspace {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .admin-section {
          animation: adminFadeIn 0.3s ease-out;
        }

        .section-title-bar {
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 1rem;
        }

        .section-title-bar h2 {
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
          color: #ffffff;
        }

        .section-title-bar p {
          color: #9ca3af;
          font-size: 0.9rem;
          margin: 0;
        }

        /* FORMS */
        .admin-form-inline {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          background: #1e293b;
          padding: 1rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .admin-form-inline input {
          flex: 1;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 0.6rem 1rem;
          border-radius: 6px;
        }

        .admin-form-inline button {
          cursor: pointer;
        }

        .admin-form-stacked {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-top: 1rem;
        }

        .admin-form-stacked input, 
        .admin-form-stacked select {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 0.6rem 1rem;
          border-radius: 6px;
        }

        .admin-form-inline-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          margin-top: 1rem;
        }

        .admin-form-inline-wrap input, 
        .admin-form-inline-wrap select {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 0.6rem 1rem;
          border-radius: 6px;
          flex: 1 1 180px;
        }

        /* CARDS GRID */
        .admin-grid-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.5rem;
        }

        .catalog-card {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.15rem;
          color: #ffffff;
        }

        .card-body {
          font-size: 0.88rem;
          color: #94a3b8;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .card-body p {
          margin: 0;
          line-height: 1.4;
        }

        .card-actions {
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
        }

        /* GRID SPLIT */
        .grid-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .card-inner {
          background: #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 2rem;
        }

        .card-inner h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #ffffff;
        }

        /* LIST GROUPS */
        .list-group {
          background: #111827;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .list-group h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 0.5rem;
        }

        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          font-size: 0.92rem;
        }

        .list-item:last-child {
          border-bottom: none;
        }

        .list-item.nested-item {
          padding-left: 2rem;
          background: rgba(255, 255, 255, 0.01);
        }

        .list-item.block-item {
          flex-direction: row;
          align-items: center;
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .item-sub {
          font-size: 0.78rem;
          color: #94a3b8;
        }

        .nested-category-block {
          margin-bottom: 1.5rem;
        }

        .nested-category-block h4 {
          margin: 0;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          font-size: 0.95rem;
          color: #ffffff;
          border-left: 2px solid #ff8c00;
        }

        .empty-nested {
          font-size: 0.8rem;
          color: #64748b;
          padding: 0.5rem 1.5rem;
          margin: 0;
        }

        .scrollable-list {
          max-height: 400px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          padding: 0.5rem;
        }

        .extras-category-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        /* BUTTONS */
        .btn-primary {
          background: #ff8c00;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 0.6rem 1.2rem;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          background: #e07b00;
          transform: translateY(-0.5px);
        }

        .btn-edit {
          flex: 1;
          background: rgba(255, 255, 255, 0.06);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }

        .btn-edit:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .btn-delete {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }

        .btn-delete:hover {
          background: #ef4444;
          color: #ffffff;
        }

        .btn-icon {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .btn-icon-danger {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .btn-icon-danger:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        /* MODAL */
        .admin-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .admin-modal-card {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          animation: modalFadeIn 0.3s ease-out;
        }

        .admin-modal-card.large {
          max-width: 850px;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .modal-header {
          padding: 1.2rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #ffffff;
        }

        .btn-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .btn-close:hover {
          color: #ffffff;
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          max-height: 70vh;
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .btn-save {
          background: #ff8c00;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 0.6rem 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-save:hover {
          background: #e07b00;
        }

        .btn-cancel {
          background: transparent;
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 0.6rem 1.2rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .input-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.2rem;
        }

        .input-field label {
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .input-field input,
        .input-field select {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-size: 1rem;
        }

        .combo-checklists {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .checklist-column {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .checklist-column h4 {
          margin: 0;
          font-size: 0.9rem;
          color: #ffffff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 0.4rem;
        }

        .checklist-scroll {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          max-height: 280px;
          overflow-y: auto;
          padding: 0.6rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .check-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.85rem;
          color: #cbd5e1;
        }

        .check-row input {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default AdminPanel;
