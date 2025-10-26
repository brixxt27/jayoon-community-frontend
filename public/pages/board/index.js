import { loadComponent } from '/utils/loadComponent.js';
import { initHeader } from '/components/header/index.js';
// /pages/board/index.js
// '게시물 목록' 페이지만을 위한 스크립트입니다.

// API 및 상태 관리
const API_BASE_URL = '/posts'; // API 명세서 기준
const LIMIT = 10;
let nextCursor = null; // 다음 페이지 커서 (API 응답으로 받음)
let isLoading = false; // 현재 로딩 중인지 확인

// --- 더미 데이터 (자윤님 요청) ---
const USE_DUMMY_DATA = true;
const DUMMY_POSTS_PAGE_1 = {
  success: true,
  message: null,
  data: {
    posts: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `더미 게시글 제목 ${i + 1}입니다. 이 제목은 꽤 깁니다.`,
      likeCount: (i + 1) * 150, // 1k 포맷팅 테스트용
      commentCount: (i + 1) * 5,
      viewCount: (i + 1) * 11000, // 10k, 100k 포맷팅 테스트용
      createdAt: new Date(Date.now() - (10 - i) * 3600000).toISOString(), // 최근 시간부터
      user: {
        id: 100 + i,
        nickname: `더미유저${i + 1}`,
        profileImageUrl: null,
        profileImageUrl:
          i % 2 === 0
            ? `https://placehold.co/40x40/EFEFEF/333333?text=U${i + 1}`
            : null,
      },
    })),
    nextCursor: 10, // 다음 커서는 마지막 게시글 id 10
  },
  error: null,
};
const DUMMY_POSTS_PAGE_2 = {
  success: true,
  message: null,
  data: {
    posts: Array.from({ length: 10 }, (_, i) => ({
      id: i + 11,
      title: `두 번째 페이지 게시글 ${i + 11}`,
      likeCount: i * 5,
      commentCount: i * 2,
      viewCount: i * 150,
      createdAt: new Date(Date.now() - (20 - i) * 7200000).toISOString(),
      user: {
        id: 200 + i,
        nickname: `더미유저${i + 11}`,
        profileImageUrl: `https://placehold.co/40x40/EFEFEF/333333?text=U${
          i + 11
        }`,
      },
    })),
    nextCursor: 20, // 마지막 id 20
  },
  error: null,
};
const DUMMY_POSTS_PAGE_3 = {
  success: true,
  message: null,
  data: {
    posts: [], // 데이터 없음
    nextCursor: null, // 마지막 페이지
  },
  error: null,
};
// --- 더미 데이터 끝 ---

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
      profile: true,
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
  // 지시사항 1: 글쓰기 버튼 클릭
  createPostBtn.addEventListener('click', () => {
    // 경로: /pages/board/create/index.html (절대 경로)
    window.location.href = '/pages/board/create/index.html';
  });

  // 지시사항 3: 인피니티 스크롤
  window.addEventListener('scroll', handleScroll);

  // 지시사항: 카드 클릭 시 상세 페이지 이동 (이벤트 위임)
  postListContainer.addEventListener('click', (e) => {
    const postCard = e.target.closest('.post-card');
    if (postCard && postCard.dataset.postId) {
      const postId = postCard.dataset.postId;
      // 경로: /pages/board/detail/index.html (절대 경로)
      window.location.href = `/pages/board/detail/index.html?id=${postId}`;
    }
  });
}

/**
 * 3. 스크롤 이벤트 핸들러 (인피니티 스크롤)
 */
function handleScroll() {
  // (창 높이 + 스크롤 위치) >= (문서 전체 높이 - 버퍼)
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
    !isLoading
  ) {
    if (nextCursor !== null) {
      // 더 이상 불러올 데이터가 없으면 실행 안 함
      loadPosts();
    } else {
      // 모든 데이터를 로드했으면 스크롤 이벤트 리스너 제거 (선택 사항)
      // window.removeEventListener('scroll', handleScroll);
      // console.log("모든 게시물을 로드했습니다.");
    }
  }
}

