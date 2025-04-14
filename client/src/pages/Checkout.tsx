import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, CheckCircle, Plus, Minus, X, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// This would come from a global cart state in a real app
const sampleCartItems = [
  { id: 1, type: "seed", name: "Organic Tomato Seeds", price: 25, quantity: 2 },
  { id: 3, type: "equipment", name: "Industrial Tractor (Rental)", price: 500, quantity: 1 },
  { id: 4, type: "produce", name: "Fresh Spinach", price: 12, quantity: 3 },
  { id: 6, type: "produce", name: "Seasonal Strawberries", price: 22, quantity: 1 }
];

// Transaction history would come from the API in a real app
const transactionHistory = [
  { 
    id: 1, 
    date: "2025-03-25", 
    totalAmount: 425, 
    status: "completed",
    items: [
      { name: "Wheat Seeds", quantity: 3, price: 28 },
      { name: "Premium Corn Seeds", quantity: 2, price: 30 },
      { name: "Irrigation System", quantity: 1, price: 250 }
    ]
  },
  { 
    id: 2, 
    date: "2025-03-20", 
    totalAmount: 1220, 
    status: "completed",
    items: [
      { name: "Compact Tractor", quantity: 1, price: 1200 },
      { name: "Organic Lettuce Seeds", quantity: 2, price: 10 }
    ]
  },
  { 
    id: 3, 
    date: "2025-03-15", 
    totalAmount: 87, 
    status: "completed",
    items: [
      { name: "Organic Blueberries", quantity: 2, price: 25 },
      { name: "Fresh Tomatoes", quantity: 3, price: 12 }
    ]
  }
];

const placeOrder = async () => {
  // Replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  return true; // Simulate successful order placement
};


export default function Checkout() {
  const [cartItems, setCartItems] = useState(sampleCartItems);
  const [orderComplete, setOrderComplete] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pointsBalance, setPointsBalance] = useState(2000); // Simulated user points balance
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const { toast } = useToast();

  const updateQuantity = (itemId: number, delta: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleCheckout = async () => {
    const total = calculateSubtotal();

    if (total > pointsBalance) {
      toast({
        title: "Insufficient points",
        description: "You don't have enough points to complete this purchase",
        variant: "destructive"
      });
      return;
    }

    setProcessingOrder(true);
    setProgress(20);

    try {
      const success = await placeOrder();
      setProgress(60);

      if (success) {
        setProgress(100);
        setOrderComplete(true);
        setPointsBalance(prev => prev - total);
        toast({
          title: "Order completed!",
          description: `Your purchase of ${total} points has been processed.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to place order. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  const resetOrder = () => {
    setOrderComplete(false);
    setCartItems([]);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#2E7D32] mb-8">Transaction Center</h1>

      <Tabs defaultValue="cart" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
          <TabsTrigger value="cart">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Transaction History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cart">
          {orderComplete ? (
            <motion.div 
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="border-[#8BC34A]">
                <CardHeader className="bg-[#E8F5E9] border-b border-[#8BC34A]/30">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-[#4CAF50] mr-4" />
                    <div>
                      <CardTitle className="text-2xl text-[#2E7D32]">Order Complete!</CardTitle>
                      <CardDescription>Transaction ID: #{Math.floor(Math.random() * 10000)}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700">Order Summary</h3>
                      <p className="text-sm text-gray-500">{getFormattedDate()}</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantity} x {item.name}</span>
                          <span className="font-medium">{item.price * item.quantity} points</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-[#2E7D32]">{calculateSubtotal()} points</span>
                    </div>

                    <div className="bg-[#F1F8E9] p-4 rounded-lg">
                      <p className="text-[#558B2F] font-medium">Points Balance</p>
                      <p className="text-[#33691E] text-xl font-bold">{pointsBalance} points</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-[#8BC34A]/30 pt-6">
                  <Button 
                    onClick={resetOrder}
                    className="bg-[#4CAF50] hover:bg-[#43A047] text-white"
                  >
                    Continue Shopping
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-[#8BC34A]/30">
                  <CardHeader>
                    <CardTitle className="text-[#2E7D32]">Shopping Cart</CardTitle>
                    <CardDescription>Review your items before checkout</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cartItems.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Your cart is empty</p>
                      </div>
                    ) : (
                      <motion.div 
                        className="space-y-4"
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
                        {cartItems.map(item => (
                          <motion.div 
                            key={item.id}
                            variants={fadeInUp}
                            className="flex items-center p-4 border border-[#8BC34A]/20 rounded-lg hover:border-[#8BC34A]/50 transition-all"
                          >
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <h3 className="font-medium text-[#2E7D32]">{item.name}</h3>
                                <Badge className="ml-2 bg-[#E8F5E9] text-[#33691E]">{item.type}</Badge>
                              </div>
                              <p className="text-sm text-gray-500">{item.price} points per unit</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 rounded-full border-[#8BC34A]/30"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 rounded-full border-[#8BC34A]/30"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="w-24 text-right font-medium">
                              {item.price * item.quantity} points
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="ml-2 text-gray-400 hover:text-red-500"
                              onClick={() => removeItem(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-[#8BC34A]/30 sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-[#2E7D32]">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{calculateSubtotal()} points</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-[#2E7D32]">{calculateSubtotal()} points</span>
                    </div>
                    <div className="bg-[#F1F8E9] p-4 rounded-lg">
                      <p className="text-[#558B2F] font-medium">Points Balance</p>
                      <p className="text-[#33691E] text-xl font-bold">{pointsBalance} points</p>
                    </div>

                    {processingOrder && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 text-center">Processing your order...</p>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-[#FFEB3B] hover:bg-[#FDD835] text-[#33691E] font-bold"
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0 || processingOrder}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {processingOrder ? "Processing..." : "Complete Transaction"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-6">
            <div className="bg-[#F1F8E9] p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-[#2E7D32] font-medium">Current Points Balance</h3>
                  <p className="text-[#33691E] text-2xl font-bold">{pointsBalance} points</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">March 2025</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-[#2E7D32] mb-4">Transaction History</h2>

            <div className="space-y-4">
              {transactionHistory.map(transaction => (
                <Card key={transaction.id} className="border-[#8BC34A]/20 hover:border-[#8BC34A]/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-[#2E7D32]">Order #{transaction.id}</p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#33691E]">{transaction.totalAmount} points</p>
                        <Badge className="bg-green-100 text-green-800">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="link" 
                            className="text-[#4CAF50] p-0" 
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-[#2E7D32]">Order #{selectedTransaction?.id}</DialogTitle>
                            <DialogDescription>
                              {selectedTransaction?.date}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              {selectedTransaction?.items.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{item.quantity} x {item.name}</span>
                                  <span className="font-medium">{item.price * item.quantity} points</span>
                                </div>
                              ))}
                            </div>

                            <Separator />

                            <div className="flex justify-between font-bold">
                              <span>Total</span>
                              <span className="text-[#2E7D32]">{selectedTransaction?.totalAmount} points</span>
                            </div>

                            <div className="bg-green-50 p-3 rounded text-sm text-green-800">
                              Transaction completed successfully
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}