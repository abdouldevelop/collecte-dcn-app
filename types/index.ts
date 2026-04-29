export type { Company, Admin, CompanyInvitation, FocalPoint, Unit, Product, CompanyProduct, Period, ImportDeclaration, ExportDeclaration, ImportDeclarationLine, ExportDeclarationLine, Notification, SupportTicket, AuditLog } from "@prisma/client";
export type { Role, InvitationStatus, ProductType, ProductSource, DeclarationStatus, DeclarationType, TicketStatus, TicketPriority } from "@prisma/client";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  pendingInvitations: number;
  submittedDeclarations: number;
  lateCompanies: number;
  completionRate: number;
}

export interface CompanyDashboardData {
  company: {
    id: string;
    name: string;
    email: string;
  };
  period: {
    id: string;
    label: string;
    dueDate: Date | null;
    year: number;
    month: number;
  } | null;
  importStatus: string;
  exportStatus: string;
  importLinesCount: number;
  exportLinesCount: number;
  totalImportProducts: number;
  totalExportProducts: number;
  hasFocalPoint: boolean;
  hasProducts: boolean;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
  }>;
  recentHistory: Array<{
    period: string;
    importStatus: string;
    exportStatus: string;
    submittedAt: Date | null;
  }>;
}

export interface DeclarationLine {
  companyProductId: string;
  productCode: string;
  productDesignation: string;
  observation: string | null;
  priceMin: number | null;
  priceMax: number | null;
  quantity: number | null;
  unitId: string | null;
  lastModified: Date | null;
}
