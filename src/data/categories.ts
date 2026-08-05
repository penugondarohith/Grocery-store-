export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  color: string;
  icon: string;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Groceries",
    slug: "groceries",
    description: "Staples, pulses, oils, and everyday essentials",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
    productCount: 320,
    color: "from-green-400 to-green-600",
    icon: "🛒",
  },
  {
    id: "2",
    name: "Vijaya Milk Products",
    slug: "vijaya-milk-products",
    description: "Fresh milk, butter, paneer, curd, and more",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80",
    productCount: 48,
    color: "from-blue-400 to-blue-600",
    icon: "🥛",
  },
  {
    id: "3",
    name: "Snacks",
    slug: "snacks",
    description: "Chips, namkeen, biscuits, and munchies",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80",
    productCount: 156,
    color: "from-yellow-400 to-orange-500",
    icon: "🍟",
  },
  {
    id: "4",
    name: "Cool Drinks",
    slug: "cool-drinks",
    description: "Soft drinks, juices, energy drinks, and water",
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80",
    productCount: 89,
    color: "from-cyan-400 to-blue-500",
    icon: "🥤",
  },
  {
    id: "5",
    name: "Fruits & Vegetables",
    slug: "fruits-vegetables",
    description: "Fresh farm produce delivered daily",
    image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&q=80",
    productCount: 210,
    color: "from-lime-400 to-green-500",
    icon: "🥦",
  },
  {
    id: "6",
    name: "Personal Care",
    slug: "personal-care",
    description: "Soaps, shampoos, skincare, and hygiene",
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=80",
    productCount: 175,
    color: "from-pink-400 to-rose-500",
    icon: "🧴",
  },
];

export const getCategoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
