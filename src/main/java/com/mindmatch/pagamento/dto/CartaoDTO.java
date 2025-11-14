package com.mindmatch.pagamento.dto;

import com.mindmatch.pagamento.entities.Cartao;
import com.mindmatch.pagamento.entities.TipoCartao;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
public class CartaoDTO {

    @Schema(description = "Identificador do cartão")
    private Long id;
    @Size(min = 16 , max = 20, message = "O numero do cartão deve conter entre 16 e 20 caracteres.")
    @NotBlank(message = "O campo \"numero\" é obrigatório.")
    @Schema(description = "Número do cartão")
    private String numero;
    @Size(min = 3 , max = 4, message = "O CVV deve conter entre 3 e 4 caracteres.")
    @NotBlank(message = "O campo \"cvv\" é obrigatório.")
    @Schema(description = "Valor de identificação do cartão")
    private String cvv;
    @Enumerated(EnumType.STRING)
    @NotNull(message = "O campo \"numero\" é obrigatório.")
    @Schema(description = "Tipo do cartão (débito/crédito)")
    private TipoCartao tipoCartao;
    @NotNull(message = "O campo \"vencimento\" é obrigatório.")
    @Schema(description = "Data de vencimento do cartão")
    private LocalDate vencimento;
    @NotNull(message = "O campo \"clienteId\" é obrigatório.")
    @Schema(description = "Identificador do cliente dono do cartão")
    private Long clienteId;

    public CartaoDTO(Cartao entity) {
        this.id = entity.getId();
        this.numero = entity.getNumero();
        this.cvv = entity.getCvv();
        this.tipoCartao = entity.getTipoCartao();
        this.vencimento = entity.getVencimento();
        this.clienteId = entity.getCliente().getId();
    }
}
