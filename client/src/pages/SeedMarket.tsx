import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ShoppingCart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";

// Sample seed data (mock for now, would come from the API)
const seedProducts = [
  {
    id: 1,
    name: "Organic Tomato Seeds",
    description: "High yield, disease-resistant tomato seeds perfect for small to medium-sized farms.",
    price: 25,
    category: "vegetable",
    stock: 150,
    image: "tomato-seeds.jpg"
  },
  {
    id: 2,
    name: "Premium Corn Seeds",
    description: "Drought-resistant corn seeds that provide excellent harvest in various climate conditions.",
    price: 30,
    category: "grain",
    stock: 200,
    image: "corn-seeds.jpg"
  },
  {
    id: 3,
    name: "Organic Lettuce Seeds",
    description: "Fast-growing lettuce seeds that are perfect for successive planting throughout the season.",
    price: 15,
    category: "vegetable",
    stock: 100,
    image: "lettuce-seeds.jpg"
  },
  {
    id: 4,
    name: "Premium Rice Seeds",
    description: "High-yielding rice variety suitable for both irrigated and rainfed conditions.",
    price: 35,
    category: "grain",
    stock: 250,
    image: "rice-seeds.jpg"
  },
  {
    id: 5,
    name: "Organic Carrot Seeds",
    description: "Sweet, crunchy carrots that are perfect for market gardeners.",
    price: 18,
    category: "vegetable",
    stock: 120,
    image: "carrot-seeds.jpg"
  },
  {
    id: 6,
    name: "Wheat Seeds",
    description: "Premium wheat seeds with excellent disease resistance and high yield potential.",
    price: 28,
    category: "grain",
    stock: 180,
    image: "wheat-seeds.jpg"
  }
];

export default function SeedMarket() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addToCart, getTotalItems } = useCart();
  const { user, isLoading } = useAuth();
  
  // Check if the user is authorized to access this market
  // Farmers can buy seeds, vendors can sell seeds, admins have full access
  useEffect(() => {
    if (!isLoading && user) {
      // Allow farmers, vendors and admins to access the seed market
      if (user.userType !== 'farmer' && user.userType !== 'vendor' && user.role !== 'admin') {
        toast({
          title: "Access Restricted",
          description: "Only farmers and vendors can access the seed market. Please contact support if you need access.",
          variant: "destructive"
        });
        setLocation("/");
      }
    }
  }, [user, isLoading, toast, setLocation]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const filteredProducts = seedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Helper to add product to cart with all details
  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      quantity: 1,
      name: product.name,
      price: product.price,
      imageUrl: product.image
    });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#2E7D32]">Seed Marketplace</h1>
        <Link href="/checkout">
          <Button variant="outline" className="relative">
            <ShoppingCart className="h-5 w-5 text-[#4CAF50]" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FFEB3B] text-[#33691E] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {getTotalItems()}
              </span>
            )}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-2/3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for seeds..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 border-[#8BC34A]/50 focus:border-[#4CAF50]"
          />
        </div>
        <div className="md:w-1/3 flex gap-2">
          <Button
            variant={selectedCategory === "vegetable" ? "default" : "outline"}
            className={selectedCategory === "vegetable" ? "bg-[#4CAF50] hover:bg-[#43A047]" : "border-[#8BC34A]/50 text-[#4CAF50]"}
            onClick={() => handleCategoryClick("vegetable")}
          >
            Vegetables
          </Button>
          <Button
            variant={selectedCategory === "grain" ? "default" : "outline"}
            className={selectedCategory === "grain" ? "bg-[#4CAF50] hover:bg-[#43A047]" : "border-[#8BC34A]/50 text-[#4CAF50]"}
            onClick={() => handleCategoryClick("grain")}
          >
            Grains
          </Button>
          {selectedCategory && (
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
              className="text-[#4CAF50]"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {filteredProducts.map(product => (
          <motion.div key={product.id} variants={fadeInUp}>
            <Card className="h-full flex flex-col border-[#8BC34A]/30 hover:border-[#8BC34A] transition-all duration-300 hover:shadow-md">
              <div className="aspect-video bg-[#E8F5E9] flex items-center justify-center">
                <p className="text-[#33691E]">Seed Image</p>
              </div>
              <CardContent className="pt-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-[#2E7D32]">{product.name}</h3>
                  <Badge className="bg-[#4CAF50]">{product.category}</Badge>
                </div>
                <p className="text-gray-600 text-sm mb-4">{product.description.substring(0, 80)}...</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-[#33691E]">{product.price} points</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="link" 
                        className="text-[#4CAF50] p-0" 
                        onClick={() => setSelectedProduct(product)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-[#2E7D32]">{selectedProduct?.name}</DialogTitle>
                        <DialogDescription>
                          <Badge className="bg-[#4CAF50] mt-2">{selectedProduct?.category}</Badge>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="aspect-video bg-[#E8F5E9] flex items-center justify-center">
                          <p className="text-[#33691E]">Seed Image</p>
                        </div>
                        <p className="text-gray-700">{selectedProduct?.description}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Price</p>
                            <p className="font-bold text-[#33691E]">{selectedProduct?.price} points</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Available Stock</p>
                            <p className="font-bold text-[#33691E]">{selectedProduct?.stock} units</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          className="bg-[#FFEB3B] hover:bg-[#FDD835] text-[#33691E] font-bold"
                          onClick={() => selectedProduct && handleAddToCart(selectedProduct)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  className="w-full bg-[#4CAF50] hover:bg-[#43A047] text-white"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No seeds found matching your search criteria.</p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory(null);
            }}
            className="text-[#4CAF50] mt-2"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}