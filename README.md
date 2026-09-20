# Douyin User Video Downloader (v1.6.1)

<p align="center">
  <img src="icon128.png" width="96" height="96" alt="Douyin Downloader Logo" />
</p>

<p align="center">
  <strong>Extension Chrome Manifest V3 toàn diện giúp tải hàng loạt video/audio từ kênh Douyin & tải nhanh video/ảnh đơn lẻ không logo (No Watermark), vượt rào WAF 403 bằng chữ ký bảo mật thuần JavaScript và dịch tên file bằng AI.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=for-the-badge&logo=googlechrome" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Version-1.6.1-green?style=for-the-badge" alt="Version 1.6.1" />
  <img src="https://img.shields.io/badge/Platforms-Douyin_%7C_TikTok-ff0050?style=for-the-badge" alt="Platforms" />
  <img src="https://img.shields.io/badge/AI_Engine-Gemini_3.6_%7C_Groq-8A2BE2?style=for-the-badge" alt="AI Engine" />
  <img src="https://img.shields.io/badge/Anti--Bot-Pure_JS_WebSign-orange?style=for-the-badge" alt="Anti-Bot" />
  <img src="https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge" alt="License" />
</p>

---

## 🌟 Điểm nổi bật & Khác biệt

- 🛡️ **Xóa sổ lỗi HTTP 403 Forbidden (Argus WAF Bypass)**: Tích hợp bộ giải thuật chữ ký kép bảo mật thuần JavaScript (`DYEXABogus` mã hóa SM3 + RC4 và `DYEXWebSign` MD5 kèm `UIFID_TEMP`). Tự động trích xuất cookie phiên duyệt web — **chạy 100% trực tiếp trên trình duyệt, không cần cài đặt Python hay server trung gian!**
- ⚡ **Nút tải nhanh đa năng (Single Media Quick Bar)**: Tự động xuất hiện widget nổi ở góc màn hình khi xem bất kỳ video hoặc album ảnh nào trên **Douyin** và **TikTok** (kể cả khi xem qua popup modal `?modal_id=...` hay trang chi tiết `/video/`, `/note/`). Tự động biến mất tức thì khi thoát xem video, không để lại icon rác.
- 📦 **Tải hàng loạt toàn bộ kênh cá nhân (Batch Profile Downloader)**: Tự động fetch dữ liệu phân trang vô tận (cursor pagination) của trang profile tác giả Douyin (`/user/*`), hỗ trợ chọn hàng loạt hoặc chọn theo dải số thứ tự.
- 🖼️ **Hỗ trợ đầy đủ Album ảnh (Photo Slides) & Video không logo**: Tự động bóc tách link gốc chất lượng cao nhất: Video MP4 Full HD/2K không watermark, trọn bộ album ảnh HD và âm thanh gốc (Original MP3).
- 🤖 **Dịch & Tối ưu tiêu đề file bằng AI (Gemini & Groq)**: Tự động đặt tên file theo tiêu đề video được dịch hoặc viết lại theo phong cách giật tít/viral hook (đặc biệt tối ưu cho nội dung reup Tiếng Việt).
- 🔄 **Hệ thống API Key thông minh**: Tự động xoay vòng nhiều API key (Multi-key rotation), tự cooldown khi gặp rate limit/hết hạn mức và cache kết quả dịch 90 ngày để tiết kiệm quota.
- 🚀 **Background Queue bền bỉ**: Quản lý hàng đợi tải xuống trong Service Worker ngầm, tự checkpoint trạng thái vào `chrome.storage.local`, tự động khôi phục và tiếp tục tiến trình ngay cả khi khởi động lại trình duyệt.
- 🌐 **Đa ngôn ngữ toàn diện**: Hỗ trợ đầy đủ 5 ngôn ngữ giao diện (Tiếng Việt, English, 日本語, 한국어, 简体中文).

---

## 🎯 Chi tiết các tính năng

