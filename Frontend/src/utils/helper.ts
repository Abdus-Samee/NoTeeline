import { NotePoint, TranscriptLine } from "../state/noteStore"

const WINDOW_SIZE = 20000 //20000ms

export const expandPoint = (point: NotePoint, transcript: TranscriptLine[]) => {
    let expandedPoint = { point: point.point, transcript: [] as string[] }
    for(var i = 0; i < transcript.length; i++) {
        let tr_offset = transcript[i].offset
        let tr_end = transcript[i].offset + transcript[i].duration
        let right = point.created_at*1000.0 //converting to ms to match transcript time
        let left = right - WINDOW_SIZE

        //there is partial or full overlapping between point and transcript
        if(!(right < tr_offset) && !(left > tr_end)) {
            expandedPoint.transcript.push(transcript[i].text)
        }
    }

    return expandedPoint
}