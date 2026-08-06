export interface Review {
  id: string;
  productId: string;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export const reviews: Review[] = [
  {
    id: "r1",
    productId: "1",
    userName: "Priya Sharma",
    avatar: "PS",
    rating: 5,
    comment: "Excellent quality basmati rice! The grains are long, fragrant, and cook perfectly every time. Great value for money.",
    date: "2024-07-15",
    helpful: 24,
    verified: true,
  },
  {
    id: "r2",
    productId: "1",
    userName: "Rajesh Kumar",
    avatar: "RK",
    rating: 4,
    comment: "Good quality rice. Biryani came out really well. Packaging could be better but product is good.",
    date: "2024-06-20",
    helpful: 12,
    verified: true,
  },
  {
    id: "r3",
    productId: "2",
    userName: "Anitha Reddy",
    avatar: "AR",
    rating: 5,
    comment: "Vijaya milk is always fresh and creamy. Have been buying for years. Never disappoints!",
    date: "2024-07-10",
    helpful: 8,
    verified: true,
  },
  {
    id: "r4",
    productId: "3",
    userName: "Suresh Babu",
    avatar: "SB",
    rating: 4,
    comment: "Great taste as always. The classic salted flavor is my favorite. Would love bigger pack sizes.",
    date: "2024-07-01",
    helpful: 5,
    verified: false,
  },
];

export interface CustomerTestimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
  orderCount: number;
}

export const testimonials: CustomerTestimonial[] = [
  {
    id: "t1",
    name: "Lakshmi Devi",
    location: "Penamaluru",
    avatar: "LD",
    rating: 5,
    comment: "Vijaya Lakshmi General Stores has completely changed how I shop for groceries. Lightning fast delivery, fresh products, and amazing prices. I order twice a week!",
    orderCount: 87,
  },
  {
    id: "t2",
    name: "Venkat Rao",
    location: "Vijayawada",
    avatar: "VR",
    rating: 5,
    comment: "The Vijaya milk products section is incredible. Fresh paneer, butter, and curd — all delivered to my door in under an hour!",
    orderCount: 134,
  },
  {
    id: "t3",
    name: "Deepa Krishnan",
    location: "Guntur",
    avatar: "DK",
    rating: 5,
    comment: "Love the deals section! I saved over ₹2000 last month alone. The app is so easy to use and delivery is always on time.",
    orderCount: 56,
  },
  {
    id: "t4",
    name: "Mohammed Farhan",
    location: "Vizag",
    avatar: "MF",
    rating: 4,
    comment: "Best grocery app in Andhra Pradesh! Wide variety, competitive prices, and top-notch customer service. Highly recommended!",
    orderCount: 42,
  },
];

export const getReviewsByProduct = (productId: string) =>
  reviews.filter((r) => r.productId === productId);
