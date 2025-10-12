"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { PlusCircle } from "lucide-react"; // Corrected PlusCicle to PlusCircle
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductSelectorProps {
  products: Product[];
  onAddProductToCart: (product: Product, quantity: number) => void;
}

const ProductSelector = ({ products, onAddProductToCart }: ProductSelectorProps) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [quantities, setQuantities] = React.useState<{ [key: string]: number }>({});

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [productId]: isNaN(quantity) ? 0 : quantity,
    }));
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > 0 && quantity <= product.stock) {
      onAddProductToCart(product, quantity);
      setQuantities((prev) => ({ ...prev, [product.id]: 1 })); // Reset quantity after adding
    } else if (quantity === 0) {
      // Optionally show a toast for 0 quantity
      // toast.error("Quantity must be greater than 0.");
    } else {
      // toast.error(`Not enough stock for ${product.name}. Available: ${product.stock}`);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Select Products</CardTitle>
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-2"
        />
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-280px)] pr-4"> {/* Adjust height based on header/footer */}
          <div className="grid gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between border p-3 rounded-md">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">${product.price.toFixed(2)} | Stock: {product.stock}</p>
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
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.stock || (quantities[product.id] || 1) > product.stock || (quantities[product.id] || 1) <= 0}
                    >
                      <PlusCircle className="h-4 w-4" />
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