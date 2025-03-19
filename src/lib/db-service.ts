
// Simple storage service using IndexedDB for local data storage

// Define property types
export type Property = {
  id: string;
  name: string;
  address: string;
  createdAt: number;
  updatedAt: number;
};

export type Category = 
  | 'Home' 
  | 'Electronics' 
  | 'Plumbing' 
  | 'Electrical' 
  | 'HVAC' 
  | 'Appliances' 
  | 'Outdoor' 
  | 'Vehicles' 
  | 'Other';

export type MaintenanceTask = {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  category: Category;
  frequency: {
    value: number;
    unit: 'days' | 'weeks' | 'months' | 'years';
  };
  lastCompleted: number | null;
  nextDue: number;
  createdAt: number;
  updatedAt: number;
};

export type Warranty = {
  id: string;
  propertyId: string;
  itemName: string;
  category: Category;
  manufacturer: string;
  purchaseDate: number;
  expiryDate: number;
  description: string;
  documents: string[]; // URLs or base64 strings of documents
  createdAt: number;
  updatedAt: number;
};

export type ServiceProvider = {
  id: string;
  name: string;
  category: Category[];
  phone: string;
  email: string;
  website: string;
  notes: string;
  rating: number;
  createdAt: number;
  updatedAt: number;
};

export type MaintenanceLog = {
  id: string;
  taskId: string;
  propertyId: string;
  completedDate: number;
  cost: number;
  notes: string;
  serviceProviderId: string | null;
  documents: string[]; // URLs or base64 strings of documents
  createdAt: number;
  updatedAt: number;
};

export type TrialInfo = {
  startDate: number;
  endDate: number;
  isActive: boolean;
  daysLeft: number;
  isPro?: boolean;
};

// Define database schema
export type Schema = {
  properties: Property[];
  maintenanceTasks: MaintenanceTask[];
  warranties: Warranty[];
  serviceProviders: ServiceProvider[];
  maintenanceLogs: MaintenanceLog[];
  trialInfo: TrialInfo;
};

const DB_NAME = 'homeMaintenance';
const DB_VERSION = 1;

class DBService {
  private db: IDBDatabase | null = null;

