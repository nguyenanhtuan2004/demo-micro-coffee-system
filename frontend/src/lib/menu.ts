import { MenuItem } from '@/types';

export const MENU_ITEMS: MenuItem[] = [
  { productId: 'espresso',   name: 'Espresso',        price: 3.5,  category: 'Coffee',  emoji: '☕' },
  { productId: 'cappuccino', name: 'Cappuccino',       price: 4.5,  category: 'Coffee',  emoji: '☕' },
  { productId: 'latte',      name: 'Latte',            price: 4.0,  category: 'Coffee',  emoji: '🥛' },
  { productId: 'americano',  name: 'Americano',        price: 3.0,  category: 'Coffee',  emoji: '☕' },
  { productId: 'mocha',      name: 'Mocha',            price: 5.0,  category: 'Coffee',  emoji: '🍫' },
  { productId: 'cold-brew',  name: 'Cold Brew',        price: 5.5,  category: 'Coffee',  emoji: '🧊' },
  { productId: 'croissant',  name: 'Croissant',        price: 3.0,  category: 'Food',    emoji: '🥐' },
  { productId: 'muffin',     name: 'Blueberry Muffin', price: 2.5,  category: 'Food',    emoji: '🫐' },
];
