package com.mindmatch.pagamento.dto;

import com.mindmatch.pagamento.entities.Pagamento;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class PagamentoViewDTO {
    @Schema(description = "Id do pagamento.")
    private Long id;
    
    @Schema(description = "Valor do pagamento.")
    private BigDecimal valor;
    
    @Schema(description = "Data da transação.")
    private LocalDateTime dataTransacao;
    
    @Schema(description = "Descrição do pagamento")
    private String descricao;

    @Schema(description = "Nome do cliente")
    private String nomeCliente;
    
    @Schema(description = "Email do cliente")
    private String emailCliente;
    
    @Schema(description = "Telefone do cliente")
    private String telefoneCliente;
    
    @Schema(description = "ID do cliente")
    private Long clienteId;
    
    @Schema(description = "ID do cartão")
    private Long cartaoId;

    public PagamentoViewDTO(Pagamento entity) {
        this.id = entity.getId();
        this.valor = entity.getValor();
        this.dataTransacao = entity.getData();
        this.descricao = entity.getDescricao();
        this.clienteId = entity.getCliente().getId();
        this.cartaoId = entity.getCartao().getId();
        this.nomeCliente = entity.getCliente().getNome();
        this.emailCliente = entity.getCliente().getEmail();
        this.telefoneCliente = entity.getCliente().getTelefone();
    }
}
