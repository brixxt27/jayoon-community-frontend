/**
 * api.js
 * 백엔드 API 통신을 담당하는 모듈입니다.
 * 모든 API 요청에 대해 인증 토큰을 자동으로 관리하고,
 * Access Token 만료 시 자동으로 재발급을 시도합니다.
 */

const getBaseUrl = () => {
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080/api';
  }
  return 'https://guidey.site/api';
};

const BASE_URL = getBaseUrl();

/**
 * API 호출 후 응답을 처리하는 헬퍼 함수
 * @param {Response} response - fetch 응답 객체
 * @returns {Promise<any>} JSON 데이터 또는 No Content 시 undefined
 * @throws {Error} API 에러 발생 시
 */
async function handleResponse(response) {
  if (response.status === 204) {
    return;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  console.log('API Response:', data);

  if (!response.ok) {
    const error = new Error(
      data.message || 'API 요청 처리 중 에러가 발생했습니다.',
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

/**
 * Access Token 재발급을 요청하는 함수
 * 이 함수는 apiClient 내부에서만 사용됩니다.
 */
async function refreshToken() {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // Refresh Token 쿠키를 보내기 위해 필수
  });
  // 재발급 실패 시 handleResponse가 에러를 던짐 (401 등)
  return handleResponse(response);
}

/**
 * 인증이 필요한 API를 호출하는 범용 클라이언트
 * Access Token 만료 시 자동으로 재발급을 시도하고 원래 요청을 재전송합니다.
 * @param {string} endpoint - API 엔드포인트 (e.g., '/posts')
 * @param {object} [options={}] - fetch 옵션 (method, body 등)
 * @returns {Promise<any>} API 응답 데이터
 */
export async function apiClient(endpoint, options = {}) {
  const { method = 'GET', body = null } = options;

  const fetchOptions = {
    method,
    credentials: 'include', // 모든 요청에 쿠키를 자동으로 포함시킴
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    // 1. 첫 번째 API 요청 시도
    const response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);
    return await handleResponse(response);
  } catch (error) {
    // 2. 401 에러 발생 시 토큰 재발급 시도
    if (error.status === 401) {
      console.log('Access Token이 만료되어 재발급을 시도합니다.');
      try {
        // 2-1. 토큰 재발급 요청
        await refreshToken();
        console.log('토큰 재발급 성공. 이전 요청을 재시도합니다.');

        // 2-2. 원래 요청 재시도
        const retryResponse = await fetch(
          `${BASE_URL}${endpoint}`,
          fetchOptions,
        );
        return await handleResponse(retryResponse);
      } catch (refreshError) {
        // 3. 토큰 재발급 실패 시 (Refresh Token 만료 등)
        console.error(
          '토큰 재발급에 실패했습니다. 로그인이 필요합니다.',
          refreshError,
        );
        // 로그인 페이지로 리디렉션
        window.location.href = '/pages/login/';
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
    }
    // 401 이외의 에러는 그대로 던짐
    throw error;
  }
}

// --- 기존 및 신규 API 함수들 ---

/**
 * [Fetch] 로그인 API
 * 중요: credentials: 'include'를 명시해야 Set-Cookie 응답이 쿠키로 저장됩니다.
 * CORS 요청에서 쿠키를 받기 위해 필수입니다.
 */
export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

/**
 * [Fetch] 로그아웃 API
 */
export const logout = async () => {
  // apiClient를 사용하여 인증 쿠키와 함께 요청
  return apiClient('/auth', { method: 'DELETE' });
};

/**
 * [AWS Lambda] 이미지 업로드
 * multipart/form-data로 AWS Lambda 엔드포인트에 파일을 업로드합니다.
 * @param {File} file - 업로드할 파일
 * @returns {Promise<{imageUrl: string}>} 업로드된 이미지 URL
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append(file.name, file);

  const response = await fetch(
    'https://suese6dve0.execute-api.ap-northeast-2.amazonaws.com/upload/profile-image',
    {
      method: 'POST',
      body: formData,
      // Content-Type: multipart/form-data는 자동으로 설정되므로 명시하면 안됨
    },
  );

  if (!response.ok) {
    throw new Error(`이미지 업로드 실패: ${response.status}`);
  }

  const data = await handleResponse(response);
  // 응답 형식: { status: 201, message: "...", data: ["url1", "url2", ...] }
  // data 배열의 첫 번째 URL을 imageUrl로 반환
  const imageUrl = data.data && data.data.length > 0 ? data.data[0] : null;
  if (!imageUrl) {
    throw new Error('업로드된 이미지 URL을 찾을 수 없습니다.');
  }
  return { imageUrl };
}

/**
 * 1. [Fetch] Pre-signed URL 요청
 */
export async function getPreSignedUrl(filename, contentType) {
  const queryParams = new URLSearchParams({
    filename,
    'content-type': contentType,
  });
  // 이 API는 인증이 필요 없으므로 apiClient를 사용하지 않습니다.
  const response = await fetch(
    `${BASE_URL}/images/pre-signed-url?${queryParams}`,
  );
  return handleResponse(response);
}

/**
 * 2. [Fetch] Pre-signed URL로 파일 업로드
 */
export async function uploadFileToUrl(url, file, contentType) {
  const response = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': contentType,
    },
  });

  if (!response.ok) {
    throw new Error('파일 업로드에 실패했습니다.');
  }
}

