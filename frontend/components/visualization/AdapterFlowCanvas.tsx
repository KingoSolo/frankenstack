'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  ControlButton ,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Protocol } from '@/lib/types/protocol';
import { PROTOCOLS } from '@/lib/types/protocol';
import { motion } from 'framer-motion';

interface AdapterFlowCanvasProps {
  sourceProtocol: Protocol;
  targetProtocol: Protocol;
  isGenerating?: boolean;
}

export function AdapterFlowCanvas({ 
  sourceProtocol, 
  targetProtocol,
  isGenerating = false 
}: AdapterFlowCanvasProps) {
  
  const sourceInfo = PROTOCOLS[sourceProtocol];
  const targetInfo = PROTOCOLS[targetProtocol];

  // Define nodes
  const initialNodes: Node[] = useMemo(() => [
    {
      id: 'source',
      type: 'input',
      data: { 
        label: (
          <div className="text-center p-4">
            <div className="text-4xl mb-2">{sourceInfo.icon}</div>
            <div className="font-bold text-lg">{sourceInfo.name}</div>
            <div className="text-xs text-gray-400">{sourceInfo.description}</div>
          </div>
        )
      },
      position: { x: 50, y: 150 },
      style: {
        background: '#1a5c3a',
        border: '2px solid #39ff14',
        borderRadius: '12px',
        width: 180,
        boxShadow: '0 0 20px rgba(57, 255, 20, 0.5)',
      },
    },
    {
      id: 'adapter',
      data: { 
        label: (
          <div className="text-center p-4">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-bold">ADAPTER</div>
            <div className="text-xs text-gray-400 mt-1">
              {isGenerating ? 'Generating...' : 'Transform Data'}
            </div>
          </div>
        )
      },
      position: { x: 300, y: 150 },
      style: {
        background: '#0d1f16',
        border: '3px solid #39ff14',
        borderRadius: '12px',
        width: 180,
        boxShadow: isGenerating 
          ? '0 0 30px rgba(57, 255, 20, 0.8)' 
          : '0 0 20px rgba(57, 255, 20, 0.5)',
      },
    },
    {
      id: 'target',
      type: 'output',
      data: { 
        label: (
          <div className="text-center p-4">
            <div className="text-4xl mb-2">{targetInfo.icon}</div>
            <div className="font-bold text-lg">{targetInfo.name}</div>
            <div className="text-xs text-gray-400">{targetInfo.description}</div>
          </div>
        )
      },
      position: { x: 550, y: 150 },
      style: {
        background: '#1a5c3a',
        border: '2px solid #39ff14',
        borderRadius: '12px',
        width: 180,
        boxShadow: '0 0 20px rgba(57, 255, 20, 0.5)',
      },
    },
  ], [sourceInfo, targetInfo, isGenerating]);

  // Define edges with animated lightning
  const initialEdges: Edge[] = useMemo(() => [
    {
      id: 'e1',
      source: 'source',
      target: 'adapter',
      animated: isGenerating,
      style: { 
        stroke: '#39ff14', 
        strokeWidth: 3,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#39ff14',
      },
      label: isGenerating ? '⚡' : undefined,
      labelStyle: { fill: '#39ff14', fontWeight: 700, fontSize: 20 },
    },
    {
      id: 'e2',
      source: 'adapter',
      target: 'target',
      animated: isGenerating,
      style: { 
        stroke: '#39ff14', 
        strokeWidth: 3,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#39ff14',
      },
      label: isGenerating ? '⚡' : undefined,
      labelStyle: { fill: '#39ff14', fontWeight: 700, fontSize: 20 },
    },
  ], [isGenerating]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-[400px] bg-[#0a2f1f] border-2 border-[#39ff14] rounded-2xl overflow-hidden"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        style={{
          background: '#0a2f1f',
        }}
      >
        <Background color="#39ff14" gap={16} size={1} />
        <Controls>
            <ControlButton
                onClick={() => console.log("clicked")}
                style={{
                background: '#1a5c3a',
                color: '#39ff14',
                border: '1px solid #39ff14'
                }}
            >  
            </ControlButton>
         </Controls>
        <MiniMap 
          nodeColor="#39ff14"
          maskColor="rgba(10, 47, 31, 0.8)"
          style={{
            background: '#0d1f16',
            border: '1px solid #39ff14',
          }}
        />
      </ReactFlow>
    </motion.div>
  );
}