import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { getFormData, getInsumos, adicionaInsumo, getAtividadesInternas, setAtividadeInterna, removeAtividade, getDataTable } from './js/services.js'

import './main.html';
//import './services.js';


const Categoria = new Mongo.Collection('categorias');
const Insumo = new Mongo.Collection('insumos');
const Produto = new Mongo.Collection('produtos');

Meteor.startup(function () {

    sAlert.config({
        effect: '',
        position: 'bottom',
        timeout: 5000
    })

})

Router.route('/', function () {
    this.render('acesso');
});
Router.route('/novo-produto', function () {
    this.render('novoProduto');
});
Router.route('/novo-insumo', function () {
    this.render('novoInsumo');
});
Router.route('/novo-produtos', function () {
    this.render('novoProduto');
});
Router.route('/busca-produto', function () {
    this.render('buscaProdutos');
});
Router.route('/busca-insumo', function () {
    this.render('buscaInsumos');
});
Router.route('/login', function () {
    this.render('acesso');
});
Router.route('/home', function () {
    this.render('home');
});
Router.route('/edita-insumo/:_id', {
    name: 'edit',
    template: 'editaInsumo',
    data: function () {

        //var participante = Participantes.findOne({ _id: this.params._id });
        return Insumo.findOne({ _id: this.params._id });
    },

});
Router.route('/adicionarAtividade/:_id', {
    name: 'add activity',
    template: 'preenchimentoInterno',
    data: function () {

        //var participante = Participantes.findOne({ _id: this.params._id });
        return Participantes.findOne({ _id: this.params._id });
    },

});


Template.navbar.events({
    'click #botaoSair'(event, instance) {
        event.preventDefault();
        Meteor.logout();
        window.location.href = ('/');
    },

    'click #botaoLogin'(event, instance) {
        event.preventDefault();
        $('.navbar-brand').text('Por favor fazer login com seu usu??rio e senha');
        $('#paginaNovo').hide();
        $('#paginaAcesso').show();
        window.location.href = ('/login');
    },

    'click #novProduto'(event, instance) {
        window.location.href = ('/novProduto');
        $('.navbar-brand').text('Preencha seus dados abaixo');

    },
    'click #home'(event, instance) {
        window.location.href = ('/home');
    }

})

Template.navbar.helpers({
    fullName() {
        return Meteor.user().profile.name;
    }

})

Template.acesso.events({

    'click #botaoLogin'(event, instance) {
        event.preventDefault();

        var email = $('#login #loginEmail').val();
        var senha = $('#login #loginSenha').val();

        Meteor.loginWithPassword(email, senha, function (err) {
            if (err) {
                sAlert.error(err.reason)
            } else {
                console.log('to aqui');
                window.location.href = ('/home')
                sAlert.success('Ol??, voc?? foi autenticado.')

            }
        })

    },

    'click #botaoCadastrar'(event, instance) {
        event.preventDefault();

        var nome = $('#cadastro #cadastroNome').val();
        var email = $('#cadastro #cadastroEmail').val();
        var senha = $('#cadastro #cadastroSenha').val();

        var user = {
            email: email,
            password: senha,
            profile: { name: nome }
        }

        Accounts.createUser(user, function (err) {
            if (err) {
                if (err.reason = 'Email already exists.') {
                    sAlert.error('Voc?? j?? est?? cadastrado.');
                } else {
                    sAlert.error(err.reason);
                }
            } else {
                console.log('tudo certo');
            }
        })


    },



})



Template.novoProduto.helpers({
    'listaInsumos': function () {
        return Template.instance().insumos.get();
    }
})
Template.novoProduto.onCreated(function () {
    this.insumos = new ReactiveVar(Insumo.find());
})

Template.novoProduto.onRendered(function () {
   
})

Template.novoProduto.events({

    'click #adicionaInsumo'(event, instance) {
        event.preventDefault();
        adicionaInsumo();
    },
    'click #removeAtividadeVoluntaria'(event, instance) {
        event.preventDefault();

        var table = document.getElementById("atividadeTable");
        var current = event.currentTarget;

        table.deleteRow(current.parentNode.parentNode.rowIndex)

    },


    'click .checkbox-experienca-pratica'(event, instance) {
        console.log(event);
        console.log(instance.parentNode);
        $(".experiencia-pratica").each(function (i) {
            //console.log($(this).find('input.checkbox-experienca-pratica:checked'));
            if ($(this).find('input.checkbox-experienca-pratica:checked').length > 0) {
                $(this).find('.input-time').prop("disabled", false);
            }
        });

    },

    'click #cadastrar'(event, instance) {
        event.preventDefault();
        var produto = {
            nome: $('#nome-produto').val(),
            insumos: getInsumos()

        }
        Meteor.call('InserirProduto', produto, function (err, res) {
            if (err) {
                sAlert.error(err.reason)
                return false;
            } else {
                sAlert.success('Participante cadastrado com sucesso.')
                window.location.href = ('/busca-produto')
            }
        })

    }
})

