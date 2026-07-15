# Gemini Prompt Opener

Chrome Extension (Manifest V3) dùng để mở nhanh các prompt Gemini theo **Topic**.

## Tính năng

- Bấm biểu tượng extension → luôn hiện popup chọn topic (không tự mở link).
- **Topic 1**: mở đúng 4 prompt.
- **Topic 2**: mở đúng 2 prompt.
- Mỗi lần chỉ mở đúng topic đã chọn.
- Theo dõi các tab đã mở qua nhiều lần bấm; nút **Đóng hết tab đã mở** để dọn tab, giảm tải máy.

## Cài đặt (Developer mode)

1. Mở Chrome → `chrome://extensions`
2. Bật **Developer mode** (góc trên bên phải)
3. Chọn **Load unpacked**
4. Chọn thư mục dự án này (`ex-gemini`)

## Cách dùng

1. Bấm biểu tượng **Gemini Prompt Opener** trên thanh công cụ.
2. Đọc câu hỏi: *Bạn muốn mở Topic nào?*
3. Chọn **Mở Topic 1** (4 prompt) hoặc **Mở Topic 2** (2 prompt).
4. Extension mở các tab Gemini ở nền, rồi kích hoạt một tab vừa mở.
5. Trong lúc đang mở, các nút bị vô hiệu hóa để tránh bấm liên tục.
6. Nếu đã mở topic nhiều lần, bấm **Đóng hết tab đã mở** để đóng toàn bộ tab extension đã tạo.

## Danh sách link prompt

### Topic 1 (4 prompt)

1. [Prompt 1](https://gemini.google.com/?prompt_id=gkbIniL16uik&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%201_autosubmit)
2. [Prompt 2](https://gemini.google.com/?prompt_id=3J4PcH0EulQk&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%204_autosubmit)
3. [Prompt 3](https://gemini.google.com/?prompt_id=flFxTHV9UxtT&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%203_autosubmit)
4. [Prompt 4](https://gemini.google.com/?prompt_id=QQ8ZnrEeChej&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%202_autosubmit)

### Topic 2 (2 prompt)

1. [Prompt 1](https://gemini.google.com/?prompt_id=a7ClBVbevDuo&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%205_autosubmit)
2. [Prompt 2](https://gemini.google.com/?prompt_id=qcor9HH7fpfP&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%206_autosubmit)

## Cấu trúc file

| File | Mô tả |
|------|--------|
| `manifest.json` | Cấu hình Manifest V3 |
| `popup.html` | Giao diện chọn topic |
| `popup.css` | Giao diện dark/glassmorphism |
| `popup.js` | Danh sách topic + logic mở tab |
| `icon128.png` | Icon extension |

## Quyền

- `tabs`: tạo, kích hoạt và đóng tab Chrome.
- `storage`: nhớ danh sách tab ID đã mở (cộng dồn qua nhiều lần bấm).

## Ghi chú

- Cần đăng nhập Gemini trong Chrome để các prompt autosubmit hoạt động.
- Muốn thêm topic: cập nhật object `TOPICS` trong `popup.js` và thêm nút `data-topic` tương ứng trong `popup.html`.
