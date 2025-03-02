
type Storage = typeof localStorage | typeof sessionStorage

export default function usePersist<T>(key: string): { data: Ref<T | undefined>; persist: (data: T) => void }
export default function usePersist<T>(key: string, defaultValue: T): { data: Ref<T>; persist: (data: T) => void }
export default function usePersist<T>(key: string, defaultValue: T, storage: Storage): { data: Ref<T>; persist: (data: T) => void }
export default function usePersist<T>(key: string, defaultValue: T, storage: Storage, silent: false): { data: Ref<T>; persist: (data: T) => void }
export default function usePersist<T>(key: string, defaultValue?: T, storage?: Storage, silent?: boolean): any {
  storage = storage ?? localStorage
  silent = silent ?? true
  function load<T>(key: string, storage: Storage) {
    let raw = storage.getItem(key)
    let parsed: T | undefined = undefined
    if (raw) {
      try {
        parsed = JSON.parse(raw)
      } catch (err) {
        console.warn('持久数据加载过程——JSON.parse步骤异常', err)
        if (silent === false) throw err
      }
    }
    return parsed
  }
  function persist(key: string, data: any, storage: Storage) {
    try {
      storage.setItem(key, JSON.stringify(data))
    } catch (err) {
      console.warn('持久数据过程——JSON.stringify步骤异常', err)
      if (silent === false) throw err
    }
  }
  let data = load<T>(key, storage) ?? defaultValue
  return {
    data: ref(data),
    persist: (data: T) => persist(key, data, storage)
  }
}
