import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Auth animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

// Form schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  userType: z.enum(["customer", "vendor", "farmer"])
});

type LoginValues = z.infer<typeof loginSchema>;

const registerSchema = insertUserSchema.pick({
  username: true,
  email: true,
  password: true,
  userType: true
}).extend({
  confirmPassword: z.string(),
  userType: z.enum(["customer", "vendor", "farmer"])
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      userType: "customer"
    }
  });
  
  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: "customer"
    }
  });
  
  // Login form submission
  const onLoginSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    
    try {
      const res = await apiRequest("POST", "/api/login", {
        username: values.username,
        password: values.password,
        userType: values.userType
      });
      
      if (res.ok) {
        toast({
          title: "Login successful",
          description: "Welcome back to AgroBuizz!",
        });
        setLocation("/");
      } else {
        const data = await res.json();
        toast({
          title: "Login failed",
          description: data.message || "Invalid username or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Registration form submission
  const onRegisterSubmit = async (values: RegisterValues) => {
    setIsLoading(true);
    
    try {
      const { confirmPassword, ...userData } = values;
      
      const res = await apiRequest("POST", "/api/register", userData);
      
      if (res.ok) {
        toast({
          title: "Registration successful",
          description: "Your account has been created!",
        });
        setLocation("/");
      } else {
        const data = await res.json();
        toast({
          title: "Registration failed",
          description: data.message || "Failed to create account",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen">
      {/* Auth form section */}
      <motion.div 
        className="flex-1 flex items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to AgroBuizz
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to access your account or create a new one
            </CardDescription>
          </CardHeader>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <CardContent className="pt-6">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Account Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="customer" id="customer" />
                                <label htmlFor="customer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Customer
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="vendor" id="vendor" />
                                <label htmlFor="vendor" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Vendor
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="farmer" id="farmer" />
                                <label htmlFor="farmer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Farmer
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register">
              <CardContent className="pt-6">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="example@agrobuizz.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Account Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="customer" id="r-customer" />
                                <label htmlFor="r-customer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Customer
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="vendor" id="r-vendor" />
                                <label htmlFor="r-vendor" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Vendor
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="farmer" id="r-farmer" />
                                <label htmlFor="r-farmer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Farmer
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>
          <CardFooter className="flex justify-center flex-col space-y-2 text-sm text-center text-muted-foreground">
            <p>
              By continuing, you agree to AgroBuizz's Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Hero section */}
      <motion.div 
        className="hidden md:flex flex-1 bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col justify-center items-center p-8 w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-md space-y-6 text-center"
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl font-bold tracking-tight">AgroBuizz</h1>
              <p className="text-xl mt-2">Connecting Farmers, Vendors and Customers</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">For Customers</h3>
                <p className="text-green-50">Purchase quality agricultural products directly from farmers and trusted vendors.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">For Vendors</h3>
                <p className="text-green-50">Expand your reach and sell agricultural equipment, seeds, and supplies to farmers.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">For Farmers</h3>
                <p className="text-green-50">Sell your produce directly to customers, access equipment, and find quality seeds.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}