import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Save, Edit3, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Note {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: string;
}

// Mock data - in real app this would come from props
const mockNotes: Note[] = [
    {
        id: 1,
        content: 'Remember to order new blood pressure monitors by end of week. Current stock running low.',
        createdAt: '2025-01-14',
        updatedAt: '2025-01-14',
        author: 'Dr. Smith'
    },
    {
        id: 2,
        content: 'Staff meeting scheduled for Friday 2 PM. All department heads must attend.',
        createdAt: '2025-01-13',
        updatedAt: '2025-01-13',
        author: 'Admin'
    },
    {
        id: 3,
        content: 'System maintenance scheduled for Sunday 2 AM. All users will be logged out.',
        createdAt: '2025-01-12',
        updatedAt: '2025-01-12',
        author: 'IT Support'
    }
];

export default function AdminNotes() {
    const [notes, setNotes] = useState<Note[]>(mockNotes);
    const [newNote, setNewNote] = useState('');
    const [editingNote, setEditingNote] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');

    const handleAddNote = () => {
        if (newNote.trim()) {
            const note: Note = {
                id: Date.now(),
                content: newNote.trim(),
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0],
                author: 'Current User' // In real app, get from auth context
            };
            setNotes([note, ...notes]);
            setNewNote('');
        }
    };

    const handleEditNote = (note: Note) => {
        setEditingNote(note.id);
        setEditContent(note.content);
    };

    const handleSaveEdit = (noteId: number) => {
        if (editContent.trim()) {
            setNotes(notes.map(note => 
                note.id === noteId 
                    ? { ...note, content: editContent.trim(), updatedAt: new Date().toISOString().split('T')[0] }
                    : note
            ));
            setEditingNote(null);
            setEditContent('');
        }
    };

    const handleDeleteNote = (noteId: number) => {
        setNotes(notes.filter(note => note.id !== noteId));
    };

    const handleCancelEdit = () => {
        setEditingNote(null);
        setEditContent('');
    };

    return (
        <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                <div className="flex items-center gap-3 p-6">
                    <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                        <StickyNote className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Admin Notes</h3>
                        <p className="text-amber-100 mt-1">Reminders & announcements</p>
                    </div>
                </div>
            </div>
            <CardContent className="p-0">
                <div className="p-6">
                {/* Add New Note */}
                <div className="mb-6">
                    <div className="space-y-3">
                        <Textarea
                            placeholder="Add a new note, reminder, or announcement..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                        <div className="flex justify-end">
                            <Button 
                                onClick={handleAddNote}
                                disabled={!newNote.trim()}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Add Note
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Notes List */}
                <div className="space-y-4 max-h-80 overflow-y-auto">
                    {notes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <StickyNote className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No notes yet. Add your first note above!</p>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div 
                                key={note.id}
                                className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                {editingNote === note.id ? (
                                    <div className="space-y-3">
                                        <Textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            rows={3}
                                            className="resize-none"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCancelEdit}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleSaveEdit(note.id)}
                                                disabled={!editContent.trim()}
                                                className="bg-amber-600 hover:bg-amber-700 text-white"
                                            >
                                                <Save className="h-3 w-3 mr-1" />
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="text-sm text-gray-800 leading-relaxed">
                                                {note.content}
                                            </p>
                                            <div className="flex items-center gap-1 ml-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEditNote(note)}
                                                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                                                >
                                                    <Edit3 className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>By {note.author}</span>
                                            <span>
                                                {note.updatedAt !== note.createdAt ? 'Updated' : 'Created'} on {note.updatedAt}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
                </div>
                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                        Notes are visible to all admin users • 
                        <span className="text-amber-600 hover:text-amber-800 cursor-pointer ml-1">
                            Manage all notes
                        </span>
                    </p>
                </div>
            </CardContent>
        </div>
    );
}
