# 목차

- 가이드
- 리소스 및 도메인 별 API
  - [users](#users)
  - [posts](#posts)
  - [auth](#auth)
  - [images](#images)

# 가이드

## PUT과 PATCH

- PUT은 리소스 전체를 완전히 대체합니다. 즉 리소스의 모든 필드가 수정 됩니다.
- PATCH는 리소스의 일부 필드만 부분적으로 수정합니다.

# users

## 회원 가입 POST /users

### 요청

#### Header

없음

#### Path variables

없음

#### Query parameters

없음

#### Body

(필수)

- email
  - 320자 이내
  - 소문자 영문, 숫자, @, .만 가능
  - 이메일 형식(test@test.com)
- password
  - 8~20자
  - 대, 소문자, 숫자, 특수문자 하나씩 포함.
- nickname
  - 2~10자
  - 띄어쓰기 불가능

(선택)

- profileImageUrl
  - 2048자 이내
  - 업로드 하지 않으면 null 예정

```json
{
  "email": "test@startupcode.kr",
  "password": "test1234",
  "nickname": "startup",
  "profileImageUrl": "https://image.kr/img.jpg"
}
```

### 응답

---

#### 성공

200, 사용자 경험을 위해 회원가입과 동시에 바로 로그인이 됩니다.

**header**

Set-Cookie: HttpOnly, SameSite(Lax), Secure, path='/' key='accesshToken' value='token value'
Set-Cookie: HttpOnly, SameSite(Strict), Secure, path='/auth/refresh' key='refreshToken' value='token value'

**body**

```json
{
  "success": true,
  "message": "회원가입이 성공적으로 완료 되었습니다.",
  "data": {
    "userId": 1,
    "email": "test@startupcode.kr",
    "nickname": "startup",
    "profileImageUrl": "https://image.kr/img.jpg"
  },
  "error": null
}
```

#### 실패

400

```json
{
  "success": false,
  "message": "잘못된 형식입니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

## 유저 정보 변경 PATCH /users/me

- 프로필 사진, 닉네임, 비밀번호를 변경 할 수 있습니다.

### 요청

#### Header

HeaderCookie: Bearer access token

#### Path variables

- userId: Number을 사용하려 했으나 삭제. 왜냐하면 보안적으로 좋지 않은 패턴이기 때문이다. 클라이언트는 유저 아이디를 예측해서 다른 유저의 정보를 수정하거나 접근할 수 있다. 물론 인증 및 인가 처리를
  해두겠지만 사전에 처리하도록 하는 me를 붙이는 패턴이 더 깔끔해 보입니다.

#### Query parameters

없음

#### Body

(선택)

- profileImageUrl
  - 2048자 이내
  - 업로드 하지 않으면 null 예정
- currentPassword
  - 8~20자
  - 대, 소문자, 숫자, 특수문자 하나씩 포함.
- updatedPassword
  - 8~20자
  - 대, 소문자, 숫자, 특수문자 하나씩 포함.
- nickname
  - 2~10자
  - 띄어쓰기 불가능

```json
{
  "profileImageUrl": "https://your-cdn.com/images/profile/unique-file-name.jpg",
  "nickname": "jayoon",
  "currentPassword": "current_password",
  "updatedPassword": "updated_password"
}
```

### 응답

---

#### 성공

200

```json
{
  "success": true,
  "message": "프로필 사진이 성공적으로 변경되었습니다.",
  "data": {
    "userId": 1,
    "profileImageUrl": "https://your-cdn.com/images/profile/new-image.jpg"
  },
  "error": null
}
```

```json
{
  "success": true,
  "message": "닉네임이 성공적으로 변경되었습니다.",
  "data": {
    "userId": 1,
    "nickname": "jayoon"
  },
  "error": null
}
```

##### header

set-cookie "refreshToken": "df...", httpOnly

- 비밀번호를 변경한 후 해당 기기만 인증 상태를 유지합니다.

```json
{
  "success": true,
  "message": "비밀번호 변경이 성공적으로 완료 되었습니다. 다른 기기에서 로그아웃 됩니다.",
  "data": null,
  "error": null
}
```

#### 실패

400

```json
{
  "success": false,
  "message": "잘못된 형식입니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

```json
{
  "success": false,
  "message": "비밀번호가 일치하지 않습니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

401

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

403

```json
{
  "success": false,
  "message": "권한이 없습니다.",
  "data": null,
  "error": {
    "statusCode": "403"
  }
}
```

404, 인증 및 인가를 성공했으나 JWT에서 추출한 userId가 존재하지 않을 때

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

## 회원 탈퇴 DELETE /users/me

### 요청

#### Header

HeaderCookie: Bearer access token

#### Path variables

없음

#### Query parameters

없음

#### Body

```json
{
  "password": "current_password"
}
```

[RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231#page-29)
A payload within a DELETE request message has no defined semantics;
sending a payload body on a DELETE request might cause some existing
implementations to reject the request.

### 응답

---

#### 성공

200

```json
{
  "success": true,
  "message": "회원 탈퇴가 성공적으로 완료 되었습니다.",
  "data": null,
  "error": null
}
```

#### 실패

400

```json
{
  "success": false,
  "message": "잘못된 형식입니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

```json
{
  "success": false,
  "message": "비밀번호가 잘못 되었습니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

401

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

404, 인증 및 인가를 성공했으나 JWT에서 추출한 userId가 존재하지 않을 때

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

# posts

## 게시글 생성 POST /posts

### 요청

#### Header

HeaderCookie: Bearer access token

#### Path variables

없음

#### Query parameters

없음

#### Body

이미지는 이후에 여러 개를 받을 수 있을 때를 고려하여 배열로 받습니다. 현재는 하나만 받을 수 있습니다.

```json
{
  "title": "제목1",
  "body": "본문 내용",
  "imageUrls": ["https://your-cdn.com/images/profile/unique-file-name.jpg"]
}
```

### 응답

---

#### 성공

201
**Header**:

- `Location`: `/api/v1/posts/123` (새로 생성된 게시글의 ID가 123일 경우)
  **Body**

```json
{
  "success": true,
  "message": "게시글이 성공적으로 생성되었습니다.",
  "data": {
    "id": 123,
    "title": "새로운 게시글 제목입니다",
    "body": "여기에 게시글 내용이 들어갑니다. 마크다운도 지원해요!",
    "likeCount": 0,
    "commentCount": 0,
    "viewCount": 0,
    "imageUrls": ["https://your-cdn.com/images/profile/unique-file-name.jpg"],
    "createdAt": "2025-10-13T07:45:43Z",
    "user": {
      "id": 1,
      "nickname": "jayoon"
    },
    "isAuthor": true,
    "isLiked": false
  },
  "error": null
}
```

#### 실패

400

```json
{
  "success": false,
  "message": "입력값 유효성 검사에 실패했습니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

401

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

404, 인증 및 인가를 성공했으나 JWT에서 추출한 userId가 존재하지 않을 때

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

## 게시글 목록 조회(인피니티 스크롤링) GET /posts

첫 번째 요청: GET /posts?limit=10
두 번째 이후 요청: GET /posts?limit=10&cursor={이전 응답에서 받은 nextCursor값}

### 요청

#### Header

HeaderCookie: Bearer access token

#### Path variables

없음

#### Query parameters

- (필수) limit: Number, 10
- (선택) cursor: Number, 11
  - 마지막으로 불러온 마지막 게시글 id
  - 첫 번째 요청 때는 해당 파라미터를 생략합니다.
  - 두 번째 요청 이후부터는 이전 응답의 nextCursor를 사용합니다.

#### Body

없음

### 응답

---

#### 성공

200
nextCursor는 마지막으로 읽은 게시글의 아이디입니다. 이 값을 cursor 파라미터로 사용하세요. 더 이상 불러올 게시물이 없다면 **null**을 반환합니다. totalCount는 전체 게시글의 개수입니다.

```json
{
  "success": true,
  "message": null,
  "data": {
    "posts": [
      {
        "id": 20,
        "title": "제목 20",
        "likeCount": 1,
        "commentCount": 1,
        "viewCount": 1,
        "createdAt": "1997-01-01T00:00:00.000Z",
        "user": {
          "id": 1,
          "nickname": "jayoon",
          "profileImageUrl": "url"
        }
      },
      // limit만큼의 데이터
      {
        "id": 11,
        "title": "제목 11",
        "likeCount": 1,
        "commentCount": 1,
        "viewCount": 1,
        "createdAt": "1997-01-01T00:00:00.000Z",
        "user": {
          "id": 1,
          "nickname": "jayoon",
          "profileImageUrl": "url"
        }
      }
    ],
    "nextCursor": 11,
    "totalCount": 150
  },
  "error": null
}
```

#### 실패

400

```json
{
  "success": false,
  "message": "잘못된 형식입니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

401

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

404, 인증 및 인가를 성공했으나 JWT에서 추출한 userId가 존재하지 않을 때

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

## 게시글 상세 조회 GET /posts/:postId

### 요청

#### Header

HeaderCookie: Bearer access token

#### Path variables

postId: Number, 1

#### Query parameters

없음

#### Body

없음

### 응답

---

#### 성공

200
**Body**

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 123,
    "title": "새로운 게시글 제목입니다",
    "body": "여기에 게시글 내용이 들어갑니다. 마크다운도 지원해요!",
    "likeCount": 0,
    "commentCount": 0,
    "viewCount": 0,
    "imageUrls": ["https://your-cdn.com/images/profile/unique-file-name.jpg"],
    "createdAt": "2025-10-13T07:45:43Z",
    "user": {
      "id": 1,
      "nickname": "jayoon"
    },
    "isAuthor": true,
    "isLiked": false
  },
  "error": null
}
```

#### 실패

400

```json
{
  "success": false,
  "message": "잘못된 형식입니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

401

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

404

1. 인증 및 인가를 성공했으나 JWT에서 추출한 userId가 존재하지 않을 때
2. 해당 페이지 리소스가 존재하지 않을 때

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

## 게시글 삭제 DELETE /posts/:postId

### 요청

#### Header

HeaderCookie: Bearer access token

#### Path variables

postId: Number, 1

#### Query parameters

없음

#### Body

없음

### 응답

---

#### 성공

200
**Body**

```json
{
  "success": true,
  "message": "게시글이 성공적으로 삭제되었습니다.",
  "data": null,
  "error": null
}
```

#### 실패

400 `postId`가 유효한 숫자 형식이 아닐 때

```json
{
  "success": false,
  "message": "잘못된 형식입니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

401

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

404

1. 인증 및 인가를 성공했으나 JWT에서 추출한 userId가 존재하지 않을 때
2. 해당 페이지 리소스가 존재하지 않을 때
3. 보안을 위해 접근 권한이 없을 때 403이 아닌 404로 응답합니다.

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

## 게시글 수정 PATCH /posts/:postId

### 요청

#### Header

HeaderCookie: Bearer access token

#### Path variables

postId: Number, 1

#### Query parameters

없음

#### Body

수정하려는 필드만 선택적으로 포함합니다. 필드가 전혀 포함 되어 있지 않으면 아무런 변화도 없습니다.

```json
{
  "title": "제목1",
  "body": "본문 내용",
  "imageUrls": ["https://your-cdn.com/images/profile/unique-file-name.jpg"]
}
```

```json
{
  "title": "제목1"
}
```

### 응답

---

#### 성공

200
**Body**

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 123,
    "title": "새로운 게시글 제목입니다",
    "body": "여기에 게시글 내용이 들어갑니다. 마크다운도 지원해요!",
    "likeCount": 0,
    "commentCount": 0,
    "viewCount": 0,
    "imageUrls": ["https://your-cdn.com/images/profile/unique-file-name.jpg"],
    "createdAt": "2025-10-13T07:45:43Z",
    "user": {
      "id": 1,
      "nickname": "jayoon"
    },
    "isAuthor": true,
    "isLiked": false
  },
  "error": null
}
```

#### 실패

400

```json
{
  "success": false,
  "message": "잘못된 형식입니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

401

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

404

1. 인증 및 인가를 성공했으나 JWT에서 추출한 userId가 존재하지 않을 때
2. 해당 페이지 리소스가 존재하지 않을 때
3. 보안을 위해 접근 권한이 없을 때 403이 아닌 404로 응답합니다.

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

## 게시글 좋아요 POST /posts/:postId/like

### 요청

#### Header

HeaderCookie: Bearer access token

#### Path variables

postId: Number, 1

#### Query parameters

없음

#### Body

없음

### 응답

---

#### 성공

200

**Body**

```json
{
  "success": true,
  "message": null,
  "data": {
    "postId": 1,
    "likeCount": 11
  },
  "error": null
}
```

#### 실패

401

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

404

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

## 게시글 좋아요 취소 DELETE /posts/:postId/like

### 요청

#### Header

HeaderCookie: Bearer access token

#### Path variables

postId: Number, 1

#### Query parameters

없음

#### Body

없음

### 응답

---

#### 성공

200

**Body**

```json
{
  "success": true,
  "message": null,
  "data": {
    "postId": 1,
    "likeCount": 10
  },
  "error": null
}
```

#### 실패

401

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

404

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

## 댓글 목록 조회(인피니티 스크롤링) GET /posts/:postId/comments

- 첫 번째 요청: GET /posts/:postId/comments?limit=10
- 두 번째 이후 요청: GET /posts/:postId/comments?limit=10&cursor={이전 응답에서 받은 nextCursor 값}
- 게시물 상세 페이지에서 게시물 상세 조회와 함께 같이 요청 되어야 하는 API입니다.

### 요청

---

#### Header

HeaderCookie: Bearer access token

#### Path variables

(필수) postId: Number, 1

#### Query parameters

- (필수) limit: Number, 10
- (선택) cursor: Number, 11
  - 마지막으로 불러온 마지막 게시글 id
  - 첫 번째 요청 때는 해당 파라미터를 생략합니다.
  - 두 번째 요청 이후부터는 이전 응답의 nextCursor를 사용합니다.

#### Body

없음

### 응답

---

#### 성공

200
nextCursor는 마지막으로 읽은 게시글의 아이디입니다. 이 값을 cursor 파라미터로 사용하세요. 더 이상 불러올 게시물이 없다면 **null**을 반환합니다.
totalCount는 해당 게시글의 전체 댓글 개수입니다.

```json
{
  "success": true,
  "message": null,
  "data": {
    "comments": [
      {
        "id": 20,
        "body": "본문이에요~",
        "createdAt": "1997-01-01T00:00:00.000Z",
        "user": {
          "id": 1,
          "nickname": "jay"
        },
        "isAuthor": false
      },
      // limit 개수만큼의 데이터
      {
        "id": 11,
        "body": "본문이에요~",
        "createdAt": "1997-01-01T00:00:00.000Z",
        "user": {
          "id": 1,
          "nickname": "jayoon"
        },
        "isAuthor": true
      }
    ],
    "nextCursor": 11,
    "totalCount": 52
  },
  "error": null
}
```

#### 실패

400

```json
{
  "success": false,
  "message": "잘못된 형식입니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

401

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

404

1. 인증 및 인가를 성공했으나 JWT에서 추출한 userId가 존재하지 않을 때
2. postId 리소스가 존재하지 않을 때

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

## 댓글 생성 POST /posts/:postId/comments

### 요청

#### Header

HeaderCookie: Bearer access token

#### Path variables

(필수) postId: Number, 1

#### Query parameters

없음

#### Body

```json
{
  "body": "본문 내용"
}
```

### 응답

---

#### 성공

200

```json
{
  "success": true,
  "message": "댓글 생성이 성공적으로 완료 되었습니다.",
  "data": {
    "id": 1,
    "body": "본문이에요~",
    "createdAt": "1997-01-01T00:00:00.000Z",
    "user": {
      "id": 1,
      "nickname": "jayoon"
    },
    "isAuthor": true,
    "isLiked": false
  },
  "error": null
}
```

#### 실패

400

```json
{
  "success": false,
  "message": "입력값 유효성 검사에 실패했습니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

401

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

404

1. 인증 및 인가를 성공했으나 JWT에서 추출한 userId가 존재하지 않을 때
2. postId 리소스가 존재하지 않을 때

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

## 댓글 수정 PATCH /posts/:postId/comments/:commentId

### 요청

#### Header

HeaderCookie: Bearer access token

#### Path variables

postId: Number, 1
commentId: Number, 1

#### Query parameters

없음

#### Body

```json
{
  "body": "본문입니다~~"
}
```

### 응답

---

#### 성공

200
**Body**

```json
{
  "success": true,
  "message": "댓글 수정이 성공적으로 완료 되었습니다.",
  "data": {
    "id": 123,
    "body": "여기에 게시글 내용이 들어갑니다."
  },
  "error": null
}
```

#### 실패

400

```json
{
  "success": false,
  "message": "잘못된 형식입니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

401

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

404

1. 인증 및 인가를 성공했으나 JWT에서 추출한 userId가 존재하지 않을 때
2. 해당 페이지 리소스가 존재하지 않을 때
3. 보안을 위해 접근 권한이 없을 때 403이 아닌 404로 응답합니다.

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

### 댓글 삭제 DELETE /posts/:postId/comments/:commentId

#### Header

HeaderCookie: Bearer access token

#### Path variables

postId: Number, 1
commentId: Number, 1

#### Query parameters

없음

#### Body

없음

### 응답

---

#### 성공

200
**Body**

```json
{
  "success": true,
  "message": "댓글이 성공적으로 삭제되었습니다.",
  "data": null,
  "error": null
}
```

#### 실패

400 `postId` 또는 `commentId`가 유효한 숫자 형식이 아닐 때

```json
{
  "success": false,
  "message": "잘못된 형식입니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

401

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

404

1. 인증 및 인가를 성공했으나 JWT에서 추출한 userId가 존재하지 않을 때
2. 해당 페이지 리소스가 존재하지 않을 때
3. 보안을 위해 접근 권한이 없을 때 403이 아닌 404로 응답합니다.

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

# auth

## 로그인 POST /auth

---

### 요청

---

#### Header

없음

#### Path variables

없음

#### Query parameters

없음

#### Body

```json
{
  "email": "test@startupcode.kr",
  "password": "test1234"
}
```

### 응답

---

#### 성공

200

**header**

Set-Cookie: HttpOnly, SameSite(Lax), Secure, path='/' key='accesshToken' value='token value'
Set-Cookie: HttpOnly, SameSite(Strict), Secure, path='/auth/refresh' key='refreshToken' value='token value'

**body**

```json
{
  "success": true,
  "message": "회원가입이 성공적으로 완료 되었습니다.",
  "data": {
    "userId": 1,
    "email": "test@startupcode.kr",
    "nickname": "startup",
    "profileImageUrl": "https://image.kr/img.jpg"
  },
  "error": null
}
```

#### 실패

400

```json
{
  "success": false,
  "message": "잘못된 형식입니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

401

```json
{
  "success": false,
  "message": "아이디 또는 비밀번호가 잘못 되었습니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

## 로그아웃 DELETE /auth

---

### 요청

---

#### Header

HeaderCookie: Bearer access token

#### Path variables

없음

#### Query parameters

없음

#### Body

없음

### 응답

---

#### 성공

200
**Header**
Set-Cookie: refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly
**body**

```json
{
  "success": true,
  "message": null,
  "data": null,
  "error": null
}
```

#### 실패

401, access token이 잘못 되었을 때

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

404, 인증 및 인가를 성공했으나 JWT에서 추출한 userId가 존재하지 않을 때

```json
{
  "success": false,
  "message": "요청한 리소스가 존재하지 않습니다",
  "data": null,
  "error": {
    "statusCode": "404"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

## Access token 재발급 POST /auth/refresh

POST /auth/access-token, POST /auth/refresh 사이에서 고민을 많이 했습니다. 결론적으로 순수 RESTful API를 준수하다가 '재'발급과 같이 method + resource로
나타내기 애매한 것들은 예외를 둘까 앞으로 쭉 고민해볼 예정입니다. 로그인을 POST /users/login으로 하기 싫어서 인증 정보를 하나의 독립된 도메인으로 뒀습니다. 그래서 POST /auth로 우회했더니
이러한 벽을 또 만나네요...
때문에 이럴 때 다음을 고려하기로 했습니다.

- 더 명확한가?
- 업계에서 많이 사용하는가?

### 요청

#### Header

Set-Cookie: HttpOnly, SameSite(Lax), Secure, path='/' key='accesshToken' value='token value'
Set-Cookie: HttpOnly, SameSite(Strict), Secure, path='/auth/refresh' key='refreshToken' value='token value'
인가(JWT)가 필요 없음!

- 로그인과 액세스 토큰 재발급을 제외하고 잘못된 인증 정보(401)에 대한 응답을 받았을 때 해당 API를 호출하므로 인가는 필요 없다. 오직 refresh token만을 확인한다.

#### Path variables

없음

#### Query parameters

없음

#### Body

없음

### 응답

#### 성공

200

```json
{
  "success": true,
  "message": null,
  "data": null,
  "error": null
}
```

#### 실패

401, refresh token이 만료 되었거나 잘못 되었을 때

- 모든 인증 정보 관련된 토큰을 삭제하고, 로그인 페이지로 리다이렉션 시킵니다.
- 로그인을 포함하여 액세스 토큰 재발급 API 응답으로 401을 받을 때는 액세스 토큰 재발급 API 호출하지 않습니다.

```json
{
  "success": false,
  "message": "존재하지 않는 인증 정보입니다.",
  "data": null,
  "error": {
    "statusCode": "401"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```

# images

## 이미지 추가 POST /images

- API Gateway와 Lambda를 통해 별도로 저장 됩니다.
- 회원가입 때도 사진을 저장 할 수 있어야 하기 때문에 해당 API는 인증 정보가 필요 없다.
  - 그렇다면 공격자가 악의적으로 계속 요청하면?

### 요청

---

#### Header

없음

#### Path variables

없음

#### Query parameters

(필수)
path: 저장 경로

#### Body

없음

### 응답

---

#### 성공

200

```json
{
  "success": true,
  "message": null,
  "data": content,
  "error": null
}
```

#### 실패

400

```json
{
  "success": false,
  "message": "잘못된 형식입니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

## pre-signed URL 조회 GET /images/pre-signed-url

GET /images/upload-url?filename=name.jpg&content-type=image/jpeg

- 현재는 변경 되어 사용하지 않습니다.
- 파일을 구분하기 위해 파일 이름 몇 글자를 따온 문자열 + 고유한 문자열을 합쳐서 파일을 저장할 예정입니다.

### 요청

---

#### Header

#### Path variables

없음

#### Query parameters

- filename: String, my-photo.jpg
- content-type: String, image/jpeg

#### Body

없음

### 응답

---

#### 성공

200

```json
{
  "success": true,
  "message": null,
  "data": {
    "preSignedUrl": "https://your-bucket.s3.amazonaws.com/...",
    "profileImageUrl": "https://your-cdn.com/images/profile/unique-file-name.jpg"
  },
  "error": null
}
```

- preSignedUrl: 업로드 용 URL
- profileImageUrl: 업로드 이후 조회 용 URL

#### 실패

400

```json
{
  "success": false,
  "message": "잘못된 형식입니다.",
  "data": null,
  "error": {
    "statusCode": "400"
  }
}
```

500

```json
{
  "success": false,
  "message": "서비스가 일시적으로 불안정합니다. 관리자에게 문의해주세요.",
  "data": null,
  "error": {
    "statusCode": "500"
  }
}
```
