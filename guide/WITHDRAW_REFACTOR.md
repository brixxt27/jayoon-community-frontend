# 회원 탈퇴 기능 리팩토링 완료

## 📋 문제점 분석

### 이전 방식 (prompt 사용)

```javascript
async function handleWithdraw() {
  const password = prompt('회원 탈퇴를 위해 비밀번호를 입력해주세요.');
  // ❌ 비밀번호가 평문으로 노출됨
}
```

**문제:**

- 입력 필드가 평문 텍스트로 표시됨
- 보안 취약점 (특히 개발자 도구에서 쉽게 확인 가능)
- 접근성 낮음 (복사-붙여넣기 불가, 입력 필드 관리 어려움)
- 폼 검증 불가능

---

## ✅ 솔루션: 별도 탈퇴 페이지 생성

### 아키텍처

```
/pages/user/edit/info/         ← 회원정보 수정 (기존)
                └─ "회원 탈퇴" 버튼 클릭
                   ↓
/pages/user/withdraw/          ← 🆕 회원 탈퇴 전용 페이지
  ├─ index.html                ← 탈퇴 폼 UI
  ├─ index.js                  ← 탈퇴 로직
  └─ index.css                 ← 스타일
                   ↓
            홈 페이지로 리다이렉트
```

### 새 페이지의 특징

#### 1️⃣ 안전한 비밀번호 입력

```html
<input type="password" id="password-input" ... />
<!-- ✅ 입력 값이 마스킹됨 -->
```

#### 2️⃣ 명확한 경고 메시지

```html
<div class="warning-box">
  <p>⚠️ 주의사항</p>
  <ul>
    <li>탈퇴 후에는 계정을 복구할 수 없습니다.</li>
    <li>작성된 모든 게시글과 댓글이 삭제됩니다.</li>
    <li>이 작업은 취소할 수 없습니다.</li>
  </ul>
</div>
```

#### 3️⃣ 동의 체크박스 (2단계 확인)

```html
<input type="checkbox" id="confirm-checkbox" />
<span>위의 주의사항을 이해했으며, 회원 탈퇴에 동의합니다.</span>
```

#### 4️⃣ 최종 확인 팝업

```javascript
const confirmed = confirm(
  '정말로 탈퇴하시겠습니까?\n\n탈퇴 후에는 계정을 복구할 수 없습니다.',
);
if (!confirmed) return;
```

#### 5️⃣ 실시간 폼 검증

- 비밀번호 입력 여부
- 동의 체크 여부
- 두 조건 모두 충족할 때만 "회원 탈퇴" 버튼 활성화

---

## 📁 생성된 파일

### `/pages/user/withdraw/index.html`

- 탈퇴 폼 구조
- 경고 메시지
- 비밀번호 입력 필드
- 동의 체크박스
- 취소/탈퇴 버튼

### `/pages/user/withdraw/index.js`

- 폼 유효성 검사
- 비밀번호 검증
- 최종 확인 로직
- `deleteUser(password)` API 호출
- 성공/실패 처리
- 세션 정리 및 리다이렉트

### `/pages/user/withdraw/index.css`

- 반응형 레이아웃
- 경고 박스 스타일
- 폼 요소 스타일
- 토스트 알림 스타일

---

## 🔄 수정된 기존 파일

### `/pages/user/edit/info/index.html`

```diff
- <!-- 회원 탈퇴 모달 (제거됨) -->
- <div class="modal-backdrop" id="modal-backdrop">...</div>
```

### `/pages/user/edit/info/index.js`

```javascript
// 이전
async function handleWithdraw() {
  const password = prompt(...);
  await deleteUser(password);
}

// 현재
async function handleWithdraw() {
  window.location.href = '/pages/user/withdraw/';
}
```

**제거된 import:**

- `deleteUser` (탈퀴 페이지로 이동)

**제거된 함수:**

- `openModal()`, `closeModal()` (모달 불필요)

---

## 🎯 사용자 흐름

```
1. 회원정보 수정 페이지 접속
   ↓
2. [회원 탈퇴] 버튼 클릭
   ↓
3. /pages/user/withdraw/ 페이지로 이동
   ↓
4. 경고 메시지 읽음 + 비밀번호 입력
   ↓
5. 동의 체크박스 체크
   ↓
6. [회원 탈퇴] 버튼 활성화
   ↓
7. 클릭 → 최종 확인 팝업
   ↓
8. "확인" 선택
   ↓
9. deleteUser(password) API 호출
   ↓
10. 성공 → 세션 삭제 → 홈으로 리다이렉트
```

---

## 🔒 보안 개선사항

| 항목               | 이전              | 현재                               |
| ------------------ | ----------------- | ---------------------------------- |
| **입력 필드 타입** | `prompt()` (평문) | `<input type="password">` (마스킹) |
| **폼 검증**        | 없음              | 실시간 검증                        |
| **최종 확인**      | 1단계             | 3단계 (비밀번호 + 체크박스 + 팝업) |
| **경고 메시지**    | 없음              | 명확한 경고 박스                   |
| **에러 처리**      | 단순 alert        | 필드 내 오류 표시                  |

---

## ✨ 추가 개선사항

### 1. 명확한 UI/UX

- 경고 박스로 사용자에게 명확한 의도 전달
- 버튼 상태로 폼 완성도 시각화
- 토스트로 부드러운 피드백 제공

### 2. 책임 분리

- 회원정보 수정 페이지는 정보 관리에만 집중
- 탈퇴 기능은 독립적인 페이지에서 관리
- 코드 유지보수성 향상

### 3. 확장성

- 향후 탈퀴 이유 입력 추가 가능
- 탈퀴 전 데이터 백업 옵션 추가 가능
- 복구 기능 추가 시 용이

---

## 🧪 테스트 체크리스트

- [ ] 회원정보 수정 페이지의 [회원 탈퇴] 버튼 클릭 → `/pages/user/withdraw/` 이동
- [ ] 비밀번호 미입력 상태 → [회원 탈퇴] 버튼 비활성화
- [ ] 동의 체크박스 미체크 → [회원 탈퇴] 버튼 비활성화
- [ ] 비밀번호 입력 + 체크박스 체크 → [회원 탈퇴] 버튼 활성화
- [ ] [취소] 버튼 클릭 → 회원정보 수정 페이지로 돌아감
- [ ] [회원 탈퇴] 버튼 클릭 → 최종 확인 팝업 표시
- [ ] 팝업 취소 → 페이지 유지
- [ ] 팝업 확인 + 올바른 비밀번호 → 탈퀴 완료, 홈으로 리다이렉트
- [ ] 팝업 확인 + 잘못된 비밀번호 → 에러 메시지 표시

---

## 📝 API 호출

```javascript
// deleteUser(password)
// - 요청: POST /api/users/{userId}
// - Body: { password: string }
// - 성공: 계정 삭제
// - 실패: 비밀번호 오류 등
```
