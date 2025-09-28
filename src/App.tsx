// App.tsx
import { useEffect, useState } from 'react'
import { initAuthListener, onAuthReady } from './utils/authState'
import Router from './routers/Router'

function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    console.log('🔍 App.tsx initAuthListener 호출');
    initAuthListener();
    const unsubscribe = onAuthReady((ready) => {
      console.log('🔍 App.tsx onAuthReady 콜백:', ready);
      setAuthReady(ready);
    });
    return unsubscribe;
  }, []);

  console.log('🔍 App.tsx authReady:', authReady);

  // auth 준비 안 됐으면 로딩 화면
  if (!authReady) {
    return <div>Loading...</div>;
  }

  // auth 준비되면 Router 렌더링 -> 이게 라우팅 시작점
  return <Router />;
}

export default App;