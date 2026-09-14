export interface ProjetoJson {
  "id": number,
  "nome": string,
  "categoria":string,
  "status": string,
  "dataInicio": string | null,
  "dataTermino": string | null,
  "orcamento": string | null,
  "prioridade": boolean,
  "criadoPor": {
    "id": number,
    "nome": string,
    "email": string
  },
  "gestor": {
    "id": number,
    "nome": string,
    "email": string
  },
  "tarefas": [
    {
      "id": number,
      "nome": string,
      "ordem": number,
      "concluido": boolean,
      "dataInicio": string,
      "dataTermino":string,
      "createdAt": string,
      "updatedAt": string
    }
  ],
  "createdAt": string,
  "updatedAt": string
}