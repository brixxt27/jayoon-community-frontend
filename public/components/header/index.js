import { logout } from '../../apis/api.js';

const DEFAULT_PROFILE_IMAGE = '/assets/images/default-profile.png';

/**
 * @param {object} options
 * @param {boolean} [options.backButton] - 뒤로가기 버튼 표시 여부
 * @param {string} [options.backUrl] - (type 'backButton'일 때) 뒤로가기 URL
 */
export function initHeader(options = { backButton: false }) {
  const { backButton, backUrl } = options;
  const backButtonEl = document.getElementById('header-back-button');
  const profileContainer = document.getElementById('header-profile-container');
  const loginContainer = document.getElementById('header-login-container');
  const loginButton = document.getElementById('login-button');

  if (!backButtonEl || !profileContainer || !loginContainer || !loginButton) {
    console.error('헤더의 필수 요소 중 일부를 찾을 수 없습니다.');
    return;
  }

  // 뒤로가기 버튼 처리
  if (backButton) {
    backButtonEl.style.visibility = 'visible';
    if (backUrl) {
      backButtonEl.href = backUrl;
    } else {
      backButtonEl.addEventListener('click', (e) => {
        e.preventDefault();
        window.history.back();
      });
    }
  } else {
    backButtonEl.style.visibility = 'hidden';
  }

  // 로그인 상태에 따른 프로필/로그인 버튼 표시
  if (checkLoginStatus()) {
    profileContainer.style.visibility = 'visible';
    loginContainer.style.visibility = 'hidden';
    setupProfileSection();
  } else {
    profileContainer.style.visibility = 'hidden';
    loginContainer.style.visibility = 'visible';
    loginButton.addEventListener('click', () => {
      window.location.href = '/pages/login/';
    });
  }
}

function setupProfileSection() {
  const profileButton = document.getElementById('header-profile-button');
  const profileDropdown = document.getElementById('header-profile-dropdown');
  const logoutButton = document.getElementById('logout-button');

  if (!profileButton || !profileDropdown || !logoutButton) return;

  loadProfileImage();

  // 프로필 버튼 클릭 시 드롭다운 토글
  profileButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = profileDropdown.style.display === 'none';
    profileDropdown.style.display = isHidden ? 'block' : 'none';
  });

  // 외부 클릭 시 드롭다운 닫기
  document.addEventListener('click', (event) => {
    if (
      !profileButton.contains(event.target) &&
      !profileDropdown.contains(event.target)
    ) {
      profileDropdown.style.display = 'none';
    }
  });

  // 로그아웃 버튼 클릭 이벤트
  logoutButton.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      await logout(); // API 호출
      sessionStorage.removeItem('user'); // sessionStorage에서 사용자 정보 제거
      alert('로그아웃 되었습니다.');
      window.location.href = '/pages/login/'; // 로그인 페이지로 이동
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 혹시 모를 에러 발생 시에도 세션 클리어 및 리디렉션 시도
      sessionStorage.removeItem('user');
      window.location.href = '/pages/login/';
    }
  });
}

function loadProfileImage() {
  const profileImageEl = document.getElementById('header-profile-image');
  if (!profileImageEl) return;

  try {
    const userString = sessionStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user.profileImageUrl) {
        profileImageEl.src = user.profileImageUrl;
      } else {
        profileImageEl.src = DEFAULT_PROFILE_IMAGE;
      }
    } else {
      profileImageEl.src = DEFAULT_PROFILE_IMAGE;
    }
  } catch (e) {
    console.error('프로필 이미지 로딩 중 오류:', e);
    profileImageEl.src = DEFAULT_PROFILE_IMAGE;
  }

  profileImageEl.onerror = () => {
    profileImageEl.src = DEFAULT_PROFILE_IMAGE;
  };
}

/**
 * sessionStorage에 'user' 정보가 있는지 확인하여 로그인 상태를 판단합니다.
 * @returns {boolean} 로그인 여부
 */
function checkLoginStatus() {
  return !!sessionStorage.getItem('user');
}
