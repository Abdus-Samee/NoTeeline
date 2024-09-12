import { Note_t } from "../state/noteStore"

export const getDemoNote = (): Note_t => {
    const demo_note: Note_t = {
        name: "Demo Note",
        ytId: "w0QbnxKRD0w",
        micronote: true,
        content: [],
        transcription: [],
        expansion: [],
        generatedSummary: "",
        generatedSummary_P: "",
        theme_count: 0,
        time_count: 0,
        expand_count: 0,
        created_at: Date.now(),
        updated_at: Date.now(),
        recording_start: 0
    }

    return demo_note
}