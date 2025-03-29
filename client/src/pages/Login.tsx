import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Lock, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define login form schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  rememberMe: z.boolean().default(false),
});

// Define registration form schema
const registerSchema = z.object({
  fullName: z.string().min(3, {
    message: "Full name must be at least 3 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  userType: z.enum(["farmer", "merchant"], {
    required_error: "Please select a user type",
  }),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Login() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, loginMutation, registerMutation } = useAuth();
  const [location, navigate] = useLocation();
  
  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      userType: "farmer",
      agreeTerms: true,
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    
    try {
      await loginMutation.mutateAsync({ 
        username: data.username, 
        password: data.password 
      });
      
      toast({
        title: "Login successful!",
        description: "Welcome back to AgroBuizz.",
      });
      
      // Redirect to home page after successful login
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Map form data to registerMutation expected format
      await registerMutation.mutateAsync({
        username: data.username,
        email: data.email,
        password: data.password,
        role: "user",
        userType: data.userType === "merchant" ? "vendor" : "farmer",
        darkMode: false
      });
      
      toast({
        title: "Registration successful!",
        description: "Your account has been created. You can now login.",
      });
      
      // Switch to login tab after successful registration
      setActiveTab("login");
      registerForm.reset();
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] py-8 px-6 text-center">
              <h1 className="text-white text-2xl font-bold">Welcome to AgroBuizz</h1>
              <p className="text-white/80 mt-2">The agricultural marketplace platform</p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full rounded-none">
                <TabsTrigger value="login" className="rounded-none data-[state=active]:bg-[#F1F8E9] data-[state=active]:text-[#2E7D32]">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-none data-[state=active]:bg-[#F1F8E9] data-[state=active]:text-[#2E7D32]">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="p-6">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" placeholder="Enter your username" {...field} />
                            </div>
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
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                className="pl-10 pr-10" 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter your password" 
                                {...field} 
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm cursor-pointer">Remember me</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <Button variant="link" className="p-0 h-auto text-sm text-[#4CAF50]">
                        Forgot password?
                      </Button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#4CAF50] hover:bg-[#43A047]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                    
                    <div className="relative my-6">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                        OR CONTINUE WITH
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" type="button" className="border-gray-300">
                        Google
                      </Button>
                      <Button variant="outline" type="button" className="border-gray-300">
                        Facebook
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register" className="p-6">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
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
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword ? "text" : "password"} 
                                  placeholder="Choose a password" 
                                  {...field} 
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
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
                              <div className="relative">
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"} 
                                  placeholder="Confirm password" 
                                  {...field} 
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I am a</FormLabel>
                          <FormControl>
                            <RadioGroup
                              className="flex space-x-4"
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="farmer" id="farmer" />
                                <label htmlFor="farmer" className="cursor-pointer text-sm">Farmer</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="merchant" id="merchant" />
                                <label htmlFor="merchant" className="cursor-pointer text-sm">Merchant</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="agreeTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm">
                              I agree to the <a href="#" className="text-[#4CAF50] hover:underline">Terms of Service</a> and <a href="#" className="text-[#4CAF50] hover:underline">Privacy Policy</a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#4CAF50] hover:bg-[#43A047]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}