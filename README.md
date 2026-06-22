# Condropure — Cadastro de Pets (PHP)

Descrição

- Aplicação web simples para cadastrar dados de tutores e seus pets e enviar registros para a API de Data Source do Klaviyo.
- Implementada com PHP puro, sem Node/TypeScript/React. O ponto de entrada é `index.php`.

Arquivos principais

- `index.php` — página pública e formulário, validação básica e envio para Klaviyo.
- `klaviyo.php` — helper que monta o payload e faz o POST para a API do Klaviyo.
- `public/` — ativos estáticos: `style.css`, `script.js`, imagens e `robots.txt`.
- `index.html` — arquivo de redirecionamento (aponta para `index.php`).

Requisitos

- PHP 8.0+ com cURL habilitado.
- Conta Klaviyo e uma API Key com permissão para criar Data Source Record Jobs.

Variáveis de ambiente

- `KLAVIYO_API_KEY` — chave da API Klaviyo. Nunca a comite no repositório.

Exemplo de arquivo de ambiente

- Veja `.env.example` para o formato esperado.

Executando localmente (Windows / PowerShell)

1. Exporte a variável de ambiente:

```powershell
$env:KLAVIYO_API_KEY = "sua_chave_aqui"
```

2. Inicie o servidor embutido do PHP na raiz do projeto:

```powershell
php -S localhost:8000
```

3. Abra `http://localhost:8000` no navegador.

Deploy

- Hospede em qualquer servidor compatível com PHP (Apache, Nginx, plataformas de hosting compartilhado).
- Garanta que `KLAVIYO_API_KEY` esteja configurada no ambiente do servidor (variável de ambiente ou configuração do host).

Segurança

- Não guarde chaves em arquivos versionados. Adicione `.env` ao `.gitignore`.
- Valide e sanitize entradas adicionais conforme necessário antes de enviar para APIs externas.

Checklist para subir ao GitHub

- Certifique-se de que `.gitignore` inclui arquivos sensíveis.
- Atualize `README.md` com instruções específicas do projeto, se necessário.

Exemplo rápido de comandos Git

```bash
git init
git add .
git commit -m "Initial PHP Condropure form"
# Crie um repo no GitHub e adicione o remote
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git branch -M main
git push -u origin main
```

Próximos passos recomendados

- (Opcional) Remover dependência do JavaScript e renderizar os blocos de pets no servidor em `index.php`.
- Adicionar testes básicos e validação de servidor mais robusta.
- Configurar CI (GitHub Actions) para lint e verificação de segurança.

Licença

- Escolha uma licença adequada antes de publicar (ex.: MIT).