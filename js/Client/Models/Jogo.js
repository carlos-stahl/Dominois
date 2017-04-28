// Require MesaFactory
// Require Tela
// Require Mesa
// Require MaoPrincipal

//Classe
var Jogo = function(gameId){
    this.jogador = undefined;
    this.pedraJogando = undefined;
    this.gameId = gameId;
    
    this.socketClient = new SocketClient(this);
    this.tela = new Tela(new Mesa(), new MaoPrincipal());

    this.AoCriarEstadoInicial = function(){
        this.socketClient.RegistrarEntrada(this.gameId);
    };

    this.AoAdicionarJogador = function(data){
        this.AdicionarNovoJogador(data.player);
        this.AoAlterarAreaDeCompra(data.boneyard);
    };

    this.AoJogarPedra = function(value1, value2, moveType){
        this.socketClient.RealizarJogada(this.gameId, value1, value2, moveType);
    };

    this.AoRealizarJogadaComSucesso = function(data){
        this.MoverPedraParaMesa(data.domino, data.moveType);
    };

    this.AoAlterarAreaDeCompra = function(boneyard){
        this.AtualizarAreaDeCompra(boneyard.size);
    }
};

//Métodos
Jogo.prototype.ObterLarguraTela = function(){
    return this.tela.largura;
};

Jogo.prototype.ObterAlturaTela = function(){
    return this.tela.altura;
};

Jogo.prototype.AdicionarNovoJogador = function(player) {
    var pedras = PedraFactory.CriarPedrasAPartirDoServer(player.dominoes);
    this.jogador = new Jogador(pedras);
    
    console.log("[JOGO] Jogador criado e registrado no Server.");

    this.TrocarEstadoParaPartida();
    this.IniciarPartida();
};

Jogo.prototype.MoverPedraParaMesa = function(domino, moveType){
    this.pedraJogando.destroy();
    console.log("[JOGO] A pedra " + domino.value1 + "|" + domino.value2 + " foi jogada. MoveType: " + moveType);
};

Jogo.prototype.TrocarEstadoParaPartida = function(){
    console.log("[JOGO] Carregando as pedras na tela...");
    game.state.start('Game');
};

Jogo.prototype.IniciarPartida = function(){
    console.log("[JOGO] Partida iniciada.");
    console.log("[JOGO] Jogador: ");
    console.log(this.jogador);
};

// Isto será removido quando tivermos o "monte de compra" na tela do jogo.
var boneyardCount = document.getElementById("boneyard");

Jogo.prototype.AtualizarAreaDeCompra = function(size){
    boneyardCount.innerHTML = size + " pedras na área de compra.";
}

//Estados
Jogo.prototype.ObterEstadoInicial = function(){
    var self = this;

    return {
        init : function(){
            this.game.stage.disableVisibilityChange = true;
        },
        create : function(){
            console.log("[JOGO] Criando o estado inicial do jogo...");

            this.game.stage.backgroundColor = self.tela.backgroundColor;
            self.AoCriarEstadoInicial();
        }
    };
};

Jogo.prototype.ObterEstadoPrincipal = function(){
    var self = this;

    var aoClicarNaPedra = function(sprite){
        self.pedraJogando = sprite;
		sprite.data.AoReceberClique(function(pedra, moveType) {
			self.AoJogarPedra(pedra.valorSuperior, pedra.valorInferior, moveType);
		});        
    };

    return {
        preload : function(){
            game.load.image(self.tela.mesa.sprite.nome, AssetsHelper.BuscarImagemMesa(self.tela.mesa.sprite.nome));
            self.jogador.ParaCadaPedra(function(pedra) {
                game.load.image(pedra.sprite.nome, AssetsHelper.BuscarImagemPedra(pedra.sprite.nome));
            });
        },

        create : function(){
            game.add.sprite(self.tela.mesa.sprite.posicao.x, self.tela.mesa.sprite.posicao.y, self.tela.mesa.sprite.nome);

            self.jogador.ParaCadaPedra(function(pedra) {
                var spritePedra = game.add.sprite(self.tela.maoPrincipal.posicaoProximaPedra.x, self.tela.maoPrincipal.posicaoProximaPedra.y, pedra.sprite.nome);
                spritePedra.data = pedra;

                self.tela.maoPrincipal.AdicionarPedra(pedra);
                
                spritePedra.inputEnabled = true;
                spritePedra.events.onInputDown.add(aoClicarNaPedra, this);
                spritePedra.input.useHandCursor = true;
            });
        }
    };
};

console.log("[JOGO] Objeto jogo criado.");