# 🌑 GloomSpark: Arcane Survival

> **Một tựa game Horde Survival / Bullet Heaven Roguelite xây dựng bằng React 19, TypeScript và HTML5 Canvas 2D (lấy cảm hứng từ *Magic Survival* và *Vampire Survivors*).**

---

## 📖 1. Giới thiệu Dự án

Trong **GloomSpark**, người chơi hóa thân vào những thực thể ma thuật thuộc các chủng tộc cổ xưa (Quỷ tộc, Long nhân, Bán quỷ, Yêu quái, Pháp sư...) chiến đấu giữa màn đêm tăm tối và tro tàn. Mục tiêu là sống sót trước hàng trăm đợt quái vật hung hãn ngày càng đông đảo, tích lũy tinh thể kinh nghiệm, dung hợp các đại ma thuật (Magic Fusion), thu thập bộ cổ vật bí truyền và thức tỉnh sức mạnh tối thượng.

### 🎮 Điểm nổi bật
- **Kiến trúc Dual-Layer siêu mượt:** Game Engine chạy trên HTML5 Canvas thuần ở 60 FPS không giật lag; Giao diện HUD, thẻ bài lên cấp và rương báu được React quản lý linh hoạt.
- **Hệ thống Class & Thức Tỉnh:** Đa dạng chủng tộc (Quỷ, Bán quỷ, Long nhân, Yêu quái, Pháp sư, Triệu hồi sư...). Khi đạt cấp độ cao trong trận, class sẽ tiến hóa (ví dụ: *Quỷ* -> *Quỷ Thượng Cổ*).
- **Hệ thống Phép thuật & Dung Hợp (Magic Fusion):** Nâng cấp tối đa 2 kỹ năng liên kết để dung hợp thành một Siêu Ma Thuật mới.
- **Hệ thống 8 Ô Cổ Vật & Hiệu Ứng Bộ (Set Bonus):** Thu thập rương báu, ghép trùng để tăng sao trang bị, kích hoạt chỉ số ẩn khi gom đủ 2 hoặc 4 món cùng bộ.
- **Cân bằng Toán học chặt chẽ:** Áp dụng cơ chế cộng dồn (Additive stats), giới hạn mềm (Soft caps) và đường cong giãn nở quái vật theo thời gian thực.
- **Tiến trình Vĩnh viễn (Meta-Progression):** Kiếm Vàng để nâng cấp Cây tài năng (Máu, Giáp, Tốc độ, Sát thương nguyên tố) và mở khóa Bản đồ mới sau khi chiến thắng.

---

## 🛠️ 2. Yêu cầu Hệ thống & Môi trường

Để cài đặt và chạy dự án, máy tính cần cài sẵn:
- **Node.js:** Phiên bản `18.x` hoặc `20.x` trở lên (Khuyến nghị Node `20.x LTS`).
- **NPM:** Phiên bản `9.x` hoặc `10.x`.
- **Trình duyệt Web hiện đại:** Google Chrome, Microsoft Edge, Brave, Firefox (hỗ trợ tốt HTML5 Canvas 2D và Web Audio API).

---

## 🚀 3. Cài đặt & Khởi chạy Dự án

### Bước 1: Di chuyển vào thư mục dự án
```bash
cd D:\GameDevelop\ReactProject\GloomSpark
```

### Bước 2: Cài đặt các thư viện phụ thuộc
*(Lưu ý: Dùng cờ `--legacy-peer-deps` để đảm bảo tương thích hoàn hảo giữa các gói)*
```bash
npm install --legacy-peer-deps
```

### Bước 3: Khởi chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Trình duyệt sẽ mở tại địa chỉ: `http://localhost:5173/` (hoặc cổng được hiển thị trong terminal).

### Bước 4: Kiểm tra và Build Production (Tùy chọn)
```bash
npm run build
npm run preview
```

---

## 📦 4. Các Thư viện Cần thiết & Công nghệ Sử dụng

| Công nghệ / Thư viện | Phiên bản | Vai trò trong dự án |
| :--- | :--- | :--- |
| **Vite** | `^8.x` / `^6.x` | Build tool và Dev server tốc độ cao, hỗ trợ HMR tức thì |
| **React & React-DOM** | `^19.x` | Quản lý cây UI: HUD, Modals, Cửa hàng, Sảnh chờ, Inventory |
| **TypeScript** | `~6.x` / `~5.x` | Đảm bảo tính toàn vẹn kiểu dữ liệu (Class, Stats, Spells, Equipment) |
| **HTML5 Canvas 2D API** | Native | Render vòng lặp game 60 FPS, xử lý chuyển động, đạn và hiệu ứng |
| **Lucide React** | `^1.x` | Bộ icon vector chất lượng cao cho UI game (khiên, kiếm, máu, ngọc) |

---

## 📁 5. Cấu trúc Thư mục Dự án

