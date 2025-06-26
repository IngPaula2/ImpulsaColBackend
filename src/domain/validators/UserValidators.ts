export class UserValidators {
    // Validación de email más robusta (debe tener formato correcto con @ y dominio válido)
    static isValidEmail(email: string): boolean {
        // Regex más robusta para validación de email
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!emailRegex.test(email)) {
            return false;
        }

        // Validaciones adicionales de dominio
        const [userPart, domainPart] = email.split('@');
        
        // Validar parte del usuario
        if (!userPart || userPart.length === 0 || userPart.length > 64) {
            return false;
        }

        // Validar dominio
        if (!domainPart || domainPart.length === 0 || domainPart.length > 253) {
            return false;
        }

        // Validar extensión de dominio
        const validExtensions = ['.com', '.co', '.org', '.net', '.edu', '.gov', '.mil', '.info', '.biz'];
        const hasValidExtension = validExtensions.some(ext => 
            domainPart.toLowerCase().endsWith(ext)
        );

        if (!hasValidExtension) {
            return false;
        }

        // Validar caracteres especiales en dominio
        if (domainPart.startsWith('.') || domainPart.endsWith('.') || domainPart.includes('..')) {
            return false;
        }

        return true;
    }

    // Función para normalizar email (convertir a minúsculas y limpiar)
    static normalizeEmail(email: string): string {
        return email.toLowerCase().trim();
    }

    // Validación de contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número)
    static isValidPassword(password: string): boolean {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return passwordRegex.test(password);
    }

    // Función para normalizar nombre (capitalizar y limpiar espacios)
    static normalizeFullName(fullName: string): string {
        return fullName
            .trim()
            .replace(/\s+/g, ' ') // Reemplazar múltiples espacios con uno solo
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    // Normaliza un nombre individual (primera letra mayúscula, resto minúscula)
    static normalizeNamePart(name: string): string {
        return name
            .trim()
            .replace(/\s+/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    // Valida un nombre individual (no permite números, mínimo 2 caracteres, solo letras, guiones y apóstrofes)
    static isValidNamePart(name: string): boolean {
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ'-]{2,}$/;
        const normalized = this.normalizeNamePart(name);
        return nameRegex.test(normalized);
    }

    // Validación de tipo de documento (CC, CE, TI, PP)
    static isValidDocumentType(documentType: string): boolean {
        const validTypes = ['CC', 'CE', 'TI', 'PP'];
        return validTypes.includes(documentType);
    }

    // Validación de número de documento (solo números, entre 6 y 12 dígitos)
    static isValidDocumentNumber(documentNumber: string): boolean {
        const documentRegex = /^\d{6,12}$/;
        return documentRegex.test(documentNumber);
    }

    // Validación de teléfono (formato colombiano, 10 dígitos)
    static isValidPhone(phone: string): boolean {
        const phoneRegex = /^3\d{9}$/;
        return phoneRegex.test(phone);
    }

    // Validación de dirección (alfanumérico con espacios y #)
    static isValidAddress(address: string): boolean {
        const addressRegex = /^[a-zA-Z0-9\s#\-]{5,100}$/;
        return addressRegex.test(address);
    }

    // Validación de ciudad y departamento (solo letras y espacios)
    static isValidCityOrDepartment(name: string): boolean {
        const cityRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
        return cityRegex.test(name);
    }

    // Validación de fecha de nacimiento (debe ser mayor de 18 años)
    static isValidBirthDate(birthDate: Date): boolean {
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 >= 18;
        }
        
        return age >= 18;
    }

    // Método para validar todos los campos de una vez
    static validateUserData(userData: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validaciones requeridas
        if (!userData.email || !this.isValidEmail(userData.email)) {
            errors.push('El email no es válido');
        }

        if (!userData.password || !this.isValidPassword(userData.password)) {
            errors.push('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
        }

        // Validaciones opcionales (solo si el campo está presente)
        if (userData.firstName && !this.isValidNamePart(userData.firstName)) {
            errors.push('El nombre solo debe contener letras, guiones o apóstrofes y tener al menos 2 caracteres');
        }
        if (userData.lastName && !this.isValidNamePart(userData.lastName)) {
            errors.push('El apellido solo debe contener letras, guiones o apóstrofes y tener al menos 2 caracteres');
        }

        if (userData.document_type && !this.isValidDocumentType(userData.document_type)) {
            errors.push('El tipo de documento debe ser CC, CE, TI o PP');
        }

        if (userData.document_number && !this.isValidDocumentNumber(userData.document_number)) {
            errors.push('El número de documento debe tener entre 6 y 12 dígitos');
        }

        if (userData.phone && !this.isValidPhone(userData.phone)) {
            errors.push('El teléfono debe ser un número válido de 10 dígitos comenzando con 3');
        }

        if (userData.address && !this.isValidAddress(userData.address)) {
            errors.push('La dirección debe contener caracteres válidos');
        }

        if (userData.city && !this.isValidCityOrDepartment(userData.city)) {
            errors.push('La ciudad debe contener solo letras y espacios');
        }

        if (userData.department && !this.isValidCityOrDepartment(userData.department)) {
            errors.push('El departamento debe contener solo letras y espacios');
        }

        if (userData.birth_date && !this.isValidBirthDate(new Date(userData.birth_date))) {
            errors.push('Debe ser mayor de 18 años');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validatePartialUserData(userData: Partial<any>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Solo validamos los campos que están presentes en la actualización
        if (userData.email !== undefined && !this.isValidEmail(userData.email)) {
            errors.push('El email no es válido');
        }

        if (userData.firstName !== undefined && !this.isValidNamePart(userData.firstName)) {
            errors.push('El nombre solo debe contener letras, guiones o apóstrofes y tener al menos 2 caracteres');
        }
        if (userData.lastName !== undefined && !this.isValidNamePart(userData.lastName)) {
            errors.push('El apellido solo debe contener letras, guiones o apóstrofes y tener al menos 2 caracteres');
        }

        if (userData.document_type !== undefined && !this.isValidDocumentType(userData.document_type)) {
            errors.push('El tipo de documento debe ser CC, CE, TI o PP');
        }

        if (userData.document_number !== undefined && !this.isValidDocumentNumber(userData.document_number)) {
            errors.push('El número de documento debe tener entre 6 y 12 dígitos');
        }

        if (userData.phone !== undefined && !this.isValidPhone(userData.phone)) {
            errors.push('El teléfono debe ser un número válido de 10 dígitos comenzando con 3');
        }

        if (userData.address !== undefined && !this.isValidAddress(userData.address)) {
            errors.push('La dirección debe contener caracteres válidos');
        }

        if (userData.city !== undefined && !this.isValidCityOrDepartment(userData.city)) {
            errors.push('La ciudad debe contener solo letras y espacios');
        }

        if (userData.department !== undefined && !this.isValidCityOrDepartment(userData.department)) {
            errors.push('El departamento debe contener solo letras y espacios');
        }

        if (userData.birth_date !== undefined && !this.isValidBirthDate(new Date(userData.birth_date))) {
            errors.push('Debe ser mayor de 18 años');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
} 