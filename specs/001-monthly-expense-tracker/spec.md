# Feature Specification: Monthly Expense Tracker

**Feature Branch**: `001-monthly-expense-tracker`  
**Created**: 2026-04-27  
**Status**: Draft  
**Input**: User description: "Ứng dụng theo dõi chi tiêu hàng tháng với đăng ký/đăng nhập, phê duyệt tài khoản bởi quản trị viên, quản lý khoản thu/chi theo danh mục, dashboard biểu đồ, lọc/tìm kiếm/export CSV, và hạn mức chi tiêu với cảnh báo"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Đăng ký và phê duyệt tài khoản (Priority: P1)

Người dùng mới tạo tài khoản bằng email và mật khẩu. Tài khoản ở trạng thái chờ cho đến khi quản trị viên phê duyệt hoặc từ chối. Sau khi được phê duyệt, người dùng mới có thể đăng nhập và sử dụng ứng dụng. Quản trị viên quản lý danh sách yêu cầu đăng ký và có thể approve/reject từng yêu cầu.

**Why this priority**: Đây là nền tảng bắt buộc — không có xác thực và phê duyệt thì không thể truy cập bất kỳ tính năng nào khác. Kể cả admin cũng cần flow này để vận hành hệ thống.

**Independent Test**: Có thể kiểm tra độc lập bằng cách: đăng ký tài khoản mới → xác nhận tài khoản ở trạng thái pending → đăng nhập với tài khoản admin → approve tài khoản → đăng nhập với tài khoản mới thành công.

**Acceptance Scenarios**:

1. **Given** người dùng chưa có tài khoản, **When** điền form đăng ký với email hợp lệ và mật khẩu đủ mạnh, **Then** hệ thống tạo tài khoản với trạng thái "pending" và hiển thị thông báo chờ phê duyệt.
2. **Given** người dùng đang ở trạng thái "pending", **When** cố gắng đăng nhập, **Then** hệ thống từ chối và hiển thị thông báo tài khoản chưa được kích hoạt.
3. **Given** quản trị viên đã đăng nhập, **When** truy cập màn hình quản lý người dùng, **Then** thấy danh sách yêu cầu đăng ký đang chờ xử lý.
4. **Given** quản trị viên chọn approve một yêu cầu, **When** xác nhận hành động, **Then** tài khoản chuyển sang trạng thái "active" và người dùng có thể đăng nhập.
5. **Given** quản trị viên chọn reject một yêu cầu, **When** xác nhận hành động, **Then** tài khoản chuyển sang trạng thái "rejected" và người dùng bị từ chối đăng nhập với thông báo rõ ràng.
6. **Given** email đã tồn tại trong hệ thống, **When** đăng ký với email đó, **Then** hệ thống báo lỗi và không tạo tài khoản trùng.

---

### User Story 2 - Quản lý khoản thu/chi (Priority: P2)

Người dùng đã đăng nhập tạo các khoản thu (income) hoặc chi (expense) với thông tin: tiêu đề, số tiền, ngày, danh mục, và ghi chú tuỳ chọn. Người dùng có thể chỉnh sửa hoặc xoá giao dịch đã tạo. Danh mục có sẵn một tập hợp mặc định; người dùng có thể thêm danh mục tùy chỉnh của riêng mình.

**Why this priority**: Đây là hành động cốt lõi của ứng dụng — không ghi nhận được giao dịch thì không có dữ liệu để hiển thị dashboard hay áp dụng hạn mức.

**Independent Test**: Có thể kiểm tra độc lập bằng cách: đăng nhập → tạo giao dịch chi tiêu → tạo giao dịch thu nhập → xem danh sách giao dịch đã tạo → sửa một giao dịch → xoá một giao dịch → tạo danh mục mới.

**Acceptance Scenarios**:

