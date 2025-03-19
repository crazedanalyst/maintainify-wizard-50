
import React, { createContext, useContext, useState, useEffect } from 'react';
import dbService, { 
  Property, 
  MaintenanceTask, 
  Warranty, 
  ServiceProvider, 
  MaintenanceLog 
} from '@/lib/db-service';
import notificationService from '@/lib/notification-service';
import { generateId } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define the context type
interface AppContextType {
  // Trial information
  trialInfo: {
    isActive: boolean;
    daysLeft: number;
    startDate: number;
    endDate: number;
    isPro?: boolean;
  };
  // Properties
  properties: Property[];
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Property>;
  updateProperty: (property: Property) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;
  // Maintenance tasks
  maintenanceTasks: MaintenanceTask[];
  addMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MaintenanceTask>;
  updateMaintenanceTask: (task: MaintenanceTask) => Promise<MaintenanceTask>;
  deleteMaintenanceTask: (id: string) => Promise<void>;
  completeMaintenanceTask: (taskId: string, logData: Omit<MaintenanceLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  // Warranties
  warranties: Warranty[];
  addWarranty: (warranty: Omit<Warranty, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Warranty>;
  updateWarranty: (warranty: Warranty) => Promise<Warranty>;
  deleteWarranty: (id: string) => Promise<void>;
  // Service providers
  serviceProviders: ServiceProvider[];
  addServiceProvider: (provider: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ServiceProvider>;
  updateServiceProvider: (provider: ServiceProvider) => Promise<ServiceProvider>;
  deleteServiceProvider: (id: string) => Promise<void>;
  // Maintenance logs
  maintenanceLogs: MaintenanceLog[];
  getMaintenanceLogsForTask: (taskId: string) => MaintenanceLog[];
  // Loading state
  isLoading: boolean;
  // Refresh data
  refreshData: () => Promise<void>;
  // Update trial info
  updateTrialInfo: (trialData: Partial<AppContextType['trialInfo']>) => Promise<void>;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [trialInfo, setTrialInfo] = useState({
    isActive: true,
    daysLeft: 14,
    startDate: Date.now(),
    endDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    isPro: false
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      try {
        await dbService.init();
        // Check if it's the first run and initialize demo data
        await dbService.initDemoData();
        // Load data
        await refreshData();
        // Request notification permission
        notificationService.requestPermission();
      } catch (error) {
        console.error('Error initializing app:', error);
        toast({
          title: 'Error initializing app',
          description: 'There was an error loading your data. Please try refreshing the page.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Refresh all data from database
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Get trial status
      const trial = await dbService.getTrialStatus();
      setTrialInfo(trial);
      
      // Get properties
      const propertiesData = await dbService.getAll<Property>('properties');
      setProperties(propertiesData);
      
      // Select the first property if none is selected
      if (propertiesData.length > 0 && !selectedProperty) {
        setSelectedProperty(propertiesData[0]);
      }
      
      // Get maintenance tasks
      const tasksData = await dbService.getAll<MaintenanceTask>('maintenanceTasks');
      setMaintenanceTasks(tasksData);
      
      // Get warranties
      const warrantiesData = await dbService.getAll<Warranty>('warranties');
      setWarranties(warrantiesData);
      
      // Get service providers
      const providersData = await dbService.getAll<ServiceProvider>('serviceProviders');
      setServiceProviders(providersData);
      
      // Get maintenance logs
      const logsData = await dbService.getAll<MaintenanceLog>('maintenanceLogs');
      setMaintenanceLogs(logsData);
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: 'Error refreshing data',
        description: 'There was an error loading your data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update trial info
  const updateTrialInfo = async (trialData: Partial<AppContextType['trialInfo']>) => {
    try {
      const updatedTrialInfo = { ...trialInfo, ...trialData };
      await dbService.updateTrialInfo(updatedTrialInfo);
      setTrialInfo(updatedTrialInfo);
    } catch (error) {
      console.error('Error updating trial info:', error);
      toast({
        title: 'Error updating subscription',
        description: 'There was an error updating your subscription status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Properties CRUD operations
  const addProperty = async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newProperty: Property = {
      ...propertyData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    
    const addedProperty = await dbService.add<Property>('properties', newProperty);
    await refreshData();
    return addedProperty;
  };

  const updateProperty = async (property: Property) => {
    const updatedProperty: Property = {
      ...property,
      updatedAt: Date.now()
    };
    
    const result = await dbService.update<Property>('properties', updatedProperty);
    await refreshData();
    return result;
  };

  const deleteProperty = async (id: string) => {
    await dbService.delete('properties', id);
    // Also delete all related data
    const tasksToDelete = maintenanceTasks.filter(task => task.propertyId === id);
    for (const task of tasksToDelete) {
      await dbService.delete('maintenanceTasks', task.id);
      // Delete related logs
      const logsToDelete = maintenanceLogs.filter(log => log.taskId === task.id);
      for (const log of logsToDelete) {
        await dbService.delete('maintenanceLogs', log.id);
      }
    }
    
    const warrantiestoDelete = warranties.filter(warranty => warranty.propertyId === id);
    for (const warranty of warrantiestoDelete) {
      await dbService.delete('warranties', warranty.id);
    }
    
    await refreshData();
    
    // If the deleted property was selected, select another one
    if (selectedProperty?.id === id) {
      const remainingProperties = properties.filter(p => p.id !== id);
      setSelectedProperty(remainingProperties.length > 0 ? remainingProperties[0] : null);
    }
  };

  // Maintenance tasks CRUD operations
  const addMaintenanceTask = async (taskData: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newTask: MaintenanceTask = {
      ...taskData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    
    const addedTask = await dbService.add<MaintenanceTask>('maintenanceTasks', newTask);
    await refreshData();
    
    // Schedule a notification for the task
    if (addedTask.nextDue) {
      notificationService.scheduleNotification(
        'Maintenance Task Due Soon',
        { 
          body: `Task "${addedTask.title}" is due soon.`,
          icon: '/favicon.ico'
        },
        addedTask.nextDue - 2 * 24 * 60 * 60 * 1000 // 2 days before due date
      );
    }
    
    return addedTask;
  };

  const updateMaintenanceTask = async (task: MaintenanceTask) => {
    const updatedTask: MaintenanceTask = {
      ...task,
      updatedAt: Date.now()
    };
    
    const result = await dbService.update<MaintenanceTask>('maintenanceTasks', updatedTask);
    await refreshData();
    return result;
  };

  const deleteMaintenanceTask = async (id: string) => {
    await dbService.delete('maintenanceTasks', id);
    // Also delete related logs
    const logsToDelete = maintenanceLogs.filter(log => log.taskId === id);
    for (const log of logsToDelete) {
      await dbService.delete('maintenanceLogs', log.id);
    }
    await refreshData();
  };

  const completeMaintenanceTask = async (taskId: string, logData: Omit<MaintenanceLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Get the task
    const task = maintenanceTasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    const now = Date.now();
    
    // Create maintenance log
    const newLog: MaintenanceLog = {
      ...logData,
      id: generateId(),
      taskId,
      createdAt: now,
      updatedAt: now
    };
    
    await dbService.add<MaintenanceLog>('maintenanceLogs', newLog);
    
    // Update the task with new lastCompleted and nextDue dates
    const nextDue = new Date(logData.completedDate);
    switch (task.frequency.unit) {
      case 'days':
        nextDue.setDate(nextDue.getDate() + task.frequency.value);
        break;
      case 'weeks':
        nextDue.setDate(nextDue.getDate() + (task.frequency.value * 7));
        break;
      case 'months':
        nextDue.setMonth(nextDue.getMonth() + task.frequency.value);
        break;
      case 'years':
        nextDue.setFullYear(nextDue.getFullYear() + task.frequency.value);
        break;
    }
    
    const updatedTask: MaintenanceTask = {
      ...task,
      lastCompleted: logData.completedDate,
      nextDue: nextDue.getTime(),
      updatedAt: now
    };
    
    await dbService.update<MaintenanceTask>('maintenanceTasks', updatedTask);
    await refreshData();
    
    // Schedule a notification for the next due date
    notificationService.scheduleNotification(
      'Maintenance Task Due Soon',
      { 
        body: `Task "${updatedTask.title}" is due soon.`,
        icon: '/favicon.ico'
      },
      updatedTask.nextDue - 2 * 24 * 60 * 60 * 1000 // 2 days before due date
    );
  };

  // Warranties CRUD operations
  const addWarranty = async (warrantyData: Omit<Warranty, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newWarranty: Warranty = {
      ...warrantyData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    
    const addedWarranty = await dbService.add<Warranty>('warranties', newWarranty);
    await refreshData();
    
    // Schedule a notification for warranty expiration
    const notificationDate = new Date(addedWarranty.expiryDate);
    notificationDate.setDate(notificationDate.getDate() - 30); // 30 days before expiry
    
    if (notificationDate.getTime() > now) {
      notificationService.scheduleNotification(
        'Warranty Expiring Soon',
        { 
          body: `Warranty for "${addedWarranty.itemName}" expires in 30 days.`,
          icon: '/favicon.ico'
        },
        notificationDate.getTime()
      );
    }
    
    return addedWarranty;
  };

  const updateWarranty = async (warranty: Warranty) => {
    const updatedWarranty: Warranty = {
      ...warranty,
      updatedAt: Date.now()
    };
    
    const result = await dbService.update<Warranty>('warranties', updatedWarranty);
    await refreshData();
    return result;
  };

  const deleteWarranty = async (id: string) => {
    await dbService.delete('warranties', id);
    await refreshData();
  };

  // Service providers CRUD operations
  const addServiceProvider = async (providerData: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newProvider: ServiceProvider = {
      ...providerData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    
    const addedProvider = await dbService.add<ServiceProvider>('serviceProviders', newProvider);
    await refreshData();
    return addedProvider;
  };

  const updateServiceProvider = async (provider: ServiceProvider) => {
    const updatedProvider: ServiceProvider = {
      ...provider,
      updatedAt: Date.now()
    };
    
    const result = await dbService.update<ServiceProvider>('serviceProviders', updatedProvider);
    await refreshData();
    return result;
  };

  const deleteServiceProvider = async (id: string) => {
    await dbService.delete('serviceProviders', id);
    await refreshData();
  };

  // Get maintenance logs for a specific task
  const getMaintenanceLogsForTask = (taskId: string) => {
    return maintenanceLogs.filter(log => log.taskId === taskId);
  };

  const contextValue: AppContextType = {
    trialInfo,
    properties,
    selectedProperty,
    setSelectedProperty,
    addProperty,
    updateProperty,
    deleteProperty,
    maintenanceTasks,
    addMaintenanceTask,
    updateMaintenanceTask,
    deleteMaintenanceTask,
    completeMaintenanceTask,
    warranties,
    addWarranty,
    updateWarranty,
    deleteWarranty,
    serviceProviders,
    addServiceProvider,
    updateServiceProvider,
    deleteServiceProvider,
    maintenanceLogs,
    getMaintenanceLogsForTask,
    isLoading,
    refreshData,
    updateTrialInfo
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