Template.novoInsumo.helpers({
    'listaCategorias': function () {
        return Template.instance().categoria.get();
    }
})

Template.novoInsumo.events({

    'focusout  #insumo-valor-total'() {
        var valorTotal = $('#insumo-valor-total').val()
        var quantidade = $('#insumo-quantidade').val()
        var valorGrama = (valorTotal / quantidade)
        console.log(valorTotal)
        console.log(quantidade)
        console.log(valorGrama.toLocaleString('pt-BR'))
        $('#insumo-valor-grama').val(valorGrama.toLocaleString('pt-BR'))
    },

    'click #adicionaInsumo'(event, instance) {
        event.preventDefault();
        adicionaInsumo();
    },


    'click #cadastrar'(event, instance) {
        event.preventDefault();
        var name = $('#insumo-nome').val()
        var quantidade = $('#insumo-quantidade').val()
        var valor_total = $('#insumo-valor-total').val()
        var valor_grama = $('#insumo-valor-grama').val()
        var categoria = $('#selectCategoriaInsumo option:selected').val()

        var insumo = {
            nome: name,
            quantidade: quantidade,
            valor_total: valor_total,
            valor_grama: valor_grama,
            categoria: categoria
        }

        Meteor.call('inserirParticipante', insumo, function (err, res) {
            if (err) {
                sAlert.error(err.reason)
                return false;
            } else {
                sAlert.success('Insumo cadastrado com sucesso.')
                window.location.href = ('/busca-insumo')
            }
        })


    }
})

Template.novoInsumo.onCreated(function () {
    this.categoria = new ReactiveVar(Categoria.find());
})

Template.buscaProdutos.onCreated(function () {
    this.produtos = new ReactiveVar(Produto.find());
})

Template.buscaProdutos.rendered = function () {
    this.$("#busca").on("submit", function (e) { e.preventDefault() });
}

Template.buscaProdutos.helpers({
    'listaProdutos': function () {
        return Template.instance().produtos.get();
    },

})

Template.buscaProdutos.events({
    'click #botaoBuscar'(event, instance) {
        event.preventDefault();
        var nome = $('#buscaNome').val();
        var resultado = Produto.find({ "nome": { $regex: `${nome}` } });
        console.log("RESULTADO", resultado)
        instance.produtos.set(resultado);
    },

    'click #limparPesquisa'(event, instance) {
        event.preventDefault();
        var resultado = Participantes.find();
        instance.participante.set(resultado);
        $('#buscaNome').val();
    },

    'click #deletarProduto'(event, instance) {
        var dialog = $('#window');
        $('#deletarProduto').click(function () {
            dialog.show();
        });
        var r = confirm("Voc?? tem certeza que deseja apagar este produto?");
        if (r == true) {
            Meteor.call('deletePoduto', this._id, function (err, res) {
                if (err) {
                    sAlert.error(err.reason)
                    return false;
                } else {
                    sAlert.success('Produto removido com sucesso com sucesso.')
                }
            })
        }
    }
})

Template.buscaInsumos.onCreated(function () {
    this.insumos = new ReactiveVar(Insumo.find());
})

Template.buscaInsumos.rendered = function () {
    this.$("#botaoBuscar").on("submit", function (e) { e.preventDefault() });
}

Template.buscaInsumos.helpers({
    'listaInsumos': function () {
        return Template.instance().insumos.get();
    },

})

