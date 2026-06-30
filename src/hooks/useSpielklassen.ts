import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface KonkurrenzListItem {
  id: number
  name: string
  typ: 'einzel' | 'doppel'
}

export interface SpielklasseListItem {
  id: number
  name: string
  konkurrenzen: KonkurrenzListItem[]
}

export function useSpielklassen() {
  return useQuery({
    queryKey: ['spielklassen'],
    queryFn: async (): Promise<SpielklasseListItem[]> => {
      const { data, error } = await supabase
        .from('spielklasse')
        .select('id, name, konkurrenz(id, name, typ)')
        .order('name')

      if (error) throw error

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any[] ?? []).map((sk) => ({
        id: sk.id as number,
        name: sk.name as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        konkurrenzen: ((sk.konkurrenz as any[] | null) ?? []).map((k) => ({
          id: k.id as number,
          name: k.name as string,
          typ: k.typ as 'einzel' | 'doppel',
        })),
      }))
    },
  })
}
