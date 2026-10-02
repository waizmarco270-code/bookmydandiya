"use client";

import React from 'react';
import { Terminal, Activity, Database, Server, Code } from 'lucide-react';

export default function DevOverview() {
  const systemMetrics = [
    { label: 'System Status', value: 'ONLINE', status: 'ok' },
    { label: 'Firebase Conn', value: 'ACTIVE', status: 'ok' },
    { label: 'Environment', value: 'PRODUCTION', status: 'warning' },
    { label: 'Next.js Version', value: '14.x', status: 'info' }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 flex items-center gap-3">
          <Terminal className="text-red-500" /> System Overview
        </h1>
        <p className="text-zinc-500 mt-1 font-mono text-sm">SARN GROUP EVENT INFRASTRUCTURE v1.0.0</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <p className="text-xs text-zinc-500 font-bold mb-2 uppercase tracking-wider">{metric.label}</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                metric.status === 'ok' ? 'bg-green-500' : 
                metric.status === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
              } shadow-[0_0_8px_currentColor]`}></span>
              <p className="font-mono text-lg font-bold text-zinc-100">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-red-500"/> Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded text-sm text-zinc-300 transition-colors font-mono">
              $ nav /dev/payment
            </button>
            <button className="w-full text-left p-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded text-sm text-zinc-300 transition-colors font-mono">
              $ nav /dev/event
            </button>
            <button className="w-full text-left p-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded text-sm text-zinc-300 transition-colors font-mono">
              $ flush_cache --all
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <Database size={18} className="text-red-500"/> Infrastructure
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">Database</span>
              <span className="text-sm font-mono text-zinc-200">Firebase Firestore</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">Auth Service</span>
              <span className="text-sm font-mono text-zinc-200">Firebase Auth</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">Storage</span>
              <span className="text-sm font-mono text-zinc-200">Firebase Storage</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Frontend Framework</span>
              <span className="text-sm font-mono text-zinc-200">Next.js App Router</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
