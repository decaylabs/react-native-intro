/**
 * useScrollView - Hook to register a ScrollView for auto-scrolling during tours
 */

import { useEffect, useCallback, type RefObject } from 'react';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useIntroContext } from '../context/useIntroContext';
import type { ScrollableRef } from '../context/IntroContext';

/**
 * Return type for useScrollView hook
 */
export interface UseScrollViewReturn {
  /**
   * Scroll event handler - attach this to your ScrollView's onScroll prop
   * to enable accurate scroll position tracking for auto-scroll calculations.
   *
   * @example
   * <ScrollView ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16}>
   */
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

/**
 * Register a ScrollView with the intro library for auto-scrolling
 *
 * When a tour step targets an element that is off-screen, the library
 * will automatically scroll to bring the element into view.
 *
 * @param scrollViewRef - Ref to the ScrollView component
 * @returns Object containing onScroll handler to attach to ScrollView
 *
 * @example
 * ```tsx
 * function MyScreen() {
 *   const scrollRef = useRef<ScrollView>(null);
 *   const { onScroll } = useScrollView(scrollRef);
 *
 *   return (
 *     <ScrollView
 *       ref={scrollRef}
 *       onScroll={onScroll}
 *       scrollEventThrottle={16}
 *     >
 *       <TourStep id="step-1">
 *         <Text>Content that might be off-screen</Text>
 *       </TourStep>
 *     </ScrollView>
 *   );
 * }
 * ```
 */
export function useScrollView(
  scrollViewRef: RefObject<ScrollableRef | null>
): UseScrollViewReturn {
  const { registerScrollView, unregisterScrollView, updateScrollOffset } =
    useIntroContext();

  useEffect(() => {
    registerScrollView(scrollViewRef);

    return () => {
      unregisterScrollView();
    };
  }, [scrollViewRef, registerScrollView, unregisterScrollView]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      updateScrollOffset({ x: contentOffset.x, y: contentOffset.y });
    },
    [updateScrollOffset]
  );

  return { onScroll };
}
