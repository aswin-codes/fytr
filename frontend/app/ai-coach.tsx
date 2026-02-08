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
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fontFamily } from '@/src/theme/fontFamily';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { BlurView } from 'expo-blur';

// Constants for Gemini Multimodal Live API
const GEMINI_WS_URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BiDiSession";

export default function AICoachScreen() {
  const router = useRouter();
  const { exerciseName } = useLocalSearchParams<{ exerciseName: string }>();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [aiText, setAiText] = useState("Connecting to AI Coach...");
  const [formCorrection, setFormCorrection] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const frameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const waveformAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startWaveformAnimation();
    connectToGemini();
    startTimer();

    return () => {
      stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Continuous recording logic when not muted
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected && !isMuted && !isPaused) {
        startRecording();
        interval = setInterval(async () => {
            await stopRecording();
            await startRecording();
        }, 4000);
    }
    return () => {
        if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isMuted, isPaused]);

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
                response_modalities: ["AUDIO"],
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

                // Handle setup complete
                if (data.setupComplete) {
                    console.log("Gemini Setup Complete");
                    return;
                }

                if (data.serverContent?.modelTurn?.parts) {
                    const parts = data.serverContent.modelTurn.parts;
                    for (const part of parts) {
                        if (part.text) {
                            setAiText(part.text);
                            // Simple logic to show form corrections in the floating card
                            if (part.text.toLowerCase().includes('correction') ||
                                part.text.toLowerCase().includes('form') ||
                                part.text.length < 60) {
                                setFormCorrection(part.text);
                            }
                        }
                        if (part.inlineData) {
                            // Audio data in base64
                            playAudioResponse(part.inlineData.data);
                        }
                    }
                }

                // Also handle simple serverContent if it's just audio/text
                if (data.serverContent?.turnComplete) {
                    console.log("Turn complete");
                }
            } catch (err) {
                console.error("Error parsing Gemini message:", err);
            }
        };

        ws.current.onerror = (e: any) => {
          console.error("Gemini WebSocket error:", e.message || e);
          setAiText("Connection error. Ensure your API key is correct and has access to Gemini 2.0 Flash.");
        };

        ws.current.onclose = (event) => {
          console.log(`Gemini WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
          setIsConnected(false);
          stopFrameStreaming();
          if (event.code !== 1000) {
              setAiText(`Connection lost (Code ${event.code}). Please try again.`);
          }
        };
    } catch (error) {
        console.error("Failed to connect to Gemini:", error);
        setAiText("Failed to connect to coach.");
    }
  };

  const startFrameStreaming = () => {
      // Stream a frame every 2 seconds for analysis
      frameTimerRef.current = setInterval(async () => {
          if (cameraRef.current && ws.current?.readyState === WebSocket.OPEN && !isPaused) {
              try {
                  const photo = await cameraRef.current.takePictureAsync({
                      quality: 0.3,
                      base64: true,
                      scale: 0.5,
                  });

                  if (photo && photo.base64 && ws.current?.readyState === WebSocket.OPEN) {
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
          const fileUri = ((FileSystem as any).cacheDirectory || '') + 'ai_response.mp3';
          await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
              encoding: 'base64' as any,
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
      if (isPaused) return;
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

  const startWaveformAnimation = () => {
      Animated.loop(
          Animated.sequence([
              Animated.timing(waveformAnim, {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: false,
              }),
              Animated.timing(waveformAnim, {
                  toValue: 0,
                  duration: 500,
                  useNativeDriver: false,
              })
          ])
      ).start();
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
      } catch (err) {
          console.error('Failed to start recording', err);
      }
  };

  const stopRecording = async () => {
      if (!recordingRef.current) return;
      try {
          await recordingRef.current.stopAndUnloadAsync();
          const uri = recordingRef.current.getURI();

          if (uri && ws.current && ws.current.readyState === WebSocket.OPEN) {
              const base64Audio = await FileSystem.readAsStringAsync(uri, {
                  encoding: 'base64' as any,
              });

              const audioMessage = {
                  realtime_input: {
                      media_chunks: [{
                          // Gemini Live prefers audio/pcm;rate=16000 but we send what expo-av provides
                          // audio/mp4 might not be supported by Gemini Live BiDiSession
                          mime_type: "audio/mp4",
                          data: base64Audio
                      }]
                  }
              };
              if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify(audioMessage));
              }
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

      {/* Dark overlay for camera to make text readable */}
      <View style={styles.darkOverlay} />

      <SafeAreaView style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>AI Coach · {exerciseName}</Text>
            <View style={styles.liveIndicatorContainer}>
               <View style={styles.redDot} />
               <Text style={styles.liveText}>LIVE SESSION</Text>
            </View>
          </View>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        {/* Floating Correction Card */}
        {formCorrection && (
          <View style={styles.correctionCardContainer}>
            <BlurView intensity={80} tint="dark" style={styles.correctionCard}>
                <View style={styles.correctionHeader}>
                    <Ionicons name="warning" size={18} color="#F6F000" />
                    <Text style={styles.correctionTitle}>FORM CORRECTION</Text>
                </View>
                <Text style={styles.correctionText}>{formCorrection}</Text>
            </BlurView>
          </View>
        )}

        {/* Coaching status and Waveform */}
        <View style={styles.coachingStatusContainer}>
            <View style={styles.waveformContainer}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Animated.View
                        key={i}
                        style={[
                            styles.waveformBar,
                            {
                                height: waveformAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [10, 30 + (i * 5) % 20]
                                }),
                                opacity: isConnected ? 1 : 0.3
                            }
                        ]}
                    />
                ))}
            </View>
            <Text style={styles.coachingStatusText}>
                {isConnected ? "COACHING..." : "CONNECTING..."}
            </Text>
        </View>

        {/* Conversation Log (Simplified) */}
        <View style={styles.logContainer}>
            <Text style={styles.logText} numberOfLines={3}>{aiText}</Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.controlButtonSmall}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="white" />
            <Text style={styles.controlButtonText}>MUTE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pauseButton, isPaused && styles.pausedActive]}
            onPress={() => setIsPaused(!isPaused)}
          >
            <Ionicons name={isPaused ? "play" : "pause"} size={32} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButtonSmall}
            onPress={() => router.back()}
          >
            <View style={styles.endButtonCircle}>
                <Ionicons name="power" size={24} color="white" />
            </View>
            <Text style={styles.controlButtonText}>END SESSION</Text>
          </TouchableOpacity>
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
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontFamily: fontFamily.bold,
    fontSize: 18,
  },
  liveIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontFamily: fontFamily.bold,
    letterSpacing: 1,
  },
  timerContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timerText: {
    color: 'white',
    fontFamily: fontFamily.mono || 'Courier',
    fontSize: 16,
  },
  correctionCardContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  correctionCard: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(246, 240, 0, 0.3)',
  },
  correctionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  correctionTitle: {
    color: '#F6F000',
    fontFamily: fontFamily.bold,
    fontSize: 14,
    marginLeft: 8,
  },
  correctionText: {
    color: 'white',
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  coachingStatusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 10,
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#F6F000',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  coachingStatusText: {
    color: 'white',
    fontFamily: fontFamily.bold,
    fontSize: 12,
    letterSpacing: 2,
    opacity: 0.8,
  },
  logContainer: {
    paddingHorizontal: 30,
    marginBottom: 30,
    minHeight: 60,
  },
  logText: {
    color: 'white',
    fontFamily: fontFamily.medium,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  controlButtonSmall: {
    alignItems: 'center',
    width: 80,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 10,
    fontFamily: fontFamily.bold,
    marginTop: 8,
    opacity: 0.7,
  },
  pauseButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F6F000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F6F000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  pausedActive: {
    backgroundColor: '#FFFFFF',
  },
  endButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
