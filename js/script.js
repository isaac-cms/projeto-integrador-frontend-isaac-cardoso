// EcoTrip — js/script.js
// Tema: vagas dos passeios do EcoTrip.
// Entrada: lista de passeios (nome, estado, tipo, vagas, inscritos e reserva),
//          mais o que a pessoa digita, escolhe e clica na página.
// Processamento: calcular as vagas restantes, classificar, filtrar e resumir.
// Saída: cartões e um resumo na página, e um gráfico em Canvas.
//
// Pseudocódigo:
// 1. Criar a lista de passeios (fonte de verdade da tela).
// 2. Calcular as vagas restantes de cada passeio.
// 3. Classificar o passeio: esgotado, últimas vagas ou disponível.
// 4. Aplicar a busca e os filtros que a pessoa escolheu.
// 5. Desenhar os cartões e escrever o resumo.
// 6. Quando houver um evento (clique, digitação, escolha), alterar os dados e desenhar de novo.

// ---------- 1. Dados ----------
// Fonte de verdade: a lista da tela é desenhada a partir deste array.
const passeios = [
  { id: 1, nome: "Chapada dos Veadeiros", estado: "GO", tipo: "Trilha", vagas: 20, inscritos: 12, reservado: false },
  { id: 2, nome: "Fernando de Noronha", estado: "PE", tipo: "Praia", vagas: 10, inscritos: 9, reservado: false },
  { id: 3, nome: "Floresta Amazônica", estado: "AM", tipo: "Ecoturismo", vagas: 15, inscritos: 6, reservado: false },
  { id: 4, nome: "Pantanal", estado: "MT", tipo: "Ecoturismo", vagas: 12, inscritos: 12, reservado: false },
  { id: 5, nome: "Lençóis Maranhenses", estado: "MA", tipo: "Praia", vagas: 16, inscritos: 15, reservado: false },
  { id: 6, nome: "Bonito", estado: "MS", tipo: "Aventura", vagas: 8, inscritos: 3, reservado: false }
];

// Próximo id para os passeios cadastrados no formulário (muda a cada cadastro, por isso é let).
let proximoId = passeios.length + 1;

// Variável global: pode ser usada dentro de qualquer função deste arquivo.
const limiteUltimasVagas = 3;

// O desenho da lista lê estes valores. Os eventos só mudam estes valores.
const filtros = { texto: "", tipo: "todos", soComVagas: false };

// Cada faixa tem uma classe no CSS para mudar a cor do cartão.
const classesDasFaixas = {
  "Esgotado": "esgotado",
  "Últimas vagas": "ultimas-vagas",
  "Disponível": "disponivel"
};

// Elementos da página que o script usa.
const botaoMenu = document.querySelector("#botao-menu");
const menu = document.querySelector("#menu-principal");
const campoBusca = document.querySelector("#campo-busca");
const filtroTipo = document.querySelector("#filtro-tipo");
const botaoSoVagas = document.querySelector("#botao-so-vagas");
const areaLista = document.querySelector("#lista-passeios");
const areaResumo = document.querySelector("#resumo");
const formulario = document.querySelector("#formulario-passeio");
const mensagemFormulario = document.querySelector("#mensagem-formulario");

// ---------- 2. Funções que processam, classificam e formatam ----------

// Processa: calcula as vagas que sobraram.
// Se os inscritos não forem informados, o valor padrão é 0.
function calcularVagasRestantes(vagas, inscritos = 0) {
  // Number() converte para número de forma explícita,
  // porque o valor pode chegar como texto (por exemplo, de um campo do formulário).
  const total = Number(vagas);
  const ocupadas = Number(inscritos);

  // "restantes" é uma variável local: só existe dentro desta função.
  // Se eu usar "restantes" fora daqui, o navegador mostra um erro (ReferenceError).
  const restantes = total - ocupadas;

  return restantes;
}

// Classifica: devolve a faixa do passeio.
// A ordem importa: primeiro testamos o caso mais restrito.
function classificarDisponibilidade(vagasRestantes) {
  if (vagasRestantes <= 0) {
    return "Esgotado";
  } else if (vagasRestantes <= limiteUltimasVagas) {
    return "Últimas vagas";
  } else {
    return "Disponível";
  }
}

// Formata: escolhe um texto de acordo com o tipo do passeio.
function descreverTipo(tipo) {
  switch (tipo) {
    case "Trilha":
      return "Ideal para quem gosta de caminhadas";
    case "Praia":
      return "Experiência próxima ao mar";
    case "Ecoturismo":
      return "Contato com a natureza";
    case "Aventura":
      return "Atividades ao ar livre com cuidado ambiental";
    default:
      return "Tipo de passeio não informado";
  }
}

