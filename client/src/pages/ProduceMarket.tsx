import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Leaf, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";

// Sample produce data (mock for now, would come from the API)
const produceProducts = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    description: "Organically grown, vine-ripened tomatoes with excellent flavor and nutritional value.",
    price: 15,
    category: "vegetable",
    farmSource: "Green Valley Farm",
    isOrganic: true,
    isSeasonal: true,
    image: "tomatoes.jpg"
  },
  {
    id: 2,
    name: "Premium Apples",
    description: "Crisp and sweet apples perfect for snacking or baking. Grown with sustainable farming practices.",
    price: 18,
    category: "fruit",
    farmSource: "Highland Orchards",
    isOrganic: false,
    isSeasonal: true,
    image: "apples.jpg"
  },
  {
    id: 3,
    name: "Fresh Spinach",
    description: "Nutrient-rich spinach leaves, ideal for salads, smoothies, or cooking. Harvested daily.",
    price: 12,
    category: "vegetable",
    farmSource: "Riverside Greens",
    isOrganic: true,
    isSeasonal: false,
    image: "spinach.jpg"
  },
  {
    id: 4,
    name: "Organic Blueberries",
    description: "Sweet and plump blueberries packed with antioxidants. Perfect for breakfast or desserts.",
    price: 25,
    category: "fruit",
    farmSource: "Berry Good Farms",
    isOrganic: true,
    isSeasonal: true,
    image: "blueberries.jpg"
  },
  {
    id: 5,
    name: "Farm-Fresh Carrots",
    description: "Sweet and crunchy carrots, freshly harvested and perfect for snacking or cooking.",
    price: 14,
    category: "vegetable",
    farmSource: "Root Harvest Co-op",
    isOrganic: false,
    isSeasonal: false,
    image: "carrots.jpg"
  },
  {
    id: 6,
    name: "Seasonal Strawberries",
    description: "Juicy and flavorful strawberries available during peak season. Locally grown with care.",
    price: 22,
    category: "fruit",
    farmSource: "Sunshine Berry Fields",
    isOrganic: false,
    isSeasonal: true,
    image: "strawberries.jpg"
  }
];

