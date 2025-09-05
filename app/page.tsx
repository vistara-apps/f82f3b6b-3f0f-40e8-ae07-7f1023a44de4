'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Settings2, Menu, X, Crown } from 'lucide-react';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name, Avatar } from '@coinbase/onchainkit/identity';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

import { RightsCard } from '@/components/RightsCard';
import { RecordingInterface } from '@/components/RecordingInterface';
import { PremiumFeatures } from '@/components/PremiumFeatures';
import { StateSelector } from '@/components/StateSelector';
import { ScriptButton } from '@/components/ScriptButton';
import { useApp, useLanguage, useCurrentState } from '@/lib/context';
import { APP_CONFIG } from '@/lib/constants';
import { utilityService } from '@/lib/services';

type TabType = 'rights' | 'record' | 'premium';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('rights');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { state, initializeUser } = useApp();
  const [language, setLanguage] = useLanguage();
  const [selectedState, setSelectedState] = useCurrentState();
  const { setFrameReady } = useMiniKit();

  useEffect(() => {
    // Initialize MiniKit frame
    setFrameReady();

    // Auto-detect location and state
    utilityService.getCurrentLocation()
      .then((location) => {
        const detectedState = utilityService.detectStateFromLocation(location.latitude, location.longitude);
        setSelectedState(detectedState);
      })
      .catch((error) => {
        console.error('Failed to get location:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setFrameReady, setSelectedState]);

  const tabs = [
    { id: 'rights' as TabType, label: 'Rights', icon: Shield },
    { id: 'record' as TabType, label: 'Record', icon: Settings2 },
    { id: 'premium' as TabType, label: 'Premium', icon: Crown },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading Right Guard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800">
      {/* Header */}
      <header className="glass-card border-b border-white border-opacity-10">
        <div className="max-w-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-accent" />
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  {APP_CONFIG.name}
                </h1>
                <p className="text-xs text-text-secondary">
                  {APP_CONFIG.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Wallet>
                <ConnectWallet>
                  <Avatar className="w-8 h-8" />
                  <Name className="text-sm text-text-primary" />
                </ConnectWallet>
              </Wallet>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white border-opacity-10"
            >
              <StateSelector
                selectedState={selectedState}
                onStateChange={setSelectedState}
                className="mb-4"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Language:</span>
                <div className="flex space-x-2">
                  <ScriptButton
                    variant={language === 'en' ? 'primary' : 'secondary'}
                    onClick={() => setLanguage('en')}
                    className="px-3 py-1 text-xs"
                  >
                    EN
                  </ScriptButton>
                  <ScriptButton
                    variant={language === 'es' ? 'primary' : 'secondary'}
                    onClick={() => setLanguage('es')}
                    className="px-3 py-1 text-xs"
                  >
                    ES
                  </ScriptButton>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="glass-card border-b border-white border-opacity-10">
        <div className="max-w-xl mx-auto px-4">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'rights' && (
            <RightsCard
              selectedState={selectedState}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}

          {activeTab === 'record' && (
            <RecordingInterface language={language} />
          )}

          {activeTab === 'premium' && (
            <PremiumFeatures />
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-white border-opacity-10 mt-12">
        <div className="max-w-xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-text-secondary mb-2">
            {APP_CONFIG.name} v{APP_CONFIG.version}
          </p>
          <p className="text-xs text-text-secondary">
            This app provides general information only and does not constitute legal advice.
            Consult with a qualified attorney for specific legal guidance.
          </p>
        </div>
      </footer>
    </div>
  );
}