// Usa um laço for...of com acumulador para somar as vagas livres.
function somarVagasLivres(lista) {
  let total = 0;

  for (const passeio of lista) {
    if (passeio.vagasRestantes > 0) {
      total += passeio.vagasRestantes;
    }
  }

  return total;
}

// Usa while para andar na lista até achar o primeiro passeio com vagas.
function buscarPrimeiroComVagas(lista) {
  let posicao = 0;

  while (posicao < lista.length && lista[posicao].vagasRestantes <= 0) {
    posicao++;
  }

  if (posicao < lista.length) {
    return lista[posicao];
  }

  return null;
}

// ---------- 3. Arrays: map, filter e reduce ----------

// Usa o map para criar uma nova lista, sem alterar o array original.
function analisarPasseios(lista) {
  return lista.map((passeio) => {
    const vagasRestantes = calcularVagasRestantes(passeio.vagas, passeio.inscritos);

    return {
      id: passeio.id,
      nome: passeio.nome,
      estado: passeio.estado,
      tipo: passeio.tipo,
      reservado: passeio.reservado,
      vagasRestantes: vagasRestantes,
      faixa: classificarDisponibilidade(vagasRestantes)
    };
  });
}

// Usa o filter para deixar só os passeios que combinam com a busca e com os filtros.
// Função pura: só lê os parâmetros e devolve uma lista nova.
function filtrarPasseios(lista, opcoes) {
  const busca = opcoes.texto.trim().toLowerCase();

  return lista.filter((passeio) => {
    const combinaTexto =
      passeio.nome.toLowerCase().includes(busca) ||
      passeio.estado.toLowerCase().includes(busca);
    const combinaTipo = opcoes.tipo === "todos" || passeio.tipo === opcoes.tipo;
    const combinaVagas = !opcoes.soComVagas || passeio.vagasRestantes > 0;

    return combinaTexto && combinaTipo && combinaVagas;
  });
}

// Calcula o resumo (função pura): usa filter, reduce, for...of e while.
function calcularResumo(visiveis, totalGeral) {
  const comVagas = visiveis.filter((passeio) => passeio.vagasRestantes > 0);
  const reservas = visiveis.reduce((total, passeio) => {
    return passeio.reservado ? total + 1 : total;
  }, 0);

  return {
    mostrando: visiveis.length,
    total: totalGeral,
    comVagas: comVagas.length,
    vagasLivres: somarVagasLivres(visiveis),
    reservas: reservas,
    primeiro: buscarPrimeiroComVagas(visiveis)
  };
}

// ---------- 4. DOM: criar os elementos e desenhar a tela ----------

// Cria um botão pequeno de dentro do cartão.
// O data-acao diz para o ouvinte da lista qual botão foi clicado.
function criarBotao(acao, texto, nomeAcessivel) {
  const botao = document.createElement("button");

  botao.type = "button";
  botao.textContent = texto;
  botao.dataset.acao = acao;
  botao.setAttribute("aria-label", nomeAcessivel);
  botao.classList.add("botao-pequeno");

  return botao;
}

// Monta o item de um passeio e devolve o elemento.
// Todo texto entra por textContent, nunca por innerHTML.
function criarItem(passeio) {
  const item = document.createElement("li");
  const titulo = document.createElement("h3");
  const local = document.createElement("p");
  const descricao = document.createElement("p");
  const vagas = document.createElement("p");
  const selo = document.createElement("span");
  const botoes = document.createElement("div");

  const botaoReservar = criarBotao("reservar", "Reservar vaga", "Reservar vaga em " + passeio.nome);
  const botaoRemover = criarBotao("remover", "Remover", "Remover " + passeio.nome + " da lista");

  titulo.textContent = passeio.nome;
  local.textContent = passeio.estado + " · " + passeio.tipo;
  descricao.textContent = descreverTipo(passeio.tipo);
  vagas.textContent = "Vagas restantes: " + passeio.vagasRestantes;
  selo.textContent = passeio.faixa;
  selo.classList.add("selo");

  // Botão com estado: o aria-pressed muda junto com a reserva.
  botaoReservar.setAttribute("aria-pressed", String(passeio.reservado));
  botaoReservar.disabled = passeio.faixa === "Esgotado" && !passeio.reservado;
  botaoRemover.classList.add("botao-remover");

  botoes.classList.add("botoes-cartao");
  botoes.append(botaoReservar, botaoRemover);

  // O data-id guarda qual passeio do array este item representa.
  item.dataset.id = String(passeio.id);
  item.classList.add("cartao", classesDasFaixas[passeio.faixa]);
  if (passeio.reservado) {
    item.classList.add("reservado");
  }
  item.append(titulo, local, descricao, vagas, selo, botoes);

  return item;
}

