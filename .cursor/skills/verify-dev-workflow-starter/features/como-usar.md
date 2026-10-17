# Como usar

Seção 12, `#usar`. Seis passos do template ao preview, mais o snippet com
`AWS_ROLE_ARN`.

## Sub-features

- Lista ordenada de 6 itens: gerar repo, devcontainer, PR, variável, merge,
  fechar o PR.
- `<pre><code>` com `npm ci`, `npm run dev` e `gh variable set AWS_ROLE_ARN`.
- Nota de inércia: nada na AWS sem a variável.

## How to get to it (user POV)

1. Clicar **Como usar** ou **Usar template →** no menu.
2. Ou `#usar` na URL.
3. O botão **Começar agora** do hero também aponta para `#usar`.

## Driving it with Playwright

```js
await page.goto("./#usar");
const secao = page.getByRole("region", { name: "Como usar" });
await expect(secao.locator("ol > li")).toHaveCount(6);
await expect(secao.getByText("AWS_ROLE_ARN")).toBeVisible();
await expect(secao.getByText("Nada é criado na AWS")).toBeVisible();
```

`drive.mjs usar` cobre a contagem e a variável. `App.test.tsx` confere que o
snippet e o YAML leem `vars.AWS_ROLE_ARN`, não um secret.

## Gotchas

- O id é `#usar`, o rótulo da região é **Como usar**. Não procure `#como-usar`.
- Há dois links `#usar` na nav (lista + botão). O teste de hrefs espera os dois.
- Não dispare o workflow `novo-projeto` nem grave `AWS_ROLE_ARN` como parte da
  verificação desta superfície — isso cria recurso. A prova aqui é o texto e o
  YAML.
