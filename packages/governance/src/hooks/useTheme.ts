import { useState } from 'preact/hooks'

export const useTheme = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme'))


  const toggleTheme = () => {
    const isDark = theme === 'dark'
    setTheme(isDark ? 'light' : 'dark')
    document.documentElement.classList.toggle('dark', !isDark)
  }

  return { theme, toggleTheme }
}
