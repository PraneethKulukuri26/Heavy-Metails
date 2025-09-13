import { Counter } from '@/features/counter/Counter';
import { Button } from '@/components/Button';

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Heavy Metals React App</h1>
      <p>Starter project scaffolded with Vite + React + TypeScript.</p>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Counter />
        <Button onClick={() => alert('Hello!')}>Say Hi</Button>
      </div>
    </div>
  );
}
