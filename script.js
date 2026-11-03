// ===== Perguntas =====
// "a" é a área da pergunta; "t" é o texto exibido
const Q = [
  { a: "tela", t: "Passo mais tempo no celular do que gostaria?" },
  { a: "tela", t: "As notificações me distraem do que estou fazendo?" },
  { a: "tela", t: "Uso o celular na cama, até a hora de dormir?" },
  { a: "tela", t: "Sinto falta ou ansiedade quando fico sem o celular por algum tempo?" },
  { a: "serv", t: "Fico inseguro ao usar aplicativos ou sites importantes, como de banco, governo ou saúde?" },
  { a: "serv", t: "Preciso pedir ajuda a alguém para usar o celular ou outros dispositivos?" },
  { a: "serv", t: "Uso a mesma senha para vários aplicativos ou sites diferentes?" },
  { a: "info", t: "Já acreditei em uma notícia que depois descobri ser falsa?" },
  { a: "info", t: "Compartilho mensagens sem conferir de onde vieram?" },
  { a: "info", t: "Leio só o título de uma notícia antes de repassá-la para alguém?" },
];

// ===== Áreas =====
// n: nome | max: pontuação máxima | d: dicas
const A = {
  tela: {
    n: "Tempo de tela e bem-estar",
    icon: "🕐",
    max: 8,  // 4 perguntas × 2 pts
    d: [
      "Desative as notificações que não são urgentes.",
      "Deixe o celular longe da cama na hora de dormir.",
      "Combine com você mesmo momentos sem tela, como refeições e caminhadas.",
      "Perceber que o uso está demais já é um ótimo primeiro passo — tente reduzir aos poucos."
    ]
  },
  serv: {
    n: "Segurança com serviços digitais",
    icon: "🔒",
    max: 6,  // 3 perguntas × 2 pts
    d: [
      "Vá com calma e leia cada tela antes de tocar em algo.",
      "Peça ajuda a alguém de confiança, mas nunca passe senhas ou códigos.",
      "Use senhas diferentes para cada aplicativo importante — ou um gerenciador de senhas.",
      "Aumente o tamanho da letra do celular nas configurações."
    ]
  },
  info: {
    n: "Informações e notícias",
    icon: "📰",
    max: 6,  // 3 perguntas × 2 pts
    d: [
      "Veja quem publicou a notícia e se ela tem data.",
      "Procure a mesma informação em outros sites confiáveis.",
      "Leia o texto completo antes de compartilhar — títulos podem enganar.",
      "Na dúvida, não compartilhe."
    ]
  }
};

// ===== Níveis do resultado =====
// [classe de cor no CSS, texto mostrado, emoji]
const L = [
  ["n0", "Está tranquilo",    "✅"],
  ["n1", "Vale ficar atento", "⚠️"],
  ["n2", "Merece cuidado",    "🔴"]
];

// ===== Opções de resposta =====
// [texto, emoji, pontos]
const opcoes = [
  ["Sim",      "😅", 2],
  ["Às vezes", "🤔", 1],
  ["Não",      "😊", 0]
];

// ===== Montar o formulário =====
const f = document.getElementById("f");

