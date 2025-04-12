import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  PlusCircle, 
  Leaf, 
  ShoppingBag, 
  TrendingUp, 
  FileText,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import AnimatedPage from "@/components/AnimatedPage";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  inventory: number;
  createdAt: string;
  imageUrl?: string;
}

interface Crop {
  id: number;
  name: string;
  status: "growing" | "harvested" | "ready";
  plantedDate: string;
  harvestDate?: string;
  quantity: number;
  notes?: string;
}

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the current date for the calendar
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Sample farmer crops data (would come from API)
  const [crops, setCrops] = useState<Crop[]>([
    {
      id: 1,
      name: "Organic Tomatoes",
      status: "growing",
      plantedDate: "2025-03-10",
      harvestDate: "2025-05-15",
      quantity: 500,
      notes: "Growing well, expected high yield"
    },
    {
      id: 2,
      name: "Sweet Corn",
      status: "ready",
      plantedDate: "2025-02-01",
      harvestDate: "2025-04-05",
      quantity: 1200,
      notes: "Ready for harvest"
    },
    {
      id: 3,
      name: "Potatoes",
      status: "harvested",
      plantedDate: "2025-01-15",
      harvestDate: "2025-04-01",
      quantity: 800,
      notes: "Good quality crop"
    }
  ]);
  
  // Sample market price data (would come from API/WebSocket)
  const [marketPrices, setMarketPrices] = useState([
    { product: "Tomatoes", price: 2.99, change: 0.15 },
    { product: "Sweet Corn", price: 1.79, change: -0.08 },
    { product: "Potatoes", price: 0.99, change: 0.02 }
  ]);
  
  // Sample weather data (would come from API)
  const [weatherData, setWeatherData] = useState({
    temperature: 24,
    condition: "Sunny",
    humidity: 65,
    rainfall: 0,
    forecast: [
      { day: "Tomorrow", temp: 26, condition: "Sunny" },
      { day: "Wed", temp: 25, condition: "Partly Cloudy" },
      { day: "Thu", temp: 22, condition: "Rain" }
    ]
  });
  
  // Sample scheduled activities
  const [activities, setActivities] = useState([
    { date: "2025-04-12", activity: "Fertilize tomato fields" },
    { date: "2025-04-15", activity: "Harvest sweet corn" },
    { date: "2025-04-18", activity: "Equipment maintenance" },
    { date: "2025-04-20", activity: "Market delivery" }
  ]);
  
  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-24">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            Farmer Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.username || "Farmer"}
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today's summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Today</CardTitle>
              <CardDescription>{formattedDate}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-semibold">{weatherData.temperature}°C</p>
                  <p className="text-muted-foreground">{weatherData.condition}</p>
                </div>
                <div className="text-right">
                  <p>Humidity: {weatherData.humidity}%</p>
                  <p>Rainfall: {weatherData.rainfall}mm</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Button>
            </CardFooter>
          </Card>
          
          {/* Crop Status Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Crop Status</CardTitle>
              <CardDescription>Current growing crops</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Growing:</span>
                  <span className="font-medium">{crops.filter(c => c.status === "growing").length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ready to Harvest:</span>
                  <span className="font-medium">{crops.filter(c => c.status === "ready").length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recently Harvested:</span>
                  <span className="font-medium">{crops.filter(c => c.status === "harvested").length}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">
                <Leaf className="h-4 w-4 mr-2" />
                Manage Crops
              </Button>
            </CardFooter>
          </Card>
          
          {/* Market Prices */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Market Prices</CardTitle>
              <CardDescription>Today's trending prices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {marketPrices.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.product}:</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">${item.price.toFixed(2)}</span>
                      <span className={item.change >= 0 ? "text-green-500" : "text-red-500"}>
                        {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Market
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Tabs defaultValue="crops">
          <TabsList className="mb-4">
            <TabsTrigger value="crops">My Crops</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>
          
          <TabsContent value="crops">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>My Crops</CardTitle>
                    <CardDescription>Manage your active crops</CardDescription>
                  </div>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Crop
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crops.map(crop => (
                    <Card key={crop.id} className="overflow-hidden">
                      <div className={`h-2 ${
                        crop.status === "growing" ? "bg-blue-500" : 
                        crop.status === "ready" ? "bg-green-500" : 
                        "bg-amber-500"
                      }`} />
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">{crop.name}</CardTitle>
                        <CardDescription className="capitalize">
                          Status: {crop.status}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Planted</p>
                            <p>{new Date(crop.plantedDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Harvest</p>
                            <p>{crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Quantity</p>
                            <p>{crop.quantity} units</p>
                          </div>
                        </div>
                        {crop.notes && (
                          <div className="mt-2 text-sm">
                            <p className="text-muted-foreground">Notes</p>
                            <p>{crop.notes}</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" size="sm" className="w-full">
                          Manage
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendar & Activities</CardTitle>
                <CardDescription>Upcoming scheduled activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{new Date(activity.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}</p>
                        <p className="text-muted-foreground">{activity.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>Manage your produce inventory</CardDescription>
                  </div>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Inventory management will be available soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Sales History</CardTitle>
                    <CardDescription>Track your produce sales</CardDescription>
                  </div>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Sales history will be available soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
  );
}