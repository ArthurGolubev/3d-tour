import { useState } from 'react'
import './App.css'

function App() {
  const [isOpen, setIsOpen] = useState(false)

  // Assumption: The main 3D tour project runs on port 5173. 
  // If the user's dev server is on a different port, this needs to be updated.
  const TOUR_URL = "http://localhost:3000" 

  return (
    <div className="app-container">
      <header className="header">
        <h1>Client Website</h1>
        <p>This is a mock client website to demonstrate 3D tour embedding.</p>
      </header>

      <main className="main-content">
        <div className="card">
          <h2>Virtual Tour Configuration</h2>
          <p>Click below to open the property tour.</p>
          <button onClick={() => setIsOpen(true)} className="open-btn">
            Open 3D Tour
          </button>
        </div>
      </main>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
            <div className="iframe-container">
              <iframe 
                src={TOUR_URL} 
                title="3D Tour"
                className="tour-iframe"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
