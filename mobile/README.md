# Conexão Solidária — App Mobile (Expo)

Versão mobile do frontend, feita com **Expo SDK 54** (compatível com o app
Expo Go 54.x). Navegação por abas:

- **Início**: apresentação do projeto, da instituição e canais de contato;
- **Campanhas**: lista pública com pull-to-refresh e botão de doar;
- **Gestão** (visível só para gestor): criar, editar, concluir (meta batida)
  e encerrar campanhas;
- **Perfil**: login quando deslogado; dados da conta e sair quando logado.

Doação com checkout de cartão (ambiente de teste) e endereço via ViaCEP.

## Pré-requisitos

- Node 20+;
- App **Expo Go** instalado no celular (SDK 54);
- Backend no ar na mesma máquina: `docker compose up -d` na raiz do repo
  (API na porta `8080` e Payment Service na `8090`);
- Celular e PC na **mesma rede Wi-Fi**.

## Como rodar

```bash
cd mobile
npm install
npx expo start
```

Escaneie o QR code com a câmera do iPhone (abre no Expo Go).

## Como o app encontra a API

O celular não enxerga o `localhost` do PC. Por padrão, o app usa o mesmo IP
da máquina que está servindo o bundle do Expo (detectado em tempo de
execução) nas portas `8080` e `8090`.

Se precisar apontar para outro endereço, copie `.env.example` para `.env` e
defina:

```env
EXPO_PUBLIC_API_URL=http://192.168.15.7:8080
EXPO_PUBLIC_PAYMENT_URL=http://192.168.15.7:8090
```

> Se o celular não conectar, verifique se o firewall do Windows permite
> conexões de entrada nas portas 8080, 8090 e 8081 (Metro bundler), e se
> ambos estão na mesma rede.

## Dados de teste

- Gestor: `manager@solidarity.com` (senha do seed do backend);
- Cartão aprovado no checkout: `4242 4242 4242 4242` (qualquer outro é recusado);
- Valor mínimo de doação: R$ 5,00.

## Estrutura

```
mobile/
├── App.tsx                 Stack raiz + abas (bottom-tabs) + AuthProvider
└── src/
    ├── services/           http, sessão JWT (AsyncStorage), auth, campanhas,
    │                       pagamentos, ViaCEP, stats
    ├── contexts/           AuthContext (restauração assíncrona da sessão)
    ├── components/ui.tsx   Button, Field, Card, Alert, Badge, ProgressBar
    ├── screens/            Home, Campaigns, Profile, Register, Checkout, Manager
    ├── utils/masks.ts      Máscaras (CPF, moeda, cartão, CEP, data)
    └── theme.ts            Paleta espelhada do frontend web
```
