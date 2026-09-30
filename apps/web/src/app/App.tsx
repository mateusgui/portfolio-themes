import { ThemeProvider } from '../themes/ThemeProvider.tsx';
import { AppShell } from './AppShell.tsx';

export function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
