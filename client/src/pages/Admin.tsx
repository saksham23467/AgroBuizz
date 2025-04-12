import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  BarChart4, Users, ShoppingBag, BoxesIcon, LayoutDashboard, 
  LogOut, Search, PlusCircle, Edit, Trash2, RefreshCw,
  ClipboardList, Package2Icon, TrendingUp, AlertTriangle,
  CheckCircle2, Eye, MoreVertical, Truck, XCircle
} from "lucide-react";
import InventoryManagement from "./InventoryManagement";
import Analytics from "./Analytics";

// Mock data for products
const seedProducts = [
  { id: 1, name: "Organic Tomato Seeds", category: "vegetable", price: 25, stock: 150, description: "High yield, disease-resistant tomato seeds perfect for small to medium-sized farms." },
  { id: 2, name: "Premium Corn Seeds", category: "grain", price: 30, stock: 200, description: "Drought-resistant corn seeds that provide excellent harvest in various climate conditions." },
  { id: 3, name: "Organic Lettuce Seeds", category: "vegetable", price: 15, stock: 100, description: "Fast-growing lettuce seeds that are perfect for successive planting throughout the season." },
  { id: 4, name: "Premium Rice Seeds", category: "grain", price: 35, stock: 250, description: "High-yielding rice variety suitable for both irrigated and rainfed conditions." },
  { id: 5, name: "Organic Carrot Seeds", category: "vegetable", price: 18, stock: 120, description: "Sweet, crunchy carrots that are perfect for market gardeners." },
  { id: 6, name: "Wheat Seeds", category: "grain", price: 28, stock: 180, description: "Premium wheat seeds with excellent disease resistance and high yield potential." },
];

const equipmentProducts = [
  { id: 1, name: "Basic Tractor", category: "machinery", price: 2500, stock: 10, description: "Efficient small-scale tractor suitable for most farming operations." },
  { id: 2, name: "Irrigation System", category: "irrigation", price: 450, stock: 30, description: "Water-efficient drip irrigation system for optimal crop watering." },
  { id: 3, name: "Harvester", category: "machinery", price: 1800, stock: 8, description: "Multi-crop harvester that saves time and labor costs." },
];

const produceProducts = [
  { id: 1, name: "Fresh Tomatoes", category: "vegetable", price: 5, stock: 500, description: "Organically grown tomatoes, harvested at peak ripeness." },
  { id: 2, name: "Premium Corn", category: "grain", price: 3, stock: 800, description: "Sweet corn grown using sustainable farming practices." },
  { id: 3, name: "Organic Lettuce", category: "vegetable", price: 4, stock: 350, description: "Crisp, fresh lettuce perfect for salads and sandwiches." },
];

// Mock user data
const users = [
  { id: 1, username: "john_farmer", email: "john@example.com", role: "user", userType: "farmer", createdAt: "2023-05-10", lastLogin: "2023-09-15" },
  { id: 2, username: "sara_vendor", email: "sara@example.com", role: "user", userType: "vendor", createdAt: "2023-06-20", lastLogin: "2023-09-14" },
  { id: 3, username: "mike_customer", email: "mike@example.com", role: "user", userType: "customer", createdAt: "2023-07-15", lastLogin: "2023-09-10" },
  { id: 4, username: "admin", email: "admin@agrobuizz.com", role: "admin", userType: "admin", createdAt: "2023-01-01", lastLogin: "2023-09-15" },
];

