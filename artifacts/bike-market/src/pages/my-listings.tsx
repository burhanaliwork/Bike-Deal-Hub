import { useState } from "react";
import { Link, Redirect } from "wouter";
import { Show, useUser } from "@clerk/react";
import { useGetMyBikes, useDeleteBike, useUpdateBike, getGetMyBikesQueryKey, getListBikesQueryKey } from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import { StatusBadge } from "@/components/bike-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Bike, Trash2, Edit, Phone, Eye } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function MyListingsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: bikes, isLoading } = useGetMyBikes();
  const deleteBike = useDeleteBike();
  const updateBike = useUpdateBike();

  const handleDelete = (id: number) => {
    deleteBike.mutate({ id }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMyBikesQueryKey() });
        qc.invalidateQueries({ queryKey: getListBikesQueryKey() });
        toast({ title: "Listing deleted" });
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  };

  const handleMarkSold = (id: number) => {
    updateBike.mutate({ id, data: { } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMyBikesQueryKey() });
        toast({ title: "Marked as sold" });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-1">My Listings</h1>
            <p className="text-muted-foreground">Manage your bike listings</p>
          </div>
          <Link href="/sell">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <PlusCircle className="w-4 h-4" />
              Post New Bike
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-4 flex gap-4">
                <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !bikes || bikes.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <Bike className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-6">Post your first bike and start selling!</p>
            <Link href="/sell">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <PlusCircle className="w-4 h-4" />
                Post a Bike
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bikes.map((bike: any) => (
              <div key={bike.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex gap-4 p-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {bike.imageUrl ? (
                      <img src={bike.imageUrl} alt={bike.title} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bike className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{bike.title}</h3>
                      <StatusBadge status={bike.status} />
                    </div>
                    <div className="text-xl font-bold text-primary mb-1">SAR {Number(bike.price).toLocaleString()}</div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      {bike.phone}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Posted {new Date(bike.createdAt).toLocaleDateString("en-SA")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-t border-border">
                  <Link href={`/listings/${bike.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8">
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                  </Link>
                  {bike.status !== "sold" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 h-8 text-gray-600"
                      onClick={() => handleMarkSold(bike.id)}
                    >
                      Mark as Sold
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5 h-8 text-destructive hover:text-destructive ml-auto">
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove "{bike.title}" from the marketplace.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(bike.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