export default function ProduceMarket() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 30]);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [seasonalOnly, setSeasonalOnly] = useState(false);
  const [cart, setCart] = useState<Array<{id: number, quantity: number}>>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showRestrictedMessage, setShowRestrictedMessage] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  
  // Check if the user is authorized to purchase produce
  // All users can view produce, but only customers and farmers can purchase
  useEffect(() => {
    if (!isLoading && user) {
      // For produce market, customers and farmers can purchase
      setShowRestrictedMessage(user.userType !== 'customer' && user.userType !== 'farmer' && user.role !== 'admin');
    }
  }, [user, isLoading]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const filteredProducts = produceProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.farmSource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesOrganic = organicOnly ? product.isOrganic : true;
    const matchesSeasonal = seasonalOnly ? product.isSeasonal : true;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesOrganic && matchesSeasonal;
  });

  const addToCart = (productId: number) => {
    // Check if user has permission to purchase
    if (showRestrictedMessage) {
      toast({
        title: "Access Restricted",
        description: "Only customers and farmers can purchase produce. Please contact support if you need access.",
        variant: "destructive"
      });
      return;
    }
    
    setCart(prev => {
      const existingItem = prev.find(item => item.id === productId);
      if (existingItem) {
        return prev.map(item => 
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { id: productId, quantity: 1 }];
      }
    });

    toast({
      title: "Added to cart",
      description: "Fresh produce has been added to your cart",
    });
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#2E7D32]">Fresh Produce Market</h1>
        <Button variant="outline" className="relative">
          <ShoppingCart className="h-5 w-5 text-[#4CAF50]" />
          {getTotalCartItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#FFEB3B] text-[#33691E] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {getTotalCartItems()}
            </span>
          )}
        </Button>
      </div>
      
      {showRestrictedMessage && (
        <div className="bg-[#FFECB3] border border-[#FFC107] rounded-md p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-[#FF6F00]" />
          <div>
            <h3 className="font-medium text-[#FF6F00]">Viewing Mode Only</h3>
            <p className="text-sm text-[#FF8F00]">As a vendor, you can browse but not purchase produce. Contact support for more information.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for fruits, vegetables, or farms..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 border-[#8BC34A]/50 focus:border-[#4CAF50]"
            />
          </div>
        </div>
        <div>
          <Tabs defaultValue={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
            <TabsList className="w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="fruit">Fruits</TabsTrigger>
              <TabsTrigger value="vegetable">Vegetables</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border border-[#8BC34A]/30">
          <h3 className="font-semibold text-[#2E7D32] mb-4">Filter Options</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range (points)</h4>
              <div className="px-2">
                <Slider
                  defaultValue={[0, 30]}
                  max={30}
                  step={1}
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{priceRange[0]} points</span>
                  <span>{priceRange[1]} points</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Product Type</h4>
              <div className="flex items-center space-x-2">
                <Checkbox id="organic" checked={organicOnly} onCheckedChange={(checked) => setOrganicOnly(checked as boolean)} />
                <label htmlFor="organic" className="text-sm text-gray-700 cursor-pointer">Organic only</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="seasonal" checked={seasonalOnly} onCheckedChange={(checked) => setSeasonalOnly(checked as boolean)} />
                <label htmlFor="seasonal" className="text-sm text-gray-700 cursor-pointer">Seasonal only</label>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              className="w-full border-[#8BC34A] text-[#4CAF50]"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
                setPriceRange([0, 30]);
                setOrganicOnly(false);
                setSeasonalOnly(false);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="md:col-span-3">
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
                  <div className="aspect-video bg-[#E8F5E9] flex items-center justify-center relative">
                    <Leaf className="w-16 h-16 text-[#4CAF50]/30" />
                    {product.isOrganic && (
                      <Badge className="absolute top-2 left-2 bg-[#8BC34A]">Organic</Badge>
                    )}
                    {product.isSeasonal && (
                      <Badge className="absolute top-2 right-2 bg-[#FFEB3B] text-[#33691E]">Seasonal</Badge>
                    )}
                  </div>
                  <CardContent className="pt-6 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-[#2E7D32]">{product.name}</h3>
                      <Badge className="bg-[#4CAF50]">{product.category}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{product.description.substring(0, 80)}...</p>
                    <p className="text-[#558B2F] text-sm mb-4">From: {product.farmSource}</p>
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
                              <div className="flex gap-2 mt-2">
                                <Badge className="bg-[#4CAF50]">{selectedProduct?.category}</Badge>
                                {selectedProduct?.isOrganic && (
                                  <Badge className="bg-[#8BC34A]">Organic</Badge>
                                )}
                                {selectedProduct?.isSeasonal && (
                                  <Badge className="bg-[#FFEB3B] text-[#33691E]">Seasonal</Badge>
                                )}
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="aspect-video bg-[#E8F5E9] flex items-center justify-center">
                              <Leaf className="w-24 h-24 text-[#4CAF50]/30" />
                            </div>
                            <p className="text-gray-700">{selectedProduct?.description}</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Price</p>
                                <p className="font-bold text-[#33691E]">{selectedProduct?.price} points</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Source</p>
                                <p className="font-medium text-[#558B2F]">{selectedProduct?.farmSource}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              className={`font-bold ${showRestrictedMessage 
                                ? "bg-gray-300 hover:bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "bg-[#FFEB3B] hover:bg-[#FDD835] text-[#33691E]"}`}
                              onClick={() => selectedProduct && addToCart(selectedProduct.id)}
                              disabled={showRestrictedMessage}
                            >
                              {showRestrictedMessage ? "Viewing Only" : "Add to Cart"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      className={`w-full ${showRestrictedMessage 
                        ? "bg-gray-300 hover:bg-gray-300 text-gray-600 cursor-not-allowed" 
                        : "bg-[#4CAF50] hover:bg-[#43A047] text-white"}`}
                      onClick={() => addToCart(product.id)}
                      disabled={showRestrictedMessage}
                    >
                      {showRestrictedMessage ? "Viewing Only" : "Add to Cart"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-[#8BC34A]/30">
              <p className="text-gray-500 text-lg">No produce found matching your search criteria.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setPriceRange([0, 30]);
                  setOrganicOnly(false);
                  setSeasonalOnly(false);
                }}
                className="text-[#4CAF50] mt-2"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}