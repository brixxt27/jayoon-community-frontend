import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
import { getPosts } from '/apis/api.js';

// '게시물 목록' 페이지만을 위한 스크립트입니다.

// API 및 상태 관리
const LIMIT = 10;
let nextCursor = null; // 다음 페이지 커서 (API 응답으로 받음)
let isLoading = false; // 현재 로딩 중인지 확인

// DOM 요소
const postListContainer = document.getElementById('post-list-container');
const loader = document.getElementById('loader');
const createPostBtn = document.getElementById('create-post-btn');

/**
 * 1. 페이지 초기화
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadComponent('#header', '/components/header/index.html');
    initHeader({
      backButton: false,
    });
  } catch (error) {
    console.error('헤더 로딩 중 에러 발생:', error);
  }

  setupEventListeners();
  loadPosts(); // 첫 페이지 로드
});

/**
 * 2. 이벤트 리스너 설정
 */
function setupEventListeners() {
  // 글쓰기 버튼 클릭
  createPostBtn.addEventListener('click', () => {
    window.location.href = '/pages/board/create/index.html';
  });

  // 인피니티 스크롤
  window.addEventListener('scroll', handleScroll);

  // 카드 클릭 시 상세 페이지 이동 (이벤트 위임)
  postListContainer.addEventListener('click', (e) => {
    const postCard = e.target.closest('.post-card');
    if (postCard && postCard.dataset.postId) {
      const postId = postCard.dataset.postId;
      window.location.href = `/pages/board/detail/index.html?id=${postId}`;
    }
  });
}

/**
 * 3. 스크롤 이벤트 핸들러 (인피니티 스크롤)
 */
function handleScroll() {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
    !isLoading
  ) {
    if (nextCursor !== null) {
      loadPosts();
    }
  }
}

/**
 * 4. 게시물 목록 로드 (실제 API 호출)
 */
async function loadPosts() {
  if (isLoading) return;
  isLoading = true;
  loader.style.display = 'block';

  try {
    const responseData = await getPosts(nextCursor, LIMIT);

    const { posts, nextCursor: newNextCursor } = responseData.data;
    renderPostList(posts);
    nextCursor = newNextCursor;

    if (nextCursor === null) {
      console.log('모든 게시물을 로드했습니다.');
      window.removeEventListener('scroll', handleScroll);
    }
  } catch (error) {
    console.error('게시글 로딩 중 에러 발생:', error);
    if (postListContainer.children.length === 0) {
      postListContainer.innerHTML = `<p style="text-align: center; color: red;">게시글을 불러오는 중 오류가 발생했습니다.</p>`;
    }
    window.removeEventListener('scroll', handleScroll);
  } finally {
    isLoading = false;
    loader.style.display = 'none';
  }
}

/**
 * 5. 게시물 목록을 DOM에 렌더링
 * @param {Array} posts - API로부터 받은 게시물 배열
 */
function renderPostList(posts) {
  if (posts.length === 0 && postListContainer.children.length === 0) {
    postListContainer.innerHTML =
      '<p style="text-align: center;">표시할 게시물이 없습니다.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  posts.forEach((post) => {
    fragment.appendChild(createPostCard(post));
  });
  postListContainer.appendChild(fragment);
}

/**
 * 6. 개별 게시물 카드 DOM 생성
 * @param {Object} post - 게시물 데이터
 * @returns {HTMLElement} - 생성된 카드 엘리먼트
 */
function createPostCard(post) {
  const card = document.createElement('div');
  const DEFAULT_PROFILE_IMAGE = '/assets/images/default-profile.png';
  const profileImgSrc = post.user.profileImageUrl || DEFAULT_PROFILE_IMAGE;
  card.className = 'post-card';
  card.dataset.postId = post.id;

  card.innerHTML = `
    <div class="post-card-header">
      <h3 class="post-title" title="${post.title}">
        ${truncateTitle(post.title, 26)}
      </h3>
      <div class="post-stats">
        <span title="좋아요">
          <i class="icon like"></i> ${formatCount(post.likeCount)}
        </span>
        <span title="댓글">
          <i class="icon comment"></i> ${formatCount(post.commentCount)}
        </span>
        <span title="조회수">
          <i class="icon view"></i> ${formatCount(post.viewCount)}
        </span>
      </div>
    </div>
    <div class="post-card-footer">
      <div class="post-user-info">
              <img 
                src="${profileImgSrc}" 
                alt="${post.user.nickname} 프로필" 
                class="post-user-profile-img"
                onerror="this.src='${DEFAULT_PROFILE_IMAGE}'"
              >
       <span class="post-user">${post.user.nickname}</span>
            </div>
      <p class="post-date">${formatDate(post.createdAt)}</p>
    </div>
  `;
  return card;
}

// --- 7. 유틸리티 함수 ---

/**
 * 제목 ... 처리
 */
function truncateTitle(title, maxLength) {
  if (title.length > maxLength) {
    return title.substring(0, maxLength) + '...';
  }
  return title;
}

/**
 * 날짜 포맷팅
 */
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

/**
 * 숫자 포맷팅 (1k, 10k 등)
 */
function formatCount(num) {
  if (num >= 100000) {
    return (num / 1000).toFixed(0) + 'k';
  }
  if (num >= 10000) {
    return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k';
  }
  return String(num);
}
