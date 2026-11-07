import { Badge, type BadgeTone } from "@/components/ui/misc";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { type OrderStatus } from "@/server/db/schema";

const tones: Record<OrderStatus, BadgeTone> = {
  PENDING: "caution",
  PAID: "volt",
  SHIPPED: "go",
  CANCELLED: "signal",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={tones[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}
