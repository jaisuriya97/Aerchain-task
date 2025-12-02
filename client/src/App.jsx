import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import VoiceModal from './components/VoiceModal';
import { Mic, Calendar, Trash2, Search, LayoutGrid, List as ListIcon, Edit2, Plus, CheckCircle2, Circle, Clock, GripVertical } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

const API_URL = 'http://localhost:5000/api/tasks';

const COLUMNS = {
  'To Do': { id: 'To Do', icon: Circle },
  'In Progress': { id: 'In Progress', icon: Clock },
  'Done': { id: 'Done', icon: CheckCircle2 }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
};

const PriorityBadge = ({ p }) => {
  const styles = {
    Low: 'text-gray-500 border-gray-200 bg-white',
    Medium: 'text-gray-700 border-gray-300 bg-white',
    High: 'text-gray-900 border-gray-900 bg-white font-medium',
    Critical: 'text-white bg-black border-black font-medium'
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${styles[p]}`}>
      {p}
    </span>
  );
};

function App() {

  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState('board');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleUpdateTask = async (id, updates) => {
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t => t._id === id ? { ...t, ...updates } : t));

    try {
      await axios.put(`${API_URL}/${id}`, updates);
    } catch (err) {
      console.error("Update failed:", err);
      setTasks(originalTasks); 
      alert("Failed to update task");
    }
  };

  const handleDeleteTask = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this task?")) return;

    const originalTasks = [...tasks];
    setTasks(prev => prev.filter(t => t._id !== id));

    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (err) {
      console.error("Delete failed:", err);
      setTasks(originalTasks);
      alert("Failed to delete task");
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData._id) {
  
        const res = await axios.put(`${API_URL}/${taskData._id}`, taskData);
        setTasks(prev => prev.map(t => t._id === taskData._id ? res.data : t));
      } else {
        const res = await axios.post(API_URL, taskData);
        setTasks(prev => [res.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save task");
    }
  };


  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;

    handleUpdateTask(draggableId, { status: destination.droppableId });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTaskCard = (task, index, provided, snapshot) => {
    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{ ...provided.draggableProps.style }}
        className={`group mb-3 bg-white p-4 rounded-lg border transition-all duration-200 relative
          ${snapshot.isDragging
            ? 'shadow-xl border-black z-50'
            : 'shadow-sm border-gray-200 hover:border-gray-400'
          }
        `}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-900 leading-snug pr-6 text-[14px] select-none">{task.title}</h4>
          <button
            onClick={(e) => handleDeleteTask(e, task._id)}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-black transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {task.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed select-none">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <PriorityBadge p={task.priority} />
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <div className={`flex items-center text-xs font-medium ${isToday(new Date(task.dueDate)) ? 'text-black' : 'text-gray-400'}`}>
                <Calendar className="w-3 h-3 mr-1.5" />
                {formatDate(task.dueDate)}
              </div>
            )}
            <button onClick={() => handleEdit(task)} className="text-gray-300 hover:text-black transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100 selection:text-black">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-black text-white p-1.5 rounded-md">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900">VoiceTracker</h1>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-0 outline-none transition-all text-sm placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                <button onClick={() => setViewMode('board')} className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-black border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-black border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}><ListIcon className="w-4 h-4" /></button>
              </div>

              <div className="flex items-center gap-2 pl-2">
                <button
                  onClick={() => { setEditingTask({}); setModalOpen(true); }}
                  className="bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg hover:border-black transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>

                <button
                  onClick={() => { setEditingTask(null); setModalOpen(true); }}
                  className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all"
                >
                  <Mic className="w-4 h-4" />
                  <span className="text-sm font-medium hidden md:inline">Voice Task</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {viewMode === 'board' ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(COLUMNS).map(([status, config]) => (
                <Droppable key={status} droppableId={status}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4 px-1 border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-2">
                          <config.icon className="w-4 h-4 text-gray-500" />
                          <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">{status}</h3>
                        </div>
                        <span className="text-gray-400 text-xs font-mono">
                          {filteredTasks.filter(t => t.status === status).length}
                        </span>
                      </div>
                      <div className={`flex-1 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-gray-50' : ''}`}>
                        {filteredTasks.filter(t => t.status === status).map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => renderTaskCard(task, index, provided, snapshot)}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {filteredTasks.filter(t => t.status === status).length === 0 && (
                          <div className="mt-8 text-center">
                            <span className="text-xs text-gray-300 font-medium">No tasks</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {filteredTasks.length === 0 && <div className="text-center py-16 text-gray-400 font-medium">No tasks found.</div>}
            {filteredTasks.map((task, index) => (
              <div key={task._id} className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group ${index !== filteredTasks.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center gap-4">
                  <GripVertical className="w-4 h-4 text-gray-300 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {task.status === 'Done' && <div className="w-2 h-2 bg-black rounded-full"></div>}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 text-[14px]">{task.title}</h4>
                    {task.description && <p className="text-xs text-gray-500 mt-0.5 max-w-2xl truncate">{task.description}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                    <select
                      value={task.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleUpdateTask(task._id, { status: e.target.value })}
                      className="bg-transparent hover:text-black cursor-pointer transition-colors border-none outline-none text-right appearance-none"
                    >
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>

                    {task.dueDate && <span className={isToday(new Date(task.dueDate)) ? 'text-black font-semibold' : ''}>{formatDate(task.dueDate)}</span>}
                  </div>

                  <PriorityBadge p={task.priority} />

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(task)} className="text-gray-400 hover:text-black transition-all"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={(e) => handleDeleteTask(e, task._id)} className="text-gray-400 hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <VoiceModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        taskToEdit={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}

export default App;