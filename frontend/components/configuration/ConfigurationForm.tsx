'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProtocolStore } from '@/lib/store/protocolStore';
import { InputMethodToggle } from './InputMethodToggle';
import { createAdapter } from '@/lib/api';
import type { Adapter } from '@/lib/types/adapter';
import { CodeViewer } from '../code/CodeViewer';
import { AdapterFlowCanvas } from '../visualization/AdapterFlowCanvas';

export function ConfigurationForm() {
  const {
    selectedProtocols,
    inputMethod,
    sourceEndpoint,
    targetEndpoint,
    description,
    examplePayload,
    setSourceEndpoint,
    setTargetEndpoint,
    setDescription,
    setExamplePayload,
    getConfig,
  } = useProtocolStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAdapter, setGeneratedAdapter] = useState<Adapter | null>(null);
    const handleGenerate = async () => {
    setError(null);
    
    // Validation
    if (inputMethod === 'natural-language' && description.length < 50) {
        setError('Description must be at least 50 characters');
        return;
    }
    
    if (inputMethod === 'documentation' && (!sourceEndpoint || !targetEndpoint)) {
        setError('Both endpoints are required');
        return;
    }

    // Get full config
    const config = getConfig();
    if (!config) {
        setError('Please select 2 protocols first');
        return;
    }

    setIsGenerating(true);

    try {
        // Call backend API
        const adapter = await createAdapter(config);
        console.log('Adapter created:', adapter);
        
        setGeneratedAdapter(adapter);
        
        // Success message
        alert(`✅ Adapter saved to database!\n\nID: ${adapter.id}\nProtocols: ${adapter.sourceProtocol} → ${adapter.targetProtocol}`);
    } catch (err) {
        console.error('Error:', err);
        setError('Failed to generate adapter. Make sure backend is running!');
    } finally {
        setIsGenerating(false);
    }
    };

  const isValid = inputMethod === 'natural-language' 
    ? description.length >= 50
    : sourceEndpoint.length > 0 && targetEndpoint.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto mt-12 p-8 bg-[#0d1f16] border-2 border-[#39ff14] rounded-2xl"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-[#39ff14] mb-2">
          Configure Your Adapter ⚙️
        </h3>
        <p className="text-gray-300">
          {selectedProtocols[0]} → {selectedProtocols[1]}
        </p>
      </div>

        <div className="mb-8">
        <AdapterFlowCanvas 
          sourceProtocol={selectedProtocols[0]}
          targetProtocol={selectedProtocols[1]}
          isGenerating={isGenerating}
        />
      </div>
      
      {/* Input method toggle */}
      <InputMethodToggle />

      {/* Form fields */}
      <div className="space-y-6">
        {inputMethod === 'natural-language' ? (
          // Natural Language Mode
          <div>
            <label className="block text-[#39ff14] font-semibold mb-2">
              Describe what you want to connect 💬
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Connect Stripe payment webhooks to my Shopify store. When a payment succeeds, create a new order in Shopify with the customer details and items from the Stripe checkout session."
              className="w-full h-40 px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#39ff14] focus:outline-none resize-none"
            />
            <div className="mt-2 text-right">
              <span className={`text-sm ${description.length >= 50 ? 'text-[#39ff14]' : 'text-gray-500'}`}>
                {description.length} / 50 characters minimum
              </span>
            </div>
          </div>
        ) : (
          // Documentation Mode
          <>
            <div>
              <label className="block text-[#39ff14] font-semibold mb-2">
                {selectedProtocols[0]} Endpoint 📡
              </label>
              <input
                type="text"
                value={sourceEndpoint}
                onChange={(e) => setSourceEndpoint(e.target.value)}
                placeholder="https://api.stripe.com/v1/webhooks"
                className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#39ff14] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#39ff14] font-semibold mb-2">
                {selectedProtocols[1]} Endpoint 📡
              </label>
              <input
                type="text"
                value={targetEndpoint}
                onChange={(e) => setTargetEndpoint(e.target.value)}
                placeholder="https://your-store.myshopify.com/admin/api/graphql.json"
                className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#39ff14] focus:outline-none"
              />
            </div>
          </>
        )}

        {/* Optional: Example payload */}
        <div>
          <label className="block text-gray-400 font-semibold mb-2">
            Example Payload (Optional) 📦
          </label>
          <textarea
            value={examplePayload}
            onChange={(e) => setExamplePayload(e.target.value)}
            placeholder='{"event": "payment_intent.succeeded", "data": {...}}'
            className="w-full h-24 px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#39ff14] focus:outline-none resize-none font-mono text-sm"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300"
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* Generate button */}
      <div className="mt-8">
        <motion.button
          onClick={handleGenerate}
          disabled={!isValid || isGenerating}
          className={`
            w-full py-4 rounded-lg font-bold text-lg
            transition-all duration-300
            ${isValid && !isGenerating
              ? 'bg-[#39ff14] text-black hover:shadow-[0_0_30px_rgba(57,255,20,0.8)] cursor-pointer'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
          whileHover={isValid && !isGenerating ? { scale: 1.02 } : {}}
          whileTap={isValid && !isGenerating ? { scale: 0.98 } : {}}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⚡
              </motion.span>
              Generating Adapter...
            </span>
          ) : (
            'Generate Adapter ⚡'
          )}
        </motion.button>
      </div>
      {/* Show generated code */}
      {generatedAdapter && (
        <CodeViewer 
          code={generatedAdapter.code}
          filename={`adapter-${generatedAdapter.sourceProtocol}-to-${generatedAdapter.targetProtocol}.js`}
        />
      )}
    </motion.div>
  );
}