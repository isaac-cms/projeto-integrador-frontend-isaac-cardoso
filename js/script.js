// EcoTrip — js/script.js
// Tema: vagas dos passeios do EcoTrip.
// Entrada: lista de passeios (nome, estado, tipo, vagas e inscritos).
// Processamento: calcular as vagas restantes, classificar cada passeio e resumir.
// Saída: cartões e um resumo mostrados na página, e um gráfico em Canvas.
//
// Pseudocódigo:
// 1. Criar a lista de passeios.
// 2. Calcular as vagas restantes de cada passeio.
// 3. Classificar o passeio: esgotado, últimas vagas ou disponível.
// 4. Contar os passeios com vagas, somar as vagas livres e achar o maior.
// 5. Criar um cartão para cada passeio e mostrar na página junto com o resumo.

// ---------- 1. Dados ----------
// Fonte de verdade: a lista da tela é montada a partir deste array.
const passeios = [
  { id: 1, nome: "Chapada dos Veadeiros", estado: "GO", tipo: "Trilha", vagas: 20, inscritos: 12 },
  { id: 2, nome: "Fernando de Noronha", estado: "PE", tipo: "Praia", vagas: 10, inscritos: 9 },
  { id: 3, nome: "Floresta Amazônica", estado: "AM", tipo: "Ecoturismo", vagas: 15, inscritos: 6 },
  { id: 4, nome: "Pantanal", estado: "MT", tipo: "Ecoturismo", vagas: 12, inscritos: 12 },
  { id: 5, nome: "Lençóis Maranhenses", estado: "MA", tipo: "Praia", vagas: 16, inscritos: 15 },
  { id: 6, nome: "Bonito", estado: "MS", tipo: "Aventura", vagas: 8, inscritos: 3 }
];

// Variável global: pode ser usada dentro de qualquer função deste arquivo.
const limiteUltimasVagas = 3;

// Cada faixa tem uma classe no CSS para mudar a cor do cartão.
const classesDasFaixas = {
  "Esgotado": "esgotado",
  "Últimas vagas": "ultimas-vagas",
  "Disponível": "disponivel"
};

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
      vagasRestantes: vagasRestantes,
      faixa: classificarDisponibilidade(vagasRestantes)
    };
  });
}

// Usa o filter para contar os passeios com vagas
// e o reduce para achar o passeio com mais vagas.
function gerarResumo(lista) {
  if (lista.length === 0) {
    return "Nenhum passeio cadastrado.";
  }

  const comVagas = lista.filter((passeio) => passeio.vagasRestantes > 0);
  const maisVagas = lista.reduce((maior, passeio) => {
    return passeio.vagasRestantes > maior.vagasRestantes ? passeio : maior;
  }, lista[0]);
  const primeiro = buscarPrimeiroComVagas(lista);

  let texto = `Resumo: ${somarVagasLivres(lista)} vagas livres em ${comVagas.length} de ${lista.length} passeios.`;
  texto += ` Mais vagas: ${maisVagas.nome} (${maisVagas.vagasRestantes}).`;

  if (primeiro !== null) {
    texto += ` Primeiro da lista com vagas: ${primeiro.nome}.`;
  }

  return texto;
}

// ---------- 4. DOM: criar os cartões e mostrar na página ----------

// Monta o cartão de um passeio e devolve o elemento.
function criarCartao(passeio) {
  const cartao = document.createElement("li");
  const titulo = document.createElement("h3");
  const local = document.createElement("p");
  const descricao = document.createElement("p");
  const vagas = document.createElement("p");
  const selo = document.createElement("span");

  titulo.textContent = passeio.nome;
  local.textContent = passeio.estado + " · " + passeio.tipo;
  descricao.textContent = descreverTipo(passeio.tipo);
  vagas.textContent = "Vagas restantes: " + passeio.vagasRestantes;
  selo.textContent = passeio.faixa;
  selo.classList.add("selo");

  cartao.classList.add("cartao", classesDasFaixas[passeio.faixa]);
  cartao.append(titulo, local, descricao, vagas, selo);

  return cartao;
}

// Escolhe os lugares da página e insere o resultado.
function mostrarNaPagina(lista, textoResumo) {
  const areaLista = document.querySelector("#lista-passeios");
  const areaResumo = document.querySelector("#resumo");

  if (areaLista === null || areaResumo === null) {
    return;
  }

  areaResumo.textContent = textoResumo;

  for (const passeio of lista) {
    areaLista.append(criarCartao(passeio));
  }
}

// ---------- 5. Gráfico em Canvas ----------
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

// ---------- 6. Início ----------
const passeiosAnalisados = analisarPasseios(passeios);
const textoResumo = gerarResumo(passeiosAnalisados);

mostrarNaPagina(passeiosAnalisados, textoResumo);
iniciarGrafico();
