import { useState, useMemo, useRef, useEffect } from 'react'
import { X, Search, User } from 'lucide-react'

type UserOption = {
  id: string
  nome: string
  role: string
  foto_url?: string | null
}

interface UserMultiSelectProps {
  label: string
  users: UserOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  maxSelections?: number
  placeholder?: string
  onSelect?: (userId: string) => void
}

export default function UserMultiSelect({ 
  label, 
  users, 
  selectedIds, 
  onChange, 
  maxSelections = 2,
  placeholder = "Buscar usuário...",
  onSelect
}: UserMultiSelectProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter users based on query and exclude already selected ones
  const filteredUsers = useMemo(() => {
    if (!query) return []
    return users
      .filter(u => 
        !selectedIds.includes(u.id) && 
        u.nome.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5) // Limit to 5 results for cleaner UI
  }, [query, users, selectedIds])

  // Get full objects of selected users
  const selectedUsers = useMemo(() => {
    return selectedIds.map(id => users.find(u => u.id === id)).filter(Boolean) as UserOption[]
  }, [selectedIds, users])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (userId: string) => {
    if (selectedIds.length >= maxSelections) return
    
    const newSelected = [...selectedIds, userId]
    onChange(newSelected)
    setQuery('')
    setIsOpen(false)
    if (onSelect) onSelect(userId)
  }

  const handleRemove = (userId: string) => {
    const newSelected = selectedIds.filter(id => id !== userId)
    onChange(newSelected)
  }

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      {/* Selected Users Chips/Cards */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedUsers.map((user, index) => (
          <div 
            key={user.id} 
            className={`
              flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full pl-1 pr-3 py-1 animate-in zoom-in-95 duration-200
              ${selectedUsers.length > 1 && index === 0 ? '-mr-4 z-10' : 'z-0'}
            `}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center overflow-hidden border-2 border-white">
              {user.foto_url ? (
                <img src={user.foto_url} alt={user.nome} className="w-full h-full object-cover" />
              ) : (
                <span className="text-indigo-700 font-bold text-xs">{user.nome.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-medium text-indigo-900 leading-none">{user.nome}</span>
               <span className="text-[10px] text-indigo-500 uppercase">{user.role}</span>
            </div>
            <button 
              onClick={() => handleRemove(user.id)}
              className="ml-1 p-0.5 hover:bg-indigo-200 rounded-full text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Search Input */}
      {selectedIds.length < maxSelections && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={selectedIds.length > 0 ? "Adicionar mais um..." : placeholder}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          {/* Dropdown Results */}
          {isOpen && query && filteredUsers.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelect(user.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 transition-colors text-left border-b last:border-0 border-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.foto_url ? (
                      <img src={user.foto_url} alt={user.nome} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.nome}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {isOpen && query && filteredUsers.length === 0 && (
             <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center text-sm text-gray-500">
                Nenhum usuário encontrado.
             </div>
          )}
        </div>
      )}
    </div>
  )
}
