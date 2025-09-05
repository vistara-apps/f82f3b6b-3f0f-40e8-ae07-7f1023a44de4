'use client';

import { motion } from 'framer-motion';
import { Mic, Square, Video } from 'lucide-react';
import { RecordButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export function RecordButton({
  variant = 'start',
  onClick,
  isRecording = false,
  className,
}: RecordButtonProps) {
  const getIcon = () => {
    if (variant === 'stop') return Square;
    if (isRecording) return Video;
    return Mic;
  };

  const Icon = getIcon();

  const getButtonText = () => {
    if (variant === 'stop') return 'Stop Recording';
    if (isRecording) return 'Recording...';
    return 'Start Recording';
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center justify-center space-x-3 px-6 py-4 rounded-lg font-medium transition-all duration-200',
        variant === 'stop' || isRecording
          ? 'btn-alert'
          : 'btn-primary',
        isRecording && 'animate-pulse',
        className
      )}
    >
      <Icon className={cn(
        'w-5 h-5',
        isRecording && 'recording-indicator w-3 h-3'
      )} />
      <span>{getButtonText()}</span>
    </motion.button>
  );
}
