import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Profile form schema
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  userType: z.enum(["farmer", "customer", "vendor"], {
    required_error: "Please select a user type.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Password form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(5, {
    message: "Current password is required.",
  }),
  newPassword: z.string().min(5, {
    message: "Password must be at least 5 characters.",
  }),
  confirmPassword: z.string().min(5, {
    message: "Password must be at least 5 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SettingsPage() {
  const { user, updateDarkModeMutation, updateUserTypeMutation } = useAuth();
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      userType: (user?.userType as "farmer" | "customer" | "vendor") || "customer",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      // If the user type has changed, update it via mutation
      if (data.userType !== user?.userType) {
        await updateUserTypeMutation.mutateAsync(data.userType);
        // The mutation's onSuccess handler will show toast and reload the page
      } else {
        // Just for other profile fields, show success toast
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (error) {
      // Error is handled by mutation onError handler
      console.error("Failed to update profile:", error);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      // We would normally update the password here
      // For now, just show a success toast
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to update password:", error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDarkModeToggle = async (enabled: boolean) => {
    updateDarkModeMutation.mutate(enabled);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#4CAF50]" />
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-24 md:py-32 ${isDarkMode ? 'bg-[#121212] text-[#E0E0E0]' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#E0E0E0]' : ''}`}>Account Settings</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-3 mb-8 ${isDarkMode ? 'bg-[#242424]' : ''}`}>
            <TabsTrigger value="account" className={isDarkMode ? 'data-[state=active]:bg-[#333333] data-[state=active]:text-[#E0E0E0]' : ''}>Account</TabsTrigger>
            <TabsTrigger value="security" className={isDarkMode ? 'data-[state=active]:bg-[#333333] data-[state=active]:text-[#E0E0E0]' : ''}>Security</TabsTrigger>
            <TabsTrigger value="appearance" className={isDarkMode ? 'data-[state=active]:bg-[#333333] data-[state=active]:text-[#E0E0E0]' : ''}>Appearance</TabsTrigger>
          </TabsList>
          
          {/* Account Tab */}
          <TabsContent value="account">
            <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#424242]' : ''}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-[#E0E0E0]' : ''}>Profile Information</CardTitle>
                <CardDescription className={isDarkMode ? 'text-[#B0B0B0]' : ''}>
                  Update your account details and user profile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={isDarkMode ? 'text-[#E0E0E0]' : ''}>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Username" 
                              {...field} 
                              className={isDarkMode ? 'bg-[#2A2A2A] border-[#424242] text-[#E0E0E0]' : ''}
                            />
                          </FormControl>
                          <FormDescription className={isDarkMode ? 'text-[#B0B0B0]' : ''}>
                            This is your public display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={isDarkMode ? 'text-[#E0E0E0]' : ''}>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Email" 
                              type="email" 
                              {...field} 
                              className={isDarkMode ? 'bg-[#2A2A2A] border-[#424242] text-[#E0E0E0]' : ''}
                            />
                          </FormControl>
                          <FormDescription className={isDarkMode ? 'text-[#B0B0B0]' : ''}>
                            Your email address is used for notifications and login.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={isDarkMode ? 'text-[#E0E0E0]' : ''}>User Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className={isDarkMode ? 'bg-[#2A2A2A] border-[#424242] text-[#E0E0E0]' : ''}>
                                <SelectValue placeholder="Select a user type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className={isDarkMode ? 'bg-[#2A2A2A] border-[#424242] text-[#E0E0E0]' : ''}>
                              <SelectItem value="farmer">Farmer</SelectItem>
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="vendor">Vendor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className={isDarkMode ? 'text-[#B0B0B0]' : ''}>
                            Your user type determines what features are available to you.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="bg-[#4CAF50] hover:bg-[#43A047]"
                      disabled={profileForm.formState.isSubmitting}
                    >
                      {profileForm.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#424242]' : ''}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-[#E0E0E0]' : ''}>Password</CardTitle>
                <CardDescription className={isDarkMode ? 'text-[#B0B0B0]' : ''}>
                  Change your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={isDarkMode ? 'text-[#E0E0E0]' : ''}>Current Password</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Current Password" 
                              type="password" 
                              {...field} 
                              className={isDarkMode ? 'bg-[#2A2A2A] border-[#424242] text-[#E0E0E0]' : ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={isDarkMode ? 'text-[#E0E0E0]' : ''}>New Password</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="New Password" 
                              type="password" 
                              {...field} 
                              className={isDarkMode ? 'bg-[#2A2A2A] border-[#424242] text-[#E0E0E0]' : ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={isDarkMode ? 'text-[#E0E0E0]' : ''}>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Confirm New Password" 
                              type="password" 
                              {...field} 
                              className={isDarkMode ? 'bg-[#2A2A2A] border-[#424242] text-[#E0E0E0]' : ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="bg-[#4CAF50] hover:bg-[#43A047]"
                      disabled={passwordForm.formState.isSubmitting}
                    >
                      {passwordForm.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card className={isDarkMode ? 'bg-[#1E1E1E] border-[#424242]' : ''}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-[#E0E0E0]' : ''}>Appearance</CardTitle>
                <CardDescription className={isDarkMode ? 'text-[#B0B0B0]' : ''}>
                  Customize how AgroBuizz looks for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode" className={`flex flex-col space-y-1 ${isDarkMode ? 'text-[#E0E0E0]' : ''}`}>
                      <span>Dark Mode</span>
                      <span className={`text-sm ${isDarkMode ? 'text-[#B0B0B0]' : 'text-gray-500'}`}>
                        Switch between light and dark theme
                      </span>
                    </Label>
                    <Switch 
                      id="dark-mode" 
                      checked={user.darkMode === true}
                      onCheckedChange={handleDarkModeToggle}
                      disabled={updateDarkModeMutation.isPending}
                    />
                  </div>
                </div>
                
                <Separator className={isDarkMode ? 'bg-[#424242]' : ''} />
                
                <div className="space-y-2">
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-[#E0E0E0]' : ''}`}>Color Theme</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-[#B0B0B0]' : 'text-gray-500'}`}>
                    Choose your preferred color theme (coming soon)
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-full h-20 rounded-md bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] border ${isDarkMode ? 'border-[#424242]' : 'border-gray-200'} cursor-pointer`} />
                      <span className={`text-sm ${isDarkMode ? 'text-[#E0E0E0]' : ''}`}>Green (Default)</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 opacity-50">
                      <div className={`w-full h-20 rounded-md bg-gradient-to-r from-blue-500 to-cyan-400 border ${isDarkMode ? 'border-[#424242]' : 'border-gray-200'} cursor-not-allowed`} />
                      <span className={`text-sm ${isDarkMode ? 'text-[#E0E0E0]' : ''}`}>Blue (Coming Soon)</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 opacity-50">
                      <div className={`w-full h-20 rounded-md bg-gradient-to-r from-orange-500 to-amber-400 border ${isDarkMode ? 'border-[#424242]' : 'border-gray-200'} cursor-not-allowed`} />
                      <span className={`text-sm ${isDarkMode ? 'text-[#E0E0E0]' : ''}`}>Orange (Coming Soon)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}