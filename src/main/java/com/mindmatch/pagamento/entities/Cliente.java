package com.mindmatch.pagamento.entities;

import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@EqualsAndHashCode(of = "id")

@Entity
@Table(name = "tb_cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long id;
    @Column(name = "nome_cliente")
    private String nome;
    @Column(name = "email_cliente")
    private String email;
    @Column(name = "telefone_cliente")
    private String telefone;
    @Column(name = "valor_medio_pagamento")
    private Double valorMedioCompra; // Futuramente pode ser movido para uma tabela de estatisticas;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;
}
