/* ============================================================
   FATORES DE EMISSÃO (kg CO₂ por unidade)
   Fontes: MME/MCTI, GHG Protocol Brasil, IPCC
   ============================================================ */
const FATORES = {
  energia:  0.0758,
  diesel:   2.6,
  gasolina: 1.8,
  etanol:   1.1,
  glp:      2.98
};

const ROTULOS = {
  energia:  "Energia elétrica",
  diesel:   "Diesel",
  gasolina: "Gasolina",
  etanol:   "Etanol",
  glp:      "GLP / Gás"
};

const UNIDADES = {
  energia:  "kWh",
  diesel:   "L",
  gasolina: "L",
  etanol:   "L",
  glp:      "kg"
};

/* ---------- DOM ---------- */
const form        = document.getElementById("pegada-form");
const resultados  = document.getElementById("resultados");
const totalMensal = document.getElementById("total-mensal");
const totalAnual  = document.getElementById("total-anual");
const tabelaBody  = document.querySelector("#tabela-detalhe tbody");
const planoEl     = document.getElementById("plano-reducao");

/* ---------- Submit ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const consumos = {
    energia:  parseFloat(document.getElementById("energia").value)  || 0,
    diesel:   parseFloat(document.getElementById("diesel").value)   || 0,
    gasolina: parseFloat(document.getElementById("gasolina").value) || 0,
    etanol:   parseFloat(document.getElementById("etanol").value)   || 0,
    glp:      parseFloat(document.getElementById("glp").value)      || 0
  };

  const emissoes = {};
  let totalKgMes = 0;

  for (const chave in consumos) {
    const emissao = consumos[chave] * FATORES[chave];
    emissoes[chave] = emissao;
    totalKgMes += emissao;
  }

  const totalTonMes = totalKgMes / 1000;
  const totalTonAno = totalTonMes * 12;

  totalMensal.textContent = totalTonMes.toFixed(2) + " t CO₂";
  totalAnual.textContent  = totalTonAno.toFixed(2) + " t CO₂";

  /* Tabela */
  tabelaBody.innerHTML = "";
  for (const chave in consumos) {
    if (consumos[chave] === 0 && emissoes[chave] === 0) continue;

    const percentual = totalKgMes > 0 ? (emissoes[chave] / totalKgMes) * 100 : 0;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ROTULOS[chave]}</td>
      <td>${consumos[chave].toLocaleString("pt-BR")} ${UNIDADES[chave]}</td>
      <td>${emissoes[chave].toFixed(1)}</td>
      <td>${percentual.toFixed(1)}%</td>
    `;
    tabelaBody.appendChild(tr);
  }

  /* Plano */
  planoEl.innerHTML = gerarPlano(consumos, emissoes, totalKgMes);

  /* Mostrar + animar */
  resultados.classList.remove("hidden");
  resultados.style.animation = "none";
  void resultados.offsetHeight;   // força reflow para reiniciar a animação
  resultados.style.animation = "";
  resultados.scrollIntoView({ behavior: "smooth", block: "start" });
});

/* ============================================================
   GERADOR DO PLANO DE REDUÇÃO
   ============================================================ */
function gerarPlano(consumos, emissoes, totalKg) {
  const sugestoes = [];

  if (totalKg === 0) {
    return "<p>Sem consumo registado. Insira os dados para receber o plano.</p>";
  }

  if (emissoes.energia > 0) {
    const share = (emissoes.energia / totalKg) * 100;

    if (share >= 30) {
      sugestoes.push({
        titulo: "⚡ Eficiência energética é prioridade",
        itens: [
          "Substitua lâmpadas fluorescentes e incandescentes por <strong>LED</strong> — redução de até 50 % na iluminação.",
          "Instale <strong>temporizadores ou sensores de presença</strong> em áreas de pouca circulação.",
          "Faça <strong>manutenção periódica</strong> de ar-condicionado, freezers e câmaras frias.",
          "Avalie a migração para o <strong>mercado livre de energia</strong>."
        ]
      });
    } else {
      sugestoes.push({
        titulo: "⚡ Ajustes na energia elétrica",
        itens: [
          "Revise equipamentos em <em>standby</em> fora do expediente.",
          "Substitua equipamentos antigos por modelos com <strong>selo Procel A</strong>."
        ]
      });
    }
  }

  if (emissoes.diesel > 0) {
    sugestoes.push({
      titulo: "🚚 Diesel: logística e manutenção",
      itens: [
        "Agrupe entregas e compras para <strong>reduzir viagens</strong>.",
        "Mantenha pneus calibrados — até <strong>10 % de economia</strong>.",
        "Considere veículos mais leves ou elétricos para entregas urbanas."
      ]
    });
  }

  if (emissoes.gasolina > 0) {
    sugestoes.push({
      titulo: "🚗 Gasolina: hábitos de condução",
      itens: [
        "Evite acelerações bruscas — pode economizar <strong>15–20 %</strong>.",
        "Planeje rotas para evitar congestionamentos.",
        "Para deslocações curtas, avalie bicicleta ou entrega a pé."
      ]
    });
  }

  if (emissoes.etanol > 0) {
    sugestoes.push({
      titulo: "🌿 Etanol: alternativa de baixo carbono",
      itens: [
        "O etanol já é mais limpo que a gasolina — mantenha o uso.",
        "Verifique se o fornecedor tem <strong>certificação RenovaBio</strong>."
      ]
    });
  }

  if (emissoes.glp > 0) {
    sugestoes.push({
      titulo: "🔥 GLP: uso eficiente",
      itens: [
        "Tampe panelas ao cozinhar e ajuste a chama ao tamanho do fundo.",
        "Faça <strong>manutenção nos queimadores</strong> e verifique vazamentos.",
        "Avalie equipamentos de cozinha mais eficientes (classe A)."
      ]
    });
  }

  sugestoes.push({
    titulo: "🎯 Meta prática para 12 meses",
    itens: [
      `Sua pegada mensal é de <strong>${(totalKg / 1000).toFixed(2)} t CO₂</strong>. Meta inicial: reduzir <strong>5–10 %</strong> em 12 meses (${((totalKg / 1000) * 0.05).toFixed(2)}–${((totalKg / 1000) * 0.1).toFixed(2)} t CO₂/mês).`,
      "Escolha <strong>duas ações</strong> e defina responsáveis e prazos.",
      "Reavalie a calculadora a cada 3 meses."
    ]
  });

  let html = "";
  sugestoes.forEach((bloco) => {
    html += `<h3>${bloco.titulo}</h3><ul>`;
    bloco.itens.forEach((item) => {
      html += `<li>${item}</li>`;
    });
    html += "</ul>";
  });

  return html;
}