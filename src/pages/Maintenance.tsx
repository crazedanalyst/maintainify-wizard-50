import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useApp } from '@/context/AppContext';
import { MaintenanceTask } from '@/lib/db-service';
import { formatDate, getRelativeTime, getPriorityLevel, getPriorityColor } from '@/lib/utils';
import MaintenanceTaskForm from '@/components/maintenance/MaintenanceTaskForm';
import MaintenanceTaskDetail from '@/components/maintenance/MaintenanceTaskDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, Filter, MoreVertical, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Maintenance = () => {
  const { maintenanceTasks, selectedProperty, deleteMaintenanceTask } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  
  const propertyTasks = selectedProperty
    ? maintenanceTasks.filter(task => task.propertyId === selectedProperty.id)
    : [];
  
  const filteredTasks = propertyTasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === null || task.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const overdueTasksList = filteredTasks.filter(task => getPriorityLevel(task.nextDue) === 'overdue');
  const upcomingTasksList = filteredTasks.filter(task => getPriorityLevel(task.nextDue) === 'high');
  const scheduledTasksList = filteredTasks.filter(
    task => getPriorityLevel(task.nextDue) === 'medium' || getPriorityLevel(task.nextDue) === 'low'
  );
  const completedTasksList = filteredTasks.filter(task => task.lastCompleted).sort(
    (a, b) => (b.lastCompleted || 0) - (a.lastCompleted || 0)
  );
  
  const categories = Array.from(new Set(propertyTasks.map(task => task.category)));
  
  const handleTaskAdded = () => {
    setIsAddingTask(false);
    toast({
      title: 'Task added',
      description: 'The maintenance task has been added successfully.'
    });
  };
  
  const handleTaskUpdated = () => {
    setEditingTask(null);
    setSelectedTask(null);
    toast({
      title: 'Task updated',
      description: 'The maintenance task has been updated successfully.'
    });
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteMaintenanceTask(taskId);
      setSelectedTask(null);
      toast({
        title: 'Task deleted',
        description: 'The maintenance task has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'There was an error deleting the maintenance task.',
        variant: 'destructive'
      });
    }
  };
  
  const TaskItem = ({ task }: { task: MaintenanceTask }) => {
    const priority = getPriorityLevel(task.nextDue);
    const priorityColor = getPriorityColor(priority);
    
    return (
      <div 
        className={`p-4 border rounded-lg mb-2 cursor-pointer transition-colors ${
          selectedTask?.id === task.id ? 'border-brand-500 bg-brand-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => setSelectedTask(task)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{task.category}</p>
          </div>
          <Badge className={priorityColor}>
            {priority === 'overdue' ? 'Overdue' : 
             priority === 'high' ? 'Due Soon' : 
             priority === 'medium' ? 'Upcoming' : 'Scheduled'}
          </Badge>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
          <span>Due {getRelativeTime(task.nextDue)}</span>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Schedule</h1>
        <p className="text-gray-500">Track and manage your home maintenance tasks</p>
      </div>
      
      {selectedProperty ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[120px]">
                  <Filter className="h-4 w-4 mr-2" /> {selectedCategory || 'All Categories'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                  <span className={!selectedCategory ? "font-medium" : ""}>All Categories</span>
                </DropdownMenuItem>
                {categories.map(category => (
                  <DropdownMenuItem key={category} onClick={() => setSelectedCategory(category)}>
                    <span className={selectedCategory === category ? "font-medium" : ""}>{category}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={() => setIsAddingTask(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Task
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="upcoming" className="flex-1">
                    <AlertCircle className="h-4 w-4 mr-2" /> Due Soon
                    {overdueTasksList.length + upcomingTasksList.length > 0 && (
                      <Badge className="ml-2 bg-red-500">{overdueTasksList.length + upcomingTasksList.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" /> All
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" /> Completed
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="mt-4">
                  {overdueTasksList.length === 0 && upcomingTasksList.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      <p>No tasks due soon</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {overdueTasksList.length > 0 && (
                        <>
                          <h3 className="font-medium text-red-600">Overdue</h3>
                          {overdueTasksList.map(task => (
                            <TaskItem key={task.id} task={task} />
                          ))}
                        </>
                      )}
                      
                      {upcomingTasksList.length > 0 && (
                        <>
                          <h3 className="font-medium text-orange-600 mt-4">Due Soon</h3>
                          {upcomingTasksList.map(task => (
                            <TaskItem key={task.id} task={task} />
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="all" className="mt-4">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      <p>No maintenance tasks found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {overdueTasksList.length > 0 && (
                        <>
                          <h3 className="font-medium text-red-600">Overdue</h3>
                          {overdueTasksList.map(task => (
                            <TaskItem key={task.id} task={task} />
                          ))}
                        </>
                      )}
                      
                      {upcomingTasksList.length > 0 && (
                        <>
                          <h3 className="font-medium text-orange-600 mt-4">Due Soon</h3>
                          {upcomingTasksList.map(task => (
                            <TaskItem key={task.id} task={task} />
                          ))}
                        </>
                      )}
                      
                      {scheduledTasksList.length > 0 && (
                        <>
                          <h3 className="font-medium text-gray-600 mt-4">Scheduled</h3>
                          {scheduledTasksList.map(task => (
                            <TaskItem key={task.id} task={task} />
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="mt-4">
                  {completedTasksList.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      <p>No completed tasks</p>
                    </div>
                  ) : (
                    <div>
                      {completedTasksList.map(task => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="h-full">
                {selectedTask ? (
                  <CardContent className="p-6">
                    <MaintenanceTaskDetail 
                      task={selectedTask} 
                      onEdit={() => setEditingTask(selectedTask)}
                      onDelete={() => handleDeleteTask(selectedTask.id)}
                    />
                  </CardContent>
                ) : (
                  <div className="flex items-center justify-center h-full p-8">
                    <Button onClick={() => setIsAddingTask(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add New Task
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
          
          <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add Maintenance Task</DialogTitle>
                <DialogDescription>
                  Create a new maintenance task for your property.
                </DialogDescription>
              </DialogHeader>
              <MaintenanceTaskForm 
                onSuccess={handleTaskAdded} 
                onCancel={() => setIsAddingTask(false)} 
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={Boolean(editingTask)} onOpenChange={(open) => !open && setEditingTask(null)}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Edit Maintenance Task</DialogTitle>
                <DialogDescription>
                  Update the details of your maintenance task.
                </DialogDescription>
              </DialogHeader>
              {editingTask && (
                <MaintenanceTaskForm 
                  initialData={editingTask} 
                  onSuccess={handleTaskUpdated} 
                  onCancel={() => setEditingTask(null)} 
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Properties Found</h2>
          <p className="text-gray-500 mb-6">Add a property to get started tracking maintenance tasks.</p>
          <Button>Add Property</Button>
        </div>
      )}
    </Layout>
  );
};

export default Maintenance;
