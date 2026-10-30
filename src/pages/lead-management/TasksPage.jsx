import React, { useState, useEffect } from "react";
import { LucidePlus, LucideCheckCircle, LucideClock, LucideAlertCircle, LucideTrash2, LucideCalendar, LucideImage } from "lucide-react";
import CreateTaskModal from "./CreateTaskModal";
import { getTasks, createTask, updateTaskStatus, deleteTask } from "../../api/leadApi";
import toast from "react-hot-toast";

const mockTasks = [
    { id: 1, title: "Call Rahul for IIT-JEE follow up", assignedTo: "Amit Sharma", priority: "High", dueDate: "2024-02-12", status: "Pending", type: "Call" },
    { id: 2, title: "Send brochure to Priya Singh", assignedTo: "Sneha Verma", priority: "Medium", dueDate: "2024-02-13", status: "In Progress", type: "Email" },
    { id: 3, title: "Home visit for Aditya Raj", assignedTo: "Amit Sharma", priority: "Low", dueDate: "2024-02-14", status: "Pending", type: "Visit" },
    { id: 4, title: "Fee negotiation with Neha", assignedTo: "Rohan Das", priority: "High", dueDate: "2024-02-10", status: "Completed", type: "Meeting" },
];

const priorityColors = {
    "High": "bg-red-100 text-red-700",
    "Medium": "bg-yellow-100 text-yellow-700",
    "Low": "bg-green-100 text-green-700",
};

const statusIcons = {
    "Pending": <LucideClock size={16} className="text-amber-500" />,
    "In Progress": <LucideAlertCircle size={16} className="text-[#FF5B22]" />,
    "Completed": <LucideCheckCircle size={16} className="text-emerald-500" />,
};

export default function TasksPage() {
    const [filter, setFilter] = useState("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasksList, setTasksList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await getTasks();
            if (res.success) {
                setTasksList(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (formData) => {
        try {
            const res = await createTask(formData);
            if (res.success) {
                toast.success("Task created successfully!");
                fetchTasks();
                setIsModalOpen(false);
            }
        } catch (error) {
            toast.error("Failed to create task");
        }
    };

    const handleMarkComplete = async (taskId) => {
        try {
            const res = await updateTaskStatus(taskId, "Completed");
            if (res.success) {
                toast.success("Task marked as completed");
                fetchTasks();
            }
        } catch (error) {
            toast.error("Failed to update task");
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            const res = await deleteTask(taskId);
            if (res.success) {
                toast.success("Task deleted successfully");
                fetchTasks();
            }
        } catch (error) {
            toast.error("Failed to delete task");
        }
    };

    const filteredTasks = filter === "All" ? tasksList : tasksList.filter(t => t.status === filter);

    return (
        <>
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTask}
            />
            <div className="p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Task Management</h2>
                        <p className="text-gray-500 text-sm">Assign and track tasks for your team</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">All Tasks</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FF5B22] text-white rounded-lg hover:bg-[#EA580C] transition-colors shadow-sm font-medium"
                        >
                            <LucidePlus size={18} />
                            Create Task
                        </button>
                    </div>
                </div>

                {/* Task List */}
                <div className="grid gap-4">
                    {loading ? (
                        <div className="grid gap-4 animate-pulse">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-11 h-11 rounded-full bg-orange-100/70 shrink-0"></div>
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 w-52 bg-slate-200 rounded"></div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-3 w-24 bg-slate-100 rounded"></div>
                                                <div className="h-3 w-28 bg-slate-100 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                                        <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
                                        <div className="flex gap-2">
                                            <div className="h-7 w-24 bg-emerald-50 rounded-lg"></div>
                                            <div className="w-7 h-7 bg-slate-100 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 p-8 space-y-3">
                            <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FF5B22] flex items-center justify-center mx-auto">
                                <LucideClock size={24} />
                            </div>
                            <h3 className="text-base font-bold text-gray-800">No tasks found</h3>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto">
                                {filter !== "All" ? `No tasks found with "${filter}" status.` : "You don't have any tasks scheduled. Click 'Create Task' above to add one."}
                            </p>
                        </div>
                    ) : (
                        filteredTasks.map((task) => (
                            <div key={task._id || task.id} className="bg-white border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-shadow">

                                {/* Left: Icon & Details */}
                                <div className="flex items-start gap-4">
                                    {task.image ? (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border shrink-0">
                                            <img src={task.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className={`p-3 rounded-full shrink-0 ${task.status === 'Completed' ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                                            {statusIcons[task.status] || <LucideClock size={20} />}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className={`font-semibold text-gray-800 ${task.status === 'Completed' ? 'line-through text-gray-400' : ''}`}>
                                            {task.title}
                                            {task.image && (
                                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#FF5B22] bg-orange-50 px-2 py-0.5 rounded border border-orange-200 ml-2 uppercase tracking-tight">
                                                    <LucideImage size={10} /> Image
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1 text-[11px] md:text-sm">
                                                <LucideCalendar size={14} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
                                            </span>
                                            <span className="text-[11px] md:text-sm">
                                                Assigned:{" "}
                                                <span className="font-semibold text-gray-800">
                                                    {task.assignedTo?.name || (task.assignedTo?.firstName && task.assignedTo?.lastName ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : (task.assignedTo?.firstName || task.assignedTo?.email || (typeof task.assignedTo === 'string' ? task.assignedTo : "Unassigned")))}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Priority & Actions */}
                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                                        {task.priority}
                                    </span>

                                    <div className="flex gap-2">
                                        {task.status !== 'Completed' && (
                                            <button 
                                                onClick={() => handleMarkComplete(task._id || task.id)}
                                                className="px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-50 border border-green-200 rounded-lg transition-colors"
                                            >
                                                Mark Complete
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDeleteTask(task._id || task.id)}
                                            className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                                            title="Delete Task"
                                        >
                                            <LucideTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
