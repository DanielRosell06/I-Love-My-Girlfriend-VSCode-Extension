"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
class SimpleWebviewViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    // Método principal que resolve a visualização da Webview
    resolveWebviewView(webviewView, context, _token) {
        // Configurações para permitir scripts na Webview
        webviewView.webview.options = {
            enableScripts: true,
        };
        // Caminho da pasta de imagens
        const imagesPath = path.join(this._extensionUri.fsPath, 'images');
        // Obtém os nomes dos arquivos na pasta de imagens
        const fileNames = this.getFileNames(imagesPath);
        // Configura o HTML da Webview com as imagens carregadas
        webviewView.webview.html = this.getSimpleWebviewContent(webviewView.webview, fileNames);
        // Listener para mensagens enviadas do HTML para o backend
        webviewView.webview.onDidReceiveMessage((message) => {
            if (message.command === 'openFolder') {
                this.openFolder(imagesPath);
            }
        });
    }
    // Gera o conteúdo HTML da Webview
    getSimpleWebviewContent(webview, fileNames) {
        // Caminho da imagem principal
        const imagePath = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'images', 'doom0.png'));
        const borderPath = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'love-border.png'));
        // Gera o HTML para exibir as imagens dinamicamente
        const imagesHtml = fileNames
            .map((fileName) => `<img src="${webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'images', fileName))}" alt="${fileName}" class="girlfriend-image"/>`)
            .join('');
        // Retorna o HTML completo
        return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              text-align: center;
            }
            img {
              max-width: 100%;
              height: auto;
              margin: 10px 0;
            }
            #openFolder {
              padding: 10px 20px;
              font-size: 16px;
              cursor: pointer;
              margin-top: 110vw;
              margin-left: auto;
              margin-right: auto;
              background-color: rgb(255, 118, 193);
              border-radius: 30px;
              box-shadow: 0 5px 0 rgb(209, 82, 152);
              border: none;
              color: white;
            }
            .image-container {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 10px;
            }

            .image-content {
              position: relative;
            }

            .girlfriend-image {
              display: none;
            }

            .active{
              display: block;
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              width: 87vw;
              height: 87vw;
              object-fit: cover;
              border: none;
              margin-top: 10.46vw;
              margin-left: auto;
              margin-right: auto;
              z-index: -1000;
            }

            .image-border{
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              width: 100vw;
              height: 100vw;
              object-fit: cover;
              border-radius: 10px;
              border: none;
              z-index: 1000;
              margin-left: auto;
              margin-right: auto;
            }

            .warning{
              font-size: 12px;
              color:rgb(255, 51, 163);}
          </style>
        </head>
        <body>
          <div class="image-container">
            <div clas="image-content">
              <img src="${borderPath}" alt="border" class="image-border"/>
              ${imagesHtml}
            </div>
          </div>
          <button id="openFolder">Open Images Folder</button>
          <p class="warning">* You need to reestart VSCode to upload new photos!</p>
          <script>

            // Função para alternar as imagens
            const images = document.querySelectorAll('.girlfriend-image');
            images[0].classList.add('active');
            let index = 0;
            setInterval(() => {
              images.forEach((image) => {
                image.classList.remove('active');
              });
              images[index].classList.add('active');
              index = (index + 1) % images.length;
            }, 3000);


            // Configuração para comunicação com a extensão
            const vscode = acquireVsCodeApi();
            document.getElementById('openFolder').addEventListener('click', () => {
              vscode.postMessage({ command: 'openFolder' });
            });
          </script>
        </body>
      </html>
    `;
    }
    // Abre a pasta de imagens no explorador de arquivos do sistema
    openFolder(folderPath) {
        // Verifica se a pasta existe
        if (!fs.existsSync(folderPath)) {
            vscode.window.showErrorMessage(`Folder not found: ${folderPath}`);
            return;
        }
        const platform = os.platform();
        // Executa o comando correto baseado no sistema operacional
        if (platform === 'win32') {
            (0, child_process_1.exec)(`start "" "${folderPath}"`);
        }
        else if (platform === 'darwin') {
            (0, child_process_1.exec)(`open "${folderPath}"`);
        }
        else {
            (0, child_process_1.exec)(`xdg-open "${folderPath}"`);
        }
    }
    // Obtém os nomes dos arquivos em uma pasta
    getFileNames(folderPath) {
        // Verifica se a pasta existe
        if (!fs.existsSync(folderPath)) {
            vscode.window.showErrorMessage(`Folder not found: ${folderPath}`);
            return [];
        }
        try {
            // Lê o conteúdo da pasta e retorna os nomes dos arquivos
            return fs.readdirSync(folderPath);
        }
        catch (err) {
            // Captura erros ao tentar ler a pasta
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            vscode.window.showErrorMessage(`Error reading folder: ${errorMessage}`);
            return [];
        }
    }
}
// Define o tipo de visualização da Webview
SimpleWebviewViewProvider.viewType = 'ilovemygirlfriend.openview';
// Função de ativação da extensão
function activate(context) {
    const provider = new SimpleWebviewViewProvider(context.extensionUri);
    // Registra o provedor de Webview
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(SimpleWebviewViewProvider.viewType, provider));
    // Registra o comando para focar a visualização
    let disposableShowSimplePanel = vscode.commands.registerCommand("ilovemygirlfriend.openview.focus", () => {
        vscode.commands.executeCommand('workbench.view.extension.custom-activitybar');
    });
    // Adiciona o comando aos registros da extensão
    context.subscriptions.push(disposableShowSimplePanel);
}
// Função de desativação da extensão
function deactivate() { }
//# sourceMappingURL=extension.js.map