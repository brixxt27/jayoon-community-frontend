import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
// import { updatePassword } from '/api/api.js';

// --- 유틸리티 함수 ---

/** 토스트 메시지 보이기 (info 페이지와 동일) */
function showToast(message) {
  const toast = document.getElementById('toast-popup');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000); // 3초 후 사라짐
}

/** 비밀번호 유효성 검사 (지시사항 1) */
function validatePassword(password) {
  // 8~20자, 대문자, 소문자, 숫자, 특수문자 각 1개 이상
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
  return regex.test(password);
}

// --- 페이지 초기화 ---
document.addEventListener('DOMContentLoaded', async () => {
  // 1. 헤더 로드
  try {
    await loadComponent('#header', '/components/header/index.html');
    // 헤더 옵션 (프로필O, 뒤로가기O, 메인 페이지로)
    initHeader({
      profile: true,
      backButton: true,
      backUrl: '/index.html',
    });
  } catch (error) {
    console.error('헤더 로딩 중 에러 발생:', error);
  }

  // 2. DOM 요소 캐싱
  const passwordForm = document.getElementById('password-form');
  const passwordInput = document.getElementById('password-input');
  const passwordConfirmInput = document.getElementById(
    'password-confirm-input',
  );
  const passwordHelper = document.getElementById('password-helper');
  const passwordConfirmHelper = document.getElementById(
    'password-confirm-helper',
  );
  const submitButton = document.getElementById('submit-button');

  // 3. 유효성 검사 및 버튼 활성화 함수
  const validateForm = () => {
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    let isValid = true;

    // 헬퍼 텍스트 초기화
    passwordHelper.style.visibility = 'hidden';
    passwordConfirmHelper.style.visibility = 'hidden';

    // --- 지시사항 1: 유효성 검사 ---

    // 1-1. 비밀번호 입력란
    if (password.length === 0) {
      passwordHelper.textContent = '*비밀번호를 입력해주세요.';
      passwordHelper.style.visibility = 'visible';
      isValid = false;
    } else if (!validatePassword(password)) {
      passwordHelper.textContent =
        '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
      passwordHelper.style.visibility = 'visible';
      isValid = false;
    }

    // 1-2. 비밀번호 확인 입력란
    if (passwordConfirm.length === 0) {
      passwordConfirmHelper.textContent = '*비밀번호를 한번 더 입력해주세요';
      passwordConfirmHelper.style.visibility = 'visible';
      isValid = false;
    }

    // 1-3. 두 비밀번호 일치 여부 (두 필드가 모두 비어있지 않을 때만)
    if (password.length > 0 && passwordConfirm.length > 0) {
      if (password !== passwordConfirm) {
        if (isValid) {
          // 비밀번호 자체는 유효하지만 확인과 다를 때
          passwordHelper.textContent = '*비밀번호 확인과 다릅니다.';
          passwordHelper.style.visibility = 'visible';
        }
        passwordConfirmHelper.textContent = '*비밀번호와 다릅니다.';
        passwordConfirmHelper.style.visibility = 'visible';
        isValid = false;
      }
    }

    // --- 지시사항 2: 버튼 활성화 ---
    submitButton.disabled = !isValid;
    return isValid;
  };

  // 4. 이벤트 리스너 연결
  passwordInput.addEventListener('input', validateForm);
  passwordConfirmInput.addEventListener('input', validateForm);
  submitButton.addEventListener('click', handleSubmit);
  passwordForm.addEventListener('submit', (e) => e.preventDefault());

  // 5. '수정하기' 버튼 클릭 핸들러
  async function handleSubmit() {
    // 최종 유효성 검사
    if (!validateForm()) {
      return;
    }

    submitButton.disabled = true; // 중복 제출 방지

    try {
      // --- API 연결 시 활성화 ---
      // await updatePassword({ newPassword: passwordInput.value });
      // ---

      // --- Mock Code (API 연결 시 삭제) ---
      console.log('[Mock] 비밀번호 수정 요청:', passwordInput.value);
      // ---

      // 5-1. 수정 성공 토스트
      showToast('수정 완료');

      // 성공 시 입력 필드 비우기
      passwordInput.value = '';
      passwordConfirmInput.value = '';
      validateForm(); // 버튼 비활성화

      // 성공 후 회원 정보 페이지로 이동 (선택적)
      // setTimeout(() => {
      //   location.href = '/pages/user/edit/info/index.html';
      // }, 2000);
    } catch (error) {
      console.error('비밀번호 수정 실패:', error);
      alert('비밀번호 수정에 실패했습니다.');
      submitButton.disabled = false;
    }
  }
});
