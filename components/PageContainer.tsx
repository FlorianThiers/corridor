import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
}

export function PageContainer({ children, maxWidth = '6xl' }: PageContainerProps) {
  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
      {children}
    </div>
  )
}
