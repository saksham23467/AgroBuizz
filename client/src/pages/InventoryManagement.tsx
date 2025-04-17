import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, RefreshCw, Edit, Trash2, PlusCircle, MoreVertical, AlertTriangle,
  ChevronUp, ChevronDown, RotateCcw, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Mock inventory data
const seedInventory = [
  { 
    id: 101, 
    name: "Organic Tomato Seeds", 
    sku: "S-TOM-001", 
    category: "vegetable", 
    currentStock: 150, 
    minStock: 50, 
    maxStock: 300, 
    unitPrice: 25,
    supplier: "Green Seeds Co.", 
    lastRestocked: "2025-03-01",
    status: "normal", // low, normal, overstock
    location: "Warehouse A, Shelf 3"
  },
  { 
    id: 102, 
    name: "Premium Corn Seeds", 
    sku: "S-CRN-002", 
    category: "grain", 
    currentStock: 40, 
    minStock: 50, 
    maxStock: 250, 
    unitPrice: 30,
    supplier: "Agricultural Supplies Inc.", 
    lastRestocked: "2025-02-20",
    status: "low",
    location: "Warehouse A, Shelf 4"
  },
  { 
    id: 103, 
    name: "Organic Lettuce Seeds", 
    sku: "S-LET-003", 
    category: "vegetable", 
    currentStock: 95, 
    minStock: 30, 
    maxStock: 150, 
    unitPrice: 15,
    supplier: "Green Seeds Co.", 
    lastRestocked: "2025-03-05",
    status: "normal",
    location: "Warehouse A, Shelf 3"
  },
  { 
    id: 104, 
    name: "Premium Rice Seeds", 
    sku: "S-RIC-004", 
    category: "grain", 
    currentStock: 320, 
    minStock: 100, 
    maxStock: 300, 
    unitPrice: 35,
    supplier: "Rice Farmers Guild", 
    lastRestocked: "2025-03-10",
    status: "overstock",
    location: "Warehouse B, Shelf 1"
  },
  { 
    id: 105, 
    name: "Organic Carrot Seeds", 
    sku: "S-CAR-005", 
    category: "vegetable", 
    currentStock: 25, 
    minStock: 40, 
    maxStock: 200, 
    unitPrice: 18,
    supplier: "Green Seeds Co.", 
    lastRestocked: "2025-02-15",
    status: "low",
    location: "Warehouse A, Shelf 3"
  },
];

const equipmentInventory = [
  { 
    id: 201, 
    name: "Basic Tractor", 
    sku: "E-TRA-001", 
    category: "machinery", 
    currentStock: 5, 
    minStock: 2, 
    maxStock: 15, 
    unitPrice: 2500,
    supplier: "Farm Equipment Ltd.", 
    lastRestocked: "2025-01-15",
    status: "normal",
    location: "Warehouse C, Section 1"
  },
  { 
    id: 202, 
    name: "Irrigation System", 
    sku: "E-IRR-002", 
    category: "irrigation", 
    currentStock: 12, 
    minStock: 5, 
    maxStock: 20, 
    unitPrice: 450,
    supplier: "Waterworks Inc.", 
    lastRestocked: "2025-02-10",
    status: "normal",
    location: "Warehouse C, Section 2"
  },
  { 
    id: 203, 
    name: "Harvester", 
    sku: "E-HAR-003", 
    category: "machinery", 
    currentStock: 2, 
    minStock: 2, 
    maxStock: 10, 
    unitPrice: 1800,
    supplier: "Farm Equipment Ltd.", 
    lastRestocked: "2025-01-20",
    status: "low",
    location: "Warehouse C, Section 1"
  },
];

const produceInventory = [
  { 
    id: 301, 
    name: "Fresh Tomatoes", 
    sku: "P-TOM-001", 
    category: "vegetable", 
    currentStock: 120, 
    minStock: 100, 
    maxStock: 500, 
    unitPrice: 5,
    supplier: "Local Farms Cooperative", 
    lastRestocked: "2025-03-20",
    status: "normal",
    location: "Cold Storage A, Section 1",
    expiry: "2025-04-05"
  },
  { 
    id: 302, 
    name: "Premium Corn", 
    sku: "P-CRN-002", 
    category: "grain", 
    currentStock: 280, 
    minStock: 150, 
    maxStock: 600, 
    unitPrice: 3,
    supplier: "Heartland Growers", 
    lastRestocked: "2025-03-15",
    status: "normal",
    location: "Storage B, Section 3",
    expiry: "2025-05-15"
  },
  { 
    id: 303, 
    name: "Organic Lettuce", 
    sku: "P-LET-003", 
    category: "vegetable", 
    currentStock: 75, 
    minStock: 80, 
    maxStock: 300, 
    unitPrice: 4,
    supplier: "Green Fields Farm", 
    lastRestocked: "2025-03-22",
    status: "low",
    location: "Cold Storage A, Section 2",
    expiry: "2025-04-01"
  },
];

