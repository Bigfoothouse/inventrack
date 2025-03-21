export interface LiquorItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  bottles: number;
  milliliters: number;
  totalML: number;
  threshold: number; // Minimum level before alert is triggered
  createdAt: any;
  updatedAt: any;
}

export interface OtherStockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  threshold: number; // Minimum level before alert is triggered
  createdAt: any;
  updatedAt: any;
}

export interface DailyStock {
  id: string;
  date: string;
  itemId: string;
  itemType: 'liquor' | 'other';
  bottles?: number;
  milliliters?: number;
  totalML?: number;
  quantity?: number;
  createdAt: any;
  updatedAt: any;
}

export interface StockMovement {
  id: string;
  date: string;
  itemId: string;
  itemType: 'liquor' | 'other';
  previousStock: number | { bottles: number; milliliters: number; totalML: number };
  currentStock: number | { bottles: number; milliliters: number; totalML: number };
  difference: number | { bottles: number; milliliters: number; totalML: number };
} 