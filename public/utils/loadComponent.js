/**
 * 지정된 HTML 파일을 불러와서 DOM의 특정 셀렉터에 삽입합니다.
 * @param {string} selector - HTML을 삽입할 DOM 셀렉터 (e.g., '#header-placeholder')
 * @param {string} url - 불러올 HTML 파일의 경로 (e.g., '/components/header/index.html')
 * @returns {Promise<HTMLElement>} 삽입된 컴포넌트의 DOM 요소를 반환합니다.
 */
export async function loadComponent(selector, url) {
  const targetElement = document.querySelector(selector);
  if (!targetElement) {
    console.error(`Error: Target element '${selector}' not found.`);
    return null;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch component : ${response.status} ${response.statusText}`,
      );
    }
    const html = await response.text();
    targetElement.innerHTML = html;

    // 삽입된 실제 컴포넌트 요소 반환(예: <header> 요소)
    return targetElement.firstElementChild;
  } catch (error) {
    console.error(`Error loading component from ${url}:`, error);
    targetElement.innerHTML = `<p>Error loading component.</p>`;
    return null;
  }
}
