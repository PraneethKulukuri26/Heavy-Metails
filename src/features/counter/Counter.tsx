import { useReducer } from 'react';
import { Button } from '@/components/Button';

interface State { value: number }
interface Action { type: 'inc' | 'dec' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'inc':
      return { value: state.value + 1 };
    case 'dec':
      return { value: Math.max(0, state.value - 1) };
    default:
      return state;
  }
}

export const Counter = () => {
  const [state, dispatch] = useReducer(reducer, { value: 0 });
  return (
    <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
      <Button onClick={() => dispatch({ type: 'dec' })} aria-label="decrement">-</Button>
      <span>{state.value}</span>
      <Button onClick={() => dispatch({ type: 'inc' })} aria-label="increment">+</Button>
    </div>
  );
};
