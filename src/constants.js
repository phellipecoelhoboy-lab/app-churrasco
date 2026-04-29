// Todas as carnes disponíveis
export const availableMeats = [
  'Picanha Black Angus',
  'Picanha Maturada',
  'Maminha Wagyu',
  'Maminha',
  'Short Ribs',
  'Bife Ancho',
  'Chorizo',
  'Cordeiro',
  'Picanha Suína Duroc Pork',
  'Picanha Suína',
  'Linguiça Cuiabana',
  'Linguiça de Pernil',
  'Drumete',
  'Coração',
  'Galeto Desossado',
  'Filé de Coxa Temperado',
];

// Todos os acompanhamentos disponíveis
export const availableSideDishes = [
  'Pão de Alho Artesanal',
  'Queijo Coalho com Mel',
  'Arroz',
  'Farofa',
  'Maionese',
  'Molho a Campanha',
  'Salada',
];

export const churrascoPackages = [
  {
    name: 'Churrasco N1',
    price: 75.00,
    meats: ['Picanha Black Angus', 'Maminha Wagyu', 'Short Ribs', 'Chorizo', 'Cordeiro', 'Picanha Suína Duroc Pork', 'Linguiça Cuiabana', 'Drumete', 'Coração', 'Galeto Desossado'],
    sideDishes: ['Pão de Alho Artesanal', 'Queijo Coalho com Mel', 'Arroz', 'Farofa', 'Maionese', 'Molho a Campanha', 'Salada'],
    drinks: ['Coca Comum', 'Coca Light', 'Guaraná', 'Mate', 'Água'],
  },
  {
    name: 'Churrasco N2',
    price: 55.00,
    meats: ['Picanha Maturada', 'Maminha', 'Bife Ancho', 'Picanha Suína', 'Linguiça de Pernil', 'Drumete', 'Coração', 'Filé de Coxa Temperado'],
    sideDishes: ['Pão de Alho Artesanal', 'Queijo Coalho com Mel', 'Arroz', 'Farofa', 'Maionese', 'Molho a Campanha', 'Salada'],
    drinks: ['Coca Comum', 'Coca Light', 'Guaraná', 'Mate', 'Água'],
  },
  {
    name: 'Churrasco N3',
    price: 43.00,
    meats: ['Picanha Black Angus', 'Maminha Wagyu', 'Short Ribs', 'Chorizo', 'Cordeiro', 'Picanha Suína Duroc Pork', 'Linguiça Cuiabana', 'Drumete', 'Coração', 'Galeto Desossado'],
    sideDishes: ['Pão de Alho Artesanal', 'Queijo Coalho com Mel'],
    drinks: ['Coca Comum', 'Coca Light', 'Guaraná', 'Mate', 'Água'],
  },
  {
    name: 'Churrasco Customizado 🎯',
    price: 65.00,
    isCustom: true,
    meats: [],
    sideDishes: ['Pão de Alho Artesanal', 'Queijo Coalho com Mel', 'Arroz', 'Farofa', 'Maionese', 'Molho a Campanha', 'Salada'],
    drinks: ['Coca Comum', 'Coca Light', 'Guaraná', 'Mate', 'Água'],
    description: 'Escolha apenas as carnes que você quer! 🍖',
  },
];

export const beverages = [
  { 
    name: 'Refrigerante',
    price: 0,
    icon: '🥤',
    options: [
      { name: 'Coca-Cola', price: 0 },
      { name: 'Coca-Cola Zero', price: 0 },
      { name: 'Pepsi', price: 0 },
      { name: 'Guaraná', price: 0 },
      { name: 'Fanta Laranja', price: 0 },
      { name: 'Fanta Uva', price: 0 },
      { name: 'Sprite', price: 0 },
    ]
  },
  { 
    name: 'Cerveja',
    price: 0,
    icon: '🍺',
    options: [
      { name: 'Skol', price: 0 },
      { name: 'Brahma', price: 0 },
      { name: 'Heineken', price: 0 },
      { name: 'Antártica', price: 0 },
      { name: 'Itaipava', price: 0 },
      { name: 'Budweiser', price: 0 },
    ]
  },
  { 
    name: 'Suco Natural',
    price: 0,
    icon: '🧃',
    options: [
      { name: 'Laranja', price: 0 },
      { name: 'Morango', price: 0 },
      { name: 'Maracujá', price: 0 },
      { name: 'Melancia', price: 0 },
      { name: 'Melão', price: 0 },
      { name: 'Goiaba', price: 0 },
    ]
  },
  { 
    name: 'Vinho',
    price: 0,
    icon: '🍷',
    options: [
      { name: 'Tinto', price: 0 },
      { name: 'Branco', price: 0 },
      { name: 'Rosé', price: 0 },
    ]
  },
  { 
    name: 'Água Mineral',
    price: 0,
    icon: '💧',
    options: [
      { name: 'Com Gás', price: 0 },
      { name: 'Sem Gás', price: 0 },
    ]
  },
  { 
    name: 'Energético',
    price: 0,
    icon: '⚡',
    options: [
      { name: 'Red Bull', price: 0 },
      { name: 'Monster', price: 0 },
      { name: 'Guaraná Antarctica', price: 0 },
    ]
  },
];

export const openBarPackages = [
  {
    name: 'Bebidas Simples',
    price: 25.00,
    description: 'Sem marca pré determinada',
  },
  {
    name: 'Bebidas Standart',
    price: 30.00,
    description: 'Smirnoff, Cachaça Salinas, Rum Montila, Syrup Monin',
  },
  {
    name: 'Bebidas Premium',
    price: 45.00,
    description: 'Absolut, Cachaça Leblon, Bacardi, Syrup Monin',
  },
];

export const caipis = [
  { name: 'Morango', ingredients: 'Açucar de baunilha, Espuma artesanal, Canela' },
  { name: 'Limão', ingredients: 'Capim-limão, Espuma artesanal' },
  { name: 'Melancia', ingredients: 'Açucar de baunilha, Espuma artesanal, Capim-limão' },
  { name: 'Abacaxi', ingredients: 'Açucar de baunilha, Hortelã' },
  { name: 'Maracujá', ingredients: 'Açucar de pimenta vermelha, Manjericão' },
];

export const classicDrinks = [
  { name: 'Mojito', ingredients: 'Rum, Limão, Hortelã, Água com gás' },
  { name: 'Sex on the Beach', ingredients: 'Vodka, Suco de laranja, Syrup pêssego, Grenadine' },
  { name: 'Lagoa Azul', ingredients: 'Vodka, Syrup Blue Curacau, Sprite' },
  { name: 'Apple Martinni', ingredients: 'Vodka, Syrup maçã verde, Shweppes Citrus' },
];

export const outros = [
  { name: 'Garçom' },
  { name: 'Copeiro' },
  { name: 'Fotografo' },
];
