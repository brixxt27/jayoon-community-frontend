import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
import {
  createPost,
  getPreSignedUrl,
  uploadFileToUrl,
} from '../../apis/api.js';

// 페이지 로드 시 공통 컴포넌트 삽입
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadComponent('#header', '/components/header/index.html');
    initHeader({
      type: 'profile',
      backButton: true,
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
    submitButton.disabled = !validateForm();
    if (submitButton.disabled) {
      helperText.style.visibility = 'hidden';
    }
  };

  // 파일 선택 감지 함수
  const handleFileChange = () => {
    const file = imageInput.files[0];
    fileNameSpan.textContent = file ? file.name : '파일을 선택해주세요.';
  };

  // 폼 제출 함수 (API 연동)
  const handleSubmit = async () => {
    if (!validateForm()) {
      helperText.textContent = '*제목, 내용을 모두 작성해주세요.';
      helperText.style.visibility = 'visible';
      return;
    }

    submitButton.disabled = true;
    helperText.textContent = '게시글을 등록하는 중...';
    helperText.style.visibility = 'visible';

    try {
      let imageUrls = [];
      const imageFile = imageInput.files[0];

      // 1. 이미지가 있는 경우, 먼저 업로드
      if (imageFile) {
        helperText.textContent = '이미지를 업로드하는 중...';
        // 1-1. Pre-signed URL 요청
        const presignedData = await getPreSignedUrl(
          imageFile.name,
          imageFile.type,
        );
        // 1-2. 실제 파일 업로드
        await uploadFileToUrl(
          presignedData.preSignedUrl,
          imageFile,
          imageFile.type,
        );
        // 1-3. 최종 URL 저장
        imageUrls.push(presignedData.profileImageUrl);
      }

      const title = titleInput.value.trim();
      const content = contentInput.value.trim();

      // 2. 게시글 생성 API 호출
      helperText.textContent = '게시글을 등록하는 중...';
      const newPost = await createPost(title, content, imageUrls);

      // 3. 성공 시 상세 페이지로 이동
      alert('게시글이 성공적으로 작성되었습니다.');
      window.location.href = `/pages/board/detail/index.html?id=${newPost.id}`;
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      helperText.textContent = `오류가 발생했습니다: ${error.message}`;
      submitButton.disabled = false; // 재시도 가능하도록 버튼 활성화
    }
  };

  // 이벤트 리스너 연결
  titleInput.addEventListener('input', handleInput);
  contentInput.addEventListener('input', handleInput);
  imageInput.addEventListener('change', handleFileChange);
  submitButton.addEventListener('click', handleSubmit);

  postForm.addEventListener('submit', (e) => e.preventDefault());
});