// Product categories
const productCategories = {
  seeds: ["vegetable", "grain", "fruit", "herb"],
  equipment: ["machinery", "irrigation", "tools", "storage"],
  produce: ["vegetable", "fruit", "grain", "dairy"],
};

export default function InventoryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("seeds");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    sku: "",
    category: "",
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unitPrice: 0,
    supplier: "",
    location: "",
  });
  const [restockAmount, setRestockAmount] = useState(0);
  
  // Sorting
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Force navigation away if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getInventoryByType = () => {
    switch (activeTab) {
      case "seeds":
        return seedInventory;
      case "equipment":
        return equipmentInventory;
      case "produce":
        return produceInventory;
      default:
        return seedInventory;
    }
  };

  const getFilteredInventory = () => {
    let inventory = [...getInventoryByType()];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      inventory = inventory.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.supplier.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (filterStatus) {
      inventory = inventory.filter(item => item.status === filterStatus);
    }
    
    // Apply category filter
    if (filterCategory) {
      inventory = inventory.filter(item => item.category === filterCategory);
    }
    
    // Apply sorting
    if (sortField) {
      inventory.sort((a, b) => {
        if (a[sortField as keyof typeof a] < b[sortField as keyof typeof b]) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (a[sortField as keyof typeof a] > b[sortField as keyof typeof b]) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    
    return inventory;
  };

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case "low":
        return { 
          variant: "destructive", 
          icon: <AlertTriangle className="mr-1 h-3 w-3" />,
          text: "Low Stock" 
        };
      case "normal":
        return { 
          variant: "outline", 
          icon: null,
          text: "Normal" 
        };
      case "overstock":
        return { 
          variant: "secondary", 
          icon: <ArrowUpRight className="mr-1 h-3 w-3 text-blue-500" />,
          text: "Overstock" 
        };
      default:
        return { 
          variant: "outline", 
          icon: null,
          text: status 
        };
    }
  };

  const getStockPercentage = (current: number, min: number, max: number) => {
    const percentage = (current / max) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const getProgressColorClass = (status: string) => {
    switch (status) {
      case "low":
        return "bg-red-500";
      case "normal":
        return "bg-green-500";
      case "overstock":
        return "bg-blue-500";
      default:
        return "bg-green-500";
    }
  };

  const handleAddItem = () => {
    // In a real application, this would be an API call
    toast({
      title: "Item added",
      description: `${newItem.name} has been added to inventory.`,
    });
    
    setIsAddItemDialogOpen(false);
    setNewItem({
      name: "",
      sku: "",
      category: "",
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      unitPrice: 0,
      supplier: "",
      location: "",
    });
  };

  const handleEditItem = () => {
    // In a real application, this would be an API call
    toast({
      title: "Item updated",
      description: `${selectedItem?.name} has been updated.`,
    });
    
    setIsEditItemDialogOpen(false);
  };

  const handleRestock = () => {
    if (!selectedItem) return;
    
    // In a real application, this would be an API call
    const newStock = selectedItem.currentStock + restockAmount;
    let newStatus = "normal";
    
    if (newStock <= selectedItem.minStock) {
      newStatus = "low";
    } else if (newStock >= selectedItem.maxStock) {
      newStatus = "overstock";
    }
    
    toast({
      title: "Item restocked",
      description: `Added ${restockAmount} units to ${selectedItem.name}. New stock: ${newStock}`,
    });
    
    // Update the local state for demonstration
    const inventory = getInventoryByType();
    const index = inventory.findIndex(item => item.id === selectedItem.id);
    
    if (index !== -1) {
      inventory[index].currentStock = newStock;
      inventory[index].status = newStatus;
      inventory[index].lastRestocked = new Date().toISOString().split('T')[0];
    }
    
    setIsRestockDialogOpen(false);
    setRestockAmount(0);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterStatus(null);
    setFilterCategory(null);
    setSortField(null);
    setSortDirection("asc");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#33691E]">Inventory Management</h2>
        <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#4CAF50] hover:bg-[#43A047]">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>
                Add a new item to the {activeTab} inventory
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input 
                  id="name" 
                  className="col-span-3"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sku" className="text-right">SKU</Label>
                <Input 
                  id="sku" 
                  className="col-span-3"
                  value={newItem.sku}
                  onChange={e => setNewItem({...newItem, sku: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Select
                  value={newItem.category}
                  onValueChange={value => setNewItem({...newItem, category: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories[activeTab as keyof typeof productCategories]?.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current" className="text-right">Current Stock</Label>
                <Input 
                  id="current" 
                  type="number"
                  className="col-span-3"
                  value={newItem.currentStock}
                  onChange={e => setNewItem({...newItem, currentStock: Number(e.target.value)})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="min" className="text-right">Min Stock</Label>
                <Input 
                  id="min" 
                  type="number"
                  className="col-span-3"
                  value={newItem.minStock}
                  onChange={e => setNewItem({...newItem, minStock: Number(e.target.value)})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="max" className="text-right">Max Stock</Label>
                <Input 
                  id="max" 
                  type="number"
                  className="col-span-3"
                  value={newItem.maxStock}
                  onChange={e => setNewItem({...newItem, maxStock: Number(e.target.value)})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Unit Price</Label>
                <Input 
                  id="price" 
                  type="number"
                  className="col-span-3"
                  value={newItem.unitPrice}
                  onChange={e => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplier" className="text-right">Supplier</Label>
                <Input 
                  id="supplier" 
                  className="col-span-3"
                  value={newItem.supplier}
                  onChange={e => setNewItem({...newItem, supplier: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Storage Location</Label>
                <Input 
                  id="location" 
                  className="col-span-3"
                  value={newItem.location}
                  onChange={e => setNewItem({...newItem, location: e.target.value})}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddItem}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="seeds">Seeds</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="produce">Produce</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search inventory..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={filterStatus || "all"} onValueChange={(value) => setFilterStatus(value === "all" ? null : value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="overstock">Overstock</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCategory || "all"} onValueChange={(value) => setFilterCategory(value === "all" ? null : value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {productCategories[activeTab as keyof typeof productCategories]?.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={resetFilters} title="Reset filters">
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center">
                      Product
                      {sortField === "name" && (
                        sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("currentStock")}>
                    <div className="flex items-center">
                      Stock Level
                      {sortField === "currentStock" && (
                        sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("unitPrice")}>
                    <div className="flex items-center">
                      Unit Price
                      {sortField === "unitPrice" && (
                        sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("lastRestocked")}>
                    <div className="flex items-center">
                      Last Restocked
                      {sortField === "lastRestocked" && (
                        sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredInventory().map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell className="capitalize">{item.category}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{item.currentStock} units</span>
                          <span>{item.minStock} - {item.maxStock}</span>
                        </div>
                        <Progress 
                          value={getStockPercentage(item.currentStock, item.minStock, item.maxStock)} 
                          className={`h-2 ${getProgressColorClass(item.status)}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{item.unitPrice} points</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStockStatusBadge(item.status).variant as any}
                        className="flex items-center w-fit"
                      >
                        {getStockStatusBadge(item.status).icon}
                        {getStockStatusBadge(item.status).text}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.lastRestocked}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedItem(item);
                            setIsEditItemDialogOpen(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedItem(item);
                            setIsRestockDialogOpen(true);
                          }}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restock
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Item Dialog */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update details for {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input 
                  id="edit-name" 
                  className="col-span-3"
                  defaultValue={selectedItem.name}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sku" className="text-right">SKU</Label>
                <Input 
                  id="edit-sku" 
                  className="col-span-3"
                  defaultValue={selectedItem.sku}
                  disabled
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">Category</Label>
                <Select defaultValue={selectedItem.category}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories[activeTab as keyof typeof productCategories]?.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-min" className="text-right">Min Stock</Label>
                <Input 
                  id="edit-min" 
                  type="number"
                  className="col-span-3"
                  defaultValue={selectedItem.minStock}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-max" className="text-right">Max Stock</Label>
                <Input 
                  id="edit-max" 
                  type="number"
                  className="col-span-3"
                  defaultValue={selectedItem.maxStock}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">Unit Price</Label>
                <Input 
                  id="edit-price" 
                  type="number"
                  className="col-span-3"
                  defaultValue={selectedItem.unitPrice}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-supplier" className="text-right">Supplier</Label>
                <Input 
                  id="edit-supplier" 
                  className="col-span-3"
                  defaultValue={selectedItem.supplier}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-location" className="text-right">Storage Location</Label>
                <Input 
                  id="edit-location" 
                  className="col-span-3"
                  defaultValue={selectedItem.location}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restock Inventory</DialogTitle>
            <DialogDescription>
              Add stock to {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Current Stock: <span className="font-medium">{selectedItem.currentStock} units</span></span>
                <span>Max Stock: <span className="font-medium">{selectedItem.maxStock} units</span></span>
              </div>
              
              <Progress 
                value={getStockPercentage(selectedItem.currentStock, selectedItem.minStock, selectedItem.maxStock)} 
                className={`h-2 mb-4 ${getProgressColorClass(selectedItem.status)}`}
              />
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="restock-amount" className="text-right">Amount to Add</Label>
                <Input 
                  id="restock-amount" 
                  type="number"
                  className="col-span-3"
                  value={restockAmount}
                  onChange={e => setRestockAmount(Number(e.target.value))}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">New Total</Label>
                <div className="col-span-3 flex items-center">
                  <span className="font-medium">{selectedItem.currentStock + restockAmount} units</span>
                  {selectedItem.currentStock + restockAmount > selectedItem.maxStock && (
                    <Badge variant="secondary" className="ml-2">Overstock</Badge>
                  )}
                </div>
              </div>
              
              {selectedItem.currentStock + restockAmount > selectedItem.maxStock && (
                <p className="text-sm text-yellow-600 flex items-center col-span-full mt-2">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  This will exceed the maximum recommended stock level
                </p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleRestock}
              disabled={restockAmount <= 0}
            >
              Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}