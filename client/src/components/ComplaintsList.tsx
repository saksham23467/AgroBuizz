import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

// Types for complaint status
type ComplaintStatus = "unsolved" | "in_progress" | "solved";

// Type for complaints from API
interface Complaint {
  id: number;
  userId: number;
  productId: string;
  vendorId: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  vendorResponse?: string;
  responseDate?: string;
}

// Props for the component
interface ComplaintsListProps {
  userType?: "customer" | "vendor" | "farmer" | "admin";
}

export default function ComplaintsList({ userType = "customer" }: ComplaintsListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [vendorResponse, setVendorResponse] = useState<{ [key: number]: string }>({});
  
  // Determine which API endpoint to use based on user type
  const apiEndpoint = userType === "vendor" 
    ? "/api/vendor/complaints" 
    : "/api/user/complaints";
  
  // Query to fetch complaints
  const { data: complaints, isLoading, error } = useQuery<Complaint[]>({
    queryKey: [apiEndpoint],
    queryFn: getQueryFn(),
    enabled: !!user, // Only run query if user is logged in
  });
  
  // Mutation for adding vendor response
  const addResponseMutation = useMutation({
    mutationFn: async ({ complaintId, response }: { complaintId: number; response: string }) => {
      const res = await apiRequest("POST", `/api/vendor/complaints/${complaintId}`, { response });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add response");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      toast({
        title: "Response added",
        description: "Your response has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add response",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating complaint status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ complaintId, status }: { complaintId: number; status: string }) => {
      const res = await apiRequest("POST", `/api/vendor/complaints/${complaintId}`, { status });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      toast({
        title: "Status updated",
        description: "Complaint status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    },
  });
  
  // Handle response submission
  const handleSubmitResponse = (complaintId: number) => {
    const response = vendorResponse[complaintId];
    if (!response || response.trim() === "") {
      toast({
        title: "Error",
        description: "Response cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    addResponseMutation.mutate({ complaintId, response });
    // Clear the response after submission
    setVendorResponse(prev => ({ ...prev, [complaintId]: "" }));
  };
  
  // Handle status update
  const handleStatusUpdate = (complaintId: number, status: string) => {
    updateStatusMutation.mutate({ complaintId, status });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
        <p className="text-destructive">Failed to load complaints</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
      </div>
    );
  }
  
  // Empty state
  if (!complaints || complaints.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No complaints found</CardTitle>
          <CardDescription>
            {userType === "vendor" 
              ? "You don't have any customer complaints to address."
              : "You haven't submitted any complaints yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {userType === "vendor" 
                ? "Great job! Your customers seem happy with your products."
                : "If you encounter any issues with a product, you can submit a complaint from the product page."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render complaints list
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {userType === "vendor" ? "Customer Complaints" : "Your Complaints"}
      </h2>
      
      <Accordion type="single" collapsible className="w-full">
        {complaints.map((complaint) => (
          <AccordionItem key={complaint.id} value={`complaint-${complaint.id}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-col sm:flex-row sm:items-center w-full text-left gap-2 pr-4">
                <div className="flex-1">
                  <span className="font-medium">{complaint.title}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={
                    complaint.status === "solved" ? "bg-green-500" : 
                    complaint.status === "in_progress" ? "bg-yellow-500" : 
                    "bg-red-500"
                  }>
                    {complaint.status === "unsolved" && "Unsolved"}
                    {complaint.status === "in_progress" && "In Progress"}
                    {complaint.status === "solved" && "Solved"}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(complaint.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="mt-1 text-sm">{complaint.description}</p>
                </div>
                
                {complaint.vendorResponse && (
                  <div className="bg-muted p-3 rounded-md">
                    <h4 className="text-sm font-medium">Vendor Response</h4>
                    <p className="mt-1 text-sm">{complaint.vendorResponse}</p>
                    {complaint.responseDate && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Responded on {format(new Date(complaint.responseDate), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </div>
                )}
                
                {userType === "vendor" && (
                  <div className="pt-2">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Your Response</h4>
                      <Textarea 
                        placeholder="Enter your response to this complaint..."
                        value={vendorResponse[complaint.id] || ""}
                        onChange={(e) => setVendorResponse(prev => ({ 
                          ...prev, 
                          [complaint.id]: e.target.value 
                        }))}
                      />
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSubmitResponse(complaint.id)}
                          disabled={addResponseMutation.isPending}
                        >
                          {addResponseMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Response"
                          )}
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant={complaint.status === "solved" ? "success" : "outline"}
                          onClick={() => handleStatusUpdate(complaint.id, "solved")}
                          disabled={updateStatusMutation.isPending || complaint.status === "solved"}
                        >
                          {updateStatusMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Mark as Solved
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}