```text
GloomSpark/
├── public/                 # Âm thanh (SFX/BGM), textures, font chữ game
├── src/
│   ├── assets/             # Hình ảnh đồ họa và biểu tượng
│   ├── components/         # [React UI] HUD, LevelUpModal, ChestModal, Sảnh Lobby
│   ├── constants/          # File cấu hình cân bằng game, chỉ số quái, công thức
│   ├── game/               # [Game Engine] Canvas Game Loop thuần TypeScript
│   │   ├── core/           # GameEngine, GameLoop, InputManager, SpatialGrid, ObjectPool
│   │   ├── classes/        # Định nghĩa Class và cơ chế Thức Tỉnh (Demon, Dragonkin...)
│   │   ├── entities/       # Player, Enemy, Projectile, ExpOrb, Chest
│   │   ├── equipment/      # 8 ô cổ vật, hệ thống rương, hiệu ứng bộ (Set Bonus)
│   │   ├── events/         # GameEvents (Cầu nối giữa Canvas và React)
│   │   ├── maps/           # Cấu hình Map 1, Map 2
│   │   ├── spells/         # Thư viện kỹ năng và cơ chế Hợp Nhất (Magic Fusion)
│   │   └── waves/          # Quản lý giãn nở bầy quái theo thời gian
│   ├── hooks/              # Custom hooks kết nối React với Game Engine
│   ├── meta/               # Save/Load LocalStorage, Cây tài năng, Cửa hàng
│   ├── types/              # Type definitions toàn bộ hệ thống
│   ├── App.tsx             # Component gốc kết nối Canvas và Overlays
│   └── main.tsx            # Entry point
├── AGENTS.md               # Quy chuẩn phát triển và hướng dẫn cho AI Agents
├── package.json
└── README.md
```

---

## 🗺️ 6. Lộ trình Phát triển 5 Giai đoạn

- **Giai đoạn 1:** Vòng lặp chiến đấu cốt lõi (WASD, Swarm quái bu quanh, Tự bắn đạn, Hút EXP, Pop-up Level Up).
- **Giai đoạn 2:** Thư viện Ma Thuật & Hệ thống Dung Hợp (Magic Fusion).
- **Giai đoạn 3:** 8 Ô Cổ Vật, Rương Báu & Kích hoạt Hiệu ứng Bộ (Set Bonus).
- **Giai đoạn 4:** Hệ thống Chủng tộc, Class & Cơ chế Thức Tỉnh Bậc 2.
- **Giai đoạn 5:** Sảnh Lobby, Nâng cấp Vĩnh viễn (Talent Tree) & Mở khóa Map 2 sau khi thắng Map 1.

---

## 🌿 7. Quy ước Quản lý Git & Đặt tên Nhánh (Git Workflow & Branching Conventions)

Dự án áp dụng mô hình phân nhánh chuẩn để đảm bảo mã nguồn luôn rõ ràng, ổn định và dễ quản lý:

### 7.1 Cấu trúc các nhánh chính (Core Branches)
- `main`: Nhánh production, chứa mã nguồn ổn định nhất đã kiểm thử và có thể chơi được bất cứ lúc nào.
- `develop`: Nhánh phát triển chính, nơi tích hợp các tính năng mới trước khi phát hành phiên bản.

### 7.2 Quy ước đặt tên nhánh (Branch Naming Convention)
Định dạng: `<tiền-tố>/<mô-tả-ngắn-gọn-kebab-case>`

| Tiền tố nhánh | Mục đích sử dụng | Ví dụ thực tế trong GloomSpark |
| :--- | :--- | :--- |
| `feature/` | Phát triển tính năng mới | `feature/phase1-core-loop`, `feature/class-system`, `feature/magic-fusion` |
| `fix/` | Sửa lỗi / Bug fix trong quá trình phát triển | `fix/collision-fps-drop`, `fix/levelup-pause-bug` |
| `hotfix/` | Vá lỗi khẩn cấp trực tiếp trên nhánh `main` | `hotfix/gameover-black-screen` |
| `refactor/` | Tái cấu trúc mã nguồn, dọn code (không đổi tính năng) | `refactor/spatial-grid-engine`, `refactor/stat-calculator` |
| `perf/` | Tối ưu hóa hiệu năng, giảm lag, tăng FPS | `perf/object-pooling-projectiles`, `perf/canvas-batch-rendering` |
| `balance/` | Cân bằng chỉ số game (quái, class, kỹ năng) | `balance/nerf-demon-lifesteal`, `balance/buff-enemy-wave3` |
| `docs/` | Cập nhật tài liệu, README, hướng dẫn kỹ thuật | `docs/update-git-conventions`, `docs/add-class-mechanics` |

### 7.3 Quy ước Đặt tên Commit (Conventional Commits)
Cấu trúc chuẩn: `<type>: <mô tả ngắn bằng tiếng Anh hoặc tiếng Việt>`
- `feat: add spatial hash grid for 60fps swarm collisions`
- `feat: implement demon class with lifesteal passive`
- `fix: prevent exp gems from flying outside canvas view`
- `refactor: extract BaseSpell abstract class into separate module`
- `perf: pool enemy instances to avoid garbage collection stutter`
- `balance: adjust enemy scaling curve formula for minute 5 to 10`
- `docs: add git branching guidelines to README`
