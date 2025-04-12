import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import SearchBar from "@/components/SearchBar";
import LiveMarketPrices from "@/components/LiveMarketPrices";
import { useAuth } from "@/hooks/use-auth";

export default function HeroSection() {
  const [_, navigate] = useLocation();
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };
  
  const handleSearchSelect = (item: string) => {
    // Navigate to the appropriate marketplace based on the search result
    if (item.toLowerCase().includes('seed')) {
      navigate('/seed-market');
    } else if (item.toLowerCase().includes('equipment') || item.toLowerCase().includes('tractor') || item.toLowerCase().includes('tools')) {
      navigate('/equipment-market');
    } else if (item.toLowerCase().includes('produce') || item.toLowerCase().includes('fruit') || item.toLowerCase().includes('vegetable')) {
      navigate('/produce-market');
    } else {
      // Default to seed market if we can't determine category
      navigate('/seed-market');
    }
  };

  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_50%_at_50%_50%,rgba(76,175,80,0.12)_0%,rgba(241,248,233,0)_100%)]"></div>
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Connecting Farmers & <span className="text-[#4CAF50]">Buyers</span>
          </h1>
          <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            AgroBuizz is revolutionizing agriculture with our marketplace platform that brings together farmers, merchants, and buyers. Access quality seeds, equipment, and fresh produce in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-[#FFEB3B] hover:bg-[#FDD835] text-[#33691E] font-medium py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white hover:bg-[#F1F8E9] text-[#4CAF50] font-medium py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 border border-[#8BC34A]"
              onClick={() => scrollToSection('features')}
            >
              Explore Products
            </Button>
          </div>
        </motion.div>

        <motion.div 
          className="mt-16 max-w-5xl mx-auto relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-6 bg-white">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Find Agricultural Products</h3>
              <SearchBar 
                placeholder="Search for seeds, equipment, or produce..." 
                onSelect={handleSearchSelect}
                className="w-full mb-6"
              />
              
              <div className="mt-8">
                <LiveMarketPrices 
                  title="Today's Market Highlights" 
                  description="Real-time prices from our marketplace"
                  limit={5}
                />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-3 -right-3 -left-3 h-20 bg-gradient-to-t from-gray-50 to-transparent z-10"></div>
        </motion.div>
      </div>
    </section>
  );
}