1. **Given** người dùng đã đăng nhập, **When** tạo giao dịch với tiêu đề, số tiền dương, ngày và danh mục, **Then** giao dịch được lưu và hiển thị trong danh sách.
2. **Given** người dùng chọn loại "expense", **When** lưu giao dịch, **Then** giao dịch được đánh dấu là chi tiêu và trừ khỏi số dư tháng.
3. **Given** người dùng chọn loại "income", **When** lưu giao dịch, **Then** giao dịch được đánh dấu là thu nhập và cộng vào số dư tháng.
4. **Given** người dùng tạo danh mục mới, **When** nhập tên danh mục chưa tồn tại, **Then** danh mục được lưu và có thể chọn ngay khi tạo giao dịch.
5. **Given** giao dịch đã tồn tại, **When** người dùng chỉnh sửa thông tin, **Then** dữ liệu được cập nhật và phản ánh ngay trên danh sách.
6. **Given** giao dịch đã tồn tại, **When** người dùng xoá, **Then** giao dịch bị xoá khỏi danh sách và không còn ảnh hưởng đến tổng kết.
7. **Given** số tiền nhập vào là âm hoặc bằng 0, **When** cố gắng lưu, **Then** hệ thống báo lỗi validation và không lưu giao dịch.

---

### User Story 3 - Dashboard biểu đồ theo dõi hàng tháng (Priority: P3)

Người dùng xem dashboard tổng quan gồm: tổng thu, tổng chi, số dư trong tháng đang chọn; biểu đồ tròn hoặc cột phân bổ chi tiêu theo danh mục; và xu hướng thu/chi qua các tháng gần đây.

**Why this priority**: Dashboard cung cấp giá trị trực quan quan trọng nhưng phụ thuộc hoàn toàn vào US1 và US2. Chỉ có giá trị khi đã có dữ liệu giao dịch.

**Independent Test**: Tạo sẵn dữ liệu giao dịch qua US2 → truy cập trang dashboard → xác nhận tổng thu/chi/số dư hiển thị đúng → xác nhận biểu đồ phản ánh đúng tỷ lệ danh mục → chuyển sang tháng khác → xác nhận dữ liệu cập nhật theo tháng chọn.

**Acceptance Scenarios**:

1. **Given** người dùng có giao dịch trong tháng hiện tại, **When** truy cập dashboard, **Then** hiển thị đúng tổng thu, tổng chi và số dư (thu − chi).
2. **Given** dashboard đang hiển thị tháng cụ thể, **When** người dùng chọn tháng khác, **Then** tất cả số liệu và biểu đồ cập nhật theo tháng đã chọn.
3. **Given** có giao dịch thuộc nhiều danh mục khác nhau, **When** biểu đồ phân bổ hiển thị, **Then** mỗi danh mục chiếm tỷ lệ chính xác tương ứng với tổng chi.
4. **Given** không có giao dịch nào trong tháng, **When** truy cập dashboard tháng đó, **Then** hiển thị giá trị 0 và thông báo trống thân thiện (không bị lỗi).

---

### User Story 4 - Lọc, tìm kiếm và export CSV (Priority: P4)

Người dùng có thể lọc danh sách giao dịch theo khoảng ngày, loại (thu/chi), danh mục hoặc kết hợp nhiều điều kiện. Người dùng cũng có thể tìm kiếm theo từ khoá trong tiêu đề hoặc ghi chú. Kết quả hiện tại có thể export ra file CSV.

**Why this priority**: Tính năng hữu ích nhưng không chặn MVP — người dùng vẫn có thể dùng ứng dụng cơ bản mà không cần lọc hay export.

**Independent Test**: Tạo sẵn tập dữ liệu đa dạng → áp dụng bộ lọc theo ngày → xác nhận chỉ hiện giao dịch trong khoảng → lọc theo danh mục → xác nhận kết quả đúng → nhập từ khoá tìm kiếm → xác nhận kết quả khớp → nhấn export → tải về file CSV có nội dung đúng với bộ lọc đang áp dụng.

**Acceptance Scenarios**:

