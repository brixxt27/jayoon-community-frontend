import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
// import { createPost } from '/api/api.js'; // API 연결 시 주석 해제

// 페이지 로드 시 공통 컴포넌트 삽입
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadComponent('#header', '/components/header/index.html');
    initHeader({
      type: 'profile',
    });
  } catch (error) {
    console.error('헤더 로딩 중 에러 발생:', error);
  }

  // DOM 요소 캐싱
  const postForm = document.getElementById('post-form');
  const titleInput = document.getElementById('post-title');
  const contentInput = document.getElementById('post-content');
  const imageInput = document.getElementById('post-image');
  const fileNameSpan = document.querySelector('.file-upload-name');
  const submitButton = document.getElementById('submit-button');
  const helperText = document.getElementById('form-helper-text');

  // 유효성 검사 함수
  const validateForm = () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    return title.length > 0 && content.length > 0;
  };

  // 입력 감지 함수
  const handleInput = () => {
    if (validateForm()) {
      submitButton.disabled = false;
      // 유효성 통과 시 헬퍼 텍스트 숨김 (만약 표시된 상태였다면)
      helperText.style.visibility = 'hidden';
    } else {
      submitButton.disabled = true;
    }
  };

  // 파일 선택 감지 함수
  const handleFileChange = () => {
    const file = imageInput.files[0];
    if (file) {
      fileNameSpan.textContent = file.name;
    } else {
      fileNameSpan.textContent = '파일을 선택해주세요.';
    }
  };

  // 폼 제출 (버튼 클릭) 함수
  const handleSubmit = async () => {
    // 버튼이 활성화 상태일 때만 처리
    if (!validateForm()) {
      // 비활성화 상태에서 클릭 시 (혹은 유효성 검사 실패 시)
      helperText.textContent = '*제목, 내용을 모두 작성해주세요.';
      helperText.style.visibility = 'visible';
      return;
    }

    // 유효성 검사 통과
    helperText.style.visibility = 'hidden';

    // FormData 객체 생성
    const formData = new FormData();
    formData.append('title', titleInput.value.trim());
    formData.append('content', contentInput.value.trim());

    // 이미지가 선택되었는지 확인 후 추가
    if (imageInput.files[0]) {
      formData.append('image', imageInput.files[0]);
    }

    // --- API 연결 시 활성화 ---
    // try {
    //   console.log('API 호출 전:', {
    //     title: formData.get('title'),
    //     content: formData.get('content'),
    //     image: formData.get('image'),
    //   });

    //   // TODO: createPost 함수는 FormData를 처리하도록 api.js에서 구현 필요
    //   // const response = await createPost(formData);

    //   // console.log('API 응답:', response);

    //   // // 성공 시 상세 페이지 또는 목록 페이지로 이동
    //   // // 예: location.href = `/pages/board/detail/index.html?id=${response.data.id}`;
    //   // alert('게시글이 성공적으로 작성되었습니다.');
    //   // location.href = '/index.html'; // 임시로 메인으로 이동
    // } catch (error) {
    //   console.error('게시글 작성 실패:', error);
    //   helperText.textContent = `게시글 작성에 실패했습니다: ${error.message}`;
    //   helperText.style.visibility = 'visible';
    // }
    alert('게시글 작성 로직 실행 (API 미연결)');
    // 성공 시 페이지 이동 (임시)
    location.href = '/index.html';
  };

  // 이벤트 리스너 연결
  titleInput.addEventListener('input', handleInput);
  contentInput.addEventListener('input', handleInput);
  imageInput.addEventListener('change', handleFileChange);
  submitButton.addEventListener('click', handleSubmit);

  // 폼의 기본 제출 동작 방지 (API로 처리하므로)
  postForm.addEventListener('submit', (e) => {
    e.preventDefault();
  });
});
