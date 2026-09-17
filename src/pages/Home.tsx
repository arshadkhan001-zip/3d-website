import Hero from "../components/hero/Hero";
import WhyCovers from "../components/sections/WhyCovers";
import FeaturedCovers from "../components/products/FeaturedCovers";
import ProductSection from "../components/products/ProductSection";
import FeaturedProduct from "../components/products/FeaturedProduct";
import {
  CollectionsStrip,
  NewArrivals,
  NewsletterSection,
  Reviews,
  ShopByDevice,
  UgcGallery,
} from "../components/sections/HomeSections";
import { useDocumentTitle } from "../lib/seo";

/** Cinematic home: film → story → commerce → community. */
export default function Home() {
  useDocumentTitle("Precision phone covers & accessories", "Cases and accessories engineered to make your phone feel unmistakably yours.");
  return (
    <>
      <Hero />
      <CollectionsStrip />
      <WhyCovers />
      <FeaturedCovers />
      <ProductSection />
      <FeaturedProduct />
      <NewArrivals />
      <ShopByDevice />
      <Reviews />
      <UgcGallery />
      <NewsletterSection />
    </>
  );
}
