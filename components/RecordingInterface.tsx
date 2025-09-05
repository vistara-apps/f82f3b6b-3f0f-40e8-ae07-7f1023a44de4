'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, AlertCircle, Clock, MapPin } from 'lucide-react';
import { RecordButton } from './RecordButton';
import { ContactPicker } from './ContactPicker';
import { CalloutCard } from './CalloutCard';
import { getCurrentLocation } from '@/lib/utils';
import { RECORDING_CONFIG, ALERT_TEMPLATES } from '@/lib/constants';

interface RecordingInterfaceProps {
  language: 'en' | 'es';
}

export function RecordingInterface({ language }: RecordingInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('audio');
  const [location, setLocation] = useState<string>('Detecting location...');
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get current location on component mount
    getCurrentLocation()
      .then((loc) => {
        setLocation(loc.address || `${loc.latitude}, ${loc.longitude}`);
      })
      .catch(() => {
        setLocation('Location unavailable');
      });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const startRecording = async () => {
    try {
      const constraints = {
        audio: true,
        video: recordingType === 'video',
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: recordingType === 'video' 
          ? RECORDING_CONFIG.videoFormat 
          : RECORDING_CONFIG.audioFormat,
      });

      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: recordingType === 'video' 
            ? RECORDING_CONFIG.videoFormat 
            : RECORDING_CONFIG.audioFormat,
        });
        
        // Here you would upload to IPFS via Pinata
        console.log('Recording completed:', blob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= RECORDING_CONFIG.maxDuration / 1000) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const sendAlert = async () => {
    if (emergencyContacts.length === 0) {
      alert('Please add emergency contacts first.');
      return;
    }

    const template = ALERT_TEMPLATES[language].recording;
    const message = template
      .replace('{location}', location)
      .replace('{time}', new Date().toLocaleString());

    // Here you would send SMS/notifications to emergency contacts
    console.log('Sending alert to contacts:', emergencyContacts);
    console.log('Alert message:', message);
    
    alert('Alert sent to emergency contacts!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Recording Status */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 rounded-lg border-red-400 border-opacity-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-text-primary font-medium">Recording Active</span>
            </div>
            <div className="flex items-center space-x-2 text-text-secondary">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(recordingTime)}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Location Info */}
      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="text-text-primary text-sm">{location}</span>
        </div>
      </div>

      {/* Recording Type Selection */}
      <div className="glass-card p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Recording Type
        </h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setRecordingType('audio')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
              recordingType === 'audio'
                ? 'bg-accent bg-opacity-20 text-accent border border-accent border-opacity-50'
                : 'bg-white bg-opacity-5 text-text-secondary hover:bg-opacity-10'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span className="text-sm font-medium">Audio Only</span>
          </button>
          <button
            onClick={() => setRecordingType('video')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
              recordingType === 'video'
                ? 'bg-accent bg-opacity-20 text-accent border border-accent border-opacity-50'
                : 'bg-white bg-opacity-5 text-text-secondary hover:bg-opacity-10'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">Video</span>
          </button>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="space-y-4">
        <RecordButton
          variant={isRecording ? 'stop' : 'start'}
          onClick={isRecording ? stopRecording : startRecording}
          isRecording={isRecording}
          className="w-full"
        />

        {isRecording && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={sendAlert}
            className="w-full btn-alert flex items-center justify-center space-x-2"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Send Emergency Alert</span>
          </motion.button>
        )}
      </div>

      {/* Emergency Contacts */}
      <ContactPicker
        onContactsSelected={setEmergencyContacts}
        className="w-full"
      />

      {/* Important Notice */}
      <CalloutCard
        variant="alert"
        title="Important Legal Notice"
        description="Recording laws vary by state. Ensure you understand your local laws regarding recording interactions with law enforcement. This app is for documentation purposes only and does not constitute legal advice."
      />
    </div>
  );
}
