import React, { createContext, useContext, useState, useEffect } from 'react';
import dbService, { 
  Property, 
  MaintenanceTask, 
  Warranty, 
  ServiceProvider, 
  MaintenanceLog,
  TrialInfo
} from '@/lib/db-service';
import notificationService from '@/lib/notification-service';
import { generateId } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useStripe } from '@/hooks/use-stripe';

interface AppContextType {
  trialInfo: {
    isActive: boolean;
    daysLeft: number;
    startDate: number;
    endDate: number;
    isPro?: boolean;
    cancelAtPeriodEnd?: boolean;
  };
  properties: Property[];
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Property>;
  updateProperty: (property: Property) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;
  maintenanceTasks: MaintenanceTask[];
  addMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MaintenanceTask>;
  updateMaintenanceTask: (task: MaintenanceTask) => Promise<MaintenanceTask>;
  deleteMaintenanceTask: (id: string) => Promise<void>;
  completeMaintenanceTask: (taskId: string, logData: Omit<MaintenanceLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  warranties: Warranty[];
  addWarranty: (warranty: Omit<Warranty, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Warranty>;
  updateWarranty: (warranty: Warranty) => Promise<Warranty>;
  deleteWarranty: (id: string) => Promise<void>;
  serviceProviders: ServiceProvider[];
  addServiceProvider: (provider: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ServiceProvider>;
  updateServiceProvider: (provider: ServiceProvider) => Promise<ServiceProvider>;
  deleteServiceProvider: (id: string) => Promise<void>;
  maintenanceLogs: MaintenanceLog[];
  getMaintenanceLogsForTask: (taskId: string) => MaintenanceLog[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateTrialInfo: (trialData: Partial<AppContextType['trialInfo']>) => Promise<void>;
  syncSubscriptionStatus: (userId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [trialInfo, setTrialInfo] = useState({
    isActive: true,
    daysLeft: 14,
    startDate: Date.now(),
    endDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    isPro: false,
    cancelAtPeriodEnd: false
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  
  const { syncSubscription } = useStripe();

  useEffect(() => {
    const initialize = async () => {
      try {
        await dbService.init();
        await dbService.initDemoData();
        await refreshData();
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

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const trial = await dbService.getTrialStatus();
      setTrialInfo({
        ...trial,
        isPro: trial.isPro ?? false,
        cancelAtPeriodEnd: trial.cancelAtPeriodEnd ?? false
      });
      
      const propertiesData = await dbService.getAll<Property>('properties');
      setProperties(propertiesData);
      
      if (propertiesData.length > 0 && !selectedProperty) {
        setSelectedProperty(propertiesData[0]);
      }
      
      const tasksData = await dbService.getAll<MaintenanceTask>('maintenanceTasks');
      setMaintenanceTasks(tasksData);
      
      const warrantiesData = await dbService.getAll<Warranty>('warranties');
      setWarranties(warrantiesData);
      
      const providersData = await dbService.getAll<ServiceProvider>('serviceProviders');
      setServiceProviders(providersData);
      
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

  const syncSubscriptionStatus = async (userId: string) => {
    try {
      setIsLoading(true);
      const result = await syncSubscription(userId);
      
      if (result.synced) {
        await refreshData();
        
        if (result.hasSubscription && result.isActive) {
          toast({
            title: 'Subscription Active',
            description: result.subscription?.cancelAtPeriodEnd 
              ? 'Your subscription is active but will be canceled at the end of the billing period.' 
              : 'Your subscription is active.',
          });
        } else {
          toast({
            title: 'No Active Subscription',
            description: 'You don\'t have an active subscription.',
          });
        }
      }
    } catch (error) {
      console.error('Error syncing subscription status:', error);
      toast({
        title: 'Sync Error',
        description: 'There was an error syncing your subscription status.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    const tasksToDelete = maintenanceTasks.filter(task => task.propertyId === id);
    for (const task of tasksToDelete) {
      await dbService.delete('maintenanceTasks', task.id);
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
    
    if (selectedProperty?.id === id) {
      const remainingProperties = properties.filter(p => p.id !== id);
      setSelectedProperty(remainingProperties.length > 0 ? remainingProperties[0] : null);
    }
  };

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
    
    if (addedTask.nextDue) {
      notificationService.scheduleNotification(
        'Maintenance Task Due Soon',
        { 
          body: `Task "${addedTask.title}" is due soon.`,
          icon: '/favicon.ico'
        },
        addedTask.nextDue - 2 * 24 * 60 * 60 * 1000
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
    const logsToDelete = maintenanceLogs.filter(log => log.taskId === id);
    for (const log of logsToDelete) {
      await dbService.delete('maintenanceLogs', log.id);
    }
    await refreshData();
  };

  const completeMaintenanceTask = async (taskId: string, logData: Omit<MaintenanceLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task = maintenanceTasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    const now = Date.now();
    
    const newLog: MaintenanceLog = {
      ...logData,
      id: generateId(),
      taskId,
      createdAt: now,
      updatedAt: now
    };
    
    await dbService.add<MaintenanceLog>('maintenanceLogs', newLog);
    
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
    
    notificationService.scheduleNotification(
      'Maintenance Task Due Soon',
      { 
        body: `Task "${updatedTask.title}" is due soon.`,
        icon: '/favicon.ico'
      },
      updatedTask.nextDue - 2 * 24 * 60 * 60 * 1000
    );
  };

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
    
    const notificationDate = new Date(addedWarranty.expiryDate);
    notificationDate.setDate(notificationDate.getDate() - 30);
    
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
    updateTrialInfo,
    syncSubscriptionStatus
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