f.innerHTML =
  Q.map((q, i) => `
    <fieldset>
      <legend>
        <span class="q-num" aria-hidden="true">${i + 1}</span>
        ${q.t}
      </legend>
      <div class="opts">
        ${opcoes.map(([l, emoji, v]) => `
          <label>
            <input type="radio" name="q${i}" value="${v}">
            <span>
              <span class="emoji" aria-hidden="true">${emoji}</span>
              ${l}
            </span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `).join("") +
  '<div class="submit-wrap noprint"><button class="btn" type="submit">Ver meu resultado →</button></div>';

// ===== Barra de progresso =====
const progressWrap  = document.getElementById("progressWrap");
const progressFill  = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const aviso         = document.getElementById("aviso");

function updateProgress() {
  let answered = 0;
  for (let i = 0; i < Q.length; i++) {
    if (f.querySelector(`input[name=q${i}]:checked`)) answered++;
  }
  const pct = Math.round((answered / Q.length) * 100);
  progressFill.style.width  = pct + "%";
  progressLabel.textContent = `${answered} de ${Q.length} respondidas`;
  if (progressWrap.hidden && answered > 0) progressWrap.hidden = false;
}

// Atualiza a barra de progresso e remove o destaque de erro
// ao responder cada pergunta — sem tocar no aviso
f.addEventListener("change", (e) => {
  updateProgress();

  const fieldset = e.target.closest("fieldset");
  if (fieldset && fieldset.classList.contains("error")) {
    fieldset.classList.remove("error");
  }
});

// ===== Calcular e mostrar o resultado =====
f.addEventListener("submit", (e) => {
  e.preventDefault();

  const s = { tela: 0, serv: 0, info: 0 };
  let primeiroErro = null;

  // Limpa erros anteriores
  f.querySelectorAll("fieldset.error").forEach(fs => fs.classList.remove("error"));

  // Soma os pontos e detecta perguntas sem resposta
  for (let i = 0; i < Q.length; i++) {
    const c = f.querySelector(`input[name=q${i}]:checked`);

    if (!c) {
      const fs = f.querySelector(`input[name=q${i}]`).closest("fieldset");
      fs.classList.add("error");
      if (!primeiroErro) primeiroErro = fs;
    } else {
      s[Q[i].a] += +c.value;
    }
  }

  // Se houver erros, exibe aviso e rola até o primeiro fieldset com problema
  if (primeiroErro) {
    aviso.hidden = false;
    primeiroErro.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  aviso.hidden = true;

  // Cria um cartão de resultado para cada área
  document.getElementById("areas").innerHTML = Object.keys(A).map((k) => {
    const r = s[k] / A[k].max;                  // proporção da pontuação
    const n = r <= 0.25 ? 0 : r <= 0.6 ? 1 : 2; // nível: 0, 1 ou 2
    const d = n === 0 ? [A[k].d[0]] : A[k].d;   // nível 0 mostra só 1 dica

    // largura da barra: pontuação baixa = barra cheia de verde, pontuação alta = barra cheia vermelha
    const barPct = Math.round(r * 100);
    const barClass = n === 0 ? "ok" : n === 1 ? "mid" : "hi";

    return `
      <div class="area level-${n}">
        <div class="area-header">
          <h3>${A[k].icon} ${A[k].n}</h3>
          <span class="tag ${L[n][0]}">${L[n][2]} ${L[n][1]}</span>
        </div>
        <div class="bar-wrap" aria-hidden="true">
          <div class="bar-fill ${barClass}" style="width:${barPct}%"></div>
        </div>
        ${n === 0
          ? "<p>Continue assim! Uma dica para manter:</p>"
          : "<p>Algumas dicas para você:</p>"}
        <ul>
          ${d.map((x) => `<li>${x}</li>`).join("")}
        </ul>
      </div>
    `;
  }).join("");

  const R = document.getElementById("resultado");
  R.hidden = false;

  // Oculta o formulário e o hero, mostra só o resultado
  document.querySelector(".hero").hidden  = true;
  f.hidden                                = true;
  aviso.hidden                            = true;

  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== Botão "Refazer" =====
document.getElementById("refazer").addEventListener("click", () => {
  f.reset();
  f.querySelectorAll("fieldset.error").forEach(fs => fs.classList.remove("error"));
  aviso.hidden = true;
  progressFill.style.width  = "0%";
  progressLabel.textContent = `0 de ${Q.length} respondidas`;
  progressWrap.hidden = true;

  // Restaura o formulário e o hero
  document.querySelector(".hero").hidden  = false;
  f.hidden                                = false;
  document.getElementById("resultado").hidden = true;

  window.scrollTo({ top: 0, behavior: "smooth" });
});