/**
 * 4. 게시물 목록 로드 (API 호출)
 */
async function loadPosts() {
  if (isLoading) return;
  isLoading = true;
  loader.style.display = 'block';

  try {
    let responseData;

    // --- API 호출 로직 ---
    if (USE_DUMMY_DATA) {
      // 더미 데이터 사용
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 딜레이
      if (nextCursor === null) {
        responseData = DUMMY_POSTS_PAGE_1;
      } else if (nextCursor === 10) {
        responseData = DUMMY_POSTS_PAGE_2;
      } else {
        responseData = DUMMY_POSTS_PAGE_3;
      }
    } else {
      // 실제 API 호출 (나중에 주석 해제하여 사용)
      // const url = new URL(API_BASE_URL, window.location.origin);
      // url.searchParams.append('limit', LIMIT);
      // if (nextCursor) {
      //     url.searchParams.append('cursor', nextCursor);
      // }
      // const response = await fetch(url, {
      //     method: 'GET',
      //     headers: {
      //         // 'Authorization': 'Bearer ' + localStorage.getItem('accessToken') // 로그인 구현 후
      //     }
      // });
      // if (!response.ok) {
      //     throw new Error(`API Error: ${response.statusText}`);
      // }
      // responseData = await response.json();
    }
    // --- API 호출 로직 끝 ---

    if (responseData.success) {
      const { posts, nextCursor: newNextCursor } = responseData.data;
      renderPostList(posts);
      nextCursor = newNextCursor; // 다음 커서 업데이트

      if (nextCursor === null) {
        loader.style.display = 'none'; // 더 이상 로드할 게 없으면 로더 숨김
        window.removeEventListener('scroll', handleScroll); // 스크롤 이벤트 제거
      }
    } else {
      throw new Error(
        responseData.message || '게시물을 불러오는데 실패했습니다.',
      );
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    postListContainer.innerHTML += `<p style="text-align: center; color: red;">${error.message}</p>`;
  } finally {
    isLoading = false;
    if (nextCursor !== null) {
      // 아직 더 있다면 로더 숨김 (다음 스크롤까지)
      loader.style.display = 'none';
    }
  }
}

/**
 * 5. 게시물 목록을 DOM에 렌더링
 * @param {Array} posts - API로부터 받은 게시물 배열
 */
function renderPostList(posts) {
  if (
    posts.length === 0 &&
    nextCursor === null &&
    postListContainer.children.length === 0
  ) {
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
  card.dataset.postId = post.id; // 상세 페이지 이동을 위한 ID

  // 지시사항 2, 4, 5, 7, 8 적용
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
 * 지시사항 2: 제목 26자 이상일 때 ... 처리
 * @param {string} title
 * @param {number} maxLength
 * @returns {string}
 */
function truncateTitle(title, maxLength) {
  if (title.length > maxLength) {
    return title.substring(0, maxLength) + '...';
  }
  return title;
}

/**
 * 지시사항 4: 날짜 yyyy-mm-dd hh:mm:ss 형식으로 표기
 * @param {string} dateString - ISO 8601 형식 (e.g., "1997-01-01T00:00:00.000Z")
 * @returns {string}
 */
function formatDate(dateString) {
  const date = new Date(dateString);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작
  const dd = String(date.getDate()).padStart(2, '0');

  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

/**
 * 지시사항 5: 1,000 이상일 때 1k, 10k, 100k로 표기
 * @param {number} num
 * @returns {string}
 */
function formatCount(num) {
  if (num >= 100000) {
    // 100k
    return (num / 1000).toFixed(0) + 'k'; // 100,000 -> 100k
  }
  if (num >= 10000) {
    // 10k
    return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k'; // 10,500 -> 10.5k
  }
  if (num >= 1000) {
    // 1k
    return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k'; // 1,200 -> 1.2k
  }
  return String(num); // 999 이하
}
