import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Loader2, Layers, Package, Users, Calendar, BarChart, AlertCircle, FileText, ShoppingBag, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Type definitions
interface CropSale {
  cropId: string;
  cropName: string;
  totalSales: number;
  totalRevenue: number;
  farmerId: number;
  farmerName: string;
}

interface YearOrder {
  orderId: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: number;
}

interface TopSellingItem {
  itemId: string;
  itemName: string;
  category: string;
  totalSold: number;
  revenue: number;
  percentageOfSales: number;
}

interface FrequentCustomer {
  customerId: number;
  customerName: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

interface FarmerWithCrops {
  farmerId: number;
  farmerName: string;
  email: string;
  totalCrops: number;
  cropsList: { id: string; name: string; quantity: number; price: number }[];
}

interface Dispute {
  disputeId: number;
  customerId: number;
  customerName: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  status: string;
  createdAt: string;
  description: string;
}

interface FarmerOrder {
  orderId: string;
  farmerId: number;
  farmerName: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  orderDate: string;
  status: string;
}

interface VendorProducts {
  vendorId: string;
  vendorName: string;
  email: string;
  totalProducts: number;
  avgRating: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch crop sales data
  const {
    data: cropSalesData,
    isLoading: isLoadingCropSales,
    error: cropSalesError,
  } = useQuery<CropSale[]>({
    queryKey: ["/api/admin/crop-sales"],
    queryFn: getQueryFn({}),
    enabled: activeTab === "crop-sales" || activeTab === "overview",
  });

  // Fetch orders by year
  const {
    data: yearOrdersData,
    isLoading: isLoadingYearOrders,
    error: yearOrdersError,
  } = useQuery<YearOrder[]>({
    queryKey: ["/api/admin/orders-by-year", selectedYear],
    queryFn: getQueryFn({}),
    enabled: activeTab === "year-orders" || activeTab === "overview",
  });

  // Fetch most sold items
  const {
    data: topSellingItemsData,
    isLoading: isLoadingTopSellingItems,
    error: topSellingItemsError,
  } = useQuery<TopSellingItem[]>({
    queryKey: ["/api/admin/most-sold-items"],
    queryFn: getQueryFn(),
    enabled: activeTab === "top-selling" || activeTab === "overview",
  });

  // Fetch customers with multiple orders
  const {
    data: frequentCustomersData,
    isLoading: isLoadingFrequentCustomers,
    error: frequentCustomersError,
  } = useQuery<FrequentCustomer[]>({
    queryKey: ["/api/admin/customers-with-multiple-orders"],
    queryFn: getQueryFn(),
    enabled: activeTab === "frequent-customers" || activeTab === "overview",
  });

  // Fetch farmers with crops
  const {
    data: farmersWithCropsData,
    isLoading: isLoadingFarmersWithCrops,
    error: farmersWithCropsError,
  } = useQuery<FarmerWithCrops[]>({
    queryKey: ["/api/admin/farmers-with-crops"],
    queryFn: getQueryFn(),
    enabled: activeTab === "farmers-crops" || activeTab === "overview",
  });

  // Fetch disputes
  const {
    data: disputesData,
    isLoading: isLoadingDisputes,
    error: disputesError,
  } = useQuery<Dispute[]>({
    queryKey: ["/api/admin/disputes"],
    queryFn: getQueryFn(),
    enabled: activeTab === "disputes" || activeTab === "overview",
  });

  // Fetch farmer orders
  const {
    data: farmerOrdersData,
    isLoading: isLoadingFarmerOrders,
    error: farmerOrdersError,
  } = useQuery<FarmerOrder[]>({
    queryKey: ["/api/admin/farmer-orders"],
    queryFn: getQueryFn(),
    enabled: activeTab === "farmer-orders" || activeTab === "overview",
  });

  // Fetch vendor products
  const {
    data: vendorProductsData,
    isLoading: isLoadingVendorProducts,
    error: vendorProductsError,
  } = useQuery<VendorProducts[]>({
    queryKey: ["/api/admin/vendor-product-counts"],
    queryFn: getQueryFn(),
    enabled: activeTab === "vendor-products" || activeTab === "overview",
  });

