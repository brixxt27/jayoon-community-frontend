import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
import { getPostDetail, updatePost } from '../../apis/api.js';

// 페이지 로드 시 공통 컴포넌트 삽입 및 데이터 로드
document.addEventListener('DOMContentLoaded', async () => {
  let postId = null;
  let boardDetailUrl = null;

  // 1. URL에서 게시물 ID 파싱
  try {
    const urlParams = new URLSearchParams(window.location.search);
    postId = urlParams.get('id');
    if (!postId) {
      throw new Error('게시물 ID가 유효하지 않습니다.');
    }
    boardDetailUrl = `/pages/board/detail/index.html?id=${postId}`;
  } catch (error) {
    console.error(error);
    alert(error.message);
    window.location.href = '/';
    return;
  }

  // 헤더 로드
  try {
    await loadComponent('#header', '/components/header/index.html');
    initHeader({
      backButton: true,
      backUrl: `/pages/board/detail/?id=${postId}`,
    });
  } catch (error) {
    console.error('헤더 로딩 중 에러 발생:', error);
  }

  // DOM 요소 캐싱
  const postForm = document.getElementById('post-form');
  const titleInput = document.getElementById('post-title');
  const contentInput = document.getElementById('post-content');
  const imageInput = document.getElementById('post-image'); // 이미지는 다음 단계에서
  const fileNameSpan = document.querySelector('.file-upload-name');
  const submitButton = document.getElementById('submit-button');
  const helperText = document.getElementById('form-helper-text');

  // 2. 기존 게시물 데이터 로드 및 폼 채우기
  const loadPostData = async () => {
    try {
      const post = (await getPostDetail(postId)).data;

      // 본인 글이 아니면 수정 권한이 없으므로 리디렉션
      if (!post.isAuthor) {
        alert('수정할 권한이 없습니다.');
        location.href = boardDetailUrl;
        return;
      }

      titleInput.value = post.title;
      contentInput.value = post.body;

      if (post.imageUrls && post.imageUrls.length > 0) {
        const imageName = post.imageUrls[0].split('/').pop();
        fileNameSpan.textContent = `기존 이미지: ${imageName}`;
      } else {
        fileNameSpan.textContent = '기존 이미지가 없습니다.';
      }

      submitButton.disabled = false;
    } catch (error) {
      console.error('게시물 조회 실패:', error);
      alert('게시물 정보를 불러오는 데 실패했습니다.');
      window.location.href = '/';
    }
  };

  await loadPostData();

  // 3. 유효성 검사
  const validateForm = () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    return title.length > 0 && content.length > 0;
  };

  // 4. 입력 감지
  const handleInput = () => {
    submitButton.disabled = !validateForm();
    if (helperText.style.visibility === 'visible') {
      helperText.style.visibility = 'hidden';
    }
  };

  // 5. 폼 제출 (수정)
  const handleSubmit = async () => {
    if (!validateForm()) {
      helperText.textContent = '*제목, 내용을 모두 작성해주세요.';
      helperText.style.visibility = 'visible';
      return;
    }

    submitButton.disabled = true;
    helperText.textContent = '게시글을 수정하는 중...';
    helperText.style.visibility = 'visible';

    const updatedData = {
      title: titleInput.value.trim(),
      body: contentInput.value.trim(),
      // imageUrls는 이번 단계에서 제외
    };

    try {
      await updatePost(postId, updatedData);
      alert('게시글이 성공적으로 수정되었습니다.');
      window.location.href = boardDetailUrl;
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      helperText.textContent = `게시글 수정에 실패했습니다: ${error.message}`;
      helperText.style.visibility = 'visible';
      submitButton.disabled = false;
    }
  };

  // 이벤트 리스너 연결
  titleInput.addEventListener('input', handleInput);
  contentInput.addEventListener('input', handleInput);
  submitButton.addEventListener('click', handleSubmit);
  postForm.addEventListener('submit', (e) => e.preventDefault());
});
