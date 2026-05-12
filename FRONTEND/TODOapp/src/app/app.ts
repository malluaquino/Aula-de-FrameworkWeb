import { Component, signal, OnInit } from '@angular/core';
import { Tarefa } from "./tarefa";
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('TODOapp');
  arrayDeTarefas = signal<Tarefa[]>([]);
  apiURL: string;
  usuarioLogado = signal(false);

  constructor(private http: HttpClient) {
    this.apiURL = 'https://maria256681.vercel.app/';
  }

  // Quando o site abre, ele verifica se já tem alguém logado
ngOnInit() {
  const token = localStorage.getItem('id-token');
  if (token) {
    this.READ_tarefas(); 
  } else {
    this.usuarioLogado.set(false);
  }
}

  // 1. LOGIN: Envia nome/senha e guarda o Token
  login(usernameDigitado: string, passwordDigitado: string) {
    this.http.post<any>(`${this.apiURL}/login`, { 
      nome: usernameDigitado, 
      senha: passwordDigitado 
    })
    .subscribe(
      res => {
        localStorage.setItem('id-token', res.token);
        alert('Login realizado com sucesso!');
        this.READ_tarefas(); // Chama as tarefas e muda a tela
      },
      err => {
        alert('Erro no login: ' + err.error.message);
      }
    );
  }

  // Função auxiliar para pegar o Token e montar o Header (Evita repetição de código)
  private getHeaders() {
    const token = localStorage.getItem('id-token');
    return new HttpHeaders().set("id-token", token || '');
  }

  // 2. READ: Busca as tarefas no banco
  READ_tarefas() {
    this.http.get<Tarefa[]>(`${this.apiURL}/getAll`, { headers: this.getHeaders() })
    .subscribe({
      next: (resultado) => {
        this.arrayDeTarefas.set(resultado);
        this.usuarioLogado.set(true); // Se conseguiu ler, libera a tela de tarefas
      },
      error: (error) => {
        console.error(error);
        this.usuarioLogado.set(false);
      }
    });
  }

  // 3. CREATE: Adiciona nova tarefa
  CREATE_tarefa(descricaoNovaTarefa: string) {
    var novaTarefa = new Tarefa(descricaoNovaTarefa, false);
    this.http.post<Tarefa>(`${this.apiURL}/post`, novaTarefa, { headers: this.getHeaders() })
    .subscribe(() => this.READ_tarefas());
  }

  // 4. DELETE: Exclui tarefa
  DELETE_tarefa(tarefaAserRemovida: Tarefa) {
    const id = tarefaAserRemovida._id;
    this.http.delete<Tarefa>(`${this.apiURL}/delete/${id}`, { headers: this.getHeaders() })
    .subscribe(() => this.READ_tarefas());
  }

  // 5. UPDATE: Edita tarefa
  UPDATE_tarefa(tarefaAserModificada: Tarefa) {
    const id = tarefaAserModificada._id;
    this.http.patch<Tarefa>(`${this.apiURL}/update/${id}`, tarefaAserModificada, { headers: this.getHeaders() })
    .subscribe(() => this.READ_tarefas());
  }

  logout() {
  localStorage.removeItem('id-token'); // Apaga o crachá do navegador
  this.usuarioLogado.set(false);       // Esconde as tarefas e mostra o login
  this.arrayDeTarefas.set([]);         // Limpa a lista da tela
}
}

