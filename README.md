# Valen — site institucional

Site estático em HTML, CSS e JavaScript. Publicação via GitHub → Vercel; não requer etapa de build.

## Estrutura

Início → Sobre → Desafios → Método → Soluções → Contato. Os links do menu apontam para seções da página. O sitemap lista a URL principal, pois âncoras não são páginas independentes.

## Identidade

Usa a logo oficial `assets/valen-logo-final.png` nos dois pontos de assinatura. As quatro artes 3D vêm do site anterior. Os arquivos de imagens e da logo precisam estar presentes no diretório `assets` durante o deploy.

## SEO

Canonical, Open Graph, Twitter Card, JSON-LD, `robots.txt` e `sitemap.xml` apontam para `https://valen-eta-nine.vercel.app/`, informado como endereço atual. Se um domínio próprio passar a ser o principal, atualize todas essas referências e configure o redirecionamento antes de indexá-lo.

## Motion

Rolagem nativa, sem captura da roda do mouse. Um único controlador interpola os movimentos e pausa quando está ocioso ou quando a aba está oculta.

- Início: V e órbita em camadas independentes, com profundidade ao mover o cursor.
- Sobre: cena fixa temporariamente durante a rolagem; três placas se alinham, com área livre para todas as bordas.
- Método: órbita acompanha a progressão das etapas.
- Soluções: destaque responde a mouse, foco de teclado e toque.
- Contato: estátua entra, levanta o braço em direção ao botão e sai. O braço gira continuamente em torno do ombro, sem sobreposição de quadros.

Em telas menores, as cenas seguem o fluxo normal da página, com movimento mais curto. Com `prefers-reduced-motion: reduce`, a rolagem estendida é desativada e as artes permanecem estáticas. Se uma camada não carregar, o pôster permanece visível.

## Verificação

Sintaxe JavaScript, estrutura HTML e caminhos de imagens verificados. Na versão publicada, as placas foram conferidas abertas e empilhadas; a estátua, na entrada e no fim do gesto. O link do contato aponta para o WhatsApp informado no projeto.
