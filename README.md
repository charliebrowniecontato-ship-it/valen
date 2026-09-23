# Valen — site institucional

Site estático em HTML, CSS e JavaScript. Publicação via GitHub → Vercel; não requer etapa de build.

## Estrutura

Início → Sobre → Desafios → Método → Soluções → Contato. Os links do menu apontam para seções da página. O sitemap lista a URL principal, pois âncoras não são páginas independentes.

## Identidade

Usa a logo oficial `assets/valen-logo-final.png` nos dois pontos de assinatura. As quatro artes 3D vêm do site anterior. Os arquivos de imagens e da logo precisam estar presentes no diretório `assets` durante o deploy.

## SEO

Canonical, Open Graph, Twitter Card, JSON-LD, `robots.txt` e `sitemap.xml` apontam para `https://valen.jvmco.com.br/`. Conecte esse domínio ao projeto Vercel antes de considerar a migração finalizada; se usar outro domínio definitivo, substitua essa URL nos quatro arquivos relevantes. Não anuncie URLs temporárias de deploy como canônicas.
