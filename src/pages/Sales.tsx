"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { Sale, SaleItem } from "@/types/sale";
import ProductSelector from "@/components/sales/ProductSelector";
import SaleCart from "@/components/sales/SaleCart";
import SaleSummary from "@/components/sales/SaleSummary";
import GiftCardInput from "@/components/sales/GiftCardInput";
import PaymentMethodButtons from "@/components/sales/PaymentMethodButtons";
import BNPLButtons from "@/components/sales/BNPLButtons"; // Import the new BNPLButtons component
import { toast } from "sonner";
import { useSales } from "@/context/SaleContext";

// Mock products (should ideally come from a global state or API)
const mockProducts: Product[] = [
  { id: "1", name: "Laptop Pro", category: "Electronics", price: 1200.00, stock: 15, sku: "LP-001" },
  { id: "2", name: "Wireless Mouse", category: "Accessories", price: 25.50, stock: 50, sku: "WM-002" },
  { id: "3", name: "Mechanical Keyboard", category: "Accessories", price: 75.00, stock: 30, sku: "MK-003" },
  { id: "4", name: "USB-C Hub", category: "Accessories", price: 40.00, stock: 20, sku: "UH-004" },
  { id: "5", name: "External SSD 1TB", category: "Storage", price: 150.00, stock: 10, sku: "ES-005" },
  { id: "6", name: "Monitor 27-inch", category: "Electronics", price: 300.00, stock: 10, sku: "MON-006" },
  { id: "7", name: "Webcam HD", category: "Accessories", price: 50.00, stock: 25, sku: "WC-007" },
  { id: "8", name: "Desk Chair Ergonomic", category: "Furniture", price: 250.00, stock: 5, sku: "DCE-008" },
];

const TAX_RATE = 0.08; // 8% tax rate

const Sales = () => {
  const { logout } = useAuth();
  const { addSale } = useSales();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [appliedGiftCardAmount, setAppliedGiftCardAmount] = useState<number>(0);

  const calculateSubtotal = (items: SaleItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const currentSubtotal = calculateSubtotal(cartItems);
  const currentTax = currentSubtotal * TAX_RATE;
  const currentTotalBeforeGiftCard = currentSubtotal + currentTax;
  const currentFinalTotal = Math.max(0, currentTotalBeforeGiftCard - appliedGiftCardAmount);


  const handleAddProductToCart = (product: Product, quantity: number) => {
    const existingItemIndex = cartItems.findIndex((item) => item.productId === product.id);

    if (existingItemIndex > -1) {
      const updatedCart = cartItems.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = item.quantity + quantity;
          if (newQuantity > product.stock) {
            toast.error(`Cannot add more than available stock for ${product.name}. Available: ${product.stock}`);
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      setCartItems(updatedCart);
    } else {
      if (quantity > product.stock) {
        toast.error(`Cannot add more than available stock for ${product.name}. Available: ${product.stock}`);
        return;
      }
      setCartItems((prev) => [...prev, { productId: product.id, name: product.name, price: product.price, quantity }]);
    }
    toast.success(`${quantity}x ${product.name} added to cart.`);
    setAppliedGiftCardAmount(0);
  };

  const handleUpdateCartItemQuantity = (productId: string, newQuantity: number) => {
    const productInStock = products.find(p => p.id === productId);
    if (!productInStock) return;

    if (newQuantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    if (newQuantity > productInStock.stock) {
      toast.error(`Cannot set quantity higher than available stock for ${productInStock.name}. Available: ${productInStock.stock}`);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
    setAppliedGiftCardAmount(0);
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    toast.info("Item removed from cart.");
    setAppliedGiftCardAmount(0);
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedGiftCardAmount(0);
    toast.info("Cart cleared.");
  };

  const handleApplyGiftCard = (code: string, amount: number) => {
    setAppliedGiftCardAmount((prev) => prev + amount);
  };

  const processSale = (paymentMethod: string) => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Add items before checking out.");
      return;
    }

    if (currentFinalTotal < 0) {
      toast.error("Gift card amount exceeds total. Please adjust.");
      return;
    }

    const newSale: Sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: cartItems,
      subtotal: currentSubtotal,
      tax: currentTax,
      total: currentFinalTotal,
      status: "completed",
      giftCardAmountUsed: appliedGiftCardAmount,
    };

    addSale(newSale);

    const updatedProducts = products.map(p => {
      const soldItem = cartItems.find(item => item.productId === p.id);
      if (soldItem) {
        return { ...p, stock: p.stock - soldItem.quantity };
      }
      return p;
    });
    setProducts(updatedProducts);

    handleClearCart();
    toast.success(`Sale #${newSale.id.substring(0, 8)} completed via ${paymentMethod}! Total: $${newSale.total.toFixed(2)}`);
  };

  const handleProcessSale = () => processSale("Cash/Card");
  const handleApplePay = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Add items before checking out.");
      return;
    }
    toast.info("Initiating Apple Pay...");
    // In a real app, you'd integrate with Apple Pay SDK here
    processSale("Apple Pay");
  };
  const handleGooglePay = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Add items before checking out.");
      return;
    }
    toast.info("Initiating Google Pay...");
    // In a real app, you'd integrate with Google Pay SDK here
    processSale("Google Pay");
  };

  const handleAfterpay = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Add items before checking out.");
      return;
    }
    toast.info("Initiating Afterpay...");
    // Integrate Afterpay SDK here
    processSale("Afterpay");
  };

  const handleKlarna = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Add items before checking out.");
      return;
    }
    toast.info("Initiating Klarna...");
    // Integrate Klarna SDK here
    processSale("Klarna");
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Terminal</h1>
        <Button onClick={logout} variant="destructive">
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        <div className="md:col-span-1">
          <ProductSelector products={products} onAddProductToCart={handleAddProductToCart} />
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">
          <SaleCart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartItemQuantity}
            onRemoveItem={handleRemoveCartItem}
          />
          <GiftCardInput
            onApplyGiftCard={handleApplyGiftCard}
            currentSaleTotal={currentTotalBeforeGiftCard}
            appliedGiftCardAmount={appliedGiftCardAmount}
          />
          <SaleSummary
            subtotal={currentSubtotal}
            taxRate={TAX_RATE}
            giftCardAmountUsed={appliedGiftCardAmount}
          />
          <PaymentMethodButtons
            onProcessSale={handleProcessSale}
            onApplePay={handleApplePay}
            onGooglePay={handleGooglePay}
            onClearCart={handleClearCart}
            hasItemsInCart={cartItems.length > 0}
            finalTotal={currentFinalTotal}
          />
          <BNPLButtons
            onAfterpay={handleAfterpay}
            onKlarna={handleKlarna}
            hasItemsInCart={cartItems.length > 0}
            finalTotal={currentFinalTotal}
          />
        </div>
      </div>
    </div>
  );
};

export default Sales;