import { UsuarioDto } from "./usuario/usuario.dto";


export interface PersonaDTO {
    nombre: string;
    correo: string;
    telefono: string;
    usuario: UsuarioDto
    
  }