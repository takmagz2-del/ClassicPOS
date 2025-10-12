"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { Sale, SaleItem } from "@/types/sale";
import ProductSelector from "@/components/sales/ProductSelector";
import SaleCart from "@/components/sales/SaleCart";
import SaleSummary from "@/components/sales/SaleSummary";
import GiftCardInput from "@/components/sales/GiftCardInput";
import PaymentMethodButtons from "@/components/sales/PaymentMethodButtons";
import BNPLButtons from "@/components/sales/BNPLButtons";
import { toast } from "sonner";
import { useSales } from "@/context/SaleContext";
import { useProducts } from "@/context/ProductContext";
import CustomerSelector from "@/components/sales/CustomerSelector";
import { useCustomers } from "@/context/CustomerContext";
import SaleConfirmationDialog from "@/components/sales/SaleConfirmationDialog";
import DiscountInput from "@/components/sales/DiscountInput";
import LoyaltyPointsInput from "@/components/sales/LoyaltyPointsInput"; // New import
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import ReceiptPreviewDialog from "@/components/sales/ReceiptPreviewDialog";
import { useTax } from "@/context/TaxContext";

const Sales = () => {
  const { salesHistory, addSale } = useSales();
  const { products, updateProductStock } = useProducts();
  const { customers, updateCustomerLoyaltyPoints } = useCustomers(); // Use updateCustomerLoyaltyPoints
  const { currentCurrency } = useCurrency();
  const { defaultTaxRate } = useTax();

  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [appliedGiftCardAmount, setAppliedGiftCardAmount] = useState<number>(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState<boolean>(false);
  const [paymentMethodToConfirm, setPaymentMethodToConfirm] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [appliedLoyaltyPoints, setAppliedLoyaltyPoints] = useState<number>(0); // New state for applied loyalty points
  const [loyaltyPointsDiscountAmount, setLoyaltyPointsDiscountAmount] = useState<number>(0); // New state for loyalty points discount amount
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState<boolean>(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const calculateSubtotal = (items: SaleItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const currentSubtotal = calculateSubtotal(cartItems);
  const calculatedDiscountAmount = currentSubtotal * (discountPercentage / 100);
  const subtotalAfterDiscount = currentSubtotal - calculatedDiscountAmount - loyaltyPointsDiscountAmount; // Apply loyalty points discount here
  const currentTax = subtotalAfterDiscount * defaultTaxRate.rate;
  const currentTotalBeforeGiftCard = subtotalAfterDiscount + currentTax;
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
    setAppliedLoyaltyPoints(0); // Reset loyalty points on cart change
    setLoyaltyPointsDiscountAmount(0);
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
    setAppliedLoyaltyPoints(0); // Reset loyalty points on cart change
    setLoyaltyPointsDiscountAmount(0);
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    toast.info("Item removed from cart.");
    setAppliedGiftCardAmount(0);
    setAppliedLoyaltyPoints(0); // Reset loyalty points on cart change
    setLoyaltyPointsDiscountAmount(0);
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedGiftCardAmount(0);
    setSelectedCustomerId(null);
    setDiscountPercentage(0);
    setAppliedLoyaltyPoints(0); // Clear applied loyalty points
    setLoyaltyPointsDiscountAmount(0); // Clear loyalty points discount
    toast.info("Cart cleared.");
  };

  const handleApplyGiftCard = (code: string, amount: number) => {
    setAppliedGiftCardAmount((prev) => prev + amount);
  };

  const handleApplyDiscount = (percentage: number) => {
    setDiscountPercentage(percentage);
  };

  const handleApplyLoyaltyPoints = (points: number, equivalentAmount: number) => {
    setAppliedLoyaltyPoints(points);
    setLoyaltyPointsDiscountAmount(equivalentAmount);
  };

  const finalizeSale = (paymentMethod: string, cashReceived?: number) => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Add items before checking out.");
      return;
    }

    if (currentFinalTotal < 0) {
      toast.error("Gift card amount exceeds total. Please adjust.");
      return;
    }

    // For credit sales, a customer must be selected
    if (paymentMethod === "Credit Account" && !selectedCustomer) {
      toast.error("A customer must be selected for a credit sale.");
      return;
    }

    const newSale: Sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: cartItems,
      subtotal: currentSubtotal,
      tax: currentTax,
      total: currentFinalTotal,
      status: paymentMethod === "Credit Account" ? "pending" : "completed",
      type: "sale",
      giftCardAmountUsed: appliedGiftCardAmount,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
      discountAmount: discountPercentage > 0 ? calculatedDiscountAmount : undefined,
      loyaltyPointsUsed: appliedLoyaltyPoints > 0 ? appliedLoyaltyPoints : undefined, // Store used loyalty points
      taxRateApplied: defaultTaxRate.rate,
      paymentMethod: paymentMethod,
    };

    addSale(newSale);

    // Deduct loyalty points from customer if used
    if (selectedCustomer && appliedLoyaltyPoints > 0) {
      updateCustomerLoyaltyPoints(selectedCustomer.id, -appliedLoyaltyPoints);
    }

    // Award new loyalty points (e.g., 1 point per $1 spent on subtotal after discounts, before tax)
    if (selectedCustomer) {
      const pointsEarned = Math.floor(subtotalAfterDiscount); // Example: 1 point per dollar
      if (pointsEarned > 0) {
        updateCustomerLoyaltyPoints(selectedCustomer.id, pointsEarned);
        toast.info(`${pointsEarned} loyalty points earned!`);
      }
    }

    cartItems.forEach(soldItem => {
      const product = products.find(p => p.id === soldItem.productId);
      if (product) {
        updateProductStock(product.id, product.stock - soldItem.quantity);
      }
    });

    setLastSale(newSale);
    setIsReceiptDialogOpen(true);

    handleClearCart();
    toast.success(`${paymentMethod === "Credit Account" ? "Credit Sale" : "Sale"} #${newSale.id.substring(0, 8)} completed via ${paymentMethod}! Total: ${formatCurrency(newSale.total, currentCurrency)}`);
    if (cashReceived !== undefined && cashReceived > currentFinalTotal) {
      const change = cashReceived - currentFinalTotal;
      toast.info(`Change due: ${formatCurrency(change, currentCurrency)}`);
    }
    setIsConfirmationDialogOpen(false);
  };

  const openConfirmationDialog = (method: string) => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Add items before checking out.");
      return;
    }
    setPaymentMethodToConfirm(method);
    setIsConfirmationDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">New Sale</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-y-auto">
        <div className="md:col-span-1 flex flex-col gap-4 flex-1">
          <CustomerSelector
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
          />
          <ProductSelector products={products} onAddProductToCart={handleAddProductToCart} />
        </div>
        <div className="md:col-span-2 flex flex-col gap-4 flex-1">
          <SaleCart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartItemQuantity}
            onRemoveItem={handleRemoveCartItem}
          />
          <DiscountInput
            onApplyDiscount={handleApplyDiscount}
            currentDiscountPercentage={discountPercentage}
            currentSaleSubtotal={currentSubtotal}
          />
          {selectedCustomer && (
            <LoyaltyPointsInput
              availablePoints={selectedCustomer.loyaltyPoints}
              onApplyPoints={handleApplyLoyaltyPoints}
              currentSaleTotal={currentTotalBeforeGiftCard - loyaltyPointsDiscountAmount} // Pass remaining total
              appliedPoints={appliedLoyaltyPoints}
            />
          )}
          <GiftCardInput
            onApplyGiftCard={handleApplyGiftCard}
            currentSaleTotal={currentTotalBeforeGiftCard - loyaltyPointsDiscountAmount} // Pass remaining total
            appliedGiftCardAmount={appliedGiftCardAmount}
          />
          <SaleSummary
            subtotal={currentSubtotal}
            taxRate={defaultTaxRate.rate}
            giftCardAmountUsed={appliedGiftCardAmount}
            discountPercentage={discountPercentage}
            discountAmount={calculatedDiscountAmount}
            loyaltyPointsDiscountAmount={loyaltyPointsDiscountAmount} // Pass loyalty points discount
          />
          <PaymentMethodButtons
            onProcessSale={() => openConfirmationDialog("Cash/Card")}
            onApplePay={() => openConfirmationDialog("Apple Pay")}
            onGooglePay={() => openConfirmationDialog("Google Pay")}
            onCreditSale={() => openConfirmationDialog("Credit Account")}
            onClearCart={handleClearCart}
            hasItemsInCart={cartItems.length > 0}
            finalTotal={currentFinalTotal}
          />
          <BNPLButtons
            onAfterpay={() => openConfirmationDialog("Afterpay")}
            onKlarna={() => openConfirmationDialog("Klarna")}
            hasItemsInCart={cartItems.length > 0}
            finalTotal={currentFinalTotal}
          />
        </div>
      </div>

      {isConfirmationDialogOpen && paymentMethodToConfirm && (
        <SaleConfirmationDialog
          isOpen={isConfirmationDialogOpen}
          onClose={() => setIsConfirmationDialogOpen(false)}
          onConfirmSale={finalizeSale}
          saleDetails={{
            items: cartItems,
            subtotal: currentSubtotal,
            tax: currentTax,
            total: currentFinalTotal,
            giftCardAmountUsed: appliedGiftCardAmount,
            customer: selectedCustomer,
            discountPercentage: discountPercentage,
            discountAmount: calculatedDiscountAmount,
            loyaltyPointsUsed: appliedLoyaltyPoints, // Pass loyalty points used
            loyaltyPointsDiscountAmount: loyaltyPointsDiscountAmount, // Pass loyalty points discount amount
            taxRateApplied: defaultTaxRate.rate,
          }}
          paymentMethod={paymentMethodToConfirm}
        />
      )}

      {lastSale && (
        <ReceiptPreviewDialog
          isOpen={isReceiptDialogOpen}
          onClose={() => setIsReceiptDialogOpen(false)}
          sale={lastSale}
          customer={selectedCustomer}
        />
      )}
    </div>
  );
};

export default Sales;