/**
 * 3. [Fetch] 회원가입 (이미지 URL 전송)
 * 중요: credentials: 'include'를 명시해야 Set-Cookie 응답이 쿠키로 저장됩니다.
 * CORS 요청에서 쿠키를 받기 위해 필수입니다.
 */
export async function signupWithUrl(
  email,
  password,
  nickname,
  profileImageUrl,
) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    credentials: 'include', // 쿠키 포함을 위해 필수
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, nickname, profileImageUrl }),
  });
  return handleResponse(response);
}

/**
 * [API Client] 게시글 목록 조회
 * @param {number | null} cursor - 다음 페이지 커서 (ID)
 * @param {number} limit - 페이지 당 게시글 수
 */
export const getPosts = async (cursor = null, limit = 10) => {
  const query = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    query.set('cursor', String(cursor));
  }
  return apiClient(`/posts?${query.toString()}`);
};

/**
 * [API Client] 게시글 상세 조회
 * @param {string | number} postId - 조회할 게시글의 ID
 */
export const getPostDetail = async (postId) => {
  return apiClient(`/posts/${postId}`);
};

/**
 * [API Client] 댓글 목록 조회
 * @param {string | number} postId - 댓글을 조회할 게시글의 ID
 * @param {number | null} cursor - 다음 페이지 커서 (ID)
 * @param {number} limit - 페이지 당 댓글 수
 */
export const getComments = async (postId, cursor = null, limit = 10) => {
  const query = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    query.set('cursor', String(cursor));
  }
  return apiClient(`/posts/${postId}/comments?${query.toString()}`);
};

/**
 * [API Client] 게시글 생성
 * @param {string} title - 게시글 제목
 * @param {string} body - 게시글 본문
 * @param {string[]} imageUrls - 업로드된 이미지 URL 배열
 * @returns
 */
export const createPost = async (title, body, imageUrls = []) => {
  return apiClient('/posts', {
    method: 'POST',
    body: { title, body, imageUrls },
  });
};

/**
 * [API Client] 게시글 삭제
 * @param {string | number} postId - 삭제할 게시글의 ID
 */
export const deletePost = async (postId) => {
  return apiClient(`/posts/${postId}`, { method: 'DELETE' });
};

/**
 * [API Client] 게시글 수정
 * @param {string | number} postId - 수정할 게시글의 ID
 * @param {object} updatedData - 수정할 데이터 { title, body, imageUrls }
 */
export const updatePost = async (postId, updatedData) => {
  return apiClient(`/posts/${postId}`, {
    method: 'PATCH',
    body: updatedData,
  });
};

/**
 * [API Client] 내 정보 수정
 * @param {object} updatedData - 수정할 데이터 { nickname, profileImageUrl }
 */
export const updateMyInfo = async (updatedData) => {
  return apiClient('/users/me', {
    method: 'PATCH',
    body: updatedData,
  });
};

/**
 * [API Client] 회원 탈퇴
 * @param {string} password - 사용자 확인을 위한 현재 비밀번호
 */
export const deleteUser = async (password) => {
  return apiClient('/users/me', {
    method: 'DELETE',
    body: { password },
  });
};

/**
 * [API Client] 게시글 좋아요
 * @param {string | number} postId - 좋아요 할 게시글의 ID
 */
export const likePost = async (postId) => {
  return apiClient(`/posts/${postId}/like`, { method: 'POST' });
};

/**
 * [API Client] 게시글 좋아요 취소
 * @param {string | number} postId - 좋아요를 취소할 게시글의 ID
 */
export const unlikePost = async (postId) => {
  return apiClient(`/posts/${postId}/like`, { method: 'DELETE' });
};

/**
 * [API Client] 댓글 생성
 * @param {string | number} postId - 댓글을 생성할 게시글의 ID
 * @param {string} body - 댓글 내용
 */
export const createComment = async (postId, body) => {
  return apiClient(`/posts/${postId}/comments`, {
    method: 'POST',
    body: { body },
  });
};

/**
 * [API Client] 댓글 수정
 * @param {string | number} postId - 댓글이 속한 게시글의 ID
 * @param {string | number} commentId - 수정할 댓글의 ID
 * @param {string} body - 새로운 댓글 내용
 */
export const updateComment = async (postId, commentId, body) => {
  return apiClient(`/posts/${postId}/comments/${commentId}`, {
    method: 'PATCH',
    body: { body },
  });
};

/**
 * [API Client] 댓글 삭제
 * @param {string | number} postId - 댓글이 속한 게시글의 ID
 * @param {string | number} commentId - 삭제할 댓글의 ID
 */
export const deleteComment = async (postId, commentId) => {
  return apiClient(`/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  });
};
