import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { createMutation, type QueryClient } from '@tanstack/svelte-query';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
  y?: number;
  x?: number;
  start?: number;
  duration?: number;
};

export const flyAndScale = (
  node: Element,
  params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
  const style = getComputedStyle(node);
  const transform = style.transform === 'none' ? '' : style.transform;

  const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
    const [minA, maxA] = scaleA;
    const [minB, maxB] = scaleB;

    const percentage = (valueA - minA) / (maxA - minA);
    const valueB = percentage * (maxB - minB) + minB;

    return valueB;
  };

  const styleToString = (style: Record<string, number | string | undefined>): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str;
      return str + `${key}:${style[key]};`;
    }, '');
  };

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

      return styleToString({
        transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        opacity: t
      });
    },
    easing: cubicOut
  };
};

export const monthsInAYear = [
  {
    id: 0,
    month: 'January',
    abbr: 'JAN'
  },
  {
    id: 1,
    month: 'February',
    abbr: 'FEB'
  },
  {
    id: 2,
    month: 'March',
    abbr: 'MAR'
  },
  {
    id: 3,
    month: 'April',
    abbr: 'APR'
  },
  {
    id: 4,
    month: 'May',
    abbr: 'MAY'
  },
  {
    id: 5,
    month: 'June',
    abbr: 'JUN'
  },
  {
    id: 6,
    month: 'July',
    abbr: 'JUL'
  },
  {
    id: 7,
    month: 'August',
    abbr: 'AUG'
  },
  {
    id: 8,
    month: 'September',
    abbr: 'SEP'
  },
  {
    id: 9,
    month: 'October',
    abbr: 'OCT'
  },
  {
    id: 10,
    month: 'November',
    abbr: 'NOV'
  },
  {
    id: 11,
    month: 'December',
    abbr: 'DEC'
  }
];

export function generateMutation<T>(
  client: QueryClient,
  options: {
    queryKey: string[];
    mutationKey: string[];
    mutationFn: (params: T) => Promise<void>;
    updateFn: (list: T[], item: T) => T[];
  }
) {
  return createMutation({
    mutationKey: options.mutationKey,
    mutationFn: options.mutationFn,
    onMutate: async (item: T) => {
      await client.cancelQueries(options.queryKey);

      const list = client.getQueryData<T[]>(options.queryKey) ?? [];

      const updatedList = options.updateFn(list, item);

      client.setQueryData<T[]>(options.queryKey, []); // this forces a re-render
      client.setQueryData<T[]>(options.queryKey, updatedList);
    },
    onSettled: () => {
      client.invalidateQueries(options.queryKey);
    }
  });
}

export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}
