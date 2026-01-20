'use client'

export function ThemeWrapper({ themeColor }: { themeColor: string }) {
  const colors: Record<string, string> = {
    blue: '#4f46e5', // indigo-600 (default)
    red: '#dc2626', // red-600
    dark: '#0f172a', // slate-900
    gold: '#ca8a04', // yellow-600
  }

  const primary = colors[themeColor] || colors.blue

  // Helper to create transparent versions
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return (
    <style jsx global>{`
      :root {
        --primary: ${primary};
      }
      
      /* Override Indigo-600 (Primary) */
      .text-indigo-600 {
        color: var(--primary) !important;
      }
      .bg-indigo-600 {
        background-color: var(--primary) !important;
      }
      .border-indigo-600 {
        border-color: var(--primary) !important;
      }
      .ring-indigo-600 {
        --tw-ring-color: var(--primary) !important;
      }

      /* Hover states */
      .hover\\:bg-indigo-700:hover {
        background-color: var(--primary) !important;
        filter: brightness(0.9);
      }
      .hover\\:text-indigo-700:hover {
        color: var(--primary) !important;
        filter: brightness(0.8);
      }

      /* Light backgrounds */
      .bg-indigo-50 {
        background-color: ${hexToRgba(primary, 0.1)} !important;
      }
      .bg-indigo-100 {
        background-color: ${hexToRgba(primary, 0.2)} !important;
      }
      
      /* Specific for Dark Theme Text on Light Bg */
      ${themeColor === 'dark' ? `
        .text-indigo-600 {
            color: #0f172a !important;
        }
        .bg-indigo-50 {
            background-color: #f1f5f9 !important; /* slate-100 */
        }
      ` : ''}
    `}</style>
  )
}
