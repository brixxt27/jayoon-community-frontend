import { getPreSignedUrl, uploadFileToUrl, signupWithUrl } from '/apis/api.js';
import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
// todo: import 절대경로로 수정 가능?

// --- DOM 요소 선택 ---
const signupForm = document.getElementById('signup-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('password-confirm');
const nicknameInput = document.getElementById('nickname');
const signupButton = document.getElementById('signup-button');

// 헬퍼 텍스트
const emailHelper = document.getElementById('email-helper');
const passwordHelper = document.getElementById('password-helper');
const passwordConfirmHelper = document.getElementById(
  'password-confirm-helper',
);
const nicknameHelper = document.getElementById('nickname-helper');

// 프로필 이미지
const profileImageInput = document.getElementById('profile-image-input');
const profilePreview = document.getElementById('profile-preview');
const profileRemoveButton = document.getElementById('profile-remove-button');

// --- 전역 상태 변수 ---
let selectedProfileFile = null;
// [수정] 깨진 validationState 객체 선언을 수정합니다.
const validationState = {
  email: false,
  password: false,
  passwordConfirm: false,
  nickname: false,
};

// --- 이벤트 리스너 등록 ---
document.addEventListener('DOMContentLoaded', async () => {
  // 헤더 로드
  try {
    await loadComponent('#header', '/components/header/index.html');
    initHeader({
      backButton: true,
      backUrl: '/pages/login/',
    });
  } catch (error) {
    console.error('헤더 로딩 중 에러 발생:', error);
  }

  // 방어 코드: 요소가 존재하는지 확인
  if (signupForm) {
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);
    passwordInput.addEventListener('input', validatePassword); // 실시간 피드백
    passwordConfirmInput.addEventListener('blur', validatePasswordConfirm);
    passwordConfirmInput.addEventListener('input', validatePasswordConfirm); // 실시간 피드백
    nicknameInput.addEventListener('blur', validateNickname);
    nicknameInput.addEventListener('input', handleNicknameInput); // 띄어쓰기 실시간 제거

    signupForm.addEventListener('submit', handleSubmit);
  } else {
    console.error('회원가입 폼을 찾을 수 없습니다.');
    return; // 폼이 없으면 아무것도 실행 안 함
  }

  if (profilePreview) {
    profilePreview.addEventListener('click', () => profileImageInput.click());
  }

  if (profileImageInput) {
    profileImageInput.addEventListener('change', handleProfileImageChange);
  }

  // [신규] 삭제 버튼 이벤트 리스너
  if (profileRemoveButton) {
    profileRemoveButton.addEventListener('click', handleProfileRemove);
  }
});

// --- 유효성 검사 헬퍼 함수 ---
function updateValidationUI(inputEl, helperEl, message, isValid) {
  if (!helperEl || !inputEl) return;

  helperEl.textContent = message;
  if (isValid) {
    helperEl.classList.remove('error');
    inputEl.classList.remove('error');
  } else {
    helperEl.classList.add('error');
    inputEl.classList.add('error');
  }
}

// --- 유효성 검사 함수 (onBlur) ---
function validateEmail() {
  const email = emailInput.value;
  const emailFormatRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (email === '') {
    updateValidationUI(
      emailInput,
      emailHelper,
      '이메일을 입력해주세요.',
      false,
    );
    validationState.email = false;
  } else if (!emailFormatRegex.test(email) || email.length < 5) {
    updateValidationUI(
      emailInput,
      emailHelper,
      '올바른 이메일 주소 형식을 입력해주세요 (예: example@example.com)',
      false,
    );
    validationState.email = false;
  } else {
    updateValidationUI(emailInput, emailHelper, '', true);
    validationState.email = true;
  }
  checkFormValidity();
}
function validatePassword() {
  const password = passwordInput.value;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;
  if (password === '') {
    updateValidationUI(
      passwordInput,
      passwordHelper,
      '비밀번호를 입력해주세요.',
      false,
    );
    validationState.password = false;
  } else if (!passwordRegex.test(password)) {
    updateValidationUI(
      passwordInput,
      passwordHelper,
      '비밀번호는 8~20자이며, 대/소문자, 숫자, 특수문자를 각 1개 포함해야 합니다.',
      false,
    );
    validationState.password = false;
  } else {
    updateValidationUI(passwordInput, passwordHelper, '', true);
    validationState.password = true;
  }
  // 비밀번호가 유효할 때만 비밀번호 확인도 같이 검사
  if (passwordConfirmInput.value) {
    validatePasswordConfirm();
  }
}
function validatePasswordConfirm() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  if (passwordConfirm === '') {
    updateValidationUI(
      passwordConfirmInput,
      passwordConfirmHelper,
      '비밀번호를 한 번 더 입력해주세요.',
      false,
    );
    validationState.passwordConfirm = false;
  } else if (password !== passwordConfirm) {
    updateValidationUI(
      passwordConfirmInput,
      passwordConfirmHelper,
      '비밀번호가 다릅니다.',
      false,
    );
    validationState.passwordConfirm = false;
  } else {
    if (validationState.password) {
      updateValidationUI(passwordConfirmInput, passwordConfirmHelper, '', true);
      validationState.passwordConfirm = true;
    } else {
      // 비밀번호 자체가 유효하지 않으면, 확인란도 유효하지 않음
      validationState.passwordConfirm = false;
    }
  }
  checkFormValidity();
}
function validateNickname() {
  const nickname = nicknameInput.value;
  if (nickname === '') {
    updateValidationUI(
      nicknameInput,
      nicknameHelper,
      '닉네임을 입력해주세요.',
      false,
    );
    validationState.nickname = false;
  } else if (nickname.length > 10) {
    updateValidationUI(
      nicknameInput,
      nicknameHelper,
      '닉네임은 최대 10자 까지 작성 가능합니다.',
      false,
    );
    validationState.nickname = false;
  } else if (/\s/.test(nickname)) {
    updateValidationUI(
      nicknameInput,
      nicknameHelper,
      '띄어쓰기를 없애주세요.',
      false,
    );
    validationState.nickname = false;
  } else {
    updateValidationUI(nicknameInput, nicknameHelper, '', true);
    validationState.nickname = true;
  }
  checkFormValidity();
}
function checkFormValidity() {
  const allValid = Object.values(validationState).every(
    (isValid) => isValid === true,
  );
  if (signupButton) {
    signupButton.disabled = !allValid;
  }
}

