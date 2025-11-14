package com.mindmatch.pagamento.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")

@Entity
@Table(name = "tb_pagamento")
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pagamento")
    private Long id;
    @Column(name = "valor_pagamento")
    private BigDecimal valor;
    @Column(name = "descricao_pagamento")
    private String descricao;
    @Column(name = "data_pagamento")
    private LocalDateTime data;

    @ManyToOne
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "id_cartao")
    private Cartao cartao;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;
}
