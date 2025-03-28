import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MaintenanceTask } from '@/lib/db-service';
import { formatDate, getRelativeTime, getPriorityLevel, getPriorityColor } from '@/lib/utils';
import MaintenanceTaskForm from '@/components/maintenance/MaintenanceTaskForm';
import MaintenanceTaskDetail from '@/components/maintenance/MaintenanceTaskDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Search, Plus, Filter, Calendar, CheckCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

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
    
    const borderColor = task.category === 'HVAC' ? 'border-l-sky-400' : 
                       task.category === 'Plumbing' ? 'border-l-green-400' :
                       task.category === 'Electrical' ? 'border-l-amber-400' : 
                       task.category === 'Appliances' ? 'border-l-purple-400' : 'border-l-slate-400';
    
    return (
      <Card 
        className={`overflow-hidden border border-muted mb-3 hover:shadow-md transition-all cursor-pointer border-l-4 ${
          selectedTask?.id === task.id ? 'ring-1 ring-brand-500 bg-brand-50' : ''
        } ${borderColor}`}
        onClick={() => setSelectedTask(task)}
      >
        <CardContent className="p-4">
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
            <Clock className="h-4 w-4 mr-1 text-gray-400" />
            <span>Due {getRelativeTime(task.nextDue)}</span>
            <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Schedule</h1>
        <p className="text-gray-600">Track and manage your home maintenance tasks</p>
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
                className="pl-10 border-purple-200 focus:border-purple-300 focus:ring-purple-300"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[120px] border-purple-200 hover:bg-purple-50">
                  <Filter className="h-4 w-4 mr-2 text-purple-500" /> {selectedCategory || 'All Categories'}
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
            
            <Button onClick={() => setIsAddingTask(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" /> Add Task
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="w-full bg-purple-100">
                  <TabsTrigger value="upcoming" className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    <AlertCircle className="h-4 w-4 mr-2" /> Due Soon
                    {overdueTasksList.length + upcomingTasksList.length > 0 && (
                      <Badge className="ml-2 bg-red-500">{overdueTasksList.length + upcomingTasksList.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    <Calendar className="h-4 w-4 mr-2" /> All
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    <CheckCircle className="h-4 w-4 mr-2" /> Completed
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="mt-4">
                  {overdueTasksList.length === 0 && upcomingTasksList.length === 0 ? (
                    <div className="text-center p-6 text-gray-500 bg-gray-50 rounded-lg">
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
                    <div className="text-center p-6 text-gray-500 bg-gray-50 rounded-lg">
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
                    <div className="text-center p-6 text-gray-500 bg-gray-50 rounded-lg">
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
              {selectedTask ? (
                <MaintenanceTaskDetail 
                  task={selectedTask} 
                  onEdit={() => setEditingTask(selectedTask)}
                  onDelete={() => handleDeleteTask(selectedTask.id)}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-8">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-purple-400 opacity-70" />
                    <h3 className="text-lg font-medium mb-1 text-gray-800">No Task Selected</h3>
                    <p className="mb-4 text-gray-600">Select a task from the list to view details</p>
                  </div>
                </div>
              )}
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
        <div className="text-center py-12 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Properties Found</h2>
          <p className="text-gray-600 mb-6">Add a property to get started tracking maintenance tasks.</p>
          <Button className="bg-purple-600 hover:bg-purple-700">Add Property</Button>
        </div>
      )}
    </>
  );
};

export default Maintenance;
