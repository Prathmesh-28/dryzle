export const inr = (n: number | string | undefined | null) => {
  const v = typeof n === "string" ? Number(n) : (n ?? 0);
  if (Number.isNaN(v)) return "₹0";
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export const fmtDateTime = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export const statusColor = (status: string): string => {
  switch (status) {
    case "PLACED":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "ACCEPTED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PICKED_UP":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "READY":
      return "bg-green-100 text-green-800 border-green-200";
    case "OUT_FOR_DELIVERY":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const ORDER_FLOW = [
  "PLACED",
  "ACCEPTED",
  "PICKED_UP",
  "IN_PROGRESS",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;
