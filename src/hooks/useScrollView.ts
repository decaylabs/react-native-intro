/**
 * useScrollView - Hook to register a ScrollView for auto-scrolling during tours
 */

import { useEffect, type RefObject } from 'react';
import { useIntroContext } from '../context/useIntroContext';
import type { ScrollableRef } from '../context/IntroContext';

/**
 * Register a ScrollView with the intro library for auto-scrolling
 *
 * When a tour step targets an element that is off-screen, the library
 * will automatically scroll to bring the element into view.
 *
 * @param scrollViewRef - Ref to the ScrollView component
 *
 * @example
 * ```tsx
 * function MyScreen() {
 *   const scrollRef = useRef<ScrollView>(null);
 *   useScrollView(scrollRef);
 *
 *   return (
 *     <ScrollView ref={scrollRef}>
 *       <TourStep id="step-1">
 *         <Text>Content that might be off-screen</Text>
 *       </TourStep>
 *     </ScrollView>
 *   );
 * }
 * ```
 */
export function useScrollView(scrollViewRef: RefObject<ScrollableRef | null>) {
  const { registerScrollView, unregisterScrollView } = useIntroContext();

  useEffect(() => {
    registerScrollView(scrollViewRef);

    return () => {
      unregisterScrollView();
    };
  }, [scrollViewRef, registerScrollView, unregisterScrollView]);
}
