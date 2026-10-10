const { UserService } = require('../src/userService');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    // Arrange (comum a todos os testes deste arquivo)
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('cria um usuário com status ativo e os dados informados', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Assert
      expect(usuarioCriado).toMatchObject({ nome, email, idade, status: 'ativo' });
    });

    test('gera um id único para cada usuário criado', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Assert
      expect(usuarioCriado.id).toBeDefined();
    });

    test('define isAdmin como false por padrão quando não informado', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Assert
      expect(usuarioCriado.isAdmin).toBe(false);
    });

    test('lança erro quando o nome não é informado', () => {
      // Arrange / Act
      const criarUsuarioSemNome = () => userService.createUser(undefined, 'fulano@teste.com', 25);

      // Assert
      expect(criarUsuarioSemNome).toThrow('Nome, email e idade são obrigatórios.');
    });

    test('lança erro quando o email não é informado', () => {
      // Arrange / Act
      const criarUsuarioSemEmail = () => userService.createUser('Fulano de Tal', undefined, 25);

      // Assert
      expect(criarUsuarioSemEmail).toThrow('Nome, email e idade são obrigatórios.');
    });

    test('lança erro quando a idade não é informada', () => {
      // Arrange / Act
      const criarUsuarioSemIdade = () => userService.createUser('Fulano de Tal', 'fulano@teste.com', undefined);

      // Assert
      expect(criarUsuarioSemIdade).toThrow('Nome, email e idade são obrigatórios.');
    });

    test('lança erro ao tentar criar usuário menor de idade', () => {
      // Arrange / Act
      const criarUsuarioMenorDeIdade = () => userService.createUser('Menor', 'menor@email.com', 17);

      // Assert
      expect(criarUsuarioMenorDeIdade).toThrow('O usuário deve ser maior de idade.');
    });
  });

  describe('getUserById', () => {
    test('retorna o usuário correspondente ao id informado', () => {
      // Arrange
      const usuarioCriado = userService.createUser('Fulano de Tal', 'fulano@teste.com', 25);

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado).toEqual(usuarioCriado);
    });

    test('retorna null quando o id não existe', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.getUserById(idInexistente);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('desativa um usuário comum e retorna true', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
    });

    test('altera o status do usuário comum desativado para inativo', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      userService.deactivateUser(usuarioComum.id);

      // Assert
      const usuarioAtualizado = userService.getUserById(usuarioComum.id);
      expect(usuarioAtualizado.status).toBe('inativo');
    });

    test('não desativa um usuário administrador e retorna false', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
    });

    test('mantém o status do usuário administrador como ativo', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      userService.deactivateUser(usuarioAdmin.id);

      // Assert
      const usuarioAtualizado = userService.getUserById(usuarioAdmin.id);
      expect(usuarioAtualizado.status).toBe('ativo');
    });

    test('retorna false quando o usuário não existe', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('retorna a mensagem de lista vazia quando não há usuários cadastrados', () => {
      // Arrange / Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toBe('--- Relatório de Usuários ---\nNenhum usuário cadastrado.');
    });

    test('inicia o relatório sempre com o cabeçalho padrão', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio.startsWith('--- Relatório de Usuários ---')).toBe(true);
    });

    test('inclui o nome e o status de cada usuário cadastrado', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);
      userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert: valida o comportamento (quais dados aparecem), não o
      // formato exato da string, para não ser frágil a mudanças de layout.
      expect(relatorio).toEqual(expect.stringContaining('Alice'));
      expect(relatorio).toEqual(expect.stringContaining('Bob'));
      expect(relatorio).toEqual(expect.stringContaining('Status: ativo'));
    });
  });
});
