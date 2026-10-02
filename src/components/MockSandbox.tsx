import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MutationResult } from '@/core/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle2, XCircle, Clock, Server } from 'lucide-react';

interface SimulationResult {
  vectorName: string;
  status: number;
  statusText: string;
  responseTimeMs: number;
  responseBody: any;
  passedAssertions: string[];
  failedAssertions: string[];
}

export const MockSandbox: React.FC = () => {
  const { generatedSuite } = useAppStore();
  const [selectedVectorIndex, setSelectedVectorIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  if (!generatedSuite) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-400">
        <Server className="h-9 w-9 text-zinc-600 mb-3" />
        <h4 className="text-sm font-semibold text-zinc-300 font-mono">No Test Vectors Synthesized Yet</h4>
        <p className="text-xs text-zinc-500 max-w-sm mt-1">
          Click <strong className="text-zinc-300">"Generate Test Matrix"</strong> above to generate test vectors and test them against this live simulator.
        </p>
      </div>
    );
  }

  // Combine baseline + all mutated vectors
  const allVectors: Array<{ name: string; category: string; vector: MutationResult | any; expectedStatus: number }> = [
    {
      name: generatedSuite.baselineVector.name,
      category: 'baseline',
      vector: { mutatedPayload: generatedSuite.baselineVector.payload },
      expectedStatus: generatedSuite.baselineVector.expectedStatus,
    },
    ...generatedSuite.vectors.map((v) => ({
      name: v.name,
      category: v.category,
      vector: v,
      expectedStatus: v.expectedStatus,
    })),
  ];

  const currentVector = allVectors[selectedVectorIndex] || allVectors[0];

  const handleRunSimulation = () => {
    setIsRunning(true);

    setTimeout(() => {
      const isBaseline = currentVector.category === 'baseline';
      const responseStatus = isBaseline ? currentVector.expectedStatus : 400;
      const responseTime = Math.floor(Math.random() * 45) + 15; // 15ms - 60ms

      const simulatedBody = isBaseline
        ? {
            success: true,
            message: 'Resource processed successfully',
            data: currentVector.vector.mutatedPayload,
            timestamp: new Date().toISOString(),
          }
        : {
            status: 400,
            error: 'Bad Request (Schema Validation Error)',
            details: [
              {
                pointer: currentVector.vector.fieldPointer || '/unknown',
                rule: currentVector.vector.ruleId || 'validation',
                message: currentVector.vector.description || 'Constraint violated',
              },
            ],
            timestamp: new Date().toISOString(),
          };

      const passedAssertions: string[] = [];
      const failedAssertions: string[] = [];

      // Assertion 1: Status Code
      if (responseStatus === currentVector.expectedStatus || (!isBaseline && [400, 422].includes(responseStatus))) {
        passedAssertions.push(`Status code is ${responseStatus} (Expected ${currentVector.expectedStatus})`);
      } else {
        failedAssertions.push(`Status code mismatch: received ${responseStatus}, expected ${currentVector.expectedStatus}`);
      }

      // Assertion 2: SLA Response Time < 2000ms
      if (responseTime < 2000) {
        passedAssertions.push(`Response time (${responseTime}ms) is within SLA (< 2000ms)`);
      } else {
        failedAssertions.push(`Response time exceeded SLA`);
      }

      // Assertion 3: No 500 crashes
      if (responseStatus !== 500) {
        passedAssertions.push(`Resilience check passed: server did not crash with 500 Internal Error`);
      } else {
        failedAssertions.push(`Server returned 500 crash`);
      }

      setSimulationResult({
        vectorName: currentVector.name,
        status: responseStatus,
        statusText: responseStatus === 200 || responseStatus === 201 ? 'OK' : 'Bad Request',
        responseTimeMs: responseTime,
        responseBody: simulatedBody,
        passedAssertions,
        failedAssertions,
      });

      setIsRunning(false);
    }, 300);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4">
      {/* Top Selector & Trigger */}
      <div className="flex items-center justify-between gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-zinc-400 mb-1 font-mono">
            Select Test Vector to Simulate:
          </label>
          <select
            value={selectedVectorIndex}
            onChange={(e) => {
              setSelectedVectorIndex(Number(e.target.value));
              setSimulationResult(null);
            }}
            className="w-full bg-black border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
          >
            {allVectors.map((vec, idx) => (
              <option key={idx} value={idx}>
                [{vec.expectedStatus}] {vec.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleRunSimulation}
          disabled={isRunning}
          className="bg-white text-black hover:bg-zinc-200 font-bold text-xs h-9 px-4 gap-2 cursor-pointer self-end shadow-none"
        >
          <Play className="h-3.5 w-3.5 fill-black text-black" />
          <span>{isRunning ? 'Simulating...' : 'Execute Vector'}</span>
        </Button>
      </div>

      {/* Vector Payload Inspector & Simulation Result */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-[360px]">
        {/* Left: Target Payload */}
        <div className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-black border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 font-mono">Dispatched Payload</span>
            <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-800 bg-zinc-900 font-mono">
              Expected: {currentVector.expectedStatus}
            </Badge>
          </div>
          <pre className="p-3 text-xs text-zinc-300 font-mono overflow-auto flex-1 bg-zinc-950">
            {JSON.stringify(currentVector.vector.mutatedPayload, null, 2)}
          </pre>
        </div>

        {/* Right: Live Mock Server Response & Assertions */}
        <div className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-black border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 font-mono">Live Mock Response</span>
            {simulationResult && (
              <div className="flex items-center gap-2">
                <Badge
                  variant="default"
                  className="text-[10px] border-zinc-700 bg-zinc-800 text-white font-mono"
                >
                  {simulationResult.status} {simulationResult.statusText}
                </Badge>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3" /> {simulationResult.responseTimeMs}ms
                </span>
              </div>
            )}
          </div>

          {simulationResult ? (
            <div className="flex flex-col flex-1 p-3 overflow-auto space-y-3">
              {/* Automated Assertions Results */}
              <div>
                <span className="text-[11px] font-bold text-zinc-400 block mb-1.5 font-mono">
                  Automated Assertions:
                </span>
                <div className="space-y-1.5">
                  {simulationResult.passedAssertions.map((msg, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-zinc-200 bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 rounded font-mono"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-white shrink-0" />
                      <span>{msg}</span>
                    </div>
                  ))}
                  {simulationResult.failedAssertions.map((msg, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 rounded font-mono line-through"
                    >
                      <XCircle className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Body */}
              <div className="flex-1">
                <span className="text-[11px] font-bold text-zinc-400 block mb-1 font-mono">
                  Server Response Body:
                </span>
                <pre className="p-2.5 rounded bg-black border border-zinc-800 text-xs text-zinc-300 font-mono overflow-auto max-h-[160px]">
                  {JSON.stringify(simulationResult.responseBody, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-6 text-zinc-500 font-mono">
              <Play className="h-6 w-6 text-zinc-700 mb-2" />
              <p className="text-xs">Click "Execute Vector" to test this vector live against mock assertions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