### 1. Tải lẻ nhanh khi đang lướt Video / Album ảnh (Quick Downloader)
Khi bạn đang xem bất kỳ video hoặc bài viết dạng ảnh (Photo Note) trên **Douyin** hoặc **TikTok**:
- Widget nổi thông minh sẽ xuất hiện ở góc dưới màn hình:
  - 🎬 **Download Video (No Watermark)**: Tải video MP4 gốc độ phân giải cao nhất không dính logo Douyin/TikTok.
  - 📸 **Download All Photos (HD)**: Tải trọn bộ các ảnh trong bài đăng slide ảnh (album note) với chất lượng HD nguyên bản.
  - 🎵 **Download Audio (MP3)**: Tải file âm thanh nền gốc chất lượng cao.
  - 🗂️ **Open in Downloader**: Nạp video hiện tại vào bảng điều khiển chính để xem chi tiết thông số metadata.
- **Smart Lifecycle**: Nút tự nhận diện trạng thái đóng/mở của modal video (khi bấm ra ngoài, bấm nút X hoặc bấm phím `Esc`), đảm bảo không xuất hiện sai vị trí hoặc bị kẹt lại trên trang profile.

### 2. Tải hàng loạt trên trang Profile (Batch Downloader)
Khi truy cập trang cá nhân bất kỳ trên Douyin (`https://www.douyin.com/user/...`):
- Nút bấm biểu tượng download màu hồng xoay sẽ tự động gắn cạnh tab tác phẩm.
- Mở bảng điều khiển chuyên nghiệp với 2 chế độ hiển thị:
  - 📋 **Chế độ List**: Hiển thị bảng chi tiết gồm số thứ tự, ảnh bìa, tiêu đề/caption, ngày đăng và nút tác vụ.
  - 🖼️ **Chế độ Grid**: Hiển thị dạng lưới thẻ video trực quan, dễ dàng xem trước và chọn lọc.
- **Bộ lọc & Sắp xếp mạnh mẽ**:
  - Tìm kiếm thời gian thực theo từ khóa trong tiêu đề/caption.
  - Lọc chính xác theo khoảng ngày đăng (Từ ngày ... Đến ngày ...).
  - Lọc xem: Tất cả video hoặc chỉ những video đang được chọn.
  - Sắp xếp linh hoạt: Mới nhất, Cũ nhất, Tên A–Z hoặc Tên Z–A.
- **Công cụ chọn nhanh linh hoạt**:
  - `Select All`: Chọn/bỏ chọn toàn bộ danh sách đang hiển thị.
  - `Select Range`: Chọn nhanh một khoảng thứ tự (ví dụ: từ video 1 đến 50).
  - `Unselect Range`: Bỏ chọn một khoảng thứ tự cụ thể.
- **Hỗ trợ xuất dữ liệu đa dạng**:
  - 📥 **Download Selected Videos**: Tải hàng loạt video MP4 không watermark.
  - 🎵 **Download Selected Audios**: Tải hàng loạt nhạc nền MP3.
  - 📄 **Export Metadata JSON**: Xuất toàn bộ thông tin chi tiết (Aweme ID, link play, covers, thống kê likes/shares/comments,...).
  - 🔗 **Export Links TXT**: Xuất danh sách URL video trực tiếp, mỗi dòng 1 link.
  - 📊 **Export CSV**: Xuất bảng tính tương thích hoàn hảo với Microsoft Excel và Google Sheets.

### 3. Vượt rào bảo mật Douyin Argus WAF (Chữ ký thuần JavaScript)
Douyin áp dụng hệ thống bảo vệ nghiêm ngặt gây lỗi `HTTP 403 Forbidden` đối với các yêu cầu không có chữ ký bảo mật hợp lệ. Extension tích hợp sẵn bộ đôi thuật toán ký số nội bộ:
1. **`DYEXABogus` (SM3 + RC4)**: Tạo tham số `a_bogus` cho mọi request phân trang `/aweme/v1/web/aweme/post/` và chi tiết `/detail/`.
2. **`DYEXWebSign` (RFC 1321 MD5)**: Tạo chữ ký xác thực header `x-secsdk-web-signature`, `x-secsdk-web-expire` kết hợp với salt bí mật (`A96D855A08C0A9707F8BEF0D9A527E4E`).
3. **Đồng bộ Cookie tự động**: Extension sử dụng quyền `"cookies"` của trình duyệt để đọc tự động các token phiên duyệt web (`UIFID_TEMP`, `s_v_web_id`, `msToken`) và ký trực tiếp vào gói tin, đảm bảo request hợp lệ 100% như người dùng thật.

### 4. Dịch & Đặt tên file thông minh bằng AI
Extension cho phép tự động dịch hoặc viết lại tiêu đề video trong tên file khi tải xuống:

