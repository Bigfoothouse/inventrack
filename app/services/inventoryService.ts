import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  orderBy,
  serverTimestamp,
  getDoc,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { LiquorItem, OtherStockItem, DailyStock, StockMovement } from '../types/inventory';
import { calculateTotalML } from '../utils/liquorCalculations';

const LIQUOR_COLLECTION = 'liquorItems';
const OTHER_STOCK_COLLECTION = 'otherStockItems';
const DAILY_STOCK_COLLECTION = 'dailyStock';
const STOCK_MOVEMENT_COLLECTION = 'stockMovement';

// Liquor item CRUD
export async function addLiquorItem(item: Omit<LiquorItem, 'id' | 'createdAt' | 'updatedAt' | 'totalML'>): Promise<string> {
  const totalML = calculateTotalML(item.bottles, item.milliliters);
  const docRef = await addDoc(collection(db, LIQUOR_COLLECTION), {
    ...item,
    totalML,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateLiquorItem(id: string, item: Partial<Omit<LiquorItem, 'id' | 'createdAt' | 'updatedAt' | 'totalML'>>): Promise<void> {
  const updates: any = { ...item, updatedAt: serverTimestamp() };
  
  // Recalculate totalML if bottles or milliliters are updated
  if (item.bottles !== undefined || item.milliliters !== undefined) {
    const docSnap = await getDoc(doc(db, LIQUOR_COLLECTION, id));
    const currentData = docSnap.data() as LiquorItem;
    
    const bottles = item.bottles !== undefined ? item.bottles : currentData.bottles;
    const milliliters = item.milliliters !== undefined ? item.milliliters : currentData.milliliters;
    
    updates.totalML = calculateTotalML(bottles, milliliters);
  }
  
  await updateDoc(doc(db, LIQUOR_COLLECTION, id), updates);
}

export async function deleteLiquorItem(id: string): Promise<void> {
  await deleteDoc(doc(db, LIQUOR_COLLECTION, id));
}

export async function getAllLiquorItems(): Promise<LiquorItem[]> {
  const q = query(collection(db, LIQUOR_COLLECTION), orderBy('name'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as LiquorItem[];
}

// Other stock CRUD
export async function addOtherStockItem(item: Omit<OtherStockItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, OTHER_STOCK_COLLECTION), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateOtherStockItem(id: string, item: Partial<Omit<OtherStockItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  await updateDoc(doc(db, OTHER_STOCK_COLLECTION, id), {
    ...item,
    updatedAt: serverTimestamp()
  });
}

export async function deleteOtherStockItem(id: string): Promise<void> {
  await deleteDoc(doc(db, OTHER_STOCK_COLLECTION, id));
}

export async function getAllOtherStockItems(): Promise<OtherStockItem[]> {
  const q = query(collection(db, OTHER_STOCK_COLLECTION), orderBy('name'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as OtherStockItem[];
}

// Daily stock CRUD
export async function addDailyStock(stockItem: Omit<DailyStock, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  // Check if there's already an entry for this item on this date
  const existingQuery = query(
    collection(db, DAILY_STOCK_COLLECTION),
    where('date', '==', stockItem.date),
    where('itemId', '==', stockItem.itemId)
  );
  
  const existingSnapshot = await getDocs(existingQuery);
  
  if (!existingSnapshot.empty) {
    // Update existing entry
    const existingDoc = existingSnapshot.docs[0];
    await updateDoc(doc(db, DAILY_STOCK_COLLECTION, existingDoc.id), {
      ...stockItem,
      updatedAt: serverTimestamp()
    });
    return existingDoc.id;
  } else {
    // Add new entry
    const docRef = await addDoc(collection(db, DAILY_STOCK_COLLECTION), {
      ...stockItem,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Calculate stock movement
    await calculateStockMovement(stockItem.itemId, stockItem.itemType, stockItem.date);
    
    return docRef.id;
  }
}

export async function getDailyStockByDate(date: string): Promise<DailyStock[]> {
  const q = query(
    collection(db, DAILY_STOCK_COLLECTION),
    where('date', '==', date)
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as DailyStock[];
}

// Stock movement calculation
async function calculateStockMovement(itemId: string, itemType: 'liquor' | 'other', currentDate: string): Promise<void> {
  // Get yesterday's date
  const currentDateObj = new Date(currentDate);
  const yesterdayDateObj = new Date(currentDateObj);
  yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1);
  
  const yesterdayDate = yesterdayDateObj.toISOString().split('T')[0];
  
  // Get yesterday's stock
  const yesterdayQuery = query(
    collection(db, DAILY_STOCK_COLLECTION),
    where('date', '==', yesterdayDate),
    where('itemId', '==', itemId)
  );
  
  // Get today's stock
  const todayQuery = query(
    collection(db, DAILY_STOCK_COLLECTION),
    where('date', '==', currentDate),
    where('itemId', '==', itemId)
  );
  
  const [yesterdaySnapshot, todaySnapshot] = await Promise.all([
    getDocs(yesterdayQuery),
    getDocs(todayQuery)
  ]);
  
  // If we don't have both days' stock, we can't calculate movement
  if (yesterdaySnapshot.empty || todaySnapshot.empty) return;
  
  const yesterdayStock = yesterdaySnapshot.docs[0].data() as DailyStock;
  const todayStock = todaySnapshot.docs[0].data() as DailyStock;
  
  let previousStock, currentStock, difference;
  
  // Calculate difference based on item type
  if (itemType === 'liquor') {
    previousStock = {
      bottles: yesterdayStock.bottles || 0,
      milliliters: yesterdayStock.milliliters || 0,
      totalML: yesterdayStock.totalML || 0
    };
    
    currentStock = {
      bottles: todayStock.bottles || 0,
      milliliters: todayStock.milliliters || 0,
      totalML: todayStock.totalML || 0
    };
    
    difference = {
      bottles: previousStock.bottles - currentStock.bottles,
      milliliters: previousStock.milliliters - currentStock.milliliters,
      totalML: previousStock.totalML - currentStock.totalML
    };
  } else {
    previousStock = yesterdayStock.quantity || 0;
    currentStock = todayStock.quantity || 0;
    difference = previousStock - currentStock;
  }
  
  // Check if stock movement record already exists
  const movementQuery = query(
    collection(db, STOCK_MOVEMENT_COLLECTION),
    where('date', '==', currentDate),
    where('itemId', '==', itemId)
  );
  
  const movementSnapshot = await getDocs(movementQuery);
  
  if (!movementSnapshot.empty) {
    // Update existing record
    await updateDoc(doc(db, STOCK_MOVEMENT_COLLECTION, movementSnapshot.docs[0].id), {
      previousStock,
      currentStock,
      difference,
      updatedAt: serverTimestamp()
    });
  } else {
    // Create new record
    await addDoc(collection(db, STOCK_MOVEMENT_COLLECTION), {
      date: currentDate,
      itemId,
      itemType,
      previousStock,
      currentStock,
      difference,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

export async function getStockMovementByDate(date: string): Promise<StockMovement[]> {
  const q = query(
    collection(db, STOCK_MOVEMENT_COLLECTION),
    where('date', '==', date)
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as StockMovement[];
} 