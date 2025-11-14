package com.mindmatch.pagamento.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String tipo;
    private Long usuarioId;
    private String nome;
    private String email;
    private String empresa;
    private String setor;
}
