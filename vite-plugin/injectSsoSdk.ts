import { Plugin } from 'vite'

// 自定义插件：注入 SSO SDK，绕过 base 路径
export function injectSsoSdk(): Plugin {
  return {
    name: 'inject-sso-sdk',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        '    <script src="/net/Content/Resource/SDK/bw.sso.sdk.js"></script>\n  </head>'
      );
    },
  };
}
