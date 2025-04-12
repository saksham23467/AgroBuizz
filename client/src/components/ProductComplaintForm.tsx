import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Define the form schema
const complaintFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type ComplaintFormValues = z.infer<typeof complaintFormSchema>;

type ProductComplaintFormProps = {
  productId: string;
  vendorId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function ProductComplaintForm({
  productId,
  vendorId,
  onSuccess,
  onCancel
}: ProductComplaintFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      title: "",
      description: ""
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: ComplaintFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", `/api/products/${productId}/complaints`, {
        ...values,
        vendorId
      });
      
      if (response.ok) {
        toast({
          title: "Complaint submitted",
          description: "Your complaint has been submitted successfully. The vendor will respond shortly.",
        });
        
        // Invalidate complaints cache
        queryClient.invalidateQueries({ queryKey: ["/api/user/complaints"] });
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Reset form
        form.reset();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit complaint");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit complaint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Submit a Complaint</CardTitle>
        <CardDescription>
          Report an issue with this product. The vendor will review your complaint.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Briefly describe the issue" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a clear title for your complaint
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
                      placeholder="Describe the issue in detail" 
                      className="min-h-32 resize-y"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Please provide details about the issue (order number, date, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Complaint"
                )}
              </Button>
              
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>Your complaint will be reviewed within 24-48 hours.</p>
      </CardFooter>
    </Card>
  );
}