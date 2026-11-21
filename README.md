# ifc-map

Mapa interativo do IFC Campus Videira em pixel art. Abra `index.html` no navegador: funciona sem instalação, servidor ou conexão. Toda a arte é gerada no canvas, sem bibliotecas ou imagens externas obrigatórias.

## Controles

| Ação | Computador | Celular |
| --- | --- | --- |
| Caminhar | WASD, setas ou clique | Toque no chão ou controle ativado pelo botão Joystick |
| Mostrar/ocultar o controle | Botão Joystick | Botão Joystick (começa oculto) |
| Correr | Shift ou botão Correr | Botão Correr |
| Zoom | Roda do mouse, +/− ou botões | Pinça com dois dedos ou botões +/− |
| Ver todo o campus | Tecla 0 ou Mapa inteiro | Mapa inteiro |
| Retornar à visão próxima | Seguir aluno | Seguir aluno |
| Colisões (desenvolvimento) | H ou C | — |
| Minimapa | M | Visível na vertical; oculto na visão geral |

O zoom mínimo se adapta à tela. O canvas tem tamanho visual separado da resolução interna para evitar cortes em telas com escala ou alta densidade. O controle de toque é cancelado ao soltar o dedo, perder foco ou interromper um gesto.

## Revisão do campus — novembro de 2026

- Três fileiras verticais no centro do estacionamento, mantendo as fileiras horizontais nas extremidades.
- Pátio inferior pavimentado, patamar elevado, guarda-corpo e acesso de serviço ao almoxarifado na ala oeste.
- Pátio do auditório sem os antigos canteiros; dois blocos quadrados de salas lado a lado, representados concluídos, com passagem entre eles.
- Copa junto à margem, com o canto nordeste sobre o lago e a entrada acessível por terra.
- Placa em frente à guarita removida, inclusive sua colisão.
- Portas, rótulos, minimapa e colisões atualizados junto com as estruturas.
- Patamar ampliado, com abertura de subida pela direita e parede verde com retorno à esquerda. A escada horizontal fica à esquerda da ruazinha, sob o trecho de parede marcado pelo usuário; a passagem central segue livre até o estacionamento, com a saída sem vagas. Antiga diagonal e porta frontal marcada com X removidas; portas curva e lateral preservadas.
- Rua lateral oeste ligada aos fundos; laboratório, estufas e barracão deslocados para ampliar a subida. Pátio e subida usam o mesmo piso cinza claro.
- Dois canteiros circulares alinhados e centralizados entre as coberturas à direita do administrativo, faixa verde estreita na frente e triângulo simétrico junto à biblioteca. O corredor frontal fica afastado da fachada e faz um L até a porta.
- Corredores cobertos nas calçadas entre entrada, prédio principal, administrativo, entrada lateral do pedagógico, copa, refeitório e fundos dos laboratórios. O contorno do pedagógico passa pela frente e pela lateral direita até o caminho superior; a ligação ao principal chega à porta lateral indicada pelo usuário, acima do patamar. O caminho da copa ao refeitório acompanha a lateral da rua. Retirados os bancos perto do triângulo e dos novos blocos. A cobertura é interrompida nas travessias de veículos. Apenas os pilares têm colisão; o telhado fica parcialmente transparente perto do aluno.
- Gradil frontal prolongado até a borda oeste e até a mata a leste, preservando a abertura da portaria.
- No lado do lago, a cobertura começa na copa: não há corredor coberto entre a portaria e a copa.
- A lateral direita do pátio do triângulo também é coberta, conectando os corredores de cima e de baixo junto à rua.

