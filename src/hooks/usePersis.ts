
type Storage = typeof localStorage | typeof sessionStorage

type Result<T> = {
  data: Ref<T>;
  persist: (data: T) => void;
  updateKey: (newKey: string) => void;
  reload: (defaultV: T) => void
}
type LoadOptions = {
  storage?: Storage;
  silent?: boolean;
}

type PersisOptions = LoadOptions

export function load<T>(key: string): T | undefined
export function load<T>(key: string, defaultValue: T): T
export function load<T>(key: string, defaultValue: T, options: LoadOptions): T
export function load<T>(key: string, defaultValue?: T, options?: LoadOptions) {
  let {
    storage = localStorage,
    silent = true
  } = options || {}

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
  return parsed ?? defaultValue
}

export function persist(key: string, data: any, options?: PersisOptions) {
  let {
    storage = localStorage,
    silent = true
  } = options || {}

  try {
    storage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.warn('持久数据过程——JSON.stringify步骤异常', err)
    if (silent === false) throw err
  }
}

export default function usePersist<T>(key: string): Omit<Result<T>, 'data'> & { data: Ref<T | undefined>; }
export default function usePersist<T>(key: string, defaultValue: T): Result<T>
export default function usePersist<T>(key: string, defaultValue: T, storage: Storage): Result<T>
export default function usePersist<T>(key: string, defaultValue: T, storage: Storage, silent: false): Result<T>

export default function usePersist<T>(key: string, defaultValue?: T, storage?: Storage): any {

  function updateKey(newKey: string) { key = newKey }
  function reload(defaultValue: T) {
    data.value = load(key, defaultValue, { storage })
  }
  let data = ref(load(key, defaultValue, { storage }))
  return {
    data,
    persist: (data: T) => persist(key, data, { storage }),
    updateKey,
    reload
  }
}
