export interface CheckoutSummaryProps {
  subtotal: number;
  isAuthenticated: boolean;
  isPending: boolean;
  error: string | null;
  onPay: () => void;
}
