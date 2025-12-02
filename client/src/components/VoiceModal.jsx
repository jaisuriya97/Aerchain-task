import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Square, X, Check, Loader2, AlignLeft } from 'lucide-react';

const VoiceModal = ({ isOpen, onClose, taskToEdit = null, onSave }) => {
    const {
        transcript,
        listening,
        resetTranscript
    } = useSpeechRecognition();

    const [parsedResult, setParsedResult] = useState(null);
    const [parsing, setParsing] = useState(false);
    const [editedTask, setEditedTask] = useState({});

    useEffect(() => {
        if (isOpen) {
            setParsedResult(null);
            if (taskToEdit) {
                setEditedTask(taskToEdit);
            } else {
                setEditedTask({});
                resetTranscript();
            }
        }
    }, [isOpen, taskToEdit, resetTranscript]);

    const handleStopAndAnalyze = async () => {
        SpeechRecognition.stopListening();

        if (!transcript) return;

        setParsing(true);
        try {
          
            const res = await axios.post('http://localhost:5000/api/parse', { transcript });
            setParsedResult(res.data);
            setEditedTask(res.data);
        } catch (error) {
            console.error("Parsing error:", error);
            alert("AI failed to parse. Please try again.");
        } finally {
            setParsing(false);
        }
    };

    const handleSaveClick = () => {

        onSave(editedTask);
    };

    if (!isOpen) return null;

    const showForm = (taskToEdit !== null) || parsedResult;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
   
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            ></div>

     
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] relative z-10 border border-gray-200">

           
                <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h2 className="text-base font-semibold text-gray-900">
                        {taskToEdit && taskToEdit._id ? 'Edit Task' : taskToEdit ? 'New Task' : 'Voice Command'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-900"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
             
                    {!showForm && (
                        <div className="flex flex-col items-center py-8">
                    
                            <div className="mb-8">
                                <button
                                    onClick={listening ? handleStopAndAnalyze : () => SpeechRecognition.startListening({ continuous: true })}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${listening
                                            ? 'bg-black border-black text-white hover:bg-gray-900'
                                            : 'bg-white border-gray-200 text-gray-900 hover:border-gray-900'
                                        }`}
                                >
                                    {listening ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
                                </button>
                            </div>

                            <div className="text-center space-y-2 mb-8">
                                <p className="text-lg font-semibold text-gray-900">
                                    {listening ? "Listening..." : "Tap to speak"}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {listening ? "Press the button to stop" : "Describe your task naturally"}
                                </p>
                            </div>

                            <div className="w-full min-h-[120px] relative text-center flex items-center justify-center">
                                {parsing ? (
                                    <div className="flex items-center gap-3 text-gray-900 font-medium">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <p className="text-xl text-gray-900 font-medium leading-relaxed">
                                        {transcript ? `"${transcript}"` : <span className="text-gray-300">"Remind me to..."</span>}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {showForm && (
                        <div className="space-y-6">

                            {transcript && !taskToEdit?._id && (
                                <div className="pb-4 border-b border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Original Input</p>
                                    <p className="text-sm text-gray-600 leading-relaxed italic">"{transcript}"</p>
                                </div>
                            )}

                            <div className="space-y-5">
                                <div>
                                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 block">Title</label>
                                    <input
                                        value={editedTask.title || ''}
                                        onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
                                        className="w-full text-lg font-semibold border border-gray-200 rounded-lg px-3 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors placeholder-gray-300 text-gray-900"
                                        placeholder="Task title"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
                                    <textarea
                                        value={editedTask.description || ''}
                                        onChange={e => setEditedTask({ ...editedTask, description: e.target.value })}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none resize-none h-32 transition-colors placeholder-gray-300 text-gray-700"
                                        placeholder="Add details..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 block">Priority</label>
                                        <div className="relative">
                                            <select
                                                value={editedTask.priority || 'Medium'}
                                                onChange={e => setEditedTask({ ...editedTask, priority: e.target.value })}
                                                className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-lg text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none cursor-pointer appearance-none text-gray-900"
                                            >
                                                {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 block">Due Date</label>
                                        <input
                                            type="date"
                                            value={editedTask.dueDate ? editedTask.dueDate.split('T')[0] : ''}
                                            onChange={e => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                                            className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-lg text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSaveClick}
                                    className="w-full py-3 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm flex justify-center items-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    {taskToEdit && taskToEdit._id ? 'Save Changes' : 'Create Task'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceModal;