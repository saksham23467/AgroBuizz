import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Define the form schema
const disputeFormSchema = z.object({
  farmerId: z.number({
    required_error: "Please select a farmer to dispute",
  }),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["quality", "delivery", "payment", "other"], {
    required_error: "Please select a dispute category",
  }),
});

type DisputeFormValues = z.infer<typeof disputeFormSchema>;

interface FarmerOption {
  id: number;
  name: string;
}

interface VendorDisputeFormProps {
  farmers: FarmerOption[];
  onSuccess?: () => void;
}

export function VendorDisputeForm({ farmers, onSuccess }: VendorDisputeFormProps) {
  const { toast } = useToast();
  
  const form = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  
  const onSubmit = async (data: DisputeFormValues) => {
    try {
      const response = await apiRequest("POST", "/api/vendor/disputes", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit dispute");
      }
      
      // Show success message
      toast({
        title: "Dispute Submitted",
        description: "Your dispute has been successfully submitted",
      });
      
      // Reset form
      form.reset();
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/disputes"] });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit dispute",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Dispute Against Farmer</CardTitle>
        <CardDescription>
          Use this form to submit a formal dispute against a farmer. Please provide detailed information 
          to help us resolve the issue quickly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="farmerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farmer</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the farmer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {farmers.map((farmer) => (
                        <SelectItem key={farmer.id} value={farmer.id.toString()}>
                          {farmer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dispute Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dispute category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="quality">Quality Issues</SelectItem>
                      <SelectItem value="delivery">Delivery Problems</SelectItem>
                      <SelectItem value="payment">Payment Disputes</SelectItem>
                      <SelectItem value="other">Other Issues</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dispute Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a clear title for your dispute" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dispute Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed information about the issue"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit Dispute"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}