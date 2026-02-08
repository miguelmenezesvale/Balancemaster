
export enum Payer {
  MANAGER = 'GERENTE_SOCIO',
  COMPANY = 'EMPRESA'
}

export enum DocType {
  INVOICE = 'FATURA',
  BANK_STATEMENT = 'EXTRATO',
  REPAYMENT = 'REEMBOLSO',
  OTHER = 'OUTRO'
}

export enum Sphere {
  COMPANY = 'EMPRESA',
  PERSONAL = 'PESSOAL'
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  sphere: Sphere;
}

export interface Category {
  id: string;
  name: string;
}

export interface GoogleDriveConfig {
  isEnabled: boolean;
  accessToken: string;
  expiresAt: number;
  clientId?: string;
  businessFileId?: string;
  personalFileId?: string;
  userEmail?: string;
}

export interface TelegramConfig {
  isEnabled: boolean;
  botToken: string;
  backupEnabled: boolean;
  backupChatId?: string;
}

export interface AccountingDocument {
  id: string;
  docType: DocType;
  sphere: Sphere;
  date: string;
  supplier: string;
  documentNumber?: string;
  totalAmount: number;
  vatAmount: number;
  vatDeductibility: number;
  category: string;
  payer: Payer;
  fileName: string;
  fileData?: string;
  timestamp: number;
  drivePath: string;
  source?: 'manual' | 'import';
  syncedToCloud?: boolean;
}

export interface InvoiceExtractionResult {
  date: string;
  supplier: string;
  documentNumber?: string;
  totalAmount: number;
  vatAmount: number;
  vatDeductibility: number;
  category: string;
}
