import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-2xl mx-auto my-8 p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base md:text-lg font-bold text-slate-100">
              {this.props.fallbackTitle || 'Đang cập nhật dữ liệu...'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {this.state.error?.message || 'Hệ thống đang đồng bộ dữ liệu với máy chủ. Vui lòng nhấn nút tải lại.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <RefreshCw size={14} />
              <span>Tải Lại Giao Diện</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Home size={14} />
              <span>Làm Mới Trang</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
