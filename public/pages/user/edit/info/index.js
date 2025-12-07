import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
import { updateMyInfo, uploadImage } from '/apis/api.js';
import { requireLogin } from '/utils/auth.js';

// --- 전역 상태 ---
let currentUser = null;
let newProfileImageFile = null; // 새로 선택된 프로필 이미지 파일

// --- 유틸리티 함수 ---

function showToast(message) {
  const toast = document.getElementById('toast-popup');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- 데이터 로드 ---

async function loadUserInfo() {
  const emailInput = document.getElementById('email-input');
  const nicknameInput = document.getElementById('nickname-input');
  const profilePreview = document.getElementById('profile-preview');

  try {
    const userString = sessionStorage.getItem('user');
    if (!userString) {
      throw new Error('로그인 정보가 없습니다.');
    }
    currentUser = JSON.parse(userString);

    emailInput.value = currentUser.email;
    nicknameInput.value = currentUser.nickname;
    profilePreview.src =
      currentUser.profileImageUrl || '/assets/images/default-profile.png';
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error);
    alert('사용자 정보를 불러오는 데 실패했습니다. 다시 로그인해주세요.');
    window.location.href = '/pages/login/';
  }
}

// --- 이벤트 핸들러 ---

function handleImagePreview(event) {
  const profilePreview = document.getElementById('profile-preview');
  const file = event.target.files[0];

  if (file) {
    newProfileImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => (profilePreview.src = e.target.result);
    reader.readAsDataURL(file);
  }
}

function validateNickname(nickname) {
  const helperText = document.getElementById('nickname-helper-text');
  helperText.style.visibility = 'hidden';

  if (nickname.length > 10 || nickname.length < 2) {
    helperText.textContent = '* 닉네임은 2자 이상 10자 이하로 입력해주세요.';
    helperText.style.visibility = 'visible';
    return false;
  }
  if (/\s/.test(nickname)) {
    helperText.textContent = '* 닉네임에는 공백을 포함할 수 없습니다.';
    helperText.style.visibility = 'visible';
    return false;
  }
  return true;
}

async function handleSubmit() {
  const nicknameInput = document.getElementById('nickname-input');
  const nickname = nicknameInput.value.trim();
  const submitButton = document.getElementById('submit-button');

  if (!validateNickname(nickname)) return;

  const updatedData = {};
  // 닉네임이 변경되었는지 확인
  if (nickname !== currentUser.nickname) {
    updatedData.nickname = nickname;
  }
  // 새 프로필 이미지가 있는지 확인
  if (newProfileImageFile) {
    // 이미지 업로드 로직 추가
  }

  // 변경 사항이 없으면 API 호출 안 함
  if (Object.keys(updatedData).length === 0 && !newProfileImageFile) {
    showToast('변경 사항이 없습니다.');
    return;
  }

  submitButton.disabled = true;
  showToast('정보를 수정하는 중...');

  try {
    // 이미지가 변경된 경우, 업로드부터 진행
    if (newProfileImageFile) {
      const uploadResponse = await uploadImage(newProfileImageFile);
      updatedData.profileImageUrl = uploadResponse.imageUrl;
    }

    const responseData = await updateMyInfo(updatedData);
    const updatedUser = { ...currentUser, ...responseData.data };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));

    // 전역 변수 및 헤더 프로필 이미지 즉시 업데이트
    currentUser = updatedUser;
    newProfileImageFile = null;

    initHeader({ backButton: true, backUrl: '/' });

    showToast('수정이 완료되었습니다.');
  } catch (error) {
    console.error('회원 정보 수정 실패:', error);
    if (error.data?.statusCode === '400') {
      const helperText = document.getElementById('nickname-helper-text');
      helperText.textContent = error.message;
      helperText.style.visibility = 'visible';
    } else {
      alert(`수정에 실패했습니다: ${error.message}`);
    }
  } finally {
    submitButton.disabled = false;
  }
}

async function handleWithdraw() {
  // 탈퇴 전용 페이지로 이동
  window.location.href = '/pages/user/withdraw/';
}

// --- 페이지 초기화 ---
document.addEventListener('DOMContentLoaded', async () => {
  // 로그인 여부 확인
  if (!requireLogin()) return;

  try {
    await loadComponent('#header', '/components/header/index.html');
    initHeader({
      backButton: true,
      backUrl: '/index.html',
    });
  } catch (error) {
    console.error('헤더 로딩 중 에러 발생:', error);
  }

  const imageInput = document.getElementById('profile-image-input');
  const submitButton = document.getElementById('submit-button');
  const withdrawButton = document.getElementById('withdraw-button');

  imageInput.addEventListener('change', handleImagePreview);
  submitButton.addEventListener('click', handleSubmit);
  withdrawButton.addEventListener('click', handleWithdraw);

  await loadUserInfo();
});
