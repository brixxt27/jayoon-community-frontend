import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
import { login } from '/apis/api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 헤더 로드
  try {
    await loadComponent('#header', '/components/header/index.html');
    initHeader();
  } catch (error) {
    console.error('헤더 로딩 중 에러 발생:', error);
  }

  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const signupButton = document.getElementById('signup-button');

  /**
   * 이메일 유효성을 검사하는 함수입니다.
   * @returns {boolean} 유효하면 true, 아니면 false를 반환합니다.
   */
  const validateEmail = () => {
    const email = emailInput.value.trim(); // 입력값의 앞뒤 공백 제거
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (email === '') {
      emailError.textContent = '이메일을 입력해주세요.';
      return false;
    }
    if (email.length < 5) {
      emailError.textContent = '이메일 형식이 너무 짧습니다.';
      return false;
    }
    if (!emailRegex.test(email)) {
      emailError.textContent = '유효하지 않은 이메일 형식입니다.';
      return false;
    }
    emailError.textContent = '';
    return true;
  };

  /**
   * 비밀번호 유효성을 검사하는 함수입니다.
   * 정규표현식: 8~20자, 대문자, 소문자, 숫자, 특수문자 각각 최소 1개 포함
   * @returns {boolean} 유효하면 true, 아니면 false를 반환합니다.
   */
  const validatePassword = () => {
    const password = passwordInput.value.trim();
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

    if (password === '') {
      passwordError.textContent = '비밀번호를 입력해주세요.';
      return false;
    }
    if (!passwordRegex.test(password)) {
      passwordError.textContent =
        '8~20자, 대/소문자, 숫자, 특수문자를 포함해야 합니다.';
      return false;
    }
    passwordError.textContent = '';
    return true;
  };

  /**
   * 로그인 실패 시 에러 메시지를 표시하는 함수입니다.
   * 백엔드 API 연동 후, API 응답에 따라 이 함수를 호출할 수 있습니다.
   */
  const showLoginFailureError = () => {
    passwordError.textContent = '아이디 또는 비밀번호를 확인해주세요.';
  };

  /**
   * 로그인 폼의 'submit' 이벤트를 처리합니다.
   * 'click' 이벤트 대신 'submit'을 사용하면 사용자가 엔터 키를 눌러도 폼이 제출됩니다.
   */
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    passwordError.textContent = '';

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (isEmailValid && isPasswordValid) {
      try {
        const responseData = await login(emailInput.value, passwordInput.value);

        // API 응답의 data 객체를 user 정보로 sessionStorage에 저장
        sessionStorage.setItem('user', JSON.stringify(responseData.data));

        // 로그인 성공 후 메인 페이지로 이동
        window.location.href = '/';
      } catch (error) {
        console.error('로그인 실패:', error);
        // API Client에서 던진 에러 메시지를 사용하거나, 일반적인 메시지 표시
        passwordError.textContent =
          error.data?.message || '아이디 또는 비밀번호를 확인해주세요.';
      }
    }
  });

  /**
   * 회원가입 버튼의 'click' 이벤트를 처리합니다.
   * 클릭 시 회원가입 페이지로 이동합니다.
   */
  if (signupButton) {
    signupButton.addEventListener('click', () => {
      window.location.href = '/pages/signup';
    });
  }

  /**
   * 사용자가 입력을 멈췄을 때 실시간으로 유효성을 검사하기 위해 'blur' 이벤트를 사용합니다.
   * 'blur'는 input 요소에서 포커스가 벗어났을 때 발생합니다.
   */
  emailInput.addEventListener('blur', validateEmail);
  passwordInput.addEventListener('blur', validatePassword);
});
