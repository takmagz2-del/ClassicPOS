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
import { toast } from "sonner";
import { useSales } from "@/context/SaleContext";
import { useProducts } from "@/context/ProductContext";
import CustomerSelector from "@/components/sales/CustomerSelector";
import { useCustomers } from "@/context/CustomerContext";
import SaleConfirmationDialog from "@/components/sales/SaleConfirmationDialog";
import DiscountInput from "@/components/sales/DiscountInput";
import LoyaltyPointsInput from "@/components/sales/LoyaltyPointsInput";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import ReceiptPreviewDialog from "@/components/sales/ReceiptPreviewDialog";
import { useTax } from "@/context/TaxContext";
import { PaymentMethod } from "@/types/payment";
import { Printer, Scan } from "lucide-react";
import SaleRightPanelTabs from "@/components/sales/SaleRightPanelTabs";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import BarcodeScannerDialog from "@/components/sales/BarcodeScannerDialog";
import { InventoryHistoryType } from "@/types/inventory"; // Import InventoryHistoryType

const Sales = () => {
  const { salesHistory, addSale } = useSales();
  const { products, updateProductStock } = useProducts(); // Use the refactored updateProductStock
  const { customers, updateCustomerLoyaltyPoints } = useCustomers();
  const { currentCurrency } = useCurrency();
  const { defaultTaxRate } = useTax();
  const isMobile = useIsMobile();

  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [appliedGiftCardAmount, setAppliedGiftCardAmount] = useState<number>(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState<boolean>(false);
  const [paymentMethodToConfirm, setPaymentMethodToConfirm] = useState<PaymentMethod | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [appliedLoyaltyPoints, setAppliedLoyaltyPoints] = useState<number>(0);
  const [loyaltyPointsDiscountAmount, setLoyaltyPointsDiscountAmount] = useState<number>(0);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState<boolean>(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showReprintButton, setShowReprintButton] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const calculateSubtotal = (items: SaleItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const currentSubtotal = calculateSubtotal(cartItems);
  const calculatedDiscountAmount = currentSubtotal * (discountPercentage / 100);
  const subtotalAfterDiscount = currentSubtotal - calculatedDiscountAmount - loyaltyPointsDiscountAmount;
  const currentTax = subtotalAfterDiscount * defaultTaxRate.rate;
  const currentTotalBeforeGiftCard = subtotalAfterDiscount + currentTax;
  const currentFinalTotal = Math.max(0, currentTotalBeforeGiftCard - appliedGiftCardAmount);


  const handleAddProductToCart = (product: Product, quantity: number) => {
    const existingItemIndex = cartItems.findIndex((item) => item.productId === product.id);

    if (existingItemIndex > -1) {
      const updatedCart = cartItems.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = item.quantity + quantity;
          if (product.trackStock && newQuantity > product.stock) {
            toast.error(`Cannot add more than available stock for ${product.name}. Available: ${product.stock}`);
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      setCartItems(updatedCart);
    } else {
      if (product.trackStock && quantity > product.stock) {
        toast.error(`Cannot add more than available stock for ${product.name}. Available: ${product.stock}`);
        return;
      }
      setCartItems((prev) => [...prev, { productId: product.id, name: product.name, price: product.price, cost: product.cost, quantity }]);
    }
    toast.success(`${quantity}x ${product.name} added to cart.`);
    setAppliedGiftCardAmount(0);
    setAppliedLoyaltyPoints(0);
    setLoyaltyPointsDiscountAmount(0);
  };

  const handleUpdateCartItemQuantity = (productId: string, newQuantity: number) => {
    const productInStock = products.find(p => p.id === productId);
    if (!productInStock) return;

    if (newQuantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    if (productInStock.trackStock && newQuantity > productInStock.stock) {
      toast.error(`Cannot set quantity higher than available stock for ${productInStock.name}. Available: ${productInStock.stock}`);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
    setAppliedGiftCardAmount(0);
    setAppliedLoyaltyPoints(0);
    setLoyaltyPointsDiscountAmount(0);
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    toast.info("Item removed from cart.");
    setAppliedGiftCardAmount(0);
    setAppliedLoyaltyPoints(0);
    setLoyaltyPointsDiscountAmount(0);
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedGiftCardAmount(0);
    setSelectedCustomerId(null);
    setDiscountPercentage(0);
    setAppliedLoyaltyPoints(0);
    setLoyaltyPointsDiscountAmount(0);
    setShowReprintButton(false);
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
    if (points === 0) {
      setAppliedLoyaltyPoints(0);
      setLoyaltyPointsDiscountAmount(0);
    }
  };

  const handleSelectCustomer = (customerId: string | null) => {
    setSelectedCustomerId(customerId);
    setAppliedLoyaltyPoints(0);
    setLoyaltyPointsDiscountAmount(0);
  };

  const finalizeSale = (paymentMethodId: string, cashReceived?: number) => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Add items before checking out.");
      return;
    }

    if (currentFinalTotal < 0) {
      toast.error("Gift card amount exceeds total. Please adjust.");
      return;
    }

    if (paymentMethodToConfirm?.isCredit && !selectedCustomer) {
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
      status: paymentMethodToConfirm?.isCredit ? "pending" : "completed",
      type: "sale",
      giftCardAmountUsed: appliedGiftCardAmount,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
      discountAmount: discountPercentage > 0 ? calculatedDiscountAmount : undefined,
      loyaltyPointsUsed: appliedLoyaltyPoints > 0 ? appliedLoyaltyPoints : undefined,
      taxRateApplied: defaultTaxRate.rate,
      paymentMethodId: paymentMethodId,
    };

    addSale(newSale);

    if (selectedCustomer && appliedLoyaltyPoints > 0) {
      updateCustomerLoyaltyPoints(selectedCustomer.id, -appliedLoyaltyPoints);
    }

    if (selectedCustomer) {
      const pointsEarned = Math.floor(subtotalAfterDiscount);
      if (pointsEarned > 0) {
        updateCustomerLoyaltyPoints(selectedCustomer.id, pointsEarned);
        toast.info(`${pointsEarned} loyalty points earned!`);
      }
    }

    cartItems.forEach(soldItem => {
      const product = products.find(p => p.id === soldItem.productId);
      if (product && product.trackStock) { // Only update stock if tracking is enabled
        updateProductStock(
          product.id,
          product.stock - soldItem.quantity,
          InventoryHistoryType.SALE,
          newSale.id,
          `Sold ${soldItem.quantity}x ${soldItem.name} in Sale ID: ${newSale.id.substring(0, 8)}`
        );
      }
    });

    setLastSale(newSale);
    setIsReceiptDialogOpen(true);
    setShowReprintButton(true);

    handleClearCart();
    toast.success(`${paymentMethodToConfirm?.isCredit ? "Credit Sale" : "Sale"} #${newSale.id.substring(0, 8)} completed via ${paymentMethodToConfirm?.name}! Total: ${formatCurrency(newSale.total, currentCurrency)}`);
    if (cashReceived !== undefined && cashReceived > currentFinalTotal) {
      const change = cashReceived - currentFinalTotal;
      toast.info(`Change due: ${formatCurrency(change, currentCurrency)}`);
    }
    setIsConfirmationDialogOpen(false);
  };

  const openConfirmationDialog = (method: PaymentMethod) => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Add items before checking out.");
      return;
    }
    setPaymentMethodToConfirm(method);
    setIsConfirmationDialogOpen(true);
  };

  const handleReprintReceipt = () => {
    if (lastSale) {
      setIsReceiptDialogOpen(true);
    }
  };

  const handleBarcodeScanSuccess = (decodedText: string) => {
    const product = products.find(p => p.sku === decodedText);
    if (product) {
      if (!product.availableForSale) {
        toast.error(`${product.name} is not available for sale.`);
        return;
      }
      if (product.trackStock && product.stock <= 0) {
        toast.error(`${product.name} is out of stock.`);
        return;
      }
      handleAddProductToCart(product, 1);
    } else {
      toast.error(`Product with SKU "${decodedText}" not found.`);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">New Sale</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
            <Scan className="mr-2 h-4 w-4" /> Scan Barcode
          </Button>
          {showReprintButton && lastSale && (
            <Button onClick={handleReprintReceipt} variant="outline">
              <Printer className="mr-2 h-4 w-4" /> Re-print Receipt
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto">
        {/* Left Panel: Customer Selector & Product Selector */}
        <div className="flex flex-col gap-4 md:col-span-1 lg:col-span-2">
          <CustomerSelector
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={handleSelectCustomer}
          />
          <ProductSelector products={products} onAddProductToCart={handleAddProductToCart} />
        </div>

        {/* Right Panel (Desktop/Tablet) */}
        {!isMobile && (
          <div className="md:col-span-1 lg:col-span-1 flex flex-col">
            <SaleRightPanelTabs
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateCartItemQuantity}
              onRemoveItem={handleRemoveCartItem}
              onApplyDiscount={handleApplyDiscount}
              currentDiscountPercentage={discountPercentage}
              currentSaleSubtotal={currentSubtotal}
              selectedCustomer={selectedCustomer}
              onApplyLoyaltyPoints={handleApplyLoyaltyPoints}
              availableLoyaltyPoints={selectedCustomer?.loyaltyPoints || 0}
              appliedLoyaltyPoints={appliedLoyaltyPoints}
              loyaltyPointsDiscountAmount={loyaltyPointsDiscountAmount}
              onApplyGiftCard={handleApplyGiftCard}
              currentSaleTotalBeforeGiftCard={currentTotalBeforeGiftCard}
              appliedGiftCardAmount={appliedGiftCardAmount}
              taxRate={defaultTaxRate.rate}
              currentFinalTotal={currentFinalTotal}
              onSelectPaymentMethod={openConfirmationDialog}
              onClearCart={handleClearCart}
              hasItemsInCart={cartItems.length > 0}
            />
          </div>
        )}
      </div>

      {/* Mobile Checkout Drawer (Sticky Footer) */}
      {isMobile && (
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 z-10">
          <Drawer>
            <DrawerTrigger asChild>
              <Button className="w-full h-12 text-lg" disabled={cartItems.length === 0}>
                Checkout {formatCurrency(currentFinalTotal, currentCurrency)}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Complete Sale</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
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
                    availablePoints={selectedCustomer?.loyaltyPoints || 0}
                    onApplyPoints={handleApplyLoyaltyPoints}
                    currentSaleTotal={currentTotalBeforeGiftCard - loyaltyPointsDiscountAmount}
                    appliedPoints={appliedLoyaltyPoints}
                  />
                )}
                <GiftCardInput
                  onApplyGiftCard={handleApplyGiftCard}
                  currentSaleTotal={currentTotalBeforeGiftCard - loyaltyPointsDiscountAmount}
                  appliedGiftCardAmount={appliedGiftCardAmount}
                />
                <SaleSummary
                  subtotal={currentSubtotal}
                  taxRate={defaultTaxRate.rate}
                  giftCardAmountUsed={appliedGiftCardAmount}
                  discountPercentage={discountPercentage}
                  discountAmount={calculatedDiscountAmount}
                  loyaltyPointsDiscountAmount={loyaltyPointsDiscountAmount}
                />
                <PaymentMethodButtons
                  onSelectPaymentMethod={openConfirmationDialog}
                  onClearCart={handleClearCart}
                  hasItemsInCart={cartItems.length > 0}
                  finalTotal={currentFinalTotal}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      )}

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
            loyaltyPointsUsed: appliedLoyaltyPoints,
            loyaltyPointsDiscountAmount: loyaltyPointsDiscountAmount,
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

      <BarcodeScannerDialog
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleBarcodeScanSuccess}
      />
    </div>
  );
};

export default Sales;