Template.buscaInsumos.events({
    'click #botaoBuscar'(event, instance) {
        event.preventDefault();
        console.log("INSTANCE", instance)
        var nome = $('#buscaNome').val();
        var resultado = Insumo.find({ "nome":  {$regex:`${nome}`}});
        console.log("RESULTADO", resultado)
        instance.insumos.set(resultado);
    },

    'click #limparPesquisa'(event, instance) {
        event.preventDefault();
        var resultado = Insumo.find();
        instance.insumos.set(resultado);
        $('#buscaNome').val();
    },

    'click #editarInsumo'(event, instance) {
        event.preventDefault();
        //console.log(this._id);
        window.location.href = ('/edita-insumo/' + this._id);

    },

    'click #deletarInsumo'(event, instance) {
        var dialog = $('#window');
        $('#deletarInsumo').click(function () {
            dialog.show();
        });
        var r = confirm("Voc?? tem certeza que deseja apagar este insumo?");
        if (r == true) {
            Meteor.call('deleteInsumo', this._id, function (err, res) {
                if (err) {
                    sAlert.error(err.reason)
                    return false;
                } else {
                    sAlert.success('insumo removido com sucesso com sucesso.')
                }
            })
        }
    }

})








Template.listaParticipante.events({

    'click #editarContato'(event, instance) {
        event.preventDefault();
        //console.log(this._id);
        window.location.href = ('/editarParticipante/' + this._id);

    },

    'click #addAtividade'(event, instance) {
        event.preventDefault();
        //console.log(this._id);
        window.location.href = ('/adicionarAtividade/' + this._id);

    },
    'click #botaoBuscar'(event, instance) {
        event.preventDefault();
        var nome = $('#buscaNome').val();
        var resultado = Participantes.find({ "nome": { $regex: nome } });
        instance.participante.set(resultado);
    },

    'click #limparPesquisa'(event, instance) {
        event.preventDefault();
        var resultado = Participantes.find();
        instance.participante.set(resultado);
        $('#buscaNome').val();
    },

    'click #deletarContato'(event, instance) {
        var dialog = $('#window');
        $('#deletarContato').click(function () {
            dialog.show();
        });
        var r = confirm("Voc?? tem certeza que deseja apagar este participante?");
        if (r == true) {
            Meteor.call('deleteParticipante', this._id, function (err, res) {
                if (err) {
                    sAlert.error(err.reason)
                    return false;
                } else {
                    sAlert.success('Participante removido com sucesso com sucesso.')
                }
            })
        }
    }

})
Template.editarParticipante.onRendered(function () {
    $(document).ready(function () {
        $('#date-birth').inputmask("99-99-9999");
        $('.cep').inputmask('99999-999');
        $('#telefoneRes').inputmask('(99) 9999-9999');
        $('#telefoneCel').inputmask('(99) 99999-9999');
        $('.cpf').inputmask('999.999.999-99', { reverse: true });
        $('#telComercial').inputmask('(99) 99999-9999');
    });


})

Template.editarParticipante.onCreated(function () {

    this.atividades = new ReactiveVar(Atividades.find());
    var atividadeList = this.atividades.curValue.collection._docs._map
    console.log(atividadeList);
    var transferencia = $('#transferencia').val();
    if (transferencia == 'Sim') {
        $('#nomeCentroEspirita').prop("disabled", false);
        $('#cidadeCentroEspirita').prop("disabled", false);
        $('#tempoCentroEspirita').prop("disabled", false);
        $('#ufCentroEspirita').prop("disabled", false);
    } else {
        $('#nomeCentroEspirita').prop("disabled", true);
        $('#cidadeCentroEspirita').prop("disabled", true);
        $('#tempoCentroEspirita').prop("disabled", true);
        $('#ufCentroEspirita').prop("disabled", true);
    }

})

Template.editarParticipante.helpers({
    'listaAtividades': function () {
        return Template.instance().atividadeList.get();
    },
})

