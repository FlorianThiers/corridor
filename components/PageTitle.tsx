interface PageTitleProps {
  children: React.ReactNode
  className?: string
}

export function PageTitle({ children, className = '' }: PageTitleProps) {
  return (
    <h1 className={`text-4xl md:text-5xl font-bold text-gray-800 graffiti-text text-center mb-12 ${className}`}>
      {children}
    </h1>
  )
}
