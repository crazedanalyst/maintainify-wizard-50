import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { getRelativeTime, formatDate, getPriorityLevel, getPriorityColor, groupTasksByPriority } from '@/lib/utils';
import { CalendarClock, Package, FileText, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    maintenanceTasks, 
    warranties, 
    serviceProviders, 
    selectedProperty,
    trialInfo
  } = useApp();
  
  const propertyTasks = selectedProperty
    ? maintenanceTasks.filter(task => task.propertyId === selectedProperty.id)
    : [];
  
  const propertyWarranties = selectedProperty
    ? warranties.filter(warranty => warranty.propertyId === selectedProperty.id)
    : [];
  
  const tasksByPriority = groupTasksByPriority(propertyTasks);
  
  const now = Date.now();
  const expiringWarranties = propertyWarranties.filter(
    warranty => warranty.expiryDate > now && warranty.expiryDate < now + 30 * 24 * 60 * 60 * 1000
  );
  
  const expiredWarranties = propertyWarranties.filter(
    warranty => warranty.expiryDate < now
  );
  
  const handleNavigateToMaintenance = () => {
    navigate('/maintenance');
  };
  
  const handleNavigateToWarranties = () => {
    navigate('/warranties');
  };
  
  const handleNavigateToProviders = () => {
    navigate('/service-providers');
  };
  
  return (
    <>
      {trialInfo.isActive && (
        <div className="animate-fade-in mb-6 p-4 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Free Trial - {trialInfo.daysLeft} days remaining</h3>
              <p className="text-sm text-white/90">You have full access to all features during the trial period.</p>
            </div>
            <Button 
              className="mt-3 md:mt-0 bg-white text-brand-700 hover:bg-white/90"
              onClick={() => navigate('/accounts')}
            >
              Upgrade to Premium
            </Button>
          </div>
          <div className="mt-3">
            <Progress value={(14 - trialInfo.daysLeft) / 14 * 100} className="h-1.5 bg-white/30" />
          </div>
        </div>
      )}
      
      {selectedProperty ? (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedProperty.name}
            </h1>
            <p className="text-gray-500">{selectedProperty.address}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard 
              title="Upcoming Tasks" 
              value={propertyTasks.filter(task => getPriorityLevel(task.nextDue) === 'high' || getPriorityLevel(task.nextDue) === 'overdue').length.toString()} 
              description="Due soon"
              icon={<CalendarClock className="h-5 w-5" />}
              iconColor="text-orange-500"
              bgColor="bg-orange-50"
            />
            <SummaryCard 
              title="Total Tasks" 
              value={propertyTasks.length.toString()} 
              description="Maintenance items"
              icon={<Wrench className="h-5 w-5" />}
              iconColor="text-blue-500"
              bgColor="bg-blue-50"
            />
            <SummaryCard 
              title="Warranties" 
              value={propertyWarranties.length.toString()} 
              description={`${expiringWarranties.length} expiring soon`}
              icon={<FileText className="h-5 w-5" />}
              iconColor="text-green-500"
              bgColor="bg-green-50"
            />
            <SummaryCard 
              title="Service Providers" 
              value={serviceProviders.length.toString()} 
              description="Available contacts"
              icon={<Package className="h-5 w-5" />}
              iconColor="text-purple-500"
              bgColor="bg-purple-50"
            />
          </div>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Maintenance Tasks</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNavigateToMaintenance}
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {tasksByPriority.overdue && tasksByPriority.overdue.length > 0 && (
                <TaskPrioritySection 
                  title="Overdue" 
                  tasks={tasksByPriority.overdue} 
                  priority="overdue" 
                />
              )}
              
              {tasksByPriority.high && tasksByPriority.high.length > 0 && (
                <TaskPrioritySection 
                  title="Due Soon" 
                  tasks={tasksByPriority.high} 
                  priority="high" 
                />
              )}
              
              {tasksByPriority.medium && tasksByPriority.medium.length > 0 && (
                <TaskPrioritySection 
                  title="Upcoming" 
                  tasks={tasksByPriority.medium} 
                  priority="medium" 
                />
              )}
              
              {tasksByPriority.low && tasksByPriority.low.length > 0 && (
                <TaskPrioritySection 
                  title="Future Tasks" 
                  tasks={tasksByPriority.low.slice(0, 3)} 
                  priority="low" 
                />
              )}
              
              {Object.values(tasksByPriority).every(tasks => !tasks || tasks.length === 0) && (
                <div className="p-8 text-center border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance tasks</h3>
                  <p className="text-gray-500 mb-4">Add maintenance tasks to track your home maintenance schedule.</p>
                  <Button onClick={handleNavigateToMaintenance}>Add Task</Button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Warranty Status</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNavigateToWarranties}
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expiredWarranties.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-red-700">
                      Expired Warranties
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {expiredWarranties.slice(0, 3).map(warranty => (
                        <li key={warranty.id} className="flex items-center justify-between py-1">
                          <div>
                            <p className="text-sm font-medium">{warranty.itemName}</p>
                            <p className="text-xs text-gray-500">Expired {getRelativeTime(warranty.expiryDate)}</p>
                          </div>
                          <Badge variant="outline" className="text-red-700 bg-red-50">Expired</Badge>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {expiringWarranties.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-amber-700">
                      Expiring Soon
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {expiringWarranties.slice(0, 3).map(warranty => (
                        <li key={warranty.id} className="flex items-center justify-between py-1">
                          <div>
                            <p className="text-sm font-medium">{warranty.itemName}</p>
                            <p className="text-xs text-gray-500">Expires {getRelativeTime(warranty.expiryDate)}</p>
                          </div>
                          <Badge variant="outline" className="text-amber-700 bg-amber-50">Expiring</Badge>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {expiredWarranties.length === 0 && expiringWarranties.length === 0 && (
                <div className="col-span-2 p-8 text-center border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No warranty alerts</h3>
                  <p className="text-gray-500 mb-4">All your warranties are up to date.</p>
                  <Button onClick={handleNavigateToWarranties}>Add Warranty</Button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Properties Found</h2>
          <p className="text-gray-500 mb-6">Add a property to get started tracking maintenance and warranties.</p>
          <Button onClick={() => navigate('/settings')}>Add Property</Button>
        </div>
      )}
    </>
  );
};

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
}

const SummaryCard = ({ title, value, description, icon, iconColor, bgColor }: SummaryCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`rounded-full p-2 mr-4 ${bgColor}`}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
              <p className="ml-2 text-xs text-gray-500">{description}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface TaskPrioritySectionProps {
  title: string;
  tasks: any[];
  priority: 'low' | 'medium' | 'high' | 'overdue';
}

const TaskPrioritySection = ({ title, tasks, priority }: TaskPrioritySectionProps) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 mb-2">{title.toUpperCase()}</h3>
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <p className="text-sm text-gray-500">Due {getRelativeTime(task.nextDue)}</p>
              </div>
              <Badge className={`${getPriorityColor(priority)}`}>
                {priority === 'overdue' ? 'Overdue' : 
                 priority === 'high' ? 'Due Soon' : 
                 priority === 'medium' ? 'Upcoming' : 'Scheduled'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
