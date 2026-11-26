import type { BouquetConfiguration } from "@/types/bouquet";

export type BouquetSubmission = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerMessage?: string;
  configuration: BouquetConfiguration;
  previewImageUrl?: string;
  estimatedPrice: number;
  status: "pending_review" | "accepted" | "changes_requested" | "rejected";
  createdAt: string;
};
