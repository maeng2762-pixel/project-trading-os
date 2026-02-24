'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Terminal } from 'lucide-react';

interface AnalysisLogProps {
    logs: string[];
}

export const AnalysisLog = ({ logs }: AnalysisLogProps) => {
    return (
        <Card className="w-full border-zinc-800 bg-zinc-950/80 text-zinc-300 font-mono text-[11px] shadow-inner">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3 text-indigo-400 font-bold border-b border-zinc-800 pb-2">
                    <Terminal className="w-4 h-4" />
                    <span>Kelly Network Intelligence Log</span>
                </div>
                <div className="space-y-1.5 opacity-80">
                    {logs.map((log, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <span className="text-zinc-600 shrink-0">[{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                            <span dangerouslySetInnerHTML={{ __html: log }} />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
