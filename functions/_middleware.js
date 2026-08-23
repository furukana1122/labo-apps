export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // Cookieから認証情報を確認
  const cookie = request.headers.get('Cookie') || '';
  if (cookie.includes('authenticated=true')) {
    return await next();
  }

  // POST送信（パスワード入力時）の処理
  if (request.method === 'POST') {
    const formData = await request.formData();
    const password = formData.get('password');

    // 環境変数に設定したパスワードと照合
    if (password === env.BASIC_PASS) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': url.pathname,
          'Set-Cookie': 'authenticated=true; Path=/; HttpOnly; Secure; SameSite=Strict'
        }
      });
    }
    
    // パスワードが違う場合
    return new Response(renderLoginForm('パスワードが違います。'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // 未認証の場合、ログイン画面を表示
  return new Response(renderLoginForm(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function renderLoginForm(error = '') {
  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>パスワード保護</title>
      <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
        .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 320px; }
        input[type="password"] { width: 100%; padding: 10px; margin: 10px 0; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #0051c3; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .error { color: red; font-size: 0.9rem; }
      </style>
    </head>
    <body>
      <div class="card">
        <h3>パスワードを入力</h3>
        ${error ? `<p class="error">${error}</p>` : ''}
        <form method="POST">
          <input type="password" name="password" placeholder="パスワード" required>
          <button type="submit">送信</button>
        </form>
      </div>
    </body>
    </html>
  `;
}