Template.editarParticipante.events({

    'click #aposentadoria'(event, instance) {
        event.preventDefault();
        var aposentado = $('#aposentadoria').val();

        if (aposentado == "false") {
            $('#fieldDadosProfissionais').prop("disabled", false)
        } else {
            $('#fieldDadosProfissionais').prop("disabled", true)
        }
    },
    'click #editarProfissao'(event) {
        event.preventDefault();
        $('#fieldDadosProfissionais').prop("disabled", false)
    },

    'click #adicionaAtividade'(event, instance) {
        event.preventDefault();
        adicionaAtividade();
    },
    'click #removeAtividadeVoluntaria'(event, instance) {
        event.preventDefault();

        var table = document.getElementById("atividadeTable");
        var current = event.currentTarget;

        table.deleteRow(current.parentNode.parentNode.rowIndex)

    },

    'click #transferencia'(event, instance) {
        event.preventDefault();
        var transferencia = $('#transferencia').val();
        if (transferencia == 'Sim') {
            $('#dadosTransferencia').prop("disabled", false)
        } else {
            $('#dadosTransferencia').prop("disabled", true)
        }
    },

    'click #editarDadosCentroEspirita'(event) {
        event.preventDefault();
        console.log($('#dadosTransferencia'))
        $('#dadosTransferencia').prop("disabled", false)
    },


    'click #escolaridade'(event, instance) {
        event.preventDefault();
        var escolaridade = $('#escolaridade').val();
        if (escolaridade <= 4) {
            $('#dadosEscolares').prop("disabled", true)
        } else {
            $('#dadosEscolares').prop("disabled", false)
        }
    },

    'click #editarDadosEscolares'(event) {
        event.preventDefault();
        $('#dadosEscolares').prop("disabled", false)
    },


    'click .checkbox-experienca-pratica'(event, instance) {
        //event.preventDefault();
        $(".experiencia-pratica").each(function (i) {
            //console.log($(this).find('input.checkbox-experienca-pratica:checked'));
            if ($(this).find('input.checkbox-experienca-pratica:checked').length > 0) {
                $(this).find('.input-time').prop("disabled", false);
            }
        });

    },

    'click #atividadeAno'(event) {
        event.preventDefault();
        var myDate = new Date();
        var year = myDate.getFullYear();
        for (var i = 1950; i < year + 1; i++) {
            //document.find()write('<option value="'+i+'">'+i+'</option>');
            $('#atividadeAno').append('<option value="' + i + '">' + i + '</option>');
        }



        $('#atividadeAno').html(itensOrdenados);
    },

    'click #editar'(event, instance) {
        event.preventDefault();
        var name = $('#full-name').val()
        var dt_nasc = $('#date-birth').val()
        var cpf = $('#cpf').val()
        var rg = $('#rg').val()
        var validator = true

        if (name == "") {
            sAlert.error("Campo Nome ?? obrigat??rio")
            validator = false
        }
        if (dt_nasc == "") {
            sAlert.error("Campo Data de Nascimento ?? obrigat??rio")
            validator = false
        }
        if (rg == "") {
            sAlert.error("Campo RG ?? obrigat??rio")
            validator = false
        }
        if (cpf == "") {
            sAlert.error("Campo CPF ?? obrigat??rio")
            validator = false
        }

        var participante = getFormData()
        if (validator) {
            if (this._id) {
                Meteor.call('updateParticipante', this._id, participante, function (err, res) {
                    if (err) {
                        sAlert.error(err.reason)
                        return false;
                    } else {
                        sAlert.success('Participante alterado com sucesso.')
                    }
                })

            } else {
                Meteor.call('inserirParticipante', participante, function (err, res) {
                    if (err) {
                        sAlert.error(err.reason)
                        return false;
                    } else {
                        sAlert.success('Participante cadastrado com sucesso.')
                    }
                })
            }
            //window.location.href = ('/home');
        } else {
            sAlert.error('Por favor preencha todos os dados obrigat??rios')
        }

        // Meteor.call('inserirParticipante', participante, function(err, res){
        //   if (err) {
        //       sAlert.error(err.reason)
        //       return false;
        //   } else {
        //       sAlert.success('Participante cadastrado com sucesso.')
        //   }
        // })     
    },

    'click #cancelar'(event) {
        event.preventDefault();
        window.location.href = ('/home');
    },



    'click #btnAddAtividadeInterna'(event, instance) {
        event.preventDefault();
        var participante = getFormData()
        var atividade = getAtividadesInternas();
        atividade.participante_id = this._id;
        participante.atividades_internas = atividade;

        setAtividadeInterna();

        // Meteor.call('adicionaAtividadeInterna', this._id, atividade, function (err, res) {
        //     if (err) {
        //         sAlert.error(err.reason)
        //         return false;
        //     } else {
        //         sAlert.success('Atividade adicionada com sucesso.')
        //     }
        // })
        // Meteor.call('updateParticipante', this._id, participante, function (err, res) {
        //     if (err) {
        //         sAlert.error(err.reason)
        //         return false;
        //     } else {
        //         sAlert.success('Participante alterado com sucesso.')
        //     }
        // })
    }
})