| Mã ngôn ngữ | Ngôn ngữ dịch |
| :---: | :--- |
| `VI` | **Tiếng Việt** (Tối ưu phong cách viral hook, giật tít tự nhiên cho reup, giữ đúng ngữ cảnh) |
| `EN` | **English** |
| `JP` | **日本語** |
| `KR` | **한국어** |
| `CN` | **中文 giản thể** |

#### AI Provider & Danh sách Model hỗ trợ:
- **Google Gemini**:
  - `gemini-3.6-flash` *(Mặc định, khuyến nghị tốt nhất)*
  - `gemini-3.5-flash`
  - `gemini-3.5-flash-lite` *(Tối ưu tốc độ cao)*
  - `gemini-2.5-flash`
- **Groq Cloud**:
  - `openai/gpt-oss-120b` *(Khuyến nghị)*
  - `openai/gpt-oss-20b`
  - `qwen/qwen3.6-27b`
  - `llama-3.3-70b-versatile`
- **Chế độ `Auto`**: Tự động ưu tiên Gemini, nếu gặp sự cố quota hoặc rate limit sẽ chuyển sang Groq.
- **Bảo mật API Key**: Toàn bộ API Key chỉ được lưu trữ cục bộ trong `chrome.storage.local`, gọi trực tiếp tới endpoint chính thức của Google / Groq và tuyệt đối không gửi qua bất kỳ máy chủ trung gian nào.

---

## 🛠️ Hướng dẫn cài đặt

Extension chạy trên mọi trình duyệt nền tảng Chromium như **Google Chrome**, **Microsoft Edge**, **Brave**, **Cốc Cốc**, **Opera**:

### Bước 1: Tải mã nguồn
Tải mã nguồn zip về máy và giải nén, hoặc clone repository:
```bash
git clone https://github.com/hidro2k2/Douyin-Video-Downloader.git
```

### Bước 2: Cài đặt vào trình duyệt
1. Mở trình duyệt và truy cập trang quản lý tiện ích:
   - **Google Chrome / Cốc Cốc**: Truy cập `chrome://extensions`
   - **Microsoft Edge**: Truy cập `edge://extensions`
   - **Brave**: Truy cập `brave://extensions`
2. Bật công tắc **Chế độ dành cho nhà phát triển** (**Developer mode**) ở góc trên bên phải.
3. Bấm vào nút **Tải tiện ích đã giải nén** (**Load unpacked**).
4. Điều hướng và chọn thư mục chứa file `manifest.json` của extension.
5. Tiện ích `Douyin User Video Downloader` sẽ xuất hiện trong danh sách.

> [!TIP]
> Mỗi khi cập nhật code mới, bạn chỉ cần bấm nút biểu tượng **Làm mới (Reload)** hình vòng tròn tại trang tiện ích, sau đó refresh (F5) lại trang Douyin/TikTok để áp dụng.

---

## 📖 Hướng dẫn sử dụng

### A. Tải nhanh Video / Ảnh đơn lẻ
1. Truy cập vào bất kỳ video nào trên Douyin (`douyin.com/video/...`, `douyin.com/note/...`, hoặc click vào video trên trang cá nhân).
2. Hoặc truy cập video trên TikTok (`tiktok.com/@user/video/...`).
3. Nhìn xuống góc dưới màn hình, bấm vào nút màu hồng **Tải Video** hoặc **Tải Ảnh**.
4. Chọn định dạng bạn muốn tải:
   - **Download Video (No Watermark)**: Tải video MP4 nét căng không logo.
   - **Download All Photos (HD)**: Tải trọn bộ các ảnh trong note.
   - **Download Audio (MP3)**: Tải nhạc nền.

### B. Tải hàng loạt toàn bộ kênh Douyin
1. Đăng nhập vào tài khoản Douyin trên trình duyệt (để đảm bảo có đủ cookie phân trang).
2. Vào trang cá nhân của tác giả cần tải (`https://www.douyin.com/user/...`).
3. Extension sẽ tự động fetch danh sách video của kênh trong nền (icon tải màu hồng trên thanh tab sẽ xoay báo hiệu).
4. Bấm vào icon download màu hồng cạnh danh sách tab để mở giao diện tải xuống.
5. Sử dụng thanh tìm kiếm, bộ lọc ngày hoặc dải số thứ tự để chọn các video mong muốn.
6. Bấm nút **Download** (màu hồng) ở góc trên bên trái và chọn định dạng cần tải (`Download Selected Videos`, `Download Selected Audios`, hoặc xuất file `CSV`/`JSON`/`TXT`).
7. Quá trình tải sẽ chạy ngầm; bạn có thể theo dõi tiến độ qua thanh tiến trình hoặc bấm **Stop** bất cứ lúc nào để dừng lại.

