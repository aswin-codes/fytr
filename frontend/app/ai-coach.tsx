import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fontFamily } from '@/src/theme/fontFamily';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// Constants for Gemini Multimodal Live API
const GEMINI_WS_URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BiDiSession";

export default function AICoachScreen() {
  const router = useRouter();
  const { exerciseName } = useLocalSearchParams<{ exerciseName: string }>();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [aiText, setAiText] = useState("Connecting to AI Coach...");

  const ws = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const frameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    connectToGemini();
    startTimer();

    return () => {
      stopSession();
    };
  }, []);

  const connectToGemini = () => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        setAiText("API Key missing. Please set EXPO_PUBLIC_GEMINI_API_KEY.");
        return;
    }

    const url = `${GEMINI_WS_URL}?key=${apiKey}`;

    try {
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
          console.log("Connected to Gemini Live API");
          setIsConnected(true);

          const setupMessage = {
            setup: {
              model: "models/gemini-2.0-flash-exp",
              generation_config: {
                response_modalities: ["audio", "text"],
              },
              system_instruction: {
                parts: [{
                  text: `You are a professional gym coach. You are helping a user with ${exerciseName}. Observe their form via the camera and listen to their questions. Provide concise, encouraging, and corrective feedback in real-time. Speak your responses.`
                }]
              }
            }
          };
          ws.current?.send(JSON.stringify(setupMessage));
          setAiText("Hello! I'm your AI Coach. I'm watching. How can I help with your " + (exerciseName || 'exercise') + "?");

          // Start streaming frames
          startFrameStreaming();
        };

        ws.current.onmessage = async (e) => {
            try {
                const data = JSON.parse(e.data);

                if (data.serverContent?.modelTurn?.parts) {
                    const parts = data.serverContent.modelTurn.parts;
                    for (const part of parts) {
                        if (part.text) {
                            setAiText(part.text);
                        }
                        if (part.inlineData) {
                            // Audio data in base64
                            playAudioResponse(part.inlineData.data);
                        }
                    }
                }
            } catch (err) {
                console.error("Error parsing Gemini message:", err);
            }
        };

        ws.current.onerror = (e) => {
          console.error("Gemini WebSocket error:", e);
          setAiText("Connection error. Please check your API key.");
        };

        ws.current.onclose = () => {
          console.log("Gemini WebSocket closed");
          setIsConnected(false);
          stopFrameStreaming();
        };
    } catch (error) {
        console.error("Failed to connect to Gemini:", error);
        setAiText("Failed to connect to coach.");
    }
  };

  const startFrameStreaming = () => {
      // Stream a frame every 2 seconds for analysis
      frameTimerRef.current = setInterval(async () => {
          if (cameraRef.current && ws.current?.readyState === WebSocket.OPEN) {
              try {
                  const photo = await cameraRef.current.takePictureAsync({
                      quality: 0.3,
                      base64: true,
                      scale: 0.5,
                  });

                  if (photo && photo.base64) {
                      const frameMessage = {
                          realtime_input: {
                              media_chunks: [{
                                  mime_type: "image/jpeg",
                                  data: photo.base64
                              }]
                          }
                      };
                      ws.current.send(JSON.stringify(frameMessage));
                  }
              } catch (err) {
                  console.error("Error capturing frame:", err);
              }
          }
      }, 2000);
  };

  const stopFrameStreaming = () => {
      if (frameTimerRef.current) clearInterval(frameTimerRef.current);
  };

  const playAudioResponse = async (base64Audio: string) => {
      try {
          // Stop previous sound
          if (soundRef.current) {
              await soundRef.current.unloadAsync();
          }

          // In Expo, to play base64, we write to a temp file
          const fileUri = FileSystem.cacheDirectory + 'ai_response.mp3';
          await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
              encoding: FileSystem.EncodingType.Base64,
          });

          const { sound } = await Audio.Sound.createAsync(
              { uri: fileUri },
              { shouldPlay: true }
          );
          soundRef.current = sound;
      } catch (err) {
          console.error("Error playing audio response:", err);
      }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          Alert.alert("Session Ended", "Your 3-minute coaching session has finished.");
          router.back();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopSession = () => {
    if (ws.current) ws.current.close();
    if (timerRef.current) clearInterval(timerRef.current);
    if (frameTimerRef.current) clearInterval(frameTimerRef.current);
    if (recordingRef.current) stopRecording();
    if (soundRef.current) soundRef.current.unloadAsync();
  };

  const startRecording = async () => {
      try {
          if (!micPermission?.granted) {
              const res = await requestMicPermission();
              if (!res.granted) return;
          }

          await Audio.setAudioModeAsync({
              allowsRecordingIOS: true,
              playsInSilentModeIOS: true,
          });

          const { recording } = await Audio.Recording.createAsync(
              Audio.RecordingOptionsPresets.LOW_QUALITY // Lower quality for smaller chunks
          );
          recordingRef.current = recording;
          setIsRecording(true);
      } catch (err) {
          console.error('Failed to start recording', err);
      }
  };

  const stopRecording = async () => {
      if (!recordingRef.current) return;
      try {
          setIsRecording(false);
          await recordingRef.current.stopAndUnloadAsync();
          const uri = recordingRef.current.getURI();

          if (uri && ws.current && ws.current.readyState === WebSocket.OPEN) {
              const base64Audio = await FileSystem.readAsStringAsync(uri, {
                  encoding: FileSystem.EncodingType.Base64,
              });

              const audioMessage = {
                  realtime_input: {
                      media_chunks: [{
                          mime_type: "audio/mp4", // expo-av default on most platforms
                          data: base64Audio
                      }]
                  }
              };
              ws.current.send(JSON.stringify(audioMessage));
          }

          recordingRef.current = null;
      } catch (err) {
          console.error('Failed to stop recording', err);
      }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!cameraPermission || !micPermission) {
    return (
        <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#F6F000" size="large" />
        </View>
    );
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-6">
        <Ionicons name="lock-closed" size={64} color="#F6F000" className="mb-6" />
        <Text style={{ fontFamily: fontFamily.bold }} className="text-white text-xl text-center mb-4">Permissions Required</Text>
        <Text style={{ fontFamily: fontFamily.regular }} className="text-gray-400 text-center mb-8">
            AI Coach needs camera and microphone access to see and hear you during the session.
        </Text>
        <TouchableOpacity
          onPress={() => { requestCameraPermission(); requestMicPermission(); }}
          className="bg-primary px-8 py-4 rounded-full"
        >
          <Text style={{ fontFamily: fontFamily.bold }} className="text-black text-base">Grant Permissions</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} className="mt-6">
            <Text style={{ fontFamily: fontFamily.medium }} className="text-gray-500">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front" />

      <SafeAreaView style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* AI Voice Visualization Area */}
        <View style={styles.centerArea}>
          <View style={[styles.pulseCircle, isConnected && styles.pulseActive]}>
             <Ionicons name="sparkles" size={40} color={isConnected ? "#F6F000" : "#666"} />
          </View>
          <Text style={styles.exerciseNameTitle}>{exerciseName}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.aiTextDisplay}>{aiText}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPressIn={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                startRecording();
            }}
            onPressOut={stopRecording}
            activeOpacity={0.7}
            style={[styles.micButton, isRecording && styles.micButtonActive]}
          >
            <Ionicons name={isRecording ? "mic" : "mic-outline"} size={32} color="black" />
          </TouchableOpacity>
          <Text style={styles.instructionText}>
            {isRecording ? "Listening..." : "Hold to talk to your coach"}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  timerText: {
    color: 'white',
    fontFamily: fontFamily.bold,
    fontSize: 16,
  },
  centerArea: {
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pulseActive: {
    borderColor: '#F6F000',
    backgroundColor: 'rgba(246, 240, 0, 0.1)',
    shadowColor: '#F6F000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  exerciseNameTitle: {
    color: 'white',
    fontSize: 26,
    fontFamily: fontFamily.bold,
    marginBottom: 15,
    textAlign: 'center',
  },
  textContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 24,
    borderRadius: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  aiTextDisplay: {
    color: 'white',
    fontSize: 18,
    fontFamily: fontFamily.medium,
    textAlign: 'center',
    lineHeight: 28,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  micButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F6F000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  micButtonActive: {
    backgroundColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  instructionText: {
    color: 'white',
    fontFamily: fontFamily.medium,
    fontSize: 14,
    opacity: 0.7,
  },
});
