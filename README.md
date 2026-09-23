# Valen — site institucional

Site estático em HTML, CSS e JavaScript. Publicação via GitHub → Vercel; não requer etapa de build.

## Estrutura

Início → Sobre → Desafios → Método → Soluções → Contato. Os links do menu apontam para seções da página. O sitemap lista a URL principal, pois âncoras não são páginas independentes.

## Identidade

Usa a logo oficial `assets/valen-logo-final.png` nos dois pontos de assinatura. As quatro artes 3D vêm do site anterior. Os arquivos de imagens e da logo precisam estar presentes no diretório `assets` durante o deploy.

## SEO

Canonical, Open Graph, Twitter Card, JSON-LD, `robots.txt` e `sitemap.xml` apontam para `https://valen-eta-nine.vercel.app/`, informado como endereço atual. Se um domínio próprio passar a ser o principal, atualize todas essas referências e configure o redirecionamento antes de indexá-lo.

## Motion

As cenas foram integradas a partir da pasta Valen_Motion_Final: V e órbita no hero, placas separadas em Sobre, redes em Desafios e Soluções, órbita do Método e estátua em Contato. Os quadros WebP são carregados quando a cena se aproxima da viewport e seguem a rolagem nos dispositivos com movimento habilitado. Hover/foco das soluções seleciona o núcleo visual correspondente. As placas e o braço da estátua são camadas independentes. No celular e com `prefers-reduced-motion: reduce`, as artes estáticas continuam disponíveis. Se uma sequência falhar ao carregar, o pôster permanece visível.
