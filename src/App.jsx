import { HashRouter, Routes, Route } from 'react-router'
import './App.css'
import Home from './components/Home.jsx'
import Now from './components/Now.jsx'

function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/now" element={<Now />} />
      </Routes>
    </HashRouter>
  )
}

export default App
