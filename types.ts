
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

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  read: boolean;
  user_id: string;
  created_at: string;
}

export interface Part {
  id: string;
  sku: string;
  name: string;
  category: Category;
  quantity: number;
  min_quantity: number;
  location: string;
  unit: string;
  cost: number;
  supplier: string;
  lead_time: number;
  manufacturer: string;
  model: string;
  specs: Record<string, string>;
  image_url?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Edição' | 'Visualização' | 'Gerente' | 'Técnico';
  status: 'Ativo' | 'Inativo';
  lastAccess: string;
  avatarUrl: string;
  department?: string;
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
  partId?: string;
  partName?: string;
  sku?: string;
  service_code?: string;
  service_description?: string;
  request_category: 'Material' | 'Serviço';
  quantity: number;
  unit: string;
  priority: 'Baixa' | 'Normal' | 'Urgente';
  justification: string;
  status: 'Pendente' | 'Aprovado' | 'Comprado';
  date: string;
  os_number?: string;
  os_type?: 'Ordem Corretiva' | 'Preventiva' | 'Corretiva Não Planejada' | 'Melhoria' | 'Projeto';
  usage_area?: string;
  project_number?: string;
  estimated_value?: number;
  asset_number?: string;
}
