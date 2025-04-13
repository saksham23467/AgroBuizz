import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VendorDisputeForm } from "./VendorDisputeForm";
import { VendorDisputeList } from "./VendorDisputeList";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface Farmer {
  id: number;
  name: string;
}

export function DisputeTabs() {
  const [activeTab, setActiveTab] = useState("view");
  
  // Mock farmer data - in a real application, this would be fetched from an API
  // This is just for demonstration purposes
  const { data: farmers, isLoading, error } = useQuery({
    queryKey: ["/api/farmers"],
    queryFn: async () => {
      // Since we don't have a real API endpoint for this yet,
      // we'll use mock data for demonstration
      // In a real app, this would be replaced with a real API call
      return [
        { id: 1, name: "John Smith" },
        { id: 2, name: "Maria Garcia" },
        { id: 3, name: "Robert Johnson" },
        { id: 4, name: "Sophia Chen" }
      ] as Farmer[];
    },
    // Make sure this query doesn't refresh frequently
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
  
  const handleSuccess = () => {
    // Switch to the "view" tab after successful submission
    setActiveTab("view");
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !farmers) {
    return (
      <div className="text-center py-4 text-red-500">
        Failed to load farmer data. Please try again later.
      </div>
    );
  }
  
  return (
    <Tabs
      defaultValue="view"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="view">View Disputes</TabsTrigger>
        <TabsTrigger value="create">Create Dispute</TabsTrigger>
      </TabsList>
      
      <TabsContent value="view" className="p-1">
        <VendorDisputeList farmers={farmers} />
      </TabsContent>
      
      <TabsContent value="create" className="p-1">
        <VendorDisputeForm farmers={farmers} onSuccess={handleSuccess} />
      </TabsContent>
    </Tabs>
  );
}