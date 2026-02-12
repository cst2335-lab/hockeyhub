'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 防抖值 Hook
 * @param value 原始值
 * @param delay 延迟毫秒
 * @returns 延迟更新后的值
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖回调 Hook（用于搜索输入等）
 * @param callback 要防抖的函数
 * @param delay 延迟毫秒
 * @returns 防抖后的函数
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timerRef.current = null;
      }, delay);
    },
    [delay],
  ) as T;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return debounced;
}
