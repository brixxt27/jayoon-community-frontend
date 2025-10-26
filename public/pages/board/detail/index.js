import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
// import {
//   getPostDetail,
//   toggleLike,
//   createComment,
//   getComments,
//   updateComment,
//   deleteComment,
//   deletePost,
// } from '/api/api.js';

// --- 전역 상태 변수 ---
let postId = null; // 현재 게시글 ID
let currentUserId = 'userId_mock'; // TODO: 로그인 구현 시 실제 유저 ID로 교체
let isCommentEditMode = false; // 댓글 수정 모드 여부
let currentEditCommentId = null; // 수정 중인 댓글 ID
let currentDeleteCommentId = null; // 삭제하려는 댓글 ID
let commentCurrentPage = 1; // 댓글 현재 페이지 (무한 스크롤)
let isCommentLoading = false; // 댓글 로딩 중 여부
let isLastCommentPage = false; // 댓글 마지막 페이지 여부

// --- Mock Data (API 연결 시 삭제) ---
const mockPostDetail = {
  id: 1,
  title: '첫 번째 게시물 제목입니다',
  content:
    '여기는 게시물 본문입니다.\n여러 줄을 테스트하기 위해 줄바꿈을 포함합니다.\n\n감사합니다.',
  user: {
    id: 'userId_mock', // 작성자 (현재 유저와 동일하게 설정)
    nickname: '더미 작성자 1',
    profileImageUrl: '/assets/images/default-profile.png',
  },
  createdAt: '2025-10-26 10:30:00',
  imageUrl: 'https://placehold.co/800x400/eee/ccc?text=Post+Image',
  likeCount: 123,
  viewCount: 1500, // 1k
  commentCount: 3,
  isLiked: false, // 좋아요 누르지 않은 상태
};

const mockComments = [
  {
    id: 101,
    user: {
      id: 'userId_mock_2',
      nickname: '댓글러 1',
      profileImageUrl: '/assets/images/default-profile.png',
    },
    content: '첫 번째 댓글입니다. 잘 봤습니다!',
    createdAt: '2025-10-26 10:35:00',
  },
  {
    id: 102,
    user: {
      id: 'userId_mock', // 현재 유저와 동일
      nickname: '더미 작성자 1',
      profileImageUrl: '/assets/images/default-profile.png',
    },
    content: '제 글에 댓글 달아주셔서 감사합니다.',
    createdAt: '2025-10-26 10:40:00',
  },
  {
    id: 103,
    user: {
      id: 'userId_mock_3',
      nickname: '새로운 유저',
      profileImageUrl: '/assets/images/default-profile.png',
    },
    content: '저도 잘 봤습니다. 좋아요 누르고 가요.',
    createdAt: '2025-10-26 11:00:00',
  },
];
// --- Mock Data 끝 ---

// --- 유틸리티 함수 ---

/** 1000 이상 숫자를 1k, 10k 등으로 변환 */
function formatCount(num) {
  if (num >= 100000) {
    return (num / 1000).toFixed(0) + 'k'; // 100k
  }
  if (num >= 10000) {
    return (num / 1000).toFixed(0) + 'k'; // 10k
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'; // 1.0k -> 1k
  }
  return num.toString();
}

/** 모달 열기 */
function openModal(modalId) {
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modal = document.getElementById(modalId);
  if (!modalBackdrop || !modal) return;

  // 모든 모달 컨텐츠를 숨김
  document
    .querySelectorAll('.modal-content')
    .forEach((m) => (m.style.display = 'none'));

  // 요청된 모달만 보이게
  modal.style.display = 'block';
  modalBackdrop.classList.add('visible');
  document.body.style.overflow = 'hidden'; // 백그라운드 스크롤 방지
}

/** 모달 닫기 */
function closeModal() {
  const modalBackdrop = document.getElementById('modal-backdrop');
  if (!modalBackdrop) return;

  modalBackdrop.classList.remove('visible');
  document.body.style.overflow = ''; // 스크롤 복원
  // 닫기 시 ID 초기화
  currentDeleteCommentId = null;
}

// --- 데이터 로드 및 렌더링 ---

