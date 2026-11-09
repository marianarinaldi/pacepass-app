# PacePass – Gestor Inteligente de Corridas e Retirada de Kits

Aplicativo mobile desenvolvido em React Native com Expo para corredores de rua
organizarem provas, acompanharem datas de largada, controlarem a retirada de
kits e guardarem o comprovativo de inscrição.

## Problema e público-alvo

Corredores de rua normalmente precisam consultar diferentes aplicações, e-mails
e comprovativos para lembrar datas de provas e períodos de retirada de kits.
O PacePass centraliza essas informações em uma única experiência mobile, com
alertas, calendário, comprovativo e atualização do status do kit.

O público-alvo são corredores amadores e participantes de provas de rua que
precisam de uma forma simples e confiável de organizar seus eventos.

## Funcionalidades

- Cadastro de provas com nome, distância, largada, retirada do kit, local e
  plataforma de inscrição.
- Seleção de distâncias de 5k, 10k, 21k e 42k.
- Validação de campos obrigatórios e datas inconsistentes.
- Seleção de data e hora com componente nativo.
- Captura ou seleção de foto do comprovativo.
- Dashboard de próximas corridas com contagem regressiva.
- Alerta visual para retirada de kit próxima.
- Marcação do kit como retirado com feedback tátil.
- Detalhes completos da prova e visualização ampliada do comprovativo.
- Agendamento de lembrete local para a véspera do fim da retirada.
- Sincronização da prova com o calendário nativo do dispositivo.
- Persistência no Cloud Firestore com regras por utilizador.

## Requisitos do edital atendidos

| Requisito | Implementação |
|---|---|
| Flexbox e responsividade | Layouts adaptáveis em telas, cards, formulários e estados vazios. |
| React Navigation | Native Stack combinado com Bottom Tabs. |
| Estados e formulários | Estados de loading, erro, vazio, sucesso, validação e submissão. |
| Firestore NoSQL | Coleção `users/{userId}/races`, CRUD e timestamps do servidor. |
| Câmara e galeria | `expo-image-picker` para comprovativos de inscrição. |
| Feedback tátil | `expo-haptics` ao marcar o kit como retirado. |
| Notificações locais | `expo-notifications` para lembrete da retirada do kit. |
| Calendário nativo | `expo-calendar` para criar eventos no calendário do dispositivo. |
| Seletores nativos | `@react-native-community/datetimepicker` para datas e horários. |
| Acessibilidade | `accessibilityLabel`, `accessibilityRole`, contraste e feedback textual. |
| Testes unitários | Jest e `@testing-library/react-native` com mocks de APIs nativas e Firebase. |
| Git Flow | Branches de funcionalidade e branch de release para preparação da entrega. |

## Arquitetura

```text
src/
├── components/
│   ├── Loading.js
│   ├── RaceCard.js
│   └── StatusBadge.js
├── config/
│   └── firebaseConfig.js
├── navigation/
│   ├── AppNavigator.js
│   └── TabNavigator.js
├── screens/
│   ├── AddRaceScreen.js
│   ├── CalendarScreen.js
│   ├── HistoryScreen.js
│   ├── RaceDetailScreen.js
│   └── UpcomingRacesScreen.js
├── services/
│   ├── calendarService.js
│   ├── notificationService.js
│   └── raceService.js
└── __tests__/
```

## Tecnologias

- React Native 0.88
- Expo SDK 58
- React Navigation
- Firebase Cloud Firestore
- Jest
- React Native Testing Library

## Pré-requisitos

- Node.js LTS
- npm
- Expo CLI via `npx`
- Expo Go em um dispositivo físico ou um emulador Android/iOS
- Projeto Firebase com Cloud Firestore habilitado

## Instalação e execução local

1. Clone o repositório e entre na pasta:

   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd pacepass-app
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie o arquivo local de variáveis:

   ```bash
   cp .env.example .env
   ```

4. Preencha o `.env` com as configurações Web do seu projeto Firebase:

   ```dotenv
   EXPO_PUBLIC_FIREBASE_API_KEY="sua-chave"
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
   EXPO_PUBLIC_FIREBASE_PROJECT_ID="seu-projeto"
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="seu-projeto.firebasestorage.app"
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="seu-sender-id"
   EXPO_PUBLIC_FIREBASE_APP_ID="seu-app-id"
   ```

   O arquivo `.env` é ignorado pelo Git e não deve ser commitado. As variáveis
   `EXPO_PUBLIC_*` podem ser incluídas no bundle do aplicativo; elas não
   substituem regras de segurança. A proteção dos dados é feita pelo
   `firestore.rules`, que restringe os documentos ao utilizador autenticado.

5. Publique ou simule as regras do Firestore usando o Firebase CLI, conforme o
   ambiente da equipe:

   ```bash
   firebase deploy --only firestore:rules
   ```

