
import { Part, Category, PartStatus, User, Movement, PurchaseRequest } from './types';

export const MOCK_PARTS: Part[] = [
  {
    id: '1',
    sku: 'BR-045-22',
    name: 'Rolamento SKF 6204',
    category: Category.MECHANICAL,
    quantity: 12,
    minQuantity: 5,
    location: 'Estante A-04',
    unit: 'UN',
    cost: 45.00,
    supplier: 'Mecânica Express',
    leadTime: 3,
    manufacturer: 'SKF',
    model: '6204-2Z',
    specs: { 'Diâmetro': '20mm', 'Largura': '14mm', 'Blindagem': 'ZZ' }
  },
  {
    id: '2',
    sku: 'TR-102-99',
    name: 'Correia V B-45',
    category: Category.TRANSMISSION,
    quantity: 2,
    minQuantity: 4,
    location: 'Estante B-01',
    unit: 'UN',
    cost: 85.50,
    supplier: 'Correias Sul',
    leadTime: 5,
    manufacturer: 'Gates',
    model: 'Hi-Power II',
    specs: { 'Perfil': 'B', 'Comprimento': '45 polegadas' }
  },
  {
    id: '3',
    sku: 'EL-882-10',
    name: 'Sensor Indutivo M12',
    category: Category.ELECTRICAL,
    quantity: 0,
    minQuantity: 2,
    location: 'Almox. Central',
    unit: 'UN',
    cost: 120.00,
    supplier: 'Eletro Peças',
    leadTime: 2,
    manufacturer: 'Pepperl+Fuchs',
    model: 'NBB4-12GM50-E2',
    specs: { 'Saída': 'PNP NO', 'Alcance': '4mm' }
  },
  {
    id: '4',
    sku: 'MTR-552-X',
    name: 'Motor Trifásico WEG 5CV',
    category: Category.MECHANICAL,
    quantity: 4,
    minQuantity: 2,
    location: 'B-04',
    unit: 'UN',
    cost: 1250.00,
    supplier: 'EletroIndustrial Ltda',
    leadTime: 5,
    manufacturer: 'WEG',
    model: 'W22 Premium',
    specs: { 'Potência': '5 CV / 3.7 kW', 'Voltagem': '220/380/440V', 'Peso': '32 kg' },
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhVrsGqcVG1rz0--shCobmsNenOU35meUdnXAUi_12sVi25gjhusv8f8-xajAEY4PxB21XDuMho8EP7DTypiz-tD9XMDimFCwcI0mW5xB6tpQE50e2iEAfefftWB9CqH7L8h4IeunKgRYNbS_KwBJRRIhnsC6TcV0Mmg-ioeSqK_TW1lmeZ8o8Qj0GXLlAlEu62B-0DQdPDwJzxP_DRgb-n9kggVVaLe30tMTGVfQ_ZBjbZ5hTgYiFhBKzUH7zs-CfsYVPbBUi9Q'
  },
  {
      id: '5',
      sku: 'LU-101-20L',
      name: 'Óleo Hidráulico ISO 68',
      category: Category.LUBRICANTS,
      quantity: 40,
      minQuantity: 50,
      location: 'Depósito Externo',
      unit: 'L',
      cost: 18.50,
      supplier: 'Petro Lub',
      leadTime: 7,
      manufacturer: 'Ipiranga',
      model: 'Ipitur AW 68',
      specs: { 'Viscosidade': '68 cSt', 'Volume': '20L' }
  }
];

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Roberto Silva',
    email: 'roberto.silva@empresa.com',
    role: 'Gerente',
    status: 'Ativo',
    lastAccess: 'Hoje, 09:30',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkdse5rcjxszgzCqWtETrg7mZCzAGb8Y1sPuF-xaCs-zpEI9_TSvSe2GM5SHczoK84dQLfUbyVgvApKU8JN4CcAnthVnY1FAI9XR4R8nhHweyckUlIPQb_ZLJ4SUxGoutPHWHTZKI86rnynzap5JLQsC5MlWNozIv6hrJNOxysl4FYDUKEO2VI_chnKevT-Q0mlLTI1b7vTD0dwVpBHk4HavQMypX90_sHKo1nx1vtpyEGvr0Lkm-eOlhMvoewElIbPyK5iP3PEg'
  },
  {
    id: '2',
    name: 'Juliana Costa',
    email: 'juliana.costa@empresa.com',
    role: 'Gerente',
    status: 'Ativo',
    lastAccess: 'Hoje, 10:15',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRkGDV9P6J8z5mLOD0Fywya2F7zYvlWTWwXlIR_Prpg5rW2eR9R-YUgGD5YS14G5VS6hKe4jLvOhRD9H_7XCXKMc-q24qK6E8V60bz7viouYe5OrUPm8cR4sbLhpyxq504TI8pYUGcAT_K7D99yPwD5IPRHo4tB9DnBhoKUWXL4qTipnKD1jCYKTRzxjL9A-3tOhumok6pzFYf4rKT9lkPgPD_3zl_rSw7S25PS4X1rIczN1gp8AifnloX4QYa3KJisUYxhwVA2w'
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@empresa.com',
    role: 'Admin',
    status: 'Ativo',
    lastAccess: 'Há 5 min',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaz0hc02XzLpRksBQam2F6z4UGfw7hGsYY6I1USC0Ie1yyer0xEJkINDexM9UgC9dbck4uAC8ro3waF4xydV5sC7wVi7WRD8Cdi1a3IgD3nhOVVmMr4b4YrPVctndvzp19vkPG0nqJYhshZ-rAma347b6fzs89wSrH_IfF3w16q9E_Wr3H04BepEkWw0NHcwdSRDK0hxX_8B9J7l5Fq5Bfdcmgi5S5bqtxdA7eKWtaifGHAGoP3Pbvu1v7AH5ZCQIrp3IhAuRDSg'
  }
];

export const MOCK_MOVEMENTS: Movement[] = [
  { id: '1', date: '12 Out, 2023', type: 'Saída', quantity: 1, responsible: 'A. Silva', ref: 'OS #402', partId: '4' },
  { id: '2', date: '05 Set, 2023', type: 'Entrada', quantity: 5, responsible: 'Almoxarifado', ref: 'PO #992', partId: '4' },
  { id: '3', date: '14 Ago, 2023', type: 'Saída', quantity: 1, responsible: 'R. Costa', ref: 'OS #388', partId: '4' }
];

export const MOCK_REQUESTS: PurchaseRequest[] = [
  { id: 'REQ-2023-890', partId: '4', partName: 'Motor Elétrico WEG 5CV', sku: 'MTR-552-X', quantity: 1, unit: 'UN', priority: 'Normal', justification: 'Reserva estratégica para linha A', status: 'Pendente', date: 'Há 2 horas' },
  { id: 'REQ-2023-888', partId: '2', partName: 'Correia V B-45', sku: 'TR-102-99', quantity: 4, unit: 'UN', priority: 'Urgente', justification: 'Estoque zerado, máquina parada', status: 'Aprovado', date: 'Ontem' }
];
