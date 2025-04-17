import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const waitlistFormSchema = z.object({
  name: z.string().min(2, { message: "Please enter your name" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  reason: z.string().min(1, { message: "Please select an option" }),
  userType: z.string().min(1, { message: "Please select your role" }),
  notifications: z.boolean().optional(),
});

type WaitlistFormValues = z.infer<typeof waitlistFormSchema>;

export default function WaitlistSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      name: "",
      email: "",
      reason: "",
      userType: "",
      notifications: false,
    },
  });

  const onSubmit = async (data: WaitlistFormValues) => {
    try {
      await apiRequest("POST", "/api/waitlist", data);
      setFormSubmitted(true);
      toast({
        title: "Success!",
        description: "You've been added to our waitlist.",
      });
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    form.reset();
    setFormSubmitted(false);
  };

  return (
    <section id="waitlist" className="py-20 bg-[#F1F8E9]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#2E7D32]">Join the AgroBuizz Waitlist</h2>
            <p className="text-xl text-gray-700">Be among the first to access our agricultural marketplace platform when we launch.</p>
          </motion.div>

          <Card className="shadow-xl border border-[#8BC34A]/30 rounded-xl">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {!formSubmitted ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your name" 
                                  className="px-4 py-3 rounded-lg" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Email Address</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="you@example.com" 
                                  className="px-4 py-3 rounded-lg" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="userType"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-sm font-medium text-gray-700">I am a:</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="farmer" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Farmer</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="merchant" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Merchant/Buyer</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="supplier" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Agricultural Supplier</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="other" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Other</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">What interests you most about AgroBuizz?</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="px-4 py-3 rounded-lg">
                                    <SelectValue placeholder="Select an option" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="buying">Buying agricultural products</SelectItem>
                                  <SelectItem value="selling">Selling my farm produce</SelectItem>
                                  <SelectItem value="equipment">Finding farming equipment</SelectItem>
                                  <SelectItem value="insights">Market insights and data</SelectItem>
                                  <SelectItem value="community">Connecting with other farmers/buyers</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="h-5 w-5 mt-1"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm text-gray-600">
                                  I agree to receive agricultural product updates and announcements. You can unsubscribe at any time.
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#FFEB3B] hover:bg-[#FDD835] text-[#33691E] font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                        >
                          Join Waitlist
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-8 space-y-4"
                  >
                    <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto border-2 border-[#8BC34A]">
                      <CheckCircle2 className="h-8 w-8 text-[#4CAF50]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#2E7D32]">You're on the list!</h3>
                    <p className="text-gray-700 text-lg">Thank you for joining the AgroBuizz waitlist. We'll notify you when we launch.</p>
                    <Button 
                      variant="link" 
                      onClick={resetForm}
                      className="text-[#4CAF50] hover:text-[#2E7D32] font-medium mt-4"
                    >
                      Add another email
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
