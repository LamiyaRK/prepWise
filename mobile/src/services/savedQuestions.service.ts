import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'prepwise:saved_questions'

export interface SavedQuestion {
  id:         string   // unique — timestamp + index
  question:   string
  hint:       string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category:   string
  role:       string
  savedAt:    string   // ISO date string
}

// ─── Load all saved questions ─────────────────────────────────────────────────

export const getSavedQuestions = async (): Promise<SavedQuestion[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// ─── Save a question ──────────────────────────────────────────────────────────

export const saveQuestion = async (
  q: Omit<SavedQuestion, 'id' | 'savedAt'>
): Promise<SavedQuestion[]> => {
  try {
    const existing = await getSavedQuestions()
    // Prevent duplicates
    const alreadySaved = existing.some(s => s.question === q.question)
    if (alreadySaved) return existing

    const newEntry: SavedQuestion = {
      ...q,
      id:      `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      savedAt: new Date().toISOString(),
    }
    const updated = [newEntry, ...existing]
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

// ─── Remove a saved question ──────────────────────────────────────────────────

export const unsaveQuestion = async (question: string): Promise<SavedQuestion[]> => {
  try {
    const existing = await getSavedQuestions()
    const updated  = existing.filter(s => s.question !== question)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

// ─── Check if a question is saved ────────────────────────────────────────────

export const isQuestionSaved = async (question: string): Promise<boolean> => {
  const saved = await getSavedQuestions()
  return saved.some(s => s.question === question)
}

// ─── Clear all saved questions ────────────────────────────────────────────────

export const clearAllSaved = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY)
}