1. **Given** danh sách giao dịch, **When** người dùng chọn khoảng ngày, **Then** chỉ hiển thị giao dịch trong khoảng ngày đó.
2. **Given** người dùng áp dụng nhiều bộ lọc cùng lúc, **When** xem danh sách, **Then** chỉ hiển thị giao dịch thoả mãn tất cả điều kiện được chọn.
3. **Given** người dùng nhập từ khoá, **When** tìm kiếm, **Then** hiển thị giao dịch có tiêu đề hoặc ghi chú chứa từ khoá đó (không phân biệt hoa thường).
4. **Given** có kết quả lọc đang hiển thị, **When** nhấn export CSV, **Then** trình duyệt tải xuống file CSV chứa đúng các cột: ngày, tiêu đề, loại, danh mục, số tiền, ghi chú.
5. **Given** không có kết quả nào khớp bộ lọc, **When** nhấn export CSV, **Then** hệ thống báo không có dữ liệu để export thay vì xuất file trống.

---

### User Story 5 - Hạn mức chi tiêu và cảnh báo (Priority: P5)

Người dùng thiết lập hạn mức chi tiêu tổng cho tháng, hoặc hạn mức theo từng danh mục. Khi tổng chi tiêu trong tháng vượt ngưỡng 80% hoặc 100% hạn mức, hệ thống hiển thị cảnh báo rõ ràng trên dashboard.

**Why this priority**: Tính năng có giá trị nhưng phụ thuộc vào US2 và US3 đã hoàn chỉnh. Người dùng cần có thói quen nhập giao dịch trước khi thiết lập ngưỡng có ý nghĩa.

**Independent Test**: Thiết lập hạn mức 1.000.000 VND cho tháng → nhập giao dịch chi tiêu đến 800.000 VND → xác nhận cảnh báo "sắp vượt hạn mức" xuất hiện → nhập thêm chi tiêu → tổng vượt 1.000.000 VND → xác nhận cảnh báo "đã vượt hạn mức" xuất hiện.

**Acceptance Scenarios**:

1. **Given** người dùng đã đăng nhập, **When** thiết lập hạn mức cho tháng, **Then** hạn mức được lưu và hiển thị trên dashboard cùng mức độ sử dụng hiện tại.
2. **Given** hạn mức đã được thiết lập, **When** tổng chi vượt 80% hạn mức, **Then** dashboard hiển thị cảnh báo màu vàng "sắp chạm hạn mức".
3. **Given** hạn mức đã được thiết lập, **When** tổng chi bằng hoặc vượt 100% hạn mức, **Then** dashboard hiển thị cảnh báo màu đỏ "đã vượt hạn mức".
4. **Given** người dùng muốn theo dõi theo danh mục, **When** thiết lập hạn mức cho danh mục cụ thể, **Then** dashboard hiển thị thanh tiến độ cho từng danh mục có hạn mức.
5. **Given** hạn mức đã được thiết lập, **When** người dùng chỉnh sửa hoặc xoá hạn mức, **Then** ngưỡng cảnh báo cập nhật ngay lập tức.

---

### Edge Cases

- Người dùng nhập số tiền với định dạng không hợp lệ (chữ, dấu phẩy, âm) → hệ thống từ chối và báo lỗi cụ thể.
- Người dùng xoá danh mục đang có giao dịch → giao dịch cũ vẫn giữ nguyên nhưng hiển thị danh mục là "(đã xoá)" hoặc chuyển về danh mục "Khác".
- Quản trị viên cố gắng từ chối tài khoản đã được approve → hệ thống ngăn lại hoặc yêu cầu xác nhận.
- Người dùng đăng nhập từ hai thiết bị cùng lúc → dữ liệu phải nhất quán, không bị xung đột.
- Export CSV khi có rất nhiều giao dịch → hệ thống vẫn phản hồi trong thời gian hợp lý và file tải về đầy đủ dữ liệu.
- Tháng không có giao dịch nào → dashboard và danh sách hiển thị trạng thái trống rõ ràng, không bị lỗi.

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Authorization**

