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
// Uso: node update-version.js --windows 0.1.10 [--windows-file caminho/pro.exe]
//      node update-version.js --android 0.1.9 [--android-file caminho/pro.apk]
//      node update-version.js --windows 0.1.10 --android 0.1.9
//
// --windows-file/--android-file são opcionais: se passados, o hash SHA-256
// do arquivo local é calculado e gravado (windowsSha256/androidSha256), pra
// quem baixar poder conferir que o instalador não foi trocado (o instalador
// não é assinado digitalmente - ver nota no site). Normalmente isso não
// precisa ser rodado à mão: o workflow sync-version.yml já preenche esses
// campos sozinho a partir do hash que o próprio GitHub calcula pra cada
// asset de release.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const versionPath = path.join(__dirname, "version.json");
const current = fs.existsSync(versionPath) ? JSON.parse(fs.readFileSync(versionPath, "utf8")) : {};

const args = process.argv.slice(2);
const windowsIdx = args.indexOf("--windows");
const androidIdx = args.indexOf("--android");
const windowsFileIdx = args.indexOf("--windows-file");
const androidFileIdx = args.indexOf("--android-file");
const windowsVersion = windowsIdx !== -1 ? args[windowsIdx + 1] : null;
const androidVersion = androidIdx !== -1 ? args[androidIdx + 1] : null;
const windowsFile = windowsFileIdx !== -1 ? args[windowsFileIdx + 1] : null;
const androidFile = androidFileIdx !== -1 ? args[androidFileIdx + 1] : null;

if (!windowsVersion && !androidVersion) {
  console.error("Uso: node update-version.js --windows 0.1.10 --android 0.1.9 (pelo menos um dos dois)");
  process.exit(1);
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
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
  windowsSha256: windowsFile ? sha256File(windowsFile) : (current.windowsSha256 ?? null),
  androidSha256: androidFile ? sha256File(androidFile) : (current.androidSha256 ?? null),
};

fs.writeFileSync(versionPath, JSON.stringify(data, null, 2) + "\n");
console.log("version.json atualizado:", data);
