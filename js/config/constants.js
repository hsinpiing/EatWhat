// ============================
// 🔑 请把你的 API Key 填在这里
// ============================
const MAPS_API_KEY = 'AIzaSyBL0L1wrPcqRteT7Q4zc35BNLhiki3zVEM';

const DISTANCE_RADIUS = {
  '400': 400,
  '1200': 1200,
  '5000': 5000,
  'default': 2000
};

const PRICE_MAP = {
  '1': { min: 0, max: 1 },
  '2': { min: 1, max: 2 },
  '3': { min: 2, max: 4 }
};

const FOOD_KEYWORDS = {
  chinese: 'Chinese restaurant',
  japanese: 'Japanese restaurant',
  korean: 'Korean restaurant',
  western: 'Western restaurant',
  southeast: 'Southeast Asian restaurant',
  international: 'international fusion restaurant',
  bbq: 'BBQ grill restaurant',
  hotpot: 'hot pot restaurant',
  vegetarian: 'vegetarian restaurant',
  brunch: 'brunch cafe',
  dessert: 'dessert cafe',
  cafe: 'cafe coffee',
  bubbletea: 'bubble tea',
  bar: 'bar',
  other: 'restaurant'
};

const DIETARY_KEYWORDS = {
  'halal': 'halal',
  'no-pork': 'no pork pork-free',
  'vegetarian': 'vegetarian',
  'vegan': 'vegan',
  'gluten-free': 'gluten free',
  'nut-free': 'nut free',
  'kid-friendly': 'family friendly kid friendly',
  'pet-friendly': 'pet friendly',
  'accessible': 'wheelchair accessible'
};

const OCCASION_KEYWORDS = {
  'coffee-chat': 'cafe coffee',
  'business': 'restaurant private dining',
  'friends': 'restaurant casual dining',
  'family': 'family restaurant',
  'date': 'romantic restaurant',
  'anniversary': 'fine dining restaurant'
};

const STORAGE_KEYS = {
  HISTORY: 'eatwhat_history',
  BLACKLIST: 'eatwhat_blacklist',
  SETTINGS: 'eatwhat_settings',
  FIRST_VISIT: 'eatwhat_firstVisit'
};

const CATEGORY_EMOJI = {
  chinese: '🥢', japanese: '🍱', korean: '🥩', western: '🍽️',
  southeast: '🍜', international: '🌍', bbq: '🔥', hotpot: '🫕',
  vegetarian: '🥗', brunch: '🥞', dessert: '🍰', cafe: '☕',
  bubbletea: '🧋', bar: '🍺', other: '🍴', restaurant: '🍽️'
};
