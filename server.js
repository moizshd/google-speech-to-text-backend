const express = require('express');
const bodyParser = require('body-parser');
const speech = require('@google-cloud/speech');
const socketIo = require('socket.io');
const cors = require('cors');
process.env["GOOGLE_APPLICATION_CREDENTIALS"] = "D:\\Projects\\google-speech-to-text\\speech-server\\google-credentials.json";

const app = express();
const corsOptions = {
    origin: '*', // Allows all origins
    optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

const server = require('http').Server(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});
const client = new speech.SpeechClient();

io.on('connection', (socket) => {
    console.log('Client connected');
    // socket.on('streamAudio', async (data) => {
    //     console.log('Received audio stream from client');  // Add this
    //     const audioBytes = data.audio;
    //     const request = {
    //         audio: {
    //             content: audioBytes,
    //         },
    //         config: {
    //             encoding: 'LINEAR16',
    //             sampleRateHertz: 16000,
    //             languageCode: 'en-US',
    //         },
    //     };

    //     try {
    //         const [response] = await client.recognize(request);
    //         const transcription = response.results
    //             .map(result => result.alternatives[0].transcript)
    //             .join('\n');

    //         socket.emit('transcription', transcription);
    //     } catch (e) {
    //         console.error('Error transcribing audio:', e);
    //     }
    // });
    socket.on('streamAudio', async (data) => {
        console.log('Received audio stream from client');
        const audioBytes = data.audio;
        const request = {
            audio: {
                content: audioBytes,
            },
            config: {
                encoding: 'LINEAR16',
                sampleRateHertz: 48000, // Adjusted to match the WAV header
                languageCode: 'en-US',
            },
        };

        try {
            const [response] = await client.recognize(request);
            const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');

            console.log(`Transcription: ${transcription}`);  // Add this

            socket.emit('transcription', transcription);
        } catch (e) {
            console.error('Error transcribing audio:', e);
        }
    });

});

try {
    server.listen(4000, () => {
        console.log('Server listening on port 4000');
    });
} catch (error) {
    console.error('Error starting server:', error);
}
