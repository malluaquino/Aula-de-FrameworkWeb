import { Component, signal } from '@angular/core';
import { Tarefa } from "./tarefa";
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('TODOapp');
  arrayDeTarefas = signal<Tarefa[]>([]);
  apiURL: string;
  usuarioLogado = signal(false);
  tokenJWT = '{ "token":""}'; // Onde guardamos o crachá


  constructor(private http: HttpClient) {
   
    this.apiURL = 'https://maria256681.onrender.com';

  }

  // 1. LOGIN: Envia nome/senha e guarda o Token
  login(username: string, password: string) {
    var credenciais = { "nome": username, "senha": password };
    this.http.post(`${this.apiURL}/api/login`, credenciais).subscribe(resultado => {
      this.tokenJWT = JSON.stringify(resultado);
      this.READ_tarefas(); // Tenta ler após receber o token
    });
  }

  // 2. READ: Agora usando o cabeçalho 'id-token' corretamente
  READ_tarefas() {
    const headerToken = new HttpHeaders().set("id-token", JSON.parse(this.tokenJWT).token);
    
    // IMPORTANTE: Adicionei o { headers: headerToken } na chamada GET
    this.http.get<Tarefa[]>(`${this.apiURL}/api/getAll`, { headers: headerToken }).subscribe({
      next: (resultado) => {
        this.arrayDeTarefas.set(resultado);
        this.usuarioLogado.set(true); // Sucesso: mostra as tarefas
      },
      error: (error) => {
        console.error(error);
        this.usuarioLogado.set(false); // Falha (ex: token expirado): volta pro login
      }
    });
  }

  // 3. CREATE/DELETE/UPDATE: Se você protegeu tudo no backend, precisa do header aqui também!
  // 1. ADICIONAR TAREFA
CREATE_tarefa(descricaoNovaTarefa: string) {
  // Monta o cabeçalho com o token salvo
  const headerToken = new HttpHeaders().set("id-token", JSON.parse(this.tokenJWT).token);
  var novaTarefa = new Tarefa(descricaoNovaTarefa, false);

  // Passa o headerToken como terceiro parâmetro
  this.http.post<Tarefa>(`${this.apiURL}/api/post`, novaTarefa, { headers: headerToken }).subscribe(
      resultado => { 
          console.log(resultado); 
          this.READ_tarefas(); 
      }
  );
}

// 2. EXCLUIR TAREFA
DELETE_tarefa(tarefaAserRemovida: Tarefa) {
  const headerToken = new HttpHeaders().set("id-token", JSON.parse(this.tokenJWT).token);
  const id = tarefaAserRemovida._id;

  // Passa o headerToken no DELETE
  this.http.delete<Tarefa>(`${this.apiURL}/api/delete/${id}`, { headers: headerToken }).subscribe(
      resultado => { 
          console.log(resultado); 
          this.READ_tarefas(); 
      }
  );
}

// 3. EDITAR TAREFA
UPDATE_tarefa(tarefaAserModificada: Tarefa) {
  const headerToken = new HttpHeaders().set("id-token", JSON.parse(this.tokenJWT).token);
  const id = tarefaAserModificada._id;

  // Passa o headerToken no PATCH
  this.http.patch<Tarefa>(`${this.apiURL}/api/update/${id}`, tarefaAserModificada, { headers: headerToken }).subscribe(
      resultado => { 
          console.log(resultado); 
          this.READ_tarefas(); 
      }
  );
}
}