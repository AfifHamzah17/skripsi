// src/components/NotFoundView.js

import React from "react";
// Impor file CSS khusus untuk animasi 404
import "../../style/404-custom.css"; 

export default function NotFoundView() {
  return (
    // 1. Background utama dengan gradien ungu-kehitaman
    <div className="relative w-full h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black overflow-hidden">
      
      {/* 2. Kontainer untuk semua elemen animasi */}
      <div className="absolute inset-0 w-full h-full">
        
        {/* 3. Konten tengah (Gambar 404 dan Tombol) */}
        <div className="absolute z-20 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-center">
          <img
            className="w-72 h-auto mb-8" // Menggunakan class Tailwind untuk lebar
            src="http://salehriaz.com/404Page/img/404.svg"
            alt="404"
          />
          {/* 
            Catatan: Jika Anda menggunakan React Router, gunakan <Link to="/home"> 
            daripada <a href="#/home"> untuk navigasi internal yang lebih baik.
          */}
          <a 
            href="/home" 
            className="inline-block px-8 py-3 font-bold text-white transition-all duration-300 bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 hover:scale-105"
          >
            GO BACK HOME
          </a>
        </div>

        {/* 4. Grup objek animasi (Roket, Bumi, Astronot) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            className="absolute top-20 left-10 w-10 object_rocket" // Class 'object_rocket' untuk animasi
            src="http://salehriaz.com/404Page/img/rocket.svg"
            alt="rocket"
          />
          <div className="absolute top-1/4 right-1/4 earth-moon"> {/* Class 'earth-moon' untuk animasi kontainer */}
            <img
              className="w-24 object_earth" // Class 'object_earth' untuk animasi
              src="http://salehriaz.com/404Page/img/earth.svg"
              alt="earth"
            />
            <img
              className="absolute -top-5 -right-5 w-20 object_moon" // Class 'object_moon' untuk animasi
              src="http://salehriaz.com/404Page/img/moon.svg"
              alt="moon"
            />
          </div>
          <div className="absolute bottom-20 left-10 box_astronaut"> {/* Class 'box_astronaut' untuk animasi kontainer */}
            <img
              className="w-36 object_astronaut" // Class 'object_astronaut' untuk animasi
              src="http://salehriaz.com/404Page/img/astronaut.svg"
              alt="astronaut"
            />
          </div>
        </div>

        {/* 5. Bintang-bintang berkelap-kelip */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-ping animation-delay-200"></div>
          <div className="absolute bottom-32 left-1/2 w-1 h-1 bg-white rounded-full animate-ping animation-delay-400"></div>
          <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
          <div className="absolute bottom-20 right-20 w-1 h-1 bg-white rounded-full animate-ping animation-delay-600"></div>
        </div>
      </div>
    </div>
  );
}