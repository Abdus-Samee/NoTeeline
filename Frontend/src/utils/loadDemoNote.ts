import { Note_t } from "../state/noteStore"

export const getDemoNote = (): Note_t => {
    const demo_note: Note_t = {
        name: "Demo Note",
        ytId: "w0QbnxKRD0w",
        micronote: true,
        content: [
            {
                "created_at": 7.265976003814697,
                "point": "tapping int conn",
                "utc_time": 1727725336596
            },
            {
                "created_at": 15.339126043869019,
                "point": "overhearin pckts",
                "utc_time": 1727725344733
            },
            {
                "created_at": 22.419582003814696,
                "point": "eaves dropping",
                "utc_time": 1727725352512
            },
            {
                "created_at": 34.53803586648559,
                "point": "wiretap connection",
                "utc_time": 1727725363887
            },
            {
                "created_at": 43.619564064849854,
                "point": "https",
                "utc_time": 1727725372948
            }
        ],
        transcription: [
            {
                "text": "Can your internet connection be tapped like\na telephone line?",
                "offset": 2.12,
                "duration": 3.54
            },
            {
                "text": "In a word, Yes!",
                "offset": 5.66,
                "duration": 1.11
            },
            {
                "text": "If you’re using a wireless network to Google\nsomething,",
                "offset": 6.77,
                "duration": 3.23
            },
            {
                "text": "other devices in the room with wireless connectivity\ncan overhear your packets (byte-sized-message)",
                "offset": 10,
                "duration": 4.41
            },
            {
                "text": "and see what you’re doing!",
                "offset": 14.41,
                "duration": 2.32
            },
            {
                "text": "Overhearing a conversation like conversation\nin real life (in the cyber world) is also",
                "offset": 16.73,
                "duration": 4.299
            },
            {
                "text": "called as Eavesdropping!",
                "offset": 21.029,
                "duration": 1.791
            },
            {
                "text": "Your neighbor or a person sitting outside\nyour house can eavesdrop with the right hardware",
                "offset": 22.82,
                "duration": 4.09
            },
            {
                "text": "and software.",
                "offset": 26.91,
                "duration": 1.61
            },
            {
                "text": "If you’re using a wired connection,\none can directly wiretap your connection just",
                "offset": 28.52,
                "duration": 4.47
            },
            {
                "text": "like a telephone line.",
                "offset": 32.99,
                "duration": 1.7
            },
            {
                "text": "If you want your communication to be private,\nencryption is the key!",
                "offset": 34.69,
                "duration": 4.169
            },
            {
                "text": "The HTTPS in web-browser indicates that your\ncommunication with the server is encrypted.",
                "offset": 38.859,
                "duration": 5.72
            },
            {
                "text": "Everyone can still eavesdrop but they can’t\nunderstand the content of the conversation!",
                "offset": 44.579,
                "duration": 5.281
            },
            {
                "text": "But how HTTPS works?",
                "offset": 49.86,
                "duration": 1.92
            },
            {
                "text": "Let’s say you lock some confidential information\nin a box using a unique symmetric key and",
                "offset": 51.78,
                "duration": 6.18
            },
            {
                "text": "send it (the key and the box) to the server.",
                "offset": 57.96,
                "duration": 1.93
            },
            {
                "text": "The server opens the box using the key it\nreceived along with the box.",
                "offset": 59.89,
                "duration": 3.93
            },
            {
                "text": "But anyone tapping this connection also receives\nthe box and the key.",
                "offset": 63.82,
                "duration": 4.93
            },
            {
                "text": "And this is a problem!",
                "offset": 68.75,
                "duration": 2.04
            },
            {
                "text": "To solve this, we’ve a special type of box\nat the server side which can be locked using",
                "offset": 70.79,
                "duration": 4.47
            },
            {
                "text": "a public key but opened only using a private\nkey.",
                "offset": 75.26,
                "duration": 4.4
            },
            {
                "text": "The server provides you this special box and\npublic key but keeps the private key secret",
                "offset": 79.66,
                "duration": 4.4
            },
            {
                "text": "from everyone.",
                "offset": 84.06,
                "duration": 1
            },
            {
                "text": "You can put your original box and unique symmetric\nkey inside this special box,",
                "offset": 85.06,
                "duration": 5.73
            },
            {
                "text": "lock it using server’s public key and send\nit to the server.",
                "offset": 90.79,
                "duration": 4.43
            },
            {
                "text": "Only the server can open this special box\nusing its private key.",
                "offset": 95.22,
                "duration": 4.27
            },
            {
                "text": " ",
                "offset": 99.49,
                "duration": 1
            },
            {
                "text": "Therefore you’ve safely shared the unique\nsymmetric key which can be used to unlock",
                "offset": 100.49,
                "duration": 3.22
            },
            {
                "text": "and lock the original box.",
                "offset": 103.71,
                "duration": 2.12
            },
            {
                "text": "Now your browser and server can exchange data\nin normal boxes and need not share the unique",
                "offset": 105.83,
                "duration": 4.88
            },
            {
                "text": "symmetric key again.",
                "offset": 110.71,
                "duration": 2.21
            },
            {
                "text": "This is how encryption works, except there\nis no box!",
                "offset": 112.92,
                "duration": 18.18
            }
        ],
        expansion: [],
        generatedSummary: "",
        generatedSummary_P: "",
        theme_count: 0,
        time_count: 0,
        expand_count: 0,
        created_at: Date.now(),
        updated_at: Date.now(),
        recording_start: Date.now()
    }

    return demo_note
}