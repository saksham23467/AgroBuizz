import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ShoppingCart, Tractor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Sample equipment data (mock for now, would come from the API)
const equipmentProducts = [
  {
    id: 1,
    name: "Compact Tractor",
    description: "Small and versatile tractor ideal for small to medium-sized farms. Perfect for a variety of tasks including planting, tilling, and light hauling.",
    price: 2000,
    category: "tractor",
    availability: "purchase",
    stock: 5,
    image: "compact-tractor.jpg"
  },
  {
    id: 2,
    name: "Rotary Tiller",
    description: "Professional-grade tiller for soil preparation. Efficiently breaks up and aerates soil for improved crop growth and management.",
    price: 800,
    category: "tools",
    availability: "purchase",
    stock: 12,
    image: "rotary-tiller.jpg"
  },
  {
    id: 3,
    name: "Industrial Tractor",
    description: "Heavy-duty tractor for large farms and agricultural operations. Provides excellent power and efficiency for demanding farming tasks.",
    price: 500,
    category: "tractor",
    availability: "rental",
    rentalPeriod: "monthly",
    stock: 3,
    image: "industrial-tractor.jpg"
  },
  {
    id: 4,
    name: "Irrigation System",
    description: "Complete drip irrigation system for efficient water management. Helps conserve water while ensuring consistent delivery to crops.",
    price: 1200,
    category: "irrigation",
    availability: "purchase",
    stock: 8,
    image: "irrigation-system.jpg"
  },
  {
    id: 5,
    name: "Harvester",
    description: "Modern harvesting machine for efficient crop collection. Significantly reduces labor costs and increases harvest speed.",
    price: 600,
    category: "harvesting",
    availability: "rental",
    rentalPeriod: "weekly",
    stock: 4,
    image: "harvester.jpg"
  },
  {
    id: 6,
    name: "Sprayer System",
    description: "Precision sprayer for fertilizers and pest control solutions. Ensures even coverage and reduces chemical waste.",
    price: 950,
    category: "tools",
    availability: "purchase",
    stock: 10,
    image: "sprayer.jpg"
  }
];

export default function EquipmentMarket() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [cart, setCart] = useState<Array<{id: number, quantity: number}>>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const filteredProducts = equipmentProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesAvailability = availabilityFilter === "all" ? true : 
                               product.availability === availabilityFilter;
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const addToCart = (productId: number) => {
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
      description: "Equipment has been added to your cart",
    });
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const categories = [
    { id: "tractor", label: "Tractors" },
    { id: "tools", label: "Farm Tools" },
    { id: "irrigation", label: "Irrigation" },
    { id: "harvesting", label: "Harvesting" }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#2E7D32]">Equipment Marketplace</h1>
        <Button variant="outline" className="relative">
          <ShoppingCart className="h-5 w-5 text-[#4CAF50]" />
          {getTotalCartItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#FFEB3B] text-[#33691E] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {getTotalCartItems()}
            </span>
          )}
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row gap-6 mb-8">
        <div className="md:w-1/3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for equipment..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 border-[#8BC34A]/50 focus:border-[#4CAF50]"
          />
        </div>
        <div className="md:w-1/3">
          <Tabs defaultValue="all" onValueChange={setAvailabilityFilter}>
            <TabsList className="w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
              <TabsTrigger value="rental">Rental</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="md:w-1/3 flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-5 w-5 text-[#4CAF50] flex-shrink-0" />
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className={selectedCategory === category.id 
                ? "bg-[#4CAF50] hover:bg-[#43A047] whitespace-nowrap"
                : "border-[#8BC34A]/50 text-[#4CAF50] whitespace-nowrap"}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.label}
            </Button>
          ))}
          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="text-[#4CAF50] whitespace-nowrap"
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
                <Tractor className="w-16 h-16 text-[#4CAF50]/30" />
              </div>
              <CardContent className="pt-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-[#2E7D32]">{product.name}</h3>
                  <Badge className={product.availability === "rental" 
                    ? "bg-[#8BC34A]" 
                    : "bg-[#4CAF50]"}>
                    {product.availability === "rental" ? "Rental" : "Purchase"}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-4">{product.description.substring(0, 80)}...</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#33691E]">
                      {product.price} points
                      {product.availability === "rental" && 
                        <span className="font-normal text-sm text-gray-600"> / {product.rentalPeriod}</span>
                      }
                    </p>
                  </div>
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
                            <Badge className={selectedProduct?.availability === "rental" 
                              ? "bg-[#8BC34A]" 
                              : "bg-[#4CAF50]"}>
                              {selectedProduct?.availability === "rental" ? "Rental" : "Purchase"}
                            </Badge>
                            <Badge className="bg-[#E8F5E9] text-[#2E7D32]">
                              {selectedProduct?.category}
                            </Badge>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="aspect-video bg-[#E8F5E9] flex items-center justify-center">
                          <Tractor className="w-24 h-24 text-[#4CAF50]/30" />
                        </div>
                        <p className="text-gray-700">{selectedProduct?.description}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Price</p>
                            <p className="font-bold text-[#33691E]">
                              {selectedProduct?.price} points
                              {selectedProduct?.availability === "rental" && 
                                <span className="font-normal text-sm text-gray-600"> / {selectedProduct?.rentalPeriod}</span>
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Available Units</p>
                            <p className="font-bold text-[#33691E]">{selectedProduct?.stock} units</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          className="bg-[#FFEB3B] hover:bg-[#FDD835] text-[#33691E] font-bold"
                          onClick={() => selectedProduct && addToCart(selectedProduct.id)}
                        >
                          {selectedProduct?.availability === "rental" ? "Rent Now" : "Add to Cart"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  className="w-full bg-[#4CAF50] hover:bg-[#43A047] text-white"
                  onClick={() => addToCart(product.id)}
                >
                  {product.availability === "rental" ? "Rent Now" : "Add to Cart"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No equipment found matching your search criteria.</p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory(null);
              setAvailabilityFilter("all");
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