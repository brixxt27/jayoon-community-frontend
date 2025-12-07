# 쿠키 저장 문제 진단 & 해결 가이드

## 🔴 근본 원인 (이미 수정됨)

**`login` 함수에서 `credentials: 'include'` 누락**

```javascript
// ❌ 잘못된 코드
export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    // credentials: 'include' 없음!
  });
};

// ✅ 수정된 코드
export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth`, {
    method: 'POST',
    credentials: 'include', // CORS 요청에서 쿠키 저장 필수!
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
};
```

## 🧠 왜 이것이 문제인가?

1. **CORS 요청에서 쿠키 저장의 규칙:**
   - `credentials: 'include'` 없으면 → 브라우저가 `Set-Cookie` 헤더를 무시
   - `credentials: 'include'` 있으면 → 쿠키가 정상 저장됨

2. **백엔드 설정 (이미 올바름):**
   - ✅ `Access-Control-Allow-Credentials: true` 설정됨
   - ✅ `SameSite=None; Secure` 설정됨
   - ✅ `HttpOnly` 플래그 설정됨

3. **따라서 SameSite, Secure 등의 문제가 아니라 프론트엔드에서 credentials를 전달하지 않은 것**

## 📋 체크리스트 (향후 CORS 쿠키 문제 발생 시)

### 1️⃣ 프론트엔드 (fetch 요청)

- [ ] `credentials: 'include'` 포함되어 있는가?

```javascript
fetch(url, {
  credentials: 'include', // ← 반드시 필수!
});
```

### 2️⃣ 백엔드 (응답 헤더)

- [ ] `Access-Control-Allow-Credentials: true` 설정되어 있는가?
- [ ] `Access-Control-Allow-Origin` 값이 `*`가 아닌 구체적인 도메인인가?
  ```
  ❌ Access-Control-Allow-Origin: *
  ✅ Access-Control-Allow-Origin: http://localhost:3000
  ```

### 3️⃣ Set-Cookie 헤더

- [ ] `SameSite=None` 이고 `Secure` 플래그가 함께 있는가?
  ```
  ✅ Set-Cookie: token=...; SameSite=None; Secure; HttpOnly
  ❌ Set-Cookie: token=...; SameSite=Strict
  ```
- [ ] `Path` 설정이 올바른가?
  - Access Token: `Path=/` (모든 경로에서 사용)
  - Refresh Token: `Path=/auth/refresh` (특정 경로에서만 사용)

### 4️⃣ 브라우저 설정

- [ ] HTTPS/localhost HTTP 중 어느 것을 사용 중인가?
  - Secure 플래그: HTTPS 또는 localhost에서만 작동
- [ ] 시크릿 모드에서도 테스트했는가?

## 🔍 디버깅 방법

### 콘솔에서 쿠키 확인

```javascript
// 로그인 후 즉시 실행
console.log(document.cookie);

// 예상 출력:
// accessToken=eyJhbGciOiJIUzI1NiJ9...; refreshToken=1990f461-...
```

### 브라우저 DevTools

1. **Application 탭** → **Cookies** → 도메인 선택
   - `accessToken` (Path: `/`, SameSite: None, Secure)
   - `refreshToken` (Path: `/auth/refresh`, SameSite: None, Secure)

2. **Network 탭** → 로그인 요청 선택
   - **Response Headers** → `Set-Cookie` 확인
   - **Request Headers** → `Cookie` 필드 (이후 요청)

### curl로 CORS 테스트

```bash
curl -i -X POST http://localhost:8080/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!@"}' \
  -c cookies.txt  # 쿠키 파일에 저장
```

## 🚀 현재 수정 사항

1. ✅ `api.js`의 `login` 함수에 `credentials: 'include'` 추가
2. ✅ 로그인 성공 후 쿠키 저장 확인 로그 추가 (console.log)
3. ✅ 코멘트로 이유 명시

## 💡 최종 테스트 절차

1. npm start로 프론트엔드 재시작
2. 로그인 페이지에서 유효한 계정으로 로그인
3. 브라우저 개발자 도구 콘솔 확인:
   ```
   ✅ 로그인 성공! 저장된 쿠키:
   Cookies: accessToken=...; refreshToken=...
   ```
4. Application 탭의 Cookies에서 두 개의 쿠키 확인
5. 다른 페이지에서 권한이 필요한 작업 수행 → 쿠키가 자동 전송됨

## 📚 참고 자료

- [MDN: fetch credentials](https://developer.mozilla.org/en-US/docs/Web/API/fetch#credentials)
- [MDN: Set-Cookie SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [OWASP: CORS and SameSite](https://owasp.org/www-community/SameSite)
