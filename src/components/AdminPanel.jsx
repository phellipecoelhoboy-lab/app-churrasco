import { useState } from 'react';

const extraCategories = ['🍸 Caipis Gourmet', '🍹 Drinks Clássicos', '🎉 Serviços Adicionais'];

const getDefaultBeverageCategoryId = (catalog) => catalog[0]?.id ?? '';

function AdminPanel({
  churrascoCatalog,
  setChurrascoCatalog,
  beverageCatalog,
  setBeverageCatalog,
  extrasCatalog,
  setExtrasCatalog,
  onLogout,
}) {
  const [showManager, setShowManager] = useState(true);
  const [newProduct, setNewProduct] = useState({
    type: 'churrasco',
    name: '',
    category: extraCategories[0],
    ingredients: '',
    beverageCategoryId: getDefaultBeverageCategoryId(beverageCatalog),
  });
  const [editingProduct, setEditingProduct] = useState(null);

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

    if (!newProduct.name.trim()) {
      alert('⚠️ Preencha o nome do produto.');
      return;
    }

    const price = 0;

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
    if (!window.confirm('🚨 Tem certeza que deseja excluir este produto permanentemente?')) {
      return;
    }

    if (type === 'churrasco') {
      setChurrascoCatalog((prev) => prev.filter((item) => item.id !== itemId));
    }

    if (type === 'bebida-categoria') {
      setBeverageCatalog((prev) => prev.filter((item) => item.id !== itemId));
    }

    if (type === 'bebida-opcao') {
      setBeverageCatalog((prev) =>
        prev.map((item) => ({
          ...item,
          options: (item.options ?? []).filter((option) => option.id !== itemId),
        }))
      );
    }

    if (type === 'extra') {
      setExtrasCatalog((prev) => prev.filter((item) => item.id !== itemId));
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
      });
      return;
    }

    setEditingProduct({
      type,
      id: item.id,
      originalName: item.name,
      name: item.name,
      category: item.category ?? extraCategories[0],
      ingredients: item.ingredients ?? '',
    });
  };

  const saveEditProduct = () => {
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      alert('⚠️ Preencha o nome do produto.');
      return;
    }

    if (!window.confirm('Salvar as alterações deste produto?')) {
      return;
    }

    const price = 0;

    if (editingProduct.type === 'churrasco') {
      setChurrascoCatalog((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? { ...item, name: editingProduct.name.trim(), price }
            : item
        )
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
    }

    setEditingProduct(null);
  };

  return (
    <section className="manager-card" style={{ maxWidth: '1200px', margin: '2rem auto', padding: '2rem' }}>
      <div className="manager-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>🛠️ Gerenciar Produtos (Painel Administrativo)</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="manager-toggle"
            onClick={() => setShowManager((prev) => !prev)}
            type="button"
          >
            {showManager ? 'Ocultar Formulário' : 'Exibir Formulário'}
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.2s',
            }}
            type="button"
          >
            Sair do Admin
          </button>
        </div>
      </div>

      {showManager && (
        <form className="manager-form" onSubmit={handleAddProduct} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Tipo de Produto</label>
              <select name="type" value={newProduct.type} onChange={handleNewProductChange}>
                <option value="churrasco">Pacote de churrasco</option>
                <option value="bebida-categoria">Categoria de bebida</option>
                <option value="bebida-opcao">Opção de bebida</option>
                <option value="extra">Extra</option>
              </select>
            </div>

            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Nome do Produto</label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleNewProductChange}
                placeholder="Ex: Picanha Premium, Refrigerantes, etc."
              />
            </div>



            {newProduct.type === 'bebida-opcao' && (
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label>Categoria da Bebida</label>
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
              </div>
            )}

            {newProduct.type === 'extra' && (
              <>
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Categoria do Extra</label>
                  <select name="category" value={newProduct.category} onChange={handleNewProductChange}>
                    {extraCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Ingredientes / Descrição (opcional)</label>
                  <input
                    type="text"
                    name="ingredients"
                    value={newProduct.ingredients}
                    onChange={handleNewProductChange}
                    placeholder="Ingredientes ou detalhes"
                  />
                </div>
              </>
            )}
          </div>

          <button type="submit" className="manager-submit" style={{ width: '100%' }}>+ Incluir Produto</button>
        </form>
      )}

      {editingProduct && (
        <div className="manager-edit-row" style={{ padding: '1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>✏️ Editando Produto</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Nome</label>
              <input
                type="text"
                value={editingProduct.name}
                onChange={(event) => setEditingProduct((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            {editingProduct.type === 'bebida-opcao' && (
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label>Categoria</label>
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
              </div>
            )}
            {editingProduct.type === 'extra' && (
              <>
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Categoria</label>
                  <select
                    value={editingProduct.category}
                    onChange={(event) => setEditingProduct((prev) => ({ ...prev, category: event.target.value }))}
                  >
                    {extraCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Ingredientes</label>
                  <input
                    type="text"
                    value={editingProduct.ingredients}
                    onChange={(event) => setEditingProduct((prev) => ({ ...prev, ingredients: event.target.value }))}
                    placeholder="Ingredientes"
                  />
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="manager-save" onClick={saveEditProduct}>Salvar</button>
              <button type="button" className="manager-cancel" onClick={() => setEditingProduct(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="manager-lists">
        <div className="manager-list-block">
          <h3>Pacotes de Churrasco</h3>
          {churrascoCatalog.map((item) => (
            <div key={item.id} className="manager-item-row">
              <span>{item.name}</span>
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
                <span>{category.icon} {category.name}</span>
                <div className="manager-item-actions">
                  <button type="button" onClick={() => startEditProduct('bebida-categoria', category)}>Editar</button>
                  <button type="button" onClick={() => handleDeleteProduct('bebida-categoria', category.id)}>Excluir</button>
                </div>
              </div>

              <div className="manager-beverage-options">
                {(category.options ?? []).map((option) => (
                  <div key={option.id} className="manager-item-row manager-beverage-option-row">
                    <span>{option.name}</span>
                    <div className="manager-item-actions">
                      <button type="button" onClick={() => startEditProduct('bebida-opcao', option)}>Editar</button>
                      <button type="button" onClick={() => handleDeleteProduct('bebida-opcao', option.id)}>Excluir</button>
                    </div>
                  </div>
                ))}

                {(!category.options || category.options.length === 0) && (
                  <p className="manager-beverage-empty">Nenhuma opção cadastrada</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="manager-list-block">
          <h3>Extras</h3>
          {extrasCatalog.map((item) => (
            <div key={item.id} className="manager-item-row">
              <span>{item.name}</span>
              <div className="manager-item-actions">
                <button type="button" onClick={() => startEditProduct('extra', item)}>Editar</button>
                <button type="button" onClick={() => handleDeleteProduct('extra', item.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdminPanel;
