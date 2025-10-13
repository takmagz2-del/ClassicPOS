"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { Edit, Trash2, ImageIcon, ArrowUpDown } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { useCategories } from "@/context/CategoryContext";
import ImagePreviewDialog from "@/components/common/ImagePreviewDialog"; // Import the new component
import { cn } from "@/lib/utils";

interface ProductTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onSort: (key: keyof Product) => void;
  sortKey: keyof Product;
  sortOrder: "asc" | "desc";
}

const ProductTable = ({ products, onEditProduct, onDeleteProduct, onSort, sortKey, sortOrder }: ProductTableProps) => {
  const { currentCurrency } = useCurrency();
  const { getCategoryName } = useCategories();
  
  // State for image preview dialog
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageAlt, setPreviewImageAlt] = useState("");

  const handleImageClick = (imageUrl: string, altText: string) => {
    setPreviewImageUrl(imageUrl);
    setPreviewImageAlt(altText);
    setIsImagePreviewOpen(true);
  };

  const renderSortIcon = (key: keyof Product) => {
    if (sortKey === key) {
      return sortOrder === "asc" ? (
        <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      );
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100" />;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("name")}
                className="group px-0 hover:bg-transparent"
              >
                Name
                {renderSortIcon("name")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("categoryId")}
                className="group px-0 hover:bg-transparent"
              >
                Category
                {renderSortIcon("categoryId")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("sku")}
                className="group px-0 hover:bg-transparent"
              >
                SKU
                {renderSortIcon("sku")}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                onClick={() => onSort("price")}
                className="group px-0 hover:bg-transparent justify-end"
              >
                Price
                {renderSortIcon("price")}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                onClick={() => onSort("stock")}
                className="group px-0 hover:bg-transparent justify-end"
              >
                Stock
                {renderSortIcon("stock")}
              </Button>
            </TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div 
                    className="w-16 h-16 bg-muted flex items-center justify-center rounded-md overflow-hidden cursor-pointer"
                    onClick={() => {
                      if (product.imageUrl) {
                        handleImageClick(product.imageUrl, product.name);
                      }
                    }}
                  >
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell className="text-right">{formatCurrency(product.price, currentCurrency)}</TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell className="text-center flex justify-center items-center space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => onEditProduct(product)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDeleteProduct(product)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No products found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        isOpen={isImagePreviewOpen}
        onClose={() => setIsImagePreviewOpen(false)}
        imageUrl={previewImageUrl}
        altText={previewImageAlt}
      />
    </div>
  );
};

export default ProductTable;