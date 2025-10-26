import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
// import { getPostDetail, updatePost } from '/api/api.js'; // API 연결 시 주석 해제

// 페이지 로드 시 공통 컴포넌트 삽입 및 데이터 로드
document.addEventListener('DOMContentLoaded', async () => {
  let postId = null;
  let BOARD_DETAIL_URL = null;

  // 1. URL에서 게시물 ID 파싱
  try {
    const urlParams = new URLSearchParams(window.location.search);
    postId = urlParams.get('id');
    if (!postId) {
      throw new Error('게시물 ID가 유효하지 않습니다.');
    }
    BOARD_DETAIL_URL = `/pages/board/detail/index.html?id=${postId}`;
  } catch (error) {
    console.error(error);
    alert(error.message);
    location.href = '/index.html'; // ID 없으면 메인으로
    return;
  }

  try {
    await loadComponent('#header', '/components/header/index.html');
    initHeader({
      profile: true,
      backButton: true,
      backUrl: BOARD_DETAIL_URL,
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

  // 2. (API 연결 전) Mock 데이터로 폼 채우기
  const loadPostData = async () => {
    try {
      // --- API 연결 시 활성화 ---
      // const response = await getPostDetail(postId);
      // const post = response.data;
      // --- API 연결 시 활성화 ---

      // --- Mock 데이터 (API 연결 시 삭제) ---
      const post = {
        title: '수정할 게시물 제목입니다',
        content:
          '여기는 수정할 게시물의 내용입니다.\nAPI가 연결되면 실제 데이터가 여기에 표시됩니다.',
        imageUrl: 'existing-image.png', // 기존 이미지 URL 또는 파일명
      };
      // --- Mock 데이터 (API 연결 시 삭제) ---

      // 데이터 폼에 채우기
      titleInput.value = post.title;
      contentInput.value = post.content;
      if (post.imageUrl) {
        // 실제로는 파일명이 아니라 '기존 이미지: OOO.png' 등으로 표시할 수 있음
        fileNameSpan.textContent = `기존 이미지: ${
          post.imageUrl.split('/').pop() || post.imageUrl
        }`;
      } else {
        fileNameSpan.textContent = '기존 이미지가 없습니다.';
      }

      // 데이터 로드 성공 시 버튼 활성화
      submitButton.disabled = false;
    } catch (error) {
      console.error('게시물 조회 실패:', error);
      alert('게시물 정보를 불러오는 데 실패했습니다.');
      location.href = '/index.html'; // 조회 실패 시 메인으로
    }
  };

  await loadPostData();

  // 3. 유효성 검사 (작성과 동일)
  const validateForm = () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    return title.length > 0 && content.length > 0;
  };

  // 4. 입력 감지 함수 (작성과 동일)
  const handleInput = () => {
    if (validateForm()) {
      submitButton.disabled = false;
      helperText.style.visibility = 'hidden';
    } else {
      submitButton.disabled = true;
    }
  };

  // 5. 파일 선택 감지 함수 (작성과 동일)
  const handleFileChange = () => {
    const file = imageInput.files[0];
    if (file) {
      fileNameSpan.textContent = file.name;
    } else {
      // TODO: 파일 선택 취소 시 기존 이미지명으로 복구할지 결정
      fileNameSpan.textContent = '새 파일을 선택해주세요.';
    }
  };

  // 6. 폼 제출 (수정) 함수
  const handleSubmit = async () => {
    if (!validateForm()) {
      helperText.textContent = '*제목, 내용을 모두 작성해주세요.';
      helperText.style.visibility = 'visible';
      return;
    }

    helperText.style.visibility = 'hidden';

    const formData = new FormData();
    formData.append('title', titleInput.value.trim());
    formData.append('content', contentInput.value.trim());

    // 새 이미지가 선택된 경우에만 추가
    if (imageInput.files[0]) {
      formData.append('image', imageInput.files[0]);
    }

    // --- API 연결 시 활성화 ---
    // try {
    //   console.log('API 호출 전 (수정):', postId);
    //   // TODO: updatePost 함수는 FormData를 처리하도록 api.js에서 구현 필요
    //   // const response = await updatePost(postId, formData);
    //   // console.log('API 응답 (수정):', response);

    //   // // 성공 시 상세 페이지로 이동
    //   // alert('게시글이 성공적으로 수정되었습니다.');
    //   // location.href = BOARD_DETAIL_URL;
    // } catch (error) {
    //   console.error('게시글 수정 실패:', error);
    //   helperText.textContent = `게시글 수정에 실패했습니다: ${error.message}`;
    //   helperText.style.visibility = 'visible';
    // }
    // --- API 연결 시 활성화 ---

    // API 연결 전 임시 확인
    console.log(`[수정] 폼 데이터 준비 완료 (ID: ${postId}):`);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    alert('게시글 수정 로직 실행 (API 미연결)');
    // 성공 시 페이지 이동 (임시 - 상세 페이지로)
    location.href = BOARD_DETAIL_URL;
  };

  // 이벤트 리스너 연결
  titleInput.addEventListener('input', handleInput);
  contentInput.addEventListener('input', handleInput);
  imageInput.addEventListener('change', handleFileChange);
  submitButton.addEventListener('click', handleSubmit);

  postForm.addEventListener('submit', (e) => {
    e.preventDefault();
  });
});
