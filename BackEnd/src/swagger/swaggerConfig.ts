import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scopum - API de Controle de Ponto',
      version: '1.0.0',
      description: 'API RESTful para controle de ponto de funcionários com sincronização offline/online',
      contact: {
        name: 'Scopum',
        email: 'support@scopum.com'
      },
      license: {
        name: 'ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development Server'
      },
      {
        url: 'https://api.scopum.com',
        description: 'Production Server'
      }
    ],
    components: {
      schemas: {
        Funcionario: {
          type: 'object',
          properties: {
            codigo: {
              type: 'number',
              description: 'Código único do funcionário'
            },
            nome: {
              type: 'string',
              description: 'Nome do funcionário'
            },
            usuario_sistema: {
              type: 'string',
              description: 'Usuário do sistema'
            }
          }
        },
        TipoMarcacao: {
          type: 'object',
          properties: {
            CODIGO: {
              type: 'number',
              description: 'Código do tipo de marcação'
            },
            DESCRICAO: {
              type: 'string',
              description: 'Descrição do tipo de marcação'
            }
          }
        },
        RegistroPonto: {
          type: 'object',
          properties: {
            id: {
              type: 'number'
            },
            funcionario_codigo: {
              type: 'number'
            },
            tipo_marcacao: {
              type: 'number'
            },
            data: {
              type: 'string',
              format: 'date'
            },
            hora: {
              type: 'string',
              pattern: 'HH:mm'
            },
            observacao: {
              type: 'string',
              nullable: true
            },
            sincronizado: {
              type: 'boolean'
            }
          }
        },
        Erro: {
          type: 'object',
          properties: {
            sucesso: {
              type: 'boolean',
              example: false
            },
            mensagem: {
              type: 'string'
            },
            erro: {
              type: 'string',
              nullable: true
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
};

const specs = swaggerJsdoc(options);

export default specs;