- **FR-001**: Hệ thống PHẢI cho phép người dùng đăng ký tài khoản mới bằng email và mật khẩu.
- **FR-002**: Hệ thống PHẢI đặt tài khoản mới đăng ký vào trạng thái "pending" cho đến khi quản trị viên xử lý.
- **FR-003**: Hệ thống PHẢI cho phép quản trị viên xem danh sách tài khoản đang chờ phê duyệt.
- **FR-004**: Hệ thống PHẢI cho phép quản trị viên phê duyệt (approve) hoặc từ chối (reject) từng yêu cầu đăng ký.
- **FR-005**: Hệ thống PHẢI từ chối đăng nhập đối với tài khoản có trạng thái khác "active".
- **FR-006**: Hệ thống PHẢI cho phép tài khoản "active" đăng nhập và truy cập đầy đủ tính năng.
- **FR-007**: Hệ thống PHẢI ngăn đăng ký trùng email.

**Transaction Management**

- **FR-008**: Hệ thống PHẢI cho phép người dùng tạo giao dịch với các trường: tiêu đề, số tiền (dương), ngày, loại (thu/chi), danh mục, ghi chú (tùy chọn).
- **FR-009**: Hệ thống PHẢI cho phép người dùng chỉnh sửa giao dịch đã tạo.
- **FR-010**: Hệ thống PHẢI cho phép người dùng xoá giao dịch đã tạo.
- **FR-011**: Hệ thống PHẢI hiển thị danh sách giao dịch theo thứ tự thời gian giảm dần.
- **FR-012**: Hệ thống PHẢI từ chối lưu giao dịch có số tiền ≤ 0 hoặc thiếu trường bắt buộc.

**Category Management**

- **FR-013**: Hệ thống PHẢI cung cấp một tập danh mục mặc định sẵn (ví dụ: Ăn uống, Di chuyển, Nhà ở, Giải trí, Sức khỏe, Mua sắm, Thu nhập, Khác).
- **FR-014**: Hệ thống PHẢI cho phép người dùng tạo danh mục tùy chỉnh riêng.
- **FR-015**: Khi xoá danh mục đang được dùng bởi giao dịch, hệ thống PHẢI giữ nguyên dữ liệu giao dịch cũ và gán nhãn rõ ràng.

**Dashboard**

- **FR-016**: Dashboard PHẢI hiển thị tổng thu, tổng chi và số dư của tháng đang xem.
- **FR-017**: Dashboard PHẢI hiển thị biểu đồ phân bổ chi tiêu theo danh mục trong tháng đang xem.
- **FR-018**: Dashboard PHẢI cho phép người dùng chuyển đổi giữa các tháng để xem dữ liệu lịch sử.

**Filter, Search & Export**

- **FR-019**: Hệ thống PHẢI cho phép lọc giao dịch theo khoảng ngày.
- **FR-020**: Hệ thống PHẢI cho phép lọc giao dịch theo loại (thu/chi) và danh mục.
- **FR-021**: Hệ thống PHẢI cho phép tìm kiếm giao dịch theo từ khoá trong tiêu đề hoặc ghi chú.
- **FR-022**: Hệ thống PHẢI cho phép export danh sách giao dịch hiện tại (đã áp dụng bộ lọc) ra file CSV với đầy đủ cột: ngày, tiêu đề, loại, danh mục, số tiền, ghi chú.

**Spending Limit & Alerts**

- **FR-023**: Hệ thống PHẢI cho phép người dùng thiết lập hạn mức chi tiêu tổng cho từng tháng.
- **FR-024**: Hệ thống PHẢI cho phép người dùng thiết lập hạn mức chi tiêu riêng theo từng danh mục.
- **FR-025**: Dashboard PHẢI hiển thị cảnh báo khi tổng chi vượt 80% hạn mức tháng.
- **FR-026**: Dashboard PHẢI hiển thị cảnh báo khi tổng chi bằng hoặc vượt 100% hạn mức tháng.
- **FR-027**: Hệ thống PHẢI cho phép người dùng chỉnh sửa hoặc xoá hạn mức đã thiết lập.

