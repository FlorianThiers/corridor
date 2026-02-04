import { ReactNode } from 'react'

interface PageSectionProps {
  id?: string
  className?: string
  children: ReactNode
}

export function PageSection({ id, className = '', children }: PageSectionProps) {
  return (
    <section id={id} className={`py-20 px-4 ${className}`}>
      {children}
    </section>
  )
}
