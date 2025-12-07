import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
import { deleteUser } from '/apis/api.js';

// --- 유틸리티 함수 ---

function showToast(message) {
  const toast = document.getElementById('toast-popup');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
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
  const withdrawForm = document.getElementById('withdraw-form');
  const passwordInput = document.getElementById('password-input');
  const confirmCheckbox = document.getElementById('confirm-checkbox');
  const passwordHelper = document.getElementById('password-helper');
  const cancelButton = document.getElementById('cancel-button');
  const withdrawButton = document.getElementById('withdraw-button');

  // 3. 폼 유효성 검사 및 버튼 활성화
  const validateForm = () => {
    const password = passwordInput.value.trim();
    const isConfirmed = confirmCheckbox.checked;

    // 비밀번호 필수 입력 확인
    if (password.length === 0) {
      passwordHelper.style.visibility = 'hidden';
      withdrawButton.disabled = true;
      return;
    }

    // 동의 체크 확인
    withdrawButton.disabled = !isConfirmed;
  };

  // 4. 이벤트 리스너 연결
  passwordInput.addEventListener('input', validateForm);
  confirmCheckbox.addEventListener('change', validateForm);
  withdrawForm.addEventListener('submit', (e) => e.preventDefault());

  // 5. 취소 버튼
  cancelButton.addEventListener('click', () => {
    window.location.href = '/pages/user/edit/info/';
  });

  // 6. 탈퇴 버튼 클릭 핸들러
  withdrawButton.addEventListener('click', handleWithdraw);

  async function handleWithdraw() {
    const password = passwordInput.value.trim();

    if (!password) {
      passwordHelper.textContent = '* 비밀번호를 입력해주세요.';
      passwordHelper.style.visibility = 'visible';
      return;
    }

    if (!confirmCheckbox.checked) {
      showToast('주의사항 동의가 필요합니다.');
      return;
    }

    // 최종 확인
    const confirmed = confirm(
      '정말로 탈퇴하시겠습니까?\n\n탈퇴 후에는 계정을 복구할 수 없습니다.',
    );
    if (!confirmed) {
      return;
    }

    withdrawButton.disabled = true;
    showToast('회원 탈퇴를 처리 중입니다...');

    try {
      await deleteUser(password);

      showToast('회원 탈퇴가 완료되었습니다.');
      sessionStorage.removeItem('user');

      // 1초 후 홈으로 리다이렉션
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);

      // 비밀번호 오류 처리
      if (error.message.includes('비밀번호')) {
        passwordHelper.textContent = '* 비밀번호가 올바르지 않습니다.';
        passwordHelper.style.visibility = 'visible';
        passwordInput.value = '';
      } else {
        alert(
          `회원 탈퇴 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`,
        );
      }

      withdrawButton.disabled = false;
    }
  }
});
