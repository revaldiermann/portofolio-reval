/**
 * Lanyard 3D Interaktif (Three.js Vanilla)
 * Fitur:
 * - Otomatis mencari gambar kartu/tali (.webp, .png, .jpg, .jpeg) di folder assets/.
 * - Jika gambar tidak ditemukan, otomatis menggambar desain kartu via HTML5 Canvas.
 * - Kartu memiliki tepi miring 3D (bevel), sudut melengkung (alpha mask), dan efek kilau kaca.
 * - Simulasi fisika tali pendulum: bisa ditarik, dilempar, memantul, dan dibalik (double-click).
 */
(function () {
  const host = document.getElementById("lanyard");
  if (!host || !window.THREE) return;

  const T = THREE;

  // Ambil data teks dari atribut HTML <div id="lanyard" data-name="..." ...>
  const NAME = host.dataset.name || "REVALDI ERMANSYAH";
  const ROLE = host.dataset.role || "Fullstack Developer";
  const MAIL = host.dataset.email || "revaldi@email.com";

  // ==========================================================================
  // 1. SETUP RENDERER, SCENE, KAMERA & PENCAHAYAAN
  // ==========================================================================
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // Tajam di layar Retina tanpa boros GPU
  renderer.outputEncoding = T.sRGBEncoding;
  host.appendChild(renderer.domElement);

  const scene = new T.Scene();

  // Kamera perspektif dengan sudut pandang (FOV) 34 derajat
  const camera = new T.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  // Pencahayaan 3 titik: merata (Ambient), utama (Directional), dan aksen biru (Point)
  scene.add(new T.AmbientLight(0xffffff, 1.4));

  const dirLight = new T.DirectionalLight(0xffffff, 1.6);
  dirLight.position.set(3, 4, 5);
  scene.add(dirLight);

  const pointLight = new T.PointLight(0x6d8bff, 1.2);
  pointLight.position.set(-3, -2, 3);
  scene.add(pointLight);

  // ==========================================================================
  // 2. GENERATOR TEKSTUR CANVAS (FALLBACK JIKA GAMBAR EKSTERNAL TIDAK ADA)
  // ==========================================================================

  // Helper untuk membuat path persegi dengan sudut melengkung (Rounded Rectangle)
  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Mengubah gambar Canvas 2D menjadi Texture 3D Three.js
  function createCanvasTexture(drawFn) {
    const canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 1067;

    const ctx = canvas.getContext("2d");
    drawRoundedRect(ctx, 0, 0, 700, 1067, 50);
    ctx.clip(); // Potong bagian luar sudut melengkung agar transparan
    drawFn(ctx);

    const tex = new T.CanvasTexture(canvas);
    tex.encoding = T.sRGBEncoding;
    tex.anisotropy = 8;
    return tex;
  }

  // Latar dasar kartu (gradien gelap, pendar biru, garis tepi, dan lubang tali)
  function drawBaseBackground(ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 700, 1067);
    bgGrad.addColorStop(0, "#0b1636");
    bgGrad.addColorStop(1, "#050816");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 700, 1067);

    // Pendar cahaya biru di kanan bawah
    const glow = ctx.createRadialGradient(560, 900, 10, 560, 900, 420);
    glow.addColorStop(0, "rgba(44, 103, 237, 0.55)");
    glow.addColorStop(1, "rgba(44, 103, 237, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 700, 1067);

    // Garis bingkai tipis
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, 6, 6, 688, 1055, 46);
    ctx.stroke();

    // Lubang slot tali di atas kartu
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    drawRoundedRect(ctx, 280, 36, 140, 22, 11);
    ctx.fill();
  }

  // Desain sisi DEPAN kartu (Inisial Avatar, Nama, Jabatan, ID)
  function drawFrontCard(ctx) {
    drawBaseBackground(ctx);

    const avatarGrad = ctx.createLinearGradient(190, 200, 510, 520);
    avatarGrad.addColorStop(0, "#2c67ed");
    avatarGrad.addColorStop(1, "#38bdf8");
    ctx.fillStyle = avatarGrad;
    ctx.beginPath();
    ctx.arc(350, 370, 160, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "800 120px Inter, Arial";
    ctx.fillText("RE", 350, 410);

    ctx.font = "800 54px Inter, Arial";
    ctx.fillText(NAME.split(" ")[0], 350, 680);
    ctx.fillText(NAME.split(" ").slice(1).join(" "), 350, 745);

    ctx.fillStyle = "#60a5fa";
    ctx.font = "600 36px Inter, Arial";
    ctx.fillText(ROLE, 350, 815);

    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.font = "500 28px ui-monospace, Menlo, monospace";
    ctx.fillText("ID · DEV-2026", 350, 990);
  }

  // Desain sisi BELAKANG kartu (Teks ajakan, Email, dan dekorasi barcode)
  function drawBackCard(ctx) {
    drawBaseBackground(ctx);
    ctx.textAlign = "center";

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 66px Inter, Arial";
    ctx.fillText("Mari", 350, 380);
    ctx.fillText("Berkolaborasi", 350, 455);

    ctx.fillStyle = "#60a5fa";
    ctx.font = "500 34px Inter, Arial";
    ctx.fillText(MAIL, 350, 560);

    // Garis vertikal menyerupai barcode
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.moveTo(150 + i * 50, 760);
      ctx.lineTo(150 + i * 50, 880 + (i % 3) * 20);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.font = "500 28px ui-monospace, Menlo, monospace";
    ctx.fillText("Tarik & lepas kartu ini", 350, 990);
  }

  // Tekstur kain tali lanyard bawaan
  function createDefaultStrapTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 512;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1f4fc4";
    ctx.fillRect(0, 0, 64, 512);
    ctx.fillStyle = "#2c67ed";
    ctx.fillRect(6, 0, 52, 512);

    ctx.save();
    ctx.translate(32, 256);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "700 26px Inter, Arial";
    ctx.textAlign = "center";
    ctx.fillText("REVALDI  •  FULLSTACK  •  REVALDI  •  DEV", 0, 9);
    ctx.restore();

    const tex = new T.CanvasTexture(canvas);
    tex.encoding = T.sRGBEncoding;
    tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(1, 1.4);
    return tex;
  }

  // ==========================================================================
  // 3. SISTEM PEMUAT GAMBAR OTOMATIS & MASKING SUDUT MELENGKUNG
  // ==========================================================================
  const MAX_ANISOTROPY = renderer.capabilities.getMaxAnisotropy();
  const EXTENSIONS = ["webp", "png", "jpg", "jpeg"];

  // Membuat daftar kemungkinan nama file (jika atribut data-* kosong, coba semua ekstensi)
  function getFileCandidates(customAttr, basePath) {
    return customAttr
      ? [customAttr]
      : EXTENSIONS.map((ext) => `${basePath}.${ext}`);
  }

  // Mencoba memuat daftar file satu per satu secara rekursif hingga ada yang berhasil
  function loadFirstAvailableTexture(candidates, onLoaded, index = 0) {
    if (index >= candidates.length) return;

    new T.TextureLoader().load(
      candidates[index],
      function (texture) {
        texture.encoding = T.sRGBEncoding;
        texture.anisotropy = MAX_ANISOTROPY; // Maksimal ketajaman gambar saat miring
        onLoaded(texture);
      },
      undefined,
      function () {
        // Jika gagal (404), lanjut coba format file berikutnya
        loadFirstAvailableTexture(candidates, onLoaded, index + 1);
      }
    );
  }

  // Tekstur Alpha Map (hitam = transparan, putih = terlihat) untuk memotong sudut foto jadi bulat
  function createRoundedMaskTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 384;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 256, 384);
    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, 0, 0, 256, 384, 21);
    ctx.fill();

    return new T.CanvasTexture(canvas);
  }

  // ==========================================================================
  // 4. PERAKITAN OBJEK 3D (KLIP, TALI, CINCIN & KARTU BER-BEVEL)
  // ==========================================================================
  const ANCHOR = new T.Vector3(0, 2.6, 0); // Titik gantung atas
  const ROPE_LENGTH = 1.6;                  // Panjang normal tali
  const MAX_PULL = 1.3;                     // Batas maksimal tarikan tali (1.3x)
  const CARD_W = 1.55;                      // Lebar kartu 3D
  const CARD_H = 2.32;                      // Tinggi kartu 3D

  // Material logam untuk klip atas & cincin kartu
  const metalMat = new T.MeshStandardMaterial({
    color: 0xc9cfdb,
    metalness: 0.9,
    roughness: 0.25,
  });

  // 1. Klip cincin atas yang diam di posisi ANCHOR
  const topClip = new T.Mesh(new T.TorusGeometry(0.14, 0.04, 12, 32), metalMat);
  topClip.position.copy(ANCHOR);
  scene.add(topClip);

  // 2. Tali lanyard (menggunakan tekstur Canvas dulu, lalu diganti gambar jika ditemukan)
  const strapMat = new T.MeshStandardMaterial({
    map: createDefaultStrapTexture(),
    roughness: 0.85,
    side: T.DoubleSide,
  });
  const strapMesh = new T.Mesh(new T.PlaneGeometry(0.36, 1), strapMat);
  strapMesh.position.z = -0.02;
  scene.add(strapMesh);

  loadFirstAvailableTexture(
    getFileCandidates(host.dataset.strap, "assets/strap"),
    function (tex) {
      tex.wrapT = T.RepeatWrapping;
      strapMat.map = tex;
      strapMat.needsUpdate = true;
    }
  );

  // 3. Grup Pivot (pusat ayunan tepat di cincin penghubung tali & kartu)
  const pivot = new T.Group();
  scene.add(pivot);

  const cardRing = new T.Mesh(new T.TorusGeometry(0.11, 0.028, 12, 32), metalMat);
  cardRing.rotation.x = Math.PI / 2;
  pivot.add(cardRing);

  // 4. Grup Kartu (digeser ke bawah agar menggantung di bawah cincin)
  const cardGroup = new T.Group();
  cardGroup.position.y = -0.12 - CARD_H / 2;
  pivot.add(cardGroup);

  // Ukuran permukaan kartu & tepi miring (Bevel)
  const BEVEL = 0.02;
  const FACE_W = CARD_W - 0.02;
  const FACE_H = CARD_H - 0.02;
  const CARD_ASPECT = FACE_W / FACE_H;

  // Bentuk bodi utama kartu dengan tepi miring (bevel) agar terlihat tebal & premium
  const cardShape = new T.Shape();
  const hw = CARD_W / 2 - BEVEL;
  const hh = CARD_H / 2 - BEVEL;
  const r = 0.1;

  cardShape.moveTo(-hw + r, -hh);
  cardShape.lineTo(hw - r, -hh);
  cardShape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  cardShape.lineTo(hw, hh - r);
  cardShape.quadraticCurveTo(hw, hh, hw - r, hh);
  cardShape.lineTo(-hw + r, hh);
  cardShape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  cardShape.lineTo(-hw, -hh + r);
  cardShape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  const bodyGeo = new T.ExtrudeGeometry(cardShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 5,
    curveSegments: 16,
  });
  bodyGeo.translate(0, 0, -0.03); // Ketebalan total 0.10 dipusatkan di sumbu Z = 0

  cardGroup.add(
    new T.Mesh(
      bodyGeo,
      new T.MeshStandardMaterial({
        color: 0x0f1626,
        metalness: 0.6,
        roughness: 0.28,
      })
    )
  );

  // 5. Pemasangan Sisi Depan, Belakang & Lapisan Kilau (Gloss)
  const roundedMask = createRoundedMaskTexture();

  function createCardFace(customAttr, basePath, fallbackDrawFn, zPos, rotY) {
    // Tampilkan Canvas dulu sebagai placeholder sambil menunggu gambar selesai dimuat
    const mat = new T.MeshBasicMaterial({
      map: createCanvasTexture(fallbackDrawFn),
      transparent: true,
      toneMapped: false,
    });

    const mesh = new T.Mesh(new T.PlaneGeometry(FACE_W, FACE_H), mat);
    mesh.position.z = zPos;
    mesh.rotation.y = rotY;
    cardGroup.add(mesh);

    // Jika gambar eksternal ditemukan, terapkan mode "object-fit: cover" agar tidak gepeng
    loadFirstAvailableTexture(getFileCandidates(customAttr, basePath), function (tex) {
      const imgAspect = tex.image.width / tex.image.height;

      if (imgAspect > CARD_ASPECT) {
        tex.repeat.x = CARD_ASPECT / imgAspect;
        tex.offset.x = (1 - tex.repeat.x) / 2;
      } else {
        tex.repeat.y = imgAspect / CARD_ASPECT;
        tex.offset.y = (1 - tex.repeat.y) / 2;
      }

      mat.map = tex;
      mat.alphaMap = roundedMask; // Potong sudut gambar mengikuti bentuk kartu
      mat.needsUpdate = true;
    });

    return mesh;
  }

  createCardFace(host.dataset.front, "assets/front-card", drawFrontCard, 0.0505, 0);
  createCardFace(host.dataset.back, "assets/back-card", drawBackCard, -0.0505, Math.PI);

  // Lapisan kilau transparan tipis di permukaan depan kartu
  const glossOverlay = new T.Mesh(
    new T.PlaneGeometry(FACE_W, FACE_H),
    new T.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      alphaMap: roundedMask,
      depthWrite: false,
    })
  );
  glossOverlay.position.z = 0.0515;
  cardGroup.add(glossOverlay);

  // ==========================================================================
  // 5. SIMULASI FISIKA PENDULUM (GRAVITASI, TEGANGAN TALI & PANTULAN)
  // ==========================================================================
  const pos = new T.Vector3(0, ANCHOR.y - ROPE_LENGTH, 0); // Posisi cincin kartu
  const vel = new T.Vector3(0.9, 0, 0);                     // Dorongan awal agar berayun saat dibuka

  let tiltAngle = 0;  // Kemiringan kiri-kanan (rotasi Z)
  let tiltVel = 0;    // Kecepatan kemiringan Z
  let spinAngle = 0;  // Putaran horizontal saat terlempar (rotasi Y)
  let spinVel = 0;    // Kecepatan putaran Y
  let flipAngle = 0;  // Sudut balik kartu saat ini
  let flipTarget = 0; // Target sudut balik (0 = depan, PI = belakang)
  let idleTimer = 0;  // Penghitung waktu diam untuk fitur auto-flip

  let isDragging = false;
  const grabOffset = new T.Vector3();
  const estVelocity = new T.Vector3();
  const pointerPos = new T.Vector3();

  const GRAVITY = 15;
  const AIR_DRAG = 0.45;
  const BOUNCE = 0.22;

  function stepPhysics(dt) {
    if (!isDragging) {
      // 1. Gravitasi menarik kartu ke bawah & hambatan udara memperlambat ayunan
      vel.y -= GRAVITY * dt;
      vel.multiplyScalar(Math.exp(-AIR_DRAG * dt));
      pos.addScaledVector(vel, dt);

      // 2. Constraint tali: jika jarak melebihi ROPE_LENGTH, tarik kembali + pantulkan
      const diff = pos.clone().sub(ANCHOR);
      const dist = diff.length();
      if (dist > ROPE_LENGTH) {
        const normal = diff.divideScalar(dist);
        pos.copy(ANCHOR).addScaledVector(normal, ROPE_LENGTH);

        const outwardVel = vel.dot(normal);
        if (outwardVel > 0) {
          vel.addScaledVector(normal, -outwardVel * (1 + BOUNCE));
        }
      }

      // 3. Auto-flip: balik kartu otomatis jika diam selama 9 detik
      idleTimer += dt;
      if (idleTimer > 9 && vel.length() < 0.25) {
        idleTimer = 0;
        flipTarget = flipTarget ? 0 : Math.PI;
      }
    } else {
      idleTimer = 0;
    }

    // 4. Efek pegas (spring) agar kemiringan kartu mengikuti sudut tali secara alami
    const diff = pos.clone().sub(ANCHOR);
    const targetTilt = Math.atan2(diff.x, -diff.y);
    tiltVel += ((targetTilt - tiltAngle) * 70 - tiltVel * 6) * dt;
    tiltAngle += tiltVel * dt;

    // 5. Kembalikan putaran sumbu Y secara perlahan ke posisi menghadap depan/belakang
    spinVel += (-spinAngle * 22 - spinVel * 2.4) * dt;
    spinAngle += spinVel * dt;
  }

  function updateFrame(dt) {
    dt = Math.min(dt, 0.033); // Batasi delta-time agar fisika tetap stabil saat tab ditinggal
    const subSteps = 4;       // Pecah 1 frame menjadi 4 langkah fisika kecil agar akurat
    for (let i = 0; i < subSteps; i++) {
      stepPhysics(dt / subSteps);
    }

    // Transisi halus saat kartu dibalik (0 <-> 180 derajat)
    flipAngle += (flipTarget - flipAngle) * Math.min(1, dt * 3);

    pivot.position.copy(pos);
    pivot.rotation.z = tiltAngle;
    pivot.rotation.y = spinAngle + flipAngle;

    // Regangkan dan putar tali agar selalu menghubungkan ANCHOR dengan cincin kartu
    const diff = pos.clone().sub(ANCHOR);
    const currentLen = Math.max(0.15, diff.length());
    strapMesh.position.set((pos.x + ANCHOR.x) / 2, (pos.y + ANCHOR.y) / 2, -0.02);
    strapMesh.scale.y = currentLen;
    strapMesh.rotation.z = Math.atan2(-diff.x, diff.y);
  }

  // ==========================================================================
  // 6. INTERAKSI MOUSE & LAYAR SENTUH (RAYCASTING)
  // ==========================================================================
  const raycaster = new T.Raycaster();
  const ndc = new T.Vector2();
  const canvasEl = renderer.domElement;
  let lastMoveTime = 0;

  function setRayFromEvent(e) {
    const rect = canvasEl.getBoundingClientRect();
    ndc.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(ndc, camera);
  }

  // Mengubah posisi kursor 2D layar menjadi koordinat 3D pada bidang Z = 0
  function getPointerWorldPos(e, outVec) {
    setRayFromEvent(e);
    const origin = raycaster.ray.origin;
    const dir = raycaster.ray.direction;
    const t = -origin.z / dir.z;
    return outVec.copy(origin).addScaledVector(dir, t);
  }

  function isHittingCard(e) {
    setRayFromEvent(e);
    return raycaster.intersectObject(cardGroup, true).length > 0;
  }

  // Cegah halaman ikut ter-scroll di HP saat menyentuh kartu
  canvasEl.addEventListener(
    "touchstart",
    function (e) {
      const touch = e.touches[0];
      if (touch && isHittingCard(touch)) e.preventDefault();
    },
    { passive: false }
  );

  // Mulai menarik kartu
  canvasEl.addEventListener("pointerdown", function (e) {
    if (!isHittingCard(e)) return;
    isDragging = true;
    canvasEl.setPointerCapture(e.pointerId);
    canvasEl.style.cursor = "grabbing";

    getPointerWorldPos(e, pointerPos);
    grabOffset.copy(pos).sub(pointerPos);
    estVelocity.set(0, 0, 0);
    vel.set(0, 0, 0);
    tiltVel *= 0.3;
    lastMoveTime = performance.now();
  });

  // Menggeser kartu mengikuti gerakan kursor
  canvasEl.addEventListener("pointermove", function (e) {
    if (!isDragging) {
      canvasEl.style.cursor = isHittingCard(e) ? "grab" : "default";
      return;
    }

    const now = performance.now();
    const dt = Math.max(0.008, (now - lastMoveTime) / 1000);
    lastMoveTime = now;

    const nextPos = getPointerWorldPos(e, new T.Vector3()).add(grabOffset);
    const diff = nextPos.clone().sub(ANCHOR);
    const dist = diff.length();

    // Tali dapat melar hingga batas ROPE_LENGTH * MAX_PULL
    if (dist > ROPE_LENGTH * MAX_PULL) {
      nextPos.copy(ANCHOR).addScaledVector(diff.divideScalar(dist), ROPE_LENGTH * MAX_PULL);
    }

    nextPos.z = 0;
    estVelocity.lerp(nextPos.clone().sub(pos).divideScalar(dt), 0.35);
    pos.copy(nextPos);
    spinVel += -estVelocity.x * 0.03;
  });

  // Melepas kartu & melontarkannya sesuai kecepatan tarikan terakhir
  function releaseCard() {
    if (!isDragging) return;
    isDragging = false;
    canvasEl.style.cursor = "grab";

    vel.copy(estVelocity).clampLength(0, 14);
    spinVel += vel.x * 0.9;
  }

  canvasEl.addEventListener("pointerup", releaseCard);
  canvasEl.addEventListener("pointercancel", releaseCard);
  canvasEl.addEventListener("lostpointercapture", releaseCard);

  // Double-click untuk membalik sisi kartu secara manual
  canvasEl.addEventListener("dblclick", function (e) {
    if (isHittingCard(e)) {
      flipTarget = flipTarget ? 0 : Math.PI;
    }
  });

  // ==========================================================================
  // 7. RESPONSIVE RESIZE & ANIMATION LOOP
  // ==========================================================================
  function handleResize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;

    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  handleResize();
  window.addEventListener("resize", handleResize);

  // Hentikan rendering sementara jika elemen tidak terlihat di layar (hemat baterai)
  let isVisible = true;
  let prevTime = performance.now();

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      isVisible = entries[0].isIntersecting;
    }).observe(host);
  }

  (function animate(now) {
    requestAnimationFrame(animate);
    const dt = (now - prevTime) / 1000;
    prevTime = now;

    if (isVisible) {
      updateFrame(dt);
      renderer.render(scene, camera);
    }
  })(prevTime);
})();
