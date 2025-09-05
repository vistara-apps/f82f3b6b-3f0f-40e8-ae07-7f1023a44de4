'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Copy, Check } from 'lucide-react';
import { BASIC_RIGHTS, LANGUAGES } from '@/lib/constants';
import { ScriptButton } from './ScriptButton';
import { CalloutCard } from './CalloutCard';

interface RightsCardProps {
  selectedState: string;
  language: 'en' | 'es';
  onLanguageChange: (lang: 'en' | 'es') => void;
}

export function RightsCard({ selectedState, language, onLanguageChange }: RightsCardProps) {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  
  const rights = BASIC_RIGHTS[language];

  const copyScript = async (script: string, key: string) => {
    try {
      await navigator.clipboard.writeText(script);
      setCopiedScript(key);
      setTimeout(() => setCopiedScript(null), 2000);
    } catch (error) {
      console.error('Failed to copy script:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-bold text-text-primary">
            {rights.title}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-text-secondary" />
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as 'en' | 'es')}
            className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-3 py-1 text-text-primary text-sm"
          >
            <option value="en">{LANGUAGES.en}</option>
            <option value="es">{LANGUAGES.es}</option>
          </select>
        </div>
      </div>

      {/* State Info */}
      <CalloutCard
        title={`${selectedState} Legal Guide`}
        description="State-specific legal basics and guidance"
      >
        <div className="text-xs text-text-secondary">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </CalloutCard>

      {/* Rights List */}
      <div className="glass-card p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Essential Rights
        </h3>
        <ul className="space-y-3">
          {rights.rights.map((right, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3"
            >
              <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
              <span className="text-text-primary text-sm leading-relaxed">
                {right}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Scripts */}
      <div className="glass-card p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          What to Say Scripts
        </h3>
        <div className="space-y-4">
          {Object.entries(rights.scripts).map(([key, script]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-accent capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <button
                  onClick={() => copyScript(script, key)}
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  {copiedScript === key ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-text-primary text-sm bg-white bg-opacity-5 rounded-lg p-3 leading-relaxed">
                "{script}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Upgrade */}
      <CalloutCard
        variant="default"
        title="Unlock Premium Scripts"
        description={`Get advanced, ${selectedState}-specific scripts and enhanced features`}
      >
        <ScriptButton variant="primary" onClick={() => {}}>
          Upgrade for $0.99
        </ScriptButton>
      </CalloutCard>
    </div>
  );
}
