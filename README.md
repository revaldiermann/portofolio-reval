# Interactive 3D Lanyard (React)

Komponen kartu identitas 3D dengan tali, pengait metalik, efek ayunan, drag mouse/touch, dan auto flip.

## 1. Install dependency

```bash
npm install three @react-three/fiber @react-three/drei
```

## 2. Siapkan aset

Letakkan tiga gambar berikut di `public/assets/`:

- `front-card.webp` — desain sisi depan kartu (portrait).
- `back-card.webp` — desain sisi belakang kartu.
- `strap.webp` — tekstur tali lanyard vertikal.

Sebaiknya gambar kartu memiliki rasio sekitar 1:1.37 (portrait), sedangkan tekstur strap berupa gambar vertikal berulang.

## 3. Pasang komponen

Salin `src/Lanyard.jsx` dan `src/Lanyard.css` ke folder `src/` proyek React.

Contoh pemakaian:

```jsx
import Lanyard from "./Lanyard";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <h1>Welcome to My Portfolio</h1>
        <p>Creative Developer & Web Enthusiast</p>
      </div>

      <Lanyard
        frontImage="/assets/front-card.webp"
        backImage="/assets/back-card.webp"
        strapImage="/assets/strap.webp"
        autoFlip={true}
      />
    </section>
  );
}
```

## Catatan

- Ini komponen React, bukan HTML statis. React Three Fiber merender objek 3D melalui WebGL.
- Efek ayunan dan drag memakai spring animation ringan; bukan simulasi tali berbasis physics engine penuh.
- Untuk menjaga performa mobile, komponen memakai DPR maksimum 1.8.
- Jika proyekmu memakai Vite, path `/assets/...` cocok untuk file di dalam folder `public/assets/`.
