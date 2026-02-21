'use client';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6 tex-center">
                    <h1 className="text-3xl mb-4">🚨 Error Occurred</h1>
                    <p className="text-zinc-400 mb-4">Something went wrong.</p>
                    <pre className="bg-zinc-900 p-4 rounded text-red-400 text-xs overflow-auto max-w-full">
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        className="mt-6 px-6 py-2 bg-indigo-600 rounded-full font-bold"
                        onClick={() => window.location.reload()}
                    >
                        Reload App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