### Quality Requirements

- **QR-001**: Tất cả code PHẢI qua linting và formatting tự động trước khi merge (áp dụng cho bất kỳ ngôn ngữ/stack nào được chọn khi plan).
- **QR-002**: Logic xử lý nghiệp vụ (tính toán tổng, kiểm tra hạn mức, validate dữ liệu) PHẢI được tách biệt khỏi lớp UI/API để có thể test độc lập.

### Testing Requirements

- **TR-001**: Mỗi user story PHẢI có unit test cho toàn bộ business logic và integration test cho luồng người dùng chính.
- **TR-002**: Test PHẢI được viết trước implementation (failing-first) và ghi nhận bằng commit message rõ ràng.
- **TR-003**: Regression test PHẢI bao phủ: tính toán tổng thu/chi/số dư, logic phê duyệt tài khoản, kiểm tra ngưỡng hạn mức, và validation đầu vào giao dịch.

### Key Entities

- **User**: Tài khoản người dùng — email, mật khẩu (hashed), vai trò (user/admin), trạng thái (pending/active/rejected), ngày đăng ký.
- **Transaction**: Giao dịch — tiêu đề, số tiền, ngày, loại (income/expense), danh mục, ghi chú, người tạo, ngày tạo/sửa.
- **Category**: Danh mục — tên, loại mặc định hay tùy chỉnh, chủ sở hữu (null nếu là danh mục hệ thống, user_id nếu tùy chỉnh).
- **SpendingLimit**: Hạn mức — người dùng, tháng/năm áp dụng, loại (tổng tháng hoặc theo danh mục), giá trị hạn mức, danh mục (nullable).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng có thể hoàn tất đăng ký và được phê duyệt trong vòng dưới 5 phút (không tính thời gian chờ admin).
- **SC-002**: Người dùng có thể tạo một giao dịch mới trong vòng dưới 30 giây.
- **SC-003**: Dashboard tải và hiển thị đầy đủ dữ liệu tháng hiện tại trong vòng dưới 3 giây với tập dữ liệu lên đến 500 giao dịch.
- **SC-004**: Export CSV của 500 giao dịch hoàn thành trong vòng dưới 5 giây.
- **SC-005**: 100% luồng phê duyệt và từ chối tài khoản được tự động kiểm thử (không có lỗi regression sau thay đổi hệ thống).
- **SC-006**: Cảnh báo vượt hạn mức hiển thị chính xác và nhất quán — không bỏ sót và không báo sai trong mọi tổ hợp giao dịch đã test.

**Constitution Minimums**:
- SC-005 và SC-006 thỏa mãn yêu cầu "ít nhất một kết quả chất lượng/phòng ngừa lỗi".
- SC-005 thỏa mãn yêu cầu "ít nhất một kết quả kiểm thử tự động".

## Assumptions

- Ứng dụng là web app, chạy trên trình duyệt — không có yêu cầu mobile native ở v1.
- Chỉ có một vai trò quản trị viên duy nhất; tài khoản admin được tạo sẵn khi khởi tạo hệ thống (không qua flow đăng ký).
- Đơn vị tiền tệ là VND — không cần hỗ trợ đa tiền tệ ở v1.
- Dữ liệu giao dịch là riêng tư — mỗi người dùng chỉ thấy giao dịch của mình, không có tính năng chia sẻ.
- Danh mục mặc định được tạo sẵn khi khởi tạo hệ thống và không thể bị xoá bởi người dùng thông thường.
- Hạn mức chi tiêu được thiết lập theo tháng cụ thể (không tự động lặp sang tháng sau trừ khi người dùng chủ động thiết lập lại hoặc thiết lập tự động lặp — tính năng lặp sẽ xem xét ở v2).
- Cảnh báo hạn mức chỉ hiển thị trong ứng dụng (không gửi email hay push notification ở v1).
- Người dùng có thể xoá danh mục tùy chỉnh của mình; danh mục hệ thống không thể xoá.
