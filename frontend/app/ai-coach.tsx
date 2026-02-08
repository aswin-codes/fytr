import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { BlurView } from 'expo-blur';

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;
const MODEL_NAME = "models/gemini-2.0-flash-exp";

export default function AICoachScreen() {
  const router = useRouter();
  const { exerciseName } = useLocalSearchParams<{ exerciseName: string }>();

  // Permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // State
  const [isComponentsReady, setIsComponentsReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [aiText, setAiText] = useState("Initializing...");
  const [formCorrection, setFormCorrection] = useState<string | null>(null);
  const [isStreamingStarted, setIsStreamingStarted] = useState(false);
  const lastResponseTimeRef = useRef<number>(Date.now());

  // Refs
  const ws = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackNudgeRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const audioQueue = useRef<string[]>([]);
  const audioChunksBuffer = useRef<string[]>([]); // Buffer for collecting audio chunks
  const isPlayingRef = useRef(false);
  const isVideoActive = useRef(false);
  const currentSoundRef = useRef<Audio.Sound | null>(null);
  const waveformAnim = useRef(new Animated.Value(0)).current;

  // --- 1. INITIALIZATION SEQUENCE ---
  useEffect(() => {
    let isMounted = true;

    const sequenceInit = async () => {
      // Step A: Check Permissions
      if (!cameraPermission?.granted || !micPermission?.granted) return;
      if (!GEMINI_API_KEY) {
        setAiText("API Key Missing!");
        return;
      }

      try {
        // Step B: Setup Audio Mode (CRITICAL: Do this before Camera mounts)
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Step C: Mark components as ready to render (Mounts Camera)
        if (isMounted) setIsComponentsReady(true);

        // Step D: Wait a moment for Camera to settle, then Connect
        setTimeout(() => {
          if (isMounted) connectToGemini();
        }, 1000);

      } catch (e) {
        console.error("Init Error:", e);
        Alert.alert("Initialization Error", "Could not setup audio/video.");
      }
    };

    sequenceInit();
    return () => { isMounted = false; cleanupSession(); };
  }, [cameraPermission, micPermission]);

  // --- 2. WEBSOCKET CONNECTION ---
  const connectToGemini = () => {
    if (ws.current) ws.current.close();
    setConnectionStatus('connecting');

    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      console.log("Connected. Sending Setup...");
      
      const setupMessage = {
        setup: {
          model: MODEL_NAME,
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Puck" // Options: Puck, Charon, Kore, Fenrir, Aoede
                }
              }
            }
          },
          systemInstruction: {
            parts: [{
              text: `You are an AI fitness coach giving live feedback using VERY LOW-FPS camera snapshots.

CRITICAL REALITY CONSTRAINTS:
- You receive infrequent, blurry, downscaled images.
- Visual details (like clothing color) may be unclear or unreliable.
- You MUST NOT guess visual details.

ABSOLUTE RULES:
1. If you are NOT CERTAIN about something you see, say:
   - "I can’t clearly tell"
   - "That’s hard to see from the frames"
   - "I’m not confident about that detail"
2. NEVER guess colors, clothing, or appearance.
3. NEVER invent visual details to answer a question.
4. Only describe what you are visually confident about.

MOVEMENT INTERPRETATION:
- If body position or posture changes across frames, assume the user IS exercising.
- Motion can be inferred across multiple frames.
- Do NOT require continuous movement in one image.

FEEDBACK RULES:
- Prioritize acknowledging movement over denying it.
- If unsure about form, say so briefly and encourage continuation.

REP COUNTING:
- Count reps approximately.
- If uncertain, say "That looks like rep X" instead of denying reps.

STYLE:
- 1 short sentence (2 max)
- Supportive and factual
- Honest about uncertainty

GOOD RESPONSES:
- "I see movement — keep going"
- "That looks like a rep, continue"
- "Hard to see fine details, but your movement looks good"

BAD RESPONSES (FORBIDDEN):
- Saying the user isn’t exercising when movement exists
- Confident statements about unclear visuals
`
            }]
          }
        }
      };
      
      console.log("Sending setup:", JSON.stringify(setupMessage, null, 2));
      socket.send(JSON.stringify(setupMessage));
    };

    socket.onmessage = async (event) => {
      try {
        let msgData = event.data;
        
        console.log("Raw message type:", typeof msgData);
        console.log("Raw message:", msgData);

        // Handle Blob (React Native WebSocket returns Blob for binary data)
        if (msgData instanceof Blob) {
          msgData = await msgData.text(); // Use Blob.text() instead of FileReader
        }
        
        // Handle ArrayBuffer
        if (msgData instanceof ArrayBuffer) {
          const decoder = new TextDecoder();
          msgData = decoder.decode(msgData);
        }

        console.log("Processed message:", msgData);

        // Skip empty messages
        if (!msgData || msgData.length === 0) {
          console.log("Empty message received, skipping");
          return;
        }

        const data = JSON.parse(msgData as string);

        if (data.setupComplete) {
          console.log("✅ Gemini Live Ready");
          setConnectionStatus('connected');
          setFormCorrection("Starting session...");
          
          // Send initial message to trigger Gemini's introduction
          sendToGemini({
            clientContent: {
              turns: [{
                role: "user",
                parts: [{ text: "Hello! I'm ready to start my workout. Please introduce yourself and let me know you're ready to provide form feedback." }]
              }],
              turnComplete: true
            }
          });
        }

        if (data.serverContent) {
          console.log("Server content received", isStreamingStarted ? "(during streaming)" : "(initial)");
          
          // Update last response time
          lastResponseTimeRef.current = Date.now();
          
          // Check if this is the end of a turn
          const turnComplete = data.serverContent.turnComplete;
          
          // Play Audio Chunks Immediately (Streaming)
          const audioPart = data.serverContent.modelTurn?.parts?.find((p:any) => p.inlineData);
          if (audioPart) {
            console.log("🔊 Received audio chunk");
            queueAudio(audioPart.inlineData.data);
          }
          
          // Show Text
          const textPart = data.serverContent.modelTurn?.parts?.find((p:any) => p.text);
          if (textPart) {
            console.log("💬 Received text:", textPart.text);
            setFormCorrection(textPart.text);
            
            // Auto-clear feedback after 8 seconds if streaming
            if (isStreamingStarted) {
              setTimeout(() => {
                setFormCorrection("Watching your form...");
              }, 8000);
            }
          }
          
          // After first response, start streaming (only once)
          if (turnComplete && !isStreamingStarted) {
            console.log("✅ First turn complete, starting audio/video streaming...");
            setIsStreamingStarted(true);
            setFormCorrection("Watching your form...");
            setTimeout(() => {
              startAudioStreaming();
              startVideoStreaming();
              startFeedbackNudge();
            }, 1000); // Small delay to let audio finish playing
          }
        }

        // Handle tool call responses (if any)
        if (data.toolCall) {
          console.log("Tool call:", data.toolCall);
        }

        // Handle errors from server
        if (data.error) {
          console.error("Server error:", data.error);
          setConnectionStatus('error');
          setFormCorrection(`Error: ${data.error.message || 'Unknown error'}`);
        }

      } catch (e) {
        console.error("Parse Error:", e);
        console.error("Error details:", e instanceof Error ? e.message : 'Unknown error');
      }
    };

    socket.onerror = (e) => {
      console.error("Socket Error:", e);
      setConnectionStatus('error');
      setFormCorrection("Connection error occurred");
    };

    socket.onclose = (e) => {
      console.log("Socket Closed:", e.code, e.reason);
      setConnectionStatus('idle');
      if (e.code !== 1000) {
        setFormCorrection(`Connection closed: ${e.reason || 'Unknown reason'}`);
      }
    };
  };

  // --- 3. AUDIO STREAMING (MIC) ---
  const startAudioStreaming = () => {
    console.log("Starting audio streaming...");
    recordChunk(); 
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    audioIntervalRef.current = setInterval(recordChunk, 2000); // 2 seconds for better responsiveness
  };

  const recordChunk = async () => {
    if (ws.current?.readyState !== WebSocket.OPEN || isMuted) return;

    try {
      let previousUri: string | null = null;

      // 1. Stop previous recording
      if (recordingRef.current) {
        try {
          previousUri = recordingRef.current.getURI();
          await recordingRef.current.stopAndUnloadAsync();
          recordingRef.current = null;
        } catch (stopError) {
          console.log("Error stopping recording:", stopError);
        }
      }

      // 2. Start new recording IMMEDIATELY to minimize gaps
      if (ws.current?.readyState === WebSocket.OPEN && !isMuted) {
        try {
          const { recording } = await Audio.Recording.createAsync({
            ...Audio.RecordingOptionsPresets.LOW_QUALITY,
            android: {
                extension: '.wav',
                outputFormat: Audio.AndroidOutputFormat.DEFAULT,
                audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
                sampleRate: 16000,
                numberOfChannels: 1,
            },
            ios: {
                extension: '.wav',
                audioQuality: Audio.IOSAudioQuality.LOW,
                sampleRate: 16000,
                numberOfChannels: 1,
                bitRate: 128000,
                linearPCMBitDepth: 16,
                linearPCMIsBigEndian: false,
                linearPCMIsFloat: false,
            },
          });
          recordingRef.current = recording;
        } catch (startError) {
          console.log("Error starting recording:", startError);
        }
      }

      // 3. Process and send the PREVIOUS recording (if any)
      if (previousUri) {
        try {
          // Read the WAV file as base64
          const wavBase64 = await FileSystem.readAsStringAsync(previousUri, { encoding: 'base64' });

          // Decode WAV to get PCM data (skip 44-byte WAV header)
          const wavBinary = atob(wavBase64);
          const wavBytes = new Uint8Array(wavBinary.length);
          for (let i = 0; i < wavBinary.length; i++) {
            wavBytes[i] = wavBinary.charCodeAt(i);
          }

          // Extract PCM data (skip 44-byte header)
          const pcmBytes = wavBytes.slice(44);

          // Convert back to base64
          let pcmBinary = '';
          for (let i = 0; i < pcmBytes.length; i++) {
            pcmBinary += String.fromCharCode(pcmBytes[i]);
          }
          const pcmBase64 = btoa(pcmBinary);

          // Send as PCM with sample rate specified in MIME type
          sendToGemini({
            realtimeInput: {
                mediaChunks: [{
                mimeType: "audio/pcm;rate=16000",
                data: pcmBase64
                }]
            }
          });
          console.log("✓ Sent audio chunk:", pcmBase64.length, "bytes");
        } catch (processError) {
          console.error("Error processing/sending audio chunk:", processError);
        }
      }
    } catch (e) {
      console.error("Mic Cycle Error:", e);
      recordingRef.current = null;
    }
  };

  // --- 4. VIDEO STREAMING (CAMERA) ---
 const startVideoStreaming = () => {
    console.log("Starting high-frequency video streaming...");
    isVideoActive.current = true;
    captureFrameLoop();
  };

  const captureFrameLoop = async () => {
    // 1. Stop condition
    if (!isVideoActive.current || !cameraRef.current || ws.current?.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      // 2. Take the picture (Optimized for speed)
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.1,    // Lowest quality (sufficient for AI form checks)
        base64: true,    // We need the string
        skipProcessing: true, // Android: Skip orientation/processing for speed
        shutterSound: false,
        // scale: 0.1 is not a valid prop for takePictureAsync in newer versions, 
        // we rely on 'quality' and internal resizing if available, 
        // or just send the lower quality full frame.
      });

      // 3. Send to Gemini immediately
      if (photo.base64) {
        sendToGemini({
          realtimeInput: {
            mediaChunks: [{
              mimeType: "image/jpeg",
              data: photo.base64
            }]
          }
        });
      }
    } catch (e) {
      console.log("Frame skipped:", e);
    }

    // 4. Loop immediately (or with a tiny delay like 100ms)
    // Using setTimeout prevents stack overflow and allows UI thread to breathe
    if (isVideoActive.current) {
      setTimeout(captureFrameLoop, 200); // 200ms = ~5 FPS (Good balance)
    }
  };

  const sendToGemini = (data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  };

  // --- 6. FEEDBACK NUDGE ---
  const startFeedbackNudge = () => {
    console.log("Starting feedback nudge timer...");
    if (feedbackNudgeRef.current) clearInterval(feedbackNudgeRef.current);
    
    feedbackNudgeRef.current = setInterval(() => {
      const timeSinceLastResponse = Date.now() - lastResponseTimeRef.current;
      
      // If no response in 15 seconds, send a text prompt
      if (timeSinceLastResponse > 15000 && ws.current?.readyState === WebSocket.OPEN) {
        console.log("⏰ Nudging for feedback...");
        sendToGemini({
          clientContent: {
            turns: [{
              role: "user",
              parts: [{ text: "How's my form looking? Only answer what you can clearly see. Now what color tshirt am I wearing ? " }]
            }],
            turnComplete: true
          }
        });
      }
    }, 15000); // Check every 15 seconds
  };

  // --- 7. AUDIO CHUNK CONCATENATION ---
  const concatenateAudioChunks = (chunks: string[]): string => {
    if (chunks.length === 1) return chunks[0];
    
    // Decode all chunks to binary
    const pcmArrays: Uint8Array[] = [];
    let totalLength = 0;
    
    for (const chunk of chunks) {
      const binary = atob(chunk);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      pcmArrays.push(bytes);
      totalLength += bytes.length;
    }
    
    // Concatenate all PCM data
    const concatenated = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of pcmArrays) {
      concatenated.set(arr, offset);
      offset += arr.length;
    }
    
    // Convert back to base64
    let binary = '';
    for (let i = 0; i < concatenated.length; i++) {
      binary += String.fromCharCode(concatenated[i]);
    }
    
    return btoa(binary);
  };

  // --- 5. AUDIO PLAYBACK (PCM to WAV) ---
  const queueAudio = (pcmBase64: string) => {
    console.log("📥 Queueing audio chunk, queue length:", audioQueue.current.length);
    audioQueue.current.push(pcmBase64);
    if (!isPlayingRef.current) {
      playNext();
    }
  };

  const playNext = async () => {
    if (audioQueue.current.length === 0) {
      isPlayingRef.current = false;
      console.log("✅ Audio queue empty");
      return;
    }
    
    isPlayingRef.current = true;
    const pcmBase64 = audioQueue.current.shift();
    
    try {
      // Unload previous sound if it exists
      if (currentSoundRef.current) {
        await currentSoundRef.current.unloadAsync().catch(() => {});
        currentSoundRef.current = null;
      }

      // Decode PCM base64 to binary
      const pcmBinary = atob(pcmBase64!);
      const pcmBytes = new Uint8Array(pcmBinary.length);
      for (let i = 0; i < pcmBinary.length; i++) {
        pcmBytes[i] = pcmBinary.charCodeAt(i);
      }
      
      console.log("🔊 Playing audio chunk:", pcmBytes.length, "bytes, queue remaining:", audioQueue.current.length);
      
      // Create WAV header for 24kHz, 16-bit, mono PCM
      const wavHeader = createWavHeader(pcmBytes.length, 24000, 1, 16);
      
      // Combine header + PCM data
      const wavFile = new Uint8Array(wavHeader.length + pcmBytes.length);
      wavFile.set(wavHeader, 0);
      wavFile.set(pcmBytes, wavHeader.length);
      
      // Convert to base64 for FileSystem
      let binary = '';
      for (let i = 0; i < wavFile.length; i++) {
        binary += String.fromCharCode(wavFile[i]);
      }
      const wavBase64 = btoa(binary);
      
      const uri = `${FileSystem.cacheDirectory}ai_response_${Date.now()}.wav`;
      await FileSystem.writeAsStringAsync(uri, wavBase64, { encoding: 'base64' });

      // Create sound object
      const { sound } = await Audio.Sound.createAsync(
        { uri }, 
        { 
          shouldPlay: false,  // Don't auto-play yet
          volume: 1.0,
          progressUpdateIntervalMillis: 100,
        }
      );
      
      currentSoundRef.current = sound;

      // Set up playback status listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            console.log("✓ Audio chunk finished");
            sound.unloadAsync().catch(() => {});
            currentSoundRef.current = null;
            // Wait a tiny bit before playing next to avoid gaps
            setTimeout(() => playNext(), 50);
          } else if (status.isPlaying) {
            // Audio is playing normally
          }
        } else if (status.error) {
          console.error("Audio playback error:", status.error);
          sound.unloadAsync().catch(() => {});
          currentSoundRef.current = null;
          playNext();
        }
      });

      // Now play the sound
      await sound.playAsync();
      
    } catch (e) {
      console.error("Playback error:", e);
      if (currentSoundRef.current) {
        await currentSoundRef.current.unloadAsync().catch(() => {});
        currentSoundRef.current = null;
      }
      // Continue to next chunk even on error
      setTimeout(() => playNext(), 50);
    }
  };

  // Create WAV header as Uint8Array with proper parameters
  const createWavHeader = (
    dataLength: number, 
    sampleRate: number, 
    numChannels: number = 1, 
    bitsPerSample: number = 16
  ): Uint8Array => {
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const fileSize = 36 + dataLength;
    
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, fileSize, true);
    writeString(8, 'WAVE');
    
    // fmt chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);              // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);               // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);     // NumChannels
    view.setUint32(24, sampleRate, true);      // SampleRate
    view.setUint32(28, byteRate, true);        // ByteRate
    view.setUint16(32, blockAlign, true);      // BlockAlign
    view.setUint16(34, bitsPerSample, true);   // BitsPerSample
    
    // data chunk
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    return new Uint8Array(buffer);
  };

  // --- CLEANUP ---
  const cleanupSession = () => {
    // Stop the video loop
    isVideoActive.current = false;
    
    if (ws.current) { ws.current.close(); ws.current = null; }
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    
    // Remove videoIntervalRef logic since we are using the recursive loop now
    // if (videoIntervalRef.current) clearInterval(videoIntervalRef.current); 
    
    if (feedbackNudgeRef.current) clearInterval(feedbackNudgeRef.current);
    if (recordingRef.current) { 
      recordingRef.current.stopAndUnloadAsync().catch(() => {}); 
      recordingRef.current = null;
    }
    if (currentSoundRef.current) { 
      currentSoundRef.current.unloadAsync().catch(() => {}); 
      currentSoundRef.current = null;
    }
  };

  const endSession = () => {
    cleanupSession();
    router.back();
  };

  // --- RENDER ---
  if (!cameraPermission?.granted || !micPermission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={{color:'white'}}>Permissions Required</Text>
        <TouchableOpacity onPress={() => {requestCameraPermission(); requestMicPermission();}} style={styles.btn}>
           <Text>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isComponentsReady && (
        <CameraView 
          ref={cameraRef} 
          style={StyleSheet.absoluteFill} 
          facing="front" 
          mute={true} 
          flash="off"
        />
      )}
      
      <View style={styles.darkOverlay} />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
            <TouchableOpacity onPress={endSession} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            
            <View style={{alignItems:'center'}}>
                <Text style={styles.title}>{exerciseName || "AI Coach"}</Text>
                <Text style={{color: connectionStatus==='connected' ? '#4CAF50':'#FFC107', fontSize:12, fontWeight:'bold'}}>
                    {connectionStatus === 'connected' ? "● LIVE" : `● ${connectionStatus.toUpperCase()}`}
                </Text>
            </View>
            <View style={{width: 40}} />
        </View>

        <BlurView intensity={30} style={styles.correction}>
            <Ionicons name="pulse" size={24} color={connectionStatus==='connected' ? "#4CAF50" : "white"} />
            <Text style={styles.correctionText}>
                {formCorrection || (connectionStatus === 'connected' ? "Listening & Watching..." : "Connecting...")}
            </Text>
        </BlurView>

        <View style={styles.footer}>
            <View style={styles.controls}>
                <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={[styles.controlBtn, isMuted && {backgroundColor:'#FF3B30'}]}>
                    <Ionicons name={isMuted ? "mic-off" : "mic"} size={28} color={isMuted ? "white" : "black"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={endSession} style={[styles.controlBtn, {backgroundColor:'#FF3B30'}]}>
                    <Ionicons name="stop" size={28} color="white" />
                </TouchableOpacity>
            </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
  darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', marginTop: 10 },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  correction: { flexDirection: 'row', marginHorizontal: 20, padding: 20, borderRadius: 16, overflow: 'hidden', alignItems: 'center', gap: 12, backgroundColor: 'rgba(0,0,0,0.5)' },
  correctionText: { color: 'white', fontSize: 16, flex: 1, fontWeight: '500' },
  footer: { padding: 40, alignItems: 'center' },
  controls: { flexDirection: 'row', gap: 40 },
  controlBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  btn: { backgroundColor: 'white', padding: 15, borderRadius: 25, marginTop: 20 },
});