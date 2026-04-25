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
    price: 8.00,
    icon: '🥤',
    options: [
      { name: 'Coca-Cola', price: 8.00 },
      { name: 'Coca-Cola Zero', price: 8.50 },
      { name: 'Pepsi', price: 7.50 },
      { name: 'Guaraná', price: 7.50 },
      { name: 'Fanta Laranja', price: 7.50 },
      { name: 'Fanta Uva', price: 7.50 },
      { name: 'Sprite', price: 7.50 },
    ]
  },
  { 
    name: 'Cerveja',
    price: 12.00,
    icon: '🍺',
    options: [
      { name: 'Skol', price: 12.00 },
      { name: 'Brahma', price: 12.00 },
      { name: 'Heineken', price: 15.00 },
      { name: 'Antártica', price: 12.00 },
      { name: 'Itaipava', price: 11.00 },
      { name: 'Budweiser', price: 15.00 },
    ]
  },
  { 
    name: 'Suco Natural',
    price: 10.00,
    icon: '🧃',
    options: [
      { name: 'Laranja', price: 10.00 },
      { name: 'Morango', price: 11.00 },
      { name: 'Maracujá', price: 11.00 },
      { name: 'Melancia', price: 11.00 },
      { name: 'Melão', price: 11.00 },
      { name: 'Goiaba', price: 11.00 },
    ]
  },
  { 
    name: 'Vinho',
    price: 15.00,
    icon: '🍷',
    options: [
      { name: 'Tinto', price: 15.00 },
      { name: 'Branco', price: 15.00 },
      { name: 'Rosé', price: 16.00 },
    ]
  },
  { 
    name: 'Água Mineral',
    price: 3.00,
    icon: '💧',
    options: [
      { name: 'Com Gás', price: 3.50 },
      { name: 'Sem Gás', price: 3.00 },
    ]
  },
  { 
    name: 'Energético',
    price: 18.00,
    icon: '⚡',
    options: [
      { name: 'Red Bull', price: 18.00 },
      { name: 'Monster', price: 17.00 },
      { name: 'Guaraná Antarctica', price: 16.00 },
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
  { name: 'Morango', ingredients: 'Açucar de baunilha, Espuma artesanal, Canela', price: 10.00 },
  { name: 'Limão', ingredients: 'Capim-limão, Espuma artesanal', price: 10.00 },
  { name: 'Melancia', ingredients: 'Açucar de baunilha, Espuma artesanal, Capim-limão', price: 10.00 },
  { name: 'Abacaxi', ingredients: 'Açucar de baunilha, Hortelã', price: 10.00 },
  { name: 'Maracujá', ingredients: 'Açucar de pimenta vermelha, Manjericão', price: 10.00 },
];

export const classicDrinks = [
  { name: 'Mojito', ingredients: 'Rum, Limão, Hortelã, Água com gás', price: 15.00 },
  { name: 'Sex on the Beach', ingredients: 'Vodka, Suco de laranja, Syrup pêssego, Grenadine', price: 15.00 },
  { name: 'Lagoa Azul', ingredients: 'Vodka, Syrup Blue Curacau, Sprite', price: 15.00 },
  { name: 'Apple Martinni', ingredients: 'Vodka, Syrup maçã verde, Shweppes Citrus', price: 15.00 },
];

export const outros = [
  { name: 'Garçom', price: 170.00 },
  { name: 'Copeiro', price: 120.00 },
  { name: 'Fotografo', price: 350.00 },
];
