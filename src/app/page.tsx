import type { Metadata } from "next";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import TodaysDeals from "@/components/home/TodaysDeals";
import PopularProducts from "@/components/home/PopularProducts";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import OffersBanner from "@/components/home/OffersBanner";
import CustomerReviews from "@/components/home/CustomerReviews";
import Newsletter from "@/components/home/Newsletter";

export const metadata: Metadata = {
  title: "GroceryMart — Fresh Groceries Delivered in 30 Minutes",
  description:
    "Shop fresh groceries, Vijaya milk products, snacks, and cool drinks. Free door delivery on orders above ₹500. Best prices, fastest delivery.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 space-y-2 pb-10">
      <HeroBanner />
      <CategoryGrid />
      <TodaysDeals />
      <PopularProducts />
      <FeaturedProducts />
      <OffersBanner />
      <CustomerReviews />
      <Newsletter />
    </div>
  );
}
