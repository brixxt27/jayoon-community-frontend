import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
import {
  getPostDetail,
  getComments,
  deletePost,
  likePost,
  unlikePost,
  createComment,
  updateComment,
  deleteComment,
} from '/apis/api.js';

// --- 전역 상태 변수 ---
let postId = null;
let isCommentEditMode = false;
let currentEditCommentId = null;
let currentDeleteCommentId = null;
let commentNextCursor = null;
let isCommentLoading = false;

// --- 유틸리티 함수 ---

function formatCount(num) {
  if (num >= 100000) return (num / 1000).toFixed(0) + 'k';
  if (num >= 10000) return (num / 1000).toFixed(0) + 'k';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(num);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function openModal(modalId) {
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modal = document.getElementById(modalId);
  if (!modalBackdrop || !modal) return;
  document
    .querySelectorAll('.modal-content')
    .forEach((m) => (m.style.display = 'none'));
  modal.style.display = 'block';
  modalBackdrop.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modalBackdrop = document.getElementById('modal-backdrop');
  if (!modalBackdrop) return;
  modalBackdrop.classList.remove('visible');
  document.body.style.overflow = '';
  currentDeleteCommentId = null;
}

// --- 데이터 로드 및 렌더링 ---

async function loadPostAndRender(id) {

  try {

    const post = (await getPostDetail(id)).data;



    document.getElementById('post-title').textContent = post.title;

    const metaContainer = document.getElementById('post-meta');
    metaContainer.innerHTML = `
      <img src="${post.user.profileImageUrl || '/assets/images/default-profile.png'}" alt="${post.user.nickname} 프로필" class="profile-img">
      <span class="nickname">${post.user.nickname}</span>
      <span class="created-at">${formatDate(post.createdAt)}</span>
    `;

    if (post.isAuthor) {
      const actionsContainer = document.getElementById(
        'post-actions-container',
      );
      actionsContainer.innerHTML = `
        <button class="post-action-btn" id="edit-post-btn">수정</button>
        <button class="post-action-btn" id="delete-post-btn">삭제</button>
      `;
      document
        .getElementById('edit-post-btn')
        .addEventListener('click', handlePostEdit);
      document
        .getElementById('delete-post-btn')
        .addEventListener('click', () => openModal('post-delete-modal'));
    }

    if (post.imageUrls && post.imageUrls.length > 0) {
      const imageWrapper = document.getElementById('post-image-wrapper');
      imageWrapper.innerHTML = post.imageUrls
        .map((url) => `<img src="${url}" alt="게시글 이미지">`)
        .join('');
    }

    document.getElementById('post-content').textContent = post.body;
    updateLikeButton(post.isLiked, post.likeCount);
    document.getElementById('view-count').textContent = formatCount(
      post.viewCount,
    );
    document.getElementById('comment-count').textContent = formatCount(
      post.commentCount,
    );
  } catch (error) {
    console.error('게시글 로드 실패:', error);
    // alert('게시글을 불러오는 데 실패했습니다.');
    // window.location.href = '/';
  }
}

function createCommentElement(comment) {
  const li = document.createElement('li');
  li.className = 'comment-item';
  li.id = `comment-${comment.id}`;

  const commentActions = comment.isAuthor
    ? `<div class="comment-actions">
        <button class="comment-action-btn edit-comment-btn" data-comment-id="${comment.id}">수정</button>
        <button class="comment-action-btn delete-comment-btn" data-comment-id="${comment.id}">삭제</button>
      </div>`
    : '';

  li.innerHTML = `
    <div class="comment-meta-wrapper">
      <div class="comment-meta">
        <img src="${comment.user.profileImageUrl || '/assets/images/default-profile.png'}" alt="${comment.user.nickname} 프로필" class="profile-img">
        <span class="nickname">${comment.user.nickname}</span>
        <span class="created-at">${formatDate(comment.createdAt)}</span>
      </div>
      ${commentActions}
    </div>
    <p class="comment-content" data-comment-content="${comment.id}">${comment.body.replace(/\n/g, '<br>')}</p>
  `;
  return li;
}

function renderComments(comments, append = true) {
  const commentList = document.getElementById('comment-list');
  const trigger = document.getElementById('infinite-scroll-trigger');

  if (!comments || comments.length === 0) {
    if (commentNextCursor === null && commentList.children.length === 0) {
      // No message needed, just hide trigger
    }
    trigger.style.display = 'none';
    return;
  }

  const fragment = document.createDocumentFragment();
  comments.forEach((comment) =>
    fragment.appendChild(createCommentElement(comment)),
  );

  if (append) {
    commentList.appendChild(fragment);
  } else {
    commentList.prepend(fragment);
  }
}

async function loadCommentsAndRender(id) {
  if (
    isCommentLoading ||
    (commentNextCursor === null && commentNextCursor !== undefined)
  )
    return;
  isCommentLoading = true;
  try {
    const response = await getComments(id, commentNextCursor);
    renderComments(response.comments);
    commentNextCursor = response.nextCursor;
    if (commentNextCursor === null) {
      document.getElementById('infinite-scroll-trigger').style.display = 'none';
    }
  } catch (error) {
    console.error('댓글 로드 실패:', error);
  } finally {
    isCommentLoading = false;
  }
}

// --- 이벤트 핸들러 ---

function updateLikeButton(isLiked, count) {
  const likeButton = document.getElementById('like-button');
  const likeCountSpan = document.getElementById('like-count');
  likeCountSpan.textContent = formatCount(count);
  likeCountSpan.dataset.rawCount = count;
  likeButton.classList.toggle('active', isLiked);
}

async function handleLikeClick() {
  const likeButton = document.getElementById('like-button');
  const isLiked = likeButton.classList.contains('active');
  const originalCount = parseInt(
    likeButton.nextElementSibling.dataset.rawCount || '0',
  );
  const newLikedState = !isLiked;
  updateLikeButton(
    newLikedState,
    newLikedState ? originalCount + 1 : originalCount - 1,
  );
  try {
    const response = newLikedState
      ? await likePost(postId)
      : await unlikePost(postId);
    updateLikeButton(newLikedState, response.likeCount);
  } catch (error) {
    console.error('좋아요 처리 실패:', error);
    updateLikeButton(isLiked, originalCount);
    alert('좋아요 처리에 실패했습니다.');
  }
}

function handleCommentInput() {
  const commentInput = document.getElementById('comment-input');
  const submitButton = document.getElementById('comment-submit-button');
  submitButton.disabled = commentInput.value.trim().length === 0;
}

async function handleCommentSubmit(event) {
  event.preventDefault();
  const commentInput = document.getElementById('comment-input');
  const submitButton = document.getElementById('comment-submit-button');
  const content = commentInput.value.trim();
  if (!content) return;

  submitButton.disabled = true;

  try {
    if (isCommentEditMode) {
      const updatedComment = (await updateComment(postId, currentEditCommentId, content)).data;
      const commentContentP = document.querySelector(`[data-comment-content="${currentEditCommentId}"]`);
      if (commentContentP) {
        commentContentP.innerHTML = updatedComment.body.replace(/\n/g, '<br>');
      }
    } else {
      const newComment = (await createComment(postId, content)).data;
      renderComments([newComment], false); // Prepend new comment
      const commentCountSpan = document.getElementById('comment-count');
      const currentCount = parseInt(commentCountSpan.dataset.rawCount || '0');
      commentCountSpan.textContent = formatCount(currentCount + 1);
      commentCountSpan.dataset.rawCount = currentCount + 1;
    }
    resetCommentForm();
  } catch (error) {
    console.error('댓글 처리 실패:', error);
    alert(`댓글 처리에 실패했습니다: ${error.message}`);
  } finally {
    submitButton.disabled = false;
    handleCommentInput();
  }
}

function resetCommentForm() {
  const commentInput = document.getElementById('comment-input');
  const submitButton = document.getElementById('comment-submit-button');
  commentInput.value = '';
  submitButton.textContent = '댓글 등록';
  submitButton.disabled = true;
  isCommentEditMode = false;
  currentEditCommentId = null;
}

function handleCommentEditClick(target) {
  const commentId = target.dataset.commentId;
  const contentP = document.querySelector(
    `[data-comment-content="${commentId}"]`,
  );
  if (!contentP) return;

  const content = contentP.innerHTML.replace(/<br\s*\/?>/gi, '\n');
  const commentInput = document.getElementById('comment-input');
  const submitButton = document.getElementById('comment-submit-button');

  commentInput.value = content;
  submitButton.textContent = '댓글 수정';
  submitButton.disabled = false;
  isCommentEditMode = true;
  currentEditCommentId = commentId;
  commentInput.focus();
}

function handleCommentDeleteClick(target) {
  currentDeleteCommentId = target.dataset.commentId;
  openModal('comment-delete-modal');
}

async function handlePostDelete() {
  closeModal();
  try {
    await deletePost(postId);
    alert('게시글이 성공적으로 삭제되었습니다.');
    window.location.href = '/';
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    alert(`게시글 삭제에 실패했습니다: ${error.message}`);
  }
}

async function handleCommentDelete() {
  if (!currentDeleteCommentId) return;
  closeModal();
  try {
    await deleteComment(postId, currentDeleteCommentId);
    const commentLi = document.getElementById(
      `comment-${currentDeleteCommentId}`,
    );
    if (commentLi) commentLi.remove();

    const commentCountSpan = document.getElementById('comment-count');
    const currentCount = parseInt(commentCountSpan.dataset.rawCount || '1');
    commentCountSpan.textContent = formatCount(currentCount - 1);
    commentCountSpan.dataset.rawCount = currentCount - 1;
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    alert(`댓글 삭제에 실패했습니다: ${error.message}`);
  } finally {
    currentDeleteCommentId = null;
  }
}

function handlePostEdit() {
  location.href = `/pages/board/edit/index.html?id=${postId}`;
}

function setupInfiniteScroll() {
  const trigger = document.getElementById('infinite-scroll-trigger');
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isCommentLoading) {
        loadCommentsAndRender(postId);
      }
    },
    { threshold: 0.1 },
  );
  observer.observe(trigger);
}

