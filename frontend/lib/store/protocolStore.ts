import { create } from 'zustand';
import type { Protocol } from '../types/protocol';
import type { AdapterConfig, InputMethod } from '../types/adapter';

interface ProtocolState {
  // Protocol selection
  selectedProtocols: Protocol[];
  selectProtocol: (protocol: Protocol) => void;
  deselectProtocol: (protocol: Protocol) => void;
  clearSelection: () => void;
  canSelectMore: () => boolean;
  
  // Configuration form
  inputMethod: InputMethod;
  setInputMethod: (method: InputMethod) => void;
  
  // Form data
  sourceEndpoint: string;
  targetEndpoint: string;
  description: string;
  examplePayload: string;
  
  setSourceEndpoint: (value: string) => void;
  setTargetEndpoint: (value: string) => void;
  setDescription: (value: string) => void;
  setExamplePayload: (value: string) => void;
  
  // Build config object
  getConfig: () => AdapterConfig | null;
  
  // Reset everything
  reset: () => void;
}

export const useProtocolStore = create<ProtocolState>((set, get) => ({
  // Protocol selection
  selectedProtocols: [],
  
  selectProtocol: (protocol) => {
    const { selectedProtocols } = get();
    if (selectedProtocols.includes(protocol)) return;
    if (selectedProtocols.length >= 2) return;
    set({ selectedProtocols: [...selectedProtocols, protocol] });
  },
  
  deselectProtocol: (protocol) => {
    const { selectedProtocols } = get();
    set({ 
      selectedProtocols: selectedProtocols.filter(p => p !== protocol) 
    });
  },
  
  clearSelection: () => {
    set({ selectedProtocols: [] });
  },
  
  canSelectMore: () => {
    return get().selectedProtocols.length < 2;
  },
  
  // Configuration form
  inputMethod: 'natural-language',
  setInputMethod: (method) => set({ inputMethod: method }),
  
  sourceEndpoint: '',
  targetEndpoint: '',
  description: '',
  examplePayload: '',
  
  setSourceEndpoint: (value) => set({ sourceEndpoint: value }),
  setTargetEndpoint: (value) => set({ targetEndpoint: value }),
  setDescription: (value) => set({ description: value }),
  setExamplePayload: (value) => set({ examplePayload: value }),
  
  getConfig: () => {
    const state = get();
    if (state.selectedProtocols.length !== 2) return null;
    
    return {
      inputMethod: state.inputMethod,
      sourceProtocol: state.selectedProtocols[0],
      targetProtocol: state.selectedProtocols[1],
      sourceEndpoint: state.sourceEndpoint || undefined,
      targetEndpoint: state.targetEndpoint || undefined,
      description: state.description || undefined,
      examplePayload: state.examplePayload || undefined,
    };
  },
  
  reset: () => {
    set({
      selectedProtocols: [],
      inputMethod: 'natural-language',
      sourceEndpoint: '',
      targetEndpoint: '',
      description: '',
      examplePayload: '',
    });
  },
}));