package com.mindmatch.pagamento.controller;

import com.mindmatch.pagamento.dto.AuthResponseDTO;
import com.mindmatch.pagamento.dto.LoginDTO;
import com.mindmatch.pagamento.dto.RegistroDTO;
import com.mindmatch.pagamento.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Controller para Autenticação")
public class AuthController {

    private final AuthService authService;

    @Operation(
            description = "Realiza o cadastro de um novo usuário",
            summary = "Registra um novo usuário no sistema SmartSector",
            responses = {
                    @ApiResponse(description = "Created", responseCode = "200"),
                    @ApiResponse(description = "Bad Request", responseCode = "400")
            }
    )
    @PostMapping("/registro")
    public ResponseEntity<AuthResponseDTO> registrar(@RequestBody RegistroDTO dto) {
        AuthResponseDTO response = authService.registrar(dto);
        return ResponseEntity.ok(response);
    }

    @Operation(
            description = "Realiza o login do usuário",
            summary = "Autentica usuário e retorna token JWT",
            responses = {
                    @ApiResponse(description = "Ok", responseCode = "200"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401")
            }
    )
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginDTO dto) {
        AuthResponseDTO response = authService.login(dto);
        return ResponseEntity.ok(response);
    }

    @Operation(
            description = "Realiza autenticação do usuário",
            summary = "Valida o token JWT do usuário",
            responses = {
                    @ApiResponse(description = "Ok", responseCode = "200"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401")
            }
    )
    @GetMapping("/validate")
    public ResponseEntity<String> validate(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authentication.getName());
    }
}
