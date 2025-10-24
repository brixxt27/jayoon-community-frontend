const DEFAULT_PROFILE_IMAGE = '/assets/images/default-profile.png';

/**
 * @param {object} options
 * @param {'default'|'backButton'|'profile'} options.type - 헤더 타입
 * @param {string} [options.backUrl] - (type 'BackButton'일 때) 뒤로가기 URL)
 *
 * options.type에 따라 헤더의 동작을 초기화합니다.
 * default: 아무 것도 보여주지 않습니다.
 *
 * profile: 프로필 이미지를 보여줍니다.
 * 로그인 안 되는데 "profile" 타입을 요청 시 현재는 숨기는 형식으로 진행합니다.
 * 지금으로써는 비공개 커뮤니티로 기획 했는데 솔직히 의도가 불분명해서 나중에 다시 논의가 필요합니다.
 * 이후에 로그인 버튼으로 변경 가능합니다.
 */
export function initHeader(options = { type: 'default' }) {
  const { type, backUrl } = options;
  const backButton = document.getElementById('header=back-button');
  const profileContainer = document.getElementById('header-profile-container');

  if (type === 'backButton' && backButton) {
    backButton.style.display = 'flex'; // 왜 block 대신 flex야? backButton도 로그인 때는 안 보임
    if (backUrl) {
      backButton.href = backUrl;
    }
  } else if (type === 'profile' && profileContainer) {
    profileContainer.style.display = 'block';

    if (checkLoginStatus()) {
      setupProfileSection();
    } else {
      profileContainer.style.display = 'none';
    }
  }
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
    event.preventDefault(); // Todo a 태그 기본 동작인 링크 이동을 방지한다는데 왜 그런거지?

    localStorage.removeItem('token');
    console.log('Logging out...');
    window.location.href = '/pages/login';
  });
}

function loadProfileImage() {
  const profileImageEl = document.getElementById('header-profile-image');
  if (!profileImageEl) return;

  // ToDo: 실제 프로필 이미지 URL을 가져오는 로직으로 대체 필요
  const profileImageUrl = localStorage.getItem('profileImageUrl');
  if (profileImageUrl) {
    profileImageEl.src = profileImageUrl;
  } else {
    profileImageEl.src = DEFAULT_PROFILE_IMAGE;
  }

  // profileImageEl.src = profileImageUrl이 잘못된 URL일 경우 기본 이미지로 대체
  profileImageEl.onerror = () => {
    profileImageEl.src = DEFAULT_PROFILE_IMAGE;
  };
}

/**
 * 로그인 상태를 확인합니다.
 * @returns {boolean} 로그인 여부
 */
function checkLoginStatus() {
  return !!localStorage.getItem('token'); // getItem은 null 또는 값을 반환하기 때문에 null을 false로 변경합니다.
}