6. Inicie o Expo:

   ```bash
   npx expo start
   ```

   Depois, pressione `a` para Android, `i` para iOS ou leia o QR code com o
   Expo Go.

## Testes

Execute toda a suíte unitária com:

```bash
npm test -- --runInBand
```

O script `npm test` executa Jest sem modo watch. A opção `--runInBand`
facilita a execução em máquinas de apresentação e ambientes acadêmicos.

Para executar um arquivo específico:

```bash
npx jest src/__tests__/RaceCard.test.js --runInBand
npx jest src/__tests__/calendarService.test.js --runInBand
```

Os testes cobrem:

- Renderização e contagem regressiva do card.
- Ação de retirada do kit e feedback tátil.
- Validação do formulário.
- Navegação entre abas.
- Operações do Firestore com mocks.
- Criação de evento no calendário e permissões negadas.

## Segurança e boas práticas

- Não versionar `.env`, credenciais privadas ou arquivos de serviço Firebase.
- Usar apenas variáveis `EXPO_PUBLIC_*` para a configuração pública do SDK
  Firebase no cliente.
- Manter as regras de [firestore.rules](./firestore.rules) publicadas no
  projeto correto.
- Usar autenticação Firebase antes de acessar as corridas.
- Não confiar em validações apenas no cliente: as regras do Firestore também
  validam o proprietário do documento e as alterações permitidas.
- Tratar explicitamente estados de carregamento, erro e permissão negada.

## Screenshots e GIFs

Substitua os placeholders abaixo pelos arquivos finais da apresentação.

### Dashboard de próximas corridas

![Dashboard de próximas corridas](docs/screenshots/upcoming-races.png)

### Cadastro de prova

![Formulário de cadastro](docs/screenshots/add-race.png)

### Detalhes e comprovativo

![Detalhes da prova](docs/screenshots/race-detail.png)

### Fluxo de retirada do kit

![GIF marcando kit como retirado](docs/screenshots/kit-pickup.gif)

> Os caminhos acima são placeholders. Adicione os arquivos em
> `docs/screenshots/` antes da entrega final ou substitua os links por imagens
> hospedadas no repositório.

## Divisão de tarefas

| Responsável | Entregas |
|---|---|
| **[Nome da integrante]** | Arquitetura React Native, navegação e integração das telas. |
| **[Nome da integrante]** | Formulário de provas, validações e comprovativo. |
| **[Nome da integrante]** | Firestore, regras de segurança e camada de serviços. |
| **[Nome da integrante]** | Notificações, calendário, testes e documentação. |

### Dados da integrante

Preencha antes da submissão:

- **Nome:** [nome completo]
- **Matrícula:** [matrícula]
- **Curso/turma:** [curso e turma]
- **Instituição:** [instituição]
- **Papel no projeto:** [responsabilidade principal]

## Roteiro para apresentação ou vídeo (3–5 minutos)

### 1. Contexto e proposta — 30 segundos

Apresente o problema: informações de provas e retirada de kits ficam
espalhadas. Explique que o PacePass centraliza provas, comprovativos,
lembretes e calendário para corredores de rua.

### 2. Navegação principal — 40 segundos

Abra o aplicativo e mostre o Bottom Tab Navigator com as abas Próximas,
Calendário e Histórico. Explique que o Native Stack abre o cadastro e os
detalhes sem perder o contexto da tela principal.

### 3. Cadastro de uma prova — 60 segundos

Abra “Adicionar corrida”, preencha nome, distância, largada, período de
retirada, local e plataforma. Mostre a seleção nativa de data e hora e capture
ou selecione um comprovativo pela câmara/galeria.

### 4. Dashboard e retirada do kit — 60 segundos

Mostre o card da prova, a contagem regressiva, o alerta de retirada próxima e o
badge “Kit Pendente”. Pressione “Marcar Kit como Retirado” e destaque a
atualização imediata, o novo badge e o feedback tátil.

### 5. Detalhes, notificações e calendário — 50 segundos

Abra os detalhes, amplie o comprovativo e demonstre “Adicionar ao Calendário
do Telemóvel”. Explique que o app agenda automaticamente o lembrete local para
a véspera do fim da retirada após salvar a prova.

### 6. Qualidade e encerramento — 30 segundos

Mostre rapidamente os testes unitários, as regras do Firestore e a separação
entre componentes, telas e serviços. Finalize reforçando que o PacePass reduz
esquecimentos e centraliza a preparação para a prova.

## Fluxo Git

O desenvolvimento segue uma convenção baseada em Git Flow:

```text
feature/*  ->  develop  ->  release/v1.0  ->  main
```

Use commits pequenos e descritivos, abra pull requests para revisão e não
inclua arquivos `.env` ou artefatos gerados no controle de versão.

## Licença

Projeto acadêmico desenvolvido para fins educacionais.