  // Initialize the database
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('properties')) {
          db.createObjectStore('properties', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('maintenanceTasks')) {
          db.createObjectStore('maintenanceTasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('warranties')) {
          db.createObjectStore('warranties', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('serviceProviders')) {
          db.createObjectStore('serviceProviders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('maintenanceLogs')) {
          db.createObjectStore('maintenanceLogs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('trialInfo')) {
          db.createObjectStore('trialInfo', { keyPath: 'id' });
          
          // Initialize trial info
          const trialStore = request.transaction?.objectStore('trialInfo');
          const now = Date.now();
          // 14-day trial
          trialStore?.add({
            id: 'trial',
            startDate: now,
            endDate: now + 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
            isActive: true,
            isPro: false
          });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('Database initialized successfully');
        resolve();
      };

      request.onerror = (event) => {
        console.error('Database error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // Generic method to get all items from a store
  async getAll<T>(storeName: keyof Schema): Promise<T[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as T[]);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // Generic method to get an item by ID
  async getById<T>(storeName: keyof Schema, id: string): Promise<T | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // Generic method to add an item to a store
  async add<T>(storeName: keyof Schema, item: T): Promise<T> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // Generic method to update an item in a store
  async update<T>(storeName: keyof Schema, item: T): Promise<T> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // Generic method to delete an item from a store
  async delete(storeName: keyof Schema, id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // Update trial info
  async updateTrialInfo(trialInfo: Partial<TrialInfo>): Promise<void> {
    if (!this.db) await this.init();
    
    try {
      const currentTrialInfo = await this.getById<TrialInfo & { id: string }>('trialInfo', 'trial');
      
      if (!currentTrialInfo) {
        throw new Error('Trial info not found');
      }
      
      const updatedTrialInfo = {
        ...currentTrialInfo,
        ...trialInfo
      };
      
      await this.update('trialInfo', updatedTrialInfo);
    } catch (error) {
      console.error('Error updating trial info:', error);
      throw error;
    }
  }

  // Check trial status
  async getTrialStatus(): Promise<TrialInfo> {
    if (!this.db) await this.init();
    
    try {
      const trial = await this.getById<TrialInfo & { id: string }>('trialInfo', 'trial');
      
      if (!trial) {
        // If no trial info, create it
        const now = Date.now();
        const newTrial = {
          id: 'trial',
          startDate: now,
          endDate: now + 14 * 24 * 60 * 60 * 1000, // 14 days
          isActive: true,
          daysLeft: 14,
          isPro: false
        };
        await this.add('trialInfo', newTrial);
        return { 
          isActive: true, 
          daysLeft: 14,
          startDate: now,
          endDate: newTrial.endDate,
          isPro: false
        };
      }
      
      // If user has Pro, return the status
      if (trial.isPro) {
        return {
          isActive: true,
          daysLeft: 0,
          startDate: trial.startDate,
          endDate: trial.endDate,
          isPro: true
        };
      }
      
      // For free trial users
      const now = Date.now();
      const daysLeft = Math.max(0, Math.ceil((trial.endDate - now) / (1000 * 60 * 60 * 24)));
      const isActive = now <= trial.endDate;
      
      // Update trial status if needed
      if (trial.isActive !== isActive) {
        trial.isActive = isActive;
        await this.update('trialInfo', trial);
      }
      
      return { 
        isActive, 
        daysLeft,
        startDate: trial.startDate,
        endDate: trial.endDate,
        isPro: false
      };
    } catch (error) {
      console.error('Error getting trial status:', error);
      // Return default values in case of error
      return { 
        isActive: false, 
        daysLeft: 0,
        startDate: 0,
        endDate: 0,
        isPro: false
      };
    }
  }

  // Initialize demo data for demonstration purposes
  async initDemoData(): Promise<void> {
    if (!this.db) await this.init();

    const now = Date.now();
    
    // Add a sample property
    const property: Property = {
      id: 'property1',
      name: 'My Home',
      address: '123 Main St, Anytown, USA',
      createdAt: now,
      updatedAt: now
    };
    
    // Add some sample maintenance tasks
    const tasks: MaintenanceTask[] = [
      {
        id: 'task1',
        propertyId: 'property1',
        title: 'Replace HVAC Filter',
        description: 'Replace the air filter in the HVAC system',
        category: 'HVAC',
        frequency: {
          value: 3,
          unit: 'months'
        },
        lastCompleted: now - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        nextDue: now + 60 * 24 * 60 * 60 * 1000, // 60 days from now
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'task2',
        propertyId: 'property1',
        title: 'Clean Gutters',
        description: 'Remove debris from gutters and check for damage',
        category: 'Outdoor',
        frequency: {
          value: 6,
          unit: 'months'
        },
        lastCompleted: now - 150 * 24 * 60 * 60 * 1000, // 150 days ago
        nextDue: now + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'task3',
        propertyId: 'property1',
        title: 'Check Smoke Detectors',
        description: 'Test all smoke detectors and replace batteries if needed',
        category: 'Home',
        frequency: {
          value: 6,
          unit: 'months'
        },
        lastCompleted: now - 170 * 24 * 60 * 60 * 1000, // 170 days ago
        nextDue: now + 10 * 24 * 60 * 60 * 1000, // 10 days from now
        createdAt: now,
        updatedAt: now
      }
    ];
    
    // Add sample warranties
    const warranties: Warranty[] = [
      {
        id: 'warranty1',
        propertyId: 'property1',
        itemName: 'Refrigerator',
        category: 'Appliances',
        manufacturer: 'Samsung',
        purchaseDate: now - 365 * 24 * 60 * 60 * 1000, // 1 year ago
        expiryDate: now + 2 * 365 * 24 * 60 * 60 * 1000, // 2 years from now
        description: '3-year warranty on all parts and labor',
        documents: [],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'warranty2',
        propertyId: 'property1',
        itemName: 'Washing Machine',
        category: 'Appliances',
        manufacturer: 'LG',
        purchaseDate: now - 400 * 24 * 60 * 60 * 1000, // ~400 days ago
        expiryDate: now - 35 * 24 * 60 * 60 * 1000, // expired 35 days ago
        description: '1-year limited warranty',
        documents: [],
        createdAt: now,
        updatedAt: now
      }
    ];
    
    // Add sample service providers
    const serviceProviders: ServiceProvider[] = [
      {
        id: 'provider1',
        name: 'ABC Plumbing',
        category: ['Plumbing'],
        phone: '555-123-4567',
        email: 'contact@abcplumbing.com',
        website: 'www.abcplumbing.com',
        notes: 'Responsive and reasonably priced',
        rating: 4,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'provider2',
        name: 'XYZ HVAC Services',
        category: ['HVAC'],
        phone: '555-987-6543',
        email: 'service@xyzhvac.com',
        website: 'www.xyzhvac.com',
        notes: 'Licensed and insured, 24/7 emergency service',
        rating: 5,
        createdAt: now,
        updatedAt: now
      }
    ];
    
    // Add sample maintenance logs
    const maintenanceLogs: MaintenanceLog[] = [
      {
        id: 'log1',
        taskId: 'task1',
        propertyId: 'property1',
        completedDate: now - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        cost: 15.99,
        notes: 'Replaced with MERV 11 filter',
        serviceProviderId: null,
        documents: [],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'log2',
        taskId: 'task2',
        propertyId: 'property1',
        completedDate: now - 150 * 24 * 60 * 60 * 1000, // 150 days ago
        cost: 0,
        notes: 'DIY cleaning, no issues found',
        serviceProviderId: null,
        documents: [],
        createdAt: now,
        updatedAt: now
      }
    ];
    
    try {
      // Check if demo data already exists
      const existingProperties = await this.getAll<Property>('properties');
      if (existingProperties.length === 0) {
        // Add demo data to database
        await this.add('properties', property);
        
        for (const task of tasks) {
          await this.add('maintenanceTasks', task);
        }
        
        for (const warranty of warranties) {
          await this.add('warranties', warranty);
        }
        
        for (const provider of serviceProviders) {
          await this.add('serviceProviders', provider);
        }
        
        for (const log of maintenanceLogs) {
          await this.add('maintenanceLogs', log);
        }
        
        console.log('Demo data initialized successfully');
      } else {
        console.log('Demo data already exists, skipping initialization');
      }
    } catch (error) {
      console.error('Error initializing demo data:', error);
    }
  }
}

// Create a singleton instance
const dbService = new DBService();

export default dbService;
