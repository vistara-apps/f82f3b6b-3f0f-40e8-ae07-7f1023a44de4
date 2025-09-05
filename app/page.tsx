'use client';

import { useState, useEffect } from 'react';
import { Shield, Settings2, Menu, X } from 'lucide-react';
// import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
// import { Name, Avatar } from '@coinbase/onchainkit/identity';
// import { useMiniKit } from '@coinbase/onchainkit/minikit';

// import { RightsCard } from '@/components/RightsCard';
// import { RecordingInterface } from '@/components/RecordingInterface';
// import { StateSelector } from '@/components/StateSelector';
// import { ScriptButton } from '@/components/ScriptButton';
// import { APP_CONFIG } from '@/lib/constants';
// import { detectStateFromLocation, getCurrentLocation } from '@/lib/utils';

type TabType = 'rights' | 'record' | 'settings';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('rights');
  const [selectedState, setSelectedState] = useState('California');
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // const { setFrameReady } = useMiniKit();

  useEffect(() => {
    // Initialize MiniKit frame
    // setFrameReady();

    // Auto-detect location and state
    // getCurrentLocation()
    //   .then((location) => {
    //     const detectedState = detectStateFromLocation(location.latitude, location.longitude);
    //     setSelectedState(detectedState);
    //   })
    //   .catch((error) => {
    //     console.error('Failed to get location:', error);
    //   })
    //   .finally(() => {
        setIsLoading(false);
    //   });
  }, []);

  const tabs = [
    { id: 'rights' as TabType, label: 'Rights', icon: Shield },
    { id: 'record' as TabType, label: 'Record', icon: Settings2 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading Right Guard...</p>
        </div>
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
              <Shield className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  Right Guard
                </h1>
                <p className="text-xs text-gray-300">
                  Know Your Rights. Instantly.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* <Wallet>
                <ConnectWallet>
                  <Avatar className="w-8 h-8" />
                  <Name className="text-sm text-text-primary" />
                </ConnectWallet>
              </Wallet> */}
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="mt-4 pt-4 border-t border-white border-opacity-10">
              <div className="mb-4">
                <select 
                  value={selectedState} 
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="California">California</option>
                  <option value="New York">New York</option>
                  <option value="Texas">Texas</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Language:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 text-xs rounded ${language === 'en' ? 'bg-purple-500 text-white' : 'bg-white bg-opacity-10 text-gray-300'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('es')}
                    className={`px-3 py-1 text-xs rounded ${language === 'es' ? 'bg-purple-500 text-white' : 'bg-white bg-opacity-10 text-gray-300'}`}
                  >
                    ES
                  </button>
                </div>
              </div>
            </div>
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
                      ? 'text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-gray-400 hover:text-white'
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
        <div key={activeTab}>
          {activeTab === 'rights' && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Your Rights in {selectedState}</h2>
              <div className="space-y-4">
                <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Right to Remain Silent</h3>
                  <p className="text-gray-300 text-sm">You have the right to remain silent. Anything you say can be used against you in court.</p>
                </div>
                <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Right to an Attorney</h3>
                  <p className="text-gray-300 text-sm">You have the right to speak to an attorney and have one present during questioning.</p>
                </div>
                <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Right to Refuse Searches</h3>
                  <p className="text-gray-300 text-sm">You can refuse consent to search your person, car, or home without a warrant.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'record' && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Record Interaction</h2>
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-red-500 rounded-full mx-auto flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <p className="text-gray-300">Tap to start recording</p>
                <button className="btn-alert w-full">
                  Start Recording
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-white border-opacity-10 mt-12">
        <div className="max-w-xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-gray-300 mb-2">
            Right Guard v1.0.0
          </p>
          <p className="text-xs text-gray-300">
            This app provides general information only and does not constitute legal advice.
            Consult with a qualified attorney for specific legal guidance.
          </p>
        </div>
      </footer>
    </div>
  );
}
