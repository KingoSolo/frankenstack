import { create } from 'zustand';
import type { Protocol } from '../types/protocol';

interface ProtocolState {
  // Which protocols are selected (max 2)
  selectedProtocols: Protocol[];
  
  // Select a protocol
  selectProtocol: (protocol: Protocol) => void;
  
  // Deselect a protocol
  deselectProtocol: (protocol: Protocol) => void;
  
  // Clear all selections
  clearSelection: () => void;
  
  // Check if we can select more
  canSelectMore: () => boolean;
}

export const useProtocolStore = create<ProtocolState>((set, get) => ({
  selectedProtocols: [],
  
  selectProtocol: (protocol) => {
    const { selectedProtocols } = get();
    
    // Don't select if already selected
    if (selectedProtocols.includes(protocol)) return;
    
    // Don't select if we already have 2
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
  }
}));