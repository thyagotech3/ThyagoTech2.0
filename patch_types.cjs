const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const additionalTypes = `
export interface SaleItem {
  productId: string;
  productName: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  selectedColor?: string;
  total: number;
}

export interface Sale {
  id: string;
  clientName: string;
  clientPhone: string;
  deliveryType: "entrega" | "retirada";
  deliveryAddress?: {
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
    city?: string;
  };
  deliveryFee?: number;
  pickupLocation?: string;
  deliveryDate: string; // YYYY-MM-DD
  items: SaleItem[];
  subtotal: number;
  discount?: number;
  total: number;
  paymentMethod: "pix" | "dinheiro" | "cartao_credito" | "cartao_debito" | "transferencia" | string;
  paymentStatus: "pago" | "na_entrega" | "a_prazo";
  dueDate?: string; // YYYY-MM-DD if a_prazo
  notes?: string;
  createdAt: string; // ISO string
  status: "concluida" | "cancelada";
}
`;

if (!code.includes('export interface SaleItem')) {
  code += "\n" + additionalTypes;
  fs.writeFileSync('src/types.ts', code);
  console.log("types.ts updated successfully");
} else {
  console.log("types already present");
}
