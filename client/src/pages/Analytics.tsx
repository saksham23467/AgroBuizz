import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from "recharts";

// Mock data for charts
const monthlyRevenueData = [
  { name: 'Jan', revenue: 12000 },
  { name: 'Feb', revenue: 15000 },
  { name: 'Mar', revenue: 18000 },
  { name: 'Apr', revenue: 16000 },
  { name: 'May', revenue: 21000 },
  { name: 'Jun', revenue: 25000 },
  { name: 'Jul', revenue: 23000 },
  { name: 'Aug', revenue: 27000 },
  { name: 'Sep', revenue: 30000 },
  { name: 'Oct', revenue: 28000 },
  { name: 'Nov', revenue: 32000 },
  { name: 'Dec', revenue: 35000 },
];

const categoryRevenueData = [
  { name: 'Seeds', value: 45000 },
  { name: 'Equipment', value: 32000 },
  { name: 'Produce', value: 18000 },
];

const userGrowthData = [
  { month: 'Jan', farmers: 20, vendors: 15, customers: 120 },
  { month: 'Feb', farmers: 25, vendors: 18, customers: 150 },
  { month: 'Mar', farmers: 30, vendors: 22, customers: 190 },
  { month: 'Apr', farmers: 35, vendors: 25, customers: 220 },
  { month: 'May', farmers: 40, vendors: 30, customers: 250 },
  { month: 'Jun', farmers: 45, vendors: 33, customers: 290 },
];

const inventoryData = [
  { name: 'Jan', seeds: 500, equipment: 50, produce: 800 },
  { name: 'Feb', seeds: 450, equipment: 45, produce: 750 },
  { name: 'Mar', seeds: 400, equipment: 40, produce: 700 },
  { name: 'Apr', seeds: 600, equipment: 55, produce: 850 },
  { name: 'May', seeds: 550, equipment: 50, produce: 800 },
  { name: 'Jun', seeds: 700, equipment: 60, produce: 950 },
];

const popularProductsData = [
  { name: 'Organic Tomato Seeds', value: 300 },
  { name: 'Basic Tractor', value: 20 },
  { name: 'Premium Corn Seeds', value: 250 },
  { name: 'Irrigation System', value: 45 },
  { name: 'Fresh Tomatoes', value: 400 },
];

const COLORS = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800'];

export default function Analytics() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [timeRange, setTimeRange] = useState("6m"); // 6m, 1y, all
  
  // Force navigation away if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);
  
  const getFilteredData = (data: any[], range: string) => {
    if (range === 'all') return data;
    
    const monthsToFilter = range === '6m' ? 6 : 12;
    return data.slice(-monthsToFilter);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#33691E]">Analytics & Reporting</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="revenue">
        <TabsList className="mb-6">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getFilteredData(monthlyRevenueData, timeRange)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} points`, 'Revenue']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#4CAF50" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Distribution across product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryRevenueData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryRevenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} points`, 'Revenue']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth by Type</CardTitle>
                <CardDescription>Breakdown of different user types over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getFilteredData(userGrowthData, timeRange)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="farmers" stackId="a" fill="#4CAF50" name="Farmers" />
                      <Bar dataKey="vendors" stackId="a" fill="#8BC34A" name="Vendors" />
                      <Bar dataKey="customers" stackId="a" fill="#CDDC39" name="Customers" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Levels</CardTitle>
                <CardDescription>Inventory trends across product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={getFilteredData(inventoryData, timeRange)}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="seeds" 
                        stackId="1"
                        stroke="#4CAF50" 
                        fill="#4CAF50" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="equipment" 
                        stackId="1"
                        stroke="#8BC34A" 
                        fill="#8BC34A" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="produce" 
                        stackId="1"
                        stroke="#CDDC39" 
                        fill="#CDDC39" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Products</CardTitle>
                <CardDescription>Top selling products by volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={popularProductsData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#4CAF50" name="Units Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}