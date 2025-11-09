'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

// 1. Definisikan tipe props yang baru, tambahkan indicatorClassName
type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string
}

// 2. Gunakan ProgressProps dan destrukturisasikan indicatorClassName
function Progress({
  className,
  value,
  indicatorClassName, 
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props} // <-- 'indicatorClassName' sudah tidak ada di sini
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        // 3. Gunakan 'cn' untuk menggabungkan class default dengan class kustom
        className={cn(
          'bg-primary h-full w-full flex-1 transition-all',
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }