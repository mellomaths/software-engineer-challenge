![PicPay](https://user-images.githubusercontent.com/1765696/26998603-711fcf30-4d5c-11e7-9281-0d9eb20337ad.png)

[![Build Status](https://www.travis-ci.com/mellomaths/software-engineer-challenge.svg?branch=main)](https://www.travis-ci.com/mellomaths/software-engineer-challenge)

# Teste Backend

O desafio é criar uma API REST que busca usuarios pelo nome e username a partir de uma palavra chave. Faça o download do arquivo [users.csv.gz](https://s3.amazonaws.com/careers-picpay/users.csv.gz) que contém o banco de dados que deve ser usado na busca. Ele contém os IDs, nomes e usernames dos usuários.

###### Exemplo
| ID                                   | Nome              | Username             |
|--------------------------------------|-------------------|----------------------|
| 065d8403-8a8f-484d-b602-9138ff7dedcf | Wadson marcia     | wadson.marcia        |
| 5761be9e-3e27-4be8-87bc-5455db08408  | Kylton Saura      | kylton.saura         |
| ef735189-105d-4784-8e2d-c8abb07e72d3 | Edmundo Cassemiro | edmundo.cassemiro    |
| aaa40f4e-da26-42ee-b707-cb81e00610d5 | Raimundira M      | raimundiram          |
| 51ba0961-8d5b-47be-bcb4-54633a567a99 | Pricila Kilder    | pricilakilderitaliani|



Também são fornecidas duas listas de usuários que devem ser utilizadas para priorizar os resultados da busca. A lista 1 tem mais prioridade que a lista 2. Ou seja, se dois usuarios casam com os criterios de busca, aquele que está na lista 1 deverá ser exibido primeiro em relação àquele que está na lista 2. Os que não estão em nenhuma das listas são exibidos em seguida.

As listas podem ser encontradas na raiz deste repositório ([lista_relevancia_1.txt](lista_relevancia_1.txt) e [lista_relevancia_2.txt](lista_relevancia_2.txt)).
Os resultados devem ser retornados paginados de 15 em 15 registros.

Utilize ***Docker*** e escolha as tecnologias que você vai usar e tente montar uma solução completa para rodar a aplicação.

Faça um ***Fork*** deste repositório e abra um ***Pull Request***, **com seu nome na descrição**, para participar. 

-----

### Diferenciais

- Criar uma solução de autenticação entre o frontend e o backend;
- Ter um desempenho elevado num conjunto de dados muito grande;
- Criar testes automatizados;
- Seja Cloud native;

# Executando o projeto localmente

1. Clonar o repositório com:
```
git clone https://github.com/mellomaths/software-engineer-challenge
```

2. Faça o download do arquivo [users.csv.gz](https://s3.amazonaws.com/careers-picpay/users.csv.gz) e mova para o diretório `.docker/postgres/input`, assim conseguimos importar os dados para o Postgres.

3. E então, execute o comando de Docker Compose abaixo para iniciar a aplicação, o banco de dados Postgres (com PgAdmin) e também o Redis (com Redis Commander) que será usado para Cache.
```
docker-compose up
```

# Executando testes

- Comando para executar os testes unitários: `npm test`.
- Comando para executar os testes de integração com o Newman: `npm run test:newman`. Esses testes de integração exigem que a aplicação esteja em execução.

# Detalhes de Implementação

## Solução

- Aplicação desenvolvida com [Nest.js](https://nestjs.com/).
- Autenticação e Autorização com Passport: A API disponibiliza os endpoints 
  - `POST /auth/identity` para criar um novo cliente da API.
  - `POST /auth/login` para gerar um JWT que permitirá o cliente a acessar os outros endpoints da API.
  - `GET /auth/profile` para obter o detalhamente de um cliente logado dado um JWT.
- O Endpoint `GET /users` é disponibilizado com a obrigatoriedade do envio do query parameter `search`. Desta forma, o cliente da API consegue fazer uma busca por palavra chave. Por padrão, a API retornará o resultado de forma paginada com até 100 registros, porém é possível customizar essa paginação através dos parâmetros `start` e `limit`.
- Banco de Dados utilizado: Postgres.
- Cache: Foi utlizado Redis como banco de dados Chave-Valor como solução para Cache, desta forma conseguimos um tempo de resposta mais optimal nos endpoints da API.
- Testes unitários com Jest: Foram realizados testes unitários com Jest principalmente em relação aos services definidos na aplicação.
- Testes de Integração com Postman/Newman: Foram criados com o Postman e o Newman como solução de CLI para executá-los. Para melhor visualização das requisições e dos testes, a collection criada está localizada em `test/users-ms.postman_collection.json` e pode ser importada. Detalhe: os testes E2E utilizando Jest não foram desenvolvidos, utilizamos apenas o Postman para esse cenário, logo eles devem ser ignorados e a execução deles deve falhar.
- Integração Contínua: Foi utilizado Travis CI como solução de Integração Contínua, assim conseguimos executar todos os testes unitários a cada commit no Git. Após sucesso na execução dos testes, realiza-se o deploy da imagem Docker (Dockerfile.production) no Docker Hub.
- Documentação da API REST com Open API (Swagger).

## Banco de Dados

Durante a primeira inicialização dos containers, todos os scripts SQL localizados no diretório `.docker/postgres/sql` são executados. Detalhando a execução de cada um deles temos:
1. `1-init.sql`: Cria as tabelas `Users`, `Tmp_Users_Priority_One`, `Tmp_Users_Priority_Two` e `Users_Priority`.
2. `2-functions.sql`: Cria uma Function (Procedure) chamada `load_user_priority()` que será executada para carregar os dados das tabelas `Tmp_Users_Priority_One` e `Tmp_Users_Priority_Two` automaticamente para a tabela `Users_Priority` definindo o valor da coluna `priority_num` de acordo a qual tabela ID do usuário (user_id) se encontra.
3. `3-data.sql`: Carrega os dados dos arquivos CSV e TXT para as tabelas `Users` e `Tmp_Users_Priority`. E, além disso, executa a função `load_user_priority()` criada no script anterior.
4. `4-drop_temp.sql`: Exclui as duas tabelas temporárias `Tmp_Users_Priority_One` e `Tmp_Users_Priority_Two` já que os dados delas foram carregas para a `Users_Priority` pela Function `load_user_priority()`.

Para importar os dados dos arquivos CSV e TXT citados acima para a tabela `Users` e `Users_Priority`, foi usado o comando COPY conforme abaixo:
```
COPY Users(id, fullname, username)
FROM '/input/users.csv'
```

```
COPY Tmp_Users_Priority_One(user_id)
FROM '/input/lista_relevancia_1.txt'
```

```
COPY Tmp_Users_Priority_Two(user_id)
FROM '/input/lista_relevancia_2.txt'
```

