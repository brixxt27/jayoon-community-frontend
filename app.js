const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {
  console.log(
    `[Express] 프론트엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`,
  );
  console.log(`[Express] 정적 파일 루트: ${path.join(__dirname, 'public')}`);
});