Referências: fotografias e correções fornecidas pelo usuário e [foto aérea do acervo oficial do IFC Videira](https://cic.videira.ifc.edu.br/ambientes/fit13.jpeg), disponível no [sistema de ambientes do campus](https://cic.videira.ifc.edu.br/salas). As correções e fotos recentes fornecidas pelo usuário têm prioridade sobre a foto aérea antiga.

As dimensões e o acabamento do portão de serviço e dos novos blocos são aproximações visuais; os blocos aparecem concluídos por solicitação do usuário. O mapa não é uma planta topográfica nem uma confirmação do estágio real das obras.

## Interior do Prédio Principal — vista de cima

O prédio principal agora tem **duas páginas**, cada uma com todo o andar em uma planta contínua em **L**:

- `interiores/primeiro-andar.html`: E à esquerda, convivência ao centro, C à direita e A na ala vertical.
- `interiores/segundo-andar.html`: F à esquerda, convivência/F10 ao centro, D à direita e B na vertical.
- `interiores/principal.html` mantém os links antigos funcionando, encaminhando à página do andar adequado.

A correspondência das portas fica em `interiores/access.js`: entrada 1 chega pela direita da ala C, entrada 2 chega à convivência pela frente, entrada 3 pelo corredor dos fundos e entrada 4 pela convivência curva na junção das alas. O acesso superior abre diretamente o segundo andar, no fim de B. Sair por uma porta devolve o aluno ao ponto correspondente no campus; o botão Campus retorna à entrada de origem, inclusive após trocar de andar. A saída de emergência fica no extremo esquerdo de E/F.

No mapa do campus, aproxime-se do Prédio Principal e use **Entrar no prédio** ou **E**. Dentro, tudo que fica fora da construção é preto. As salas e seus móveis aparecem na mesma planta; o aluno entra e sai pelas aberturas reais das portas, sem trocar de cena.

**WASD ou setas** movimentam o aluno em quatro direções; **Shift** permite correr. Clique/toque no piso ou escolha uma sala em **Encontrar sala** para seguir um percurso que contorna paredes e móveis. A busca conduz até dentro da sala caminhando e também encontra as duas escadas, o elevador e as áreas de convivência. Movimento manual ou **Parar percurso** interrompe o caminho.

Duas escadas ligam os andares: a central e a diagonal na junção das alas. O elevador fica na parte intermediária da convivência curva. Use **E** ou o botão de ação ao se aproximar; cada acesso chega ao ponto correspondente do outro andar. Há também abas para trocar de andar. **Ver andar inteiro** enquadra todo o L; **Seguir aluno** retoma a câmera próxima. Roda, pinça e +/− ajustam o zoom; arrastar move a câmera. No celular, **Controle** mostra ou oculta os quatro botões direcionais, inicialmente ocultos.

São **52 ambientes com portas atravessáveis**: 25 no primeiro andar e 27 no segundo, incluindo banheiros e as duas salas novas sem numeração ao final de B. F10 fica entre D e F. O antigo miniauditório/B03 não existe nesta versão. C01 (reprografia) fica à esquerda de quem entra pela entrada 1, antes das salas C. C09 continua como registro de localização pendente.

As placas mostram o código e o nome da sala ao aproximar o zoom. A F10 é identificada somente como Datacenter. As áreas de convivência incluem a curva, o espaço junto à entrada central e o espaço sob a escada; a área curva e a convivência central também aparecem no segundo andar.

O estudante usa exatamente os mesmos sprites de `interiores/student.js` dentro e fora do prédio. A interface usa a paleta, o logotipo e as placas do campus. Piso tátil azul, paredes claras/verde, armários, carteiras azuis, bancadas, equipamentos, escada e elevador usam as fotos como referência. As proporções e os móveis são ilustrativos. `data.js` guarda os nomes e sequências, `layout.js` define salas/portas/móveis, `core.js` cuida das colisões e trajetos, `art.js` desenha a planta, e `engine.js` controla a interface. Não há dependências externas nem compilação. Veja [REFERENCIAS.md](interiores/REFERENCIAS.md).

## Verificação do projeto

## Interiores dos demais edifícios

Todos os locais com portas no mapa externo agora têm acesso interno. Foram adicionadas 15 páginas e 66 ambientes exploráveis: Administrativo, Pedagógico, Biblioteca, Laboratórios, Auditório, Ginásio, Refeitório, Copa, Almoxarifado, Barracão, Guarita, dois novos blocos de salas e as duas estufas. O Prédio Principal mantém suas duas páginas e 52 salas.

Aproxime-se de qualquer porta e use **Entrar no prédio** ou **E**. O ponto de chegada corresponde à entrada usada, inclusive nos dois acessos do ginásio e dos laboratórios. **Campus** retorna à entrada de origem; **Sair** usa a saída próxima ao aluno. As estufas são páginas independentes. A Biblioteca e o Pedagógico têm uma conexão interna ilustrativa por escada.

Os cenários compartilham o mesmo estudante, paredes, placas e controles do campus. Cada um possui móveis próprios: estantes e computadores na biblioteca, poltronas e palco no auditório, quadra e vestiários no ginásio, cozinha e mesas no refeitório, canteiros nas estufas e máquinas na garagem. Use **Ambientes** para buscar e caminhar até qualquer sala, setor ou saída. **Ver prédio inteiro** enquadra tudo, reservando espaço para os controles.

As divisões desses novos interiores são **provisórias**, autorizadas para revisão com o usuário. Não representam uma planta oficial, numeração confirmada ou localização exata de setores. As fontes confirmam funções gerais; não confirmam a geometria desenhada. Os novos blocos usam nomes descritivos sem códigos oficiais inventados. A biblioteca segue a descrição pública de seus tipos de ambientes, com posição ilustrativa.

`interiores/places.js` reúne os prédios, páginas, portas e pontos de chegada. `campus-layout.js` define as plantas adicionais; o motor e a arte continuam compartilhados com o Principal. A busca e a caminhada funcionam sem rede e sem dependências externas.

## Verificação do projeto

Opcional, apenas para desenvolvimento (Node.js, sem instalar pacotes):

```sh
node --test tests/*.test.cjs
```

Os testes verificam acesso a todas as portas a partir da entrada, passagem livre por cada corredor coberto, oclusão parcial sob os telhados, percurso do patamar/escada/estacionamento, geometria alterada, enquadramento após zoom/rotação, joystick e cancelamento de gestos. O canvas é simulado nesses testes; a aparência é conferida separadamente no navegador. Também houve inspeção em telas estreitas; não houve teste em aparelho físico.

Os testes de interiores verificam a sequência das salas, formato em L, entrada e retorno de todos os ambientes pelo mesmo mapa, colisões, troca de andares, enquadramento e cancelamento de controles. A aparência e o fluxo também são conferidos no navegador.
