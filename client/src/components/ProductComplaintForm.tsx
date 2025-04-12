import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

// Form validation schema
const complaintFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(500),
});

// Types
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
  onCancel,
}: ProductComplaintFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up form with default values
  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  
  // Create complaint mutation
  const createComplaintMutation = useMutation({
    mutationFn: async (values: ComplaintFormValues) => {
      if (!user) throw new Error("You must be logged in to submit a complaint");
      
      const complaint = {
        userId: user.id,
        productId,
        vendorId,
        title: values.title,
        description: values.description,
      };
      
      const res = await apiRequest("POST", "/api/user/complaints", complaint);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit complaint");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/complaints"] });
      toast({
        title: "Complaint submitted",
        description: "Your complaint has been submitted successfully",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit complaint",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });
  
  // Form submission handler
  const onSubmit = async (values: ComplaintFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a complaint",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    createComplaintMutation.mutate(values);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Submit a Complaint</h2>
        <p className="text-sm text-muted-foreground">
          Let us know about any issues with this product
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complaint Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Briefly describe the issue"
                    {...field}
                  />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide details about your issue"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            
            <Button 
              type="submit" 
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
          </div>
        </form>
      </Form>
    </div>
  );
}