  // Filter data based on search query
  const filterData = (data: any[], keys: string[]) => {
    if (!searchQuery.trim() || !data) return data;
    
    return data.filter(item => 
      keys.some(key => 
        String(item[key]).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const filteredCropSales = filterData(cropSalesData || [], ['cropName', 'farmerName']);
  const filteredYearOrders = filterData(yearOrdersData || [], ['customerName', 'orderId', 'status']);
  const filteredTopSellingItems = filterData(topSellingItemsData || [], ['itemName', 'category']);
  const filteredFrequentCustomers = filterData(frequentCustomersData || [], ['customerName', 'email']);
  const filteredFarmersWithCrops = filterData(farmersWithCropsData || [], ['farmerName', 'email']);
  const filteredDisputes = filterData(disputesData || [], ['customerName', 'vendorName', 'productName', 'status']);
  const filteredFarmerOrders = filterData(farmerOrdersData || [], ['farmerName', 'productName', 'status']);
  const filteredVendorProducts = filterData(vendorProductsData || [], ['vendorName', 'email']);

  // Loading state for the entire dashboard
  const isLoading = 
    isLoadingCropSales || 
    isLoadingYearOrders || 
    isLoadingTopSellingItems || 
    isLoadingFrequentCustomers || 
    isLoadingFarmersWithCrops || 
    isLoadingDisputes || 
    isLoadingFarmerOrders || 
    isLoadingVendorProducts;

  // Error check
  const hasError = 
    cropSalesError || 
    yearOrdersError || 
    topSellingItemsError || 
    frequentCustomersError || 
    farmersWithCropsError || 
    disputesError || 
    farmerOrdersError || 
    vendorProductsError;

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 text-center mb-6">
          You do not have permission to access the Admin Dashboard.
        </p>
        <Button onClick={() => window.location.href = "/"}>
          Return to Home
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#4CAF50]" />
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'bg-[#121212] text-white' : ''}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : ''}`}>Admin Dashboard</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className={`pl-8 w-[200px] md:w-[300px] ${isDarkMode ? 'bg-[#1E1E1E] border-[#333] text-white placeholder:text-gray-400' : ''}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {activeTab === "year-orders" && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className={`w-[120px] ${isDarkMode ? 'bg-[#1E1E1E] border-[#333] text-white' : ''}`}>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className={isDarkMode ? 'bg-[#1E1E1E] border-[#333] text-white' : ''}>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid grid-cols-4 lg:grid-cols-8 mb-8 ${isDarkMode ? 'bg-[#242424]' : ''}`}>
          <TabsTrigger value="overview" className={isDarkMode ? 'data-[state=active]:bg-[#333333] data-[state=active]:text-white' : ''}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="crop-sales" className={isDarkMode ? 'data-[state=active]:bg-[#333333] data-[state=active]:text-white' : ''}>
            Crop Sales
          </TabsTrigger>
          <TabsTrigger value="year-orders" className={isDarkMode ? 'data-[state=active]:bg-[#333333] data-[state=active]:text-white' : ''}>
            2025 Orders
          </TabsTrigger>
          <TabsTrigger value="top-selling" className={isDarkMode ? 'data-[state=active]:bg-[#333333] data-[state=active]:text-white' : ''}>
            Top Selling
          </TabsTrigger>
          <TabsTrigger value="frequent-customers" className={isDarkMode ? 'data-[state=active]:bg-[#333333] data-[state=active]:text-white' : ''}>
            Frequent Customers
          </TabsTrigger>
          <TabsTrigger value="farmers-crops" className={isDarkMode ? 'data-[state=active]:bg-[#333333] data-[state=active]:text-white' : ''}>
            Farmers & Crops
          </TabsTrigger>
          <TabsTrigger value="disputes" className={isDarkMode ? 'data-[state=active]:bg-[#333333] data-[state=active]:text-white' : ''}>
            Disputes
          </TabsTrigger>
          <TabsTrigger value="vendor-products" className={isDarkMode ? 'data-[state=active]:bg-[#333333] data-[state=active]:text-white' : ''}>
            Vendor Products
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg font-medium ${isDarkMode ? 'text-white' : ''}`}>
                  <div className="flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-[#4CAF50]" />
                    Total Crops
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {farmersWithCropsData?.reduce((acc, farmer) => acc + farmer.totalCrops, 0) || 0}
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Across {farmersWithCropsData?.length || 0} farmers
                </p>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg font-medium ${isDarkMode ? 'text-white' : ''}`}>
                  <div className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-[#FF9800]" />
                    Total Products
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {vendorProductsData?.reduce((acc, vendor) => acc + vendor.totalProducts, 0) || 0}
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  From {vendorProductsData?.length || 0} vendors
                </p>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg font-medium ${isDarkMode ? 'text-white' : ''}`}>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-[#2196F3]" />
                    Active Customers
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {frequentCustomersData?.length || 0}
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  With 3+ orders
                </p>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg font-medium ${isDarkMode ? 'text-white' : ''}`}>
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-[#F44336]" />
                    Open Disputes
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {disputesData?.filter(d => d.status === 'open').length || 0}
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Out of {disputesData?.length || 0} total
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : ''}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : ''}>Top Selling Items</CardTitle>
                <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                  The most popular products in the marketplace
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(topSellingItemsData || []).slice(0, 5).map((item, index) => (
                  <div key={item.itemId} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className={isDarkMode ? 'text-white' : ''}>{item.itemName}</span>
                      <span className={isDarkMode ? 'text-white' : ''}>{item.totalSold} sold</span>
                    </div>
                    <Progress value={item.percentageOfSales} className="h-2" />
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("top-selling")} className={isDarkMode ? 'border-[#333] text-white hover:bg-[#333] hover:text-white' : ''}>
                  View All
                </Button>
              </CardFooter>
            </Card>

            <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : ''}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : ''}>Recent Orders (2025)</CardTitle>
                <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                  Most recent orders placed in 2025
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                      <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Customer</TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Date</TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Status</TableHead>
                      <TableHead className="text-right" className={isDarkMode ? 'text-gray-400' : ''}>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(yearOrdersData || []).slice(0, 5).map((order) => (
                      <TableRow key={order.orderId} className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                        <TableCell className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>
                          {order.customerName}
                        </TableCell>
                        <TableCell className={isDarkMode ? 'text-white' : ''}>
                          {new Date(order.orderDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={order.status === 'completed' ? 'default' : 
                                    order.status === 'processing' ? 'secondary' : 
                                    order.status === 'cancelled' ? 'destructive' : 'outline'}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right ${isDarkMode ? 'text-white' : ''}`}>
                          ${order.totalAmount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("year-orders")} className={isDarkMode ? 'border-[#333] text-white hover:bg-[#333] hover:text-white' : ''}>
                  View All
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Crop Sales Tab */}
        <TabsContent value="crop-sales">
          <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Crop Sales Report</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Detailed analysis of sales for each crop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Crop Name</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Farmer</TableHead>
                    <TableHead className={`text-right ${isDarkMode ? 'text-gray-400' : ''}`}>Total Sales</TableHead>
                    <TableHead className="text-right" className={isDarkMode ? 'text-gray-400' : ''}>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCropSales?.map((sale) => (
                    <TableRow key={`${sale.cropId}-${sale.farmerId}`} className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                      <TableCell className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>
                        {sale.cropName}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-white' : ''}>
                        {sale.farmerName}
                      </TableCell>
                      <TableCell className={`text-right ${isDarkMode ? 'text-white' : ''}`}>
                        {sale.totalSales} units
                      </TableCell>
                      <TableCell className={`text-right ${isDarkMode ? 'text-white' : ''}`}>
                        ${sale.totalRevenue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCropSales?.length === 0 && (
                    <TableRow className={isDarkMode ? 'border-[#333]' : ''}>
                      <TableCell colSpan={4} className="text-center py-4">
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {searchQuery ? 'No matching crop sales found' : 'No crop sales data available'}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter className={isDarkMode ? 'bg-[#242424]' : ''}>
                  <TableRow className={isDarkMode ? 'border-[#333]' : ''}>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">
                      {filteredCropSales?.reduce((acc, sale) => acc + sale.totalSales, 0)} units
                    </TableCell>
                    <TableCell className="text-right">
                      ${filteredCropSales?.reduce((acc, sale) => acc + sale.totalRevenue, 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2025 Orders Tab */}
        <TabsContent value="year-orders">
          <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>
                Orders for {selectedYear}
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                All orders placed during the year {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Order ID</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Customer</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Date</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Items</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Status</TableHead>
                    <TableHead className="text-right" className={isDarkMode ? 'text-gray-400' : ''}>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredYearOrders?.map((order) => (
                    <TableRow key={order.orderId} className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                      <TableCell className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>
                        #{order.orderId}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-white' : ''}>
                        {order.customerName}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-white' : ''}>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-white' : ''}>
                        {order.items}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={order.status === 'completed' ? 'default' : 
                                  order.status === 'processing' ? 'secondary' : 
                                  order.status === 'cancelled' ? 'destructive' : 'outline'}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right ${isDarkMode ? 'text-white' : ''}`}>
                        ${order.totalAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredYearOrders?.length === 0 && (
                    <TableRow className={isDarkMode ? 'border-[#333]' : ''}>
                      <TableCell colSpan={6} className="text-center py-4">
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {searchQuery ? 'No matching orders found' : `No orders found for year ${selectedYear}`}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter className={isDarkMode ? 'bg-[#242424]' : ''}>
                  <TableRow className={isDarkMode ? 'border-[#333]' : ''}>
                    <TableCell colSpan={5}>Total</TableCell>
                    <TableCell className="text-right">
                      ${filteredYearOrders?.reduce((acc, order) => acc + order.totalAmount, 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Selling Items Tab */}
        <TabsContent value="top-selling">
          <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Top Selling Items</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Most popular products based on sales volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Item Name</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Category</TableHead>
                    <TableHead className="text-right" className={isDarkMode ? 'text-gray-400' : ''}>Quantity Sold</TableHead>
                    <TableHead className="text-right" className={isDarkMode ? 'text-gray-400' : ''}>Revenue</TableHead>
                    <TableHead className="text-right" className={isDarkMode ? 'text-gray-400' : ''}>% of Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTopSellingItems?.map((item) => (
                    <TableRow key={item.itemId} className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                      <TableCell className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>
                        {item.itemName}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-white' : ''}>
                        {item.category}
                      </TableCell>
                      <TableCell className={`text-right ${isDarkMode ? 'text-white' : ''}`}>
                        {item.totalSold}
                      </TableCell>
                      <TableCell className={`text-right ${isDarkMode ? 'text-white' : ''}`}>
                        ${item.revenue.toFixed(2)}
                      </TableCell>
                      <TableCell className={`text-right ${isDarkMode ? 'text-white' : ''}`}>
                        {item.percentageOfSales.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTopSellingItems?.length === 0 && (
                    <TableRow className={isDarkMode ? 'border-[#333]' : ''}>
                      <TableCell colSpan={5} className="text-center py-4">
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {searchQuery ? 'No matching products found' : 'No product sales data available'}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Showing {filteredTopSellingItems?.length || 0} items
              </p>
              <Button 
                variant="outline" 
                className={isDarkMode ? 'border-[#333] text-white hover:bg-[#333] hover:text-white' : ''}
                onClick={() => window.open('/api/admin/most-sold-items?format=csv', '_blank')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Frequent Customers Tab */}
        <TabsContent value="frequent-customers">
          <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Frequent Customers</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Customers who have placed at least 3 orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Customer</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Email</TableHead>
                    <TableHead className="text-right" className={isDarkMode ? 'text-gray-400' : ''}>Orders</TableHead>
                    <TableHead className="text-right" className={isDarkMode ? 'text-gray-400' : ''}>Total Spent</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Last Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFrequentCustomers?.map((customer) => (
                    <TableRow key={customer.customerId} className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                      <TableCell className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>
                        {customer.customerName}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-white' : ''}>
                        {customer.email}
                      </TableCell>
                      <TableCell className={`text-right ${isDarkMode ? 'text-white' : ''}`}>
                        {customer.totalOrders}
                      </TableCell>
                      <TableCell className={`text-right ${isDarkMode ? 'text-white' : ''}`}>
                        ${customer.totalSpent.toFixed(2)}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-white' : ''}>
                        {new Date(customer.lastOrderDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredFrequentCustomers?.length === 0 && (
                    <TableRow className={isDarkMode ? 'border-[#333]' : ''}>
                      <TableCell colSpan={5} className="text-center py-4">
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {searchQuery ? 'No matching customers found' : 'No frequent customers data available'}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Farmers & Crops Tab */}
        <TabsContent value="farmers-crops">
          <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Farmers and Their Crops</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Detailed listing of all farmers and the crops they grow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFarmersWithCrops?.map((farmer) => (
                <div key={farmer.farmerId} className={`mb-6 ${isDarkMode ? 'border-[#333]' : 'border-gray-200'} border-b pb-6`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : ''}`}>{farmer.farmerName}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{farmer.email}</p>
                    </div>
                    <Badge variant="outline" className={isDarkMode ? 'border-[#333] bg-[#242424] text-white' : ''}>
                      {farmer.totalCrops} crops
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {farmer.cropsList.map((crop) => (
                      <Card key={crop.id} className={`${isDarkMode ? 'bg-[#242424] border-[#333]' : 'bg-gray-50'}`}>
                        <CardContent className="p-3">
                          <div className="flex justify-between">
                            <h4 className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{crop.name}</h4>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-[#4CAF50]' : 'text-[#4CAF50]'}`}>
                              ${crop.price.toFixed(2)}
                            </span>
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Quantity: {crop.quantity} units
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                    {farmer.cropsList.length === 0 && (
                      <div className={`col-span-full py-2 px-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                        No crops available for this farmer
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredFarmersWithCrops?.length === 0 && (
                <div className="text-center py-8">
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {searchQuery ? 'No matching farmers found' : 'No farmers data available'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disputes Tab */}
        <TabsContent value="disputes">
          <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Dispute Management</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Track and manage all customer disputes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <Badge variant="outline" className={`${isDarkMode ? 'bg-[#242424] border-[#333] text-white' : ''}`}>
                    All: {disputesData?.length || 0}
                  </Badge>
                  <Badge variant="outline" className={`bg-green-50 text-green-600 ${isDarkMode ? 'bg-[#1E3A1E] border-green-800 text-green-400' : ''}`}>
                    Resolved: {disputesData?.filter(d => d.status === 'resolved').length || 0}
                  </Badge>
                  <Badge variant="outline" className={`bg-amber-50 text-amber-600 ${isDarkMode ? 'bg-[#3A331E] border-amber-800 text-amber-400' : ''}`}>
                    Pending: {disputesData?.filter(d => d.status === 'pending').length || 0}
                  </Badge>
                  <Badge variant="outline" className={`bg-red-50 text-red-600 ${isDarkMode ? 'bg-[#3A1E1E] border-red-800 text-red-400' : ''}`}>
                    Open: {disputesData?.filter(d => d.status === 'open').length || 0}
                  </Badge>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Dispute ID</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Customer</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Vendor</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Product</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Date</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDisputes?.map((dispute) => (
                    <TableRow key={dispute.disputeId} className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                      <TableCell className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>
                        #{dispute.disputeId}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-white' : ''}>
                        {dispute.customerName}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-white' : ''}>
                        {dispute.vendorName}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-white' : ''}>
                        {dispute.productName}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-white' : ''}>
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={dispute.status === 'resolved' ? 'default' : 
                                  dispute.status === 'pending' ? 'secondary' : 
                                  'destructive'}
                        >
                          {dispute.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDisputes?.length === 0 && (
                    <TableRow className={isDarkMode ? 'border-[#333]' : ''}>
                      <TableCell colSpan={6} className="text-center py-4">
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {searchQuery ? 'No matching disputes found' : 'No disputes data available'}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Products Tab */}
        <TabsContent value="vendor-products">
          <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Vendor Product Analysis</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Total number of products offered by each vendor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Vendor</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Email</TableHead>
                    <TableHead className="text-right" className={isDarkMode ? 'text-gray-400' : ''}>Products</TableHead>
                    <TableHead className="text-right" className={isDarkMode ? 'text-gray-400' : ''}>Avg. Rating</TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-400' : ''}>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendorProducts?.map((vendor) => (
                    <TableRow key={vendor.vendorId} className={isDarkMode ? 'border-[#333] hover:bg-[#242424]' : ''}>
                      <TableCell className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>
                        {vendor.vendorName}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-white' : ''}>
                        {vendor.email}
                      </TableCell>
                      <TableCell className={`text-right ${isDarkMode ? 'text-white' : ''}`}>
                        {vendor.totalProducts}
                      </TableCell>
                      <TableCell className={`text-right ${isDarkMode ? 'text-white' : ''}`}>
                        {vendor.avgRating.toFixed(1)}/5
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Progress
                            value={vendor.avgRating * 20} // Convert 0-5 to 0-100
                            className="h-2 mr-2"
                          />
                          <span className={`text-xs ${
                            vendor.avgRating >= 4.5 ? 'text-green-500' :
                            vendor.avgRating >= 3.5 ? 'text-[#4CAF50]' :
                            vendor.avgRating >= 2.5 ? 'text-yellow-500' :
                            'text-red-500'
                          }`}>
                            {
                              vendor.avgRating >= 4.5 ? 'Excellent' :
                              vendor.avgRating >= 3.5 ? 'Good' :
                              vendor.avgRating >= 2.5 ? 'Average' :
                              'Poor'
                            }
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredVendorProducts?.length === 0 && (
                    <TableRow className={isDarkMode ? 'border-[#333]' : ''}>
                      <TableCell colSpan={5} className="text-center py-4">
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {searchQuery ? 'No matching vendors found' : 'No vendor data available'}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter className={isDarkMode ? 'bg-[#242424]' : ''}>
                  <TableRow className={isDarkMode ? 'border-[#333]' : ''}>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">
                      {filteredVendorProducts?.reduce((acc, vendor) => acc + vendor.totalProducts, 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {filteredVendorProducts?.length ? 
                        (filteredVendorProducts.reduce((acc, vendor) => acc + vendor.avgRating, 0) / filteredVendorProducts.length).toFixed(1) : 
                        '0.0'
                      }/5
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}