import React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    let readable = error.message || 'An unexpected issue occurred.';
    try {
      const parsed = JSON.parse(error.message) as { error?: string; operationType?: string };
      if (parsed && parsed.error) {
        readable = `Unable to complete database ${parsed.operationType || 'request'}. Please sign in or try again.`;
      }
    } catch {
      // plain error string
    }
    return { hasError: true, message: readable };
  }

  componentDidCatch(error: Error) {
    console.error('Application ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F0] text-[#242320] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E5DCCB] p-8 space-y-4">
            <p className="text-xs tracking-wide text-[#702F32] font-medium">AKSHAT (अक्षत)</p>
            <h1 className="font-display text-2xl font-semibold text-[#242320]">
              Something interrupted your session
            </h1>
            <p className="text-sm text-[#5C574F] leading-relaxed">{this.state.message}</p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.hash = '#/';
              }}
              className="px-5 py-2.5 bg-[#702F32] text-[#FAF7F0] text-sm font-medium hover:bg-[#582225] transition-colors"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
