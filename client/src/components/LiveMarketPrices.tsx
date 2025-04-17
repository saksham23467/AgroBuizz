import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, RefreshCw, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface ProductPrice {
  id: number;
  name: string;
  price: number;
  change: number;
  availability: 'high' | 'medium' | 'low';
}

interface LiveMarketPricesProps {
  categoryId?: 'seeds' | 'equipment' | 'produce';
  title?: string;
  description?: string;
  limit?: number;
}

export default function LiveMarketPrices({
  categoryId,
  title = "Live Market Prices",
  description = "Real-time agricultural market prices with automatic updates",
  limit = 5
}: LiveMarketPricesProps) {
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket connection established for market prices");
      // Request initial market prices
      ws.send(JSON.stringify({
        type: 'market_price_request',
        categoryId: categoryId
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'market_price_update') {
          setPrices(data.products.slice(0, limit));
          setLoading(false);
          setError(null);
          setIsRefreshing(false);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        setError("Failed to parse market data");
        setLoading(false);
        setIsRefreshing(false);
      }
    };
    
    ws.onerror = () => {
      setError("Failed to connect to market data service");
      setLoading(false);
      setIsRefreshing(false);
    };
    
    ws.onclose = () => {
      console.log("WebSocket connection closed for market prices");
    };
    
    setSocket(ws);
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [categoryId, limit, toast]);

  // Function to refresh prices
  const refreshPrices = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsRefreshing(true);
      socket.send(JSON.stringify({
        type: 'market_price_request',
        categoryId: categoryId
      }));
    } else {
      toast({
        title: "Connection Error",
        description: "Cannot refresh prices. Connection to market service lost.",
        variant: "destructive",
      });
    }
  };

  // Set up auto-refresh interval (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'market_price_request',
          categoryId: categoryId
        }));
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [socket, categoryId]);

  // Get badge color based on availability
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshPrices}
            disabled={loading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array(limit).fill(0).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <Skeleton className="h-6 w-[80px]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500">
            <AlertCircle className="h-10 w-10 mb-2 text-red-500" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshPrices}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {prices.map((product) => (
              <div key={product.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Badge 
                      variant="outline"
                      className={`mr-2 capitalize ${getAvailabilityColor(product.availability)}`}
                    >
                      {product.availability}
                    </Badge>
                    <span>ID: {product.id}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
                  <div className={`flex items-center text-sm ${
                    product.change > 0 
                      ? 'text-green-600' 
                      : product.change < 0 
                        ? 'text-red-600'
                        : 'text-gray-500'
                  }`}>
                    {product.change > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : product.change < 0 ? (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    ) : null}
                    {Math.abs(product.change).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
            
            {prices.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No market data available
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}