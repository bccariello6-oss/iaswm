
export enum PartStatus {
  IN_STOCK = 'Em Estoque',
  LOW_STOCK = 'Baixo Estoque',
  CRITICAL = 'Crítico',
  ORDERED = 'Solicitado'
}

export enum Category {
  MECHANICAL = 'Mecânica',
  ELECTRICAL = 'Elétrica',
  HYDRAULIC = 'Hidráulica',
  TRANSMISSION = 'Transmissão',
  LUBRICANTS = 'Lubrificantes',
  INSUMOS = 'Insumos'
}

export interface Part {
  id: string;
  sku: string;
  name: string;
  category: Category;
  quantity: number;
  minQuantity: number;
  location: string;
  unit: string;
  cost: number;
  supplier: string;
  leadTime: number;
  manufacturer: string;
  model: string;
  specs: Record<string, string>;
  imageUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Gerente' | 'Técnico';
  status: 'Ativo' | 'Inativo';
  lastAccess: string;
  avatarUrl: string;
}

export interface Movement {
  id: string;
  date: string;
  type: 'Entrada' | 'Saída';
  quantity: number;
  responsible: string;
  ref: string;
  partId: string;
}

export interface PurchaseRequest {
  id: string;
  partId: string;
  partName: string;
  sku: string;
  quantity: number;
  unit: string;
  priority: 'Baixa' | 'Normal' | 'Urgente';
  justification: string;
  status: 'Pendente' | 'Aprovado' | 'Comprado';
  date: string;
}
