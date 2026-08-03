export const DESIGN_TOKENS = {
  colors: {
    brand: {
      burgundy: '#721f31',
      burgundyHover: '#5e1928',
      gold: '#d4af37',
      goldHover: '#b28713',
    },
    status: {
      active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800', dot: 'bg-emerald-500' },
      pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800', dot: 'bg-amber-500' },
      expired: { bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800', dot: 'bg-rose-500' },
      info: { bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800', dot: 'bg-blue-500' },
    },
  },
  typography: {
    h1: 'text-3xl sm:text-4xl font-bold tracking-tight text-foreground',
    h2: 'text-2xl sm:text-3xl font-semibold tracking-tight text-foreground',
    h3: 'text-xl sm:text-2xl font-semibold text-foreground',
    h4: 'text-lg font-medium text-foreground',
    body: 'text-sm sm:text-base leading-relaxed text-muted-foreground',
    caption: 'text-xs text-muted-foreground',
  },
  iconSizes: {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  },
  radius: {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  },
  shadows: {
    subtle: 'shadow-sm',
    card: 'shadow-sm hover:shadow-md transition-shadow duration-200',
    popover: 'shadow-lg',
    dialog: 'shadow-2xl',
  },
} as const;
