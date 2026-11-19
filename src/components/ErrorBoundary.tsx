import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="font-display text-xl font-extrabold text-[#0A1F44]">
              Une erreur inattendue est survenue
            </h2>
            <p className="text-sm text-slate-600">
              Veuillez recharger la page pour rétablir l&apos;affichage normal du site.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0A1F44] hover:bg-[#0E5AA8] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Recharger la page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
