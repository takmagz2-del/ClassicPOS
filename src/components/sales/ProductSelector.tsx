"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { PlusCircle, Plus } from "lucide-react"; // Import Plus icon
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/context/CategoryContext";
import { toast } from "sonner"; // Import toast for feedback

interface ProductSelectorProps {
  products: Product[];
  onAddProductToCart: (product: Product, quantity: number) => void;
}

const ProductSelector = ({ products, onAddProductToCart }: ProductSelectorProps) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("all");
  const [quantities, setQuantities] = React.useState<{ [key: string]: number }>({});
  const { currentCurrency } = useCurrency();
  const { categories, getCategoryName } = useCategories();

  const filteredProducts = products.filter((product) => {
    const matchesSearchTerm =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategoryId === "all" || product.categoryId === selectedCategoryId;

    return matchesSearchTerm && matchesCategory;
  });

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [productId]: isNaN(quantity) ? 0 : quantity,
    }));
  };

  const handleAddToCart = (product: Product, quantityToAdd: number) => {
    if (quantityToAdd <= 0) {
      toast.error("Quantity must be greater than 0.");
      return;
    }
    if (quantityToAdd > product.stock) {
      toast.error(`Not enough stock for ${product.name}. Available: ${product.stock}`);
      return;
    }
    onAddProductToCart(product, quantityToAdd);
    setQuantities((prev) => ({ ...prev, [product.id]: 1 })); // Reset quantity after adding
  };

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>Select Products</CardTitle>
        <div className="flex flex-col gap-2 mt-2">
          <Input
            placeholder="Search products..."
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
        <ScrollArea className="flex-1 pr-4">
          <div className="grid gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between border p-3 rounded-md">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryName(product.categoryId)} | {formatCurrency(product.price, currentCurrency)} | Stock: {product.stock}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={quantities[product.id] || 1}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                      className="w-20 text-center"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product, quantities[product.id] || 1)}
                      disabled={!product.stock || (quantities[product.id] || 1) > product.stock || (quantities[product.id] || 1) <= 0}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleAddToCart(product, 1)} // Quick add 1 item
                      disabled={!product.stock || product.stock < 1}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Quick Add 1</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No products found.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ProductSelector;