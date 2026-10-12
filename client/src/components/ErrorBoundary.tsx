import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Необработанная ошибка рендера:', error, info.componentStack);
  }

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div role="alert" className="crash">
        <h1>Приложение упало</h1>
        <p>
          Это наша ошибка, а не ваша. Данные в безопасности — они на сервере.
        </p>
        <div className="crash__actions">
          <button type="button" onClick={() => window.location.reload()}>
            Перезагрузить
          </button>
          <button
            type="button"
            onClick={() => {
              this.setState({ error: null });
            }}
          >
            Попробовать ещё раз
          </button>
        </div>
        {import.meta.env.DEV && <pre className="crash__trace">{error.stack}</pre>}
      </div>
    );
  }
}undefined