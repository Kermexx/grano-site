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
// PC e mobile são publicados em momentos diferentes (não saem sempre
// juntos na mesma versão), então cada plataforma tem sua própria versão
// aqui - passar só uma mexe apenas naquela plataforma, mantendo a outra
// como estava.
//
// Uso: node update-version.js --windows 0.1.10
//      node update-version.js --android 0.1.9
//      node update-version.js --windows 0.1.10 --android 0.1.9
const fs = require("node:fs");
const path = require("node:path");

const versionPath = path.join(__dirname, "version.json");
const current = fs.existsSync(versionPath) ? JSON.parse(fs.readFileSync(versionPath, "utf8")) : {};

const args = process.argv.slice(2);
const windowsIdx = args.indexOf("--windows");
const androidIdx = args.indexOf("--android");
const windowsVersion = windowsIdx !== -1 ? args[windowsIdx + 1] : null;
const androidVersion = androidIdx !== -1 ? args[androidIdx + 1] : null;

if (!windowsVersion && !androidVersion) {
  console.error("Uso: node update-version.js --windows 0.1.10 --android 0.1.9 (pelo menos um dos dois)");
  process.exit(1);
}

const data = {
  windowsVersion: windowsVersion ?? current.windowsVersion ?? null,
  androidVersion: androidVersion ?? current.androidVersion ?? null,
  windowsUrl: windowsVersion
    ? `https://github.com/Kermexx/grano-site/releases/download/v${windowsVersion}/Grano-Setup-${windowsVersion}.exe`
    : (current.windowsUrl ?? null),
  androidUrl: androidVersion
    ? `https://github.com/Kermexx/grano-site/releases/download/v${androidVersion}/Grano-${androidVersion}.apk`
    : (current.androidUrl ?? null),
};

fs.writeFileSync(versionPath, JSON.stringify(data, null, 2) + "\n");
console.log("version.json atualizado:", data);
