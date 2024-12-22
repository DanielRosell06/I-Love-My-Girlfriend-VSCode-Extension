import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { exec } from 'child_process';

class SimpleWebviewViewProvider implements vscode.WebviewViewProvider {
  // Define o tipo de visualização da Webview
  public static readonly viewType = 'ilovemygirlfriend.openview';

  constructor(private readonly _extensionUri: vscode.Uri) {}

  // Método principal que resolve a visualização da Webview
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    // Configurações para permitir scripts na Webview
    webviewView.webview.options = {
      enableScripts: true,
    };

    // Obtem o nome dos arquivos na pasta de imagens
    const imagesPath = path.join(this._extensionUri.fsPath, 'images');
    const fileNames = this.getFileNames(imagesPath);

    // Obtém os nomes dos arquivos na pasta de imagens
    const bordersPath = path.join(this._extensionUri.fsPath, 'assets', 'borders');
    const borderFileNames = this.getFileNames(bordersPath);

    // Configura o HTML da Webview com as imagens carregadas
    webviewView.webview.html = this.getSimpleWebviewContent(webviewView.webview, fileNames, borderFileNames);

    // Listener para mensagens enviadas do HTML para o backend
    webviewView.webview.onDidReceiveMessage((message) => {

      // Verifica se a mensagem é para abrir a pasta de imagens
      if (message.command === 'openFolder') {
        this.openFolder(imagesPath);
      }

      //Verifica se a mensagem é para atualizar as imagens
      if (message.command === 'refreshImages') {
        const newFileNames = this.getFileNames(imagesPath);
        webviewView.webview.html = this.getSimpleWebviewContent(webviewView.webview, newFileNames, borderFileNames);
      }
    });
  }

  // Gera o conteúdo HTML da Webview
  private getSimpleWebviewContent(webview: vscode.Webview, fileNames: string[], borderFileNames: string[]): string {

    // Caminho da imagem de borda
    const borderPath = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'borders', 'love-border-00.png'));
    const bordersHtml = borderFileNames
      .map(
        (fileName) => `<img src="${webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'borders', fileName))}" alt="border" class="image-border"/>`
      )
     .join('');

    //<img src="${borderPath}" alt="border" class="image-border"/>

    // Gera o HTML para exibir as imagens dinamicamente
    const imagesHtml = fileNames
      .map(
        (fileName) => `<img src="${webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'images', fileName))}" alt="${fileName}" class="girlfriend-image"/>`
      )
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

            #refreshImages {
              width: 80%;
              padding: 10px 20px;
              font-size: 16px;
              cursor: pointer;
              margin-top: 10px;
              margin-left: auto;
              margin-right: auto;
              background-color: rgb(255, 255, 255);
              border-radius: 30px;
              box-shadow: 0 5px 0 rgb(248, 196, 225);
              border: none;
              color: rgb(204, 8, 116);
              transition: all 0.1s ease-in-out;
            }
            #refreshImages:active {
              transform: translateY(5px);
              background-color: rgb(248, 196, 225);
              box-shadow: 0 0 0 rgb(228, 148, 192);
            }

              
            #openFolder {
              width: 80%;
              padding: 10px 20px;
              font-size: 16px;
              cursor: pointer;
              margin-left: auto;
              margin-right: auto;
              background-color: rgb(255, 118, 193);
              border-radius: 30px;
              box-shadow: 0 5px 0 rgb(209, 82, 152);
              border: none;
              color: white;
              transition: all 0.1s ease-in-out;
              margin-top: 10px;
            }
            #openFolder:active {
              transform: translateY(5px);
              background-color: rgb(209, 82, 152);
              box-shadow: 0 0 0 rgb(182, 53, 124);
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
              opacity: 0;
              transition: all 0.5s ease-in-out;
            }           
            .active{
              opacity: 1;
            }

            .image-border{
              display: none;
            }

            .border-active{
              display: block;
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

            .checkbox-container{
              display: flex;
              justify-content: center;
              align-items: center;
              margin-top: 102vw;
            }

            .change-images-button{
              display: none; 
            }

            .change-images-button-active {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: 100%;
              width: 30px;
              height: 30px;
              color: white;
              background-color: rgb(255, 118, 193);
              border: none;
              cursor: pointer;
              font-size: 16px;
              box-shadow: 0 5px 0 rgb(209, 82, 152);
              transition: all 0.1s ease-in-out;
              margin-left: 10px;
            }

            .change-images-button-active:active {
              transform: translateY(5px);
              background-color: rgb(209, 82, 152);
              box-shadow: 0 0 0 rgb(182, 53, 124);
            }

            #checkbox {
              appearance: none;
              width: 20px;
              height: 20px;
              border: 2px solid #ccc;
              border-radius: 4px;
              background-color: #fff;
              cursor: pointer;
              transition: background-color 0.3s, border-color 0.3s;
            }

            #checkbox:checked {
              background-color: #ff76c1; /* Cor do fundo quando ativado */
              border-color: #d15298; /* Cor da borda quando ativado */
            }
            #checkbox:checked::before {
              content: '✔'; /* Caractere ou ícone de marcação */
              display: flex;
              align-items: center;
              justify-content: center;
              color: white; /* Cor da marca */
              font-size: 14px;
            }

            .border-control-container{
              display: flex;
              justify-content: center;
              width: 100%;
              margin-top: 10px;
              height: 30px;
              margin-bottom: 30px;
            }

            .border-control-content{
              display: flex;
              justify-content: space-between;
              width: 80%;
            }

            .border-control-button{
              border-radius: 100%;
              width: 30px;
              height: 30px;
              color: white;
              background-color: rgb(255, 118, 193);
              border: none;
              cursor: pointer;
              font-size: 16px;
              box-shadow: 0 5px 0 rgb(209, 82, 152);
              transition: all 0.1s ease-in-out;
            }
            .border-control-button:active{
              transform: translateY(5px);
              background-color: rgb(209, 82, 152);
              box-shadow: 0 0 0 rgb(182, 53, 124);
            }

            .slide-pointer{
              width: 7px;
              height: 7px;
              border-radius: 100%;
              background-color: rgb(230, 110, 176);
              transition: all 0.1s ease-in-out;
              margin-top: auto;
              margin-bottom: auto;
            }

            .slide-pointer-active{
              width: 10px;
              height: 10px;
              background-color: rgb(224, 60, 151);
            }



          </style>
        </head>
        <body>
          <div class="image-container">
            <div clas="image-content">
              ${bordersHtml}
              ${imagesHtml}
            </div>
          </div>

          <div class="checkbox-container">
            <input type="checkbox" id="checkbox">
            <h3>Static image<h3>
            <div class="checkbox-buttons-container"></div>
              <button id="change-images-left" class="change-images-button"><</button>
              <button id="change-images-right" class="change-images-button">></button>
            </div>
          </div>
          
          <h3>Change the border</h3>

          <did class="border-control-container">
            <did class="border-control-content">
              <button id="borders-control-left" class="border-control-button"> < </button>
              <div class="slide-pointer slide-pointer-active"></div>
              <div class="slide-pointer"></div>
              <div class="slide-pointer"></div>
              <div class="slide-pointer"></div>
              <div class="slide-pointer"></div>
              <div class="slide-pointer"></div>
              <div class="slide-pointer"></div>
              <button id="borders-control-right" class="border-control-button"> > </button>
            </did>
          </did>
          <button id="openFolder">Open Images Folder</button>
          <button id="refreshImages">Refresh Images</button>



          <script>

            //Função para alternar as bordas

            const leftControler = document.getElementById('borders-control-left');
            const rightControler = document.getElementById('borders-control-right');
            const borders = document.querySelectorAll('.image-border');
            const pointers = document.querySelectorAll('.slide-pointer');
            borders[0].classList.add('border-active');
            let indexBorder = 0;

            
            function changeBorder(index){
              borders.forEach((border) => {
                border.classList.remove('border-active');
              });
              pointers.forEach((pointer) => {
                pointer.classList.remove('slide-pointer-active');
              });
              borders[index].classList.add('border-active');
              pointers[index].classList.add('slide-pointer-active');
            }


            leftControler.addEventListener('click', () => {
              indexBorder = (indexBorder - 1 + borders.length) % borders.length;
              changeBorder(indexBorder);
            });

            rightControler.addEventListener('click', () => {
              indexBorder = (indexBorder + 1) % borders.length;
              changeBorder(indexBorder);
            });
            


            // Função para alternar as imagens

            const images = document.querySelectorAll('.girlfriend-image');
            images[0].classList.add('active');
            let index = 0;
            function iniciarSlide(){
                changeINterval = setInterval(() => {
                images.forEach((image) => {
                    image.classList.remove('active');
                });
                images[index].classList.add('active');
                index = (index + 1) % images.length;
                }, 6000);
            }
            iniciarSlide();



            // Programando a checkbox

            checkbox = document.getElementById('checkbox');
            changeImagesButton = document.querySelectorAll('.change-images-button');
            checkbox.addEventListener('change', () => {
              if(checkbox.checked){
                clearInterval(changeINterval);
                changeImagesButton.forEach((button) => {
                  button.classList.add('change-images-button-active');
                });
              }
              else{
                iniciarSlide();
                changeImagesButton.forEach((button) => {
                  button.classList.remove('change-images-button-active');
                });
              }
            });


            // Programando os botões de troca de imagens

            const changeImagesLeft = document.getElementById('change-images-left');
            const changeImagesRight = document.getElementById('change-images-right');
            let buttonIndex = 0;
            changeImagesLeft.addEventListener('click', () => {
              images[buttonIndex].classList.remove('active');
              buttonIndex = (buttonIndex - 1 + images.length) % images.length;
              images[buttonIndex].classList.add('active');
            });
            changeImagesRight.addEventListener('click', () => {
              images[buttonIndex].classList.remove('active');
              buttonIndex = (buttonIndex + 1) % images.length;
              images[buttonIndex].classList.add('active');
            });



            // Configuração para comunicação com a extensão
            
            const vscode = acquireVsCodeApi();
            document.getElementById('openFolder').addEventListener('click', () => {
              vscode.postMessage({ command: 'openFolder' });
            });

            document.getElementById('refreshImages').addEventListener('click', () => {
              vscode.postMessage({ command: 'refreshImages' });
            });

          </script>
        </body>
      </html>
    `;
  }

  // Abre a pasta de imagens no explorador de arquivos do sistema
  private openFolder(folderPath: string): void {
    // Verifica se a pasta existe
    if (!fs.existsSync(folderPath)) {
      vscode.window.showErrorMessage(`Folder not found: ${folderPath}`);
      return;
    }

    const platform = os.platform();

    // Executa o comando correto baseado no sistema operacional
    if (platform === 'win32') {
      exec(`start "" "${folderPath}"`);
    } else if (platform === 'darwin') {
      exec(`open "${folderPath}"`);
    } else {
      exec(`xdg-open "${folderPath}"`);
    }
  }

  // Obtém os nomes dos arquivos em uma pasta
  private getFileNames(folderPath: string): string[] {
    // Verifica se a pasta existe
    if (!fs.existsSync(folderPath)) {
      vscode.window.showErrorMessage(`Folder not found: ${folderPath}`);
      return [];
    }

    try {
      // Lê o conteúdo da pasta e retorna os nomes dos arquivos
      return fs.readdirSync(folderPath);
    } catch (err) {
      // Captura erros ao tentar ler a pasta
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      vscode.window.showErrorMessage(`Error reading folder: ${errorMessage}`);
      return [];
    }
  }
}

// Função de ativação da extensão
export function activate(context: vscode.ExtensionContext) {
  const provider = new SimpleWebviewViewProvider(context.extensionUri);

  // Registra o provedor de Webview
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SimpleWebviewViewProvider.viewType,
      provider
    )
  );

  // Registra o comando para focar a visualização
  let disposableShowSimplePanel = vscode.commands.registerCommand(
    "ilovemygirlfriend.openview.focus",
    () => {
      vscode.commands.executeCommand('workbench.view.extension.custom-activitybar');
    }
  );

  // Adiciona o comando aos registros da extensão
  context.subscriptions.push(disposableShowSimplePanel);
}

// Função de desativação da extensão
export function deactivate() {}