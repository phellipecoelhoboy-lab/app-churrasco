# Guia do Fluxo de Trabalho com GitHub (Git Workflow)

Este guia explica como trabalhar de forma segura e organizada com o Git no seu projeto. O seu arquivo [`.gitignore`](file:///c:/app-churrasco/.gitignore) já está configurado para ignorar pastas desnecessárias (como `node_modules`, pastas de build e arquivos de credenciais `.env`), garantindo que apenas os arquivos de código que você editou sejam enviados ao GitHub.

---

## 🚀 Passo a Passo para Modificar e Enviar Alterações

Siga estes passos sempre que for fazer uma alteração no projeto:

### 1. Atualizar o seu repositório local
Antes de começar qualquer nova alteração, certifique-se de que tem a versão mais recente do código que está no GitHub:
```bash
git pull origin main
```
> **Nota:** Se você adicionou novas dependências ou baixou alterações de outra pessoa, lembre-se de rodar `npm install` após o pull para atualizar suas dependências locais.

---

### 2. Verificar as alterações feitas
Após terminar de fazer as alterações necessárias no código, você pode visualizar quais arquivos foram modificados executando:
```bash
git status
```
Você verá uma lista de arquivos modificados em vermelho sob a seção *“Changes not staged for commit”*.

---

### 3. Preparar os arquivos para o commit (Stage)
Você pode adicionar apenas os arquivos que você modificou para serem enviados. Existem duas formas:

- **Opção A: Adicionar todos os arquivos modificados (Recomendado)**
  Como o `.gitignore` já ignora arquivos desnecessários, você pode simplesmente usar:
  ```bash
  git add .
  ```

- **Opção B: Adicionar arquivos específicos**
  Se você preferir adicionar apenas arquivos específicos um a um:
  ```bash
  git add src/components/AdminPanel.jsx src/components/Resumo.jsx src/services/orcamentosService.js
  ```

---

### 4. Criar o commit (Registrar a alteração localmente)
Grave as alterações locais no histórico do Git com uma mensagem curta e clara explicando o que foi feito:
```bash
git commit -m "feat: salvar orçamentos e adicionar aba de visualização e reimpressão no admin"
```

---

### 5. Enviar as alterações para o GitHub (Push)
Envie suas alterações locais diretamente para o repositório remoto no GitHub:
```bash
git push origin main
```

---

## 🛠️ Resumo de Comandos Frequentes

| Comando | Descrição |
| :--- | :--- |
| `git pull origin main` | Baixa e junta as alterações mais recentes do GitHub no seu computador. |
| `git status` | Mostra os arquivos modificados e o estado atual do repositório. |
| `git diff` | Mostra as alterações exatas de linhas dentro dos arquivos modificados. |
| `git add .` | Prepara todas as alterações permitidas para serem commitadas. |
| `git commit -m "mensagem"` | Cria um ponto de salvamento local das alterações preparadas. |
| `git push origin main` | Sobe os commits locais para o repositório no GitHub. |
| `git checkout .` | ⚠️ **Atenção:** Descarta todas as alterações locais não salvas nos arquivos e volta ao estado do último commit. |
