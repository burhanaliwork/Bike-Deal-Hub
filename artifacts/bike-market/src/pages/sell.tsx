import { useState } from "react";
import { useLocation, Redirect } from "wouter";
import { Show } from "@clerk/react";
import { useCreateBike, getListBikesQueryKey, getGetMyBikesQueryKey } from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Bike, Phone, Tag, DollarSign, Image, FileText } from "lucide-react";

export default function SellPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const createBike = useCreateBike();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    brand: "",
    phone: "",
    imageUrl: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.category || !form.condition || !form.phone) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createBike.mutate(
      {
        data: {
          title: form.title,
          description: form.description || undefined,
          price: parseFloat(form.price),
          category: form.category,
          condition: form.condition,
          brand: form.brand || undefined,
          phone: form.phone,
          imageUrl: form.imageUrl || undefined,
        },
      },
      {
        onSuccess: (newBike) => {
          qc.invalidateQueries({ queryKey: getListBikesQueryKey() });
          qc.invalidateQueries({ queryKey: getGetMyBikesQueryKey() });
          toast({ title: "Listing posted successfully!" });
          navigate("/my-listings");
        },
        onError: () => {
          toast({ title: "Failed to post listing. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">Sell Your Bike</h1>
          <p className="text-muted-foreground">Post your bike for free and connect with buyers directly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Bike className="w-5 h-5 text-primary" /> Bike Details
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="e.g. Trek Mountain Bike 2022 — 26 inch"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category <span className="text-red-500">*</span></Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mountain">Mountain</SelectItem>
                    <SelectItem value="road">Road</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="bmx">BMX</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Condition <span className="text-red-500">*</span></Label>
                <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="brand">Brand</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="brand"
                    placeholder="Trek, Giant, Cannondale..."
                    className="pl-9"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price">Price (SAR) <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    className="pl-9"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  placeholder="Describe the bike — size, year, accessories, why you're selling..."
                  className="pl-9 min-h-[100px]"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="imageUrl">Image URL</Label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/bike-photo.jpg"
                  className="pl-9"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">Paste a direct link to your bike's photo</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" /> Contact Information
            </h2>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05XXXXXXXX"
                  className="pl-9 text-lg font-medium"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Buyers will contact you at this number</p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={createBike.isPending}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-md"
          >
            {createBike.isPending ? "Posting..." : "Post Listing for Free"}
          </Button>
        </form>
      </div>
    </div>
  );
}
