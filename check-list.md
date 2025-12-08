## API(js) 연결

---

**로그인 페이지**

- [x] POST /auth 로그인
- [x] DELETE /auth 로그아웃

**회원가입 페이지**

- [x] POST /users 회원가입
  - [x] 이미지 추가

**회원정보-일반정보 수정 페이지**

- [x] PUT /users/me 회원정보 수정
  - [x] 닉네임
  - [x] 이미지 변경
- [x] DELETE /users/me 회원 탈퇴

**회원정보-비밃번호 수정 페이지**

- [x] PUT /users/me 회원정보 수정

**게시글 목록 페이지**

- [x] GET /posts 게시글 목록 조회

**게시글 추가 페이지**

- [x] POST /posts
  - [x] 이미지 추가

**게시글 상세 페이지**

- [x] GET /posts/:postId 게시글 상세 조회
- [x] DELETE /posts/:postId 게시글 삭제
- [x] POST /posts/:postId/like 좋아요 생성
- [x] DELTE /posts/:postId/like 좋아요 삭제
- [x] POST /posts/:postId/comments 댓글 생성
- [x] GET /posts/:postId/comments 댓글 목록 조회
- [x] PUT /posts/:postId/comments/:commentId 댓글 수정
- [x] DELETE /posts/:postId/comments/:commentId 댓글 삭제

**게시글 수정 페이지**

- [x] PUT /posts/:postId
  - [x] 이미지 추가
