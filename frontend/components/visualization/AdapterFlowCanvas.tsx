// AdapterFlowCanvas.tsx
import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  Position
} from 'reactflow';

import 'reactflow/dist/style.css';

interface AdapterFlowCanvasProps {
  sourceProtocol: any;
  targetProtocol: any;
  isGenerating?: boolean;
  generatedCode?: string | null;
}

export default function AdapterFlowCanvas({
  sourceProtocol,
  targetProtocol,
  isGenerating = false,
  generatedCode = null
}: AdapterFlowCanvasProps) {

  const nodes: Node[] = [
    {
      id: 'source',
      position: { x: 150, y: 80 },
      data: {
        label: (
          <div className="text-center p-4">
            <div className="text-3xl mb-2">📤</div>
            <div className="font-bold">{sourceProtocol?.name || "Source"}</div>
            <div className="text-xs text-gray-400 mt-1">{sourceProtocol?.protocol}</div>
          </div>
        )
      },
      style: { borderRadius: 12, padding: 4 },
      sourcePosition: Position.Right
    },
    {
      id: 'adapter',
      position: { x: 450, y: 80 },
      data: {
        label: (
          <div className="text-center p-4">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-bold">ADAPTER</div>

            <div className="text-xs text-gray-400 mt-1">
              {isGenerating
                ? "Generating..."
                : generatedCode
                  ? "Code Generated!"
                  : "Transform Data"}
            </div>
          </div>
        )
      },
      style: { borderRadius: 12, padding: 4 },
      targetPosition: Position.Left,
      sourcePosition: Position.Right
    },
    {
      id: 'target',
      position: { x: 750, y: 80 },
      data: {
        label: (
          <div className="text-center p-4">
            <div className="text-3xl mb-2">📥</div>
            <div className="font-bold">{targetProtocol?.name || "Target"}</div>
            <div className="text-xs text-gray-400 mt-1">{targetProtocol?.protocol}</div>
          </div>
        )
      },
      style: { borderRadius: 12, padding: 4 },
      targetPosition: Position.Left
    }
  ];

  const edges: Edge[] = [
    {
      id: 'edge-source-adapter',
      source: 'source',
      target: 'adapter',
      animated: true
    },
    {
      id: 'edge-adapter-target',
      source: 'adapter',
      target: 'target',
      animated: true
    }
  ];

  return (
    <div className="h-[340px] w-full border rounded-xl overflow-hidden">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