### C. Cấu hình AI Dịch tên file
1. Bấm vào biểu tượng **Cài đặt (Settings)** hình thanh trượt ở góc phải header của extension.
2. Tại mục **Dịch tên file (Translation)**, bật công tắc **Kích hoạt dịch tên file**.
3. Chọn ngôn ngữ đích (Ví dụ: `Tiếng Việt`).
4. Chọn Provider (`Auto`, `Gemini`, hoặc `Groq`) và Model tương ứng.
5. Nhập danh sách API Key của bạn vào ô tương ứng (mỗi dòng 1 key để extension tự động xoay vòng khi hết hạn mức).
6. Bấm **Lưu cài đặt (Save Settings)**.

---

## ⚙️ Bảng tham chiếu Cài đặt (Settings)

| Thiết lập | Mô tả chi tiết |
| :--- | :--- |
| **Interface language** | Chuyển đổi ngôn ngữ hiển thị: Tiếng Việt, English, 日本語, 한국어, 简体中文 |
| **Save folder** | Tên thư mục con nằm trong thư mục `Downloads` mặc định của máy tính (hỗ trợ phân cấp nhiều tầng, ví dụ: `Douyin/Kenh_Am_Thuc`) |
| **Download delay** | Khoảng nghỉ giãn cách giữa 2 lượt tải file (mili-giây, mặc định: `700ms`) để tránh bị chặn IP |
| **Translate filenames** | Bật/Tắt tính năng dịch tiêu đề trước khi đặt tên file tải về |
| **Target language** | Ngôn ngữ dịch đích (`VI`, `EN`, `JP`, `KR`, `CN`) |
| **AI provider** | Chọn nhà cung cấp: `Auto` (tự động ưu tiên Gemini rồi Groq), `Gemini` hoặc `Groq` |
| **Gemini / Groq Model** | Danh sách các model AI được hỗ trợ để xử lý ngôn ngữ |
| **API Keys** | Danh sách khóa API của bạn (mỗi dòng một key, hỗ trợ xoay vòng thông minh) |
| **Show keys** | Tạm thời hiển thị các khóa API đã lưu để kiểm tra và chỉnh sửa |

---

## 📂 Quy tắc đặt tên file (File Naming Format)

File tải về được tự động chuẩn hóa, loại bỏ các ký tự đặc biệt không hợp lệ trên Windows/macOS:

- **Video MP4**:
  ```text
  <Downloads>/<Save_Folder>/videos/<prefix>_<title>_<YYYY-MM-DD>_<aweme_id>.mp4
  ```
- **Audio MP3**:
  ```text
  <Downloads>/<Save_Folder>/audios/<prefix>_<title>_<YYYY-MM-DD>_<aweme_id>.mp3
  ```
- **Album Ảnh (Images)**:
  ```text
  <Downloads>/<Save_Folder>/images/<prefix>_<title>_<YYYY-MM-DD>_<aweme_id>_<index>.jpeg
  ```

> [!NOTE]
> `<title>` sẽ là tiêu đề do AI dịch nếu bạn bật tính năng dịch thuật. Nếu tắt dịch hoặc quá trình gọi API gặp lỗi, extension sẽ tự động dùng tiêu đề gốc từ Douyin/TikTok.

---

## 🏗️ Cấu trúc mã nguồn

