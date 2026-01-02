/**
 * useIntroContext - Hook to access IntroContext
 */

import { useContext } from 'react';
import { IntroContext, type IntroContextValue } from './IntroContext';

/**
 * Hook to access the IntroContext
 *
 * @throws Error if used outside of IntroProvider
 * @returns The IntroContext value
 */
export function useIntroContext(): IntroContextValue {
  const context = useContext(IntroContext);

  if (!context) {
    throw new Error(
      'useIntroContext must be used within an IntroProvider. ' +
        'Make sure to wrap your app with <IntroProvider>.'
    );
  }

  return context;
}
