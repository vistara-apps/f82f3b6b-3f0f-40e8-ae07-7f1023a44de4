'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Loader2, ExternalLink } from 'lucide-react';
import { usePremiumFeatures, useUser } from '@/lib/context';
import { PREMIUM_FEATURES } from '@/lib/constants';
import { ScriptButton } from './ScriptButton';
import { CalloutCard } from './CalloutCard';

interface PremiumFeaturesProps {
  className?: string;
}

export function PremiumFeatures({ className }: PremiumFeaturesProps) {
  const user = useUser();
  const { premiumFeatures, hasFeature, purchaseFeature } = usePremiumFeatures();
  const [purchasingFeature, setPurchasingFeature] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handlePurchase = async (featureKey: string, price: number) => {
    if (!user) {
      setPurchaseError('Please connect your wallet first');
      return;
    }

    setPurchasingFeature(featureKey);
    setPurchaseError(null);

    try {
      // In a real implementation, you would:
      // 1. Initiate a Base transaction using OnchainKit
      // 2. Wait for transaction confirmation
      // 3. Call the purchase API with the transaction hash
      
      // For demo purposes, we'll simulate a transaction
      const mockTxHash = `0x${Math.random().toString(16).substring(2)}`;
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await purchaseFeature(featureKey, mockTxHash, price);
      
      // Show success message
      alert(`${PREMIUM_FEATURES[featureKey as keyof typeof PREMIUM_FEATURES].name} unlocked successfully!`);
      
    } catch (error) {
      console.error('Purchase failed:', error);
      setPurchaseError(error instanceof Error ? error.message : 'Purchase failed');
    } finally {
      setPurchasingFeature(null);
    }
  };

  const availableFeatures = Object.entries(PREMIUM_FEATURES).filter(
    ([key]) => !hasFeature(key)
  );

  const unlockedFeatures = Object.entries(PREMIUM_FEATURES).filter(
    ([key]) => hasFeature(key)
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Crown className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold text-text-primary">Premium Features</h2>
      </div>

      {/* Error Display */}
      {purchaseError && (
        <CalloutCard
          variant="alert"
          title="Purchase Failed"
          description={purchaseError}
        />
      )}

      {/* Unlocked Features */}
      {unlockedFeatures.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Your Premium Features
          </h3>
          <div className="space-y-3">
            {unlockedFeatures.map(([key, feature]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 rounded-lg border border-green-400 border-opacity-30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <div>
                      <h4 className="font-medium text-text-primary">
                        {feature.name}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-green-400 text-sm font-medium">
                    Unlocked
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available Features */}
      {availableFeatures.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Available Upgrades
          </h3>
          <div className="space-y-4">
            {availableFeatures.map(([key, feature]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-text-primary mb-2">
                        {feature.name}
                      </h4>
                      <p className="text-text-secondary text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-accent">
                        ${feature.price}
                      </div>
                      <div className="text-xs text-text-secondary">
                        one-time
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-text-secondary">
                      <ExternalLink className="w-3 h-3" />
                      <span>Paid via Base network</span>
                    </div>
                    
                    <ScriptButton
                      variant="primary"
                      onClick={() => handlePurchase(key, feature.price)}
                      disabled={purchasingFeature === key}
                      className="min-w-[120px]"
                    >
                      {purchasingFeature === key ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        `Unlock for $${feature.price}`
                      )}
                    </ScriptButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Features Unlocked */}
      {availableFeatures.length === 0 && unlockedFeatures.length > 0 && (
        <CalloutCard
          title="All Premium Features Unlocked!"
          description="You have access to all premium features. Thank you for supporting Right Guard!"
        >
          <div className="flex items-center space-x-2 text-yellow-400">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">Premium Member</span>
          </div>
        </CalloutCard>
      )}

      {/* No Features Available */}
      {availableFeatures.length === 0 && unlockedFeatures.length === 0 && (
        <CalloutCard
          title="No Premium Features Available"
          description="All features are currently included in the free version. Check back later for premium upgrades!"
        />
      )}

      {/* Premium Benefits */}
      <div className="glass-card p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Why Go Premium?
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
            <span className="text-text-primary text-sm">
              <strong>State-Specific Content:</strong> Get legal information tailored to your exact location and local laws
            </span>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
            <span className="text-text-primary text-sm">
              <strong>Enhanced Recording:</strong> Longer recording times, cloud backup, and automatic IPFS storage
            </span>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
            <span className="text-text-primary text-sm">
              <strong>Full Bilingual Access:</strong> Complete content library in both English and Spanish
            </span>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
            <span className="text-text-primary text-sm">
              <strong>Support the Mission:</strong> Help us maintain and improve this important tool for everyone
            </span>
          </li>
        </ul>
      </div>

      {/* Legal Disclaimer */}
      <div className="text-xs text-text-secondary text-center">
        <p>
          Premium features are purchased using cryptocurrency on the Base network.
          All purchases are final. This app provides general information only and
          does not constitute legal advice.
        </p>
      </div>
    </div>
  );
}
