# Tabuada Divertida

[![Website](https://img.shields.io/website-up-down-green-red/http/shields.io.svg?label=site&url=https://www.tabuadadivertida.com/)](https://www.tabuadadivertida.com/)

[Visite o site Tabuada Divertida](https://www.tabuadadivertida.com/)

## Considerações Gerais 

* Site desenvolvido em HTML, JavaScript, CSS e Bootstrap conectando em uma API feita em PHP (Versão OLD)
* Site desenvolvido em React com API em PHP (gateway) e Dotnet
* Minhas sobrinhas estavam com dificuldade em matemática, mais especificamente com tabuada, então criei esse joguinho para ajudar elas. Estou aberto a dicas para melhorar
* As fotos que aparecem no jogo é referente à minha formatura e aos meus amigos que me acompanham desde sempre


# Desenvolvimento

Projeto em React com [Vite](https://vite.dev/). Requer Node.js 22.12 ou superior.

## Scripts

### `npm run dev` (ou `npm start`)

Roda o app em modo de desenvolvimento em [http://localhost:3000](http://localhost:3000).

### `npm test`

Roda a suíte de testes uma vez com o [Vitest](https://vitest.dev/). Use `npm run test:watch` para o modo watch.

### `npm run lint`

Roda o ESLint no projeto.

### `npm run build`

Gera o build de produção na pasta `build`, usada no deploy do Azure Static Web Apps.

### `npm run preview`

Serve localmente o build gerado para conferência.

## App Android

O app é gerado com o [Capacitor](https://capacitorjs.com/) a partir do mesmo código. Para compilar e rodar no emulador ou no aparelho é preciso ter o Android Studio instalado.

### `npm run build:app`

Gera o build do app na pasta `build-app`, sem o AdSense.

### `npm run app:sync`

Gera o build do app e copia para o projeto `android`.

### `npm run app:open`

Abre o projeto `android` no Android Studio, onde o app é executado e o APK/AAB é gerado.

### `npm run app:assets`

Gera o ícone e a tela de abertura do app a partir de `assets/logo.png`.

### `npm run app:release`

Gera o build do app, copia para o projeto `android` e gera o AAB de release assinado em `android/app/build/outputs/bundle/release/app-release.aab`.

## Publicação na Google Play

### Assinatura

A chave de upload fica fora do repositório. O build de release lê o arquivo `android/keystore.properties`, que não é versionado:

```properties
storeFile=C:/Android/keystores/tabuada-divertida.jks
storePasswordFile=C:/Android/keystores/tabuada-divertida.senha
keyAlias=tabuada-divertida
```

* `storeFile`: caminho da keystore.
* `storePasswordFile`: caminho de um arquivo com a senha da keystore em uma linha.
* `keyAlias`: alias da chave.

Sem esse arquivo o AAB é gerado sem assinatura. A assinatura final do app é feita pelo Play App Signing; guarde um backup da keystore e da senha, pois sem elas não é possível enviar novas versões.

### Nova versão

1. Aumentar o `versionCode` (inteiro, sempre maior que o do último envio) e ajustar o `versionName` em `android/app/build.gradle`.
2. Rodar `npm run app:release` com o JDK 21 e o Android SDK configurados (`JAVA_HOME` e `ANDROID_HOME`).
3. No [Google Play Console](https://play.google.com/console), criar uma versão na faixa desejada (teste interno, teste fechado ou produção), enviar o `app-release.aab` e preencher as notas da versão.
4. Enviar a versão para revisão.
