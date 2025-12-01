import { useCallback, useRef } from 'react';

/**
 * A reusable React hook that enables keyboard navigation between input fields:
 * - Enter → moves to next field
 * - Backspace (on empty field) → moves to previous field
 */
export const useEnterNavigation = (
  options: {
    containerRef?: React.RefObject<HTMLElement>;
    inputSelector?: string;
    excludeSelector?: string;
    onLastFieldEnter?: () => void;
  } = {}
) => {
  const {
    containerRef,
    inputSelector = 'input, textarea, select',
    excludeSelector,
    onLastFieldEnter,
  } = options;

  const internalContainerRef = useRef<HTMLElement>(null);
  const container = containerRef || internalContainerRef;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const target = event.currentTarget as HTMLElement;
      const containerElement = container.current || document;

      const allInputs = Array.from(
        containerElement.querySelectorAll(inputSelector)
      ) as HTMLElement[];

      const filteredInputs = excludeSelector
        ? allInputs.filter((input) => !input.matches(excludeSelector))
        : allInputs;

      const visibleInputs = filteredInputs.filter((input) => {
        const style = window.getComputedStyle(input);
        return (
          !input.hasAttribute('disabled') &&
          !input.hasAttribute('readonly') &&
          style.display !== 'none' &&
          style.visibility !== 'hidden'
        );
      });

      const currentIndex = visibleInputs.indexOf(target);
      if (currentIndex === -1) return;

      // ✅ Handle Enter navigation
      if (event.key === 'Enter') {
        if (event.shiftKey || event.ctrlKey || event.metaKey) return;
        if (target instanceof HTMLTextAreaElement) return;
        if (
          target instanceof HTMLButtonElement ||
          (target instanceof HTMLInputElement && target.type === 'submit')
        ) {
          return;
        }

        event.preventDefault();

        if (currentIndex === visibleInputs.length - 1) {
          if (onLastFieldEnter) {
            onLastFieldEnter();
          } else {
            visibleInputs[0]?.focus();
          }
        } else {
          visibleInputs[currentIndex + 1]?.focus();
        }
      }

      // ⌫ Handle Backspace navigation
      if (event.key === 'Backspace') {
        // Only navigate backward if the field is empty
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
          const value = target.value?.trim() ?? '';
          if (value === '' && currentIndex > 0) {
            event.preventDefault();
            visibleInputs[currentIndex - 1]?.focus();
          }
        }
      }
    },
    [container, inputSelector, excludeSelector, onLastFieldEnter]
  );

  return {
    onKeyDown: handleKeyDown,
    containerRef: container,
  };
};

export const useSimpleEnterNavigation = (onLastFieldEnter?: () => void) => {
  return useEnterNavigation({ onLastFieldEnter }).onKeyDown;
};
