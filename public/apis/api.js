/**
 * api.js
 * 백엔드 API 통신을 담당하는 모듈입니다.
 * [수정] axios 의존성을 완전히 제거하고 'fetch'로 통일합니다.
 * login, signup 함수 모두 fetch를 사용합니다.
 */

// const BASE_URL = 'http://localhost:8080';
const BASE_URL = 'http://guidey.site/api';

/**
 * API 호출 후 응답을 처리하는 헬퍼 함수
 */
async function handleResponse(response) {
  if (response.status === 204) {
    // No Content
    return;
  }

  // 응답이 비어있을 수 있으므로 text()로 먼저 받습니다.
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    // 백엔드에서 { message: "...", field: "..." } 형식으로 에러를 준다고 가정
    const error = new Error(data.message || 'API 요청 실패');
    error.status = response.status;
    error.data = data; // { message, field } 등이 담김
    throw error;
  }
  return data;
}

/**
 * @description [Fetch] 로그인 API를 호출하는 함수
 * @param {string} email - 사용자 이메일
 * @param {string} password - 사용자 비밀번호
 * @returns {Promise<object>} API 응답 데이터 (성공 시)
 * @throws {Error} API 요청 실패 시 에러
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // handleResponse 헬퍼를 사용하여 에러 처리를 일관되게 합니다.
    return handleResponse(response);
  } catch (error) {
    // handleResponse가 던진 에러 외에 네트워크 에러 등
    if (error.data) {
      // handleResponse에서 처리된 에러
      throw error;
    }
    // fetch 자체의 네트워크 실패
    throw new Error('서버와 통신할 수 없습니다.');
  }
};

/**
 * 1. [Fetch] Pre-signed URL 요청
 * @param {string} filename
 * @param {string} contentType
 * @returns {Promise<{preSignedUrl: string, imageUrl: string}>}
 */
export async function getPreSignedUrl(filename, contentType) {
  const queryParams = new URLSearchParams({
    filename,
    'content-type': contentType,
  });
  const response = await fetch(
    `${BASE_URL}/images/pre-signed-url?${queryParams}`,
  );
  return handleResponse(response);
}

/**
 * 2. [Fetch] Pre-signed URL로 파일 업로드
 * @param {string} url - /images/pre-signed-url 에서 받은 preSignedUrl
 * @param {File} file
 * @param {string} contentType
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
  return;
}

/**
 * 3. [Fetch] 회원가입 (이미지 URL 전송)
 * @param {string} email
 * @param {string} password
 * @param {string} nickname
 * @param {string | null} profileImageUrl
 */
export async function signupWithUrl(
  email,
  password,
  nickname,
  profileImageUrl,
) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, nickname, profileImageUrl }),
  });
  return handleResponse(response);
}
