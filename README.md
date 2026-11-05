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
