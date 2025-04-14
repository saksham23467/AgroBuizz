import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Eye, MoreVertical, RefreshCw, Truck, CheckCircle2, 
  AlertTriangle, XCircle, Filter, CalendarIcon 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// Mock order data
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

// Fetch orders data
const { data: orders = [], isLoading } = useQuery({
  queryKey: ["/api/admin/orders"],
  queryFn: getQueryFn({ on401: "throw" }),
  refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
});

if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-[#4CAF50]" />
    </div>
  );
}
  { 
    id: "ORD-002", 
    customer: "Sara Vendor", 
    customerType: "vendor",
    items: ["Organic Tomato Seeds", "Irrigation System"], 
    total: 475, 
    status: "processing", 
    date: "2025-03-22",
    address: "456 Market Street, Commerce City",
    payment: "Bank Transfer",
    notes: "Rush delivery requested"
  },
  { 
    id: "ORD-003", 
    customer: "Mike Customer", 
    customerType: "customer",
    items: ["Fresh Tomatoes", "Organic Lettuce"], 
    total: 9, 
    status: "shipped", 
    date: "2025-03-23",
    address: "789 Residential Ave, Hometown",
    payment: "Digital Wallet",
    notes: ""
  },
  { 
    id: "ORD-004", 
    customer: "Lisa Farmer", 
    customerType: "farmer",
    items: ["Wheat Seeds", "Fertilizer Pack"], 
    total: 48, 
    status: "delivered", 
    date: "2025-03-15",
    address: "101 Wheat Field Road, Countryside",
    payment: "Credit Card",
    notes: ""
  },
  { 
    id: "ORD-005", 
    customer: "Tom Customer", 
    customerType: "customer",
    items: ["Premium Corn", "Fresh Tomatoes"], 
    total: 8, 
    status: "cancelled", 
    date: "2025-03-18",
    address: "202 City Street, Urban Center",
    payment: "Digital Wallet",
    notes: "Customer changed mind"
  },
];

export default function OrderManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Force navigation away if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return { variant: "outline", icon: <AlertTriangle className="mr-1 h-3 w-3 text-yellow-500" /> };
      case "processing":
        return { variant: "secondary", icon: <RefreshCw className="mr-1 h-3 w-3 text-blue-500 animate-spin" /> };
      case "shipped":
        return { variant: "default", icon: <Truck className="mr-1 h-3 w-3" /> };
      case "delivered":
        return { variant: "success", icon: <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" /> };
      case "cancelled":
        return { variant: "destructive", icon: <XCircle className="mr-1 h-3 w-3" /> };
      default:
        return { variant: "outline", icon: null };
    }
  };

  const getFilteredOrders = () => {
    let filtered = [...orders];
    
    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter(order => order.status === filterStatus);
    }
    
    // Apply date filter
    if (filterDate) {
      const filterDateStr = format(filterDate, 'yyyy-MM-dd');
      filtered = filtered.filter(order => order.date === filterDateStr);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.items.some(item => item.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsUpdateStatusDialogOpen(true);
  };

  const confirmStatusUpdate = () => {
    // In a real application, this would be an API call
    toast({
      title: "Order status updated",
      description: `Order ${selectedOrder.id} status changed to ${newStatus}.`,
    });
    
    // Update the local state for demonstration
    const index = orders.findIndex(o => o.id === selectedOrder.id);
    if (index !== -1) {
      orders[index].status = newStatus;
    }
    
    setIsUpdateStatusDialogOpen(false);
  };

  const resetFilters = () => {
    setFilterStatus(null);
    setFilterDate(null);
    setSearchQuery("");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#33691E]">Order Management</h2>
        <div className="flex space-x-3 items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              placeholder="Search orders..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterStatus || ""} onValueChange={(value) => setFilterStatus(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDate ? format(filterDate, "PPP") : <span>Filter by date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterDate || undefined}
                onSelect={(date) => date ? setFilterDate(date) : setFilterDate(null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
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
              {getFilteredOrders().map(order => (
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
                      variant={getStatusBadgeVariant(order.status).variant as any} 
                      className="capitalize flex items-center w-fit"
                    >
                      {getStatusBadgeVariant(order.status).icon}
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpdateStatus(order)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Update Status
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

      {/* View Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Order ID</p>
                  <p>{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p>{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p>{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge 
                    variant={getStatusBadgeVariant(selectedOrder.status).variant as any}
                    className="capitalize mt-1 flex items-center w-fit"
                  >
                    {getStatusBadgeVariant(selectedOrder.status).icon}
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Shipping Address</p>
                  <p>{selectedOrder.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p>{selectedOrder.payment}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Order Total</p>
                  <p className="font-bold">{selectedOrder.total} points</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Items</p>
                <ul className="list-disc list-inside space-y-1">
                  {selectedOrder.items.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}