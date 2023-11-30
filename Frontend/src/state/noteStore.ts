import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export type NotePoint = {
    point: string;
    created_at: number;
    // updated_at: number;
}

export type TranscriptLine = {
    offset: number;
    duration: number;
    text: string;
}

export type Note_t = {
    name: string;
    ytId: string;
    content: NotePoint[];
    transcription: TranscriptLine[];
    expansion: ExpandedNote[];
    created_at: number;
    updated_at: number;
    recording_start: number;
}

export type ExpandedNote = {
    point: string;
    expansion: string;
}

export type OnboardingSection = {
    id: number;
    note: string;
    keypoints: string[];
    transcript: string;
}

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
    onboardings: [] as OnboardingSection[],
    addOnboarding: (onboarding: OnboardingSection) => {
        set((state: any) => {
            if(state.onboardings.length < 3) {
                return { onboardings: [...state.onboardings, onboarding] }
            }else{
                const updatedOnboardings = state.onboardings.map((ob: OnboardingSection) => {
                    if(ob.id === onboarding.id) {
                        return onboarding
                    }else{
                        return ob
                    }
                })
                return { onboardings: updatedOnboardings, }
            }
        })
    },
    fetchAllOnboardings: () => {
        return get().onboardings
    },
    addNote: (note: Note_t) => set((state: any) => ({ notes: [...state.notes, note] })),
    fetchNote: (name: string) => {
        const note = get().notes.find((note: Note_t) => note.name === name)
        return note ? note : null
    },
    addYouTubeId: (name: string, ytId: string) => {
        set((state: any) => {
            const updatedNotes = state.notes.map((n: Note_t) => {
                if(n.name === name) {
                    return {...n, ytId: ytId}
                }
                return n
            })
            return { notes: updatedNotes, }
        })
    },
    addTranscription: (name: string, transcription: TranscriptLine[]) => {
        set((state: any) => {
            const updatedNotes = state.notes.map((n: Note_t) => {
                if(n.name === name) {
                    return {...n, transcription: transcription}
                }
                return n
            })
            return { notes: updatedNotes, }
        })
    },
    addExpansion: (name: string, expandedNote: ExpandedNote) => {
        set((state: any) => {
            const updatedNotes = state.notes.map((n: Note_t) => {
                if(n.name === name) {
                    return {...n, expansion: [...n.expansion, expandedNote]}
                }
                return n
            })
            return { notes: updatedNotes, }
        })
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
    startRecording: (name: string, time: number) => {
        set((state: any) => {
            const updatedNotes = state.notes.map((n: Note_t) => {
                if(n.name === name) {
                    return {...n, recording_start: time}
                }
                return n
            })
            return { notes: updatedNotes, }
        })
    },
})

export const useNoteStore = create(devtools(persist(NoteStore, { name: 'note-store' })))