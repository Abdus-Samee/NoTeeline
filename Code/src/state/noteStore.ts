import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export type NotePoint = {
    point: string;
    created_at: number;
    // updated_at: number;
}

export type Note_t = {
    name: string;
    content: NotePoint[];
    created_at: number;
    updated_at: number;
};

// type NoteStore = {
//     notes: Note[];
//     addNote: (note: Note) => void;
//     removeNote: (note: Note) => void;
// }

/**
 * Zustand store for notes
 * -----------------------
 * note:            object with name and content
 *  name:               string(should be unique)
 *  content:            array of strings(bullet points)
 * notes:           array of notes 
 * addNote:         function to add a note to the notes array
 * checkUniqueName: function to check if the name of the note is unique
 * updateNote:      function to update a note in the notes array(on every bullet point addition/deletion)
 * removeNote:      function to remove a note from the notes array
 */

const NoteStore = (set: any, get: any) =>({
    notes: [] as Note_t[],
    addNote: (note: Note_t) => set((state: any) => ({ notes: [...state.notes, note] })),
    fetchNote: (name: string) => {
        const note = get().notes.find((note: Note_t) => note.name === name)
        return note ? note : null
    },
    checkUniqueName: (name: string) => {
        const isUnique = get().notes.filter((note: Note_t) => note.name === name).length === 0
        return isUnique ? true : false
    },
    updateNote: (name: string, content: NotePoint[]) => {
        set((state: any) => {
            const updatedNotes = state.notes.map((n: Note_t) => {
                if(n.name === name) {
                    return {...n, content: content}
                }
                return n
            })
            return { notes: updatedNotes, }
        })
    },
    updateNoteName: (oldName: string, newName: string) => {
        set((state: any) => {
            const updatedNotes = state.notes.map((n: Note_t) => {
                if(n.name === oldName) {
                    return {...n, name: newName}
                }
                return n
            })
            return { notes: updatedNotes, }
        })
    },
    removeNote: (note: Note_t) => {
        set((state: any) => {
            const updatedNotes = state.notes.filter((n: Note_t) => n.name !== note.name)
            return { notes: updatedNotes, }
        })
    },
})

export const useNoteStore = create(devtools(persist(NoteStore, { name: 'note-store' })))