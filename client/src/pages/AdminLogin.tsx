import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { LockKeyhole, User } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define admin login form schema
const adminLoginSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, loginMutation } = useAuth();
  const [location, navigate] = useLocation();

  // Redirect to admin dashboard if already logged in as admin
  useEffect(() => {
    if (user && user.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  // Admin login form
  const adminLoginForm = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onAdminLoginSubmit = async (data: AdminLoginFormValues) => {
    setIsSubmitting(true);
    
    try {
      const result = await loginMutation.mutateAsync({ 
        username: data.username, 
        password: data.password 
      });
      
      if (result.role !== "admin") {
        // Handle non-admin user logins by showing specialized error and logging out
        try {
          // Force logout for non-admin users who tried to access admin page
          await fetch("/api/logout", { method: "POST" });
          // Reset query cache for the user query
          queryClient.resetQueries();
        } catch (e) {
          console.error("Failed to force logout:", e);
        }
        throw new Error("Unauthorized: Admin access only");
      }
      
      toast({
        title: "Admin login successful",
        description: "Welcome to the AgroBuizz Admin Dashboard.",
      });
      
      // Redirect to admin dashboard after successful login
      navigate("/admin");
    } catch (error) {
      // Check for unauthorized error specifically
      const errorMessage = error instanceof Error && error.message.includes("Unauthorized")
        ? "You don't have admin privileges. Only admin accounts can access this area."
        : "Invalid admin credentials. Please try again.";
      
      toast({
        title: "Admin Access Denied",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F8E9]">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#33691E] to-[#558B2F] py-8 px-6 text-center">
            <h1 className="text-white text-2xl font-bold">AgroBuizz Admin Portal</h1>
            <p className="text-white/80 mt-2">Secure access for administrators only</p>
          </div>
          
          <div className="p-6">
            <Form {...adminLoginForm}>
              <form onSubmit={adminLoginForm.handleSubmit(onAdminLoginSubmit)} className="space-y-4">
                <FormField
                  control={adminLoginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input className="pl-10" placeholder="Enter admin username" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={adminLoginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            className="pl-10" 
                            type="password" 
                            placeholder="Enter admin password" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#33691E] hover:bg-[#2E7D32]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Admin Login"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Return to <a href="/" className="text-[#43A047] hover:underline">main site</a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}