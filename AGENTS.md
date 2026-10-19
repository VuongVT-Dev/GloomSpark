# 🤖 HƯỚNG DẪN DÀNH CHO AI AGENTS & DEVELOPERS (AGENTS.md)
## DỰ ÁN: GLOOMSPARK (HORDE SURVIVAL)

Tài liệu này quy định các nguyên tắc thiết kế kiến trúc, quy chuẩn mã nguồn và luật bất thành văn khi phát triển hoặc mở rộng dự án **GloomSpark**. Bất kỳ Agent hoặc lập trình viên nào tham gia dự án đều phải tuân thủ nghiêm ngặt các điều khoản dưới đây.

---

## 1. NGUYÊN TẮC KIẾN TRÚC CỐT LÕI (DUAL-LAYER ARCHITECTURE)

Dự án phân tách thành 2 tầng hoàn toàn độc lập:

1. **Game Engine Layer (`src/game/`):**
   - Hoạt động bằng TypeScript thuần túy, vẽ trên thẻ `<canvas>`.
   - Chạy theo chu kỳ 60 FPS qua `requestAnimationFrame(deltaTime)`.
   - **CẤM:** Không được phép gọi hàm `setState` của React hay trigger re-render React bên trong vòng lặp game loop 60 FPS.
2. **React UI Layer (`src/components/`):**
   - Chịu trách nhiệm hiển thị HUD, Thanh máu, Thanh EXP, Cửa sổ chọn kỹ năng (Level Up Modal), Mở rương, Pause, Game Over.
3. **Cơ chế Giao tiếp (Event Bridge):**
   - Sử dụng `GameEvents` (`EventEmitter`) duy nhất.
   - Khi cần mở Modal: GameEngine gọi `gameEngine.pause()` -> phát event `GameEvents.emit('LEVEL_UP', data)`.
   - Khi người chơi chọn xong trên React: React gọi hàm xử lý của Engine hoặc emit event -> GameEngine áp dụng chỉ số -> gọi `gameEngine.resume()`.

---

## 2. QUY CHUẨN TỐI ƯU HIỆU NĂNG (PERFORMANCE RULES)

Game có thể xuất hiện từ 200 đến 500 thực thể quái vật và đạn cùng lúc. Để giữ vững 60 FPS:

1. **Spatial Hash Grid cho va chạm:**
   - Không được dùng 2 vòng lặp lồng nhau $O(N \times M)$ để kiểm tra va chạm giữa đạn và quái.
   - Bắt buộc đưa quái vào `SpatialGrid` và chỉ truy vấn các thực thể trong cùng ô bán kính.
2. **Object Pooling (Tái sử dụng đối tượng):**
   - Tránh việc `new Projectile()` hoặc `new Enemy()` liên tục trong game loop.
   - Sử dụng `ObjectPool` để tái kích hoạt các đối tượng đã chết nhằm ngăn chặn Garbage Collection gây khựng khung hình.
3. **Bộ đếm thời gian Delta Time:**
   - Mọi chuyển động và tốc độ bắn phải nhân với `deltaTime` (tính bằng giây) để tốc độ game không phụ thuộc vào tần số quét màn hình (60Hz, 120Hz, 144Hz).

---

## 3. NGUYÊN TẮC CÂN BẰNG CHỈ SỐ (BALANCE LAWS)

1. **Công thức Chỉ số Cộng dồn (Additive Modifiers):**
   - Tuyệt đối không nhân dồn vô hạn các % tăng sát thương. Mọi % tăng từ Class, Cổ vật, Tài năng phải cộng gộp:
     $$\text{Sát thương} = \text{Gốc} \times (1 + \text{Class\%} + \text{Talent\%} + \text{Equip\%})$$
2. **Giới hạn cứng / mềm (Hard & Soft Caps):**
   - **Né tránh (Dodge Chance):** Tối đa 60%.
   - **Giảm hồi chiêu (Cooldown Reduction):** Tối đa 50%.
   - **Hút máu (Lifesteal):** Áp dụng giới hạn tối đa không hồi quá 5% máu tối đa mỗi giây.
   - **Công thức Giáp:** Sử dụng công thức phi tuyến $\text{Armor} / (\text{Armor} + 100)$.
3. **Cân bằng Class (Trade-Off):**
   - Mỗi Class có ưu điểm vượt trội thì bắt buộc phải gán một điểm yếu tương ứng (ví dụ: Quỷ hút máu cao nhưng máu tối đa thấp / giáp yếu; Long nhân trâu bò nhưng tốc độ chạy chậm).

---

## 4. QUY CHUẨN MÃ NGUỒN & TỔ CHỨC FILE

1. **TypeScript Typing:**
   - Mọi thực thể, chỉ số, kỹ năng phải có kiểu dữ liệu rõ ràng trong `src/types/`. Tuyệt đối không dùng `any`.
2. **File Cấu hình Cân bằng tập trung:**
   - Các hằng số như máu quái, tốc độ di chuyển, tỉ lệ rớt rương phải đặt trong `src/constants/balancingConfig.ts`, không hardcode rải rác trong code.
3. **Thêm Kỹ năng mới (`src/game/spells/`):**
   - Mọi kỹ năng mới phải kế thừa từ abstract class `BaseSpell`.
   - Mỗi file chỉ chứa một loại phép thuật và định nghĩa mốc nâng cấp từ Level 1 đến 5.
4. **Thêm Class mới (`src/game/classes/`):**
   - Mỗi Class phải định nghĩa đủ 2 Bậc (Tier 1 cơ bản và Tier 2 Thức tỉnh), chỉ số cộng thêm và kỹ năng khởi đầu.

---

## 5. CHECKLIST TRƯỚC KHI COMMIT / NGHIỆM THU

- [ ] Dự án build không có lỗi TypeScript: `npm run build`.
- [ ] Không có lỗi linting nghiêm trọng: `npm run lint`.
- [ ] FPS duy trì ổn định >= 55 FPS khi mở dev tools và spawn 150 quái vật.
- [ ] Trạng thái Game Pause hoạt động hoàn hảo khi mở bất kỳ Modal React nào.