```text
Douyin-Video-Downloader/
├── manifest.json         # Cấu hình Chrome Extension Manifest V3
├── abogus.js             # Bộ sinh chữ ký bảo mật DYEXABogus & DYEXWebSign (Thuần JS)
├── core.js               # Lõi xử lý dữ liệu, State Machine, Client API Douyin & TikTok
├── content.js            # Content Script: Render giao diện, Quick Bar, Bộ lọc, Điều phối tải
├── background.js         # Service Worker: Quản lý hàng đợi tải xuống ngầm & gọi AI API
├── background-core.js    # Lõi xử lý background: Cache AI, Kiểm tra sức khỏe API Key, Migration
├── locales.js            # Từ điển đa ngôn ngữ (EN, VI, JP, KR, CN)
├── style.css             # Hệ thống CSS giao diện hiện đại, Drawer, Grid, Modal, Responsive
├── icon16.png            # Icon 16x16
├── icon32.png            # Icon 32x32
├── icon48.png            # Icon 48x48
├── icon128.png           # Icon 128x128
├── QR.png                # Mã QR ủng hộ tác giả
└── README.md             # Tài liệu hướng dẫn sử dụng
```

---

## ❓ Câu hỏi thường gặp & Khắc phục sự cố

<details>
<summary><strong>1. Tại sao tải video profile lại bị báo lỗi HTTP 403 Forbidden?</strong></summary>

> **Cách xử lý**: Hãy chắc chắn rằng bạn đã **đăng nhập vào tài khoản Douyin** trên trình duyệt của mình. Douyin yêu cầu cookie người dùng hợp lệ (`UIFID_TEMP` hoặc `s_v_web_id`) để thuật toán ký số `DYEXWebSign` có thể tạo chữ ký xác thực. Sau khi đăng nhập, bạn chỉ cần bấm nút `Refresh` trên giao diện extension để tải lại.
</details>

<details>
<summary><strong>2. Nút tải nhanh video đơn lẻ (Quick Bar) có bị kẹt khi đóng video không?</strong></summary>

> **Trả lời**: Hoàn toàn không. Extension v1.6.1 sử dụng hệ thống bắt sự kiện đa tầng (kiểm tra DOM modal, bắt sự kiện `popstate`, `click` ra ngoài và phím `Escape`), đảm bảo thanh tải nhanh sẽ tự động hủy ngay khi bạn thoát khỏi chế độ xem video.
</details>

<details>
<summary><strong>3. API Key Gemini hoặc Groq của tôi có bị lộ không?</strong></summary>

> **Trả lời**: Tuyệt đối an toàn. API key chỉ được lưu trong bộ nhớ cục bộ của trình duyệt (`chrome.storage.local`). Yêu cầu dịch thuật được gửi trực tiếp từ máy của bạn tới máy chủ của Google / Groq, dự án không sở hữu bất kỳ server backend nào và không thu thập bất kỳ dữ liệu cá nhân nào của bạn.
</details>

<details>
<summary><strong>4. Tôi có thể đổi thư mục tải về sang ổ đĩa khác ngoài ổ C được không?</strong></summary>

> **Trả lời**: Do chính sách bảo mật bảo vệ file của trình duyệt Chromium, các tiện ích mở rộng chỉ được phép tạo thư mục con bên trong thư mục `Downloads` mặc định. Nếu muốn lưu sang ổ đĩa khác (ví dụ ổ `D:\` hoặc `E:\`), bạn hãy vào phần Cài đặt của trình duyệt (`chrome://settings/downloads`) và đổi vị trí thư mục Downloads sang ổ đĩa mong muốn.
</details>

---

## 👨‍💻 Tác giả & Hỗ trợ

- **Tác giả**: Lê Thanh Thái Dương
- **Zalo cá nhân**: [https://zalo.me/0342252825](https://zalo.me/0342252825)
- **Cộng đồng Trạm AI 4.0**: [https://zalo.me/g/mkvsqm829](https://zalo.me/g/mkvsqm829)
- **Ủng hộ tác giả (Donate)**:
  - Ngân hàng: **Vietcombank**
  - Số tài khoản: `1016581189`
  - Chủ tài khoản: **Le Thanh Thai Duong**

---

## ⚖️ Tuyên bố miễn trừ trách nhiệm (Disclaimer)

1. Tiện ích này được phát triển cho mục đích học tập, nghiên cứu kỹ thuật và sao lưu dữ liệu cá nhân hợp pháp.
2. Người dùng hoàn toàn chịu trách nhiệm về việc tuân thủ bản quyền nội dung và điều khoản dịch vụ của Douyin và TikTok.
3. Dự án không liên kết, không được tài trợ hoặc ủy quyền bởi ByteDance hay bất kỳ công ty con nào liên quan.