Template.preenchimentoInterno.onCreated(function () {
    this.atividade = new ReactiveVar(Atividades.find());
    this.participante = new ReactiveVar(Participantes.find());
    this.socio = new ReactiveVar(Socio.find());
    this.deptoAtividade = new ReactiveVar()
})

Template.preenchimentoInterno.helpers({
    'listaAtividadesInternas': function () {

        return Template.instance().atividade.get();
    },
    'usuario': function () {

        return Template.instance().participante.get();
    },
    'listaSocio': function () {
        return Template.instance().socio.get();
    },
    'listaDeptoAtividades': function () {
        return Template.instance().deptoAtividade.get();
    }
})

Template.preenchimentoInterno.events({
    'click #btnAddAtividadeInterna'(event, instance) {
        event.preventDefault();
        var atividades_internas = {
            ano: $('#atividadeInternaAno').val(),
            atividade: $('#selectAtividadeInterna option:selected').val(),
            freq_total: $('#atividadeInternaFreqTotal').val(),
            freq_real: $('#atividadeInternaFreqReal').val(),
            departamento: $('#atividadeInternaDepartamento option:selected').text(),
        }

        if (this._id) {
            Meteor.call('updateAtividadeInterna', this._id, atividades_internas, function (err, res) {
                if (err) {
                    sAlert.error(err.reason)
                    return false;
                } else {
                    sAlert.success('Atividade Alterada com sucesso.')
                }
            })
        } else {
            Meteor.call('updateAtividadeInterna', atividades_internas, function (err, res) {
                if (err) {
                    sAlert.error(err.reason)
                    return false;
                } else {
                    sAlert.success('Atividade Cadastrada com sucesso.')
                }
            })
        }

    },
    'click .checkbox-tipo-socio'(event, instance) {
        $(document).on("click", ".checkbox-tipo-socio", function () {
            var $valueField = $(this).parent().parent().find('.input-valor-mensal');
            if (this.checked) {
                $valueField.prop("disabled", false);
            } else {
                $valueField.prop("disabled", true);
                $valueField.val('')
            }
        });
    },

    'click #btnAddSocio'(event) {
        event.preventDefault();
        data_cria????o = new Date(Date.now()).toLocaleString();

        var socio = {
            tipo: $('th').find('.checkbox-tipo-socio:checked').val(),
            valor: $('th').find('.checkbox-tipo-socio:checked').parent().parent().find('.input-valor-mensal').val(),
            user_id: this._id,
            date_create: data_cria????o
        }

        if (this._id) {
            Meteor.call('updateSocioTipo', this._id, socio, function (err, res) {
                if (err) {
                    sAlert.error(err.reason)
                    return false;
                } else {
                    sAlert.success('S??cio alterado com sucesso.')
                }
            })
        } else {
            Meteor.call('updateSocioTipo', socio, function (err, res) {
                if (err) {
                    sAlert.error(err.reason)
                    return false;
                } else {
                    sAlert.success('S??cio cadastrado com sucesso.')
                }
            })
        }

    },
    'change #atividadeInternaDepartamento'(event) {
        var depto = $('#atividadeInternaDepartamento').val()
        var depto_atividades
        switch (depto) {
            case 'DIJE':
                depto_atividades = [
                    { nome: 'Diretor' },
                    { nome: 'Diretor-Adjunto' },
                    { nome: 'Grupo do Gena' },
                    { nome: 'Grupo de pais' },
                    { nome: 'Coordenador de Evangelho' },
                    { nome: 'Colaborador passista' },
                    { nome: 'Evangelizador' },
                    { nome: 'Estudante' }
                ]
                Template.instance().deptoAtividade.set(depto_atividades)
                break
            case 'DECDE':
                depto_atividades = [
                    { nome: 'Diretor' },
                    { nome: 'Diretor-Adjunto' },
                    { nome: 'Secretaria' },
                    { nome: 'Facilitador de grupos de estudos' },
                    { nome: 'Estudante' }
                ]
                Template.instance().deptoAtividade.set(depto_atividades)
                break
            case 'DDOU':
                depto_atividades = [
                    { nome: 'Diretor' },
                    { nome: 'Diretor-Adjunto' },
                    { nome: 'Leitor' },
                    { nome: 'Mes??rio' },
                    { nome: 'Palestrante' },
                    { nome: 'Palestrante Substituto' }
                ]
                Template.instance().deptoAtividade.set(depto_atividades)
                break
            case 'DAFT':
                depto_atividades = [
                    { nome: 'Diretor' },
                    { nome: 'Diretor-Adjunto' },
                    { nome: 'Atendente  fraterno' },
                    { nome: 'Grupo  Enxugando l??grimas' },
                    { nome: 'Recep????o da casa em diferentes hor??rios' }
                ]
                Template.instance().deptoAtividade.set(depto_atividades)
                break
            case 'DMED':
                depto_atividades = [
                    { nome: 'Diretor' },
                    { nome: 'Diretor-Adjunto' },
                    { nome: 'Primeiro-Dirigente de sess??o medi??nica' },
                    { nome: 'Segundo-Dirigente  de sess??o medi??nica' },
                    { nome: 'Dialogador' },
                    { nome: 'M??dium psicof??nico' },
                    { nome: 'M??dium psic??grafo' },
                    { nome: 'M??dium vidente' },
                    { nome: 'M??dium audiente' },
                    { nome: 'M??dium pict??grafo' },
                    { nome: 'Atividade de sustenta????o' }
                ]
                Template.instance().deptoAtividade.set(depto_atividades)
                break
            case 'DPAS':
                depto_atividades = [
                    { nome: 'Diretor' },
                    { nome: 'Diretor-Adjunto' },
                    { nome: 'Secretaria' },
                    { nome: 'Coordenador' },
                    { nome: 'Colaborador passista' }
                ]
                Template.instance().deptoAtividade.set(depto_atividades)
                break
            case 'DAPS':
                depto_atividades = [
                    { nome: 'Diretor' },
                    { nome: 'Diretor-Adjunto' },
                    { nome: 'Recep????o masculina' },
                    { nome: 'Recep????o feminina' },
                    { nome: 'Controle e distribui????o de fichas feminino e masculino' },
                    { nome: 'Organiza????o de doa????es: roupas e alimentos' },
                    { nome: 'Montagem de cestas b??sicas' },
                    { nome: 'Prepara????o de lanches' },
                    { nome: 'Atendimento de individual feminino - separa????o e entrega de roupas etc' },
                    { nome: 'Atendimento individual masculino- separa????o e entrega de roupas, etc' },
                    { nome: 'Leitura na tribuna' }
                ]
                Template.instance().deptoAtividade.set(depto_atividades)
                break
            case 'DFAM':
                depto_atividades = [
                    { nome: 'Diretor' },
                    { nome: 'Diretor-Adjunto' },
                    { nome: 'Semanas da Fam??lia' },
                    { nome: 'Campanha de Implanta????o do Culto do Evangelho no Lar' },
                    { nome: 'Grupo de pais' },
                    { nome: 'Programa de R??dio (Guaruj??)' }
                ]
                Template.instance().deptoAtividade.set(depto_atividades)
                break
            case 'DEVT':
                depto_atividades = [
                    { nome: 'Diretor' },
                    { nome: 'Diretor-Adjunto' },

                ]
                Template.instance().deptoAtividade.set(depto_atividades)
                break
            case 'DLIV':
                depto_atividades = [
                    { nome: 'Diretor' },
                    { nome: 'Diretor-Adjunto' },
                    { nome: 'Respons??vel pela Biblioteca' },
                    { nome: 'Respons??vel pela Restaura????o' },
                    { nome: 'Restaurador de Livros' },
                    { nome: 'Auxiliar da Livraria' },

                ]
                Template.instance().deptoAtividade.set(depto_atividades)
                break
            case 'DART':
                depto_atividades = [
                    { nome: 'Diretor' },
                    { nome: 'Diretor-Adjunto' },
                    { nome: 'Oficina de c??nicas' },
                    { nome: 'Oficina de locu????o' },
                    { nome: 'Leitura dram??tica' }
                ]
                Template.instance().deptoAtividade.set(depto_atividades)
                break
            case 'DCOM':
                depto_atividades = [
                    { nome: 'Diretor' },
                    { nome: 'Diretor-Adjunto' },
                    { nome: 'Editor de texto' },
                    { nome: 'Diagramador' },
                    { nome: 'Fot??grafo' },
                    { nome: 'Cinegrafista' },
                    { nome: 'Operador de ??udio' },
                    { nome: 'Editor de v??deo' },
                    { nome: 'Iluminador' },
                    { nome: 'Locutor' }
                ]
                Template.instance().deptoAtividade.set(depto_atividades)
                break
        }

    }
})



