import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
import {
  updateMyInfo,
  getPreSignedUrl,
  uploadFileToUrl,
  // deleteUser,
} from '../../apis/api.js';

// --- 전역 상태 ---
let currentUser = null;
let newProfileImageFile = null; // 새로 선택된 프로필 이미지 파일

// --- 유틸리티 함수 ---

function openModal(modalId) {
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modal = document.getElementById(modalId);
  modal.style.display = 'block';
  modalBackdrop.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modalBackdrop = document.getElementById('modal-backdrop');
  modalBackdrop.classList.remove('visible');
  document.body.style.overflow = '';
}

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
      const presigned = await getPreSignedUrl(
        newProfileImageFile.name,
        newProfileImageFile.type,
      );
      await uploadFileToUrl(
        presigned.preSignedUrl,
        newProfileImageFile,
        newProfileImageFile.type,
      );
      updatedData.profileImageUrl = presigned.profileImageUrl;
    }

    // 변경된 데이터만 API로 전송
    const responseData = await updateMyInfo(updatedData);

    // sessionStorage 업데이트
    const updatedUser = { ...currentUser, ...responseData };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    
    // 전역 변수 및 헤더 프로필 이미지 즉시 업데이트
    currentUser = updatedUser;
    newProfileImageFile = null;
    initHeader({ profile: true, backButton: true, backUrl: '/'});
    
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
  closeModal();
  console.log('[Mock] 회원 탈퇴 처리 (API 연동 필요)');
  // 추후 deleteUser() API 연동
  // alert('회원 탈퇴가 완료되었습니다.');
  // sessionStorage.removeItem('user');
  // window.location.href = '/pages/login/';
}

// --- 페이지 초기화 ---
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadComponent('#header', '/components/header/index.html');
    initHeader({
      profile: true,
      backButton: true,
      backUrl: '/index.html',
    });
  } catch (error) {
    console.error('헤더 로딩 중 에러 발생:', error);
  }

  const imageInput = document.getElementById('profile-image-input');
  const submitButton = document.getElementById('submit-button');
  const withdrawButton = document.getElementById('withdraw-button');
  const withdrawCancelBtn = document.getElementById('withdraw-cancel-btn');
  const withdrawConfirmBtn = document.getElementById('withdraw-confirm-btn');

  imageInput.addEventListener('change', handleImagePreview);
  submitButton.addEventListener('click', handleSubmit);
  withdrawButton.addEventListener('click', () => openModal('withdraw-modal'));
  withdrawCancelBtn.addEventListener('click', closeModal);
  withdrawConfirmBtn.addEventListener('click', handleWithdraw);

  await loadUserInfo();
});