// --- 페이지 초기화 ---
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    postId = urlParams.get('id');
    if (!postId) throw new Error('유효하지 않은 게시물 ID입니다.');
  } catch (error) {
    alert(error.message);
    return (window.location.href = '/');
  }

  try {
    await loadComponent('#header', '/components/header/index.html');
    initHeader({ backButton: true, backUrl: '/' });
  } catch (error) {
    console.error('헤더 로딩 중 에러 발생:', error);
  }

  document
    .getElementById('like-button')
    .addEventListener('click', handleLikeClick);
  document
    .getElementById('comment-input')
    .addEventListener('input', handleCommentInput);
  document
    .getElementById('comment-form')
    .addEventListener('submit', handleCommentSubmit);
  document
    .getElementById('post-delete-cancel-btn')
    .addEventListener('click', closeModal);
  document
    .getElementById('comment-delete-cancel-btn')
    .addEventListener('click', closeModal);
  document
    .getElementById('post-delete-confirm-btn')
    .addEventListener('click', handlePostDelete);
  document
    .getElementById('comment-delete-confirm-btn')
    .addEventListener('click', handleCommentDelete);
  document.getElementById('comment-list').addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('edit-comment-btn'))
      handleCommentEditClick(target);
    if (target.classList.contains('delete-comment-btn'))
      handleCommentDeleteClick(target);
  });

  commentNextCursor = undefined;
  await loadPostAndRender(postId);
  await loadCommentsAndRender(postId);
  setupInfiniteScroll();
});