/** (Mock) 게시글 상세 정보 로드 */
async function loadPostDetail(id) {
  try {
    // --- API 연결 시 활성화 ---
    // const response = await getPostDetail(id);
    // const post = response.data;
    // ---
    // --- Mock Code (API 연결 시 삭제) ---
    const post = mockPostDetail;
    post.id = id; // URL의 ID를 mock 데이터에 반영
    // ---

    // 1. 제목
    document.getElementById('post-title').textContent = post.title;

    // 2. 작성자 정보 (post-meta)
    const metaContainer = document.getElementById('post-meta');
    metaContainer.innerHTML = `
      <img src="${
        post.user.profileImageUrl || '/assets/images/default-profile.png'
      }" alt="${post.user.nickname} 프로필" class="profile-img">
      <span class="nickname">${post.user.nickname}</span>
      <span class="created-at">${post.createdAt}</span>
    `;

    // 3. 수정/삭제 버튼 (본인 글일 경우)
    if (post.user.id === currentUserId) {
      const actionsContainer = document.getElementById(
        'post-actions-container',
      );
      actionsContainer.innerHTML = `
        <button class="post-action-btn" id="edit-post-btn">수정</button>
        <button class="post-action-btn" id="delete-post-btn">삭제</button>
      `;
      // 이벤트 리스너 동적 연결
      document
        .getElementById('edit-post-btn')
        .addEventListener('click', handlePostEdit);
      document
        .getElementById('delete-post-btn')
        .addEventListener('click', () => openModal('post-delete-modal'));
    }

    // 4. 게시글 이미지
    if (post.imageUrl) {
      document.getElementById('post-image-wrapper').innerHTML = `
        <img src="${post.imageUrl}" alt="게시글 이미지">
      `;
    }

    // 5. 게시글 본문
    document.getElementById('post-content').textContent = post.content;

    // 6. 통계
    updateLikeButton(post.isLiked, post.likeCount);
    document.getElementById('view-count').textContent = formatCount(
      post.viewCount,
    );
    document.getElementById('comment-count').textContent = formatCount(
      post.commentCount,
    );
  } catch (error) {
    console.error('게시글 로드 실패:', error);
    alert('게시글을 불러오는 데 실패했습니다.');
    location.href = '/index.html';
  }
}

/** (Mock) 댓글 목록 렌더링 */
function renderComments(comments) {
  const commentList = document.getElementById('comment-list');
  if (!comments || comments.length === 0) {
    if (commentCurrentPage === 1) {
      // 첫 페이지인데 댓글이 없는 경우
      // commentList.innerHTML = '<li>등록된 댓글이 없습니다.</li>'; // 필요 시
    }
    isLastCommentPage = true; // 댓글이 더 없음
    document.getElementById('infinite-scroll-trigger').style.display = 'none';
    return;
  }

  const fragment = document.createDocumentFragment();
  comments.forEach((comment) => {
    const li = document.createElement('li');
    li.className = 'comment-item';
    li.id = `comment-${comment.id}`;

    // 본인 댓글일 경우 수정/삭제 버튼 추가
    const commentActions =
      comment.user.id === currentUserId
        ? `
      <div class="comment-actions">
        <button class="comment-action-btn edit-comment-btn" data-comment-id="${comment.id}">수정</button>
        <button class="comment-action-btn delete-comment-btn" data-comment-id="${comment.id}">삭제</button>
      </div>
    `
        : '';

    li.innerHTML = `
      <div class="comment-meta-wrapper">
        <div class="comment-meta">
          <img src="${
            comment.user.profileImageUrl || '/assets/images/default-profile.png'
          }" alt="${comment.user.nickname} 프로필" class="profile-img">
          <span class="nickname">${comment.user.nickname}</span>
          <span class="created-at">${comment.createdAt}</span>
        </div>
        ${commentActions}
      </div>
      <p class="comment-content" data-comment-content="${comment.id}">
        ${comment.content.replace(/\n/g, '<br>')}
      </p>
    `;
    fragment.appendChild(li);
  });
  commentList.appendChild(fragment);
}

/** (Mock) 댓글 목록 최초 로드 */
async function loadComments(id) {
  if (isCommentLoading || isLastCommentPage) return;
  isCommentLoading = true;
  console.log(`댓글 로드 중... (페이지: ${commentCurrentPage})`);

  try {
    // --- API 연결 시 활성화 ---
    // const response = await getComments(id, commentCurrentPage);
    // const comments = response.data.comments; // API 응답 구조에 맞게
    // renderComments(comments);
    // commentCurrentPage++;
    // isLastCommentPage = response.data.isLast;
    // ---

    // --- Mock Code (API 연결 시 삭제) ---
    // 첫 페이지만 Mock 데이터를 반환하고, 다음 페이지부터는 빈 배열 반환
    if (commentCurrentPage === 1) {
      renderComments(mockComments);
      commentCurrentPage++; // 다음 페이지로
    } else {
      console.log('Mock: 댓글 마지막 페이지');
      isLastCommentPage = true; // Mock: 마지막 페이지로 설정
      document.getElementById('infinite-scroll-trigger').style.display = 'none';
    }
    // ---
  } catch (error) {
    console.error('댓글 로드 실패:', error);
  } finally {
    isCommentLoading = false;
  }
}

