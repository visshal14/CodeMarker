import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/Register'
import Dashboard from './pages/Dashboard';
import SnippetView from './pages/Snippet';
import AlertBox from './components/AlertBox'

function App() {

  return (
    <>
      <AuthProvider>

        <BrowserRouter>
          <Routes>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/snippet/:id" element={<SnippetView />} />

          </Routes>
        </BrowserRouter>
        <AlertBox />
      </AuthProvider>

    </>
  )
}

export default App