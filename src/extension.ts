// src/extension.ts  
import { machine } from 'os';
import { stringify } from 'querystring';
import * as vscode from 'vscode';

export function getvar(b: vscode.TextLine, p: vscode.Position): string | any {
	let tmps: string = "";
	let bflag: boolean = false;
	tmps = b.text.substring(p.character - 4, p.character + 4);
	let regx = /%[^,;](\w+)[,;]/g;
	let match = tmps.match(regx);
	if (match) {
		//console.log(match[0]);
		return match[0].substring(1, match[0].length - 1);
	}
}

export function isequal(a: string, b: vscode.TextLine, p: vscode.Position) {
	let head: number = a.length;
	let tail: number = 0;
	for (let i = 0; i <= a.length; i++) {
		if ((b.text.length > p.character + tail) && (p.character - head > 0)) {
			//console.log(a,b.text.substring(p.character - head, p.character + tail),head,p.character,tail);
			if (a === b.text.substring(p.character - head, p.character + tail)) {
				//console.log(a,b.text.substring(p.character - head, p.character + tail));
				return true;
			}
			else {
				head--;
				tail++;
			}
		}
	}
	return false;
}

export function add_list(match_list_alias: any[], match_list_var: any[]) {
	console.log('here is add list');
	while (match_list_alias.length > 0) {
		match_list_alias.pop();
		match_list_var.pop();
	}
	//match_list_alias =[];
	//match_list_var = [];
	//const regex_a = /\/\/ ALIAS: (\w+) (\w+)/g;
	//const regex_1 = /\/\/ ALIAS: (\w+) (\w+)/;
	let regex_a = /\/\/ ALIAS:\s*(\w+)\s* \s*([^;]*);?/g;
	let regex_1 = /\/\/ ALIAS:\s*(\w+)\s* \s*([^;]*);?/;
	// 读取文档内所有行
	if (vscode.window.activeTextEditor) {
		const lines = vscode.window.activeTextEditor.document.getText().split('\n');
		//console.log(lines);
		// 读取文档行数
		if (lines !== undefined) {
			//便利 lines
			for (let i = 0; i < lines.length; i++) {
				let line = lines[i];
				if (line) {
					let match = line.match(regex_a);
					console.log(`match: ${match}`);
					if (match) {
						for (let j = 0; j < match.length; j++) {
							if (match[j] !== null) {
								let tmp = match[j].match(regex_1);
								if (tmp) {
									match_list_alias.push(tmp[2]);
									match_list_var.push(tmp[1]);
								}
							}
						}
					}
				}
			}
			console.log(match_list_alias);
			console.log(match_list_var);
		}
		else {
			console.log('No active text editor');
		}
		//how to pass match_list to disposable
	}
}
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "my-first-extension" is now active!');
	let match_list_alias: string[] = [];
	let match_list_var: string[] = [];
	add_list(match_list_alias, match_list_var);
	//console.log(match_list_var);
	//console.log(match_list_alias);
	let disposable = vscode.languages.registerHoverProvider('c', {
		provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
			const line = document.lineAt(position);
			const text = line.text;

			//console.log(match_list_alias,match_list_var);
			//const regex = /\/\/\sALIAS:\s(.+)\s(.+)/;
			// 假设注释格式为 // ALIAS: variableName aliasName 
			//console.log(match_list_var);
			//console.log(match_list_alias); 
			//遍历match_list_var
			let bflag: number = 0;
			for (let i = 0; i < match_list_var.length; i++) {
				if (text.match(match_list_var[i])) {
					//判断选中的变量是否是匹配项
					//console.log(line.text.substring(position.character - match_list_var[i].length, position.character));
					//if (match_list_var[i] === line.text.substring(position.character - match_list_var[i].length, position.character)) 
					if (match_list_var[i] === getvar(line,position)) {
						bflag = 1;
						return new vscode.Hover(`${match_list_var[i]} --> ${match_list_alias[i]}`);
					}
					else {
						bflag = 2;
					}
				}
			}
			if (bflag === 2) {
				let tmps = getvar(line,position);
				return new vscode.Hover(`${tmps} --> not found`);
			}
			if (bflag === 0) {
				return new vscode.Hover('none');
			}
		}
	});
	//console.log("i am here ?");
	vscode.workspace.onDidChangeTextDocument(() => {
		// 当文档内容变化时，执行以下函数  
		add_list(match_list_alias, match_list_var);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }