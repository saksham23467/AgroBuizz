import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Users, ShoppingBag, AlertCircle } from "lucide-react";
import ComplaintsList from "@/components/ComplaintsList";
import AnimatedPage from "@/components/AnimatedPage";

// Types for API responses
interface Product {
  productId: string;
  name: string;
  type: string;
  description?: string;
  price: number;
  quantity: number;
  classification?: string;
}

export default function VendorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Query vendor products
  const { 
    data: products, 
    isLoading: isLoadingProducts, 
    error: productsError 
  } = useQuery<Product[]>({
    queryKey: ["/api/vendor/products"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && user.userType === "vendor",
  });
  
  // Helper function to count products by type
  const countProductsByType = (products: Product[] | undefined) => {
    if (!products) return {};
    return products.reduce((acc, product) => {
      acc[product.type] = (acc[product.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };
  
  // Count products by type
  const productsByType = countProductsByType(products);
  
  // Total inventory value
  const totalInventoryValue = products?.reduce(
    (sum, product) => sum + product.price * product.quantity, 
    0
  ) || 0;
  
  if (!user || user.userType !== "vendor") {
    return (
      <AnimatedPage>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You need to be logged in as a vendor to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6">
                <AlertCircle className="h-12 w-12 text-destructive mb-2" />
                <p>Please login with a vendor account to view your dashboard.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AnimatedPage>
    );
  }
  
  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.username}. Manage your products and customer queries.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Active Products Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      Active Products
                    </CardTitle>
                    <CardDescription>
                      Total products in your inventory
                    </CardDescription>
                  </div>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingProducts ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : productsError ? (
                    <div className="text-destructive">Failed to load</div>
                  ) : (
                    <div className="text-2xl font-bold">{products?.length || 0}</div>
                  )}
                </CardContent>
              </Card>
              
              {/* Inventory Value Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      Inventory Value
                    </CardTitle>
                    <CardDescription>
                      Total value of your inventory
                    </CardDescription>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  {isLoadingProducts ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : productsError ? (
                    <div className="text-destructive">Failed to load</div>
                  ) : (
                    <div className="text-2xl font-bold">
                      ${totalInventoryValue.toFixed(2)}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Customer Queries Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      Customer Queries
                    </CardTitle>
                    <CardDescription>
                      Open customer complaints
                    </CardDescription>
                  </div>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Product Categories Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>
                  Breakdown of your products by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : productsError ? (
                  <div className="text-center text-destructive">
                    Failed to load product categories
                  </div>
                ) : Object.keys(productsByType).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(productsByType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">{type}</span>
                        <span>{count} products</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No product categories to display
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>
                  Manage your product inventory and listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : productsError ? (
                  <div className="text-center py-8 text-destructive">
                    Failed to load your products. Please try again.
                  </div>
                ) : !products || products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    You don't have any products listed yet.
                  </div>
                ) : (
                  <div className="divide-y">
                    {products.map((product) => (
                      <div key={product.productId} className="py-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {product.type} {product.classification ? `• ${product.classification}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-medium">${product.price}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.quantity} in stock
                              </div>
                            </div>
                          </div>
                        </div>
                        {product.description && (
                          <p className="mt-2 text-sm">{product.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Complaints Tab */}
          <TabsContent value="complaints" className="space-y-4">
            <ComplaintsList userType="vendor" />
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
  );
}