// Product categories
const productCategories = {
  seeds: ["vegetable", "grain", "fruit", "herb"],
  equipment: ["machinery", "irrigation", "tools", "storage"],
  produce: ["vegetable", "fruit", "grain", "dairy"],
};

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeProductTab, setActiveProductTab] = useState("seeds");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    description: "",
  });
  
  // Database query state
  const [sqlQuery, setSqlQuery] = useState("");
  const [selectedPredefinedQuery, setSelectedPredefinedQuery] = useState("");
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [queryColumns, setQueryColumns] = useState<string[]>([]);
  const [queryHistory, setQueryHistory] = useState<{query: string, timestamp: Date, status: 'success'|'error'}[]>([]);

  // Force navigation away if not admin
  useEffect(() => {
    // If user is not logged in or is not an admin, redirect to login page
    if (!user) {
      navigate("/admin-login");
      toast({
        title: "Access Denied",
        description: "Please log in with an admin account to access this page.",
        variant: "destructive",
      });
    } else if (user.role !== "admin") {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
    }
  }, [user, navigate, toast]);
  
  // Make sure the tab navigation works properly
  useEffect(() => {
    // This ensures the tabs content is properly synced with state
    if (activeTab) {
      const tabElement = document.querySelector(`[value="${activeTab}"]`);
      if (tabElement) {
        // Ensure the TabsContent with this value is displayed
        const tabsContent = document.querySelector(`[data-state="active"][data-orientation="horizontal"]`);
        if (!tabsContent) {
          // Force a reset of active tab if there's an issue
          setActiveTab(activeTab);
        }
      }
    }
  }, [activeTab]);

  const handleSignOut = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate("/admin-login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getFilteredProducts = () => {
    let products: any[] = [];
    
    switch (activeProductTab) {
      case "seeds":
        products = seedProducts;
        break;
      case "equipment":
        products = equipmentProducts;
        break;
      case "produce":
        products = produceProducts;
        break;
      default:
        products = [...seedProducts, ...equipmentProducts, ...produceProducts];
    }
    
    if (!searchQuery) return products;
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredUsers = () => {
    if (!searchQuery) return users;
    
    return users.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleAddProduct = () => {
    // In a real application, this would be an API call
    toast({
      title: "Product added",
      description: `${newProduct.name} has been added to the ${activeProductTab} catalog.`,
    });
    
    setIsAddProductDialogOpen(false);
    setNewProduct({
      name: "",
      category: "",
      price: 0,
      stock: 0,
      description: "",
    });
  };
  
  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    // In a real app, this would populate a form for editing
    toast({
      title: "Edit mode",
      description: `Now editing ${product.name}.`,
    });
  };
  
  const handleDeleteProduct = (product: any) => {
    setSelectedProduct(product);
    setIsConfirmDeleteOpen(true);
  };
  
  const confirmDeleteProduct = () => {
    // In a real application, this would be an API call
    toast({
      title: "Product deleted",
      description: `${selectedProduct.name} has been removed from the catalog.`,
    });
    
    setIsConfirmDeleteOpen(false);
    setSelectedProduct(null);
  };
  
  // SQL Query Execution
  const executeQueryMutation = useMutation({
    mutationFn: async (queryToExecute: string) => {
      const res = await apiRequest("POST", "/api/admin/execute-query", { 
        sql: queryToExecute 
      });
      return await res.json();
    },
    onSuccess: (data) => {
      // Assuming data has rows and columns properties
      setQueryResults(data.rows || []);
      setQueryColumns(data.columns || []);
      setQueryHistory(prev => [
        { 
          query: sqlQuery, 
          timestamp: new Date(), 
          status: 'success' 
        }, 
        ...prev.slice(0, 4)
      ]);
      toast({
        title: "Query executed successfully",
        description: `Found ${data.rows?.length || 0} results.`,
      });
    },
    onError: (error: Error) => {
      setQueryHistory(prev => [
        { 
          query: sqlQuery, 
          timestamp: new Date(), 
          status: 'error' 
        }, 
        ...prev.slice(0, 4)
      ]);
      toast({
        title: "Query failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handler for executing predefined queries
  const executePredefinedQuery = useMutation({
    mutationFn: async (queryName: string) => {
      const res = await apiRequest("GET", `/api/admin/${queryName}`);
      return await res.json();
    },
    onSuccess: (data) => {
      setQueryResults(data.rows || []);
      setQueryColumns(data.columns || []);
      setQueryHistory(prev => [
        { 
          query: `Predefined query: ${selectedPredefinedQuery}`, 
          timestamp: new Date(), 
          status: 'success' 
        }, 
        ...prev.slice(0, 4)
      ]);
      toast({
        title: "Predefined query executed",
        description: `Found ${data.rows?.length || 0} results.`,
      });
    },
    onError: (error: Error) => {
      setQueryHistory(prev => [
        { 
          query: `Predefined query: ${selectedPredefinedQuery}`, 
          timestamp: new Date(), 
          status: 'error' 
        }, 
        ...prev.slice(0, 4)
      ]);
      toast({
        title: "Query failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleExecuteQuery = () => {
    if (sqlQuery.trim()) {
      executeQueryMutation.mutate(sqlQuery);
    } else if (selectedPredefinedQuery) {
      executePredefinedQuery.mutate(selectedPredefinedQuery);
    } else {
      toast({
        title: "No query to execute",
        description: "Please enter a SQL query or select a predefined query.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FBF7]">
      {/* Admin Sidebar */}
      <div className="w-64 bg-[#33691E] text-white">
        <div className="p-6">
          <h1 className="text-xl font-bold">AgroBuizz Admin</h1>
          <p className="text-xs text-white/70 mt-1">Management Dashboard</p>
        </div>
        
        <div className="mt-6">
          <button 
            className={`w-full text-left p-3 pl-6 flex items-center space-x-3 ${activeTab === "dashboard" ? "bg-[#2E7D32] text-white" : "text-white hover:bg-[#2E7D32]/50"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`w-full text-left p-3 pl-6 flex items-center space-x-3 ${activeTab === "products" ? "bg-[#2E7D32] text-white" : "text-white hover:bg-[#2E7D32]/50"}`}
            onClick={() => setActiveTab("products")}
          >
            <ShoppingBag size={18} />
            <span>Products</span>
          </button>
          
          <button 
            className={`w-full text-left p-3 pl-6 flex items-center space-x-3 ${activeTab === "inventory" ? "bg-[#2E7D32] text-white" : "text-white hover:bg-[#2E7D32]/50"}`}
            onClick={() => setActiveTab("inventory")}
          >
            <Package2Icon size={18} />
            <span>Inventory</span>
          </button>
          
          <button 
            className={`w-full text-left p-3 pl-6 flex items-center space-x-3 ${activeTab === "orders" ? "bg-[#2E7D32] text-white" : "text-white hover:bg-[#2E7D32]/50"}`}
            onClick={() => setActiveTab("orders")}
          >
            <ClipboardList size={18} />
            <span className="font-medium">Orders</span>
          </button>
          
          <button 
            className={`w-full text-left p-3 pl-6 flex items-center space-x-3 ${activeTab === "users" ? "bg-[#2E7D32] text-white" : "text-white hover:bg-[#2E7D32]/50"}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={18} />
            <span>Users</span>
          </button>
          
          <button 
            className={`w-full text-left p-3 pl-6 flex items-center space-x-3 ${activeTab === "analytics" ? "bg-[#2E7D32] text-white" : "text-white hover:bg-[#2E7D32]/50"}`}
            onClick={() => setActiveTab("analytics")}
          >
            <TrendingUp size={18} />
            <span>Analytics</span>
          </button>
          
          <button 
            className={`w-full text-left p-3 pl-6 flex items-center space-x-3 ${activeTab === "database" ? "bg-[#2E7D32] text-white" : "text-white hover:bg-[#2E7D32]/50"}`}
            onClick={() => setActiveTab("database")}
          >
            <BarChart4 size={18} />
            <span>Database</span>
          </button>
        </div>
        
        <div className="absolute bottom-0 w-64 p-4 bg-[#33691E]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#33691E] text-xs font-bold">
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.username || 'Admin'}</p>
              <p className="text-xs text-white/70">{user?.email || 'admin@agrobuizz.com'}</p>
            </div>
          </div>
          
          <Button 
            variant="destructive" 
            className="w-full font-medium text-white"
            onClick={handleSignOut}
          >
            <LogOut size={16} className="mr-2" /> Sign Out
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>
        
        <TabsContent value="dashboard">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#33691E]">Dashboard Overview</h2>
            <p className="text-gray-500 mb-6">Welcome back, {user?.username || 'Admin'}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#4CAF50] flex items-center">
                    <Users className="mr-2 h-4 w-4" /> Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{users.length}</p>
                  <p className="text-sm text-gray-500">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#4CAF50] flex items-center">
                    <BoxesIcon className="mr-2 h-4 w-4" /> Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{seedProducts.length + equipmentProducts.length + produceProducts.length}</p>
                  <p className="text-sm text-gray-500">Across all categories</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#4CAF50] flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4" /> Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">132</p>
                  <p className="text-sm text-gray-500">+8% from last week</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent User Activity</CardTitle>
                  <CardDescription>Last 5 user logins</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Last Login</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.slice(0, 5).map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {user.userType}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.lastLogin}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Stock Alerts</CardTitle>
                  <CardDescription>Products with low inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        ...seedProducts.filter(p => p.stock < 120),
                        ...equipmentProducts.filter(p => p.stock < 15),
                        ...produceProducts.filter(p => p.stock < 300)
                      ].slice(0, 5).map(product => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="capitalize">{product.category}</TableCell>
                          <TableCell className={product.stock < 100 ? "text-red-500 font-medium" : ""}>
                            {product.stock} units
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#33691E]">Product Management</h2>
              <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#4CAF50] hover:bg-[#43A047]">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Create a new product in the {activeProductTab} category.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input 
                        id="name" 
                        className="col-span-3" 
                        value={newProduct.name}
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">Category</Label>
                      <Select 
                        value={newProduct.category}
                        onValueChange={value => setNewProduct({...newProduct, category: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {productCategories[activeProductTab as keyof typeof productCategories]?.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">Price</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        className="col-span-3" 
                        value={newProduct.price.toString()}
                        onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock" className="text-right">Stock</Label>
                      <Input 
                        id="stock" 
                        type="number" 
                        className="col-span-3" 
                        value={newProduct.stock.toString()}
                        onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Textarea 
                        id="description" 
                        className="col-span-3" 
                        value={newProduct.description}
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>Cancel</Button>
                    <Button type="button" className="bg-[#4CAF50]" onClick={handleAddProduct}>Add Product</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex flex-col space-y-6">
              <div className="flex justify-between items-center">
                <Tabs value={activeProductTab} onValueChange={setActiveProductTab}>
                  <TabsList>
                    <TabsTrigger value="seeds">Seeds</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                    <TabsTrigger value="produce">Produce</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex space-x-2 items-center">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input 
                      placeholder="Search products..." 
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setSearchQuery("")} title="Reset search">
                    <RefreshCw size={16} />
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredProducts().map(product => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="capitalize">{product.category}</TableCell>
                          <TableCell>{product.price} points</TableCell>
                          <TableCell className={product.stock < 100 ? "text-red-500" : ""}>{product.stock} units</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                                <Edit size={16} className="text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product)}>
                                <Trash2 size={16} className="text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Confirm Delete Dialog */}
          <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-500">Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>Cancel</Button>
                <Button type="button" variant="destructive" onClick={confirmDeleteProduct}>Delete Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#33691E]">User Management</h2>
              <div className="flex space-x-2 items-center">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input 
                    placeholder="Search users..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => setSearchQuery("")} title="Reset search">
                  <RefreshCw size={16} />
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>User Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredUsers().map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "outline"} className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{user.userType}</TableCell>
                        <TableCell>{user.createdAt}</TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon">
                              <Edit size={16} className="text-blue-500" />
                            </Button>
                            {user.role !== "admin" && (
                              <Button variant="ghost" size="icon">
                                <Trash2 size={16} className="text-red-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="statistics">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#33691E] mb-6">Statistics &amp; Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-md">
                    <p className="text-gray-500">User Growth Chart Placeholder</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sales Analytics</CardTitle>
                  <CardDescription>Revenue by product category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-md">
                    <p className="text-gray-500">Sales Chart Placeholder</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>Revenue trends for the past 12 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-md">
                    <p className="text-gray-500">Revenue Chart Placeholder</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryManagement />
        </TabsContent>
        
        <TabsContent value="orders">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#33691E]">Order Management</h2>
              <div className="flex space-x-3 items-center">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input 
                    placeholder="Search orders..." 
                    className="pl-9"
                  />
                </div>
                
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { 
                        id: "ORD-001", 
                        customer: "John Farmer", 
                        customerType: "farmer",
                        items: ["Premium Corn Seeds", "Basic Tractor"], 
                        total: 2530, 
                        status: "pending", 
                        date: "2025-03-20"
                      },
                      { 
                        id: "ORD-002", 
                        customer: "Sara Vendor", 
                        customerType: "vendor",
                        items: ["Organic Tomato Seeds", "Irrigation System"], 
                        total: 475, 
                        status: "processing", 
                        date: "2025-03-22"
                      },
                      { 
                        id: "ORD-003", 
                        customer: "Mike Customer", 
                        customerType: "customer",
                        items: ["Fresh Tomatoes", "Organic Lettuce"], 
                        total: 9, 
                        status: "shipped", 
                        date: "2025-03-23"
                      }
                    ].map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          {order.customer}
                          <Badge variant="outline" className="ml-2 capitalize">
                            {order.customerType}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          {order.items.length > 1 
                            ? `${order.items[0]} + ${order.items.length - 1} more` 
                            : order.items[0]}
                        </TableCell>
                        <TableCell>{order.total} points</TableCell>
                        <TableCell>
                          <Badge 
                            variant={order.status === "pending" ? "outline" : order.status === "processing" ? "secondary" : (order.status === "shipped" ? "default" : "destructive")}
                            className="capitalize flex items-center w-fit"
                          >
                            {order.status === "pending" && <AlertTriangle className="mr-1 h-3 w-3 text-yellow-500" />}
                            {order.status === "processing" && <RefreshCw className="mr-1 h-3 w-3 text-blue-500 animate-spin" />}
                            {order.status === "shipped" && <Truck className="mr-1 h-3 w-3" />}
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>
        
        <TabsContent value="database">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#33691E]">Database Queries</h2>
            <p className="text-gray-500 mb-6">Execute and view SQL database queries</p>
            
            <div className="grid grid-cols-1 gap-6 mb-8">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Query Execution</CardTitle>
                  <CardDescription>Run SQL queries against the database</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea 
                      placeholder="Enter custom SQL query or select a predefined query from the dropdown below..." 
                      className="min-h-[150px] font-mono"
                      id="custom-query"
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                    />
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Select
                        value={selectedPredefinedQuery}
                        onValueChange={setSelectedPredefinedQuery}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Choose a predefined query" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="farmers-with-crops">Farmers with their crops</SelectItem>
                          <SelectItem value="customers-with-multiple-orders">Customers with 3+ orders</SelectItem>
                          <SelectItem value="products-by-type">Products by type</SelectItem>
                          <SelectItem value="products-by-price-range">Products by price range</SelectItem>
                          <SelectItem value="available-products">Available products with stock</SelectItem>
                          <SelectItem value="products-by-vendor-ratings">Products by vendor ratings</SelectItem>
                          <SelectItem value="crops-for-sale">Crops for sale</SelectItem>
                          <SelectItem value="vendor-product-counts">Products count by vendor</SelectItem>
                          <SelectItem value="farmer-orders">Farmer orders</SelectItem>
                          <SelectItem value="disputes">Disputes tracking</SelectItem>
                          <SelectItem value="highly-rated-vendors">Highly rated vendors</SelectItem>
                          <SelectItem value="orders-by-year">Orders by year (2025)</SelectItem>
                          <SelectItem value="crop-sales">Crop sales</SelectItem>
                          <SelectItem value="farmers-with-multiple-disputes">Farmers with multiple disputes</SelectItem>
                          <SelectItem value="most-sold-items">Most sold items</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        className="bg-[#4CAF50] hover:bg-[#43A047]" 
                        onClick={handleExecuteQuery}
                        disabled={executeQueryMutation.isPending || executePredefinedQuery.isPending}
                      >
                        {(executeQueryMutation.isPending || executePredefinedQuery.isPending) ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Executing...
                          </>
                        ) : (
                          <>Execute Query</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Query Results</CardTitle>
                  <CardDescription>Query execution results will appear below</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {queryColumns.length > 0 ? (
                            queryColumns.map((column, index) => (
                              <TableHead key={index}>{column}</TableHead>
                            ))
                          ) : (
                            <>
                              <TableHead>Column</TableHead>
                              <TableHead>Value</TableHead>
                            </>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queryResults && queryResults.length > 0 ? (
                          queryResults.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {Object.values(row).map((value: any, cellIndex) => (
                                <TableCell key={cellIndex}>
                                  {value === null ? 
                                    <span className="text-muted-foreground">NULL</span> : 
                                    String(value)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell 
                              colSpan={queryColumns.length || 2} 
                              className="text-center py-8 text-muted-foreground"
                            >
                              {executeQueryMutation.isPending || executePredefinedQuery.isPending ? 
                                "Executing query..." : 
                                "Execute a query to view results"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Queries</CardTitle>
                  <CardDescription>Your recently executed queries</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[300px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Query</TableHead>
                          <TableHead className="w-[120px]">Executed</TableHead>
                          <TableHead className="w-[80px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queryHistory.length > 0 ? (
                          queryHistory.map((entry, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-xs max-w-[270px] truncate">
                                {entry.query}
                              </TableCell>
                              <TableCell className="text-xs">
                                {entry.timestamp.toLocaleTimeString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={entry.status === 'success' ? 'outline' : 'destructive'}
                                  className={entry.status === 'success' ? 'bg-green-50 text-green-600' : ''}
                                >
                                  {entry.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                              No recent queries
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Database Info</CardTitle>
                  <CardDescription>Information about the database</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1 font-medium">Database:</div>
                      <div className="col-span-2">agrobuizz</div>
                      
                      <div className="col-span-1 font-medium">Tables:</div>
                      <div className="col-span-2">23</div>
                      
                      <div className="col-span-1 font-medium">Connection:</div>
                      <div className="col-span-2">
                        <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
                          Connected
                        </Badge>
                      </div>
                      
                      <div className="col-span-1 font-medium">Version:</div>
                      <div className="col-span-2">PostgreSQL 14</div>
                      
                      <div className="col-span-1 font-medium">Last Backup:</div>
                      <div className="col-span-2">Never</div>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Connection refreshed",
                            description: "Database connection is active",
                          });
                        }}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh Connection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}