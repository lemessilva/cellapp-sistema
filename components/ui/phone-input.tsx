'use client'

import React, { useState, useEffect } from 'react'

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  defaultValue?: string
}

export function formatPhone(value: string) {
  if (!value) return ''
  
  // Remove tudo que não é número
  const nums = value.replace(/\D/g, '')
  
  // Formata (11) 91234-5678
  if (nums.length <= 11) {
    return nums
      .replace(/(\d{2})/, '($1) ')
      .replace(/(\d{5})(\d{4})/, '$1-$2')
  }
  
  return nums.substring(0, 11)
    .replace(/(\d{2})/, '($1) ')
    .replace(/(\d{5})(\d{4})/, '$1-$2')
}

export function PhoneInput({ className, defaultValue, value: controlledValue, onChange, ...props }: PhoneInputProps) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(formatPhone(String(controlledValue)))
    } else if (defaultValue) {
      setValue(formatPhone(String(defaultValue)))
    }
  }, [controlledValue, defaultValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue(formatted)
    if (onChange) {
      // Cria um evento sintético com o valor limpo (opcional) ou formatado
      // Mantendo o comportamento padrão de passar o evento, mas com o valor formatado no input
      e.target.value = formatted
      onChange(e)
    }
  }

  return (
    <input
      {...props}
      type="tel"
      value={value}
      onChange={handleChange}
      className={className}
      maxLength={15} // (11) 99999-9999 = 15 chars
    />
  )
}
