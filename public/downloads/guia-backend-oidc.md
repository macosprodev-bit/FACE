# Passo a passo: backend próprio e OAuth/OIDC seguro

**Status:** preparação apenas. Não implementado, instalado, conectado a provedor ou executado. A extensão continua offline, com a CSP atual e sem histórico real. Comandos são exemplos documentais para uso após aprovar provedor, domínio e arquitetura.

## 1. Feche os pré-requisitos e o limite

1. Escolha um **provedor sandbox** e leia o contrato atual de discovery, endpoints, JWKS, claims, logout, scopes e erros. Cadastre uma aplicação web **confidential** para o BFF, nunca para o popup, separando `dev` e `prod`.
2. Use um BFF Node.js em ESM e escolha uma linha LTS **ainda em suporte**, compatível com a versão aprovada do SDK. O `openid-client` v6 documenta Node.js 20.x como baseline técnico; esse mínimo não é recomendação de segurança nem garantia de suporte atual. [1]
3. Não escreva cliente OAuth/JWT próprio. Use biblioteca OIDC mantida, `express`, `express-session`, adaptador Redis compatível e `redis`; revise changelogs, licença, advisories e lock. Exemplo não executado:

```sh
npm view openid-client version engines dist-tags --json
npm install openid-client@latest express@latest express-session@latest connect-redis@latest redis@latest
# revisar package.json, package-lock.json, advisories e documentação do adaptador
npm ci
```

Não transforme `npm view` em versão fixa inventada. O lockfile aprovado é a fonte do build; `npm ci` só entra no pipeline após revisão.

## 2. Registre o provedor e os redirects

4. Defina `OIDC_ISSUER` como a URL HTTPS exata do issuer sandbox e mantenha uma allowlist por ambiente. Compare a string inteira, sem normalizar host, caminho, query ou fragmento de modo permissivo. Não aceite issuer vindo do navegador.
5. Registre redirects completos e distintos, por exemplo um callback HTTPS de dev e outro de prod, com domínios allowlisted e **sem curinga**. O servidor deve comparar o redirect usado com o valor registrado exatamente; RFC 9700 também exige matching exato e proíbe open redirectors. [3]
6. Use Authorization Code + PKCE `S256`, mesmo sendo cliente confidential. Solicite somente `openid` e claims estritamente necessárias ao contrato. Não inclua `offline_access` por padrão. Não peça `profile`, `email` ou refresh token sem finalidade aprovada.

## 3. Provisione o BFF e o cofre

7. Reserve domínio HTTPS, TLS e proxy reverso confiável para o BFF. Confie somente nos headers desse proxy. Use Redis persistente, controlado e isolado por ambiente, com key-prefix dedicado; sessão e transações pendentes ficam no servidor. URL, segredo e chaves ficam no cofre; `SECRET_REF` é referência, não credencial.
8. O modelo documental de configuração é o seguinte. Não o salve como `.env` com valores reais, não o empacote e não coloque tokens ou segredos em texto puro:

```dotenv
OIDC_ISSUER=https://PLACEHOLDER-issuer-sandbox.example
OIDC_CLIENT_ID=PLACEHOLDER-client-id
SECRET_REF=cofre://PLACEHOLDER/oidc-client-secret
OIDC_REDIRECT_URI=https://PLACEHOLDER-bff-dev.example/oidc/callback
APP_ORIGIN=https://PLACEHOLDER-app-dev.example
SESSION_STORE_URL=SECRET_REF://PLACEHOLDER/redis-url
STATE_TTL_SECONDS=PLACEHOLDER_STATE_TTL
SESSION_IDLE_TTL_SECONDS=PLACEHOLDER_SESSION_IDLE_TTL
SESSION_ABSOLUTE_TTL_SECONDS=PLACEHOLDER_SESSION_ABSOLUTE_TTL
```

Escolha e registre TTLs de `state` e sessão conforme risco e usabilidade; placeholders não são valores legais ou universais. Configure TTL, prefixo e rotação conforme as versões atuais, sem adivinhar a API do adaptador.

## 4. Implemente o fluxo no servidor, não na extensão

