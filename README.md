# 3dwebmarket
3d web marketplace

## Security notes

- This is a static/demo project. Several admin features are implemented client-side for convenience only.
- Do NOT treat the client-side admin as secure: credentials in `assets/js/admin-auth.js` are hard-coded and only provide obscurity.
- GitHub personal access tokens used by the admin UI are now stored in `sessionStorage` (not `localStorage`) to reduce persistence, but storing secrets in the browser is still risky. Use a backend + OAuth or server-side storage for production.
- The codebase now includes basic XSS mitigations (HTML escaping in templates) and a Content-Security-Policy meta tag in the HTML entry points. Review and harden CSP in your deployment environment.


