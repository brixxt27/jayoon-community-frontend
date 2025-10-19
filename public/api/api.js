const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @description 로그인 API를 호출하는 함수
 * @param {string} email - 사용자 이메일
 * @param {string} password - 사용자 비밀번호
 * @returns {Promise<object>} API 응답 데이터 (성공 시)
 * @throws {Error} API 요청 실패 시 에러
 */
export const login = async (email, password) => {
  try {
    const response = await api.post("/auth", {
      email: email,
      password: password,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      // 서버로부터 받은 에러 메시지를 사용하여 새로운 에러를 발생시킵니다.
      // 이 에러는 login.js의 catch 블록에서 잡히게 됩니다.
      throw new Error(
        error.response.data.message || "알 수 없는 오류가 발생했습니다."
      );
    }
    throw new Error("서버와 통신할 수 없습니다.");
  }
};

// export const signup = async (userData) => { ... };
