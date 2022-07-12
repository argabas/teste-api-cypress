///<reference types="cypress"/>
import contrato from '../contracts/produtos.contrato'

describe('Teste da funcionalidade Produtos', () => {

    let token

    before(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn })
    });

    it.only('Deve validar contrato de produtos', () => {
        cy.request('produtos').then(response => {
            return contrato.validateAsync(response.body)
        })
    });

    it('Listar produtos', () => {
        cy.request({
            method: 'GET',
            url: 'produtos'
        }).then((response) => {
            expect(response.body.produtos[3].nome).to.equal('IPhone XR v3')
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('produtos')
            expect(response.duration).to.be.lessThan(20)
        })
    });

    it('Cadastrar produto', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000000)}`
        cy.request({
            method: 'POST',
            url: 'produtos',
            body: {
                "nome": produto,
                "preco": 350,
                "descricao": "Curso",
                "quantidade": 256
            },
            headers: { authorization: token }
        }).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')

        })

    });

    it('Deve validar mensagem de erro ao cadastrar produto repetido', () => {
        cy.cadastrarProduto(token, "Ebac Novo 2", 350, "Curso", 256)
            .then((response) => {
                expect(response.status).to.equal(400)
                expect(response.body.message).to.equal('Já existe produto com esse nome')

            })

    });

    it('deve editar um produto já cadastrado', () => {
        cy.request('produtos').then(response => {
            let id = response.body.produtos[0]._id
            cy.request({
                method: 'PUT',
                url: `produtos/${id}`,
                headers: {authorization: token},
                body: {
                    "nome": "Ebac Novo 2",
                    "preco": 100,
                    "descricao": "Produto Editado",
                    "quantidade": 100
                }
            }).then(response => {
                expect(response.body.message).to.equal('Registro alterado com sucesso')
            })
        })
    });

    it('Deve editar um produto cadastrado previamente', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000000)}`
        cy.cadastrarProduto(token, produto, 100, "Produto Novo", 100)
        .then(response => {
            let id = response.body._id
            cy.request({
                method: 'PUT',
                url: `produtos/${id}`,
                headers: {authorization: token},
                body: {
                    "nome": produto,
                    "preco": 200,
                    "descricao": "Produto Editado",
                    "quantidade": 300
                }
            }).then(response => {
                expect(response.body.message).to.equal('Registro alterado com sucesso')
            })
        })
    });

    it('Deve deletar um produto cadastrado previamente', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000000)}`
        cy.cadastrarProduto(token, produto, 100, "Produto Novo", 100)
        .then(response => {
            let id = response.body._id
            cy.request({
                method: 'DELETE',
                url: `produtos/${id}`,
                headers: {authorization: token},
            }).then(response => {
                expect(response.body.message).to.equal('Registro excluído com sucesso')
                expect(response.status).to.equal(200)
            })
        })
    });
});