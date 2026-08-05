export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  description: string;
  inStock: boolean;
  badge?: string;
  unit: string;
  weight: string;
  specifications: Record<string, string>;
  isFeatured?: boolean;
  isPopular?: boolean;
  isDeal?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Organic Basmati Rice",
    brand: "India Gate",
    category: "Groceries",
    categorySlug: "groceries",
    price: 189,
    originalPrice: 249,
    discount: 24,
    rating: 4.5,
    reviewCount: 1240,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
      "https://images.unsplash.com/photo-1563291074-2bf8677ac0e3?w=600&q=80",
    ],
    description: "Premium organic basmati rice sourced from the foothills of the Himalayas. Long-grain, aromatic, and perfect for biryanis, pulao, and everyday meals.",
    inStock: true,
    badge: "Bestseller",
    unit: "kg",
    weight: "5 kg",
    specifications: { "Type": "Basmati", "Grain Length": "Extra Long", "Origin": "India", "Organic": "Yes", "Shelf Life": "12 months" },
    isFeatured: true,
    isPopular: true,
    isDeal: true,
  },
  {
    id: "2",
    name: "Vijaya Full Cream Milk",
    brand: "Vijaya",
    category: "Vijaya Milk Products",
    categorySlug: "vijaya-milk-products",
    price: 64,
    originalPrice: 68,
    discount: 6,
    rating: 4.7,
    reviewCount: 3200,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80",
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80",
    ],
    description: "Fresh, pure full cream milk from Vijaya dairy. Rich in calcium, protein, and essential nutrients. Pasteurized and packed under hygienic conditions.",
    inStock: true,
    badge: "Fresh",
    unit: "L",
    weight: "1 L",
    specifications: { "Fat Content": "6%", "Type": "Full Cream", "Pasteurized": "Yes", "Shelf Life": "2 days", "Source": "Andhra Pradesh" },
    isPopular: true,
    isDeal: false,
  },
  {
    id: "3",
    name: "Lays Classic Salted Chips",
    brand: "Lays",
    category: "Snacks",
    categorySlug: "snacks",
    price: 20,
    originalPrice: 25,
    discount: 20,
    rating: 4.3,
    reviewCount: 5600,
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&q=80",
    ],
    description: "America's favorite potato chips, now in the classic salted flavor. Crispy, light, and irresistibly delicious.",
    inStock: true,
    badge: "Popular",
    unit: "pack",
    weight: "50 g",
    specifications: { "Flavor": "Classic Salted", "Net Weight": "50g", "Type": "Potato Chips", "Veg": "Yes" },
    isPopular: true,
    isDeal: true,
  },
  {
    id: "4",
    name: "Coca-Cola 2L Bottle",
    brand: "Coca-Cola",
    category: "Cool Drinks",
    categorySlug: "cool-drinks",
    price: 99,
    originalPrice: 120,
    discount: 18,
    rating: 4.6,
    reviewCount: 8900,
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80",
    ],
    description: "The classic Coca-Cola taste in a 2L family-size bottle. Perfect for parties, gatherings, or simply quenching your thirst.",
    inStock: true,
    badge: "Deal",
    unit: "bottle",
    weight: "2 L",
    specifications: { "Volume": "2 L", "Type": "Carbonated Soft Drink", "Flavor": "Cola", "Sugar": "Yes" },
    isPopular: true,
    isDeal: true,
  },
  {
    id: "5",
    name: "Toor Dal Premium",
    brand: "Fortune",
    category: "Groceries",
    categorySlug: "groceries",
    price: 145,
    originalPrice: 175,
    discount: 17,
    rating: 4.4,
    reviewCount: 980,
    image: "https://images.unsplash.com/photo-1585996982895-0c6a6d20e0bc?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1585996982895-0c6a6d20e0bc?w=600&q=80",
    ],
    description: "Premium quality toor dal (pigeon peas), machine-cleaned and polished. Ideal for sambar, dal tadka, and everyday cooking.",
    inStock: true,
    unit: "kg",
    weight: "1 kg",
    specifications: { "Type": "Toor/Arhar Dal", "Processing": "Machine Cleaned", "Origin": "India", "Shelf Life": "6 months" },
    isFeatured: true,
    isDeal: true,
  },
  {
    id: "6",
    name: "Vijaya Butter Salted",
    brand: "Vijaya",
    category: "Vijaya Milk Products",
    categorySlug: "vijaya-milk-products",
    price: 52,
    originalPrice: 58,
    discount: 10,
    rating: 4.5,
    reviewCount: 2100,
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80",
    ],
    description: "Rich, creamy salted butter from Vijaya dairy. Made from fresh pasteurized cream, perfect for spreading on bread or cooking.",
    inStock: true,
    unit: "pack",
    weight: "100 g",
    specifications: { "Fat Content": "80%", "Type": "Salted Butter", "Pasteurized": "Yes", "Shelf Life": "30 days" },
    isFeatured: true,
    isPopular: true,
  },
  {
    id: "7",
    name: "Kurkure Masala Munch",
    brand: "Kurkure",
    category: "Snacks",
    categorySlug: "snacks",
    price: 20,
    originalPrice: 20,
    discount: 0,
    rating: 4.2,
    reviewCount: 4200,
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&q=80",
    ],
    description: "India's most loved masala snack! Crunchy, spicy and full of chatpata flavors. Made with real spices and corn.",
    inStock: true,
    unit: "pack",
    weight: "90 g",
    specifications: { "Flavor": "Masala Munch", "Net Weight": "90g", "Veg": "Yes" },
    isPopular: true,
  },
  {
    id: "8",
    name: "Sprite 750ml",
    brand: "Sprite",
    category: "Cool Drinks",
    categorySlug: "cool-drinks",
    price: 40,
    originalPrice: 45,
    discount: 11,
    rating: 4.4,
    reviewCount: 3600,
    image: "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=600&q=80",
    ],
    description: "Crisp, refreshing lemon-lime soda. Sprite's clean, cool taste is perfect for any occasion.",
    inStock: true,
    unit: "bottle",
    weight: "750 ml",
    specifications: { "Volume": "750 ml", "Flavor": "Lemon-Lime", "Type": "Carbonated" },
    isDeal: true,
  },
  {
    id: "9",
    name: "Aashirvaad Whole Wheat Atta",
    brand: "Aashirvaad",
    category: "Groceries",
    categorySlug: "groceries",
    price: 268,
    originalPrice: 310,
    discount: 14,
    rating: 4.6,
    reviewCount: 7800,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    ],
    description: "Aashirvaad Superior MP Whole Wheat Atta made from the finest quality wheat. Rich in fiber and nutrients for healthier rotis.",
    inStock: true,
    badge: "Bestseller",
    unit: "kg",
    weight: "5 kg",
    specifications: { "Type": "Whole Wheat", "Net Weight": "5kg", "Fiber": "High" },
    isPopular: true,
    isFeatured: true,
  },
  {
    id: "10",
    name: "Vijaya Paneer Fresh",
    brand: "Vijaya",
    category: "Vijaya Milk Products",
    categorySlug: "vijaya-milk-products",
    price: 88,
    originalPrice: 100,
    discount: 12,
    rating: 4.5,
    reviewCount: 1500,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80",
    ],
    description: "Fresh, soft paneer made from pure cow milk. Packed fresh daily. Perfect for curries, kebabs, and salads.",
    inStock: true,
    unit: "pack",
    weight: "200 g",
    specifications: { "Type": "Fresh Paneer", "Fat": "25%", "Shelf Life": "3 days" },
    isPopular: true,
    isDeal: true,
  },
  {
    id: "11",
    name: "Haldiram's Aloo Bhujia",
    brand: "Haldiram's",
    category: "Snacks",
    categorySlug: "snacks",
    price: 80,
    originalPrice: 95,
    discount: 16,
    rating: 4.5,
    reviewCount: 3400,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    ],
    description: "Crispy, spicy aloo bhujia namkeen from Haldiram's. A perfect tea-time snack loved across India.",
    inStock: true,
    unit: "pack",
    weight: "200 g",
    specifications: { "Type": "Namkeen", "Veg": "Yes", "Net Weight": "200g" },
    isFeatured: true,
    isDeal: true,
  },
  {
    id: "12",
    name: "Tropicana Orange Juice",
    brand: "Tropicana",
    category: "Cool Drinks",
    categorySlug: "cool-drinks",
    price: 99,
    originalPrice: 120,
    discount: 18,
    rating: 4.3,
    reviewCount: 2100,
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80",
    ],
    description: "100% pure orange juice, no added sugar or preservatives. Rich in Vitamin C and antioxidants.",
    inStock: true,
    badge: "No Added Sugar",
    unit: "pack",
    weight: "1 L",
    specifications: { "Type": "Fruit Juice", "Volume": "1L", "Sugar": "No Added Sugar" },
    isFeatured: true,
  },
];

export const getProductsByCategory = (slug: string) =>
  products.filter((p) => p.categorySlug === slug);

export const getProductById = (id: string) =>
  products.find((p) => p.id === id);

export const getFeaturedProducts = () =>
  products.filter((p) => p.isFeatured);

export const getPopularProducts = () =>
  products.filter((p) => p.isPopular);

export const getDealProducts = () =>
  products.filter((p) => p.isDeal);

export const getRelatedProducts = (id: string, categorySlug: string) =>
  products.filter((p) => p.categorySlug === categorySlug && p.id !== id).slice(0, 4);
