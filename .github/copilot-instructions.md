# Copilot Instructions - Community Frontend

## Project Overview

커뮤니티 서비스 프론트엔드는 **Express.js 정적 서버**로 제공되는 **Vanilla JavaScript 기반 SPA(Single Page Application)**입니다. 컴포넌트 기반 아키텍처로 설계되었으며, 동적 컴포넌트 로딩 패턴을 사용합니다.

**핵심 기술 스택:**

- Express.js (포트 3000)
- Vanilla JavaScript (모듈 시스템: ES6 imports/exports)
- 정적 파일 서빙: `/public` 폴더
- Cookie 기반 인증 (Access Token + Refresh Token)
- 커서 기반 페이지네이션 (API 명세: `api-specification.md`)

## Architecture Patterns

### 1. 컴포넌트 동적 로딩 (`public/utils/loadComponent.js`)

페이지는 런타임에 외부 HTML/CSS/JS 컴포넌트를 동적으로 로드합니다.

```javascript
// 패턴: loadComponent(셀렉터, HTML파일경로)
await loadComponent('#header', '/components/header/index.html');
```

**특징:**

- HTML은 `fetch`로 로드 후 `innerHTML`로 삽입
- 로드 후 초기화 함수 호출 (예: `initHeader()`)
- 에러 시 "Error loading component" 메시지 표시
- **각 페이지는 자신의 script에서 컴포넌트 로드 책임**

### 2. API 클라이언트 자동 토큰 관리 (`public/apis/api.js`)

모든 백엔드 API 호출은 `apiClient()` 함수를 통합니다.
**자동 처리:**

- 모든 요청에 `credentials: 'include'` (쿠키 포함)
- 401 응답 시 자동 토큰 재발급 (`/api/auth/refresh`) 후 재시도
- 재발급 실패 시 사용자를 로그인 페이지로 리다이렉트
- 204 응답 처리 (No Content)

**사용 예:**

```javascript
export async function getPosts(cursor, limit) {
  return apiClient('/posts', {
    method: 'GET',
  });
}
```

### 3. 페이지 라우팅 (URL 기반, 수동)

- SPA이지만 **클라이언트 라우터 없음** → URL 구조가 폴더 구조와 일치
- 페이지 이동: `window.location.href = '/pages/board/'`
- 상세 페이지: 쿼리 스트링으로 ID 전달 (예: `?id=123`)
- **뒤로가기 버튼은 헤더에서 옵션으로 제공** (`initHeader({ backButton: true, backUrl: '...' })`)

### 4. 세션 저장소로 로그인 상태 관리

```javascript
// 로그인 성공 시
sessionStorage.setItem('user', JSON.stringify(responseData.data));

// 사용자 정보 확인
function checkLoginStatus() {
  return !!sessionStorage.getItem('user');
}
```

## Critical Developer Workflows

### 로컬 개발 실행

```bash
npm install
npm start  # Express 서버가 http://localhost:3000 시작
```

### 코드 포맷팅 (Prettier)

```bash
npm run format  # 전체 코드베이스 포맷
```

### API 테스트

- **로컬 백엔드 (기본):** `http://localhost:8080/api`
- **프로덕션:** `https://guidey.site/api`
- 자동 감지 로직: `getBaseUrl()` in `api.js`

### 무한 스크롤 구현 패턴 (`pages/board/index.js`)

```javascript
// 커서 기반 페이지네이션
let nextCursor = null;
const { posts, nextCursor: newNextCursor } = responseData.data;
nextCursor = newNextCursor; // null이면 마지막 페이지
```

## Project Structure & Key Locations

```
public/
├── apis/api.js              ← 모든 API 호출의 허브 (토큰 재발급 로직)
├── utils/loadComponent.js   ← 컴포넌트 동적 로딩
├── components/
│   ├── header/              ← 모든 페이지에 포함되는 헤더
│   │   ├── index.html       ← 헤더 마크업
│   │   ├── index.js         ← initHeader(), logout 로직
│   │   └── index.css
│   └── item/                ← 재사용 가능한 아이템 스타일
└── pages/
    ├── board/               ← 게시물 목록 (무한 스크롤)
    ├── board/detail/        ← 게시물 상세 (쿼리 ?id=123)
    ├── board/create/        ← 게시물 작성
    ├── board/edit/          ← 게시물 편집
    ├── login/               ← 로그인 (세션 저장)
    ├── signup/              ← 회원가입
    └── user/                ← 프로필 관리
```

## Key Files to Understand First

1. **`api.js`** - API 통신 & 토큰 관리 전략 (모든 페이지가 의존)
2. **`loadComponent.js`** - 컴포넌트 로딩 패턴
3. **`pages/board/index.js`** - 페이지 구조, 무한 스크롤, 이벤트 위임 예제
4. **`api-specification.md`** - 백엔드 API 명세 (PUT vs PATCH, 요청/응답 형식)

## Common Conventions

| 항목             | 규칙                                          |
| ---------------- | --------------------------------------------- |
| **오류 처리**    | `try-catch` → 에러 메시지를 DOM에 직접 렌더링 |
| **상태 관리**    | `sessionStorage`만 사용 (로컬 저장 X)         |
| **DOM 업데이트** | `innerHTML` 또는 `appendChild` 사용           |
| **비동기 작업**  | `async/await` 사용                            |
| **스타일**       | 페이지/컴포넌트별 `index.css` 분리            |
| **모듈 임포트**  | ES6 `import/export` (절대경로: `/utils/...`)  |

## Integration Points

### 헤더 & 로그아웃

헤더는 모든 페이지에서 로드되며, 로그인 상태를 확인해 프로필/로그인 버튼을 동적으로 표시합니다.

```javascript
// 헤더 이니셜라이징
await loadComponent('#header', '/components/header/index.html');
initHeader({ backButton: false }); // 뒤로가기 필요 시 true
```

### 폼 검증 (로그인, 회원가입)

각 페이지의 폼은 `blur` 이벤트로 실시간 검증을 수행합니다.

- 이메일: 정규표현식으로 형식 검증
- 비밀번호: `8~20자, 대/소문자, 숫자, 특수문자` 조건

## When Adding Features

1. **API 함수 추가** → `api.js`에 `apiClient`로 감싼 함수 작성
2. **새 페이지** → `/pages/[name]/` 폴더 생성, `index.html`, `index.js`, `index.css`
3. **새 컴포넌트** → `/components/[name]/` 폴더, 다른 페이지에서 `loadComponent`로 동적 로드
4. **스타일** → 각 파일과 같은 폴더에 `index.css` 배치
5. **에러 처리** → `apiClient`의 에러 객체 활용: `error.status`, `error.data.message`

## Notes

- **쿠키 기반 인증:** CORS 요청 시 `credentials: 'include'` 필수
- **무한 스크롤:** `nextCursor === null`일 때만 종료
- **프로필 이미지:** 기본값 `/assets/images/default-profile.png`
- **폼 제출:** `submit` 이벤트 사용 (Enter 키 지원)