// --- 이벤트 핸들러 ---

/** 좋아요 버튼 UI 업데이트 */
function updateLikeButton(isLiked, count) {
  const likeButton = document.getElementById('like-button');
  const likeCountSpan = document.getElementById('like-count');

  likeCountSpan.textContent = formatCount(count);
  if (isLiked) {
    likeButton.classList.add('active');
  } else {
    likeButton.classList.remove('active');
  }
}

/** 좋아요 버튼 클릭 핸들러 */
async function handleLikeClick() {
  const likeButton = document.getElementById('like-button');
  const likeCountSpan = document.getElementById('like-count');
  const isActive = likeButton.classList.contains('active');

  // 1. UI 즉시 업데이트 (지시사항 3)
  let currentCount =
    parseInt(
      likeCountSpan.textContent.replace('k', '') *
        (likeCountSpan.textContent.includes('k') ? 1000 : 1),
      10,
    ) || 0;

  const newCount = isActive ? currentCount - 1 : currentCount + 1;
  updateLikeButton(!isActive, newCount);

  // 2. API 호출 (API 연결 시)
  try {
    // --- API 연결 시 활성화 ---
    // await toggleLike(postId);
    // console.log('좋아요 API 호출 완료');
    // ---
    console.log('좋아요 API 호출 (Mock)');
  } catch (error) {
    console.error('좋아요 처리 실패:', error);
    // 실패 시 UI 롤백
    updateLikeButton(isActive, currentCount);
    alert('좋아요 처리에 실패했습니다.');
  }
}

/** 댓글 폼 입력 감지 핸들러 */
function handleCommentInput() {
  const commentInput = document.getElementById('comment-input');
  const submitButton = document.getElementById('comment-submit-button');
  submitButton.disabled = commentInput.value.trim().length === 0;
}

/** 댓글 폼 제출 (등록/수정) 핸들러 */
async function handleCommentSubmit(event) {
  event.preventDefault();
  const commentInput = document.getElementById('comment-input');
  const submitButton = document.getElementById('comment-submit-button');
  const content = commentInput.value.trim();

  if (!content) return;

  submitButton.disabled = true; // 중복 제출 방지

  try {
    if (isCommentEditMode) {
      // --- 5. 댓글 수정 로직 ---
      console.log(
        `(Mock) 댓글 수정: ${currentEditCommentId}, 내용: ${content}`,
      );

      // --- API 연결 시 활성화 ---
      // await updateComment(postId, currentEditCommentId, content);
      // ---

      // UI 업데이트
      const contentP = document.querySelector(
        `[data-comment-content="${currentEditCommentId}"]`,
      );
      if (contentP) {
        contentP.innerHTML = content.replace(/\n/g, '<br>');
      }
    } else {
      // --- 4. 댓글 등록 로직 ---
      console.log(`(Mock) 새 댓글 등록: ${content}`);
      // --- API 연결 시 활성화 ---
      // const response = await createComment(postId, content);
      // const newComment = response.data;
      // ---
      // --- Mock Code (API 연결 시 삭제) ---
      const newComment = {
        id: Math.floor(Math.random() * 1000) + 200,
        user: {
          id: currentUserId,
          nickname: '나 (방금 등록)',
          profileImageUrl: '/assets/images/default-profile.png',
        },
        content: content,
        createdAt: '방금 전',
      };
      // ---
      renderComments([newComment]); // 새 댓글 목록에 추가
    }

    // 폼 초기화
    resetCommentForm();
  } catch (error) {
    console.error('댓글 처리 실패:', error);
    alert('댓글 처리에 실패했습니다.');
  } finally {
    submitButton.disabled = false;
    handleCommentInput(); // 입력창 비웠으니 비활성화
  }
}

/** 댓글 폼 초기화 (수정 모드 해제) */
function resetCommentForm() {
  const commentInput = document.getElementById('comment-input');
  const submitButton = document.getElementById('comment-submit-button');

  commentInput.value = '';
  submitButton.textContent = '댓글 등록';
  submitButton.disabled = true;
  isCommentEditMode = false;
  currentEditCommentId = null;
}

/** 댓글 수정 버튼 클릭 핸들러 (이벤트 위임) */
function handleCommentEditClick(target) {
  const commentId = target.dataset.commentId;
  const contentP = document.querySelector(
    `[data-comment-content="${commentId}"]`,
  );
  if (!contentP) return;

  // contentP의 <br>을 \n으로 바꿔서 textarea에 넣어야 함
  const content = contentP.innerHTML.replace(/<br\s*\/?>/gi, '\n');

  const commentInput = document.getElementById('comment-input');
  const submitButton = document.getElementById('comment-submit-button');

  commentInput.value = content;
  submitButton.textContent = '댓글 수정'; // 5. 버튼 텍스트 변경
  submitButton.disabled = false;
  isCommentEditMode = true; // 5. 수정 모드 활성화
  currentEditCommentId = commentId;

  commentInput.focus(); // 입력창으로 포커스
}

