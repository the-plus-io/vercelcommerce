import SolarPlanningForm from "@/components/SolarPlanningForm";
import Footer from 'components/layout/footer';

export const metadata = {
  description: 'High-performance ecommerce store built with Next.js, Vercel, and Shopify.',
  openGraph: {
    type: 'website'
  }
};

export default function HomePage() {
  return (
    <>
      <div className="flex justify-center items-center my-8">
        <SolarPlanningForm />
      </div>
      <Footer />
    </>
  );
}
