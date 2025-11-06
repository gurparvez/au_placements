import { Navbar } from "./components"
import { ThemeProvider } from "./components/theme-provider"

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Navbar />
      <h1>Hello</h1>
    </ThemeProvider>
  )
}

export default App
