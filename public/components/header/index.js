const DEFAULT_PROFILE_IMAGE = '/assets/images/default-profile.png';

/**
 * @param {object} options
 * @param {boolean} [options.backButton] - 뒤로가기 버튼 표시 여부
 * @param {boolean} [options.profile] - 프로필 섹션 표시 여부
 * @param {string} [options.backUrl] - (type 'backButton'일 때) 뒤로가기 URL
 */
export function initHeader(options = { backButton: false, profile: false }) {
  const { backButton, profile, backUrl } = options;
  const backButtonEl = document.getElementById('header-back-button');
  const profileContainer = document.getElementById('header-profile-container');

  if (!backButtonEl || !profileContainer) {
    console.error('헤더의 필수 요소(뒤로가기, 프로필)를 찾을 수 없습니다.');
    return;
  }

  // ★ 수정: display 대신 visibility 사용
  // CSS에서 기본적으로 hidden으로 설정되어 있으므로, 필요한 것만 visible로 변경
  if (backButton) {
    backButtonEl.style.visibility = 'visible';
    if (backUrl) {
      backButtonEl.href = backUrl;
    } else {
      // backUrl이 없으면, 브라우저의 '뒤로가기' 기능 사용
      backButtonEl.addEventListener('click', (e) => {
        e.preventDefault();
        window.history.back();
      });
    }
  }
  if (profile) {
    if (checkLoginStatus()) {
      profileContainer.style.visibility = 'visible';
      setupProfileSection();
    } else {
      // 로그인 상태가 아니면 CSS 기본값(hidden) 유지
      profileContainer.style.visibility = 'hidden';
    }
  }
  // 'default' 타입이면 아무것도 안 함 (CSS 기본값인 hidden 유지)
}

function setupProfileSection() {
  const profileButton = document.getElementById('header-profile-button');
  const profileDropdown = document.getElementById('header-profile-dropdown');
  const logoutButton = document.getElementById('logout-button');

  if (!profileButton || !profileDropdown || !logoutButton) return;

  loadProfileImage();

  profileButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = profileDropdown.style.display === 'none';
    profileDropdown.style.display = isHidden ? 'block' : 'none';
  });

  // 클릭 시 버튼 또는 드롭다운 외부 클릭 시 드롭다운
  document.addEventListener('click', (event) => {
    if (
      !profileButton.contains(event.target) &&
      !profileDropdown.contains(event.target)
    ) {
      profileDropdown.style.display = 'none';
    }
  });

  logoutButton.addEventListener('click', (event) => {
    event.preventDefault(); // a 태그의 기본 동작(페이지 이동) 방지
    localStorage.removeItem('token');
    localStorage.removeItem('profileImageUrl'); // 로그아웃 시 프로필 이미지 URL도 제거
    console.log('Logging out...');
    window.location.href = '/pages/login';
  });
}

function loadProfileImage() {
  const profileImageEl = document.getElementById('header-profile-image');
  if (!profileImageEl) return;

  const profileImageUrl = localStorage.getItem('profileImageUrl');

  // ★ 수정: profileImageUrl이 null 또는 빈 문자열("")이 아닌지 명확하게 확인
  if (profileImageUrl && profileImageUrl.trim() !== '') {
    profileImageEl.src = profileImageUrl;
  } else {
    profileImageEl.src = DEFAULT_PROFILE_IMAGE;
  }

  // profileImageEl.src가 잘못된 URL일 경우 기본 이미지로 대체
  profileImageEl.onerror = () => {
    console.warn('프로필 이미지 로드 실패. 기본 이미지로 대체합니다.');
    profileImageEl.src = DEFAULT_PROFILE_IMAGE;
  };
}

/**
 * 로그인 상태를 확인합니다.
 * @returns {boolean} 로그인 여부
 */
function checkLoginStatus() {
  // ★ 더미데이터를 사용할 때는 디버깅을 위해 임시로 true를 반환하게 할 수 있습니다.
  return true; // (디버깅용)
  // return !!localStorage.getItem('token'); // getItem은 null 또는 값을 반환하기 때문에 null을 false로 변경합니다.
}
