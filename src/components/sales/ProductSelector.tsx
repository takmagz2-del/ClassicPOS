"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/context/CategoryContext";
import { toast } from "sonner";
import { ImageIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import ImagePreviewDialog from "@/components/common/ImagePreviewDialog"; // Import the new component
import { Button } from "@/components/ui/button"; // Import Button for Reset Filters
import { Badge } from "@/components/ui/badge"; // Import Badge for stock status

interface ProductSelectorProps {
  products: Product[];
  onAddProductToCart: (product: Product, quantity: number) => void;
}

const LOW_STOCK_THRESHOLD = 10; // Define what "low stock" means

const ProductSelector = ({ products, onAddProductToCart }: ProductSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("all"); // 'all', 'in-stock', 'low-stock', 'out-of-stock'
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]); // Default wide range
  const { currentCurrency } = useCurrency();
  const { categories } = useCategories();
  
  // State for image preview dialog
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageAlt, setPreviewImageAlt] = useState("");

  // Calculate min and max price for slider
  const minPrice = useMemo(() => products.length > 0 ? Math.min(...products.map(p => p.price)) : 0, [products]);
  const maxPrice = useMemo(() => products.length > 0 ? Math.max(...products.map(p => p.price)) : 10000, [products]);

  // Update price range when min/max changes (e.g., on initial load or product updates)
  React.useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearchTerm =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategoryId === "all" || product.categoryId === selectedCategoryId;

      let matchesStockStatus = true;
      if (stockStatusFilter === "in-stock") {
        matchesStockStatus = product.stock > 0;
      } else if (stockStatusFilter === "low-stock") {
        matchesStockStatus = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
      } else if (stockStatusFilter === "out-of-stock") {
        matchesStockStatus = product.stock === 0;
      }

      const matchesPriceRange =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearchTerm && matchesCategory && matchesStockStatus && matchesPriceRange;
    });
  }, [products, searchTerm, selectedCategoryId, stockStatusFilter, priceRange]);

  // Reset filters function
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategoryId("all");
    setStockStatusFilter("all");
    setPriceRange([minPrice, maxPrice]);
  };

  const handleImageClick = (imageUrl: string, altText: string) => {
    setPreviewImageUrl(imageUrl);
    setPreviewImageAlt(altText);
    setIsImagePreviewOpen(true);
  };

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>Select Products</CardTitle>
        <div className="flex flex-col gap-3 mt-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock (&le;{LOW_STOCK_THRESHOLD})</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={resetFilters}
              variant="outline"
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <Label className="text-xs">Price Range: {formatCurrency(priceRange[0], currentCurrency)} - {formatCurrency(priceRange[1], currentCurrency)}</Label>
            <Slider
              min={minPrice}
              max={maxPrice}
              step={0.01}
              value={priceRange}
              onValueChange={(vals) => {
                if (vals.length === 2) {
                  setPriceRange([vals[0], vals[1]]);
                }
              }}
              minStepsBetweenThumbs={1}
              className="py-2"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={cn(
                    "cursor-pointer hover:shadow-lg transition-shadow overflow-hidden",
                    product.stock <= 0 && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (product.stock > 0) {
                      onAddProductToCart(product, 1);
                    } else {
                      toast.error(`${product.name} is out of stock.`);
                    }
                  }}
                >
                  <CardContent className="p-0 flex flex-col items-center text-center">
                    <div 
                      className="w-full h-24 bg-muted flex items-center justify-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event
                        if (product.imageUrl) {
                          handleImageClick(product.imageUrl, product.name);
                        }
                      }}
                    >
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-2 flex-1 w-full">
                      <p className="text-sm font-medium leading-tight truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatCurrency(product.price, currentCurrency)}</p>
                      <p className="text-[0.65rem] text-muted-foreground mt-1">SKU: {product.sku}</p>
                      <p className="text-[0.65rem] text-muted-foreground">
                        Stock: {" "}
                        {product.stock === 0 ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : product.stock <= LOW_STOCK_THRESHOLD ? (
                          <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Low Stock ({product.stock})</Badge>
                        ) : (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white">In Stock ({product.stock})</Badge>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-10">No products match the current filters.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        isOpen={isImagePreviewOpen}
        onClose={() => setIsImagePreviewOpen(false)}
        imageUrl={previewImageUrl}
        altText={previewImageAlt}
      />
    </Card>
  );
};

export default ProductSelector;