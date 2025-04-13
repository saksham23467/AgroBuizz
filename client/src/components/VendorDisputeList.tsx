import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface Dispute {
  id: number;
  vendorId: number;
  farmerId: number;
  title: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  category: 'quality' | 'delivery' | 'payment' | 'other';
  createdAt: string;
  farmerResponse?: string;
  responseDate?: string;
  adminNotes?: string;
  resolution?: string;
  resolvedAt?: string;
}

interface FarmerInfo {
  id: number;
  name: string;
}

export function VendorDisputeList({ farmers }: { farmers: FarmerInfo[] }) {
  const { data: disputes, isLoading, error } = useQuery<{ success: boolean, disputes: Dispute[] }>({
    queryKey: ["/api/vendor/disputes"],
    select: (data) => data,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-destructive">Failed to load disputes</p>
      </div>
    );
  }

  if (!disputes || disputes.disputes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Farmer Disputes</CardTitle>
          <CardDescription>
            You haven't submitted any disputes against farmers yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Helper function to get farmer name
  const getFarmerName = (farmerId: number) => {
    const farmer = farmers.find(f => f.id === farmerId);
    return farmer ? farmer.name : `Farmer #${farmerId}`;
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Open</Badge>;
      case 'investigating':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Investigating</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to get category badge
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'quality':
        return <Badge variant="secondary">Quality</Badge>;
      case 'delivery':
        return <Badge variant="secondary">Delivery</Badge>;
      case 'payment':
        return <Badge variant="secondary">Payment</Badge>;
      default:
        return <Badge variant="secondary">Other</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Farmer Disputes</CardTitle>
        <CardDescription>
          Manage and track your disputes against farmers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Farmer</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Response</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.disputes.map((dispute) => (
              <TableRow key={dispute.id}>
                <TableCell className="font-medium">{dispute.id}</TableCell>
                <TableCell>{getFarmerName(dispute.farmerId)}</TableCell>
                <TableCell>{dispute.title}</TableCell>
                <TableCell>{getCategoryBadge(dispute.category)}</TableCell>
                <TableCell>{format(new Date(dispute.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                <TableCell>
                  {dispute.farmerResponse ? (
                    <Button variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      View Response
                    </Button>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100">
                      <Clock className="h-3 w-3 mr-1" />
                      Waiting
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}