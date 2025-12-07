## API(js) 연결

---

**로그인 페이지**

- [x] POST /auth 로그인
- [x] DELETE /auth 로그아웃

**회원가입 페이지**

- [x] POST /users 회원가입
  - [ ] 이미지 추가

**회원정보-일반정보 수정 페이지**

- [x] PUT /users/me 회원정보 수정
  - [x] 닉네임
  - [ ] 이미지 변경
- [x] DELETE /users/me 회원 탈퇴

**회원정보-비밃번호 수정 페이지**

- [x] PUT /users/me 회원정보 수정

**게시글 목록 페이지**

- [x] GET /posts 게시글 목록 조회

**게시글 상세 페이지**

- [ ] GET /posts/:postId 게시글 상세 조회
- [ ] DELETE /posts/:postId 게시글 삭제
- [ ] POST? PUT? /likes 좋아요 생성 또는 삭제
- [ ] GET /comments 댓글 조회
- [ ] POST /comments/:commentId 댓글 생성
- [ ] PUT /comments/:commentId 댓글 수정
- [ ] DELETE /comments/:commentId 댓글 삭제

**게시글 추가 페이지**

- [ ] GET /images/pre-signed-url Pre-signed URL 조회
- [ ] POST /posts

**게시글 수정 페이지**

- [ ] GET /images/pre-signed-url Pre-signed URL 조회
- [ ] PUT /posts/:postId