// --- 이벤트 핸들러 ---
function handleProfileImageChange(event) {
  const file = event.target.files[0];
  if (file) {
    selectedProfileFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      profilePreview.style.backgroundImage = `url(${e.target.result})`;
      profilePreview.innerHTML = ''; // + 아이콘 제거
      // [수정] 삭제 버튼 표시 (null 체크 추가)
      if (profileRemoveButton) {
        profileRemoveButton.classList.add('visible');
      }
    };
    reader.readAsDataURL(file);
  } else {
    // [수정] 파일 선택 안했을 때 (취소) 초기화 로직
    resetProfileImage();
  }
}

// [신규] 프로필 이미지 초기화 함수
function resetProfileImage() {
  selectedProfileFile = null;
  profileImageInput.value = ''; // input의 파일 선택을 초기화
  profilePreview.style.backgroundImage = 'none';
  profilePreview.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#888"/>
        </svg>
    `; // + 아이콘 다시 추가

  // [수정] 삭제 버튼 숨김 (null 체크 추가)
  if (profileRemoveButton) {
    profileRemoveButton.classList.remove('visible');
  }
}

// [신규] 삭제 버튼 클릭 핸들러
function handleProfileRemove(event) {
  // 이벤트 버블링 방지 (이거 안하면 profilePreview의 클릭 이벤트가 실행됨)
  event.stopPropagation();
  resetProfileImage();
}

function handleNicknameInput() {
  const nickname = nicknameInput.value;
  if (/\s/.test(nickname)) {
    nicknameInput.value = nickname.replace(/\s/g, '');
  }
  // 띄어쓰기 제거 후 유효성 검사 즉시 실행
  validateNickname();
}

/** 1번: 회원가입 폼 제출 핸들러 */
async function handleSubmit(event) {
  event.preventDefault();
  // 최종 검증
  validateEmail();
  validatePassword();
  validatePasswordConfirm();
  validateNickname();
  if (Object.values(validationState).some((isValid) => !isValid)) {
    signupButton.disabled = true;
    return;
  }

  signupButton.disabled = true;
  signupButton.textContent = '가입하는 중...';

  const email = emailInput.value;
  const password = passwordInput.value;
  const nickname = nicknameInput.value;
  let profileImageUrl = null;

  // --- 1. 이미지 처리 ---
  if (selectedProfileFile) {
    try {
      const { preSignedUrl, imageUrl } = await getPreSignedUrl(
        selectedProfileFile.name,
        selectedProfileFile.type,
      );

      if (!preSignedUrl || !imageUrl) {
        throw new Error('백엔드에서 파일 업로드 URL을 받지 못했습니다.');
      }
      await uploadFileToUrl(
        preSignedUrl,
        selectedProfileFile,
        selectedProfileFile.type,
      );
      profileImageUrl = imageUrl;
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      alert(`파일 업로드 중 오류가 발생했습니다: ${error.message}`);
      signupButton.disabled = false;
      signupButton.textContent = '회원가입';
      return;
    }
  }

  // --- 2. 회원가입 요청 ---
  try {
    await signupWithUrl(email, password, nickname, profileImageUrl);

    // 회원가입 성공 시 서버가 쿠키에 토큰을 담아주므로 클라이언트는 바로 리다이렉트
    location.href = '/';
  } catch (error) {
    console.error('회원가입 실패:', error);
    const errorData = error.data;

    if (errorData && errorData.field === 'email') {
      updateValidationUI(emailInput, emailHelper, errorData.message, false);
      validationState.email = false;
    } else if (errorData && errorData.field === 'nickname') {
      updateValidationUI(
        nicknameInput,
        nicknameHelper,
        errorData.message,
        false,
      );
      validationState.nickname = false;
    } else {
      alert(
        `회원가입 중 오류가 발생했습니다: ${
          error.message || '알 수 없는 오류'
        }`,
      );
    }

    checkFormValidity(); // 버튼 활성화 상태 재검사
    signupButton.textContent = '회원가입';
  }
}
