import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Users, ShoppingBag, AlertCircle, PlusCircle, Edit, Trash } from "lucide-react";
import ComplaintsList from "@/components/ComplaintsList";
import AnimatedPage from "@/components/AnimatedPage";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// Form schema for adding/editing products
const productFormSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  type: z.enum(["seeds", "equipment", "fertilizer", "pesticide", "other"], {
    required_error: "Please select a product type.",
  }),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, { message: "Price must be at least 0.01." }),
  quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1." }),
  classification: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function VendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isInit, setIsInit] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form setup for adding/editing products
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      type: "seeds",
      description: "",
      price: 0.99,
      quantity: 1,
      classification: "",
    },
  });
  
  useEffect(() => {
    // Set isInit to true after first render to ensure user data is loaded
    setIsInit(true);
    
    // Log for debugging
    if (user) {
      console.log("User loaded successfully:", user.userType);
    } else {
      console.log("No user data available");
    }
  }, [user]);
  
  // Sample vendor products for development
  const sampleProducts: Product[] = [
    {
      productId: "seed1",
      name: "Organic Tomato Seeds",
      type: "seeds",
      description: "High-yield organic tomato seeds",
      price: 5.99,
      quantity: 150,
      classification: "organic"
    },
    {
      productId: "seed2",
      name: "Hybrid Corn Seeds",
      type: "seeds",
      description: "Drought-resistant corn hybrids",
      price: 8.49,
      quantity: 100,
      classification: "hybrid"
    },
    {
      productId: "equip1",
      name: "Garden Tiller",
      type: "equipment",
      description: "Small gas-powered garden tiller",
      price: 299.99,
      quantity: 10
    }
  ];

  // Query vendor products
  const { 
    data: productsResponse, 
    isLoading: isLoadingProducts, 
    error: productsError 
  } = useQuery<{success: boolean, products: Product[]}>({
    queryKey: ["/api/vendor/products"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isInit && !!user,
    retry: 1,
  });
  
  // Extract products from response
  const products = productsResponse?.products || [];
  
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
  
  // Reset form for new product entry
  const resetForm = () => {
    form.reset({
      name: "",
      type: "seeds",
      description: "",
      price: 0.99,
      quantity: 1,
      classification: "",
    });
    setEditingProduct(null);
  };
  
  // Create a mutation for adding products
  const createProductMutation = useMutation({
    mutationFn: async (newProduct: ProductFormValues) => {
      const res = await apiRequest('POST', '/api/vendor/products', {
        name: newProduct.name,
        type: newProduct.type,
        description: newProduct.description,
        price: newProduct.price,
        quantity: newProduct.quantity,
        classification: newProduct.classification || undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor/products'] });
      toast({
        title: "Product added",
        description: "Your product has been added successfully.",
      });
      setShowAddProductDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "There was a problem adding your product.",
        variant: "destructive",
      });
    }
  });
  
  // Create a mutation for updating products
  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, updates }: { productId: string, updates: Partial<ProductFormValues> }) => {
      const res = await apiRequest('PUT', `/api/vendor/products/${productId}`, {
        name: updates.name,
        type: updates.type,
        description: updates.description,
        price: updates.price,
        quantity: updates.quantity,
        classification: updates.classification || undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor/products'] });
      toast({
        title: "Product updated",
        description: "Your product has been updated successfully.",
      });
      setShowAddProductDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your product.",
        variant: "destructive",
      });
    }
  });
  
  // Create a mutation for deleting products
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest('DELETE', `/api/vendor/products/${productId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor/products'] });
      toast({
        title: "Product deleted",
        description: "Your product has been removed.",
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting your product.",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission for adding/editing a product
  const onSubmit = (values: ProductFormValues) => {
    setIsLoading(true);
    
    try {
      if (editingProduct) {
        // Update existing product using mutation
        updateProductMutation.mutate({
          productId: editingProduct.productId,
          updates: values
        });
      } else {
        // Add new product using mutation
        createProductMutation.mutate(values);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your product.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Open dialog for adding a new product
  const handleAddProduct = () => {
    resetForm();
    setShowAddProductDialog(true);
  };
  
  // Open dialog for editing a product
  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p.productId === productId);
    if (product) {
      setEditingProduct(product);
      form.reset({
        name: product.name,
        type: product.type as any, // Type casting needed for type safety
        description: product.description || "",
        price: product.price,
        quantity: product.quantity,
        classification: product.classification || "",
      });
      setShowAddProductDialog(true);
    } else {
      toast({
        title: "Error",
        description: "Could not find the product to edit.",
        variant: "destructive",
      });
    }
  };
  
  // Handle deleting a product
  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };
  
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <CardTitle>Your Products</CardTitle>
                    <CardDescription>
                      Manage your product inventory and listings
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddProduct}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
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
                    <div className="mb-4">
                      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
                    </div>
                    <p>You don't have any products listed yet.</p>
                    <p className="text-sm mt-2">Click the "Add Product" button to get started.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {products.map((product) => (
                      <div key={product.productId} className="py-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {product.type} {product.classification ? `• ${product.classification}` : ""}
                            </p>
                            {product.description && (
                              <p className="mt-2 text-sm">{product.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-medium">${product.price.toFixed(2)}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.quantity} in stock
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditProduct(product.productId)}
                              >
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteProduct(product.productId)}
                              >
                                <Trash className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
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
        
        {/* Add/Edit Product Dialog */}
        <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct 
                  ? 'Update the details of your existing product.' 
                  : 'Add details about your new product to list it for sale.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Organic Tomato Seeds" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="seeds">Seeds</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="fertilizer">Fertilizer</SelectItem>
                          <SelectItem value="pesticide">Pesticide</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0.01" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="classification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classification (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., organic, hybrid, etc." {...field} />
                      </FormControl>
                      <FormDescription>
                        Additional categorization to help customers find your product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add detailed information about your product..." 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setShowAddProductDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || createProductMutation.isPending || updateProductMutation.isPending}
                  >
                    {isLoading || createProductMutation.isPending || updateProductMutation.isPending 
                      ? 'Saving...' 
                      : editingProduct 
                        ? 'Update Product' 
                        : 'Add Product'
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}