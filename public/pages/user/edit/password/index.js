import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
import { updateMyInfo } from '/apis/api.js';

// --- 유틸리티 함수 ---

function showToast(message) {
  const toast = document.getElementById('toast-popup');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function validateNewPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
  return regex.test(password);
}

// --- 페이지 초기화 ---
document.addEventListener('DOMContentLoaded', async () => {
  // 1. 헤더 로드
  try {
    await loadComponent('#header', '/components/header/index.html');
    initHeader({
      backButton: true,
      backUrl: '/pages/user/edit/info/',
    });
  } catch (error) {
    console.error('헤더 로딩 중 에러 발생:', error);
  }

  // 2. DOM 요소 캐싱
  const passwordForm = document.getElementById('password-form');
  const currentPasswordInput = document.getElementById(
    'current-password-input',
  );
  const newPasswordInput = document.getElementById('new-password-input');
  const passwordConfirmInput = document.getElementById(
    'password-confirm-input',
  );
  const currentPasswordHelper = document.getElementById(
    'current-password-helper',
  );
  const newPasswordHelper = document.getElementById('new-password-helper');
  const passwordConfirmHelper = document.getElementById(
    'password-confirm-helper',
  );
  const submitButton = document.getElementById('submit-button');

  // 3. 유효성 검사 및 버튼 활성화 함수
  const validateForm = () => {
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    let isValid = true;

    currentPasswordHelper.style.visibility = 'hidden';
    newPasswordHelper.style.visibility = 'hidden';
    passwordConfirmHelper.style.visibility = 'hidden';

    if (currentPassword.length === 0) isValid = false;
    if (newPassword.length === 0) isValid = false;
    if (passwordConfirm.length === 0) isValid = false;

    if (isValid && !validateNewPassword(newPassword)) {
      newPasswordHelper.textContent =
        '* 8~20자, 대/소문자, 숫자, 특수문자를 포함해야 합니다.';
      newPasswordHelper.style.visibility = 'visible';
      isValid = false;
    }

    if (isValid && newPassword !== passwordConfirm) {
      passwordConfirmHelper.textContent = '* 새 비밀번호와 다릅니다.';
      passwordConfirmHelper.style.visibility = 'visible';
      isValid = false;
    }

    submitButton.disabled = !isValid;
    return isValid;
  };

  // 4. 이벤트 리스너 연결
  currentPasswordInput.addEventListener('input', validateForm);
  newPasswordInput.addEventListener('input', validateForm);
  passwordConfirmInput.addEventListener('input', validateForm);
  submitButton.addEventListener('click', handleSubmit);
  passwordForm.addEventListener('submit', (e) => e.preventDefault());

  // 5. '수정하기' 버튼 클릭 핸들러
  async function handleSubmit() {
    if (!validateForm()) return;

    submitButton.disabled = true;
    const currentPassword = currentPasswordInput.value;
    const updatedPassword = newPasswordInput.value;

    try {
      await updateMyInfo({ currentPassword, updatedPassword });

      showToast('수정 완료');
      passwordForm.reset();
      validateForm();
    } catch (error) {
      console.error('비밀번호 수정 실패:', error);
      if (error.message.includes('비밀번호가 일치하지 않습니다')) {
        currentPasswordHelper.textContent =
          '* 현재 비밀번호가 올바르지 않습니다.';
        currentPasswordHelper.style.visibility = 'visible';
      } else {
        alert(`비밀번호 수정에 실패했습니다: ${error.message}`);
      }
    } finally {
      submitButton.disabled = false;
    }
  }
});
