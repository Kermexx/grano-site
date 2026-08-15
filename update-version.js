// Roda depois de publicar uma release nova (PC e/ou mobile) pra atualizar
// version.json, o arquivo estático que o site lê pra montar os links de
// download. Existe porque o site ANTES buscava isso ao vivo na API do
// GitHub a cada visita - e a API sem autenticação tem limite de só 60
// requisições por hora POR IP, compartilhado entre todo mundo atrás da
// mesma rede. Bastava uma faixa razoável de visitantes reais (nem precisa
// de ataque nenhum) pra travar o download do site inteiro pra todo mundo
// daquele IP, do nada. version.json é um arquivo estático servido pelo
// GitHub Pages - sem limite nenhum.
//
// Uso: node update-version.js 0.1.9
const fs = require("node:fs");
const path = require("node:path");

const version = process.argv[2];
if (!version) {
  console.error("Uso: node update-version.js <versão, ex: 0.1.9>");
  process.exit(1);
}

const data = {
  version,
  windowsUrl: `https://github.com/Kermexx/grano-site/releases/download/v${version}/Grano-Setup-${version}.exe`,
  androidUrl: `https://github.com/Kermexx/grano-site/releases/download/v${version}/Grano-${version}.apk`,
};

fs.writeFileSync(path.join(__dirname, "version.json"), JSON.stringify(data, null, 2) + "\n");
console.log("version.json atualizado:", data);
