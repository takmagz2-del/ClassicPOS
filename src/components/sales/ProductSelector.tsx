"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/context/CategoryContext";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductSelectorProps {
  products: Product[];
  onAddProductToCart: (product: Product, quantity: number) => void;
}

const ProductSelector = ({ products, onAddProductToCart }: ProductSelectorProps) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("all");
  const { currentCurrency } = useCurrency();
  const { categories } = useCategories();

  const filteredProducts = products.filter((product) => {
    const matchesSearchTerm =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategoryId === "all" || product.categoryId === selectedCategoryId;

    return matchesSearchTerm && matchesCategory;
  });

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>Select Products</CardTitle>
        <div className="flex flex-col gap-2 mt-2">
          <Input
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
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
                    <div className="w-full h-24 bg-muted flex items-center justify-center">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-2 flex-1 w-full">
                      <p className="text-sm font-medium leading-tight truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatCurrency(product.price, currentCurrency)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-10">No products found.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ProductSelector;