/** 댓글 삭제 버튼 클릭 핸들러 (이벤트 위임) */
function handleCommentDeleteClick(target) {
  currentDeleteCommentId = target.dataset.commentId;
  openModal('comment-delete-modal'); // 5-1. 삭제 모달
}

/** (확인) 게시글 삭제 핸들러 */
async function handlePostDelete() {
  console.log(`(Mock) 게시글 삭제: ${postId}`);
  closeModal();

  try {
    // --- API 연결 시 활성화 ---
    // await deletePost(postId);
    // ---
    alert('게시글이 삭제되었습니다.');
    location.href = '/index.html';
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    alert('게시글 삭제에 실패했습니다.');
  }
}

/** (확인) 댓글 삭제 핸들러 */
async function handleCommentDelete() {
  if (!currentDeleteCommentId) return;

  console.log(`(Mock) 댓글 삭제: ${currentDeleteCommentId}`);
  closeModal();

  try {
    // --- API 연결 시 활성화 ---
    // await deleteComment(postId, currentDeleteCommentId);
    // ---

    // UI에서 댓글 삭제
    const commentLi = document.getElementById(
      `comment-${currentDeleteCommentId}`,
    );
    if (commentLi) {
      commentLi.remove();
    }
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    alert('댓글 삭제에 실패했습니다.');
  } finally {
    currentDeleteCommentId = null; // ID 초기화
  }
}

/** 게시글 수정 페이지로 이동 핸들러 */
function handlePostEdit() {
  location.href = `/pages/board/edit/index.html?id=${postId}`;
}

// --- 무한 스크롤 ---
function setupInfiniteScroll() {
  const trigger = document.getElementById('infinite-scroll-trigger');

  const observer = new IntersectionObserver(
    (entries) => {
      if (
        entries[0].isIntersecting &&
        !isCommentLoading &&
        !isLastCommentPage
      ) {
        loadComments(postId);
      }
    },
    { threshold: 0.1 },
  );

  observer.observe(trigger);
}

// --- 페이지 초기화 ---
document.addEventListener('DOMContentLoaded', async () => {
  // 1. URL에서 ID 파싱
  try {
    const urlParams = new URLSearchParams(window.location.search);
    postId = urlParams.get('id');
    if (!postId) {
      throw new Error('유효하지 않은 게시물 ID입니다.');
    }
  } catch (error) {
    console.error(error);
    alert(error.message);
    location.href = '/index.html'; // 목록으로
    return;
  }

  // 2. 헤더 로드
  try {
    await loadComponent('#header', '/components/header/index.html');
    initHeader({
      profile: true,
      backButton: true,
      backUrl: '/index.html', // 1. 목록 조회 페이지로
    });
  } catch (error) {
    console.error('헤더 로딩 중 에러 발생:', error);
  }

  // 3. DOM 요소 캐싱
  const likeButton = document.getElementById('like-button');
  const commentInput = document.getElementById('comment-input');
  const commentForm = document.getElementById('comment-form');
  const commentList = document.getElementById('comment-list');
  const postDeleteCancelBtn = document.getElementById('post-delete-cancel-btn');
  const postDeleteConfirmBtn = document.getElementById(
    'post-delete-confirm-btn',
  );
  const commentDeleteCancelBtn = document.getElementById(
    'comment-delete-cancel-btn',
  );
  const commentDeleteConfirmBtn = document.getElementById(
    'comment-delete-confirm-btn',
  );

  // 4. 이벤트 리스너 연결
  likeButton.addEventListener('click', handleLikeClick);
  commentInput.addEventListener('input', handleCommentInput);
  commentForm.addEventListener('submit', handleCommentSubmit);
  postDeleteCancelBtn.addEventListener('click', closeModal);
  commentDeleteCancelBtn.addEventListener('click', closeModal);
  postDeleteConfirmBtn.addEventListener('click', handlePostDelete);
  commentDeleteConfirmBtn.addEventListener('click', handleCommentDelete);

  // 5. 댓글 수정/삭제 이벤트 위임
  commentList.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('edit-comment-btn')) {
      handleCommentEditClick(target);
    }
    if (target.classList.contains('delete-comment-btn')) {
      handleCommentDeleteClick(target);
    }
  });

  // 6. 데이터 로드
  await loadPostDetail(postId);
  await loadComments(postId); // 첫 페이지 댓글 로드

  // 7. 무한 스크롤 설정
  setupInfiniteScroll();
});