// Item mostrado quando nenhum passeio combina com a busca.
function criarItemVazio() {
  const item = document.createElement("li");

  item.textContent = "Nenhum passeio encontrado. Tente outra busca ou mude os filtros.";
  item.classList.add("cartao-vazio");

  return item;
}

// Escreve o resumo na página (o parágrafo tem aria-live, então o leitor de tela avisa a mudança).
function escreverResumo(resumo) {
  if (areaResumo === null) {
    return;
  }

  let texto = `Mostrando ${resumo.mostrando} de ${resumo.total} passeios.`;

  if (resumo.mostrando === 0) {
    texto += " Nenhum passeio encontrado.";
  } else {
    texto += ` ${resumo.vagasLivres} vagas livres em ${resumo.comVagas} passeios.`;
    texto += ` Reservas feitas: ${resumo.reservas}.`;

    if (resumo.primeiro !== null) {
      texto += ` Primeiro com vagas: ${resumo.primeiro.nome}.`;
    }
  }

  areaResumo.textContent = texto;
}

// Lê o array, aplica os filtros, troca o conteúdo da lista e atualiza o resumo.
function desenhar() {
  if (areaLista === null) {
    return;
  }

  const analisados = analisarPasseios(passeios);
  const visiveis = filtrarPasseios(analisados, filtros);
  const itens = visiveis.map(criarItem);

  if (itens.length === 0) {
    itens.push(criarItemVazio());
  }

  areaLista.replaceChildren(...itens);
  escreverResumo(calcularResumo(visiveis, analisados.length));
}

// ---------- 5. Eventos ----------

// Menu (botão hambúrguer): aria-expanded muda junto com o menu aberto/fechado.
function definirMenu(aberto) {
  botaoMenu.setAttribute("aria-expanded", String(aberto));
  botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  menu.classList.toggle("aberto", aberto);
}

function alternarMenu() {
  const estaAberto = botaoMenu.getAttribute("aria-expanded") === "true";
  definirMenu(!estaAberto);
}

// Escape fecha o menu e devolve o foco para o botão.
function fecharMenuComEscape(evento) {
  const estaAberto = botaoMenu.getAttribute("aria-expanded") === "true";

  if (evento.key === "Escape" && estaAberto) {
    definirMenu(false);
    botaoMenu.focus();
  }
}

// No celular, escolher um link fecha o menu.
function fecharMenuAoEscolherLink(evento) {
  if (evento.target.closest("a") !== null) {
    definirMenu(false);
  }
}

function iniciarMenu() {
  if (botaoMenu === null || menu === null) {
    return;
  }

  botaoMenu.addEventListener("click", alternarMenu);
  menu.addEventListener("click", fecharMenuAoEscolherLink);
  document.addEventListener("keydown", fecharMenuComEscape);
}

// Busca, filtro por tipo e botão "Só com vagas": cada um muda um valor
// de "filtros" e chama a mesma função desenhar().
function aoDigitarBusca(evento) {
  filtros.texto = evento.target.value;
  desenhar();
}

function aoMudarTipo(evento) {
  filtros.tipo = evento.target.value;
  desenhar();
}

function alternarSoComVagas() {
  filtros.soComVagas = !filtros.soComVagas;
  botaoSoVagas.setAttribute("aria-pressed", String(filtros.soComVagas));
  desenhar();
}

function iniciarFiltros() {
  if (campoBusca === null || filtroTipo === null || botaoSoVagas === null) {
    return;
  }

  campoBusca.addEventListener("input", aoDigitarBusca);
  filtroTipo.addEventListener("change", aoMudarTipo);
  botaoSoVagas.addEventListener("click", alternarSoComVagas);
}

// Ações que alteram o array (os dados), sem mexer na tela.
function alternarReserva(id) {
  const passeio = passeios.find((item) => item.id === id);

  if (passeio === undefined) {
    return;
  }

  if (passeio.reservado) {
    passeio.reservado = false;
    passeio.inscritos = passeio.inscritos - 1;
  } else if (calcularVagasRestantes(passeio.vagas, passeio.inscritos) > 0) {
    passeio.reservado = true;
    passeio.inscritos = passeio.inscritos + 1;
  }
}

function removerPasseio(id) {
  const posicao = passeios.findIndex((item) => item.id === id);

  if (posicao !== -1) {
    passeios.splice(posicao, 1);
  }
}

