// Localizar uma funçao por vez
// Localizar no array o objeto correspondente a função
// Criar a decoração para os parametros e os retornos
// Identificar onde aplicar a decoração
// Salva a decoraçao e a identificaçao de onde aplicar em um objeto
// Aplica todas as decorações do objeto
// Criar um debounce para as alterações no código (lodash)

const { findDocParameters } = require('./useful_functions.js');

function decorationsManager(editor) {
    const source_code = editor.document.getText();

    const jsdoc_parameters = findDocParameters(source_code);

    console.log(jsdoc_parameters);
}

module.exports = {
    decorationsManager
};

// function activate(context) {
//     let disposable = vscode.commands.registerCommand(
//         'almost-static.almostStatic',
//         function () {
//             const applyDecorations = (editor) => {
//                 // criar um array de decorações, onde elas são adicionadas ou removidas
//                 // aplicar as decorações do array com um delay entre a digitação e a aplicação

//                 // const editor = vscode.window.activeTextEditor;
//                 const document_text = editor.document.getText();
//                 const jsdoc_result = jsdocMatches(document_text);
//                 const jsdoc_first_result = jsdoc_result[0];

//                 const function_result = functionMatches(
//                     document_text,
//                     jsdoc_first_result
//                 );

//                 const decoration_type =
//                     vscode.window.createTextEditorDecorationType(
//                         function_result.render
//                     );
//                 const text = function_result.returns;
//                 const lines = document_text.split('\n');
//                 const decorations = [];

//                 for (let i = 0; i < lines.length; i++) {
//                     const line = lines[i];

//                     if (line.includes(text)) {
//                         const start_index = line.indexOf(text);
//                         const range = new vscode.Range(
//                             new vscode.Position(i, start_index),
//                             new vscode.Position(i, start_index + text.length)
//                         );
//                         decorations.push({ range });
//                     }
//                 }

//                 editor.setDecorations(decoration_type, decorations);
//             };

//             // Executa quando um arquivo Javascript existente é aberto
//             vscode.window.onDidChangeActiveTextEditor((editor) => {
//                 if (editor && editor.document.languageId === 'javascript') {
//                     applyDecorations(editor);
//                 }
//             });

//             // Executa quando é digitado em um arquivo Javascript
//             vscode.workspace.onDidChangeTextDocument((event) => {
//                 if (event.document.languageId === 'javascript') {
//                     vscode.window.visibleTextEditors.forEach((editor) => {
//                         if (editor.document === event.document) {
//                             applyDecorations(editor);
//                         }
//                     });
//                 }
//             });

//             // vscode.window.visibleTextEditors.forEach((editor) => {
//             //     if (editor.document.languageId === 'javascript') {
//             //         applyDecorations(editor);
//             //     }
//             // });

//             // vscode.workspace.onDidOpenTextDocument((document) => {
//             //     if (document.languageId === 'javascript') {
//             //         vscode.window.visibleTextEditors.forEach((editor) => {
//             //             if (editor.document === document) {
//             //                 applyDecorations(editor);
//             //             }
//             //         });
//             //     }
//             // });
//         }
//     );

//     context.subscriptions.push(disposable);
// }

// const text = `
// /**
//  * @function exemplo
//  * @param {string} texto descrição do parâmetro de texto
//  * @param {number} numero descrição do parâmetro de numero
//  * @returns {string} retorno da função
//  */
// function exemplo(numero, texto) {
//     return numero + texto;
// }

// /**
//  * @function teste
//  * @param {boolean} booleano descrição do parâmetro de booleano
//  * @returns {boolean} retorno da função
//  */
// function teste(booleano) {
//     return booleano;
// }
// `;

// function functionMatches(text, jsdoc) {
//     const function_regex = /function\s+(\w+)\s*\((.*?)\)\s*{/g;
//     const function_matches = [...text.matchAll(function_regex)];

//     // Localiza a function que possui o mesmo nome da function do jsdoc
//     const jsdoc_name = jsdoc.name;
//     const function_result = function_matches.find(
//         (match) => match[1] === jsdoc_name
//     );

//     // Localiza o tipo do parâmetro para a decoração
//     const function_param = function_result[2]
//         .split(',')
//         .map((param) => param.trim());

//     const jsdoc_param = jsdoc.param
//         .map((obj) => obj[function_param[0]])
//         .find((value) => value !== undefined);

//     // Define a decoração para aplicação
//     const render_options = {
//         after: {
//             contentText: `: ${jsdoc_param}`,
//             color: '#808080'
//         }
//     };

//     return {
//         name: function_result[1],
//         param: function_result[2].split(',').map((param) => param.trim()),
//         returns: `(${function_result[2]})`,
//         render: render_options
//     };
// }

// module.exports = {
//     functionMatches,
//     jsdocMatches
// }

// const jsdoc_result = jsdocMatches(text);
// const jsdoc_first_result = jsdoc_result[0];
// const function_result = functionMatches(text, jsdoc_first_result);
// console.log(function_result);
