/**
 * auth.js
 * 클라이언트 측 인증 및 접근 제어를 담당하는 유틸리티 모듈입니다.
 */

/**
 * 현재 사용자가 로그인했는지 확인합니다.
 * @returns {boolean} 로그인 상태 여부
 */
export function isLoggedIn() {
  return !!sessionStorage.getItem('user');
}

/**
 * 현재 로그인한 사용자의 정보를 반환합니다.
 * @returns {Object|null} 사용자 객체 또는 null
 */
export function getCurrentUser() {
  const userString = sessionStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
}

/**
 * 로그인이 필요한 페이지 보호 함수
 * 로그인되어 있지 않으면 로그인 페이지로 리다이렉트합니다.
 *
 * @param {string} redirectUrl - 로그인 후 돌아올 URL (선택사항)
 * @returns {boolean} 로그인 상태 여부. false일 경우 이미 리다이렉트됨
 */
export function requireLogin(redirectUrl = null) {
  if (!isLoggedIn()) {
    // 현재 페이지를 로그인 후 돌아올 URL로 설정
    const returnUrl =
      redirectUrl || window.location.pathname + window.location.search;
    sessionStorage.setItem('returnUrl', returnUrl);
    window.location.href = '/pages/login/';
    return false;
  }
  return true;
}

/**
 * 특정 사용자가 게시물의 소유자인지 확인합니다.
 * @param {number} postAuthorId - 게시물 작성자 ID
 * @returns {boolean} 소유자 여부
 */
export function isPostOwner(postAuthorId) {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.id === postAuthorId;
}

/**
 * 로그인 후 저장된 returnUrl로 리다이렉트합니다.
 * returnUrl이 없으면 홈으로 이동합니다.
 */
export function redirectAfterLogin() {
  const returnUrl = sessionStorage.getItem('returnUrl');
  sessionStorage.removeItem('returnUrl');
  window.location.href = returnUrl || '/';
}
