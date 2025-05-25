//src/components/navbar/navabr.jsx
import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import "../../style.css"; // Styling tambahan

export default function Navbar({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-menu-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={`navbar-links ${isOpen ? "active" : ""}`}>
          <li><a href="#/home">Home</a></li>
          <li><button onClick={onLogout} className="logout-button">Logout</button></li>
        </ul>
      </div>
    </nav>
  );
}