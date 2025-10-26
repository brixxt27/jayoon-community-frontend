import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
// import { getUserInfo, updateUserInfo, deleteUser } from '/api/api.js';

// --- 전역 상태 ---
let newProfileImageFile = null; // 새로 선택된 프로필 이미지 파일

// --- Mock Data ---
const mockUserInfo = {
  email: 'startupcode@gmail.com',
  nickname: '스타트업코드',
  profileImageUrl: null, // 기본 이미지를 사용하도록 null로 설정
};

// --- 유틸리티 함수 ---

/** 모달 열기 */
function openModal(modalId) {
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modal = document.getElementById(modalId);
  if (!modalBackdrop || !modal) return;
  modal.style.display = 'block';
  modalBackdrop.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

/** 모달 닫기 */
function closeModal() {
  const modalBackdrop = document.getElementById('modal-backdrop');
  if (!modalBackdrop) return;
  modalBackdrop.classList.remove('visible');
  document.body.style.overflow = '';
}

/** 토스트 메시지 보이기 */
function showToast(message) {
  const toast = document.getElementById('toast-popup');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000); // 3초 후 사라짐
}

// --- 데이터 로드 ---

/** (Mock) 사용자 정보 로드 */
async function loadUserInfo() {
  const emailInput = document.getElementById('email-input');
  const nicknameInput = document.getElementById('nickname-input');
  const profilePreview = document.getElementById('profile-preview');

  try {
    // --- API 연결 시 활성화 ---
    // const response = await getUserInfo();
    // const user = response.data;
    // ---

    // --- Mock Code (API 연결 시 삭제) ---
    const user = mockUserInfo;
    // ---

    emailInput.value = user.email;
    nicknameInput.value = user.nickname;
    profilePreview.src =
      user.profileImageUrl || '/assets/images/default-profile.png';
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error);
    alert('사용자 정보를 불러오는 데 실패했습니다.');
    location.href = '/index.html';
  }
}

// --- 이벤트 핸들러 ---

/** 프로필 이미지 변경 시 미리보기 */
function handleImagePreview(event) {
  const profilePreview = document.getElementById('profile-preview');
  const file = event.target.files[0];

  if (file) {
    newProfileImageFile = file; // 전역 변수에 파일 저장
    const reader = new FileReader();
    reader.onload = (e) => {
      profilePreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

/** 닉네임 유효성 검사 (지시사항 2) */
function validateNickname(nickname) {
  const helperText = document.getElementById('nickname-helper-text');
  helperText.style.visibility = 'hidden';

  if (nickname.length === 0) {
    helperText.textContent = '*닉네임을 입력해주세요.';
    helperText.style.visibility = 'visible';
    return false;
  }
  if (nickname.length > 10) {
    helperText.textContent = '*닉네임은 최대 10자 까지 작성 가능합니다.';
    helperText.style.visibility = 'visible';
    return false;
  }
  // (Mock) 중복 검사 예시
  if (nickname === '중복닉네임') {
    helperText.textContent = '*중복된 닉네임 입니다.';
    helperText.style.visibility = 'visible';
    return false;
  }
  return true;
}

/** '수정하기' 버튼 클릭 핸들러 */
async function handleSubmit() {
  const nicknameInput = document.getElementById('nickname-input');
  const nickname = nicknameInput.value.trim();

  // 1. 유효성 검사
  if (!validateNickname(nickname)) {
    return;
  }

  // 2. FormData 생성
  const formData = new FormData();
  formData.append('nickname', nickname);
  if (newProfileImageFile) {
    formData.append('image', newProfileImageFile);
  }

  // 3. (Mock) API 호출
  try {
    // --- API 연결 시 활성화 ---
    // const response = await updateUserInfo(formData);
    // console.log('회원 정보 수정 완료:', response.data);
    // ---

    // --- Mock Code (API 연결 시 삭제) ---
    console.log('[Mock] 회원 정보 수정 요청:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    // ---

    // 4. 성공 피드백 (지시사항 3)
    showToast('수정 완료');

    // (선택) 헤더 프로필 즉시 업데이트 (API 연결 시)
    // initHeader({ profile: true, backButton: true, backUrl: '/index.html' });
  } catch (error) {
    console.error('회원 정보 수정 실패:', error);
    // (Mock) API 에러가 400 Bad Request 이고, 닉네임 중복 에러일 경우
    if (error.response?.data?.code === 'DUPLICATE_NICKNAME') {
      const helperText = document.getElementById('nickname-helper-text');
      helperText.textContent = '*중복된 닉네임 입니다.';
      helperText.style.visibility = 'visible';
    } else {
      alert('회원 정보 수정에 실패했습니다.');
    }
  }
}

/** (확인) 회원 탈퇴 핸들러 (지시사항 4) */
async function handleWithdraw() {
  closeModal();

  try {
    // --- API 연결 시 활성화 ---
    // await deleteUser();
    // ---

    // --- Mock Code (API 연결 시 삭제) ---
    console.log('[Mock] 회원 탈퇴 요청');
    // ---

    alert('회원 탈퇴가 완료되었습니다.');
    // TODO: 로그아웃 처리 (토큰 삭제 등)
    location.href = '/pages/login/index.html'; // 로그인 페이지로 이동
  } catch (error) {
    console.error('회원 탈퇴 실패:', error);
    alert('회원 탈퇴 처리에 실패했습니다.');
  }
}

// --- 페이지 초기화 ---
document.addEventListener('DOMContentLoaded', async () => {
  // 1. 헤더 로드
  try {
    await loadComponent('#header', '/components/header/index.html');
    // 헤더 옵션 (프로필O, 뒤로가기O, 뒤로가기 시 메인으로)
    initHeader({
      profile: true,
      backButton: true,
      backUrl: '/index.html',
    });
  } catch (error) {
    console.error('헤더 로딩 중 에러 발생:', error);
  }

  // 2. DOM 요소 캐싱
  const imageInput = document.getElementById('profile-image-input');
  const submitButton = document.getElementById('submit-button');
  const withdrawButton = document.getElementById('withdraw-button');
  const withdrawCancelBtn = document.getElementById('withdraw-cancel-btn');
  const withdrawConfirmBtn = document.getElementById('withdraw-confirm-btn');

  // 3. 이벤트 리스너 연결
  imageInput.addEventListener('change', handleImagePreview);
  submitButton.addEventListener('click', handleSubmit);
  withdrawButton.addEventListener('click', () => openModal('withdraw-modal'));
  withdrawCancelBtn.addEventListener('click', closeModal);
  withdrawConfirmBtn.addEventListener('click', handleWithdraw);

  // 4. (Mock) 데이터 로드
  await loadUserInfo();
});
