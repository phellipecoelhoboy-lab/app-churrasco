# Orçamento para Churrasco

Este é um projeto de uma aplicação web para calcular o orçamento de um churrasco. O usuário pode informar o número de pessoas, escolher entre diferentes pacotes de churrasco, open bar e outros serviços extras. A aplicação calcula o valor total do orçamento e permite gerar um PDF com o resumo do pedido.

## Tecnologias Utilizadas

*   React
*   Vite
*   JavaScript
*   CSS
*   jspdf
*   html2canvas
*   Firebase (Firestore + Storage)

## Como Executar o Projeto

1.  Clone o repositório
2.  Instale as dependências com `npm install`
3.  Copie `.env.example` para `.env` e preencha as chaves do Firebase
4.  Execute o projeto com `npm run dev`
5.  Acesse a aplicação em `http://localhost:5173`

## Firebase (Banco + Arquivos PDF)

O projeto salva o orçamento no Firestore e o PDF no Firebase Storage quando o usuário envia o pedido por WhatsApp.

### Variáveis de ambiente

Preencha no arquivo `.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Estrutura usada

* Coleção Firestore: `orcamentos`
* Pasta no Storage: `orcamentos-pdf/{orcamentoId}/arquivo.pdf`

Se as variáveis do Firebase não estiverem preenchidas, o envio por WhatsApp continua funcionando normalmente, mas sem persistir no banco/storage.