9. `GET /login` só pode ser iniciado por ação manual na página HTTPS first-party. Gere, com o SDK, `state`, `nonce`, `code_verifier` e challenge `S256` novos a cada tentativa. Guarde-os server-side, associados à sessão e ao redirect exato, com TTL curto e uso único. A extensão não coleta senha nem recebe client secret.
10. Redirecione somente ao authorization endpoint descoberto do issuer allowlisted. Não aceite `return_to`, issuer, endpoint ou redirect arbitrário. O README mostra `randomPKCECodeVerifier`, challenge `S256` e armazenamento do verifier até o callback. [1]
11. `GET /oidc/callback` deve reconstruir a URL pela requisição e proxy confiável, nunca por parâmetro. Antes de consumir o estado, confira correlação com sessão, issuer/redirect esperados e resposta plausível. No sucesso, exija `state` e `code`; não destrua transação legítima com request falso que só fornece `state`. Então consuma atomicamente (`GETDEL` quando suportado, ou transação equivalente documentada pelo store) e rejeite duplicatas.
12. Troque o código usando a API do SDK, sem montar token request ou validar JWT manualmente. O contrato atual de `authorizationCodeGrant` recebe a URL atual e suporta `pkceCodeVerifier`, `expectedState` e `expectedNonce`; deixe o SDK rejeitar qualquer falha. [2] Exija discovery/JWKS do issuer exato e rejeite issuer, `aud`, algoritmo de assinatura, `exp`, nonce ou assinatura inválidos. Nunca aceite JWT ou claims originados pelo popup.
13. Exija ID Token e claims esperadas validados pelo SDK para o fluxo OIDC. Se estiverem ausentes ou inválidos, não crie sessão. Vincule o par (`iss`, `sub`) a usuário e tenant autorizados, não apenas um `sub` global; regenere a sessão contra fixation. Cookie: `HttpOnly; Secure; SameSite=Lax`, nome `__Host-...`, `Path=/`, sem `Domain` quando possível. `Lax` é compatível com callback top-level GET; opção cross-site exige revisão, `Secure` e CSRF adicional. OWASP exige expiração e invalidação server-side; `SameSite` não substitui CSRF. [4]
14. Proteja `POST /logout` com token CSRF e verificação de origem apropriada; invalide a sessão no Redis, limpe o cookie e, se o provedor documentar, execute o logout oficial. `GET /status` informa apenas estado autenticado; `GET /me` retorna identidade mínima/opaca autorizada; nenhum deles retorna token.

## 5. Contrato HTTP mínimo (proposto, não implementado)

- `GET /login` → `302` para o provedor allowlisted; nunca inclui segredo.
- `GET /oidc/callback?code=...&state=...` → em sucesso, `303` para `APP_ORIGIN`; em falha, resposta genérica sem criar sessão.
- `GET /status` → `200` com `{"authenticated":false}` ou estado verdadeiro sem credenciais.
- `GET /me` → `401` sem sessão; com sessão, somente identificadores opacos e tenant autorizado.
- `POST /logout` → exige CSRF, invalida server-side e responde `204` sem tokens.

Em login, callback e erro use `Cache-Control: no-store` e `Referrer-Policy: no-referrer`. Logs sanitizados não devem gravar query, código, state, nonce, verifier, token, segredo, sessão ou PII; configure o proxy para não registrar a query sensível.

## 6. Facial/liveness e histórico são fluxos separados

Não trate login como verificação facial. Se o provedor oferecer facial/liveness, use a página oficial e a câmera oficial somente após consentimento e capacidade documentada; não altere streams nem a CSP da extensão. O webhook deve seguir exatamente a assinatura, material bruto, timestamp, rotação de chave, idempotência e estados documentados pelo provedor; não assuma um HMAC universal. `pending`, `failed`, `canceled` e desconhecido nunca são sucesso.

Separe o schema por usuário/tenant e guarde apenas `opaque_id`, `provider_allowed_label`, `confirmed_at` e `event_type`. Mantenha `auth_success` e `facial_verification_success` como eventos distintos. Opaque ID reduz exposição, mas não é garantia de irreversibilidade. Defina retenção, exclusão por tenant/data e expurgo de backups antes do cadastro real; nunca armazene token, código, senha, imagem, vídeo, biometria ou CPF.

A extensão não lê esse histórico automaticamente. Uma futura view real exigirá sessão/canal autorizado e política de origem própria; não basta iframe com cookie do BFF nem campo/URL digitado no popup. Até lá, a abertura da página oficial é manual e a extensão permanece inalterada.

## 7. Testes sandbox antes de qualquer produção

Em perfil e contas sintéticas, teste: replay, ausência e expiração de `state`; sessão incorreta; PKCE ausente, downgrade e verifier errado; redirect alterado; JWKS, issuer, `aud`, assinatura, algoritmo, `exp` e nonce inválidos; código duplicado; tenant não autorizado; eventos duplicados, sem assinatura, fora de ordem, `pending` e `failed`; ausência de histórico em falha; logout, TTL idle/absolute, rotação de sessão e logs sem segredos. Confirme que a extensão continua sem rede automática, câmera, upload, token ou histórico real. **Testes não executados neste guia.**

## Pendências que bloqueiam a implementação

Faltam provedor sandbox e documentação, issuer/endpoints/JWKS, client metadata, scopes/claims, redirects e domínios HTTPS, contrato de logout e webhook, assinatura/rotação/idempotência, cofre, política de sessão/CSRF, tenant mapping, finalidade, operadores, retenção/exclusão, backups, aviso de privacidade, revisão LGPD e aprovação de segurança. Sem esses dados, o BFF não deve ser instalado, conectado ou publicado.

## Referências

[1]: https://github.com/panva/openid-client "panva/openid-client: OAuth 2 / OpenID Connect Client API e suporte de runtime"
[2]: https://github.com/panva/openid-client/blob/main/docs/functions/authorizationCodeGrant.md "openid-client: função authorizationCodeGrant e checks de callback"
[3]: https://www.rfc-editor.org/rfc/rfc9700.html "RFC 9700: Best Current Practice for OAuth 2.0 Security"
[4]: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html "OWASP Session Management Cheat Sheet"