// Depois de desenhar de novo o botão antigo some, então o foco volta para o botão novo
// (ou para a lista, se o passeio foi removido).
function devolverFoco(id, acao) {
  if (acao === "reservar") {
    const botao = areaLista.querySelector(`li[data-id="${id}"] button[data-acao="reservar"]`);

    if (botao !== null) {
      botao.focus();
      return;
    }
  }

  areaLista.focus();
}

// Um único ouvinte na lista (delegação de eventos).
// Funciona também para os itens criados depois, porque o ouvinte está no <ul>.
function tratarCliqueLista(evento) {
  const botao = evento.target.closest("button[data-acao]");

  if (botao === null) {
    return;
  }

  const item = botao.closest("li[data-id]");

  if (item === null) {
    return;
  }

  const id = Number(item.dataset.id);
  const acao = botao.dataset.acao;

  if (acao === "reservar") {
    alternarReserva(id);
  } else if (acao === "remover") {
    removerPasseio(id);
  }

  desenhar();
  devolverFoco(id, acao);
}

function iniciarLista() {
  if (areaLista === null) {
    return;
  }

  areaLista.addEventListener("click", tratarCliqueLista);
}

// Formulário: cria um passeio novo, coloca no array e desenha de novo.
function adicionarPasseio(evento) {
  evento.preventDefault();

  const nome = formulario.elements["nome"].value.trim();
  const estado = formulario.elements["estado"].value.trim().toUpperCase();
  const tipo = formulario.elements["tipo"].value;
  const vagas = Number(formulario.elements["vagas"].value);

  if (nome === "" || estado.length !== 2 || tipo === "" || Number.isNaN(vagas) || vagas < 1) {
    mensagemFormulario.textContent = "Confira os campos: preencha o nome, a sigla do estado, o tipo e as vagas.";
    return;
  }

  const novoPasseio = {
    id: proximoId,
    nome: nome,
    estado: estado,
    tipo: tipo,
    vagas: vagas,
    inscritos: 0,
    reservado: false
  };

  passeios.push(novoPasseio);
  proximoId++;
  formulario.reset();
  desenhar();

  // Avisa se os filtros atuais estão escondendo o passeio novo.
  const aparece = filtrarPasseios(analisarPasseios([novoPasseio]), filtros).length > 0;

  mensagemFormulario.textContent = aparece
    ? `Passeio "${nome}" cadastrado.`
    : `Passeio "${nome}" cadastrado, mas os filtros atuais escondem esse passeio.`;
}

function iniciarFormulario() {
  if (formulario === null || mensagemFormulario === null) {
    return;
  }

  formulario.addEventListener("submit", adicionarPasseio);
}

// ---------- 6. Gráfico em Canvas ----------
const indicadores = [
  { nome: "Transporte", valor: 78 },
  { nome: "Comércio local", valor: 64 },
  { nome: "Menos resíduos", valor: 52 }
];

function iniciarGrafico() {
  const canvas = document.querySelector("#grafico-canvas");

  if (canvas === null) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const larguraBarra = 90;
  const espaco = 95;
  const baseY = 270;
  const escala = 2.2;
  const maiorValor = Math.max(...indicadores.map((item) => item.valor));
  let progresso = 0;

  function desenharQuadro() {
    // clearRect apaga o quadro anterior antes de desenhar de novo
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#24352d";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "start";
    ctx.fillText("Indicadores de turismo consciente", 30, 34);

    ctx.strokeStyle = "#8a9a91";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(35, baseY);
    ctx.lineTo(canvas.width - 30, baseY);
    ctx.stroke();

    indicadores.forEach((item, indice) => {
      const x = 65 + indice * (larguraBarra + espaco);
      const alturaFinal = item.valor * escala;
      const alturaAtual = Math.min(progresso * escala, alturaFinal);
      const y = baseY - alturaAtual;

      ctx.fillStyle = "#287653";
      ctx.fillRect(x, y, larguraBarra, alturaAtual);

      ctx.fillStyle = "#174c3a";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(item.valor + "%", x + larguraBarra / 2, y - 10);

      ctx.fillStyle = "#5b6b63";
      ctx.font = "14px Arial";
      ctx.fillText(item.nome, x + larguraBarra / 2, baseY + 28);
    });
  }

  // requestAnimationFrame chama a função de novo no próximo quadro da tela
  function animarQuadro() {
    progresso += 1.8;
    desenharQuadro();

    if (progresso < maiorValor) {
      requestAnimationFrame(animarQuadro);
    }
  }

  desenharQuadro();
  requestAnimationFrame(animarQuadro);
}

// ---------- 7. Início ----------
// Cada recurso registra o seu ouvinte uma única vez, aqui no final do arquivo.
iniciarMenu();
iniciarFiltros();
iniciarLista();
iniciarFormulario();
iniciarGrafico();
desenhar();
